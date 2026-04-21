"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { TeamFormFields, COLOR_PRESETS } from "./team-form-fields";
import type { TeamSummary, UserSummary } from "./team-form-fields";

export function CreateTeamDialog({ users }: { users: UserSummary[] }) {
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
      setName(""); setDescription(""); setColor(COLOR_PRESETS[0]); setLeaderId("");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}><Plus className="h-4 w-4" />New team</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create team</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TeamFormFields name={name} setName={setName} description={description} setDescription={setDescription} color={color} setColor={setColor} leaderId={leaderId} setLeaderId={setLeaderId} users={users} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !name.trim()}>{submitting ? "Creating…" : "Create team"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTeamDialog({ team, users }: { team: TeamSummary; users: UserSummary[] }) {
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
        teamId: team.id as Id<"teams">, name: name.trim(),
        description: description.trim() || undefined, color,
        leaderId: leaderId ? (leaderId as Id<"users">) : undefined,
      });
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Edit team" />}><Pencil className="h-4 w-4" /></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit team</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TeamFormFields name={name} setName={setName} description={description} setDescription={setDescription} color={color} setColor={setColor} leaderId={leaderId} setLeaderId={setLeaderId} users={users} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !name.trim()}>{submitting ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTeamButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const deleteTeam = useMutation(api.teams.mutations.deleteTeam);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete team "${teamName}"? Members will be unassigned.`)) return;
    setBusy(true);
    try {
      await deleteTeam({ teamId: teamId as Id<"teams"> });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="icon-sm" variant="ghost" aria-label="Delete team" onClick={handleDelete} disabled={busy}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}

export function ManageMembersDialog({ teamId, teamName, members, availableUsers }: {
  teamId: string; teamName: string; members: UserSummary[]; availableUsers: UserSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const assignUser = useMutation(api.teams.mutations.assignUserToTeam);

  const handleAdd = async (userId: Id<"users">) => {
    setPendingId(String(userId));
    try { await assignUser({ userId, teamId: teamId as Id<"teams"> }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to assign user"); }
    finally { setPendingId(null); }
  };

  const handleRemove = async (userId: Id<"users">) => {
    setPendingId(String(userId));
    try { await assignUser({ userId, teamId: null }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to remove user"); }
    finally { setPendingId(null); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full gap-2" />}><Users className="h-4 w-4" />Manage members</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{teamName} — members</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current members ({members.length})</p>
            {members.length === 0 ? <p className="text-sm text-slate-400">No members yet.</p> : (
              <ul className="space-y-1">
                {members.map((u) => (
                  <li key={String(u._id)} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.jobTitle}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(u._id)} disabled={pendingId === String(u._id)}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Available users ({availableUsers.length})</p>
            {availableUsers.length === 0 ? <p className="text-sm text-slate-400">Everyone is already assigned to a team.</p> : (
              <ul className="max-h-60 space-y-1 overflow-y-auto">
                {availableUsers.map((u) => (
                  <li key={String(u._id)} className="flex items-center justify-between rounded-md bg-white px-3 py-2 ring-1 ring-slate-100">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.jobTitle}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAdd(u._id)} disabled={pendingId === String(u._id)}>Add</Button>
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
