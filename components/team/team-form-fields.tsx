"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";

const COLOR_PRESETS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6",
];

export type UserSummary = {
  _id: Id<"users">;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  teamId?: Id<"teams">;
  isActive: boolean;
};

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  memberCount: number;
  leader: { id: string; name: string; email: string } | null;
};

export { COLOR_PRESETS };

export function TeamFormFields({
  name, setName, description, setDescription,
  color, setColor, leaderId, setLeaderId, users,
}: {
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  color: string; setColor: (v: string) => void;
  leaderId: string; setLeaderId: (v: string) => void;
  users: UserSummary[];
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Team name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Content Team" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this team own?" rows={2} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c} type="button" onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition ${color === c ? "border-slate-900" : "border-transparent"}`}
              style={{ backgroundColor: c }} aria-label={`Pick color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Team leader</label>
        <select
          value={leaderId} onChange={(e) => setLeaderId(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">No leader</option>
          {users.map((u) => (
            <option key={String(u._id)} value={String(u._id)}>{u.name} — {u.jobTitle}</option>
          ))}
        </select>
      </div>
    </>
  );
}
