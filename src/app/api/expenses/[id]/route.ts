import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.paidById !== undefined && { paidById: body.paidById }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.splitWithIds !== undefined && {
          splitWith: {
            set: body.splitWithIds.map((sid: string) => ({ id: sid })),
          },
        }),
      },
      include: { paidBy: true, splitWith: true },
    });
    return NextResponse.json(expense);
  } catch {
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
