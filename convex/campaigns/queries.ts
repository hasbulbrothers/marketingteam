import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-MY").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function costPer(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticated(ctx);

    const campaigns = await ctx.db.query("campaigns").collect();
    const users = await ctx.db.query("users").collect();
    const teams = await ctx.db.query("teams").collect();

    return campaigns
      .filter((campaign) => campaign.isActive)
      .map((campaign) => {
        const owner = users.find((user) => user._id === campaign.ownerId);
        const team = campaign.teamId
          ? teams.find((item) => item._id === campaign.teamId)
          : undefined;

        return {
          id: String(campaign._id),
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          budget: campaign.budget,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          owner: owner
            ? { id: String(owner._id), name: owner.name, role: owner.jobTitle }
            : null,
          team: team ? { id: String(team._id), name: team.name } : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getAnalyticsOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticated(ctx);

    const campaigns = (await ctx.db.query("campaigns").collect()).filter(
      (campaign) => campaign.isActive,
    );
    const metrics = await ctx.db.query("campaignMetrics").collect();
    const users = (await ctx.db.query("users").collect()).filter((user) => user.isActive);
    const teams = (await ctx.db.query("teams").collect()).filter((team) => team.isActive);

    const metricsByCampaign = new Map<string, typeof metrics>();
    for (const metric of metrics) {
      const key = String(metric.campaignId);
      const current = metricsByCampaign.get(key) ?? [];
      current.push(metric);
      metricsByCampaign.set(key, current);
    }

    const campaignRows = campaigns.map((campaign) => {
      const owner = users.find((user) => user._id === campaign.ownerId);
      const team = campaign.teamId
        ? teams.find((item) => item._id === campaign.teamId)
        : undefined;
      const campaignMetrics = metricsByCampaign.get(String(campaign._id)) ?? [];

      const spent = campaignMetrics.reduce((sum, metric) => sum + metric.spend, 0);
      const reach = campaignMetrics.reduce((sum, metric) => sum + metric.reach, 0);
      const clicks = campaignMetrics.reduce((sum, metric) => sum + metric.clicks, 0);
      const leads = campaignMetrics.reduce((sum, metric) => sum + metric.leads, 0);
      const participants = campaignMetrics.reduce((sum, metric) => sum + metric.participants, 0);
      const conversions = campaignMetrics.reduce((sum, metric) => sum + metric.conversions, 0);

      return {
        id: String(campaign._id),
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status,
        owner: owner?.name ?? "Unassigned",
        ownerRole: owner?.jobTitle ?? "Campaign owner",
        team: team?.name ?? "No team",
        budgetValue: campaign.budget,
        spentValue: spent,
        reachValue: reach,
        clicksValue: clicks,
        leadsValue: leads,
        participantsValue: participants,
        conversionsValue: conversions,
        cppValue: costPer(spent, participants),
      };
    });

    const totalSpend = campaignRows.reduce((sum, row) => sum + row.spentValue, 0);
    const totalParticipants = campaignRows.reduce((sum, row) => sum + row.participantsValue, 0);
    const totalLeads = campaignRows.reduce((sum, row) => sum + row.leadsValue, 0);
    const totalReach = campaignRows.reduce((sum, row) => sum + row.reachValue, 0);
    const totalClicks = campaignRows.reduce((sum, row) => sum + row.clicksValue, 0);

    const sortedByParticipants = [...campaignRows].sort(
      (a, b) => b.participantsValue - a.participantsValue,
    );
    const spotlight = sortedByParticipants[0] ?? null;

    const channelMap = new Map<
      string,
      { spend: number; participants: number; leads: number; conversions: number }
    >();
    for (const metric of metrics) {
      const entry = channelMap.get(metric.channel) ?? {
        spend: 0,
        participants: 0,
        leads: 0,
        conversions: 0,
      };
      entry.spend += metric.spend;
      entry.participants += metric.participants;
      entry.leads += metric.leads;
      entry.conversions += metric.conversions;
      channelMap.set(metric.channel, entry);
    }

    const channelStats = [...channelMap.entries()]
      .map(([channel, totals]) => ({
        channel,
        spendValue: totals.spend,
        participantsValue: totals.participants,
        cppValue: costPer(totals.spend, totals.participants),
        shareValue: totalSpend > 0 ? (totals.spend / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.spendValue - a.spendValue);

    const contributionMap = new Map<
      string,
      {
        person: string;
        role: string;
        campaigns: number;
        influenced: number;
        spend: number;
      }
    >();

    for (const row of campaignRows) {
      const current = contributionMap.get(row.owner) ?? {
        person: row.owner,
        role: row.ownerRole,
        campaigns: 0,
        influenced: 0,
        spend: 0,
      };
      current.campaigns += 1;
      current.influenced += row.participantsValue;
      current.spend += row.spentValue;
      contributionMap.set(row.owner, current);
    }

    return {
      summaryCards: [
        {
          label: "Total spend",
          value: formatCurrency(totalSpend),
          detail: `Across ${campaignRows.length} active campaigns currently tracked.`,
        },
        {
          label: "Participants",
          value: formatInteger(totalParticipants),
          detail: "Combined registrations, sign-ups, and event participants captured.",
        },
        {
          label: "Cost per participant",
          value: formatCurrency(costPer(totalSpend, totalParticipants)),
          detail: "Average acquisition cost blended across all tracked campaign channels.",
        },
        {
          label: "Lead to participant",
          value: formatPercent(
            totalLeads > 0 ? (totalParticipants / totalLeads) * 100 : 0,
          ),
          detail: "Conversion from total captured leads into real campaign participants.",
        },
      ],
      campaignRows: campaignRows
        .sort((a, b) => b.spentValue - a.spentValue)
        .map((row) => ({
          id: row.id,
          name: row.name,
          status: row.status,
          owner: row.owner,
          budget: formatCurrency(row.budgetValue),
          spent: formatCurrency(row.spentValue),
          participants: formatInteger(row.participantsValue),
          cpp: formatCurrency(row.cppValue),
        })),
      spotlight: spotlight
        ? {
            name: spotlight.name,
            budget: formatCurrency(spotlight.budgetValue),
            spent: formatCurrency(spotlight.spentValue),
            participants: formatInteger(spotlight.participantsValue),
            cpp: formatCurrency(spotlight.cppValue),
            budgetUtilization: spotlight.budgetValue > 0
              ? Math.min(100, Math.round((spotlight.spentValue / spotlight.budgetValue) * 100))
              : 0,
            insight:
              spotlight.spentValue > spotlight.budgetValue
                ? "This campaign is over budget and needs pacing or reallocation."
                : "Strong participant volume with room to optimise spend pacing and channel mix.",
          }
        : null,
      channelStats: channelStats.map((row) => ({
        channel: row.channel,
        spend: formatCurrency(row.spendValue),
        participants: formatInteger(row.participantsValue),
        cpp: formatCurrency(row.cppValue),
        share: `${Math.round(row.shareValue)}%`,
      })),
      funnelSteps: [
        { label: "Reach", value: formatInteger(totalReach), note: "Paid and owned campaign visibility captured in live metrics." },
        { label: "Clicks", value: formatInteger(totalClicks), note: "Landing page visits and direct campaign response intent." },
        { label: "Leads", value: formatInteger(totalLeads), note: "Qualified contact records or sign-up starts collected." },
        { label: "Participants", value: formatInteger(totalParticipants), note: "Final registrations, attendance, or verified participant outcomes." },
      ],
      insights: buildInsights(campaignRows, channelStats),
      contributionRows: [...contributionMap.values()]
        .sort((a, b) => b.influenced - a.influenced)
        .map((row) => ({
          person: row.person,
          role: row.role,
          tasks: "-",
          onTime: "-",
          campaigns: String(row.campaigns),
          influenced: formatInteger(row.influenced),
        })),
    };
  },
});

export const getCampaignDetail = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || !campaign.isActive) return null;

    const owner = await ctx.db.get(campaign.ownerId);
    const team = campaign.teamId ? await ctx.db.get(campaign.teamId) : null;
    const metrics = await ctx.db
      .query("campaignMetrics")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const allUsers = await ctx.db.query("users").collect();

    const totals = metrics.reduce(
      (acc, metric) => {
        acc.spend += metric.spend;
        acc.reach += metric.reach;
        acc.clicks += metric.clicks;
        acc.leads += metric.leads;
        acc.participants += metric.participants;
        acc.conversions += metric.conversions;
        return acc;
      },
      { spend: 0, reach: 0, clicks: 0, leads: 0, participants: 0, conversions: 0 },
    );

    const channelMap = new Map<string, { spend: number; leads: number; participants: number; conversions: number }>();
    for (const metric of metrics) {
      const entry = channelMap.get(metric.channel) ?? { spend: 0, leads: 0, participants: 0, conversions: 0 };
      entry.spend += metric.spend;
      entry.leads += metric.leads;
      entry.participants += metric.participants;
      entry.conversions += metric.conversions;
      channelMap.set(metric.channel, entry);
    }

    const taskRows = await Promise.all(
      tasks
        .filter((task) => !task.isArchived && task.status !== "archived")
        .map(async (task) => {
          const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
          return {
            id: String(task._id),
            title: task.title,
            status: task.status,
            dueDate: task.dueDate ?? null,
            assignee: assignee?.name ?? "Unassigned",
            platform: task.platform,
            priority: task.priority,
          };
        }),
    );

    const contributionMap = new Map<string, { person: string; role: string; tasks: number; completed: number }>();
    for (const task of tasks) {
      const assignee = task.assigneeId ? allUsers.find((user) => user._id === task.assigneeId) : null;
      const key = assignee?.name ?? "Unassigned";
      const current = contributionMap.get(key) ?? {
        person: key,
        role: assignee?.jobTitle ?? assignee?.role ?? "Team Member",
        tasks: 0,
        completed: 0,
      };
      current.tasks += 1;
      if (task.status === "published") current.completed += 1;
      contributionMap.set(key, current);
    }

    return {
      id: String(campaign._id),
      name: campaign.name,
      objective: campaign.objective,
      description: campaign.description ?? "",
      status: campaign.status,
      budget: formatCurrency(campaign.budget),
      budgetValue: campaign.budget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      owner: owner ? owner.name : "Unassigned",
      team: team?.name ?? "No team",
      totals: {
        spend: formatCurrency(totals.spend),
        participants: formatInteger(totals.participants),
        leads: formatInteger(totals.leads),
        conversions: formatInteger(totals.conversions),
        cpp: formatCurrency(costPer(totals.spend, totals.participants)),
        cpl: formatCurrency(costPer(totals.spend, totals.leads)),
        cpcv: formatCurrency(costPer(totals.spend, totals.conversions)),
        budgetUtilization: campaign.budget > 0 ? Math.round((totals.spend / campaign.budget) * 100) : 0,
      },
      funnelSteps: [
        { label: "Reach", value: formatInteger(totals.reach), note: "Total campaign exposure recorded in metric logs." },
        { label: "Clicks", value: formatInteger(totals.clicks), note: "Traffic or response actions generated by the campaign." },
        { label: "Leads", value: formatInteger(totals.leads), note: "Qualified prospects or sign-up records captured." },
        { label: "Participants", value: formatInteger(totals.participants), note: "Final participants attributed to this campaign." },
      ],
      channelStats: [...channelMap.entries()].map(([channel, totalsByChannel]) => ({
        channel,
        spend: formatCurrency(totalsByChannel.spend),
        leads: formatInteger(totalsByChannel.leads),
        participants: formatInteger(totalsByChannel.participants),
        conversions: formatInteger(totalsByChannel.conversions),
        cpp: formatCurrency(costPer(totalsByChannel.spend, totalsByChannel.participants)),
      })),
      taskRows,
      contributionRows: [...contributionMap.values()].map((row) => ({
        ...row,
        onTime: "-",
      })),
      metricCount: metrics.length,
    };
  },
});

