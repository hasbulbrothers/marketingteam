"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrentUserProfile } from "@/types/user";

const COLOR_PRESETS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  memberCount: number;
  leader: { id: string; name: string; email: string } | null;
};

type UserSummary = {
  _id: Id<"users">;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  teamId?: Id<"teams">;
  isActive: boolean;
};

export function TeamsManagement() {
  const { isLoaded, userId } = useAuth();
  const isAuthed = Boolean(isLoaded && userId);
  const currentUser = useQuery(
    api.users.queries.getCurrentUser,
    isAuthed ? {} : "skip",
  ) as CurrentUserProfile | null | undefined;

  const isAdmin = currentUser?.role === "admin";

  const teams = useQuery(
    api.teams.queries.listTeams,
    isAdmin ? {} : "skip",
  ) as TeamSummary[] | undefined;

  const users = useQuery(
    api.users.queries.getUsers,
    isAdmin ? {} : "skip",
  ) as UserSummary[] | undefined;

  if (!isAdmin) return null;

  return (
    <Card className="premium-card border-none p-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Teams
          </CardTitle>
          <p className="text-sm text-slate-400">
            Group members into teams to measure KPI achievement per team.
          </p>
        </div>
        <CreateTeamDialog users={users ?? []} />
      </CardHeader>
      <CardContent className="mt-6 p-0">
        {!teams ? (
          <p className="text-sm text-slate-400">Loading teams…</p>
        ) : teams.length === 0 ? (
          <div className="rounded-[24px] bg-background px-6 py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No teams yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Create your first team to start grouping members.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                users={users ?? []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamCard({
  team,
  users,
}: {
  team: TeamSummary;
  users: UserSummary[];
}) {
  const members = users.filter((u) => String(u.teamId) === team.id);
  const color = team.color ?? "#64748b";

  return (
    <div className="rounded-[24px] bg-background px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="mt-1 h-3 w-3 flex-none rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {team.name}
            </p>
            {team.description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {team.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditTeamDialog team={team} users={users} />
          <DeleteTeamButton teamId={team.id} teamName={team.name} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400">Members</p>
          <p className="text-sm font-semibold text-slate-800">
            {team.memberCount}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Leader</p>
          <p className="truncate text-sm font-semibold text-slate-800">
            {team.leader?.name ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ManageMembersDialog
          teamId={team.id}
          teamName={team.name}
          members={members}
          availableUsers={users.filter((u) => !u.teamId)}
        />
      </div>
    </div>
  );
}

function CreateTeamDialog({ users }: { users: UserSummary[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [leaderId, setLeaderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createTeam = useMutation(api.teams.mutations.createTeam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createTeam({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        leaderId: leaderId ? (leaderId as Id<"users">) : undefined,
      });
      setName("");
      setDescription("");
      setColor(COLOR_PRESETS[0]);
      setLeaderId("");
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New team
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TeamFormFields
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            color={color}
            setColor={setColor}
            leaderId={leaderId}
            setLeaderId={setLeaderId}
            users={users}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating…" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDialog({
  team,
  users,
}: {
  team: TeamSummary;
  users: UserSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [color, setColor] = useState(team.color ?? COLOR_PRESETS[0]);
  const [leaderId, setLeaderId] = useState(team.leader?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const updateTeam = useMutation(api.teams.mutations.updateTeam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await updateTeam({
        teamId: team.id as Id<"teams">,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        leaderId: leaderId ? (leaderId as Id<"users">) : undefined,
      });
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label="Edit team" />
        }
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TeamFormFields
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            color={color}
            setColor={setColor}
            leaderId={leaderId}
            setLeaderId={setLeaderId}
            users={users}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamFormFields({
  name,
  setName,
  description,
  setDescription,
  color,
  setColor,
  leaderId,
  setLeaderId,
  users,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  leaderId: string;
  setLeaderId: (v: string) => void;
  users: UserSummary[];
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">
          Team name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Content Team"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this team own?"
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition ${
                color === c ? "border-slate-900" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Pick color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">
          Team leader
        </label>
        <select
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">No leader</option>
          {users.map((u) => (
            <option key={String(u._id)} value={String(u._id)}>
              {u.name} — {u.jobTitle}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function DeleteTeamButton({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const deleteTeam = useMutation(api.teams.mutations.deleteTeam);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete team "${teamName}"? Members will be unassigned.`))
      return;
    setBusy(true);
    try {
      await deleteTeam({ teamId: teamId as Id<"teams"> });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Delete team"
      onClick={handleDelete}
      disabled={busy}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}

function ManageMembersDialog({
  teamId,
  teamName,
  members,
  availableUsers,
}: {
  teamId: string;
  teamName: string;
  members: UserSummary[];
  availableUsers: UserSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const assignUser = useMutation(api.teams.mutations.assignUserToTeam);

  const handleAdd = async (userId: Id<"users">) => {
    setPendingId(String(userId));
    try {
      await assignUser({ userId, teamId: teamId as Id<"teams"> });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign user");
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (userId: Id<"users">) => {
    setPendingId(String(userId));
    try {
      await assignUser({ userId, teamId: null });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="w-full gap-2" />}
      >
        <Users className="h-4 w-4" />
        Manage members
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{teamName} — members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current members ({members.length})
            </p>
            {members.length === 0 ? (
              <p className="text-sm text-slate-400">No members yet.</p>
            ) : (
              <ul className="space-y-1">
                {members.map((u) => (
                  <li
                    key={String(u._id)}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {u.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {u.jobTitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(u._id)}
                      disabled={pendingId === String(u._id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Available users ({availableUsers.length})
            </p>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-slate-400">
                Everyone is already assigned to a team.
              </p>
            ) : (
              <ul className="max-h-60 space-y-1 overflow-y-auto">
                {availableUsers.map((u) => (
                  <li
                    key={String(u._id)}
                    className="flex items-center justify-between rounded-md bg-white px-3 py-2 ring-1 ring-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {u.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {u.jobTitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAdd(u._id)}
                      disabled={pendingId === String(u._id)}
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
