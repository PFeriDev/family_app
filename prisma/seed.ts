import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.tag.deleteMany();

  // Create tags
  const bugTag = await prisma.tag.create({
    data: { name: "Bug", color: "#ef4444" },
  });
  const featureTag = await prisma.tag.create({
    data: { name: "Feature", color: "#6366f1" },
  });
  const designTag = await prisma.tag.create({
    data: { name: "Design", color: "#ec4899" },
  });

  // Create board
  const board = await prisma.board.create({
    data: {
      title: "Projekt Alpha",
      description: "Fő fejlesztési kanban tábla",
      color: "#6366f1",
    },
  });

  // Create columns
  const backlog = await prisma.column.create({
    data: { title: "Backlog", order: 0, color: "#64748b", boardId: board.id },
  });
  const todo = await prisma.column.create({
    data: { title: "To Do", order: 1, color: "#3b82f6", boardId: board.id },
  });
  const inProgress = await prisma.column.create({
    data: {
      title: "In Progress",
      order: 2,
      color: "#f59e0b",
      boardId: board.id,
    },
  });
  const review = await prisma.column.create({
    data: { title: "Review", order: 3, color: "#8b5cf6", boardId: board.id },
  });
  const done = await prisma.column.create({
    data: { title: "Done", order: 4, color: "#10b981", boardId: board.id },
  });

  // Seed cards
  const cardData = [
    {
      title: "Felhasználói autentikáció tervezése",
      description: "OAuth2 flow megtervezése és implementálása.",
      order: 0,
      priority: "HIGH",
      columnId: backlog.id,
      tags: [featureTag.id, designTag.id],
    },
    {
      title: "Dashboard layout",
      description: "Responsive grid layout kialakítása.",
      order: 1,
      priority: "MEDIUM",
      columnId: backlog.id,
      tags: [designTag.id],
    },
    {
      title: "API endpoint dokumentáció",
      description: "OpenAPI spec megírása az összes endpointhoz.",
      order: 0,
      priority: "LOW",
      columnId: todo.id,
      tags: [featureTag.id],
    },
    {
      title: "Bejelentkezési oldal UI",
      description: "Login form shadcn komponensekkel.",
      order: 1,
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      columnId: todo.id,
      tags: [designTag.id],
    },
    {
      title: "Kanban drag & drop",
      description: "dnd-kit integráció kártyák mozgatásához.",
      order: 0,
      priority: "URGENT",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      columnId: inProgress.id,
      tags: [featureTag.id],
    },
    {
      title: "SQLite + Prisma setup",
      description: "Adatbázis séma és migráció.",
      order: 1,
      priority: "HIGH",
      columnId: inProgress.id,
      tags: [featureTag.id],
    },
    {
      title: "Dark mode implementáció",
      description: "Tailwind dark osztályok és theme toggle.",
      order: 0,
      priority: "MEDIUM",
      columnId: review.id,
      tags: [designTag.id],
    },
    {
      title: "Projekt alapstruktúra",
      description: "Next.js app router, mappastruktúra felállítása.",
      order: 0,
      priority: "HIGH",
      columnId: done.id,
      tags: [featureTag.id],
    },
    {
      title: "Fix: 404 oldal hibás redirect",
      description: "A nem létező route-ok rossz helyre irányítanak.",
      order: 1,
      priority: "URGENT",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      columnId: done.id,
      tags: [bugTag.id],
    },
  ];

  for (const card of cardData) {
    await prisma.card.create({
      data: {
        title: card.title,
        description: card.description,
        order: card.order,
        priority: card.priority,
        dueDate: card.dueDate,
        columnId: card.columnId,
        tags: { connect: card.tags.map((id) => ({ id })) },
      },
    });
  }

  console.log("✅ Seed kész!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
