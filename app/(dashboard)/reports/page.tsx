import { PageHeader } from "@/components/layout/page-header";

const insights = [
  {
    title: "Average lead time",
    copy: "Measure how long a task takes from brief creation to published output.",
  },
  {
    title: "Platform distribution",
    copy: "Track where the team is investing effort across TikTok, Instagram, Email, and Website.",
  },
  {
    title: "Priority trends",
    copy: "Surface spikes in urgent work and identify approval bottlenecks before they grow.",
  },
  {
    title: "Team throughput",
    copy: "Review completed volume by role and compare planned versus delivered output.",
  },
];

export default function ReportsPage() {
  return (
    <div className="page-frame">
      <PageHeader
        eyebrow="Reports"
        title="Reporting-ready foundations for calmer decision making"
        description="A premium reporting surface for future delivery metrics, campaign throughput, and workload trends without cluttering the daily workspace."
      />
      <section className="premium-card border-none p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Planned analytics</h2>
          <p className="text-sm text-slate-400">These report modules are prepared for the next implementation phase.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((item) => (
            <div key={item.title} className="rounded-[28px] bg-white px-6 py-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
