import { NextRequest, NextResponse } from "next/server";
import { createAdminByFounder, listUsers, publicUser } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** List all accounts — founder only. */
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["founder"]);
  if ("response" in auth) return auth.response;
  return NextResponse.json({ users: listUsers().map(publicUser) });
}

/** Create an ADMIN account — founder (owner / super admin) only. */
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["founder"]);
  if ("response" in auth) return auth.response;
  try {
    const body = await req.json();
    const admin = createAdminByFounder(auth.user, {
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
    });
    return NextResponse.json({ user: publicUser(admin) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
