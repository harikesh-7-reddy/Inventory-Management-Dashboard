import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const supplier = searchParams.get("supplier") || "";
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }
  if (category && category !== "all") where.categoryId = parseInt(category);
  if (supplier && supplier !== "all") where.supplierId = parseInt(supplier);

  if (status && status !== "all") {
    if (status === "critical") where.stockQty = { equals: 0 };
    else if (status === "low-stock")
      where.AND = [
        { stockQty: { gt: 0 } },
        { stockQty: { lte: 50 } },
      ];
    else if (status === "in-stock") where.stockQty = { gt: 50 };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, supplier: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  if (!body.sku || !body.name || !body.categoryId || !body.supplierId) {
    return NextResponse.json(
      { error: "Missing required fields: sku, name, categoryId, supplierId" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        description: body.description || null,
        categoryId: parseInt(body.categoryId),
        supplierId: parseInt(body.supplierId),
        unit: body.unit || "pcs",
        unitCost: parseFloat(body.unitCost),
        price: parseFloat(body.price),
        stockQty: parseInt(body.stockQty) || 0,
        reorderPoint: parseInt(body.reorderPoint) || 10,
        reorderQty: parseInt(body.reorderQty) || 50,
      },
      include: { category: true, supplier: true },
    });

    // Log initial stock as an IN movement
    if (product.stockQty > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          qty: product.stockQty,
          reason: "Initial stock",
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
