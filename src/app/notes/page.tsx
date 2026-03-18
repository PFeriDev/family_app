"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import type { Note, Person } from "@/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [personId, setPersonId] = useState<string>("none");
  const [filterPerson, setFilterPerson] = useState<string>("all");

  const fetchAll = async () => {
    const [notesRes, personsRes] = await Promise.all([
      fetch("/api/notes"),
      fetch("/api/persons"),
    ]);
    setNotes(await notesRes.json());
    setPersons(await personsRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setTitle(""); setContent(""); setPersonId("none"); setOpen(true); };
  const openEdit = (n: Note) => { setEditing(n); setTitle(n.title); setContent(n.content); setPersonId(n.personId ?? "none"); setOpen(true); };

  const handleSave = async () => {
    if (!title.trim()) return;
    const data = { title, content, personId: personId === "none" ? null : personId };
    if (editing) {
      await fetch(`/api/notes/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const filtered = filterPerson === "all" ? notes
    : filterPerson === "general" ? notes.filter((n) => !n.personId)
    : notes.filter((n) => n.personId === filterPerson);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jegyzetek</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} jegyzet</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Új jegyzet
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Összes" },
          { value: "general", label: "Általános" },
          ...persons.map((p) => ({ value: p.id, label: p.name })),
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterPerson(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
              filterPerson === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((note) => (
          <div key={note.id} className="group relative rounded-xl border bg-card p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{note.title}</h3>
                {note.person && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <User className="h-3 w-3" /> {note.person.name}
                  </span>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(note)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(note.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{note.content}</p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              {format(new Date(note.updatedAt), "MMM d. HH:mm", { locale: hu })}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Még nincs jegyzet.</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Jegyzet szerkesztése" : "Új jegyzet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Cím</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jegyzet címe..." />
            </div>
            <div className="space-y-1.5">
              <Label>Tartalom</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ide írj..." rows={5} />
            </div>
            <div className="space-y-1.5">
              <Label>Személy (opcionális)</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz személyt..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Általános (nincs személy)</SelectItem>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editing ? "Mentés" : "Létrehozás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
