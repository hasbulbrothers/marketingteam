import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";
import { logActivity } from "../lib/activityLogger";
import { isIsoDate } from "../lib/dates";
import { requireCurrentUser } from "../lib/auth";
import { requireAdmin } from "../lib/permissions";
import { enforceRateLimit } from "../lib/rateLimit";
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
    await enforceRateLimit(ctx, String(currentUser._id), "createCampaign", 10, 60_000);

    const name = args.name.trim();
    const objective = args.objective.trim();
    if (name.length < 3 || name.length > 200) throw new Error("Nama campaign mestilah antara 3 hingga 200 aksara.");
    if (!objective || objective.length > 500) throw new Error("Objektif campaign mestilah antara 1 hingga 500 aksara.");
    if (!isIsoDate(args.startDate) || !isIsoDate(args.endDate)) {
      throw new Error("Tarikh campaign tidak sah. Sila pilih tarikh yang betul.");
    }
    if (args.endDate < args.startDate) {
      throw new Error("Tarikh tamat mestilah selepas tarikh mula.");
    }
    if (args.budget < 0) throw new Error("Bajet mestilah sifar atau lebih.");

    const owner = await ctx.db.get(args.ownerId);
    if (!owner || !owner.isActive) throw new Error("Pemilik campaign tidak dijumpai.");

    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team || !team.isActive) throw new Error("Team yang dipilih tidak dijumpai atau tidak aktif.");
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
    await enforceRateLimit(ctx, String(currentUser._id), "createMetric", 30, 60_000);

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || !campaign.isActive) throw new Error("Campaign tidak dijumpai.");

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(campaign.ownerId) === String(currentUser._id);
    const isTeamMember = campaign.teamId && String(currentUser.teamId ?? "") === String(campaign.teamId);
    if (!isAdmin && !isOwner && !isTeamMember) {
      throw new Error("Anda tiada akses untuk menambah metrik pada campaign ini.");
    }

    if (!isIsoDate(args.date)) throw new Error("Tarikh metrik tidak sah. Sila pilih tarikh yang betul.");

    const numericFields = [
      args.spend,
      args.reach,
      args.clicks,
      args.leads,
      args.participants,
      args.conversions,
    ];

    if (numericFields.some((value) => value < 0)) {
      throw new Error("Nilai metrik mestilah sifar atau lebih.");
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
