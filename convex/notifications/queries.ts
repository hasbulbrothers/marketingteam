import { queryGeneric as query } from "convex/server";
import { requireCurrentUser } from "../lib/auth";

export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q: any) => q.eq("recipientId", user._id))
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
    const user = await requireCurrentUser(ctx);
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q: any) => q.eq("recipientId", user._id))
      .collect();
    return all.filter((n) => !n.isRead).length;
  },
});
