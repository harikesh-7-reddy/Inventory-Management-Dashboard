import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/products/[id]/adjust-stock
// Body: { qty: number (positive=IN, negative=OUT), reason: string }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const qty = parseInt(body.qty);
  const reason = body.reason || "Manual adjustment";

  if (isNaN(qty)) {
    return NextResponse.json({ error: "qty must be a number" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const newStock = product.stockQty + qty;
  if (newStock < 0) {
    return NextResponse.json(
      { error: "Insufficient stock for this adjustment" },
      { status: 400 }
    );
  }

  const [updated] = await Promise.all([
    prisma.product.update({
      where: { id: parseInt(id) },
      data: { stockQty: newStock },
      include: { category: true, supplier: true },
    }),
    prisma.stockMovement.create({
      data: {
        productId: parseInt(id),
        type: qty > 0 ? "IN" : qty < 0 ? "OUT" : "ADJUST",
        qty: Math.abs(qty),
        reason,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
