import { NextRequest, NextResponse } from "next/server";
import { signOut, userForToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token && userForToken(token)) signOut(token);
  return NextResponse.json({ ok: true });
}
