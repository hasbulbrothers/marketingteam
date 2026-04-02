import { PageHeader } from "@/components/layout/page-header";
import { LiveTaskBoard } from "@/components/tasks/live-task-board";
import { TaskBoard } from "@/components/tasks/task-board";

export default function TasksPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div className="page-frame gap-8 py-8">
      <PageHeader eyebrow="Tasks" title="Keep briefs, approvals, and publishing on one board" description="A minimalist kanban view for moving ideas into production, review, scheduling, and published output without extra noise." />
      {hasConvex ? <LiveTaskBoard /> : <TaskBoard tasks={[]} />}
    </div>
  );
}
