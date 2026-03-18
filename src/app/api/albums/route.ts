import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { photos: true } } },
    });
    return NextResponse.json(albums);
  } catch {
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const album = await prisma.album.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        coverUrl: body.coverUrl ?? null,
      },
    });
    return NextResponse.json(album, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}
