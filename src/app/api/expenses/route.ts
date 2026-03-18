import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        paidBy: true,
        splitWith: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const expense = await prisma.expense.create({
      data: {
        title: body.title,
        amount: parseFloat(body.amount),
        category: body.category ?? null,
        paidById: body.paidById,
        date: body.date ? new Date(body.date) : new Date(),
        splitWith: {
          connect: (body.splitWithIds ?? []).map((id: string) => ({ id })),
        },
      },
      include: {
        paidBy: true,
        splitWith: true,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
