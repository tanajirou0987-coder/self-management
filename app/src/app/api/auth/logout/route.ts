import { NextResponse } from "next/server";

const sessionCookieName = "self-mgmt-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(sessionCookieName);
  return response;
}
