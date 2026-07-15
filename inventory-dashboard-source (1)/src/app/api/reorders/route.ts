import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reorders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const reorders = await prisma.reorder.findMany({
    where,
    include: {
      product: { include: { category: true } },
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reorders);
}

// POST /api/reorders — create a new reorder
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.productId || !body.qty) {
    return NextResponse.json(
      { error: "Missing required fields: productId, qty" },
      { status: 400 }
    );
  }

  const qty = parseInt(body.qty);
  if (isNaN(qty) || qty <= 0) {
    return NextResponse.json(
      { error: "qty must be a positive integer" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(body.productId) },
  });
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const unitCost = Number(product.unitCost);
  const totalCost = unitCost * qty;

  const reorder = await prisma.reorder.create({
    data: {
      productId: parseInt(body.productId),
      supplierId: parseInt(body.supplierId || product.supplierId),
      qty,
      status: body.status || "PENDING",
      unitCost,
      totalCost,
      notes: body.notes || null,
      receivedAt: body.status === "RECEIVED" ? new Date() : null,
    },
    include: {
      product: { include: { category: true } },
      supplier: true,
    },
  });

  // If received, increment stock and log movement
  if (body.status === "RECEIVED") {
    await prisma.product.update({
      where: { id: parseInt(body.productId) },
      data: { stockQty: { increment: qty } },
    });
    await prisma.stockMovement.create({
      data: {
        productId: parseInt(body.productId),
        type: "IN",
        qty,
        reason: `Reorder received (PO #${reorder.id})`,
      },
    });
  }

  return NextResponse.json(reorder, { status: 201 });
}
