import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/lib/db";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  if (!VALID.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of ${VALID.join(", ")}` }, { status: 400 });
  }
  const order = updateOrderStatus(id, body.status);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
