"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskToolbar } from "@/components/tasks/task-toolbar";
import { useTaskBoard } from "@/hooks/use-task-board";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { TaskComment } from "@/types/comment";
import { MarketingTask } from "@/types/task";
import { TeamMember } from "@/types/user";

type TaskBoardProps = {
  tasks: MarketingTask[];
  commentsByTask?: Record<string, TaskComment[]>;
  assignees?: TeamMember[];
  selectedTaskId?: string | null;
  onSelectedTaskChange?: (taskId: string | null) => void;
  onMoveTaskStatus?: (taskId: string, status: MarketingTask["status"]) => Promise<void> | void;
  onCreateTask?: (task: MarketingTask) => Promise<void> | void;
  onAddComment?: (taskId: string, message: string) => Promise<void> | void;
};

export function TaskBoard({
  tasks: initialTasks,
  commentsByTask: externalComments,
  assignees: externalAssignees,
  selectedTaskId: controlledSelectedTaskId,
  onSelectedTaskChange,
  onMoveTaskStatus,
  onCreateTask,
  onAddComment,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [localSelectedTaskId, setLocalSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [localCommentsByTask, setLocalCommentsByTask] = useState<Record<string, TaskComment[]>>({});
  const { filters, setFilter, resetFilters, activeFilterCount } = useTaskFilters();
  const { groupedTasks, summary } = useTaskBoard(tasks, filters);
  const selectedTaskId = controlledSelectedTaskId ?? localSelectedTaskId;
  const commentsByTask = externalComments ?? localCommentsByTask;

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
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

  async function handleDragEnd(event: DragEndEvent) {
    const destination = event.over?.id;
    if (!destination) return;
    const status = destination as MarketingTask["status"];
    const taskId = String(event.active.id);

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && task.status !== status
          ? { ...task, status }
          : task,
      ),
    );
    await onMoveTaskStatus?.(taskId, status);
  }

  async function handleCreate(task: MarketingTask) {
    setTasks((current) => [task, ...current]);
    openTask(task.id);
    await onCreateTask?.(task);
  }

  async function handleAddComment(message: string) {
    if (!selectedTask) return;

    const comment: TaskComment = {
      id: crypto.randomUUID(),
      taskId: selectedTask.id,
      author: "You",
      role: "Marketing Team",
      message,
      createdAt: new Date().toISOString(),
    };

    setLocalCommentsByTask((current) => ({
      ...current,
      [selectedTask.id]: [...(current[selectedTask.id] ?? []), comment],
    }));
    await onAddComment?.(selectedTask.id, message);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-5">
        <TaskToolbar
          summary={summary}
          onCreate={() => setCreateOpen(true)}
          activeFilterCount={activeFilterCount}
        />
        <TaskFilters filters={filters} onChange={setFilter} onReset={resetFilters} />
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              key={status.value}
              status={status}
              tasks={groupedTasks[status.value]}
              onSelectTask={(task) => openTask(task.id)}
            />
          ))}
        </div>
        <TaskDetailSheet
          task={selectedTask}
          comments={selectedTask ? commentsByTask[selectedTask.id] ?? [] : []}
          onAddComment={handleAddComment}
          onOpenChange={(open) => !open && openTask(null)}
        />
        <TaskCreateDialog
          open={isCreateOpen}
          onOpenChange={setCreateOpen}
          assignees={assignees}
          onCreate={handleCreate}
        />
      </div>
    </DndContext>
  );
}
