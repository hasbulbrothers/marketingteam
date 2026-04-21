"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { CurrentUserProfile } from "@/types/user";

const adminApi = api.admin;

type ActivityChange = { field: string; before: unknown; after: unknown };

type ActivityLog = {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  changes: ActivityChange[] | null;
  createdAt: number;
  user: { name: string; avatarUrl: string | null };
};

const entityFilters = [
  { label: "All", value: undefined },
  { label: "Tasks", value: "task" },
  { label: "Campaigns", value: "campaign" },
  { label: "Users", value: "user" },
  { label: "Teams", value: "team" },
] as const;

const actionLabels: Record<string, string> = {
  "task.created": "created task",
  "task.updated": "updated task",
  "task.deleted": "archived task",
  "task.status_changed": "changed status of",
  "task.assigned": "assigned",
  "campaign.created": "created campaign",
  "user.role_changed": "changed role of",
  "user.deactivated": "deactivated user",
  "team.created": "created team",
  "team.updated": "updated team",
  "team.deleted": "deleted team",
  "team.member_changed": "changed team for",
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

export function ActivityLogView() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as CurrentUserProfile | null | undefined;
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const isAdmin = currentUser?.role === "admin";

  const logs = useQuery(
    adminApi?.queries?.getActivityLogs,
    isAdmin ? { entityType: filter, limit: 50 } : "skip",
  ) as ActivityLog[] | undefined;

  if (!isAuthed || currentUser === undefined) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500">Admin access required to view activity logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {entityFilters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!logs ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading activity...</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No activity recorded yet.</div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <ActivityEntry key={log._id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityEntry({ log }: { log: ActivityLog }) {
  const [expanded, setExpanded] = useState(false);
  const initials = log.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{log.user.name}</span>{" "}
            <span className="text-slate-500">{actionLabels[log.action] ?? log.action}</span>{" "}
            <span className="font-medium text-slate-800">{log.entityName}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{timeAgo(log.createdAt)}</p>

          {log.changes && log.changes.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "Hide changes" : `${log.changes.length} change${log.changes.length > 1 ? "s" : ""}`}
            </button>
          )}

          {expanded && log.changes && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Field</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Before</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">After</th>
                  </tr>
                </thead>
                <tbody>
                  {log.changes.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-600">{c.field}</td>
                      <td className="px-3 py-2 text-red-500">{formatValue(c.before)}</td>
                      <td className="px-3 py-2 text-green-600">{formatValue(c.after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
