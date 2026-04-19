import { BarChart3, CalendarRange, FolderKanban, House, Images, ScrollText, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const navigationItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/tasks", label: "Tasks", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/team", label: "Team", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assets", label: "Assets", icon: Images },
  { href: "/activity", label: "Activity Log", icon: ScrollText, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];
