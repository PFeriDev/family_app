import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.card.count({ where: { columnId: body.columnId } });
    const card = await prisma.card.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority ?? "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        order: count,
        columnId: body.columnId,
        tags: body.tagIds?.length ? { connect: body.tagIds.map((id: string) => ({ id })) } : undefined,
        assignees: body.assigneeIds?.length ? { connect: body.assigneeIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { tags: true, assignees: true },
    });
    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
