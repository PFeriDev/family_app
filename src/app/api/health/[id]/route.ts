import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const entry = await prisma.healthEntry.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: body.type }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.nextDate !== undefined && { nextDate: body.nextDate ? new Date(body.nextDate) : null }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.personId !== undefined && { personId: body.personId }),
      },
      include: { person: true },
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to update health entry" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.healthEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete health entry" }, { status: 500 });
  }
}
