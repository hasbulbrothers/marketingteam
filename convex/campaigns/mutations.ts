import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { logActivity } from "../lib/activityLogger";
import { isIsoDate } from "../lib/dates";
import { requireCurrentUser } from "../lib/auth";
import { requireAdmin } from "../lib/permissions";
import { campaignStatusValidator, platformValidator } from "../lib/validators";

export const createCampaign = mutation({
  args: {
    name: v.string(),
    objective: v.string(),
    description: v.optional(v.string()),
    status: campaignStatusValidator,
    ownerId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    budget: v.number(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAdmin(ctx);

    const name = args.name.trim();
    const objective = args.objective.trim();
    if (name.length < 3) throw new Error("Campaign name must be at least 3 characters.");
    if (!objective) throw new Error("Campaign objective is required.");
    if (!isIsoDate(args.startDate) || !isIsoDate(args.endDate)) {
      throw new Error("Campaign dates must be valid ISO date strings.");
    }
    if (args.endDate < args.startDate) {
      throw new Error("End date must be on or after start date.");
    }
    if (args.budget < 0) throw new Error("Budget must be zero or greater.");

    const owner = await ctx.db.get(args.ownerId);
    if (!owner || !owner.isActive) throw new Error("Campaign owner not found.");

    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team || !team.isActive) throw new Error("Selected team not found or inactive.");
    }

    const now = Date.now();
    const campaignId = await ctx.db.insert("campaigns", {
      name,
      objective,
      description: args.description?.trim() || undefined,
      status: args.status,
      ownerId: args.ownerId,
      teamId: args.teamId,
      budget: args.budget,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdBy: currentUser._id,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity(ctx, {
      userId: currentUser._id,
      action: "campaign.created",
      entityType: "campaign",
      entityId: String(campaignId),
      entityName: name,
    });

    return campaignId;
  },
});

export const createCampaignMetric = mutation({
  args: {
    campaignId: v.id("campaigns"),
    date: v.string(),
    channel: platformValidator,
    spend: v.number(),
    reach: v.number(),
    clicks: v.number(),
    leads: v.number(),
    participants: v.number(),
    conversions: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || !campaign.isActive) throw new Error("Campaign not found.");
    if (!isIsoDate(args.date)) throw new Error("Metric date must be a valid ISO date string.");

    const numericFields = [
      args.spend,
      args.reach,
      args.clicks,
      args.leads,
      args.participants,
      args.conversions,
    ];

    if (numericFields.some((value) => value < 0)) {
      throw new Error("Metric values must be zero or greater.");
    }

    const now = Date.now();
    return ctx.db.insert("campaignMetrics", {
      campaignId: args.campaignId,
      date: args.date,
      channel: args.channel,
      spend: args.spend,
      reach: args.reach,
      clicks: args.clicks,
      leads: args.leads,
      participants: args.participants,
      conversions: args.conversions,
      createdBy: currentUser._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});
