import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      supplier: true,
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.sku !== undefined) data.sku = body.sku;
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.categoryId !== undefined)
    data.categoryId = parseInt(body.categoryId);
  if (body.supplierId !== undefined)
    data.supplierId = parseInt(body.supplierId);
  if (body.unit !== undefined) data.unit = body.unit;
  if (body.unitCost !== undefined) data.unitCost = parseFloat(body.unitCost);
  if (body.price !== undefined) data.price = parseFloat(body.price);
  if (body.stockQty !== undefined) data.stockQty = parseInt(body.stockQty);
  if (body.reorderPoint !== undefined)
    data.reorderPoint = parseInt(body.reorderPoint);
  if (body.reorderQty !== undefined) data.reorderQty = parseInt(body.reorderQty);

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data,
    include: { category: true, supplier: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
