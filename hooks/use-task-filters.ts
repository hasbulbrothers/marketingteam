"use client";

import { useMemo, useState } from "react";
import { TaskFiltersState } from "@/types/task";

const initialFilters: TaskFiltersState = {
  query: "",
  status: null,
  priority: null,
  platform: null,
  contentType: null,
};

export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFiltersState>(initialFilters);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) =>
        key === "query" ? value !== "" : Boolean(value),
      ).length,
    [filters],
  );

  function setFilter<K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  return { filters, setFilter, resetFilters, activeFilterCount };
}
