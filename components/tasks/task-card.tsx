"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskAssigneeAvatar } from "@/components/tasks/task-assignee-avatar";
import { PRIORITY_STYLES } from "@/lib/constants/task-priority";
import { formatDueDate } from "@/lib/utils/date";
import { MarketingTask } from "@/types/task";

export function TaskCard({ task, onClick }: { task: MarketingTask; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      className="premium-card w-full border-none p-5 text-left data-[dragging=true]:opacity-75"
      data-dragging={isDragging}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge className={PRIORITY_STYLES[task.priority]}>{task.priority}</Badge>
          <Badge className="rounded-lg border-0 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600" variant="secondary">
            {task.platform}
          </Badge>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-slate-800">{task.title}</p>
          <p className="mt-2 line-clamp-2 text-[12px] leading-6 text-slate-500">{task.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <TaskAssigneeAvatar assignee={task.assignee} />
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
