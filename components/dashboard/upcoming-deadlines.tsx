import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDueDate } from "@/lib/utils/date";
import { MarketingTask } from "@/types/task";

export function UpcomingDeadlines({ tasks }: { tasks: MarketingTask[] }) {
  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="mb-8 flex flex-row items-center justify-between p-0">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Upcoming deadlines</CardTitle>
          <p className="text-sm text-slate-400">Tasks needing attention this week</p>
        </div>
        <button className="rounded-2xl bg-slate-50 p-3 text-slate-400 transition-colors hover:text-slate-600" type="button">
          <CalendarDays className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {tasks.map((task) => (
          <div key={task.id} className="cursor-pointer rounded-[24px] border border-transparent bg-background px-6 py-6 transition-all hover:border-slate-200">
            <div className="mb-3 flex items-start justify-between gap-4">
              <h4 className="font-semibold text-slate-800">{task.title}</h4>
              <Badge className="rounded-lg border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" variant="secondary">
                {task.priority}
              </Badge>
            </div>
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <span>{task.assignee.name}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{task.platform}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{task.contentType}</span>
              <span className="font-medium text-slate-600">{formatDueDate(task.dueDate)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
