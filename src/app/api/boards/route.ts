import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "asc" },
      include: { columns: { select: { id: true, _count: { select: { cards: true } } } } },
    });
    return NextResponse.json(boards);
  } catch {
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const board = await prisma.board.create({
      data: {
        title: body.title,
        description: body.description,
        color: body.color ?? "#6366f1",
      },
    });
    return NextResponse.json(board, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
