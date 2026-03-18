"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    setEvents(await res.json());
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = (date?: Date) => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setStartDate(date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
    setColor(COLORS[0]);
    setOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditing(e);
    setTitle(e.title);
    setDescription(e.description ?? "");
    setStartDate(format(new Date(e.startDate), "yyyy-MM-dd"));
    setColor(e.color);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    const data = { title, description: description || null, startDate, color };
    if (editing) {
      await fetch(`/api/events/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (d: Date) =>
    events.filter((e) => isSameDay(new Date(e.startDate), d));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold min-w-[180px] text-center">
            {format(currentMonth, "yyyy MMMM", { locale: hu })}
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => openCreate()} className="gap-1.5">
          <Plus className="h-4 w-4" /> Esemény
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t rounded-lg overflow-hidden">
        {days.map((d) => {
          const dayEvents = getEventsForDay(d);
          const inMonth = isSameMonth(d, currentMonth);
          return (
            <div
              key={d.toISOString()}
              onClick={() => openCreate(d)}
              className={cn(
                "min-h-[90px] border-b border-r p-1.5 cursor-pointer transition-colors",
                inMonth ? "bg-card hover:bg-accent/50" : "bg-muted/30",
                isToday(d) && "bg-primary/5"
              )}
            >
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isToday(d) && "bg-primary text-primary-foreground",
                !inMonth && "text-muted-foreground/50"
              )}>
                {format(d, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                    className="truncate rounded px-1 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: e.color }}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Esemény szerkesztése" : "Új esemény"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Cím</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Esemény neve..." />
            </div>
            <div className="space-y-1.5">
              <Label>Dátum</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Leírás (opcionális)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Szín</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={cn("h-7 w-7 rounded-full transition-transform hover:scale-110",
                      color === c && "ring-2 ring-offset-2 ring-foreground")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editing && (
              <Button variant="destructive" onClick={() => { handleDelete(editing.id); setOpen(false); }}>
                Törlés
              </Button>
            )}
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
