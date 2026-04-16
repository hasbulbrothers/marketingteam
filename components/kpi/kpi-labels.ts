export const KPI_METRICS = [
  { value: "tasks_completed", label: "Tasks completed", unit: "tasks" },
  { value: "tasks_on_time", label: "On-time deliveries", unit: "tasks" },
  { value: "posts_published", label: "Posts published", unit: "posts" },
  {
    value: "average_lead_time_days",
    label: "Avg. lead time (lower is better)",
    unit: "days",
  },
] as const;

export const KPI_PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
] as const;

export const KPI_PLATFORMS = [
  "TikTok",
  "Instagram",
  "Facebook",
  "Threads",
  "YouTube",
  "Email",
  "Website",
] as const;

export function metricLabel(metric: string): string {
  return KPI_METRICS.find((m) => m.value === metric)?.label ?? metric;
}

export function metricUnit(metric: string): string {
  return KPI_METRICS.find((m) => m.value === metric)?.unit ?? "";
}
