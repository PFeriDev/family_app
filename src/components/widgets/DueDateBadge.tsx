import { Calendar } from "lucide-react";
import { cn, formatDueDate, isDueDateOverdue, isDueDateSoon } from "@/lib/utils";

interface DueDateBadgeProps {
  dueDate: Date | string | null | undefined;
  className?: string;
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  if (!dueDate) return null;
  const overdue = isDueDateOverdue(dueDate);
  const soon = isDueDateSoon(dueDate);
  const label = formatDueDate(dueDate);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
        overdue
          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:border-red-800"
          : soon
          ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
          : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
        className
      )}
    >
      <Calendar className="h-3 w-3" />
      {label}
    </span>
  );
}
