import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const photo = await prisma.photo.update({
      where: { id },
      data: {
        ...(body.caption !== undefined && { caption: body.caption }),
        ...(body.albumId !== undefined && { albumId: body.albumId }),
        ...(body.personId !== undefined && { personId: body.personId }),
      },
      include: { person: true, album: true },
    });
    return NextResponse.json(photo);
  } catch {
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.photo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
