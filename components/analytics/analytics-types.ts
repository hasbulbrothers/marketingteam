import type { ReactNode } from "react";

export type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type CampaignRow = {
  id?: string;
  name: string;
  status: string;
  owner: string;
  budget: string;
  spent: string;
  participants: string;
  cpp: string;
};

export type ChannelStat = {
  channel: string;
  spend: string;
  participants: string;
  cpp: string;
  share: string;
};

export type FunnelStep = {
  label: string;
  value: string;
  note: string;
};

export type ContributionRow = {
  person: string;
  role: string;
  tasks: string;
  onTime: string;
  campaigns: string;
  influenced: string;
};

export type Spotlight = {
  name: string;
  budget: string;
  spent: string;
  participants: string;
  cpp: string;
  budgetUtilization: number;
  insight: string;
} | null;

export type DataIntakeItem = {
  title: string;
};

export type AnalyticsOverviewProps = {
  summaryCards?: SummaryCard[];
  campaignRows?: CampaignRow[];
  channelStats?: ChannelStat[];
  funnelSteps?: FunnelStep[];
  insights?: string[];
  contributionRows?: ContributionRow[];
  spotlight?: Spotlight;
  filterPills?: string[];
  dataIntakeItems?: DataIntakeItem[];
  actionBar?: ReactNode;
};
