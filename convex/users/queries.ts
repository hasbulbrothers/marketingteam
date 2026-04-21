import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated, requireCurrentUser } from "../lib/auth";
import { roleValidator } from "../lib/validators";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuthenticated(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      jobTitle: user.jobTitle,
    };
  },
});

export const getUsers = query({
  args: { role: v.optional(roleValidator) },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const users = args.role
      ? await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role)).collect()
      : await ctx.db.query("users").collect();

    const isAdmin = currentUser.role === "admin";
    return users
      .filter((user) => user.isActive)
      .map((user) => ({
        _id: user._id,
        name: user.name,
        role: user.role,
        jobTitle: user.jobTitle,
        department: user.department,
        avatarUrl: user.avatarUrl,
        teamId: user.teamId,
        ...(isAdmin ? { email: user.email } : {}),
      }));
  },
});
