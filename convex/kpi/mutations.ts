import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "../lib/permissions";
import { isIsoDate } from "../lib/dates";
import {
  kpiMetricValidator,
  kpiPeriodValidator,
  kpiScopeValidator,
  platformValidator,
} from "../lib/validators";

function validateDateRange(startDate: string, endDate: string) {
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    throw new Error("Tarikh tidak sah. Sila pilih tarikh yang betul.");
  }
  if (endDate < startDate) {
    throw new Error("Tarikh tamat mestilah selepas tarikh mula.");
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
      throw new Error("Sila pilih team untuk KPI jenis team.");
    }
    if (args.scope === "user" && !args.userId) {
      throw new Error("Sila pilih user untuk KPI jenis individu.");
    }
    if (args.target <= 0) {
      throw new Error("Target mestilah lebih daripada sifar.");
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
    if (!kpi) throw new Error("KPI target tidak dijumpai.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.target !== undefined) {
      if (args.target <= 0) throw new Error("Target mestilah lebih daripada sifar.");
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
    const kpi = await ctx.db.get(args.kpiId);
    if (!kpi) throw new Error("KPI target tidak dijumpai.");
    await ctx.db.delete(args.kpiId);
  },
});
