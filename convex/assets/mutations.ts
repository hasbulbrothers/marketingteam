import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";

export const createAsset = mutation({
  args: {
    taskId: v.id("tasks"),
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task || task.isArchived) {
      throw new Error("Task not found.");
    }

    if (!args.fileName.trim() || !args.fileUrl.trim() || !args.fileType.trim()) {
      throw new Error("Asset metadata is incomplete.");
    }

    return ctx.db.insert("assets", {
      ...args,
      uploadedBy: currentUser._id,
      createdAt: Date.now(),
    });
  },
});
