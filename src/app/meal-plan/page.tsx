"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, ShoppingCart, Check, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DAYS = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const MEAL_TYPES = ["Reggeli", "Ebéd", "Vacsora"];
const MEAL_TYPE_COLORS: Record<string, string> = {
  "Reggeli": "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
  "Ebéd": "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
  "Vacsora": "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
};

interface Ingredient { id: string; name: string; amount: string | null; checked: boolean; }
interface Meal {
  id: string; dayOfWeek: number; mealType: string; name: string;
  recipe: string | null; ingredients: Ingredient[];
}
interface MealPlan {
  id: string; weekStart: string; meals: Meal[];
}

export default function MealPlanPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [showShopping, setShowShopping] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<(Ingredient & { mealName: string })[]>([]);

  // Meal dialog
  const [mealOpen, setMealOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState("Ebéd");
  const [mealName, setMealName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>([{ name: "", amount: "" }]);

  const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

  const fetchMealPlan = async () => {
    const res = await fetch(`/api/meal-plans?weekStart=${weekStartStr}`);
    const plans: MealPlan[] = await res.json();
    setMealPlan(plans[0] ?? null);
  };

  useEffect(() => { fetchMealPlan(); }, [weekStartStr]);

  const ensurePlan = async (): Promise<string> => {
    if (mealPlan) return mealPlan.id;
    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: weekStartStr }),
    });
    const plan = await res.json();
    setMealPlan(plan);
    return plan.id;
  };

  const openAddMeal = (day: number, type: string) => {
    setSelectedDay(day); setSelectedMealType(type);
    setMealName(""); setRecipe("");
    setIngredients([{ name: "", amount: "" }]);
    setMealOpen(true);
  };

  const handleSaveMeal = async () => {
    if (!mealName.trim()) return;
    const planId = await ensurePlan();
    const validIngredients = ingredients.filter((i) => i.name.trim());
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealPlanId: planId,
        dayOfWeek: selectedDay,
        mealType: selectedMealType,
        name: mealName,
        recipe: recipe || null,
        ingredients: validIngredients,
      }),
    });
    setMealOpen(false);
    fetchMealPlan();
  };

  const handleDeleteMeal = async (id: string) => {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    fetchMealPlan();
  };

  const handleToggleIngredient = async (item: Ingredient) => {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
    if (mealPlan) {
      const res = await fetch(`/api/shopping?mealPlanId=${mealPlan.id}`);
      const items = await res.json();
      buildShoppingList(items);
    }
  };

  const buildShoppingList = (rawItems: (Ingredient & { mealId: string })[]) => {
    if (!mealPlan) return;
    const mealMap: Record<string, string> = {};
    mealPlan.meals.forEach((m) => { mealMap[m.id] = m.name; });
    setShoppingItems(rawItems.map((i) => ({ ...i, mealName: mealMap[i.mealId ?? ""] ?? "" })));
  };

  const openShopping = async () => {
    if (!mealPlan) return;
    const res = await fetch(`/api/shopping?mealPlanId=${mealPlan.id}`);
    const items = await res.json();
    buildShoppingList(items);
    setShowShopping(true);
  };

  const getMealsForCell = (day: number, type: string) =>
    mealPlan?.meals.filter((m) => m.dayOfWeek === day && m.mealType === type) ?? [];

  const totalIngredients = mealPlan?.meals.reduce((sum, m) => sum + m.ingredients.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            Heti étlap
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentWeekStart, "yyyy. MMM d.", { locale: hu })} – {format(addWeeks(currentWeekStart, 1), "MMM d.", { locale: hu })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {totalIngredients > 0 && (
          <Button variant="outline" onClick={openShopping} className="gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            Bevásárlólista ({totalIngredients} tétel)
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2" />
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {MEAL_TYPES.map((type) => (
            <div key={type} className="grid grid-cols-8 gap-2 mb-2">
              <div className={cn("flex items-center justify-center rounded-lg border px-2 py-3 text-xs font-semibold", MEAL_TYPE_COLORS[type])}>
                {type}
              </div>
              {DAYS.map((_, day) => {
                const meals = getMealsForCell(day, type);
                return (
                  <div key={day} className="group min-h-[80px] rounded-lg border bg-card p-1.5 transition-colors hover:border-primary/40">
                    {meals.map((m) => (
                      <div key={m.id} className="mb-1 flex items-start justify-between gap-1 rounded bg-accent/50 px-2 py-1">
                        <span className="text-xs font-medium leading-tight">{m.name}</span>
                        <button
                          onClick={() => handleDeleteMeal(m.id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => openAddMeal(day, type)}
                      className="w-full rounded p-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 flex items-center justify-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add meal dialog */}
      <Dialog open={mealOpen} onOpenChange={(v) => !v && setMealOpen(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              Étel hozzáadása — {DAYS[selectedDay]}, {selectedMealType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Étel neve</Label>
              <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="pl. Csirkepaprikás" />
            </div>
            <div className="space-y-1.5">
              <Label>Recept / megjegyzés (opcionális)</Label>
              <Input value={recipe} onChange={(e) => setRecipe(e.target.value)} placeholder="Recept URL vagy leírás..." />
            </div>
            <div className="space-y-2">
              <Label>Hozzávalók (opcionális)</Label>
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={ing.name}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setIngredients(updated);
                    }}
                    placeholder="Hozzávaló neve"
                    className="flex-1"
                  />
                  <Input
                    value={ing.amount}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i] = { ...updated[i], amount: e.target.value };
                      setIngredients(updated);
                    }}
                    placeholder="pl. 500g"
                    className="w-24"
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIngredients([...ingredients, { name: "", amount: "" }])}
                className="gap-1 text-xs"
              >
                <Plus className="h-3 w-3" /> Hozzávaló
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealOpen(false)}>Mégse</Button>
            <Button onClick={handleSaveMeal} disabled={!mealName.trim()}>Hozzáadás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shopping list dialog */}
      <Dialog open={showShopping} onOpenChange={(v) => !v && setShowShopping(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Bevásárlólista
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-1 py-2">
            {shoppingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nincsenek hozzávalók.</p>
            ) : (
              shoppingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleIngredient(item)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:bg-accent",
                    item.checked && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    item.checked ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {item.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-sm font-medium", item.checked && "line-through")}>{item.name}</span>
                    {item.amount && <span className="ml-2 text-xs text-muted-foreground">{item.amount}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">{item.mealName}</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShopping(false)}>Bezárás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
