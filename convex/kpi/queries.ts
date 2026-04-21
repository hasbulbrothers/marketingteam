import { queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { requireAuthenticated } from "../lib/auth";

type KpiTargetDoc = {
  _id: unknown;
  scope: "team" | "user";
  teamId?: unknown;
  userId?: unknown;
  metric:
    | "tasks_completed"
    | "tasks_on_time"
    | "posts_published"
    | "average_lead_time_days";
  target: number;
  period: "weekly" | "monthly" | "quarterly";
  startDate: string;
  endDate: string;
  platform?: string;
  label?: string;
  isActive: boolean;
};

type TaskDoc = {
  _id: unknown;
  status: string;
  platform: string;
  assigneeId?: unknown;
  dueDate?: string;
  publishedAt?: string;
  createdAt: number;
  isArchived: boolean;
};

const MS_PER_DAY = 86_400_000;
const PUBLISHED_STATUSES = ["published", "scheduled"];

function parseDateStart(value: string) {
  return new Date(`${value}T00:00:00.000Z`).getTime();
}

function parseDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999Z`).getTime();
}

function computeActual(
  kpi: KpiTargetDoc,
  tasks: TaskDoc[],
  memberIds: Set<string>,
): number {
  const rangeStart = parseDateStart(kpi.startDate);
  const rangeEnd = parseDateEnd(kpi.endDate);

  const scoped = tasks.filter((task) => {
    if (task.isArchived) return false;
    if (kpi.platform && task.platform !== kpi.platform) return false;

    if (kpi.scope === "user") {
      return String(task.assigneeId ?? "") === String(kpi.userId ?? "");
    }
    return memberIds.has(String(task.assigneeId ?? ""));
  });

  const withinRange = scoped.filter((task) => {
    const ref = task.publishedAt
      ? parseDateStart(task.publishedAt)
      : task.createdAt;
    return ref >= rangeStart && ref <= rangeEnd;
  });

  switch (kpi.metric) {
    case "tasks_completed": {
      return withinRange.filter((t) =>
        PUBLISHED_STATUSES.includes(t.status),
      ).length;
    }
    case "posts_published": {
      return withinRange.filter((t) => t.status === "published").length;
    }
    case "tasks_on_time": {
      return withinRange.filter((t) => {
        if (t.status !== "published") return false;
        if (!t.dueDate || !t.publishedAt) return false;
        return (
          parseDateStart(t.publishedAt) <= parseDateEnd(t.dueDate)
        );
      }).length;
    }
    case "average_lead_time_days": {
      const completed = withinRange.filter(
        (t) => t.status === "published" && t.publishedAt,
      );
      if (completed.length === 0) return 0;
      const totalDays = completed.reduce((sum, t) => {
        const days =
          (parseDateStart(t.publishedAt as string) - t.createdAt) / MS_PER_DAY;
        return sum + Math.max(0, days);
      }, 0);
      return Math.round((totalDays / completed.length) * 10) / 10;
    }
    default:
      return 0;
  }
}

function serializeKpi(
  kpi: KpiTargetDoc,
  teamName?: string,
  userName?: string,
  actual = 0,
) {
  const lowerIsBetter = kpi.metric === "average_lead_time_days";
  const progress = lowerIsBetter
    ? kpi.target > 0 && actual > 0
      ? Math.min(100, Math.round((kpi.target / actual) * 100))
      : 0
    : kpi.target > 0
      ? Math.min(100, Math.round((actual / kpi.target) * 100))
      : 0;
  const achieved = lowerIsBetter ? actual <= kpi.target : actual >= kpi.target;

  return {
    id: String(kpi._id),
    scope: kpi.scope,
    teamId: kpi.teamId ? String(kpi.teamId) : null,
    userId: kpi.userId ? String(kpi.userId) : null,
    teamName: teamName ?? null,
    userName: userName ?? null,
    metric: kpi.metric,
    target: kpi.target,
    actual,
    progress,
    achieved,
    period: kpi.period,
    startDate: kpi.startDate,
    endDate: kpi.endDate,
    platform: kpi.platform ?? null,
    label: kpi.label ?? null,
    isActive: kpi.isActive,
  };
}

export const listKpiTargets = query({
  args: {
    includeInactive: v.optional(v.boolean()),
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    let kpisRaw: KpiTargetDoc[];
    if (args.teamId) {
      kpisRaw = (await ctx.db
        .query("kpiTargets")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .collect()) as KpiTargetDoc[];
    } else if (args.userId) {
      kpisRaw = (await ctx.db
        .query("kpiTargets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect()) as KpiTargetDoc[];
    } else {
      kpisRaw = (await ctx.db.query("kpiTargets").collect()) as KpiTargetDoc[];
    }

    const kpis = args.includeInactive
      ? kpisRaw
      : kpisRaw.filter((k) => k.isActive);

    const [teams, users, tasks] = await Promise.all([
      ctx.db.query("teams").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("tasks").collect(),
    ]);

    const teamMap = new Map(teams.map((t) => [String(t._id), t]));
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    return kpis
      .map((kpi) => {
        const memberIds = new Set<string>();
        if (kpi.scope === "team" && kpi.teamId) {
          const teamIdStr = String(kpi.teamId);
          for (const u of users) {
            if (String(u.teamId ?? "") === teamIdStr && u.isActive) {
              memberIds.add(String(u._id));
            }
          }
        }

        const actual = computeActual(kpi, tasks as TaskDoc[], memberIds);
        const teamName =
          kpi.teamId !== undefined
            ? teamMap.get(String(kpi.teamId))?.name
            : undefined;
        const userName =
          kpi.userId !== undefined
            ? userMap.get(String(kpi.userId))?.name
            : undefined;

        return serializeKpi(kpi, teamName, userName, actual);
      })
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
  },
});

export const getSubtaskProgress = query({
  args: { teamId: v.optional(v.id("teams")) },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    const [users, allTasks] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("tasks").collect(),
    ]);

    const activeUsers = users.filter((u) => u.isActive);
    const filtered = args.teamId
      ? activeUsers.filter((u) => String(u.teamId ?? "") === String(args.teamId))
      : activeUsers;

    const tasks = allTasks.filter((t) => !t.isArchived && t.status !== "archived");

    type SubtaskItem = { id: string; title: string; isCompleted: boolean };

    return filtered.map((user) => {
      const userTasks = tasks.filter((t) => String(t.assigneeId ?? "") === String(user._id));
      let total = 0;
      let completed = 0;
      for (const task of userTasks) {
        const subtasks = (task.subtasks as SubtaskItem[] | undefined) ?? [];
        total += subtasks.length;
        completed += subtasks.filter((s) => s.isCompleted).length;
      }
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        userId: String(user._id),
        userName: user.name as string,
        teamId: user.teamId ? String(user.teamId) : null,
        totalSubtasks: total,
        completedSubtasks: completed,
        progress,
        taskCount: userTasks.length,
      };
    }).filter((u) => u.totalSubtasks > 0)
      .sort((a, b) => b.progress - a.progress);
  },
});

export const getTeamKpiSummary = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireAuthenticated(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const [kpisAll, members, tasks] = await Promise.all([
      ctx.db
        .query("kpiTargets")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .collect(),
      ctx.db.query("tasks").collect(),
    ]);

    const kpisRaw = kpisAll.filter((k) => k.isActive);

    const memberIds = new Set(
      members.filter((m) => m.isActive).map((m) => String(m._id)),
    );

    const kpis = (kpisRaw as KpiTargetDoc[]).map((kpi) => {
      const actual = computeActual(kpi, tasks as TaskDoc[], memberIds);
      return serializeKpi(kpi, team.name, undefined, actual);
    });

    const totalTargets = kpis.length;
    const achievedTargets = kpis.filter((k) => k.achieved).length;
    const averageProgress =
      totalTargets > 0
        ? Math.round(
            kpis.reduce((sum, k) => sum + k.progress, 0) / totalTargets,
          )
        : 0;

    type SubtaskItem = { id: string; title: string; isCompleted: boolean };
    const memberSubtaskProgress = members
      .filter((m) => m.isActive)
      .map((member) => {
        const userTasks = (tasks as TaskDoc[]).filter(
          (t) => !t.isArchived && String(t.assigneeId ?? "") === String(member._id),
        );
        let total = 0;
        let completed = 0;
        for (const task of userTasks) {
          const subtasks = ((task as unknown as { subtasks?: SubtaskItem[] }).subtasks) ?? [];
          total += subtasks.length;
          completed += subtasks.filter((s) => s.isCompleted).length;
        }
        return {
          userId: String(member._id),
          userName: member.name as string,
          totalSubtasks: total,
          completedSubtasks: completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
      .filter((m) => m.totalSubtasks > 0)
      .sort((a, b) => b.progress - a.progress);

    const teamTotalSubtasks = memberSubtaskProgress.reduce((s, m) => s + m.totalSubtasks, 0);
    const teamCompletedSubtasks = memberSubtaskProgress.reduce((s, m) => s + m.completedSubtasks, 0);
    const teamSubtaskProgress = teamTotalSubtasks > 0
      ? Math.round((teamCompletedSubtasks / teamTotalSubtasks) * 100)
      : 0;

    return {
      teamId: String(team._id),
      teamName: team.name,
      totalTargets,
      achievedTargets,
      averageProgress,
      kpis,
      subtaskProgress: {
        total: teamTotalSubtasks,
        completed: teamCompletedSubtasks,
        progress: teamSubtaskProgress,
        members: memberSubtaskProgress,
      },
    };
  },
});
