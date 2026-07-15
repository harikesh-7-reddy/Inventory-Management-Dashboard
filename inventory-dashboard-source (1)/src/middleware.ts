import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-compatible middleware (runs in Edge Runtime).
 *
 * Uses the Web Crypto API (SubtleCrypto) instead of Node's "crypto" module
 * so it works in the Edge Runtime.
 *
 * Token format:  <dbToken>.<hmac>
 * Both middleware and src/lib/auth.ts use the same secret and algorithm.
 */

const ENCODER = new TextEncoder();

const PUBLIC_PATHS = ["/login", "/api/auth"];
const STATIC_PREFIXES = ["/_next", "/favicon.ico", "/icons"];

function isPublic(pathname: string): boolean {
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Cache the imported key per-secret so we don't re-import on every request
let cachedKey: CryptoKey | null = null;
let cachedSecret = "";

async function getKey(): Promise<CryptoKey> {
  const secret =
    process.env.AUTH_HMAC_SECRET ||
    process.env.DATABASE_URL ||
    "fallback-dev-secret";

  if (cachedKey && cachedSecret === secret) return cachedKey;

  cachedKey = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  cachedSecret = secret;
  return cachedKey;
}

async function verifyToken(token: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.substring(0, dot);
  const sigHex = token.substring(dot + 1);

  const key = await getKey();
  const expectedBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    ENCODER.encode(payload)
  );
  const expectedHex = Array.from(new Uint8Array(expectedBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (sigHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < sigHex.length; i++) {
    diff |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
