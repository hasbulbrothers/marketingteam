import { queryGeneric as query } from "convex/server";
import { findCurrentUser } from "../lib/auth";

export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await findCurrentUser(ctx);
    if (!user || !user.isActive) {
      return [];
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user!._id))
      .order("desc")
      .take(50);

    const withSenders = [];
    for (const n of notifications) {
      const sender = n.senderId ? await ctx.db.get(n.senderId as never) : null;
      withSenders.push({
        ...n,
        senderName: sender ? (sender as { name: string }).name : "System",
      });
    }
    return withSenders;
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await findCurrentUser(ctx);
    if (!user || !user.isActive) {
      return 0;
    }
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user!._id))
      .collect();
    return all.filter((n) => !n.isRead).length;
  },
});
