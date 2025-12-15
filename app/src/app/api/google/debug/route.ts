import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // 本番環境では詳細情報を返さない（セキュリティのため）
  const isProduction = process.env.NODE_ENV === "production";
  
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  const missingCredentials =
    !calendarId || !serviceAccountEmail || !serviceAccountKey;

  const debugInfo = {
    hasCalendarId: !!calendarId,
    hasServiceAccountEmail: !!serviceAccountEmail,
    hasServiceAccountKey: !!serviceAccountKey,
    calendarIdLength: calendarId?.length ?? 0,
    serviceAccountEmailLength: serviceAccountEmail?.length ?? 0,
    serviceAccountKeyLength: serviceAccountKey?.length ?? 0,
    serviceAccountKeyStartsWith: serviceAccountKey?.substring(0, 30) ?? "",
    missingCredentials,
  };

  if (isProduction) {
    // 本番環境では簡易情報のみ
    return Response.json({
      configured: !missingCredentials,
      message: missingCredentials
        ? "環境変数が設定されていません"
        : "環境変数は設定されています",
    });
  }

  // 開発環境では詳細情報を返す
  return Response.json({
    configured: !missingCredentials,
    debug: debugInfo,
    message: missingCredentials
      ? "環境変数が設定されていません"
      : "環境変数は設定されています",
  });
}

