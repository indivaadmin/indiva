import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ customers: listCustomers() });
}
