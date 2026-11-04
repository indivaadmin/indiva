import { NextRequest, NextResponse } from "next/server";
import { publicUser, signUp } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public sign-up — creates CUSTOMER accounts only. Admins are assigned by the founder. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = signUp({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
    });
    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
