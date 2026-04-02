import { CalendarRange, FolderKanban, House, Images, Users } from "lucide-react";

export const navigationItems = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/tasks", label: "Tasks", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/team", label: "Team", icon: Users },
  { href: "/assets", label: "Assets", icon: Images },
];
