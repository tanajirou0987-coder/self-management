import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // 本番環境では詳細情報を返さない（セキュリティのため）
  const isProduction = process.env.NODE_ENV === "production";
  
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  const missingCredentials =
    !calendarId || !serviceAccountEmail || !serviceAccountKey;

  // private_keyの形式を確認
  const keyStartsWith = serviceAccountKey?.substring(0, 30) ?? "";
  const keyEndsWith = serviceAccountKey?.substring(Math.max(0, (serviceAccountKey?.length ?? 0) - 30)) ?? "";
  const hasNewlines = serviceAccountKey?.includes("\n") ?? false;
  const hasEscapedNewlines = serviceAccountKey?.includes("\\n") ?? false;
  const keyFormat = hasNewlines ? "actual_newlines" : hasEscapedNewlines ? "escaped_newlines" : "unknown";

  const debugInfo = {
    hasCalendarId: !!calendarId,
    hasServiceAccountEmail: !!serviceAccountEmail,
    hasServiceAccountKey: !!serviceAccountKey,
    calendarIdLength: calendarId?.length ?? 0,
    serviceAccountEmailLength: serviceAccountEmail?.length ?? 0,
    serviceAccountKeyLength: serviceAccountKey?.length ?? 0,
    serviceAccountKeyStartsWith: keyStartsWith,
    serviceAccountKeyEndsWith: keyEndsWith,
    keyFormat,
    hasNewlines,
    hasEscapedNewlines,
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


