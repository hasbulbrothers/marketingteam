import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "../lib/permissions";

export const getActivityLogs = query({
  args: {
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 50, 100);

    let logsQuery = ctx.db
      .query("activityLogs")
      .withIndex("by_created_at")
      .order("desc");

    const allLogs = await logsQuery.take(limit * 3);

    const filtered = args.entityType
      ? allLogs.filter((log) => log.entityType === args.entityType)
      : allLogs;

    const logs = filtered.slice(0, limit);

    const hydrated = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        let parsedChanges = null;
        if (log.changes) {
          try {
            parsedChanges = JSON.parse(log.changes as string);
          } catch {
            parsedChanges = null;
          }
        }
        return {
          _id: log._id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          entityName: log.entityName,
          changes: parsedChanges,
          createdAt: log.createdAt,
          user: user
            ? { name: user.name, avatarUrl: user.avatarUrl }
            : { name: "Unknown", avatarUrl: null },
        };
      }),
    );

    return hydrated;
  },
});
