import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const meal = await prisma.meal.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        mealType: body.mealType,
        name: body.name,
        recipe: body.recipe ?? null,
        mealPlanId: body.mealPlanId,
        ingredients: {
          create: (body.ingredients ?? []).map((ing: { name: string; amount?: string }) => ({
            name: ing.name,
            amount: ing.amount ?? null,
          })),
        },
      },
      include: { ingredients: true },
    });
    return NextResponse.json(meal, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 });
  }
}
