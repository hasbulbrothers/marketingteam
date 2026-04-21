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

    const uniqueUserIds = [...new Set(comments.map((c) => c.userId))];
    const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(
      users.filter(Boolean).map((u) => [String(u!._id), u]),
    );

    return comments.map((comment) => {
      const user = userMap.get(String(comment.userId));
      return {
        id: String(comment._id),
        taskId: String(comment.taskId),
        author: user?.name ?? "Unknown user",
        role: user?.jobTitle ?? user?.role ?? "Team Member",
        message: comment.message,
        createdAt: new Date(comment.createdAt).toISOString(),
      };
    });
  },
});
