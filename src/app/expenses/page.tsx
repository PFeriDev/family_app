"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Wallet, TrendingDown } from "lucide-react";
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

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  paidBy: Person;
  paidById: string;
  splitWith: Person[];
  date: string;
}

const CATEGORIES = ["Élelmiszer", "Számla", "Szórakozás", "Közlekedés", "Egészség", "Ruházat", "Otthon", "Egyéb"];
const CATEGORY_COLORS: Record<string, string> = {
  "Élelmiszer": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Számla": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Szórakozás": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Közlekedés": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Egészség": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Ruházat": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "Otthon": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Egyéb": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Egyéb");
  const [paidById, setPaidById] = useState("none");
  const [splitWithIds, setSplitWithIds] = useState<string[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterPerson, setFilterPerson] = useState("all");

  const fetchAll = async () => {
    const [expRes, perRes] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/persons"),
    ]);
    setExpenses(await expRes.json());
    setPersons(await perRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle(""); setAmount(""); setCategory("Egyéb");
    setPaidById("none"); setSplitWithIds([]);
    setDate(format(new Date(), "yyyy-MM-dd"));
    setOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setTitle(e.title);
    setAmount(String(e.amount));
    setCategory(e.category ?? "Egyéb");
    setPaidById(e.paidById);
    setSplitWithIds(e.splitWith.map((p) => p.id));
    setDate(format(new Date(e.date), "yyyy-MM-dd"));
    setOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !amount || paidById === "none") return;
    const data = { title, amount: parseFloat(amount), category, paidById, splitWithIds, date };
    if (editing) {
      await fetch(`/api/expenses/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const toggleSplitPerson = (id: string) => {
    setSplitWithIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Balance calculation
  const balances: Record<string, number> = {};
  persons.forEach((p) => { balances[p.id] = 0; });
  expenses.forEach((e) => {
    const total = e.amount;
    const splitCount = e.splitWith.length + 1; // payer + splitWith
    const share = splitCount > 1 ? total / splitCount : 0;
    balances[e.paidById] = (balances[e.paidById] ?? 0) + total - share;
    e.splitWith.forEach((p) => {
      balances[p.id] = (balances[p.id] ?? 0) - share;
    });
  });

  const filteredExpenses = filterPerson === "all"
    ? expenses
    : expenses.filter((e) => e.paidById === filterPerson || e.splitWith.some((p) => p.id === filterPerson));

  const totalSum = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Közös kassza
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {expenses.length} kiadás · Összesen: {totalSum.toLocaleString("hu-HU")} Ft
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Kiadás
        </Button>
      </div>

      {/* Balance summary */}
      {persons.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((p) => {
            const bal = balances[p.id] ?? 0;
            return (
              <div key={p.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p.name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{p.name}</span>
                </div>
                <p className={cn("text-lg font-bold", bal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {bal >= 0 ? "+" : ""}{bal.toLocaleString("hu-HU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Ft
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bal >= 0 ? "követel" : "tartozik"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter */}
      {persons.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Szűrés:</span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterPerson("all")}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterPerson === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}
            >
              Mindenki
            </button>
            {persons.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPerson(p.id)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filterPerson === p.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        {filteredExpenses.map((e) => (
          <div key={e.id} className="group flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{e.title}</span>
                {e.category && (
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS["Egyéb"])}>
                    {e.category}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>Fizette: <span className="font-medium text-foreground">{e.paidBy.name}</span></span>
                {e.splitWith.length > 0 && (
                  <span>· Megosztva: {e.splitWith.map((p) => p.name).join(", ")}</span>
                )}
                <span>· {format(new Date(e.date), "MMM d.", { locale: hu })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">{e.amount.toLocaleString("hu-HU")} Ft</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <TrendingDown className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Még nincs rögzített kiadás.</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Kiadás szerkesztése" : "Új kiadás"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Megnevezés</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="pl. Lidl bevásárlás" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Összeg (Ft)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Dátum</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
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
              <Label>Ki fizette?</Label>
              <Select value={paidById} onValueChange={setPaidById}>
                <SelectTrigger><SelectValue placeholder="Válassz személyt..." /></SelectTrigger>
                <SelectContent>
                  {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {persons.length > 1 && (
              <div className="space-y-1.5">
                <Label>Megosztva (opcionális)</Label>
                <div className="flex flex-wrap gap-2">
                  {persons.filter((p) => p.id !== paidById).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSplitPerson(p.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                        splitWithIds.includes(p.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-accent"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {editing && (
              <Button variant="destructive" onClick={() => { handleDelete(editing.id); setOpen(false); }}>
                Törlés
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!title.trim() || !amount || paidById === "none"}>
              {editing ? "Mentés" : "Hozzáadás"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
