"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarDayPopup } from "@/components/calendar/calendar-day-popup";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { MarketingTask } from "@/types/task";

export function CalendarPageClient({ tasks }: { tasks: MarketingTask[] }) {
  const { isLoaded, userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isAuthed = Boolean(isLoaded && userId);
  const liveTasks = useQuery(api.tasks.queries.getTasks, isAuthed ? {} : "skip") as MarketingTask[] | undefined;
  const sourceTasks = isAuthed ? liveTasks ?? tasks : [];

  const selectedTasks = useMemo(
    () => sourceTasks.filter((task) => task.dueDate === selectedDate),
    [selectedDate, sourceTasks],
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
  }

  return (
    <>
      <CalendarToolbar />
      <CalendarGrid tasks={sourceTasks} onSelectDate={handleSelectDate} selectedDate={selectedDate} />
      <CalendarDayPopup
        date={selectedDate}
        open={Boolean(selectedDate)}
        tasks={selectedTasks}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
    </>
  );
}
