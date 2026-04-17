export type CampaignStatus =
  | "planning"
  | "active"
  | "review"
  | "completed"
  | "paused";

export type CampaignSummary = {
  id: string;
  name: string;
  status: CampaignStatus | string;
};
