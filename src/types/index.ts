export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  order: number;
  priority: Priority;
  dueDate: Date | string | null;
  tags: Tag[];
  assignees: Person[];
  columnId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  color: string;
  boardId: string;
  cards: Card[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  columns: Column[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  personId: string | null;
  person?: Person | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | string;
  endDate: Date | string | null;
  allDay: boolean;
  color: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  photos?: Photo[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
  albumId: string | null;
  album?: Album | null;
  personId: string | null;
  person?: Person | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCardInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  columnId: string;
  tagIds?: string[];
  assigneeIds?: string[];
}

export interface UpdateCardInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  tagIds?: string[];
  assigneeIds?: string[];
}
// ============================================================
// EZT ADD HOZZÁ a meglévő types/index.ts VÉGÉHEZ
// ============================================================

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  paidBy: Person;
  paidById: string;
  splitWith: Person[];
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MealPlan {
  id: string;
  weekStart: Date | string;
  meals: Meal[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Meal {
  id: string;
  dayOfWeek: number;
  mealType: string;
  name: string;
  recipe: string | null;
  mealPlanId: string;
  ingredients: ShoppingItem[];
  createdAt: Date | string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string | null;
  checked: boolean;
  mealId: string | null;
  createdAt: Date | string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  purchaseDate: Date | string | null;
  warrantyExpiry: Date | string | null;
  contractExpiry: Date | string | null;
  notes: string | null;
  documentUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Anniversary {
  id: string;
  title: string;
  type: string;
  date: Date | string;
  personId: string | null;
  person: Person | null;
  remindDaysBefore: number;
  daysUntil?: number;
  nextOccurrence?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WallMessage {
  id: string;
  content: string;
  authorId: string;
  author: Person;
  pinned: boolean;
  createdAt: Date | string;
}

export interface HealthEntry {
  id: string;
  type: string;
  title: string;
  date: Date | string;
  nextDate: Date | string | null;
  notes: string | null;
  personId: string;
  person: Person;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PollVote {
  id: string;
  optionId: string;
  personId: string;
  person: Person;
  createdAt: Date | string;
}

export interface PollOption {
  id: string;
  text: string;
  pollId: string;
  votes: PollVote[];
}

export interface Poll {
  id: string;
  question: string;
  closedAt: Date | string | null;
  options: PollOption[];
  createdAt: Date | string;
}
