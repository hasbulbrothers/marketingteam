export type DashboardStat = {
  label: string;
  value: string;
  description: string;
};

export type WorkloadItem = {
  name: string;
  role: string;
  tasks: number;
  overdue: number;
  completed: number;
  load: number;
};
