import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/reorders/[id] — update status, handle receive
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const reorder = await prisma.reorder.findUnique({
    where: { id: parseInt(id) },
  });
  if (!reorder)
    return NextResponse.json({ error: "Reorder not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  // Handle receiving
  if (body.status === "RECEIVED" && reorder.status !== "RECEIVED") {
    data.receivedAt = new Date();
    await prisma.product.update({
      where: { id: reorder.productId },
      data: { stockQty: { increment: reorder.qty } },
    });
    await prisma.stockMovement.create({
      data: {
        productId: reorder.productId,
        type: "IN",
        qty: reorder.qty,
        reason: `Reorder received (PO #${reorder.id})`,
      },
    });
  }

  const updated = await prisma.reorder.update({
    where: { id: parseInt(id) },
    data,
    include: {
      product: { include: { category: true } },
      supplier: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.reorder.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
