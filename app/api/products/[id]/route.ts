import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProduct, suggestProducts, updateProduct } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const product = getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product, suggestions: suggestProducts(id) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireRole(req, ["admin", "founder"]);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "description", "price", "category", "tags", "stock", "featured", "rating", "reviews", "image"] as const) {
    if (k in body) patch[k] = body[k];
  }
  const updated = updateProduct(id, patch);
  if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireRole(req, ["admin", "founder"]);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  if (!deleteProduct(id)) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
