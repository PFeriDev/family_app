"use client";

import { useState, useEffect } from "react";
import { Plus, Pin, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface WallMessage {
  id: string;
  content: string;
  authorId: string;
  author: Person;
  pinned: boolean;
  createdAt: string;
}

const MESSAGE_COLORS = [
  "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
  "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
];

export default function WallPage() {
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("none");

  const fetchAll = async () => {
    const [msgRes, personRes] = await Promise.all([
      fetch("/api/wall"),
      fetch("/api/persons"),
    ]);
    setMessages(await msgRes.json());
    setPersons(await personRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSend = async () => {
    if (!content.trim() || authorId === "none") return;
    await fetch("/api/wall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, authorId }),
    });
    setContent("");
    setAuthorId("none");
    setOpen(false);
    fetchAll();
  };

  const handlePin = async (msg: WallMessage) => {
    await fetch(`/api/wall/${msg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !msg.pinned }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/wall/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const pinned = messages.filter((m) => m.pinned);
  const rest = messages.filter((m) => !m.pinned);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Üzenőfal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages.length} üzenet
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Új üzenet
        </Button>
      </div>

      {persons.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Még nincsenek személyek felvéve. Először adj hozzá személyeket a Személyek oldalon!
        </div>
      )}

      {pinned.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            📌 Kitűzött üzenetek
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((msg, i) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                color={MESSAGE_COLORS[i % MESSAGE_COLORS.length]}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Üzenetek
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((msg, i) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                color={MESSAGE_COLORS[(i + pinned.length) % MESSAGE_COLORS.length]}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Még nincs üzenet. Írd az első üzenetet a családodnak!
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Új üzenet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ki küldi?</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz személyt..." />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Üzenet</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Írd ide az üzeneted..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSend} disabled={!content.trim() || authorId === "none"}>
              Küldés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageCard({
  msg,
  color,
  onPin,
  onDelete,
}: {
  msg: WallMessage;
  color: string;
  onPin: (m: WallMessage) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={cn("group relative rounded-xl border p-4 transition-shadow hover:shadow-md", color)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {msg.author.avatarUrl ? (
            <img src={msg.author.avatarUrl} alt={msg.author.name}
              className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {msg.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold">{msg.author.name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onPin(msg)}
            className={cn(
              "rounded p-1 hover:bg-black/10 transition-colors",
              msg.pinned && "text-amber-600"
            )}
            title={msg.pinned ? "Kitűzés visszavonása" : "Kitűzés"}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(msg.id)}
            className="rounded p-1 hover:bg-black/10 text-destructive transition-colors"
            title="Törlés"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>

      <p className="mt-3 text-xs text-muted-foreground">
        {format(new Date(msg.createdAt), "MMM d., HH:mm", { locale: hu })}
      </p>
    </div>
  );
}
