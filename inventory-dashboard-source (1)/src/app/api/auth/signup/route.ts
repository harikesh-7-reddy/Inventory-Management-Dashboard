import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { shopName?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const shopName = body.shopName?.trim();
  const password = body.password;

  if (!shopName || !password) {
    return NextResponse.json(
      { error: "Shop name and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.shop.findUnique({ where: { shopName } });
  if (existing) {
    return NextResponse.json(
      { error: "A shop with this name already exists" },
      { status: 409 }
    );
  }

  const shop = await prisma.shop.create({
    data: { shopName, passwordHash: hashPassword(password) },
  });

  const { cookieToken, expiresAt } = await createSession(shop.id);
  const res = NextResponse.json(
    { shop: { id: shop.id, shopName: shop.shopName } },
    { status: 201 }
  );
  res.cookies.set(SESSION_COOKIE, cookieToken, {
    ...sessionCookieOptions(),
    expires: expiresAt,
  });
  return res;
}
