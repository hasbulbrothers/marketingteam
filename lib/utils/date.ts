import { format, formatDistanceToNowStrict, isBefore, parseISO } from "date-fns";

export function formatDueDate(value: string | null) {
  if (!value) return "No due date";
  const date = parseISO(value);
  const prefix = isBefore(date, new Date()) ? "Overdue" : "Due";
  return `${prefix} ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function formatDisplayDate(value: string | null) {
  if (!value) return "—";
  return format(parseISO(value), "dd MMM yyyy");
}
