"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, AlertTriangle, ExternalLink } from "lucide-react";
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

const CATEGORIES = ["Elektronika", "Háztartás", "Bútor", "Gépjármű", "Sport", "Szerződés", "Biztosítás", "Egyéb"];

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  contractExpiry: string | null;
  notes: string | null;
  documentUrl: string | null;
}

function ExpiryBadge({ date, label }: { date: string | null; label: string }) {
  if (!date) return null;
  const days = differenceInDays(new Date(date), new Date());
  const color = days < 0
    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    : days < 30
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", color)}>
      {days < 30 && <AlertTriangle className="h-3 w-3" />}
      {label}: {format(new Date(date), "yyyy. MMM d.", { locale: hu })}
      {days >= 0 && ` (${days} nap)`}
      {days < 0 && " (lejárt)"}
    </span>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Egyéb");
  const [location, setLocation] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [contractExpiry, setContractExpiry] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const fetchItems = async () => {
    const res = await fetch("/api/inventory");
    setItems(await res.json());
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName(""); setCategory("Egyéb"); setLocation(""); setPurchaseDate("");
    setWarrantyExpiry(""); setContractExpiry(""); setNotes(""); setDocumentUrl("");
    setOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setName(item.name); setCategory(item.category ?? "Egyéb"); setLocation(item.location ?? "");
    setPurchaseDate(item.purchaseDate ? format(new Date(item.purchaseDate), "yyyy-MM-dd") : "");
    setWarrantyExpiry(item.warrantyExpiry ? format(new Date(item.warrantyExpiry), "yyyy-MM-dd") : "");
    setContractExpiry(item.contractExpiry ? format(new Date(item.contractExpiry), "yyyy-MM-dd") : "");
    setNotes(item.notes ?? ""); setDocumentUrl(item.documentUrl ?? "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const data = {
      name, category, location: location || null,
      purchaseDate: purchaseDate || null,
      warrantyExpiry: warrantyExpiry || null,
      contractExpiry: contractExpiry || null,
      notes: notes || null,
      documentUrl: documentUrl || null,
    };
    if (editing) {
      await fetch(`/api/inventory/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const filtered = items.filter((item) => {
    const matchCat = filterCategory === "all" || item.category === filterCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const expiringCount = items.filter((i) => {
    const d = i.warrantyExpiry || i.contractExpiry;
    if (!d) return false;
    return differenceInDays(new Date(d), new Date()) < 30;
  }).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Leltár
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} tétel
            {expiringCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3 w-3" /> {expiringCount} hamarosan lejár
              </span>
            )}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Új tétel
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés..."
          className="max-w-[200px]"
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}
          >
            Mind
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{item.name}</span>
                  {item.category && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {item.category}
                    </span>
                  )}
                  {item.location && (
                    <span className="text-xs text-muted-foreground">📍 {item.location}</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.purchaseDate && (
                    <span className="text-xs text-muted-foreground">
                      Vásárolva: {format(new Date(item.purchaseDate), "yyyy. MMM d.", { locale: hu })}
                    </span>
                  )}
                  <ExpiryBadge date={item.warrantyExpiry} label="Garancia" />
                  <ExpiryBadge date={item.contractExpiry} label="Szerződés" />
                </div>
                {item.notes && (
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">{item.notes}</p>
                )}
                {item.documentUrl && (
                  <a href={item.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Dokumentum
                  </a>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nincs találat.</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Szerkesztés" : "Új leltári tétel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Megnevezés</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="pl. Samsung TV" />
              </div>
              <div className="space-y-1.5">
                <Label>Kategória</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Helyszín</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="pl. Nappali" />
              </div>
              <div className="space-y-1.5">
                <Label>Vásárlás dátuma</Label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Garancia lejárata</Label>
                <Input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Szerződés lejárata</Label>
                <Input type="date" value={contractExpiry} onChange={(e) => setContractExpiry(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Dokumentum URL</Label>
                <Input value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Megjegyzés</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editing ? "Mentés" : "Hozzáadás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
