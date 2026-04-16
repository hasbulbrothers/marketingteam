"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarDayPopup } from "@/components/calendar/calendar-day-popup";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { buildVisibleDays, changePeriod, filterCalendarTasks, formatPeriodLabel } from "@/lib/utils/calendar";
import { TaskComment } from "@/types/comment";
import { MarketingTask, Platform, TaskStatus } from "@/types/task";

const initialMonth = new Date("2026-03-01T00:00:00");

export function CalendarPageClient({
  tasks,
  preview = false,
}: {
  tasks: MarketingTask[];
  preview?: boolean;
}) {
  if (preview) {
    return <CalendarPreview tasks={tasks} />;
  }

  return <LiveCalendarPageClient tasks={tasks} />;
}

function LiveCalendarPageClient({ tasks }: { tasks: MarketingTask[] }) {
  const { isLoaded, userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [month, setMonth] = useState(initialMonth);
  const [filters, setFilters] = useState<{ platform: Platform | "all"; assigneeId: string | "all"; status: TaskStatus | "all"; view: "month" | "week" }>({
    platform: "all",
    assigneeId: "all",
    status: "all",
    view: "month",
  });

  const isAuthed = Boolean(isLoaded && userId);
  const liveTasks = useQuery(api.tasks.queries.getTasks, isAuthed ? {} : "skip") as MarketingTask[] | undefined;
  const comments = useQuery(
    api.comments.queries.getCommentsByTask,
    isAuthed && selectedTaskId ? ({ taskId: selectedTaskId } as never) : "skip",
  ) as TaskComment[] | undefined;
  const addComment = useMutation(api.comments.mutations.addComment);
  const sourceTasks = useMemo(() => (isAuthed ? liveTasks ?? tasks : []), [isAuthed, liveTasks, tasks]);
  const visibleTasks = useMemo(() => filterCalendarTasks(sourceTasks, month, filters.view, filters), [filters, month, sourceTasks]);
  const visibleDays = useMemo(() => buildVisibleDays(month, filters.view), [filters.view, month]);
  const selectedTasks = useMemo(() => visibleTasks.filter((task) => task.dueDate === selectedDate), [selectedDate, visibleTasks]);
  const selectedTask = useMemo(() => sourceTasks.find((task) => task.id === selectedTaskId) ?? null, [selectedTaskId, sourceTasks]);
  const assignees = useMemo(() => Array.from(new Map(sourceTasks.map((task) => [task.assignee.id, task.assignee])).values()), [sourceTasks]);

  function handleSelectTask(task: MarketingTask) {
    setSelectedTaskId(task.id);
    setSelectedDate(null);
  }

  return (
    <>
      <CalendarToolbar
        periodLabel={formatPeriodLabel(month, filters.view)}
        filters={filters}
        assignees={assignees.map((assignee) => ({ id: assignee.id, name: assignee.name }))}
        onMonthChange={(direction) => setMonth((current) => changePeriod(current, direction, filters.view))}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />
      <CalendarGrid currentDate={month} visibleDays={visibleDays} tasks={visibleTasks} onSelectDate={setSelectedDate} selectedDate={selectedDate} showOutsideDays={filters.view === "month"} />
      <CalendarDayPopup
        date={selectedDate}
        open={Boolean(selectedDate)}
        tasks={selectedTasks}
        onSelectTask={handleSelectTask}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
      <TaskDetailSheet
        task={selectedTask}
        comments={comments ?? []}
        onAddComment={(message) => {
          if (!selectedTaskId) return;
          void addComment({ taskId: selectedTaskId, message } as never);
        }}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </>
  );
}

function CalendarPreview({ tasks }: { tasks: MarketingTask[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [month, setMonth] = useState(initialMonth);
  const [filters, setFilters] = useState<{ platform: Platform | "all"; assigneeId: string | "all"; status: TaskStatus | "all"; view: "month" | "week" }>({
    platform: "all",
    assigneeId: "all",
    status: "all",
    view: "month",
  });

  const visibleTasks = useMemo(() => filterCalendarTasks(tasks, month, filters.view, filters), [filters, month, tasks]);
  const visibleDays = useMemo(() => buildVisibleDays(month, filters.view), [filters.view, month]);
  const selectedTasks = useMemo(() => visibleTasks.filter((task) => task.dueDate === selectedDate), [selectedDate, visibleTasks]);
  const assignees = useMemo(() => Array.from(new Map(tasks.map((task) => [task.assignee.id, task.assignee])).values()), [tasks]);

  return (
    <>
      <CalendarToolbar
        periodLabel={formatPeriodLabel(month, filters.view)}
        filters={filters}
        assignees={assignees.map((assignee) => ({ id: assignee.id, name: assignee.name }))}
        onMonthChange={(direction) => setMonth((current) => changePeriod(current, direction, filters.view))}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />
      <CalendarGrid currentDate={month} visibleDays={visibleDays} tasks={visibleTasks} onSelectDate={setSelectedDate} selectedDate={selectedDate} showOutsideDays={filters.view === "month"} />
      <CalendarDayPopup
        date={selectedDate}
        open={Boolean(selectedDate)}
        tasks={selectedTasks}
        onSelectTask={() => undefined}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
      <TaskDetailSheet task={null} comments={[]} onAddComment={() => undefined} onOpenChange={() => undefined} />
    </>
  );
}
