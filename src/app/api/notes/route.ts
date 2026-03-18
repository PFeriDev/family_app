import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");
    const notes = await prisma.note.findMany({
      where: personId ? { personId } : {},
      include: { person: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        personId: body.personId ?? null,
      },
      include: { person: true },
    });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
