import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { logActivity, diffFields } from "../lib/activityLogger";
import { requireAdmin } from "../lib/permissions";

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    leaderId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const name = args.name.trim();
    if (!name) throw new Error("Team name is required.");

    const slug = toSlug(name);
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error(`Team with slug "${slug}" already exists.`);

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name,
      slug,
      description: args.description,
      color: args.color,
      leaderId: args.leaderId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity(ctx, {
      userId: admin._id,
      action: "team.created",
      entityType: "team",
      entityId: String(teamId),
      entityName: name,
    });

    return teamId;
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    leaderId: v.optional(v.id("users")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Team name is required.");
      const slug = toSlug(name);
      if (slug !== team.slug) {
        const clash = await ctx.db
          .query("teams")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();
        if (clash) throw new Error(`Team with slug "${slug}" already exists.`);
        patch.slug = slug;
      }
      patch.name = name;
    }
    if (args.description !== undefined) patch.description = args.description;
    if (args.color !== undefined) patch.color = args.color;
    if (args.leaderId !== undefined) patch.leaderId = args.leaderId;
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    const changes = diffFields(team as Record<string, unknown>, patch, [
      "name", "description", "color", "leaderId", "isActive",
    ]);
    await ctx.db.patch(args.teamId, patch);

    if (changes.length > 0) {
      await logActivity(ctx, {
        userId: admin._id,
        action: "team.updated",
        entityType: "team",
        entityId: String(args.teamId),
        entityName: (patch.name as string) ?? (team.name as string),
        changes,
      });
    }
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found.");

    const members = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const member of members) {
      await ctx.db.patch(member._id, {
        teamId: undefined,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.teamId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      userId: admin._id,
      action: "team.deleted",
      entityType: "team",
      entityId: String(args.teamId),
      entityName: team.name as string,
    });
  },
});

export const assignUserToTeam = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.union(v.id("teams"), v.null()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const oldTeamId = user.teamId ? String(user.teamId) : null;

    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team || !team.isActive) throw new Error("Team not found or inactive.");
    }

    await ctx.db.patch(args.userId, {
      teamId: args.teamId ?? undefined,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      userId: admin._id,
      action: "team.member_changed",
      entityType: "user",
      entityId: String(args.userId),
      entityName: user.name as string,
      changes: [{ field: "teamId", before: oldTeamId, after: args.teamId ? String(args.teamId) : null }],
    });
  },
});
