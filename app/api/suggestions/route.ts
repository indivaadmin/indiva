import { NextRequest, NextResponse } from "next/server";
import { listProducts, suggestProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Product suggestions for the storefront: featured first, optionally related to a product. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (productId) return NextResponse.json({ products: suggestProducts(productId) });
  const featured = listProducts().filter((p) => p.featured);
  const rest = listProducts().filter((p) => !p.featured);
  return NextResponse.json({ products: [...featured, ...rest].slice(0, 8) });
}
