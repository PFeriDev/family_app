"use client";

import { useState, useEffect } from "react";
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
import { TagChip } from "@/components/widgets/TagChip";
import { User } from "lucide-react";
import type { Card, Tag, Person, Priority, CreateCardInput, UpdateCardInput } from "@/types";
import { PRIORITY_CONFIG } from "@/lib/utils";

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCardInput | UpdateCardInput) => Promise<void>;
  card?: Card | null;
  columnId?: string;
  availableTags: Tag[];
}

export function CardForm({ open, onClose, onSave, card, columnId, availableTags }: CardFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/persons").then((r) => r.json()).then(setPersons);
  }, []);

  useEffect(() => {
    if (open) {
      setTitle(card?.title ?? "");
      setDescription(card?.description ?? "");
      setPriority(card?.priority ?? "MEDIUM");
      setDueDate(card?.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "");
      setSelectedTagIds(card?.tags?.map((t) => t.id) ?? []);
      setSelectedAssigneeIds(card?.assignees?.map((a) => a.id) ?? []);
    }
  }, [open, card]);

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAssignee = (id: string) =>
    setSelectedAssigneeIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
        tagIds: selectedTagIds,
        assigneeIds: selectedAssigneeIds,
        ...(columnId && !card ? { columnId } : {}),
      };
      await onSave(data as CreateCardInput | UpdateCardInput);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{card ? "Kártya szerkesztése" : "Új kártya"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Cím *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kártya neve..."
              onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          </div>
          <div className="space-y-1.5">
            <Label>Leírás</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Részletek..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioritás</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                        {PRIORITY_CONFIG[p].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Határidő</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Assignees */}
          {persons.length > 0 && (
            <div className="space-y-1.5">
              <Label>Felelősök</Label>
              <div className="flex flex-wrap gap-1.5">
                {persons.map((person) => {
                  const selected = selectedAssigneeIds.includes(person.id);
                  return (
                    <button key={person.id} type="button" onClick={() => toggleAssignee(person.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                        selected ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}>
                      {person.avatarUrl ? (
                        <img src={person.avatarUrl} alt={person.name} className="h-4 w-4 rounded-full object-cover" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                      {person.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-1.5">
              <Label>Címkék</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={`transition-opacity rounded-full ${selectedTagIds.includes(tag.id) ? "opacity-100 ring-2 ring-offset-1" : "opacity-50"}`}>
                    <TagChip tag={tag} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Mégse</Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Mentés..." : card ? "Mentés" : "Létrehozás"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
