import { TaskStatus } from "@/types/task";

export type StatusOption = {
  value: TaskStatus;
  label: string;
  description: string;
};

export const TASK_STATUSES: StatusOption[] = [
  { value: "idea", label: "Idea", description: "New briefs and incoming requests" },
  { value: "planning", label: "Planning", description: "Scope, outline, and alignment" },
  { value: "in_progress", label: "In Progress", description: "Production is underway" },
  { value: "review", label: "Review", description: "Waiting for feedback or approval" },
  { value: "scheduled", label: "Scheduled", description: "Ready for publishing calendar" },
  { value: "published", label: "Published", description: "Completed and shipped live" },
];
