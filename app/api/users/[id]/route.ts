import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Remove an admin account — founder only, and never the founder account itself. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireRole(req, ["founder"]);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  if (!deleteUser(id, auth.user)) {
    return NextResponse.json({ error: "Cannot delete this account (founder accounts are protected)" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
