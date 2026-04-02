import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeamMember } from "@/types/user";

export function TaskAssigneeAvatar({ assignee }: { assignee: TeamMember }) {
  const initials = assignee.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7 border border-border">
        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span>{assignee.name}</span>
    </div>
  );
}
