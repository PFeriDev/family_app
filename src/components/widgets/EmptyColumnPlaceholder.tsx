import { Plus } from "lucide-react";

interface EmptyColumnPlaceholderProps {
  onAddCard?: () => void;
}

export function EmptyColumnPlaceholder({ onAddCard }: EmptyColumnPlaceholderProps) {
  return (
    <button
      onClick={onAddCard}
      className="w-full rounded-lg border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Kártya hozzáadása
    </button>
  );
}
