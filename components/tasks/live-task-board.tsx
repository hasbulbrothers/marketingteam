"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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
  const addComment = useMutation(api.comments.mutations.addComment);

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
        return;
      }}
      onAddComment={async (taskId, message) => {
        await addComment({ taskId, message } as never);
        return;
      }}
    />
  );
}
