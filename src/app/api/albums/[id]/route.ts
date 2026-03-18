import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: { photos: { include: { person: true }, orderBy: { createdAt: "desc" } } },
    });
    if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(album);
  } catch {
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const album = await prisma.album.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.coverUrl !== undefined && { coverUrl: body.coverUrl }),
      },
    });
    return NextResponse.json(album);
  } catch {
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.album.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
  }
}
