"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
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
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TaskTableNotion({ tasks }: { tasks: TaskWithSubtasks[] }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [localSubtasks, setLocalSubtasks] = useState<Record<string, Subtask[]>>(
    () => {
      const initial: Record<string, Subtask[]> = {};
      for (const task of tasks) {
        if (task.subtasks && task.subtasks.length > 0) {
          initial[task.id] = task.subtasks;
        }
      }
      return initial;
    },
  );

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

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, TaskWithSubtasks[]>();
    for (const status of TASK_STATUSES) {
      map.set(status.value, []);
    }
    for (const task of filtered) {
      const bucket = map.get(task.status);
      if (bucket) bucket.push(task);
    }
    return map;
  }, [filtered]);

  function toggleExpanded(taskId: string) {
    setExpandedTaskId((current) => (current === taskId ? null : taskId));
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    setLocalSubtasks((current) => {
      const list = current[taskId] ?? [];
      return {
        ...current,
        [taskId]: list.map((item) =>
          item.id === subtaskId ? { ...item, isCompleted: !item.isCompleted } : item,
        ),
      };
    });
  }

  function addSubtask(taskId: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setLocalSubtasks((current) => {
      const list = current[taskId] ?? [];
      return {
        ...current,
        [taskId]: [
          ...list,
          { id: `${taskId}-${Date.now()}`, title: trimmed, isCompleted: false },
        ],
      };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
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
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[24px_minmax(0,1fr)_140px_160px_140px_120px] gap-4 border-b border-slate-100 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          <span />
          <span>Task</span>
          <span>Status</span>
          <span>Assignee</span>
          <span>Due date</span>
          <span>Priority</span>
        </div>

        {TASK_STATUSES.map((status) => {
          const items = grouped.get(status.value) ?? [];
          const isCollapsed = collapsed[status.value];
          const meta = STATUS_META[status.value];

          return (
            <div key={status.value} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((current) => ({
                    ...current,
                    [status.value]: !current[status.value],
                  }))
                }
                className="flex w-full items-center gap-2 px-5 py-2.5 text-left transition hover:bg-slate-50"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <span className="text-sm font-semibold text-slate-700">{status.label}</span>
                <span className="text-xs text-slate-400">{items.length}</span>
              </button>

              {!isCollapsed && (
                <div>
                  {items.length === 0 ? (
                    <div className="px-5 py-3 text-xs text-slate-400">No tasks</div>
                  ) : (
                    items.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        meta={meta}
                        subtasks={localSubtasks[task.id] ?? []}
                        isExpanded={expandedTaskId === task.id}
                        onToggleExpanded={() => toggleExpanded(task.id)}
                        onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
                        onAddSubtask={(title) => addSubtask(task.id, title)}
                      />
                    ))
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-5 py-2 text-xs text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New task
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  meta,
  subtasks,
  isExpanded,
  onToggleExpanded,
  onToggleSubtask,
  onAddSubtask,
}: {
  task: TaskWithSubtasks;
  meta: { dot: string; text: string; bg: string };
  subtasks: Subtask[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onAddSubtask: (title: string) => void;
}) {
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const hasSubtasks = subtasks.length > 0;

  return (
    <div className="border-t border-slate-100">
      <div className="grid grid-cols-[24px_minmax(0,1fr)_140px_160px_140px_120px] items-center gap-4 px-5 py-2.5 text-sm transition hover:bg-slate-50">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-slate-800">{task.title}</p>
            {hasSubtasks && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                <Check className="h-3 w-3" />
                {completed}/{subtasks.length}
              </span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
            {initials(task.assignee.name)}
          </span>
          <span className="truncate text-slate-600">{task.assignee.name}</span>
        </div>

        <div className="text-slate-500">{formatDueDate(task.dueDate)}</div>

        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
          <span className="text-slate-600">{PRIORITY_LABEL[task.priority]}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/60 px-5 pb-3 pt-1">
          <div className="ml-6 border-l border-slate-200 pl-4">
            {task.description && (
              <p className="pb-2 pt-1 text-xs text-slate-500">{task.description}</p>
            )}
            {subtasks.length === 0 ? (
              <p className="py-2 text-xs text-slate-400">Tiada sub-task lagi.</p>
            ) : (
              <ul className="space-y-0.5 py-1">
                {subtasks.map((subtask) => (
                  <li key={subtask.id}>
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(subtask.id)}
                      className="group flex w-full items-center gap-2 rounded py-1 pr-2 text-left transition hover:bg-white"
                    >
                      <span
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                          subtask.isCompleted
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {subtask.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span
                        className={`text-sm ${
                          subtask.isCompleted
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <AddSubtaskInput onAdd={onAddSubtask} />
          </div>
        </div>
      )}
    </div>
  );
}

function AddSubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <Plus className="h-3.5 w-3.5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
        placeholder="Tambah sub-task"
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}
