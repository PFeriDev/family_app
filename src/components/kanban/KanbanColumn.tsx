"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "./KanbanCard";
import { CardCount } from "@/components/widgets/CardCount";
import { ColorDot } from "@/components/widgets/ColorDot";
import { EmptyColumnPlaceholder } from "@/components/widgets/EmptyColumnPlaceholder";
import { cn } from "@/lib/utils";
import type { Card, Column, Tag } from "@/types";

interface KanbanColumnProps {
  column: Column;
  availableTags: Tag[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  availableTags,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      className={cn(
        "flex h-full w-72 flex-shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors",
        isOver && "bg-primary/5 border-primary/30"
      )}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between rounded-t-xl px-3 py-2.5"
        style={{ borderBottom: `2px solid ${column.color}33` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ColorDot color={column.color} />
          <h3 className="truncate text-sm font-semibold">{column.title}</h3>
          <CardCount count={column.cards.length} />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setShowColumnMenu(true)}
          onMouseLeave={() => setShowColumnMenu(false)}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {showColumnMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border bg-popover shadow-md animate-fade-in">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-t-md"
                onClick={() => { onEditColumn(column); setShowColumnMenu(false); }}
              >
                <Pencil className="h-3.5 w-3.5" /> Szerkesztés
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-b-md"
                onClick={() => { onDeleteColumn(column.id); setShowColumnMenu(false); }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Törlés
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
        style={{ minHeight: "60px" }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {column.cards.length === 0 && (
          <EmptyColumnPlaceholder onAddCard={() => onAddCard(column.id)} />
        )}
      </div>

      {/* Add card button */}
      <div className="p-2 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => onAddCard(column.id)}
        >
          <Plus className="h-4 w-4" />
          Kártya hozzáadása
        </Button>
      </div>
    </div>
  );
}
