import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isPast, isValid } from "date-fns";
import { hu } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (!isValid(d)) return "";
  if (isToday(d)) return "Ma";
  if (isTomorrow(d)) return "Holnap";
  return format(d, "MMM d.", { locale: hu });
}

export function isDueDateOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (!isValid(d)) return false;
  return isPast(d) && !isToday(d);
}

export function isDueDateSoon(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (!isValid(d)) return false;
  return isToday(d) || isTomorrow(d);
}

export const PRIORITY_CONFIG = {
  LOW: {
    label: "Alacsony",
    color: "text-slate-500",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Közepes",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  HIGH: {
    label: "Magas",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  URGENT: {
    label: "Sürgős",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
} as const;
