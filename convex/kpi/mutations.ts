import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireCurrentUser } from "../lib/auth";
import { requireAdmin } from "../lib/permissions";
import {
  kpiMetricValidator,
  kpiPeriodValidator,
  kpiScopeValidator,
  platformValidator,
} from "../lib/validators";

function validateDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    throw new Error("Start and end dates are required.");
  }
  if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new Error("End date must be on or after start date.");
  }
}

export const createKpiTarget = mutation({
  args: {
    scope: kpiScopeValidator,
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")),
    metric: kpiMetricValidator,
    target: v.number(),
    period: kpiPeriodValidator,
    startDate: v.string(),
    endDate: v.string(),
    platform: v.optional(platformValidator),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    validateDateRange(args.startDate, args.endDate);

    if (args.scope === "team" && !args.teamId) {
      throw new Error("teamId is required for team-scope KPI.");
    }
    if (args.scope === "user" && !args.userId) {
      throw new Error("userId is required for user-scope KPI.");
    }
    if (args.target <= 0) {
      throw new Error("Target must be greater than zero.");
    }

    const now = Date.now();
    return ctx.db.insert("kpiTargets", {
      scope: args.scope,
      teamId: args.scope === "team" ? args.teamId : undefined,
      userId: args.scope === "user" ? args.userId : undefined,
      metric: args.metric,
      target: args.target,
      period: args.period,
      startDate: args.startDate,
      endDate: args.endDate,
      platform: args.platform,
      label: args.label?.trim() || undefined,
      isActive: true,
      createdBy: actor._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateKpiTarget = mutation({
  args: {
    kpiId: v.id("kpiTargets"),
    target: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    platform: v.optional(platformValidator),
    label: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const kpi = await ctx.db.get(args.kpiId);
    if (!kpi) throw new Error("KPI target not found.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.target !== undefined) {
      if (args.target <= 0) throw new Error("Target must be greater than zero.");
      patch.target = args.target;
    }

    const nextStart = args.startDate ?? kpi.startDate;
    const nextEnd = args.endDate ?? kpi.endDate;
    if (args.startDate !== undefined || args.endDate !== undefined) {
      validateDateRange(nextStart, nextEnd);
      patch.startDate = nextStart;
      patch.endDate = nextEnd;
    }

    if (args.platform !== undefined) patch.platform = args.platform;
    if (args.label !== undefined)
      patch.label = args.label.trim() || undefined;
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.kpiId, patch);
  },
});

export const deleteKpiTarget = mutation({
  args: { kpiId: v.id("kpiTargets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.kpiId);
  },
});
