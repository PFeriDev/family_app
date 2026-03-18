import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const anniversary = await prisma.anniversary.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.personId !== undefined && { personId: body.personId }),
        ...(body.remindDaysBefore !== undefined && { remindDaysBefore: body.remindDaysBefore }),
      },
      include: { person: true },
    });
    return NextResponse.json(anniversary);
  } catch {
    return NextResponse.json({ error: "Failed to update anniversary" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.anniversary.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete anniversary" }, { status: 500 });
  }
}
