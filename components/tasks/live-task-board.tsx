"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { TaskBoard } from "@/components/tasks/task-board";
import { api } from "@/convex/_generated/api";
import { CampaignSummary } from "@/types/campaign";
import { MarketingTask } from "@/types/task";
import { TeamMember } from "@/types/user";

type QueryUser = TeamMember & { _id?: string };

export function LiveTaskBoard() {
  const { isLoaded, userId } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const isAuthed = Boolean(isLoaded && userId);
  const tasks = useQuery(api.tasks.queries.getTasks, isAuthed ? {} : "skip") as MarketingTask[] | undefined;
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as QueryUser[] | undefined;
  const campaigns = useQuery(api.campaigns.queries.listCampaigns, isAuthed ? {} : "skip") as CampaignSummary[] | undefined;
  const comments = useQuery(
    api.comments.queries.getCommentsByTask,
    isAuthed && selectedTaskId ? ({ taskId: selectedTaskId } as never) : "skip",
  ) as Array<{ id: string; taskId: string; author: string; role: string; message: string; createdAt: string }> | undefined;

  const createTask = useMutation(api.tasks.mutations.createTask);
  const moveTaskStatus = useMutation(api.tasks.mutations.moveTaskStatus);
  const addComment = useMutation(api.comments.mutations.addComment);
  const addSubtaskMutation = useMutation(api.tasks.mutations.addSubtask);
  const toggleSubtaskMutation = useMutation(api.tasks.mutations.toggleSubtask);
  const deleteSubtaskMutation = useMutation(api.tasks.mutations.deleteSubtask);
  const renameTaskMutation = useMutation(api.tasks.mutations.renameTask);

  const assignees = useMemo(
    () => users?.map((item) => ({ id: String(item._id ?? item.id), name: item.name, role: item.role })) ?? [],
    [users],
  );

  const taskComments = useMemo(
    () => (selectedTaskId && comments ? { [selectedTaskId]: comments } : {}),
    [comments, selectedTaskId],
  );

  if (!isAuthed || !tasks) {
    return <TaskBoard key="loading" tasks={[]} />;
  }

  return (
    <TaskBoard
      key="live"
      tasks={tasks}
      assignees={assignees}
      campaigns={campaigns ?? []}
      commentsByTask={taskComments}
      selectedTaskId={selectedTaskId}
      onSelectedTaskChange={setSelectedTaskId}
      onCreateTask={async (task) => {
        try {
          await createTask({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            platform: task.platform,
            contentType: task.contentType,
            tags: task.tags,
            dueDate: task.dueDate,
            scheduledAt: task.status === "scheduled" ? task.dueDate : undefined,
            assigneeId: task.assignee.id === "unassigned" ? undefined : task.assignee.id,
            campaignId: task.campaign?.id ?? undefined,
          } as never);
          toast.success("Task created");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to create task");
        }
      }}
      onStatusChange={async (taskId, status) => {
        try {
          await moveTaskStatus({ taskId, status } as never);
          toast.success("Status updated");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to update status");
        }
      }}
      onAddComment={async (taskId, message) => {
        try {
          await addComment({ taskId, message } as never);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to add comment");
        }
      }}
      onAddSubtask={(taskId, title) => {
        void addSubtaskMutation({ taskId, title } as never).catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to add subtask");
        });
      }}
      onToggleSubtask={(taskId, subtaskId) => {
        void toggleSubtaskMutation({ taskId, subtaskId } as never).catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update subtask");
        });
      }}
      onDeleteSubtask={(taskId, subtaskId) => {
        void deleteSubtaskMutation({ taskId, subtaskId } as never).catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to delete subtask");
        });
      }}
      onRenameTask={(taskId, title) => {
        void renameTaskMutation({ taskId, title } as never).catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to rename task");
        });
      }}
    />
  );
}
