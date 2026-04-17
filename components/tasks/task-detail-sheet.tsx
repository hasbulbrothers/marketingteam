import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskCommentForm } from "@/components/tasks/task-comment-form";
import { TaskComments } from "@/components/tasks/task-comments";
import { formatDisplayDate, formatDueDate } from "@/lib/utils/date";
import { TaskComment } from "@/types/comment";
import { MarketingTask } from "@/types/task";

export function TaskDetailSheet({
  task,
  comments,
  onAddComment,
  onOpenChange,
}: {
  task: MarketingTask | null;
  comments: TaskComment[];
  onAddComment: (message: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(task)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl gap-0 overflow-y-auto border-l border-slate-200 bg-background px-0 sm:max-w-2xl">
        {task ? (
          <div className="space-y-8 px-8 py-8">
            <SheetHeader className="space-y-4 text-left">
              <div className="flex flex-wrap gap-2">
                <Badge>{task.priority}</Badge>
                <Badge variant="secondary">{task.status.replaceAll("_", " ")}</Badge>
                <Badge variant="secondary">{task.platform}</Badge>
                {task.campaign ? <Badge variant="outline">{task.campaign.name}</Badge> : null}
              </div>
              <div className="space-y-3">
                <SheetTitle className="text-3xl font-bold leading-tight tracking-tight text-slate-900">{task.title}</SheetTitle>
                <p className="text-sm leading-7 text-slate-500">{task.description}</p>
              </div>
            </SheetHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <Meta label="Assignee" value={task.assignee.name} />
              <Meta label="Role" value={task.assignee.role} />
              <Meta label="Due date" value={formatDisplayDate(task.dueDate)} />
              <Meta label="Time status" value={formatDueDate(task.dueDate)} />
              <Meta label="Content type" value={task.contentType} />
              <Meta label="Campaign" value={task.campaign?.name ?? "No campaign"} />
              <Meta label="Tags" value={task.tags.join(", ")} />
            </div>
            <Separator className="bg-slate-200" />
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
              <TaskCommentForm onSubmit={onAddComment} />
              <TaskComments comments={comments} />
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white px-5 py-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
