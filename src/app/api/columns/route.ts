import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.column.count({ where: { boardId: body.boardId } });
    const column = await prisma.column.create({
      data: {
        title: body.title,
        color: body.color ?? "#64748b",
        order: count,
        boardId: body.boardId,
      },
      include: { cards: { include: { tags: true } } },
    });
    return NextResponse.json(column, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
