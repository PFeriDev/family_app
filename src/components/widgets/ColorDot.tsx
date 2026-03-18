import { cn } from "@/lib/utils";

interface ColorDotProps {
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorDot({ color, size = "md", className }: ColorDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        size === "sm" && "h-2 w-2",
        size === "md" && "h-2.5 w-2.5",
        size === "lg" && "h-3 w-3",
        className
      )}
      style={{ backgroundColor: color }}
    />
  );
}
