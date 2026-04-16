import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { PageHeader } from "@/components/layout/page-header";

export default function CalendarPage() {
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div className="page-frame">
      <PageHeader eyebrow="Calendar" title="See the publishing rhythm across the month" description="Review due dates, planned launches, and overdue content in a single calendar workspace built for the marketing team." />
      {hasConvex ? <CalendarPageClient tasks={[]} /> : <CalendarPageClient tasks={[]} preview />}
    </div>
  );
}
