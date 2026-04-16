import { PageHeader } from "@/components/layout/page-header";
import { KpiOverview } from "@/components/kpi/kpi-overview";

export default function ReportsPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div className="page-frame">
      <PageHeader
        eyebrow="Reports"
        title="KPI achievement across teams and members"
        description="Live view of how each team and individual tracks against the KPI targets set for the current period."
      />
      {hasConvex ? (
        <KpiOverview />
      ) : (
        <section className="premium-card border-none p-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Connect Convex to see live KPI data
            </h2>
            <p className="text-sm text-slate-400">
              Add NEXT_PUBLIC_CONVEX_URL to activate the reporting surface.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
