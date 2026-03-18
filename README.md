🏠 OtthonPont – A Családi App

Egy lokálisan futtatható családi menedzsment alkalmazás, amely segíti a mindennapi szervezést, kommunikációt és háztartási feladatok kezelését.

A rendszer több modult tartalmaz, például:

családi üzenőfal

naptár és események

kiadáskezelés

étkezési terv

jegyzetek és szavazások

készletkezelés és galéria

🚀 Első indítás
1. Függőségek telepítése
npm install
2. Adatbázis inicializálása
npx prisma db push
3. (Opcionális) Demo adatok betöltése
npm run db:seed
4. Fejlesztői szerver indítása
npm run dev

Az alkalmazás elérhető:
👉 http://localhost:3000

🗂️ Projekt struktúra
src/
├── app/
│   ├── api/                 # Backend API route-ok
│   │   ├── wall/            # Üzenőfal (posztok)
│   │   ├── polls/           # Szavazások
│   │   ├── notes/           # Jegyzetek
│   │   ├── expenses/        # Kiadások kezelése
│   │   ├── meal-plans/      # Étkezési tervek
│   │   └── ...              # Egyéb modulok API-ja
│   │
│   ├── wall/                # Üzenőfal oldal
│   ├── calendar/            # Naptár nézet
│   ├── expenses/            # Kiadáskezelés UI
│   ├── gallery/             # Galéria
│   ├── health/              # Egészség adatok
│   ├── inventory/           # Készletkezelés
│   ├── notes/               # Jegyzetek
│   ├── polls/               # Szavazások
│   ├── meal-plan/           # Étkezési terv
│   ├── anniversaries/       # Évfordulók
│   ├── boards/              # Táblák (pl. feladatok)
│   └── page.tsx             # Főoldal / dashboard
│
├── components/              # Újrahasználható komponensek
│   ├── ui/                  # shadcn/ui elemek
│   └── ...                  # Modul specifikus komponensek
│
├── lib/
│   ├── prisma.ts            # Prisma kliens
│   └── utils.ts             # Segédfüggvények
│
└── types/
    └── index.ts             # TypeScript típusok
✨ Funkciók
👨‍👩‍👧‍👦 Családi kommunikáció

Üzenőfal (posztok megosztása)

Szavazások létrehozása

Jegyzetek kezelése

📅 Szervezés

Naptár és események

Évfordulók nyilvántartása

Étkezési terv készítése

💰 Háztartás menedzsment

Kiadások követése

Készletkezelés

Egészség adatok kezelése

🖼️ Média

Képgaléria

⚙️ Technikai jellemzők

Lokális futtatás (nincs cloud)

SQLite adatbázis

Reszponzív UI

Komponens alapú felépítés

🧱 Technológiai stack

Next.js – full-stack React framework

TypeScript – típusbiztos fejlesztés

Prisma + SQLite – adatbázis

Tailwind CSS – styling

shadcn/ui – UI komponensek

🔧 Hasznos parancsok
npm run db:studio      # Prisma Studio (adatbázis kezelő)
npm run db:seed        # Demo adatok betöltése
npx prisma migrate reset  # Adatbázis reset
📌 Megjegyzés

Az alkalmazás lokális használatra készült, elsősorban családok számára.
Nem tartalmaz felhasználókezelést vagy publikus hozzáférést.
