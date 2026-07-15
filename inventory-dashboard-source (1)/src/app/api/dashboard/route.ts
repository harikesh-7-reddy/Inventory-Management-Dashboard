import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — aggregated KPIs + chart data
export async function GET() {
  const [
    totalProducts,
    totalSuppliers,
    totalCategories,
    allProducts,
    pendingReorders,
    recentMovements,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.supplier.count(),
    prisma.category.count(),
    prisma.product.findMany({
      include: { category: true },
    }),
    prisma.reorder.count({ where: { status: { in: ["PENDING", "SENT"] } } }),
    prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, sku: true } } },
    }),
    prisma.product.findMany({
      where: { stockQty: { lte: 0 } },
      select: { id: true },
    }),
  ]);

  const inventoryValue = allProducts.reduce(
    (sum, p) => sum + Number(p.unitCost) * p.stockQty,
    0
  );
  const retailValue = allProducts.reduce(
    (sum, p) => sum + Number(p.price) * p.stockQty,
    0
  );

  // Low stock count: stock <= reorderPoint
  const lowStockCount = allProducts.filter(
    (p) => p.stockQty <= p.reorderPoint
  ).length;
  const outOfStockCount = allProducts.filter(
    (p) => p.stockQty <= 0
  ).length;
  const watchStockCount = allProducts.filter(
    (p) => p.stockQty <= p.reorderPoint * 1.5 && p.stockQty > p.reorderPoint
  ).length;

  // Category breakdown
  const categoryMap = new Map<string, { count: number; value: number }>();
  for (const p of allProducts) {
    const catName = p.category?.name || "Uncategorized";
    const existing = categoryMap.get(catName) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += Number(p.unitCost) * p.stockQty;
    categoryMap.set(catName, existing);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([name, data]) => ({
      name,
      count: data.count,
      value: Math.round(data.value * 100) / 100,
    })
  );

  // Stock status distribution
  const stockStatus = [
    { name: "Out of Stock", value: outOfStockCount, color: "#ef4444" },
    {
      name: "Low Stock",
      value: lowStockCount - outOfStockCount,
      color: "#f59e0b",
    },
    { name: "Watch", value: watchStockCount, color: "#3b82f6" },
    {
      name: "Healthy",
      value: totalProducts - watchStockCount - (lowStockCount - outOfStockCount) - outOfStockCount,
      color: "#22c55e",
    },
  ].filter((s) => s.value >= 0);

  // Top products by inventory value
  const topProductsByValue = [...allProducts]
    .map((p) => ({
      name: p.name,
      sku: p.sku,
      stockQty: p.stockQty,
      value: Math.round(Number(p.unitCost) * p.stockQty * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Stock movement trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const movements = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { type: true, qty: true, createdAt: true },
  });

  const trendMap = new Map<string, string>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    trendMap.set(key, key);
  }

  const movementTrend = Array.from(trendMap.keys()).map((dateKey) => {
    const dayMovements = movements.filter(
      (m) => m.createdAt.toISOString().split("T")[0] === dateKey
    );
    const inQty = dayMovements
      .filter((m) => m.type === "IN")
      .reduce((s, m) => s + m.qty, 0);
    const outQty = dayMovements
      .filter((m) => m.type === "OUT")
      .reduce((s, m) => s + m.qty, 0);
    return {
      date: dateKey.split("-").slice(1).join("/"),
      stockIn: inQty,
      stockOut: outQty,
    };
  });

  return NextResponse.json({
    kpis: {
      totalProducts,
      totalSuppliers,
      totalCategories,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      retailValue: Math.round(retailValue * 100) / 100,
      lowStockCount,
      outOfStockCount,
      watchStockCount,
      pendingReorders,
    },
    categoryBreakdown,
    stockStatus,
    topProductsByValue,
    movementTrend,
    recentMovements: recentMovements.map((m) => ({
      id: m.id,
      type: m.type,
      qty: m.qty,
      reason: m.reason,
      productName: m.product.name,
      productSku: m.product.sku,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
