import { OliverError, handleError } from "@olivr-nxt/common";
import { fetchOrSet, rKey, set } from "~/client/database";
import { addFeedback, deleteFeedback, getFeedback, updateFeedback, verifyFeedback } from "~/services/feedback";
import { createFactory } from "~/utils/api";

const feedbackRoutes = createFactory();

feedbackRoutes.get("/", async (c) => {
  try {
    const props = c.req.query();
    const page = parseInt(props.page) || 0;
    const limit = parseInt(props.limit) || 20;
    
    const redisKey = rKey("feedback", page, limit);
    let feedback = await fetchOrSet(redisKey, () => getFeedback({ page, limit }), 240);
    if (feedback.length !== limit) {
      feedback = await getFeedback({ page, limit });
      await set(redisKey, feedback, 240);
    }

    return c.json(feedback);
  } catch (err) {
    const error = handleError(err);
    return c.json({ error: error.message }, { status: error.status });
  }
});

feedbackRoutes.post("/", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user.id) throw new OliverError("You must be logged in to perform this action.", 401);
    const props = await c.req.json();
    const feedback = await addFeedback({ ...props, userId: session.user.id });
    return c.json(feedback);
  } catch (err) {
    const error = handleError(err);
    return c.json({ error: error.message }, { status: error.status });
  }
});

feedbackRoutes.put("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user.role || !["ADMIN", "OWNER"].includes(session?.user.role)) throw new OliverError("You do not have permission to perform this action.", 403);
    const props = await c.req.json();
    const feedback = await updateFeedback({ id: c.req.param("id"), ...props });
    return c.json(feedback);
  } catch (err) {
    const error = handleError(err);
    return c.json({ error: error.message }, { status: error.status });
  }
});

feedbackRoutes.delete("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user.role || !["ADMIN", "OWNER"].includes(session?.user.role)) throw new OliverError("You do not have permission to perform this action.", 403);
    const feedback = await deleteFeedback(c.req.param("id"));
    return c.json(feedback);
  } catch (err) {
    const error = handleError(err);
    return c.json({ error: error.message }, { status: error.status });
  }
});

feedbackRoutes.put("/:id/verify", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user.role || !["ADMIN", "OWNER"].includes(session?.user.role)) throw new OliverError("You do not have permission to perform this action.", 403);
    const feedback = await verifyFeedback({ id: c.req.param("id"), verified: true });
    return c.json(feedback);
  } catch (err) {
    const error = handleError(err);
    return c.json({ error: error.message }, { status: error.status });
  }
});

export default feedbackRoutes;