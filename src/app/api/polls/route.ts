import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: {
          include: {
            votes: { include: { person: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(polls);
  } catch {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const poll = await prisma.poll.create({
      data: {
        question: body.question,
        options: {
          create: (body.options as string[]).map((text: string) => ({ text })),
        },
      },
      include: {
        options: {
          include: { votes: { include: { person: true } } },
        },
      },
    });
    return NextResponse.json(poll, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
