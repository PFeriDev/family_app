"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { CardForm } from "./CardForm";
import { ColumnForm } from "./ColumnForm";
import type { Board, Card, Column, Tag, CreateCardInput, UpdateCardInput } from "@/types";

interface KanbanBoardProps {
  board: Board;
  availableTags: Tag[];
  onRefresh: () => void;
}

export function KanbanBoard({ board, availableTags, onRefresh }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Dialog states
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const [columnFormOpen, setColumnFormOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── Card CRUD ──────────────────────────────────────────────────────────────

  const handleAddCard = (columnId: string) => {
    setEditingCard(null);
    setActiveColumnId(columnId);
    setCardFormOpen(true);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setActiveColumnId(null);
    setCardFormOpen(true);
  };

  const handleSaveCard = async (data: CreateCardInput | UpdateCardInput) => {
    if (editingCard) {
      // Update
      await fetch(`/api/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Create
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, columnId: activeColumnId }),
      });
    }
    onRefresh();
  };

  const handleDeleteCard = async (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }))
    );
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    onRefresh();
  };

  // ── Column CRUD ────────────────────────────────────────────────────────────

  const handleAddColumn = () => {
    setEditingColumn(null);
    setColumnFormOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setColumnFormOpen(true);
  };

  const handleSaveColumn = async (data: { title: string; color: string }) => {
    if (editingColumn) {
      await fetch(`/api/columns/${editingColumn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, boardId: board.id }),
      });
    }
    onRefresh();
  };

  const handleDeleteColumn = async (columnId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    onRefresh();
  };

  // ── DnD ───────────────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "card";
    const isOverCard = over.data.current?.type === "card";
    const isOverColumn = over.data.current?.type === "column";

    if (!isActiveCard) return;

    setColumns((cols) => {
      const activeColIdx = cols.findIndex((c) =>
        c.cards.some((card) => card.id === activeId)
      );
      if (activeColIdx === -1) return cols;

      if (isOverCard) {
        const overColIdx = cols.findIndex((c) =>
          c.cards.some((card) => card.id === overId)
        );
        if (overColIdx === -1) return cols;

        const newCols = cols.map((c) => ({ ...c, cards: [...c.cards] }));
        const activeCardIdx = newCols[activeColIdx].cards.findIndex(
          (c) => c.id === activeId
        );
        const overCardIdx = newCols[overColIdx].cards.findIndex(
          (c) => c.id === overId
        );
        const [movedCard] = newCols[activeColIdx].cards.splice(activeCardIdx, 1);
        movedCard.columnId = newCols[overColIdx].id;
        newCols[overColIdx].cards.splice(overCardIdx, 0, movedCard);
        return newCols;
      }

      if (isOverColumn) {
        const overColIdx = cols.findIndex((c) => c.id === overId);
        if (overColIdx === -1 || activeColIdx === overColIdx) return cols;

        const newCols = cols.map((c) => ({ ...c, cards: [...c.cards] }));
        const activeCardIdx = newCols[activeColIdx].cards.findIndex(
          (c) => c.id === activeId
        );
        const [movedCard] = newCols[activeColIdx].cards.splice(activeCardIdx, 1);
        movedCard.columnId = newCols[overColIdx].id;
        newCols[overColIdx].cards.push(movedCard);
        return newCols;
      }

      return cols;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    // Persist new order to DB
    const moves = columns.flatMap((col) =>
      col.cards.map((card, idx) => ({
        id: card.id,
        columnId: col.id,
        order: idx,
      }))
    );

    await fetch("/api/cards/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full items-start gap-4 overflow-x-auto p-4 pb-8">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              availableTags={availableTags}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}

          {/* Add column button */}
          <button
            onClick={handleAddColumn}
            className="flex h-12 w-72 flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            Oszlop hozzáadása
          </button>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 opacity-90">
              <KanbanCard
                card={activeCard}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardForm
        open={cardFormOpen}
        onClose={() => setCardFormOpen(false)}
        onSave={handleSaveCard}
        card={editingCard}
        columnId={activeColumnId ?? undefined}
        availableTags={availableTags}
      />

      <ColumnForm
        open={columnFormOpen}
        onClose={() => setColumnFormOpen(false)}
        onSave={handleSaveColumn}
        column={editingColumn}
      />
    </>
  );
}
