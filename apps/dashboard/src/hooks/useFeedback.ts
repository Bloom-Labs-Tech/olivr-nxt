import { feedbackWithUserSchema } from "@olivr-nxt/common/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "~/env";

export type Feedback = z.infer<typeof feedbackWithUserSchema>;

const fetchFeedback = async (): Promise<Feedback[]> => {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/feedback`, {
    credentials: "include",
    referrerPolicy: "no-referrer",
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Failed to fetch guilds");
  }
  return data;
}

function useFeedback() {
  return useQuery<Feedback[]>({
    queryKey: ["feedback"],
    queryFn: fetchFeedback,
    initialData: []
  });
}

export { fetchFeedback, useFeedback };

