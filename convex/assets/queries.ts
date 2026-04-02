import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";

export const getAssetsByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);
    return ctx.db.query("assets").withIndex("by_task", (q) => q.eq("taskId", args.taskId)).collect();
  },
});
