import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ analytics: getAnalytics() });
}
