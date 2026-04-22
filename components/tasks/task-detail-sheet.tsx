import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskCommentForm } from "@/components/tasks/task-comment-form";
import { TaskComments } from "@/components/tasks/task-comments";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { formatDisplayDate, formatDueDate } from "@/lib/utils/date";
import { TaskComment } from "@/types/comment";
import { MarketingTask, TaskStatus } from "@/types/task";

export function TaskDetailSheet({
  task,
  comments,
  onAddComment,
  onOpenChange,
  onStatusChange,
  onRenameTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  task: MarketingTask | null;
  comments: TaskComment[];
  onAddComment: (message: string) => void;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onRenameTask?: (taskId: string, title: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}) {
  return (
    <Sheet open={Boolean(task)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl gap-0 overflow-y-auto border-l border-slate-200 bg-background px-0 sm:max-w-2xl">
        {task ? (
          <div className="space-y-8 px-8 py-8">
            <SheetHeader className="space-y-4 text-left">
              <div className="flex flex-wrap gap-2">
                <Badge>{task.priority}</Badge>
                <StatusSelector
                  currentStatus={task.status}
                  onStatusChange={onStatusChange ? (status) => onStatusChange(task.id, status) : undefined}
                />
                <Badge variant="secondary">{task.platform}</Badge>
                {task.campaign ? <Badge variant="outline">{task.campaign.name}</Badge> : null}
              </div>
              <div className="space-y-3">
                <EditableTitle title={task.title} onSave={onRenameTask ? (title) => onRenameTask(task.id, title) : undefined} />
                {task.description && <p className="text-sm leading-7 text-slate-500">{task.description}</p>}
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
            <SubtaskSection
              task={task}
              onAdd={onAddSubtask}
              onToggle={onToggleSubtask}
              onDelete={onDeleteSubtask}
            />
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

function SubtaskSection({
  task,
  onAdd,
  onToggle,
  onDelete,
}: {
  task: MarketingTask;
  onAdd?: (taskId: string, title: string) => void;
  onToggle?: (taskId: string, subtaskId: string) => void;
  onDelete?: (taskId: string, subtaskId: string) => void;
}) {
  const [value, setValue] = useState("");
  const subtasks = task.subtasks ?? [];
  const completed = subtasks.filter((s) => s.isCompleted).length;

  function submit() {
    const title = value.trim();
    if (!title) return;
    onAdd?.(task.id, title);
    setValue("");
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Subtasks</h3>
        {subtasks.length > 0 && (
          <span className="text-xs text-slate-400">{completed}/{subtasks.length} completed</span>
        )}
      </div>
      {subtasks.length === 0 ? (
        <p className="text-xs text-slate-400">No subtasks yet.</p>
      ) : (
        <ul className="space-y-1">
          {subtasks.map((sub) => (
            <li key={sub.id} className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-slate-50">
              <button
                type="button"
                onClick={() => onToggle?.(task.id, sub.id)}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                  sub.isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                {sub.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm ${sub.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>{sub.title}</span>
              {onDelete && (
                <button type="button" onClick={() => onDelete(task.id, sub.id)} className="text-slate-300 transition hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {onAdd && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2">
          <Plus className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Add subtask"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      )}
    </section>
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

const STATUS_COLORS: Record<TaskStatus, string> = {
  idea: "bg-slate-100 text-slate-600",
  planning: "bg-violet-50 text-violet-700",
  in_progress: "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  scheduled: "bg-indigo-50 text-indigo-700",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-50 text-slate-500",
};

function EditableTitle({ title, onSave }: { title: string; onSave?: (title: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(title); }, [title]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 3) {
      setValue(title);
      setEditing(false);
      return;
    }
    if (trimmed !== title) onSave?.(trimmed);
    setEditing(false);
  }

  if (!onSave) {
    return <SheetTitle className="text-3xl font-bold leading-tight tracking-tight text-slate-900">{title}</SheetTitle>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex w-full items-start gap-2 text-left"
      >
        <SheetTitle className="text-3xl font-bold leading-tight tracking-tight text-slate-900 group-hover:text-primary">{title}</SheetTitle>
        <Pencil className="mt-2 h-4 w-4 flex-shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") { setValue(title); setEditing(false); }
      }}
      className="w-full border-b-2 border-primary bg-transparent text-3xl font-bold leading-tight tracking-tight text-slate-900 outline-none"
    />
  );
}

function StatusSelector({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: TaskStatus;
  onStatusChange?: (status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = TASK_STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus;

  if (!onStatusChange) {
    return <Badge variant="secondary">{label}</Badge>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Change status from ${label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:ring-2 hover:ring-primary/20 ${STATUS_COLORS[currentStatus]}`}
      >
        {label}
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="listbox" aria-label="Task status options" className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {TASK_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="option"
                aria-selected={s.value === currentStatus}
                onClick={() => {
                  onStatusChange(s.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  s.value === currentStatus ? "font-semibold text-primary" : "text-slate-700"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[s.value].split(" ")[0].replace("bg-", "bg-")}`} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
