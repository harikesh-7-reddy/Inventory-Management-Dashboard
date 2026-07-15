import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const body = await request.json();

  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      leadTimeDays: parseInt(body.leadTimeDays) || 7,
      rating: parseFloat(body.rating) || 3,
    },
  });

  return NextResponse.json(supplier, { status: 201 });
}
