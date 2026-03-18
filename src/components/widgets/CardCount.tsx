import { cn } from "@/lib/utils";

interface CardCountProps {
  count: number;
  className?: string;
}

export function CardCount({ count, className }: CardCountProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold text-muted-foreground",
        className
      )}
    >
      {count}
    </span>
  );
}
