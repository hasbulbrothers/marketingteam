import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";
import { requireAdmin } from "../lib/permissions";
import { roleValidator } from "../lib/validators";

function resolveDefaultRole(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email) ? "admin" : "team_member";
}

function resolvePersistedRole(email: string, currentRole?: string) {
  if (currentRole === "admin" || currentRole === "manager") {
    return currentRole;
  }

  return resolveDefaultRole(email);
}

export const upsertUserFromClerk = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    department: v.string(),
    jobTitle: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuthenticated(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const payload = {
      clerkId: identity.subject,
      ...args,
      email: args.email.trim().toLowerCase(),
      isActive: true,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...payload,
        role: resolvePersistedRole(payload.email, existing.role),
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      ...payload,
      role: resolveDefaultRole(payload.email),
      createdAt: Date.now(),
    });
  },
});

export const updateUserRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role, updatedAt: Date.now() });
  },
});

export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isActive: false, updatedAt: Date.now() });
  },
});
