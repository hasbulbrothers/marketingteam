import { mutationGeneric as mutation, internalMutationGeneric as internalMutation } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";
import { notify } from "../lib/notifications";
import { requireAdmin } from "../lib/permissions";
import { roleValidator } from "../lib/validators";

const ADMIN_EMAIL = "azribrahim.work@gmail.com";

function resolveRole(email: string, currentRole?: string) {
  if (email.toLowerCase() === ADMIN_EMAIL) return "admin" as const;
  if (currentRole === "admin") return "admin" as const;
  return "team" as const;
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

    const email = args.email.trim().toLowerCase();
    const payload = {
      clerkId: identity.subject,
      ...args,
      email,
      isActive: true,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...payload,
        role: resolveRole(email, existing.role),
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      ...payload,
      role: resolveRole(email),
      createdAt: Date.now(),
    });
  },
});

export const updateUserRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role, updatedAt: Date.now() });

    await notify(ctx, {
      recipientId: args.userId as unknown,
      senderId: admin._id as unknown,
      type: "role_changed",
      title: "Role updated",
      message: `Your role has been changed to ${args.role}`,
    });
  },
});

export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isActive: false, updatedAt: Date.now() });
  },
});

export const upsertUserFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const payload = {
      clerkId: args.clerkId,
      name: args.name,
      email,
      avatarUrl: args.avatarUrl,
      department: "Marketing",
      jobTitle: "Team Member",
      isActive: true,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...payload, role: resolveRole(email, existing.role) });
      return existing._id;
    }

    return ctx.db.insert("users", { ...payload, role: resolveRole(email), createdAt: Date.now() });
  },
});

export const deactivateUserFromWebhook = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!existing) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
