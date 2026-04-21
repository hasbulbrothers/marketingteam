"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Shield, ShieldCheck, UserX } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CurrentUserProfile } from "@/types/user";

type UserRow = {
  _id: Id<"users">;
  name: string;
  email: string;
  role: "admin" | "team";
  jobTitle: string;
  department: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: number;
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function UserManagement() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(api.users.queries.getCurrentUser, isAuthed ? {} : "skip") as CurrentUserProfile | null | undefined;
  const users = useQuery(api.users.queries.getUsers, isAuthed ? {} : "skip") as UserRow[] | undefined;
  const updateRole = useMutation(api.users.mutations.updateUserRole);
  const deactivateUser = useMutation(api.users.mutations.deactivateUser);

  const isAdmin = currentUser?.role === "admin";

  if (!isAuthed || currentUser === undefined || users === undefined) {
    return <p className="text-sm text-slate-400">Loading users…</p>;
  }

  if (currentUser === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
        <Shield className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">User profile not found</p>
        <p className="mt-1 text-xs text-slate-400">Your account has not been synced yet. Try refreshing the page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
        <Shield className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">Admin access required</p>
        <p className="mt-1 text-xs text-slate-400">Logged in as {currentUser.email} ({currentUser.role}). Only admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Users & Roles</h2>
          <p className="text-sm text-slate-400">{users.length} registered users</p>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <MobileUserCard
            key={String(user._id)}
            user={user}
            isSelf={currentUser?.id === String(user._id)}
            onChangeRole={async (role) => {
              try { await updateRole({ userId: user._id, role }); toast.success("Role updated"); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update role"); }
            }}
            onDeactivate={async () => {
              try { await deactivateUser({ userId: user._id }); toast.success("User deactivated"); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Failed to deactivate user"); }
            }}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_120px_100px_120px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          <span>Name</span>
          <span>Email</span>
          <span>Job Title</span>
          <span>Role</span>
          <span>Actions</span>
        </div>
        {users.map((user) => (
          <DesktopUserRow
            key={String(user._id)}
            user={user}
            isSelf={currentUser?.id === String(user._id)}
            onChangeRole={async (role) => {
              try { await updateRole({ userId: user._id, role }); toast.success("Role updated"); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update role"); }
            }}
            onDeactivate={async () => {
              try { await deactivateUser({ userId: user._id }); toast.success("User deactivated"); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Failed to deactivate user"); }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MobileUserCard({ user, isSelf, onChangeRole, onDeactivate }: {
  user: UserRow; isSelf: boolean;
  onChangeRole: (role: "admin" | "team") => Promise<void>;
  onDeactivate: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <RoleBadge role={user.role} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{user.jobTitle} · {user.department}</p>
      {!isSelf && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm" variant="outline" className="flex-1 gap-1.5 text-xs"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onChangeRole(user.role === "admin" ? "team" : "admin");
              setBusy(false);
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {user.role === "admin" ? "Set as Team" : "Set as Admin"}
          </Button>
          <Button
            size="sm" variant="ghost" className="text-xs text-red-500 hover:text-red-600"
            disabled={busy}
            onClick={async () => {
              if (!confirm(`Deactivate ${user.name}?`)) return;
              setBusy(true); await onDeactivate(); setBusy(false);
            }}
          >
            <UserX className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function DesktopUserRow({ user, isSelf, onChangeRole, onDeactivate }: {
  user: UserRow; isSelf: boolean;
  onChangeRole: (role: "admin" | "team") => Promise<void>;
  onDeactivate: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_120px_100px_120px] items-center gap-4 border-t border-slate-100 px-5 py-3 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
          {initials(user.name)}
        </span>
        <span className="truncate font-medium text-slate-800">{user.name}</span>
      </div>
      <span className="truncate text-slate-500">{user.email}</span>
      <span className="text-slate-500">{user.jobTitle}</span>
      <RoleBadge role={user.role} />
      <div className="flex items-center gap-1">
        {!isSelf && (
          <>
            <Button
              size="sm" variant="ghost" className="text-xs"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onChangeRole(user.role === "admin" ? "team" : "admin");
                setBusy(false);
              }}
            >
              {user.role === "admin" ? "→ Team" : "→ Admin"}
            </Button>
            <Button
              size="icon-sm" variant="ghost"
              disabled={busy}
              onClick={async () => {
                if (!confirm(`Deactivate ${user.name}?`)) return;
                setBusy(true); await onDeactivate(); setBusy(false);
              }}
            >
              <UserX className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
        {isSelf && <span className="text-xs text-slate-400">You</span>}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: "admin" | "team" }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
      role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
    }`}>
      {role}
    </span>
  );
}
