export type KpiTargetView = {
  id: string;
  scope: "team" | "user";
  teamId: string | null;
  userId: string | null;
  teamName: string | null;
  userName: string | null;
  metric: string;
  target: number;
  actual: number;
  progress: number;
  achieved: boolean;
  period: string;
  startDate: string;
  endDate: string;
  platform: string | null;
  label: string | null;
  isActive: boolean;
};

export type TeamOption = { id: string; name: string };
export type UserOption = { id: string; name: string };
