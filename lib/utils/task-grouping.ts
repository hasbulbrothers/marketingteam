import { TASK_STATUSES } from "@/lib/constants/task-status";
import { MarketingTask } from "@/types/task";

export function groupTasksByStatus(tasks: MarketingTask[]) {
  return TASK_STATUSES.reduce(
    (acc, status) => ({
      ...acc,
      [status.value]: tasks.filter((task) => task.status === status.value),
    }),
    {
      idea: [],
      planning: [],
      in_progress: [],
      review: [],
      scheduled: [],
      published: [],
      archived: [],
    } as Record<MarketingTask["status"], MarketingTask[]>,
  );
}
