import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
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

  const shop = await prisma.shop.findUnique({ where: { shopName } });

  // Always run verifyPassword (even on a miss) to prevent timing-based
  // username enumeration — the computation time should be the same whether
  // the shop exists or not.
  const passwordOk = shop
    ? verifyPassword(password, shop.passwordHash)
    : verifyPassword(password, hashPassword(""));

  if (!shop || !passwordOk) {
    return NextResponse.json(
      { error: "Invalid shop name or password" },
      { status: 401 }
    );
  }

  const { cookieToken, expiresAt } = await createSession(shop.id);
  const res = NextResponse.json({ shop: { id: shop.id, shopName: shop.shopName } });
  res.cookies.set(SESSION_COOKIE, cookieToken, {
    ...sessionCookieOptions(),
    expires: expiresAt,
  });
  return res;
}
