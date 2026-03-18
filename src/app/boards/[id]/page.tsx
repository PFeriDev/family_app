"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Columns3 } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorDot } from "@/components/widgets/ColorDot";
import type { Board, Tag } from "@/types";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    const [boardRes, tagsRes] = await Promise.all([
      fetch(`/api/boards/${id}`),
      fetch("/api/tags"),
    ]);
    if (!boardRes.ok) { router.push("/"); return; }
    const [boardData, tagsData] = await Promise.all([
      boardRes.json(),
      tagsRes.json(),
    ]);
    setBoard(boardData);
    setTags(tagsData);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <ColorDot color={board.color} size="lg" />
              <h1 className="font-semibold">{board.title}</h1>
              {board.description && (
                <span className="hidden text-sm text-muted-foreground sm:block">
                  — {board.description}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard board={board} availableTags={tags} onRefresh={fetchBoard} />
      </div>
    </div>
  );
}
