"use client";

import { useMemo, useState } from "react";
import { addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskTableNotion } from "@/components/tasks/task-table-notion";
import { TaskToolbar, PeriodView } from "@/components/tasks/task-toolbar";
import { useTaskBoard } from "@/hooks/use-task-board";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { CampaignSummary } from "@/types/campaign";
import { TaskComment } from "@/types/comment";
import { MarketingTask, TaskStatus } from "@/types/task";
import { TeamMember } from "@/types/user";

type TaskBoardProps = {
  tasks: MarketingTask[];
  commentsByTask?: Record<string, TaskComment[]>;
  assignees?: TeamMember[];
  campaigns?: CampaignSummary[];
  selectedTaskId?: string | null;
  onSelectedTaskChange?: (taskId: string | null) => void;
  onCreateTask?: (task: MarketingTask) => Promise<void> | void;
  onAddComment?: (taskId: string, message: string) => Promise<void> | void;
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void> | void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onRenameTask?: (taskId: string, title: string) => void;
};

export function TaskBoard({
  tasks: initialTasks,
  commentsByTask: externalComments,
  assignees: externalAssignees,
  campaigns = [],
  selectedTaskId: controlledSelectedTaskId,
  onSelectedTaskChange,
  onCreateTask,
  onAddComment,
  onStatusChange,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onRenameTask,
}: TaskBoardProps) {
  const [periodView, setPeriodView] = useState<PeriodView>("month");
  const [periodDate, setPeriodDate] = useState(new Date());
  const [localSelectedTaskId, setLocalSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [localCommentsByTask, setLocalCommentsByTask] = useState<Record<string, TaskComment[]>>({});
  const { filters } = useTaskFilters();

  const periodStart = periodView === "week" ? startOfWeek(periodDate) : startOfMonth(periodDate);
  const periodEnd = periodView === "week" ? endOfWeek(periodDate) : endOfMonth(periodDate);
  const periodLabel = periodView === "week"
    ? `${format(periodStart, "dd MMM")} — ${format(periodEnd, "dd MMM yyyy")}`
    : format(periodDate, "MMMM yyyy");

  const tasks = useMemo(() => {
    return initialTasks.filter((task) => {
      if (!task.dueDate) return true;
      const due = new Date(task.dueDate);
      return due >= periodStart && due <= periodEnd;
    });
  }, [initialTasks, periodStart, periodEnd]);

  const { summary } = useTaskBoard(tasks, filters);

  function handlePeriodChange(direction: "prev" | "next") {
    const delta = direction === "next" ? 1 : -1;
    setPeriodDate((current) =>
      periodView === "week" ? addWeeks(current, delta) : addMonths(current, delta)
    );
  }

  function handlePeriodViewChange(view: PeriodView) {
    const today = new Date();
    setPeriodDate(view === "week" ? today : new Date(today.getFullYear(), today.getMonth(), 1));
    setPeriodView(view);
  }
  const selectedTaskId = controlledSelectedTaskId ?? localSelectedTaskId;
  const commentsByTask = externalComments ?? localCommentsByTask;

  const selectedTask = useMemo(
    () => initialTasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, initialTasks],
  );

  const assignees = useMemo<TeamMember[]>(() => {
    if (externalAssignees?.length) return externalAssignees;
    return Array.from(new Map(tasks.map((task) => [task.assignee.id, task.assignee])).values()).map(
      (assignee) => ({ ...assignee }),
    );
  }, [externalAssignees, tasks]);

  function openTask(taskId: string | null) {
    setLocalSelectedTaskId(taskId);
    onSelectedTaskChange?.(taskId);
  }

  async function handleCreate(task: MarketingTask) {
    openTask(task.id);
    await onCreateTask?.(task);
  }

  async function handleAddComment(message: string) {
    const taskId = selectedTaskId;
    if (!taskId) return;

    const comment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      author: "You",
      role: "Marketing Team",
      message,
      createdAt: new Date().toISOString(),
    };

    setLocalCommentsByTask((current) => ({
      ...current,
      [taskId]: [...(current[taskId] ?? []), comment],
    }));
    await onAddComment?.(taskId, message);
  }

  return (
    <div className="space-y-5">
      <TaskToolbar
        summary={summary}
        onCreate={() => setCreateOpen(true)}
        activeFilterCount={0}
        periodLabel={periodLabel}
        periodView={periodView}
        onPeriodChange={handlePeriodChange}
        onPeriodViewChange={handlePeriodViewChange}
      />
      <TaskTableNotion
        tasks={tasks}
        onSelectTask={(taskId) => openTask(taskId)}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
      />
      <TaskDetailSheet
        task={selectedTask}
        comments={selectedTask ? commentsByTask[selectedTask.id] ?? [] : []}
        onAddComment={handleAddComment}
        onOpenChange={(open) => !open && openTask(null)}
        onStatusChange={onStatusChange}
        onRenameTask={onRenameTask}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
      />
      <TaskCreateDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        assignees={assignees}
        campaigns={campaigns}
        onCreate={handleCreate}
      />
    </div>
  );
}
