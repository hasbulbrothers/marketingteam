import { MarketingTask, TaskFiltersState } from "@/types/task";

export function filterTasks(tasks: MarketingTask[], filters: TaskFiltersState) {
  return tasks.filter((task) => {
    const query = filters.query.trim().toLowerCase();
    if (
      query &&
      !task.title.toLowerCase().includes(query) &&
      !task.description.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.platform && task.platform !== filters.platform) return false;
    if (filters.contentType && task.contentType !== filters.contentType) return false;
    return true;
  });
}
