import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Founder dashboard analytics — founder only. */
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["founder"]);
  if ("response" in auth) return auth.response;
  return NextResponse.json({ analytics: getAnalytics() });
}
