import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { notify } from "../lib/notifications";
import { enforceRateLimit } from "../lib/rateLimit";

export const addComment = mutation({
  args: { taskId: v.id("tasks"), message: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    await enforceRateLimit(ctx, String(currentUser._id), "addComment", 30, 60_000);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.isArchived) {
      throw new Error("Task tidak dijumpai.");
    }

    const message = args.message.trim();
    if (!message || message.length > 2000) {
      throw new Error("Komen mestilah antara 1 hingga 2000 aksara.");
    }

    const commentId = await ctx.db.insert("comments", {
      taskId: args.taskId,
      userId: currentUser._id,
      message,
      createdAt: Date.now(),
    });

    const recipients = new Set<string>();
    if (task.assigneeId) recipients.add(String(task.assigneeId));
    if (task.createdBy) recipients.add(String(task.createdBy));
    recipients.delete(String(currentUser._id));

    for (const recipientId of recipients) {
      await notify(ctx, {
        recipientId: recipientId as unknown,
        senderId: currentUser._id as unknown,
        type: "task_commented",
        title: "New comment",
        message: `${currentUser.name} commented on "${task.title}"`,
        taskId: args.taskId as unknown,
      });
    }

    return commentId;
  },
});
