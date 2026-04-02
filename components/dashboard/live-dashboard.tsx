"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublishingSnapshot } from "@/components/dashboard/publishing-snapshot";
import { ReviewList } from "@/components/dashboard/review-list";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { WorkloadList } from "@/components/dashboard/workload-list";
import { buildDashboardStats, buildWorkload } from "@/lib/utils/dashboard";
import { DashboardStat } from "@/types/dashboard";
import { MarketingTask } from "@/types/task";

export function LiveDashboard() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const tasks = useQuery(api.tasks.queries.getTasks, isAuthed ? {} : "skip") as MarketingTask[] | undefined;
  const summary = useQuery(api.dashboard.queries.getDashboardSummary, isAuthed ? {} : "skip") as
    | {
        totalTasks: number;
        tasksInProgress: number;
        completedTasks: number;
        overdueTasks: number;
        tasksDueToday: number;
        tasksDueThisWeek: number;
      }
    | undefined;

  const sourceTasks = isAuthed ? tasks ?? [] : [];
  const stats: DashboardStat[] = summary
    ? [
        { label: "Total Tasks", value: String(summary.totalTasks), description: "All live tasks in the workspace" },
        { label: "In Progress", value: String(summary.tasksInProgress), description: "Currently in production" },
        { label: "Completed", value: String(summary.completedTasks), description: "Already delivered" },
        { label: "Overdue", value: String(summary.overdueTasks), description: "Need attention today" },
        { label: "Due Today", value: String(summary.tasksDueToday), description: "Scheduled for today" },
        { label: "Due This Week", value: String(summary.tasksDueThisWeek), description: "Coming up this week" },
      ]
    : buildDashboardStats(sourceTasks);

  const upcomingTasks = [...sourceTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const reviewTasks = sourceTasks.filter((task) => task.status === "review").slice(0, 3);
  const workload = buildWorkload(sourceTasks);
  const snapshot = [
    { label: "Scheduled this week", value: String(sourceTasks.filter((task) => task.status === "scheduled").length) },
    { label: "Published this week", value: String(sourceTasks.filter((task) => task.status === "published").length) },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => <StatsCard key={stat.label} stat={stat} />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <UpcomingDeadlines tasks={upcomingTasks} />
        <WorkloadList items={workload} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ReviewList tasks={reviewTasks} />
        <PublishingSnapshot items={snapshot} />
      </div>
    </>
  );
}
