"use client";

import { useMemo } from "react";
import { buildDashboardStats } from "@/lib/utils/dashboard";
import { filterTasks } from "@/lib/utils/task-filters";
import { groupTasksByStatus } from "@/lib/utils/task-grouping";
import { MarketingTask, TaskFiltersState } from "@/types/task";

export function useTaskBoard(tasks: MarketingTask[], filters: TaskFiltersState) {
  return useMemo(() => {
    const filteredTasks = filterTasks(tasks, filters);
    return {
      groupedTasks: groupTasksByStatus(filteredTasks),
      summary: buildDashboardStats(filteredTasks),
    };
  }, [tasks, filters]);
}
