import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "session_token";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const HMAC_SECRET =
  process.env.AUTH_HMAC_SECRET ||
  process.env.DATABASE_URL ||
  "fallback-dev-secret";

/**
 * The token stored in the DB is a random hex string.
 * The token stored in the COOKIE is `<dbToken>.<hmac>` so that Edge
 * middleware can verify authenticity without a DB call.
 */
function signToken(dbToken: string): string {
  const sig = createHmac("sha256", HMAC_SECRET)
    .update(dbToken)
    .digest("hex");
  return `${dbToken}.${sig}`;
}

export function unsignToken(cookieToken: string): string | null {
  const dot = cookieToken.lastIndexOf(".");
  if (dot < 1) return null;
  const dbToken = cookieToken.substring(0, dot);
  const sig = cookieToken.substring(dot + 1);
  const expected = createHmac("sha256", HMAC_SECRET)
    .update(dbToken)
    .digest("hex");
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0 ? dbToken : null;
}

/* ---------- password hashing ---------- */

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const testHash = scryptSync(plain, salt, 64);
  const storedHash = Buffer.from(hash, "hex");
  if (testHash.length !== storedHash.length) return false;
  return timingSafeEqual(testHash, storedHash);
}

/* ---------- session management ---------- */

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(shopId: number): Promise<{ token: string; cookieToken: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: { shopId, token, expiresAt },
  });

  return { token, cookieToken: signToken(token), expiresAt };
}

export async function deleteSession(cookieToken: string): Promise<void> {
  const dbToken = unsignToken(cookieToken) ?? cookieToken;
  await prisma.session.deleteMany({ where: { token: dbToken } });
}

/**
 * Reads the session cookie from the incoming request and returns the
 * associated Shop if the session is valid and not expired.
 */
export async function getShopFromSession(): Promise<{ id: number; shopName: string } | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookieToken) return null;

  // Unsign the cookie token to get the DB token
  const dbToken = unsignToken(cookieToken);
  if (!dbToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: dbToken },
    include: { shop: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return { id: session.shop.id, shopName: session.shop.shopName };
}

/* ---------- cookie helpers ---------- */

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
