"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { MarketingTask, TaskPriority, TaskStatus } from "@/types/task";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { formatDueDate } from "@/lib/utils/date";

export type Subtask = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export type TaskWithSubtasks = MarketingTask & {
  subtasks?: Subtask[];
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-slate-300",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  urgent: "bg-rose-500",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const STATUS_META: Record<TaskStatus, { dot: string; text: string; bg: string }> = {
  idea: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100" },
  planning: { dot: "bg-violet-400", text: "text-violet-700", bg: "bg-violet-50" },
  in_progress: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  review: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  scheduled: { dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" },
  published: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  archived: { dot: "bg-slate-300", text: "text-slate-500", bg: "bg-slate-50" },
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function TaskTableNotion({
  tasks,
  onSelectTask,
  onAddSubtask,
  onToggleSubtask,
}: {
  tasks: TaskWithSubtasks[];
  onSelectTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [tasks, query]);

  function toggleExpanded(taskId: string) {
    setExpandedTaskId((current) => (current === taskId ? null : taskId));
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400">No tasks yet</div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {filtered.map((task) => (
              <MobileTaskCard
                key={task.id}
                task={task}
                subtasks={task.subtasks ?? []}
                isExpanded={expandedTaskId === task.id}
                onToggleExpanded={() => toggleExpanded(task.id)}
                onToggleSubtask={(subtaskId) => onToggleSubtask?.(task.id, subtaskId)}
                onAddSubtask={(title) => onAddSubtask?.(task.id, title)}
                onEdit={onSelectTask ? () => onSelectTask(task.id) : undefined}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <div className="grid grid-cols-[24px_minmax(0,1fr)_140px_160px_140px_120px_48px] gap-4 border-b border-slate-100 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <span />
              <span>Task</span>
              <span>Status</span>
              <span>Assignee</span>
              <span>Due date</span>
              <span>Priority</span>
              <span />
            </div>
            {filtered.map((task) => (
              <DesktopTaskRow
                key={task.id}
                task={task}
                subtasks={task.subtasks ?? []}
                isExpanded={expandedTaskId === task.id}
                onToggleExpanded={() => toggleExpanded(task.id)}
                onToggleSubtask={(subtaskId) => onToggleSubtask?.(task.id, subtaskId)}
                onAddSubtask={(title) => onAddSubtask?.(task.id, title)}
                onEdit={onSelectTask ? () => onSelectTask(task.id) : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MobileTaskCard({
  task, subtasks, isExpanded, onToggleExpanded, onToggleSubtask, onAddSubtask, onEdit,
}: {
  task: TaskWithSubtasks; subtasks: Subtask[]; isExpanded: boolean;
  onToggleExpanded: () => void; onToggleSubtask: (id: string) => void; onAddSubtask: (title: string) => void; onEdit?: () => void;
}) {
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const hasSubtasks = subtasks.length > 0;
  const meta = STATUS_META[task.status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggleExpanded} className="w-full px-4 py-3.5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
              {hasSubtasks && (
                <span className="flex flex-shrink-0 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  <Check className="h-3 w-3" />{completed}/{subtasks.length}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${meta.bg} ${meta.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                {PRIORITY_LABEL[task.priority]}
              </span>
              {task.dueDate && (
                <span className="text-[11px] text-slate-400">{formatDueDate(task.dueDate)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              {initials(task.assignee.name)}
            </span>
            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </div>
        {task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{tag}</span>
            ))}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-2">
          {task.description && <p className="pb-2 text-xs text-slate-500">{task.description}</p>}
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Assignee: {task.assignee.name}</p>
          <SubtaskList subtasks={subtasks} onToggle={onToggleSubtask} onAdd={onAddSubtask} />
          {onEdit && (
            <button type="button" onClick={onEdit} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 transition hover:border-primary/25 hover:text-primary">
              <Pencil className="h-3.5 w-3.5" />
              Edit task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopTaskRow({
  task, subtasks, isExpanded, onToggleExpanded, onToggleSubtask, onAddSubtask, onEdit,
}: {
  task: TaskWithSubtasks; subtasks: Subtask[]; isExpanded: boolean;
  onToggleExpanded: () => void; onToggleSubtask: (id: string) => void; onAddSubtask: (title: string) => void; onEdit?: () => void;
}) {
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const hasSubtasks = subtasks.length > 0;
  const meta = STATUS_META[task.status];

  return (
    <div className="border-t border-slate-100">
      <div className="grid grid-cols-[24px_minmax(0,1fr)_140px_160px_140px_120px_48px] items-center gap-4 px-5 py-2.5 text-sm transition hover:bg-slate-50">
        <button type="button" onClick={onToggleExpanded} className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200">
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-slate-800">{task.title}</p>
            {hasSubtasks && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                <Check className="h-3 w-3" />{completed}/{subtasks.length}
              </span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">{initials(task.assignee.name)}</span>
          <span className="truncate text-slate-600">{task.assignee.name}</span>
        </div>
        <div className="text-slate-500">{formatDueDate(task.dueDate)}</div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
          <span className="text-slate-600">{PRIORITY_LABEL[task.priority]}</span>
        </div>
        <div>
          {onEdit && (
            <button type="button" onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-primary">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/60 px-5 pb-3 pt-1">
          <div className="ml-6 border-l border-slate-200 pl-4">
            {task.description && <p className="pb-2 pt-1 text-xs text-slate-500">{task.description}</p>}
            <SubtaskList subtasks={subtasks} onToggle={onToggleSubtask} onAdd={onAddSubtask} />
          </div>
        </div>
      )}
    </div>
  );
}

function SubtaskList({ subtasks, onToggle, onAdd }: { subtasks: Subtask[]; onToggle: (id: string) => void; onAdd: (title: string) => void }) {
  return (
    <>
      {subtasks.length === 0 ? (
        <p className="py-2 text-xs text-slate-400">No subtasks yet.</p>
      ) : (
        <ul className="space-y-0.5 py-1">
          {subtasks.map((subtask) => (
            <li key={subtask.id}>
              <button type="button" onClick={() => onToggle(subtask.id)} className="group flex w-full items-center gap-2 rounded py-1 pr-2 text-left transition hover:bg-white">
                <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                  subtask.isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}>
                  {subtask.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={`text-sm ${subtask.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>{subtask.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <AddSubtaskInput onAdd={onAdd} />
    </>
  );
}

function AddSubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");
  function submit() { if (!value.trim()) return; onAdd(value); setValue(""); }

  return (
    <div className="flex items-center gap-2 py-1">
      <Plus className="h-3.5 w-3.5 text-slate-400" />
      <input
        type="text" value={value} onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
        placeholder="Add subtask"
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}
