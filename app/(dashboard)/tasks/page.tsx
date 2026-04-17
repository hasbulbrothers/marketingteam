import { PageHeader } from "@/components/layout/page-header";
import { LiveTaskBoard } from "@/components/tasks/live-task-board";
import { TaskBoard } from "@/components/tasks/task-board";

export default function TasksPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div className="page-frame gap-6 py-8">
      <PageHeader eyebrow="Tasks" title="All tasks in one place" description="Track progress, assign work, and keep everyone aligned." />
      {hasConvex ? <LiveTaskBoard /> : <TaskBoard tasks={[]} />}
    </div>
  );
}
