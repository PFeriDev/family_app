import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mealPlanId = searchParams.get("mealPlanId");

    if (mealPlanId) {
      // Return all shopping items for a whole week plan
      const meals = await prisma.meal.findMany({
        where: { mealPlanId },
        include: { ingredients: true },
      });
      const items = meals.flatMap((m) => m.ingredients);
      return NextResponse.json(items);
    }

    const items = await prisma.shoppingItem.findMany({
      include: { meal: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch shopping items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await prisma.shoppingItem.create({
      data: {
        name: body.name,
        amount: body.amount ?? null,
        mealId: body.mealId ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create shopping item" }, { status: 500 });
  }
}
