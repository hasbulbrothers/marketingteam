import { format } from "date-fns";
import { TaskComment } from "@/types/comment";

export function TaskComments({ comments }: { comments: TaskComment[] }) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-[24px] bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{comment.author}</p>
              <p className="text-xs text-slate-400">{comment.role}</p>
            </div>
            <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "hh:mm a")}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-500">{comment.message}</p>
        </div>
      ))}
    </div>
  );
}
