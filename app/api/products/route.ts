import { NextRequest, NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.toLowerCase();
  const featured = searchParams.get("featured");
  let products = listProducts();
  if (category) products = products.filter((p) => p.category === category);
  if (q) products = products.filter((p) => (p.name + " " + p.description + " " + p.tags.join(" ")).toLowerCase().includes(q));
  if (featured === "1") products = products.filter((p) => p.featured);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.price !== "number" || !body.category) {
      return NextResponse.json({ error: "name, price and category are required" }, { status: 400 });
    }
    const product = createProduct({
      name: String(body.name),
      description: String(body.description ?? ""),
      price: Number(body.price),
      category: String(body.category),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      stock: Number(body.stock ?? 0),
      featured: Boolean(body.featured),
      rating: body.rating ? Number(body.rating) : undefined,
      reviews: body.reviews ? Number(body.reviews) : undefined,
      image: body.image ? String(body.image) : undefined,
    } as Parameters<typeof createProduct>[0]);
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
