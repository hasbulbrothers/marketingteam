import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { PageHeader } from "@/components/layout/page-header";

export default function AnalyticsPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="page-frame gap-8 py-8">
      <PageHeader
        eyebrow="Analytics"
        title="See campaign spend, participants, and performance with decision-ready clarity"
        description="A dedicated performance layer for campaign analytics, budget efficiency, channel comparisons, and team contribution across active marketing initiatives."
      />
      <AnalyticsWorkspace preview={!hasConvex || !hasClerk} />
    </div>
  );
}
