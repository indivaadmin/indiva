import { NextRequest, NextResponse } from "next/server";
import { listCustomers } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Customer list — admin or founder only. */
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin", "founder"]);
  if ("response" in auth) return auth.response;
  return NextResponse.json({ customers: listCustomers() });
}
