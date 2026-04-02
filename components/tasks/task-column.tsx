"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "@/components/tasks/task-card";
import { StatusOption } from "@/lib/constants/task-status";
import { MarketingTask } from "@/types/task";

export function TaskColumn({
  status,
  tasks,
  onSelectTask,
}: {
  status: StatusOption;
  tasks: MarketingTask[];
  onSelectTask: (task: MarketingTask) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status.value });

  return (
    <section ref={setNodeRef} className="premium-card min-h-[420px] border-none bg-white p-4" data-over={isOver}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{status.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{status.description}</p>
        </div>
        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 rounded-[24px] transition-colors data-[over=true]:bg-teal-50/70 data-[over=true]:p-2" data-over={isOver}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
        ))}
      </div>
    </section>
  );
}
