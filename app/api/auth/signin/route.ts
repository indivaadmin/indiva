import { NextRequest, NextResponse } from "next/server";
import { publicUser, signIn } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, token } = signIn(String(body.email ?? ""), String(body.password ?? ""));
    return NextResponse.json({ user: publicUser(user), token });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
