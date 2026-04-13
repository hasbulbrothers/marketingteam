import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";
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
    await requireAuthenticated(ctx);
    const users = args.role
      ? await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role)).collect()
      : await ctx.db.query("users").collect();

    return users.filter((user) => user.isActive);
  },
});
