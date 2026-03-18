"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Gift, Heart, Star, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Anniversary {
  id: string;
  title: string;
  type: string;
  date: string;
  personId: string | null;
  person: Person | null;
  remindDaysBefore: number;
  daysUntil: number;
  nextOccurrence: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  birthday: { icon: Gift, label: "Születésnap", color: "text-pink-500" },
  anniversary: { icon: Heart, label: "Évforduló", color: "text-red-500" },
  other: { icon: Star, label: "Egyéb", color: "text-amber-500" },
};

export default function AnniversariesPage() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Anniversary | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("birthday");
  const [date, setDate] = useState("");
  const [personId, setPersonId] = useState("none");
  const [remindDaysBefore, setRemindDaysBefore] = useState(7);

  const fetchAll = async () => {
    const [annRes, perRes] = await Promise.all([
      fetch("/api/anniversaries"),
      fetch("/api/persons"),
    ]);
    setAnniversaries(await annRes.json());
    setPersons(await perRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null); setTitle(""); setType("birthday"); setDate(""); setPersonId("none"); setRemindDaysBefore(7);
    setOpen(true);
  };

  const openEdit = (a: Anniversary) => {
    setEditing(a); setTitle(a.title); setType(a.type);
    setDate(format(new Date(a.date), "yyyy-MM-dd"));
    setPersonId(a.personId ?? "none"); setRemindDaysBefore(a.remindDaysBefore);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !date) return;
    const data = { title, type, date, personId: personId === "none" ? null : personId, remindDaysBefore };
    if (editing) {
      await fetch(`/api/anniversaries/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/anniversaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/anniversaries/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const upcoming = anniversaries.filter((a) => a.daysUntil <= 30);
  const rest = anniversaries.filter((a) => a.daysUntil > 30);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Születésnapok & Évfordulók
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {anniversaries.length} esemény
            {upcoming.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {upcoming.length} hamarosan</span>
            )}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Hozzáadás
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Bell className="h-3.5 w-3.5 text-amber-500" /> Közeledő (30 napon belül)
          </p>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <AnniversaryRow key={a.id} ann={a} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {upcoming.length > 0 && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Többi</p>
          )}
          <div className="space-y-2">
            {rest.map((a) => (
              <AnniversaryRow key={a.id} ann={a} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {anniversaries.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
          <Gift className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Még nincs rögzített születésnap vagy évforduló.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Szerkesztés" : "Új esemény"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Megnevezés</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="pl. Anya születésnapja" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Típus</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">🎁 Születésnap</SelectItem>
                    <SelectItem value="anniversary">❤️ Évforduló</SelectItem>
                    <SelectItem value="other">⭐ Egyéb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dátum</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Személy (opcionális)</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger><SelectValue placeholder="Nincs kiválasztva" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nincs</SelectItem>
                  {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Emlékeztető (nappal előtte)</Label>
              <Input type="number" value={remindDaysBefore} onChange={(e) => setRemindDaysBefore(parseInt(e.target.value))} min={0} max={365} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editing && (
              <Button variant="destructive" onClick={() => { handleDelete(editing.id); setOpen(false); }}>Törlés</Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!title.trim() || !date}>
              {editing ? "Mentés" : "Hozzáadás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnniversaryRow({ ann, onEdit, onDelete }: {
  ann: Anniversary;
  onEdit: (a: Anniversary) => void;
  onDelete: (id: string) => void;
}) {
  const config = TYPE_CONFIG[ann.type] ?? TYPE_CONFIG.other;
  const Icon = config.icon;
  const isToday = ann.daysUntil === 0;
  const isSoon = ann.daysUntil <= 7;

  return (
    <div className={cn(
      "group flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-sm",
      isToday && "border-pink-300 bg-pink-50/50 dark:border-pink-700 dark:bg-pink-950/20"
    )}>
      <Icon className={cn("h-5 w-5 shrink-0", config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{ann.title}</span>
          {ann.person && (
            <span className="text-xs text-muted-foreground">— {ann.person.name}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(new Date(ann.date), "MMMM d.", { locale: hu })}
          {" · "}
          {isToday ? (
            <span className="font-semibold text-pink-600">Ma van! 🎉</span>
          ) : (
            <span className={isSoon ? "font-semibold text-amber-600" : ""}>
              {ann.daysUntil} nap múlva
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(ann)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(ann.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
