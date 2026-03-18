"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const COLORS = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b",
  "#ec4899", "#ef4444", "#8b5cf6", "#14b8a6",
];

export default function NewBoardPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Új projekt");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, color }),
    });
    const board = await res.json();
    router.push(`/boards/${board.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-6 py-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold">Új tábla létrehozása</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-12">
        <div className="space-y-6 rounded-xl border bg-card p-6">
          <div className="space-y-1.5">
            <Label>Tábla neve</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Projekt Alpha"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Leírás (opcionális)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rövid leírás..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Szín</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-2 ring-foreground" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-lg p-4 flex items-center gap-3"
            style={{ backgroundColor: color + "15", border: `1.5px solid ${color}33` }}
          >
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium text-sm">{title || "Tábla neve"}</span>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!title.trim() || saving}
          >
            {saving ? "Létrehozás..." : "Tábla létrehozása"}
          </Button>
        </div>
      </main>
    </div>
  );
}
