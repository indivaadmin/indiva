import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

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
