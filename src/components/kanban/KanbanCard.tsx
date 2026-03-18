"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/widgets/PriorityBadge";
import { DueDateBadge } from "@/components/widgets/DueDateBadge";
import { TagChip } from "@/components/widgets/TagChip";
import { cn } from "@/lib/utils";
import type { Card } from "@/types";

interface KanbanCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export function KanbanCard({ card, onEdit, onDelete }: KanbanCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card p-3 shadow-sm transition-all",
        "hover:shadow-md hover:border-primary/30",
        isDragging && "opacity-50 shadow-lg rotate-1 scale-105"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div {...attributes} {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className={cn("absolute right-1.5 top-1.5 flex gap-0.5 transition-opacity", showActions ? "opacity-100" : "opacity-0")}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(card)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(card.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="pl-4">
        <p className="text-sm font-medium leading-snug pr-12">{card.title}</p>
        {card.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{card.description}</p>
        )}

        {card.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.tags.map((tag) => <TagChip key={tag.id} tag={tag} />)}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={card.priority} showLabel={false} />
            <DueDateBadge dueDate={card.dueDate} />
          </div>

          {/* Assignees */}
          {card.assignees?.length > 0 && (
            <div className="flex -space-x-1.5">
              {card.assignees.slice(0, 3).map((person) => (
                <div key={person.id} className="h-5 w-5 rounded-full border-2 border-card overflow-hidden bg-muted flex items-center justify-center"
                  title={person.name}>
                  {person.avatarUrl ? (
                    <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
              {card.assignees.length > 3 && (
                <div className="h-5 w-5 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                  <span className="text-[9px] font-medium">+{card.assignees.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
