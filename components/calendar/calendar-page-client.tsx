"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { CalendarDayPopup } from "@/components/calendar/calendar-day-popup";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { buildVisibleDays, changePeriod, filterCalendarTasks, formatPeriodLabel } from "@/lib/utils/calendar";
import { CampaignSummary } from "@/types/campaign";
import { TaskComment } from "@/types/comment";
import { MarketingTask, Platform, TaskStatus } from "@/types/task";
import { TeamMember } from "@/types/user";

const now = new Date();
const initialMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [month, setMonth] = useState(initialMonth);
  const [filters, setFilters] = useState<{ platform: Platform | "all"; assigneeId: string | "all"; status: TaskStatus | "all"; view: "month" | "week" }>({
    platform: "all",
    assigneeId: "all",
    status: "all",
    view: "month",
  });

  const isAuthed = Boolean(isLoaded && userId);
  const liveTasks = useQuery(api.tasks.queries.getTasks, isAuthed ? {} : "skip") as MarketingTask[] | undefined;
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as TeamMember[] | undefined;
  const campaigns = useQuery(api.campaigns.queries.listCampaigns, isAuthed ? {} : "skip") as CampaignSummary[] | undefined;
  const comments = useQuery(
    api.comments.queries.getCommentsByTask,
    isAuthed && selectedTaskId ? ({ taskId: selectedTaskId } as never) : "skip",
  ) as TaskComment[] | undefined;
  const addComment = useMutation(api.comments.mutations.addComment);
  const createTask = useMutation(api.tasks.mutations.createTask);
  const moveTaskStatus = useMutation(api.tasks.mutations.moveTaskStatus);
  const renameTaskMutation = useMutation(api.tasks.mutations.renameTask);
  const addSubtaskMutation = useMutation(api.tasks.mutations.addSubtask);
  const toggleSubtaskMutation = useMutation(api.tasks.mutations.toggleSubtask);
  const deleteSubtaskMutation = useMutation(api.tasks.mutations.deleteSubtask);
  const sourceTasks = useMemo(() => (isAuthed ? liveTasks ?? tasks : []), [isAuthed, liveTasks, tasks]);
  const visibleTasks = useMemo(() => filterCalendarTasks(sourceTasks, month, filters.view, filters), [filters, month, sourceTasks]);
  const visibleDays = useMemo(() => buildVisibleDays(month, filters.view), [filters.view, month]);
  const selectedTasks = useMemo(() => visibleTasks.filter((task) => task.dueDate === selectedDate), [selectedDate, visibleTasks]);
  const selectedTask = useMemo(() => sourceTasks.find((task) => task.id === selectedTaskId) ?? null, [selectedTaskId, sourceTasks]);
  const assignees = useMemo(
    () =>
      users?.map((user) => ({ id: String(user.id), name: user.name, role: user.role })) ??
      Array.from(new Map(sourceTasks.map((task) => [task.assignee.id, task.assignee])).values()),
    [sourceTasks, users],
  );

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
        onFilterChange={(key, value) => {
          if (key === "view") {
            const today = new Date();
            setMonth(value === "week" ? today : new Date(today.getFullYear(), today.getMonth(), 1));
          }
          setFilters((current) => ({ ...current, [key]: value }));
        }}
      />
      <CalendarGrid
        currentDate={month}
        visibleDays={visibleDays}
        tasks={visibleTasks}
        onSelectDate={setSelectedDate}
        onCreateTaskAtDate={setCreateDate}
        selectedDate={selectedDate}
        showOutsideDays={filters.view === "month"}
      />
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
          void addComment({ taskId: selectedTaskId, message } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal menambah komen.");
          });
        }}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        onStatusChange={(taskId, status) => {
          void moveTaskStatus({ taskId, status } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal mengemas kini status.");
          });
        }}
        onRenameTask={(taskId, title) => {
          void renameTaskMutation({ taskId, title } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal menamakan semula task.");
          });
        }}
        onAddSubtask={(taskId, title) => {
          void addSubtaskMutation({ taskId, title } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal menambah subtask.");
          });
        }}
        onToggleSubtask={(taskId, subtaskId) => {
          void toggleSubtaskMutation({ taskId, subtaskId } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal mengemas kini subtask.");
          });
        }}
        onDeleteSubtask={(taskId, subtaskId) => {
          void deleteSubtaskMutation({ taskId, subtaskId } as never).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Gagal memadam subtask.");
          });
        }}
      />
      {createDate ? (
        <TaskCreateDialog
          key={createDate}
          open
        onOpenChange={(open) => !open && setCreateDate(null)}
        assignees={assignees}
        campaigns={campaigns ?? []}
        presetDueDate={createDate}
        onCreate={async (task) => {
          try {
            await createTask({
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              platform: task.platform,
              contentType: task.contentType,
              tags: task.tags,
              dueDate: task.dueDate ?? undefined,
              scheduledAt: task.status === "scheduled" ? task.dueDate ?? undefined : undefined,
              assigneeId: task.assignee.id === "unassigned" ? undefined : task.assignee.id,
              campaignId: task.campaign?.id ?? undefined,
            } as never);
            toast.success("Task created");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal mencipta task.");
          }
        }}
      />
      ) : null}
    </>
  );
}

function CalendarPreview({ tasks }: { tasks: MarketingTask[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);
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
        onFilterChange={(key, value) => {
          if (key === "view") {
            const today = new Date();
            setMonth(value === "week" ? today : new Date(today.getFullYear(), today.getMonth(), 1));
          }
          setFilters((current) => ({ ...current, [key]: value }));
        }}
      />
      <CalendarGrid
        currentDate={month}
        visibleDays={visibleDays}
        tasks={visibleTasks}
        onSelectDate={setSelectedDate}
        onCreateTaskAtDate={setCreateDate}
        selectedDate={selectedDate}
        showOutsideDays={filters.view === "month"}
      />
      <CalendarDayPopup
        date={selectedDate}
        open={Boolean(selectedDate)}
        tasks={selectedTasks}
        onSelectTask={() => undefined}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
      <TaskDetailSheet task={null} comments={[]} onAddComment={() => undefined} onOpenChange={() => undefined} />
      {createDate ? (
        <TaskCreateDialog
          key={createDate}
          open
        onOpenChange={(open) => !open && setCreateDate(null)}
        assignees={assignees}
        campaigns={[]}
        presetDueDate={createDate}
        onCreate={() => undefined}
      />
      ) : null}
    </>
  );
}
