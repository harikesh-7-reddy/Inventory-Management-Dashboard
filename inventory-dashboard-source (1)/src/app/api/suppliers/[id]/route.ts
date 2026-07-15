import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: { include: { category: true }, orderBy: { name: "asc" } },
    },
  });

  if (!supplier)
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.address !== undefined) data.address = body.address;
  if (body.leadTimeDays !== undefined)
    data.leadTimeDays = parseInt(body.leadTimeDays);
  if (body.rating !== undefined) data.rating = parseFloat(body.rating);

  const supplier = await prisma.supplier.update({
    where: { id: parseInt(id) },
    data,
  });

  return NextResponse.json(supplier);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.supplier.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
