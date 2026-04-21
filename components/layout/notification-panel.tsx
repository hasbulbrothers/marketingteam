"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Bell, CheckCheck, MessageSquare, ShieldCheck, UserPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const notifApi = api.notifications;
const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type Notification = {
  _id: Id<"notifications">;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
  senderName: string;
};

const ICONS: Record<string, typeof Bell> = {
  task_assigned: UserPlus,
  task_status_changed: Bell,
  task_commented: MessageSquare,
  role_changed: ShieldCheck,
};

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const enabled = hasConvex && hasClerk;
  const unreadCount = useQuery(notifApi.queries.getUnreadCount, enabled && isAuthed ? {} : "skip");
  const [open, setOpen] = useState(false);

  if (!enabled) {
    return null;
  }

  return (
    <div className="relative">
      <button
        className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-400 transition-colors hover:text-slate-700 sm:p-3"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount! > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <NotificationDropdown onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const notifications = useQuery(notifApi.queries.getMyNotifications, isAuthed ? {} : "skip");
  const markAsRead = useMutation(notifApi.mutations.markAsRead);
  const markAllAsRead = useMutation(notifApi.mutations.markAllAsRead);

  const items = notifications as Notification[] | undefined;
  const hasUnread = items?.some((n: Notification) => !n.isRead);

  return (
    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg sm:w-96">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
        {hasUnread && (
          <button
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
            onClick={async () => {
              try { await markAllAsRead({}); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Failed to mark as read"); }
            }}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {!items || items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto h-8 w-8 text-slate-200" />
            <p className="mt-2 text-sm text-slate-400">No notifications yet</p>
          </div>
        ) : (
          items.map((n: Notification) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <button
                key={String(n._id)}
                className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                  !n.isRead ? "bg-primary/[0.03]" : ""
                }`}
                onClick={async () => {
                  try {
                    if (!n.isRead) await markAsRead({ notificationId: n._id as Id<"notifications"> });
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to mark as read");
                  }
                  onClose();
                }}
              >
                <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  !n.isRead ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.isRead ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-300">{n.senderName} · {timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
