import { PageHeader } from "@/components/layout/page-header";
import { WorkloadSummary } from "@/components/team/workload-summary";
import { WorkloadTable } from "@/components/team/workload-table";
import { buildWorkload } from "@/lib/utils/dashboard";

export default function TeamPage() {
  const workload = buildWorkload([]);
  const summary = [
    { label: "Active tasks", value: String(workload.reduce((sum, item) => sum + item.tasks, 0)) },
    { label: "Overdue tasks", value: String(workload.reduce((sum, item) => sum + item.overdue, 0)) },
    { label: "Completed", value: String(workload.reduce((sum, item) => sum + item.completed, 0)) },
    { label: "Overloaded staff", value: String(workload.filter((item) => item.load >= 72).length) },
  ];

  return (
    <div className="page-frame">
      <PageHeader eyebrow="Team" title="Balance workload before tasks start slipping" description="Review who is carrying the most active work, where overdue items are stacking up, and who can take the next task." />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-[repeat(3,1fr)_240px]">
        <FilterPill label="All roles" />
        <FilterPill label="All platforms" />
        <FilterPill label="All status" />
        <FilterPill label="Workload overview" strong />
      </div>
      <WorkloadSummary items={summary} />
      <WorkloadTable items={workload} />
    </div>
  );
}

function FilterPill({ label, strong = false }: { label: string; strong?: boolean }) {
  return <div className={strong ? "rounded-[28px] bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm" : "rounded-[28px] bg-white px-4 py-4 text-sm text-slate-500 shadow-sm"}>{label}</div>;
}
