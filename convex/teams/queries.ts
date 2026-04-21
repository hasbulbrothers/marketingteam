import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";

export const listTeams = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    const teams = args.includeInactive
      ? await ctx.db.query("teams").collect()
      : await ctx.db
          .query("teams")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .collect();

    const allUsers = await ctx.db.query("users").collect();

    return teams
      .map((team) => {
        const members = allUsers.filter(
          (u) => u.teamId === team._id && u.isActive,
        );
        const leader = team.leaderId
          ? allUsers.find((u) => u._id === team.leaderId)
          : undefined;

        return {
          id: String(team._id),
          name: team.name,
          slug: team.slug,
          description: team.description,
          color: team.color,
          isActive: team.isActive,
          memberCount: members.length,
          leader: leader
            ? { id: String(leader._id), name: leader.name }
            : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const members = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    const leader = team.leaderId ? await ctx.db.get(team.leaderId) : null;

    return {
      id: String(team._id),
      name: team.name,
      slug: team.slug,
      description: team.description,
      color: team.color,
      isActive: team.isActive,
      leader: leader
        ? {
            id: String(leader._id),
            name: leader.name,
            jobTitle: leader.jobTitle,
          }
        : null,
      members: members
        .filter((m) => m.isActive)
        .map((m) => ({
          id: String(m._id),
          name: m.name,
          role: m.role,
          jobTitle: m.jobTitle,
          avatarUrl: m.avatarUrl,
        })),
    };
  },
});
