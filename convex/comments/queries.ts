import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";

export const getCommentsByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task_created_at", (q) => q.eq("taskId", args.taskId))
      .collect();

    return Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          id: String(comment._id),
          taskId: String(comment.taskId),
          author: user?.name ?? "Unknown user",
          role: user?.jobTitle ?? user?.role ?? "Team Member",
          message: comment.message,
          createdAt: new Date(comment.createdAt).toISOString(),
        };
      }),
    );
  },
});
