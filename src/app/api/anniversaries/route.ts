import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const anniversaries = await prisma.anniversary.findMany({
      include: { person: true },
      orderBy: { date: "asc" },
    });

    // Calculate days until next occurrence
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enriched = anniversaries.map((a) => {
      const date = new Date(a.date);
      // Next occurrence this year or next
      const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      const nextOccurrence = thisYear < today
        ? new Date(today.getFullYear() + 1, date.getMonth(), date.getDate())
        : thisYear;
      const daysUntil = Math.round((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...a, daysUntil, nextOccurrence };
    });

    // Sort by days until
    enriched.sort((a, b) => a.daysUntil - b.daysUntil);

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch anniversaries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const anniversary = await prisma.anniversary.create({
      data: {
        title: body.title,
        type: body.type ?? "birthday",
        date: new Date(body.date),
        personId: body.personId ?? null,
        remindDaysBefore: body.remindDaysBefore ?? 7,
      },
      include: { person: true },
    });
    return NextResponse.json(anniversary, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create anniversary" }, { status: 500 });
  }
}
