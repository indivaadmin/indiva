import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** List orders — admin or founder only. */
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin", "founder"]);
  if ("response" in auth) return auth.response;
  return NextResponse.json({ orders: listOrders() });
}

/** Place an order — public (customers). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = createOrder({
      customerName: String(body.customerName ?? "").trim(),
      email: String(body.email ?? "").trim(),
      items: Array.isArray(body.items) ? body.items : [],
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
