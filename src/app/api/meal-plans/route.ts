import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekStart = searchParams.get("weekStart");
    const mealPlans = await prisma.mealPlan.findMany({
      where: weekStart ? { weekStart: new Date(weekStart) } : {},
      include: {
        meals: {
          include: { ingredients: true },
          orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
        },
      },
      orderBy: { weekStart: "desc" },
    });
    return NextResponse.json(mealPlans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch meal plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mealPlan = await prisma.mealPlan.create({
      data: {
        weekStart: new Date(body.weekStart),
      },
      include: {
        meals: { include: { ingredients: true } },
      },
    });
    return NextResponse.json(mealPlan, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create meal plan" }, { status: 500 });
  }
}