function buildInsights(
  campaignRows: Array<{
    name: string;
    participantsValue: number;
    spentValue: number;
    cppValue: number;
  }>,
  channelStats: Array<{
    channel: string;
    spendValue: number;
    participantsValue: number;
    cppValue: number;
    shareValue: number;
  }>,
) {
  const bestCampaign = [...campaignRows].sort(
    (a, b) => b.participantsValue - a.participantsValue,
  )[0];
  const mostEfficientChannel = [...channelStats]
    .filter((row) => row.participantsValue > 0)
    .sort((a, b) => a.cppValue - b.cppValue)[0];
  const highestSpendChannel = [...channelStats].sort(
    (a, b) => b.spendValue - a.spendValue,
  )[0];

  return [
    bestCampaign
      ? `${bestCampaign.name} is currently leading participant volume and should be reviewed for repeatable creative or audience patterns.`
      : "Start by creating a campaign and logging metrics to unlock performance insights.",
    mostEfficientChannel
      ? `${mostEfficientChannel.channel} is currently the most cost-efficient acquisition channel by cost per participant.`
      : "Channel insights will appear once metric data is added.",
    highestSpendChannel
      ? `${highestSpendChannel.channel} is consuming the highest share of spend and should be monitored for pacing discipline.`
      : "Spending mix insights will appear once campaign metrics are logged.",
  ];
}
