import type { AnalyticsOverviewProps } from "./analytics-types";

type SummaryCard = NonNullable<AnalyticsOverviewProps["summaryCards"]>[number];
type CampaignRow = NonNullable<AnalyticsOverviewProps["campaignRows"]>[number];
type ChannelStat = NonNullable<AnalyticsOverviewProps["channelStats"]>[number];
type FunnelStep = NonNullable<AnalyticsOverviewProps["funnelSteps"]>[number];
type ContributionRow = NonNullable<AnalyticsOverviewProps["contributionRows"]>[number];
type Spotlight = AnalyticsOverviewProps["spotlight"];
type DataIntakeItem = NonNullable<AnalyticsOverviewProps["dataIntakeItems"]>[number];

export const defaultSummaryCards: SummaryCard[] = [
  { label: "Total spend", value: "RM 48,900", detail: "Across 8 active campaigns in the last 30 days." },
  { label: "Participants", value: "3,284", detail: "Combined registrations, sign-ups, and event participation." },
  { label: "Cost per participant", value: "RM 14.89", detail: "Blended acquisition cost across paid and owned channels." },
  { label: "Lead to participant", value: "38.4%", detail: "Average conversion rate from captured lead to active participant." },
];

export const defaultFilterPills = [
  "Last 30 days",
  "All campaigns",
  "All channels",
  "All teams",
  "All owners",
  "Compare vs previous",
];

export const defaultCampaignRows: CampaignRow[] = [
  { name: "Roadshow Ramadan Push", status: "Active", owner: "Sarah", budget: "RM 18,000", spent: "RM 14,260", participants: "1,124", cpp: "RM 12.69" },
  { name: "Agent Referral Sprint", status: "Review", owner: "Hakim", budget: "RM 10,000", spent: "RM 8,430", participants: "486", cpp: "RM 17.35" },
  { name: "Open Day April Intake", status: "Active", owner: "Nadia", budget: "RM 12,500", spent: "RM 11,920", participants: "928", cpp: "RM 12.84" },
  { name: "WhatsApp Nurture Burst", status: "Planning", owner: "Iman", budget: "RM 5,000", spent: "RM 1,480", participants: "121", cpp: "RM 12.23" },
];

export const defaultChannelStats: ChannelStat[] = [
  { channel: "Facebook Ads", spend: "RM 16,200", participants: "1,240", cpp: "RM 13.06", share: "42%" },
  { channel: "Instagram", spend: "RM 9,800", participants: "640", cpp: "RM 15.31", share: "26%" },
  { channel: "TikTok", spend: "RM 13,100", participants: "1,004", cpp: "RM 13.05", share: "28%" },
  { channel: "Email / CRM", spend: "RM 2,300", participants: "400", cpp: "RM 5.75", share: "4%" },
];

export const defaultFunnelSteps: FunnelStep[] = [
  { label: "Reach", value: "182k", note: "Paid + organic campaign exposure" },
  { label: "Clicks", value: "14.6k", note: "Landing page and form intent" },
  { label: "Leads", value: "8,550", note: "Captured contact records" },
  { label: "Participants", value: "3,284", note: "Registered or attended" },
];

export const defaultInsights = [
  "TikTok and Facebook currently share the best blended cost efficiency, but TikTok has stronger participant growth momentum.",
  "Email retargeting has the lowest cost per participant, which makes it a strong lever for remarketing and reminder sequences.",
  "Roadshow Ramadan Push is consuming budget fastest and should have a daily pacing monitor before the final week spike.",
];

export const defaultContributionRows: ContributionRow[] = [
  { person: "Sarah", role: "Campaign Lead", tasks: "18", onTime: "94%", campaigns: "3", influenced: "1,420" },
  { person: "Aina", role: "Designer", tasks: "26", onTime: "88%", campaigns: "4", influenced: "980" },
  { person: "Hakim", role: "Media Buyer", tasks: "12", onTime: "92%", campaigns: "2", influenced: "1,104" },
  { person: "Nadia", role: "Content Manager", tasks: "21", onTime: "90%", campaigns: "3", influenced: "1,268" },
];

export const defaultSpotlight: Spotlight = {
  name: "Open Day April Intake",
  budget: "RM 12,500",
  spent: "RM 11,920",
  participants: "928",
  cpp: "RM 12.84",
  budgetUtilization: 95,
  insight: "Strong participant volume with healthy conversion pacing, but very limited remaining budget for the final push.",
};

export const defaultDataIntakeItems: DataIntakeItem[] = [
  { title: "Manual campaign form for budget, owner, dates, and objectives." },
  { title: "Daily or weekly metric entries for spend, leads, participants, and conversions." },
  { title: "Optional CSV import from Meta Ads, TikTok Ads, or CRM exports." },
];
