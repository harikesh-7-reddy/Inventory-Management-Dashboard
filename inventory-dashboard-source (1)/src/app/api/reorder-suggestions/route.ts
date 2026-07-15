import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeReorderSuggestion } from "@/lib/reorder-engine";

// GET /api/reorder-suggestions
// Computes reorder suggestions for all products based on consumption patterns
export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      supplier: true,
      stockMovements: {
        where: {
          type: "OUT",
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: { qty: true },
      },
    },
  });

  const suggestions = products
    .map((product) => {
      const totalConsumed = product.stockMovements.reduce(
        (sum, m) => sum + m.qty,
        0
      );

      const suggestion = computeReorderSuggestion({
        productId: product.id,
        stockQty: product.stockQty,
        reorderPoint: product.reorderPoint,
        reorderQty: product.reorderQty,
        unitCost: Number(product.unitCost),
        totalConsumed,
        periodDays: 90,
        leadTimeDays: product.supplier.leadTimeDays,
      });

      return {
        ...suggestion,
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          stockQty: product.stockQty,
          reorderPoint: product.reorderPoint,
          unit: product.unit,
        },
        supplier: {
          id: product.supplier.id,
          name: product.supplier.name,
          leadTimeDays: product.supplier.leadTimeDays,
        },
      };
    })
    .filter((s) => s.severity !== null)
    .sort((a, b) => {
      const severityOrder: Record<string, number> = {
        CRITICAL: 0,
        LOW: 1,
        WATCH: 2,
      };
      return (
        (severityOrder[a.severity] ?? 3) -
        (severityOrder[b.severity] ?? 3)
      );
    });

  return NextResponse.json(suggestions);
}
