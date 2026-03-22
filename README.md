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
1. Letöltés GitHub-ról

GitHub repo oldalán: Code → Download ZIP
Kicsomagolás pl. ide: C:\DUE\ (ne legyen ékezet, szóköz, speciális karakter az útvonalban)

2. Node.js telepítése

Menj a nodejs.org oldalra
Töltsd le az LTS verziót (bal oldali gomb)
Telepítő végigkattintása, alapértelmezett beállítások maradhatnak
Ellenőrzés telepítés után:

node -v
npm -v

3. Parancsok sorban
npm install --legacy-peer-deps
echo DATABASE_URL="file:./dev.db" > .env
npx prisma generate
npx prisma db push
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
