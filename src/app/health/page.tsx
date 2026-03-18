"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Heart, Syringe, Stethoscope, Pill, AlertTriangle } from "lucide-react";
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
import { format, differenceInDays } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface HealthEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  nextDate: string | null;
  notes: string | null;
  personId: string;
  person: Person;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  vaccination: { icon: Syringe, label: "Oltás", color: "text-blue-500" },
  checkup: { icon: Stethoscope, label: "Vizsgálat", color: "text-green-500" },
  medication: { icon: Pill, label: "Gyógyszer", color: "text-purple-500" },
  other: { icon: Heart, label: "Egyéb", color: "text-pink-500" },
};

export default function HealthPage() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HealthEntry | null>(null);
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [type, setType] = useState("checkup");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [nextDate, setNextDate] = useState("");
  const [notes, setNotes] = useState("");
  const [personId, setPersonId] = useState("none");

  const fetchAll = async () => {
    const [entRes, perRes] = await Promise.all([
      fetch("/api/health"),
      fetch("/api/persons"),
    ]);
    setEntries(await entRes.json());
    setPersons(await perRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null); setType("checkup"); setTitle("");
    setDate(format(new Date(), "yyyy-MM-dd")); setNextDate(""); setNotes(""); setPersonId("none");
    setOpen(true);
  };

  const openEdit = (e: HealthEntry) => {
    setEditing(e); setType(e.type); setTitle(e.title);
    setDate(format(new Date(e.date), "yyyy-MM-dd"));
    setNextDate(e.nextDate ? format(new Date(e.nextDate), "yyyy-MM-dd") : "");
    setNotes(e.notes ?? ""); setPersonId(e.personId);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || personId === "none") return;
    const data = { type, title, date, nextDate: nextDate || null, notes: notes || null, personId };
    if (editing) {
      await fetch(`/api/health/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/health/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const filtered = entries.filter((e) => {
    const matchPerson = filterPerson === "all" || e.personId === filterPerson;
    const matchType = filterType === "all" || e.type === filterType;
    return matchPerson && matchType;
  });

  const upcomingNextDates = entries.filter((e) => {
    if (!e.nextDate) return false;
    const days = differenceInDays(new Date(e.nextDate), new Date());
    return days >= 0 && days <= 30;
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Egészségügyi napló
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {entries.length} bejegyzés
            {upcomingNextDates.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium flex-inline items-center gap-1">
                · <AlertTriangle className="inline h-3 w-3" /> {upcomingNextDates.length} közelgő időpont
              </span>
            )}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Bejegyzés
        </Button>
      </div>

      {/* Upcoming reminders */}
      {upcomingNextDates.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Közelgő időpontok (30 napon belül)
          </p>
          <div className="space-y-1">
            {upcomingNextDates.map((e) => {
              const days = differenceInDays(new Date(e.nextDate!), new Date());
              return (
                <div key={e.id} className="text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-medium">{e.person.name}</span> — {e.title}
                  {" · "}
                  {format(new Date(e.nextDate!), "MMM d.", { locale: hu })}
                  {" "}
                  ({days === 0 ? "ma!" : `${days} nap múlva`})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterPerson("all")}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterPerson === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}
          >
            Mindenki
          </button>
          {persons.map((p) => (
            <button key={p.id} onClick={() => setFilterPerson(p.id)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterPerson === p.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterType("all")}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterType === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}>
            Mind
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilterType(key)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterType === key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map((e) => {
          const cfg = TYPE_CONFIG[e.type] ?? TYPE_CONFIG.other;
          const Icon = cfg.icon;
          const daysToNext = e.nextDate ? differenceInDays(new Date(e.nextDate), new Date()) : null;
          return (
            <div key={e.id} className="group flex items-start gap-4 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-sm">
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cfg.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{e.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{cfg.label}</span>
                  <span className="text-xs text-muted-foreground">— {e.person.name}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(e.date), "yyyy. MMM d.", { locale: hu })}</span>
                  {e.nextDate && (
                    <span className={cn(
                      "font-medium",
                      daysToNext !== null && daysToNext <= 30 ? "text-amber-600 dark:text-amber-400" : ""
                    )}>
                      · Következő: {format(new Date(e.nextDate), "MMM d.", { locale: hu })}
                      {daysToNext !== null && daysToNext >= 0 && ` (${daysToNext} nap)`}
                    </span>
                  )}
                </div>
                {e.notes && <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{e.notes}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <Heart className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nincs bejegyzés.</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Szerkesztés" : "Új bejegyzés"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Személy</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger><SelectValue placeholder="Válassz személyt..." /></SelectTrigger>
                <SelectContent>
                  {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Típus</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">💉 Oltás</SelectItem>
                    <SelectItem value="checkup">🩺 Vizsgálat</SelectItem>
                    <SelectItem value="medication">💊 Gyógyszer</SelectItem>
                    <SelectItem value="other">❤️ Egyéb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dátum</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Megnevezés</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="pl. Influenza oltás" />
            </div>
            <div className="space-y-1.5">
              <Label>Következő időpont (opcionális)</Label>
              <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Megjegyzés</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editing && (
              <Button variant="destructive" onClick={() => { handleDelete(editing.id); setOpen(false); }}>Törlés</Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!title.trim() || personId === "none"}>
              {editing ? "Mentés" : "Hozzáadás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
