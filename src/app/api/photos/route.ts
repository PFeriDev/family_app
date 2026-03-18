import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");
    const albumId = searchParams.get("albumId");
    const photos = await prisma.photo.findMany({
      where: {
        ...(personId ? { personId } : {}),
        ...(albumId ? { albumId } : {}),
      },
      include: { person: true, album: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const photo = await prisma.photo.create({
      data: {
        url: body.url,
        caption: body.caption ?? null,
        albumId: body.albumId ?? null,
        personId: body.personId ?? null,
      },
      include: { person: true, album: true },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
  }
}
