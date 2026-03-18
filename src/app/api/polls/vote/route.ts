import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: vote for an option
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Upsert: if already voted for this option, remove vote (toggle)
    const existing = await prisma.pollVote.findUnique({
      where: {
        optionId_personId: {
          optionId: body.optionId,
          personId: body.personId,
        },
      },
    });

    if (existing) {
      await prisma.pollVote.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    }

    const vote = await prisma.pollVote.create({
      data: {
        optionId: body.optionId,
        personId: body.personId,
      },
      include: { person: true },
    });
    return NextResponse.json({ action: "added", vote }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
