import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { PublishingSnapshot } from "@/components/dashboard/publishing-snapshot";
import { ReviewList } from "@/components/dashboard/review-list";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { WorkloadList } from "@/components/dashboard/workload-list";
import { buildDashboardStats, buildWorkload } from "@/lib/utils/dashboard";

export default function DashboardPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const stats = buildDashboardStats([]);
  const workload = buildWorkload([]);
  const upcomingTasks: never[] = [];
  const reviewTasks: never[] = [];
  const snapshot = [
    { label: "Scheduled this week", value: "0" },
    { label: "Published this week", value: "0" },
  ];

  return (
    <div className="page-frame gap-8 py-8">
      <PageHeader eyebrow="Dashboard" title="A calmer workflow for the marketing department" description="Monitor task health, upcoming deadlines, and team workload in one quiet workspace built for daily content operations." />
      {hasConvex ? (
        <LiveDashboard />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatsCard key={stat.label} stat={stat} />
            ))}
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
      )}
    </div>
  );
}
