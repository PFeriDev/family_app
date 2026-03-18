import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body.moves = [{ id, columnId, order }]
    const updates = body.moves as { id: string; columnId: string; order: number }[];

    await prisma.$transaction(
      updates.map((u) =>
        prisma.card.update({
          where: { id: u.id },
          data: { columnId: u.columnId, order: u.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to move cards" }, { status: 500 });
  }
}
