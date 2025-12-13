import { NextResponse } from "next/server";

const sessionCookieName = "self-mgmt-session";

export async function POST(request: Request) {
  const accessCode = process.env.APP_ACCESS_CODE;
  const sessionToken = process.env.APP_SESSION_TOKEN;

  if (!accessCode || !sessionToken) {
    return NextResponse.json(
      {
        message:
          "APP_ACCESS_CODE と APP_SESSION_TOKEN が環境変数に設定されていません。",
      },
      { status: 500 },
    );
  }

  const { passcode } = (await request.json().catch(() => ({}))) as {
    passcode?: string;
  };

  if (!passcode) {
    return NextResponse.json({ message: "passcode が必要です。" }, { status: 400 });
  }

  if (passcode !== accessCode) {
    return NextResponse.json({ message: "認証に失敗しました。" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: sessionCookieName,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
