import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingTask } from "@/types/task";

export function ReviewList({ tasks }: { tasks: MarketingTask[] }) {
  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-slate-900">Review needed</CardTitle>
        <p className="text-sm text-slate-400">Tasks waiting for final comments, approval, or scheduling decisions.</p>
      </CardHeader>
      <CardContent className="mt-6 space-y-3 p-0">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-4 rounded-[24px] bg-background px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{task.title}</p>
              <p className="mt-1 text-xs text-slate-400">{task.assignee.name} · {task.contentType}</p>
            </div>
            <Badge variant="secondary">{task.platform}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
