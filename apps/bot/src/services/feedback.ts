import { generateId } from "@olivr-nxt/common";
import { addFeedbackSchema, deleteFeedbackSchema, getFeedbackSchema, updateFeedbackSchema, verifyFeedbackSchema } from "@olivr-nxt/common/schemas";
import type { Feedback } from "@olivr-nxt/database";
import { z } from "zod";
import { client } from "~/client";
import { fetchUser } from "./cache";

export async function addFeedback({ content, userId }: z.infer<typeof addFeedbackSchema>): Promise<Feedback> {
  if (!content) throw new Error("Feedback content is required");
  if (!userId) throw new Error("User ID is required");

  return client.db.feedback.create({
    data: {
      id: generateId('fbck'),
      content,
      userId,
    }
  });
}

type GetFeedbackResponse = Feedback & {
  user: {
    id: string;
    username: string;
    avatar: string;
  }
};

export async function getFeedback(props: z.infer<typeof getFeedbackSchema>): Promise<GetFeedbackResponse[]> {
  const parsedProps = getFeedbackSchema.safeParse(props);
  if (!parsedProps.success) throw new Error(parsedProps.error.errors[0].message);
  const { limit, page } = parsedProps.data;

  const skip = page * limit;
  const feedback = await client.db.feedback.findMany({
    where: {
      verified: true
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc",
    },
  });

  const result: GetFeedbackResponse[] = [];
  for (const fb of feedback) {
    const user = await fetchUser(fb.userId);
    if (!user) {
      result.push({
        ...fb,
        user: {
          id: fb.userId,
          username: "Unknown",
          avatar: "",
        }
      });
    } else {
      result.push({
        ...fb,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.displayAvatarURL(),
        }
      });
    }
  }

  return result;
}

export async function updateFeedback(props: z.infer<typeof updateFeedbackSchema>): Promise<Feedback> {
  const parsedProps = updateFeedbackSchema.safeParse(props);
  if (!parsedProps.success) throw new Error(parsedProps.error.errors[0].message);
  const { id, content } = parsedProps.data;

  return client.db.feedback.update({
    where: {
      id,
    },
    data: {
      content,
    },
  });
}

export async function verifyFeedback(props: z.infer<typeof verifyFeedbackSchema>): Promise<Feedback> {
  const parsedProps = verifyFeedbackSchema.safeParse(props);
  if (!parsedProps.success) throw new Error(parsedProps.error.errors[0].message);
  const { id, verified } = parsedProps.data;

  return client.db.feedback.update({
    where: {
      id,
    },
    data: {
      verified,
    },
  });
}

export async function deleteFeedback(id: z.infer<typeof deleteFeedbackSchema>): Promise<boolean> {
  const parsedId = deleteFeedbackSchema.safeParse(id);
  if (!parsedId.success) throw new Error(parsedId.error.errors[0].message);
  
  return client.db.feedback.delete({
    where: {
      id,
    },
  }).then(() => true).catch(() => false);
}