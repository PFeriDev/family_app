import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.purchaseDate !== undefined && { purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null }),
        ...(body.warrantyExpiry !== undefined && { warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null }),
        ...(body.contractExpiry !== undefined && { contractExpiry: body.contractExpiry ? new Date(body.contractExpiry) : null }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.documentUrl !== undefined && { documentUrl: body.documentUrl }),
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 });
  }
}
