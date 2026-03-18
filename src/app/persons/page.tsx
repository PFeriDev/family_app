"use client";

import { useState, useEffect } from "react";
import { Plus, User, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Person } from "@/types";

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchPersons = async () => {
    const res = await fetch("/api/persons");
    setPersons(await res.json());
  };

  useEffect(() => { fetchPersons(); }, []);

  const openCreate = () => { setEditing(null); setName(""); setAvatarUrl(""); setOpen(true); };
  const openEdit = (p: Person) => { setEditing(p); setName(p.name); setAvatarUrl(p.avatarUrl ?? ""); setOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await fetch(`/api/persons/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: avatarUrl || null }),
      });
    } else {
      await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: avatarUrl || null }),
      });
    }
    setOpen(false);
    fetchPersons();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/persons/${id}`, { method: "DELETE" });
    fetchPersons();
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Személyek</h1>
          <p className="text-sm text-muted-foreground">{persons.length} személy</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Hozzáadás
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {persons.map((person) => (
          <div
            key={person.id}
            className="group relative flex flex-col items-center rounded-xl border bg-card p-4 text-center hover:shadow-md transition-all"
          >
            <div className="mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <p className="font-medium text-sm">{person.name}</p>

            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(person)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(person.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {persons.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <User className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Még nincs személy. Adj hozzá egyet!</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Személy szerkesztése" : "Új személy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Név</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Teljes név" />
            </div>
            <div className="space-y-1.5">
              <Label>Profilkép URL (opcionális)</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            {avatarUrl && (
              <img src={avatarUrl} alt="preview" className="h-16 w-16 rounded-full object-cover mx-auto" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editing ? "Mentés" : "Létrehozás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
