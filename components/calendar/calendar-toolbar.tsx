import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CalendarToolbar() {
  return (
    <div className="premium-card border-none p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 bg-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">March 2026</p>
            <p className="text-sm text-slate-400">Month view for campaign deadlines and publishing dates.</p>
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 bg-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Filter label="All platforms" />
          <Filter label="All assignees" />
          <Filter label="All status" />
          <Filter label="Month view" />
        </div>
      </div>
    </div>
  );
}

function Filter({ label }: { label: string }) {
  return <div className="rounded-2xl bg-background px-4 py-3 text-sm text-slate-500 shadow-sm">{label}</div>;
}
