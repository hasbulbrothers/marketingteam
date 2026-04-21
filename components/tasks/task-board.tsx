"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskTableNotion } from "@/components/tasks/task-table-notion";
import { TaskToolbar } from "@/components/tasks/task-toolbar";
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
}: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const initialTasksRef = useRef(initialTasks);
  useEffect(() => {
    const prev = initialTasksRef.current;
    if (prev.length !== initialTasks.length || JSON.stringify(prev.map((t) => t.id + t.status)) !== JSON.stringify(initialTasks.map((t) => t.id + t.status))) {
      setTasks(initialTasks);
      initialTasksRef.current = initialTasks;
    }
  }, [initialTasks]);
  const [localSelectedTaskId, setLocalSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [localCommentsByTask, setLocalCommentsByTask] = useState<Record<string, TaskComment[]>>({});
  const { filters } = useTaskFilters();
  const { summary } = useTaskBoard(tasks, filters);
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
    <div className="space-y-5">
      <TaskToolbar
        summary={summary}
        onCreate={() => setCreateOpen(true)}
        activeFilterCount={0}
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
