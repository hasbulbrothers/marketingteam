"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { CampaignSummary } from "@/types/campaign";
import { TeamMember } from "@/types/user";

type QueryUser = TeamMember & { _id?: string };

const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function AppShell({ children }: { children: React.ReactNode }) {
  if (!hasConvex) {
    return <PreviewAppShell>{children}</PreviewAppShell>;
  }

  return <LiveAppShell>{children}</LiveAppShell>;
}

function PreviewAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="min-h-screen pb-20 lg:ml-72 lg:pb-0">
        <Topbar onCreateTask={() => undefined} />
        <div>{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}

function LiveAppShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const isAuthed = Boolean(isLoaded && userId);
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as QueryUser[] | undefined;
  const campaigns = useQuery(api.campaigns.queries.listCampaigns, isAuthed ? {} : "skip") as CampaignSummary[] | undefined;
  const createTask = useMutation(api.tasks.mutations.createTask);

  const assignees = useMemo(
    () => users?.map((item) => ({ id: String(item._id ?? item.id), name: item.name, role: item.role })) ?? [],
    [users],
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="min-h-screen pb-20 lg:ml-72 lg:pb-0">
        <Topbar onCreateTask={() => setCreateOpen(true)} />
        <div>{children}</div>
      </main>
      <MobileNav />
      <TaskCreateDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        assignees={assignees}
        campaigns={campaigns ?? []}
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
              dueDate: task.dueDate,
              scheduledAt: task.status === "scheduled" ? task.dueDate : undefined,
              assigneeId: task.assignee.id === "unassigned" ? undefined : task.assignee.id,
              campaignId: task.campaign?.id ?? undefined,
            } as never);
            toast.success("Task created");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal mencipta task.");
          }
        }}
      />
    </div>
  );
}
