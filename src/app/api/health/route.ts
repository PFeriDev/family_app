import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");
    const type = searchParams.get("type");

    const entries = await prisma.healthEntry.findMany({
      where: {
        ...(personId && { personId }),
        ...(type && { type }),
      },
      include: { person: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch health entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = await prisma.healthEntry.create({
      data: {
        type: body.type,
        title: body.title,
        date: new Date(body.date),
        nextDate: body.nextDate ? new Date(body.nextDate) : null,
        notes: body.notes ?? null,
        personId: body.personId,
      },
      include: { person: true },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create health entry" }, { status: 500 });
  }
}
