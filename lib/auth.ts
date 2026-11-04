import { NextRequest, NextResponse } from "next/server";
import { userForToken } from "./db";
import type { Role, User } from "./types";

/** Extract the Bearer token from an incoming request and resolve the user. */
export function userFromRequest(req: NextRequest): User | undefined {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  return userForToken(token);
}

export function requireRole(req: NextRequest, roles: Role[]): { user: User } | { response: NextResponse } {
  const user = userFromRequest(req);
  if (!user) {
    return { response: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }
  if (!roles.includes(user.role)) {
    return { response: NextResponse.json({ error: "You don't have permission for this action" }, { status: 403 }) };
  }
  return { user };
}
