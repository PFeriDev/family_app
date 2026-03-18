import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Columns3, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      columns: {
        include: { _count: { select: { cards: true } } },
      },
    },
  });

  const totalCards = (board: (typeof boards)[0]) => board.columns.reduce((sum, col) => sum + col._count.cards, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Columns3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Feladat táblák (kanbanboard)</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Táblák</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Összesen {boards.length} tábla van · Válassz egyet vagy hozz létre újat
            </p>
          </div>
          <CreateBoardButton />
        </div>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
            <Columns3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Még nincs egyetlen tábla sem. Hozd létre az elsőt!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <div
                    className="h-9 w-9 rounded-lg"
                    style={{ backgroundColor: board.color + "33", border: `1.5px solid ${board.color}55` }}>
                    <div className="flex h-full items-center justify-center">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} />
                    </div>
                  </div>
                </div>

                <h2 className="mt-3 font-semibold group-hover:text-primary transition-colors">{board.title}</h2>
                {board.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{board.description}</p>
                )}

                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{board.columns.length} oszlop</span>
                  <span>·</span>
                  <span>{totalCards(board)} kártya</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(board.createdAt), "MMM d.", { locale: hu })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CreateBoardButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma } = await import("@/lib/prisma");
        const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const board = await prisma.board.create({
          data: { title: "Új tábla", color },
        });
      }}>
      <Link
        href="/boards/new"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" />
        Új tábla
      </Link>
    </form>
  );
}
