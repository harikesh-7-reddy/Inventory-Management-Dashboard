import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/alerts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");
  const unacknowledged = searchParams.get("unacknowledged") === "true";

  const where: Record<string, unknown> = {};
  if (severity && severity !== "all") where.severity = severity;
  if (unacknowledged) where.acknowledgedAt = null;

  const alerts = await prisma.alert.findMany({
    where,
    include: {
      product: { include: { supplier: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(alerts);
}

// POST /api/alerts/[id]/ack — handled in [id]/ack/route.ts
