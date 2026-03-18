import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const persons = await prisma.person.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(persons);
  } catch {
    return NextResponse.json({ error: "Failed to fetch persons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const person = await prisma.person.create({
      data: { name: body.name, avatarUrl: body.avatarUrl ?? null },
    });
    return NextResponse.json(person, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}
