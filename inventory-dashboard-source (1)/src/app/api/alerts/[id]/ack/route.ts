import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/alerts/[id]/ack
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alert = await prisma.alert.update({
    where: { id: parseInt(id) },
    data: { acknowledgedAt: new Date() },
  });

  return NextResponse.json(alert);
}
