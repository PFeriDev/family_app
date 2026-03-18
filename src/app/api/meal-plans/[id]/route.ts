import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        meals: {
          include: { ingredients: true },
          orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
        },
      },
    });
    if (!mealPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mealPlan);
  } catch {
    return NextResponse.json({ error: "Failed to fetch meal plan" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mealPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete meal plan" }, { status: 500 });
  }
}
