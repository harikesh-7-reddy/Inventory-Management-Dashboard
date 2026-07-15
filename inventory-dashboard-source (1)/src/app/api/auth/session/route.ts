import { NextResponse } from "next/server";
import { getShopFromSession } from "@/lib/auth";

export async function GET() {
  const shop = await getShopFromSession();
  return NextResponse.json({ shop });
}
