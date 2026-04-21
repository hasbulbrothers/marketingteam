import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { findCurrentUser } from "../lib/auth";

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await findCurrentUser(ctx);
    if (!user || !user.isActive) return;
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || String(notification.recipientId) !== String(user._id)) return;
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await findCurrentUser(ctx);
    if (!user || !user.isActive) return;
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user!._id))
      .collect();
    const unread = all.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});
