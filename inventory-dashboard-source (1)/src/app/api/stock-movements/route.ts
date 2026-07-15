import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stock-movements
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (productId) where.productId = parseInt(productId);
  if (type && type !== "all") where.type = type;

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: { select: { name: true, sku: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(movements);
}
