# 🗂️ Kanban Board

Teljes funkcionalitású lokális kanban tábla — Next.js 14, shadcn/ui, Prisma + SQLite, dnd-kit.

## 🚀 Első indítás

### 1. Függőségek telepítése
```bash
npm install
```

### 2. Adatbázis inicializálása
```bash
npx prisma db push
```

### 3. (Opcionális) Demo adatok betöltése
```bash
npm run db:seed
```

### 4. Fejlesztői szerver indítása
```bash
npm run dev
```

A board elérhető: **http://localhost:3000**

---

## 🗂️ Projekt struktúra

```
src/
├── app/
│   ├── api/
│   │   ├── boards/          # Board CRUD
│   │   ├── columns/         # Column CRUD
│   │   ├── cards/           # Card CRUD + move
│   │   └── tags/            # Tag kezelés
│   ├── boards/
│   │   ├── [id]/page.tsx    # Kanban nézet
│   │   └── new/page.tsx     # Új tábla
│   └── page.tsx             # Board lista
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.tsx  # Fő board + DnD logika
│   │   ├── KanbanColumn.tsx # Oszlop komponens
│   │   ├── KanbanCard.tsx   # Kártya komponens
│   │   ├── CardForm.tsx     # Kártya dialóg
│   │   └── ColumnForm.tsx   # Oszlop dialóg
│   ├── widgets/             # Kis, újrahasználható komponensek
│   │   ├── PriorityBadge.tsx
│   │   ├── DueDateBadge.tsx
│   │   ├── TagChip.tsx
│   │   ├── CardCount.tsx
│   │   ├── ColorDot.tsx
│   │   └── EmptyColumnPlaceholder.tsx
│   └── ui/                  # shadcn/ui komponensek
├── lib/
│   ├── prisma.ts            # Prisma kliens singleton
│   └── utils.ts             # cn(), prioritás config, dátum utils
└── types/
    └── index.ts             # TypeScript típusok
```

## ✨ Funkciók

- **Drag & Drop** — kártyák mozgatása oszlopok között és belül
- **Kártyák** — cím, leírás, prioritás (Low/Medium/High/Urgent), határidő, színes címkék
- **Oszlopok** — cím + szín szerkesztése, törlés
- **Több tábla** — tetszőleges számú kanban tábla
- **Dark mode** — automatikus + manuális kapcsoló
- **SQLite** — lokális adatbázis, semmi cloud

## 🔧 Hasznos parancsok

```bash
npm run db:studio   # Prisma Studio (adatbázis böngésző)
npm run db:seed     # Demo adatok újratöltése
npx prisma migrate reset  # Adatbázis reset
```
