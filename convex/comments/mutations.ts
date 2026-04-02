import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";

export const addComment = mutation({
  args: { taskId: v.id("tasks"), message: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.isArchived) {
      throw new Error("Task not found.");
    }

    const message = args.message.trim();
    if (!message || message.length > 2000) {
      throw new Error("Comment must be between 1 and 2000 characters.");
    }

    return ctx.db.insert("comments", {
      taskId: args.taskId,
      userId: currentUser._id,
      message,
      createdAt: Date.now(),
    });
  },
});
