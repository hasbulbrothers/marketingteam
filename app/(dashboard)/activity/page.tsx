import { PageHeader } from "@/components/layout/page-header";
import { ActivityLogView } from "@/components/activity/activity-log-view";

export default function ActivityPage() {
  return (
    <div className="page-frame gap-6 py-8">
      <PageHeader
        eyebrow="Activity Log"
        title="Audit trail"
        description="See who changed what across the workspace."
      />
      <ActivityLogView />
    </div>
  );
}
