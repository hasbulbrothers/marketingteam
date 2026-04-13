"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TeamMember } from "@/types/user";

type QueryUser = TeamMember & { _id?: string };

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const isAuthed = Boolean(isLoaded && userId);
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as QueryUser[] | undefined;
  const createTask = useMutation(api.tasks.mutations.createTask);

  const assignees = useMemo(
    () => users?.map((item) => ({ id: String(item._id ?? item.id), name: item.name, role: item.role })) ?? [],
    [users],
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="min-h-screen lg:ml-72">
        <Topbar onCreateTask={() => setCreateOpen(true)} />
        <div>{children}</div>
      </main>
      <TaskCreateDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        assignees={assignees}
        onCreate={async (task) => {
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
          } as never);
        }}
      />
    </div>
  );
}
