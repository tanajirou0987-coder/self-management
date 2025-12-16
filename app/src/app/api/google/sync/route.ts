import { NextRequest } from "next/server";
import { google } from "googleapis";
import { endOfDay, startOfDay } from "date-fns";
import { v4 as uuid } from "uuid";

const calendarId = process.env.GOOGLE_CALENDAR_ID;
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const missingCredentials =
  !calendarId || !serviceAccountEmail || !serviceAccountKey;

const getCalendarClient = () => {
  // private_keyの処理: 様々な形式に対応
  let processedKey = serviceAccountKey!;
  
  // 1. 前後の余分な空白やクォートを削除（最初に実行）
  processedKey = processedKey.trim().replace(/^["']|["']$/g, "");
  
  // 2. 実際の改行を\nに統一（Windows形式の改行も対応）
  processedKey = processedKey.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  // 3. \\nを\nに変換（エスケープされた改行）
  // 複数回実行して、ネストされたエスケープにも対応
  while (processedKey.includes("\\n")) {
    processedKey = processedKey.replace(/\\n/g, "\n");
  }
  
  // 4. 連続する改行を1つに統一（念のため）
  processedKey = processedKey.replace(/\n{3,}/g, "\n\n");
  
  // 5. 秘密鍵の開始・終了マーカーを確認
  if (!processedKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("Invalid private key format: missing BEGIN marker");
  }
  if (!processedKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Invalid private key format: missing END marker");
  }
  
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: processedKey,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return google.calendar({ version: "v3", auth });
};

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return Response.json({ message: "date クエリが必要です" }, { status: 400 });
  }

  if (missingCredentials) {
    const missingVars = [];
    if (!calendarId) missingVars.push("GOOGLE_CALENDAR_ID");
    if (!serviceAccountEmail) missingVars.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    if (!serviceAccountKey) missingVars.push("GOOGLE_SERVICE_ACCOUNT_KEY");
    
    return Response.json({
      events: [],
      message:
        `Google カレンダー連携の資格情報が設定されていません。未設定の環境変数: ${missingVars.join(", ")}`,
      error: "Missing credentials",
    });
  }

  try {
    const calendar = getCalendarClient();
    const timeMin = startOfDay(new Date(date)).toISOString();
    const timeMax = endOfDay(new Date(date)).toISOString();

    const eventsResponse = await calendar.events.list({
      calendarId: calendarId!,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events =
      eventsResponse.data.items?.map((event) => ({
        id: event?.id ?? uuid(),
        title: event?.summary ?? "予定",
        start:
          event?.start?.dateTime ?? `${event?.start?.date ?? date}T00:00:00`,
        end: event?.end?.dateTime ?? `${event?.end?.date ?? date}T00:00:00`,
        location: event?.location ?? undefined,
        description: event?.description ?? undefined,
        source: "google" as const,
      })) ?? [];

    return Response.json({ events });
  } catch (error) {
    console.error("Google calendar sync failed", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // デコードエラーの場合、より詳細な情報を提供
    const isDecodeError = errorMessage.includes("DECODER") || errorMessage.includes("1E08010C");
    const isAuthError = errorMessage.includes("auth") || errorMessage.includes("401") || errorMessage.includes("403");
    
    let detailedMessage = errorMessage;
    if (isDecodeError) {
      detailedMessage = `秘密鍵の形式が正しくありません。環境変数GOOGLE_SERVICE_ACCOUNT_KEYを確認してください。エラー: ${errorMessage}`;
    } else if (isAuthError) {
      detailedMessage = `認証エラー: ${errorMessage}。環境変数とカレンダー共有設定を確認してください。`;
    }
    
    return Response.json(
      {
        message: `Google カレンダー連携で問題が発生しました: ${detailedMessage}`,
        events: [],
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      },
      { status: 500 },
    );
  }
}

// Create a new calendar event
export async function POST(request: NextRequest) {
  if (missingCredentials) {
    return Response.json(
      { message: "Google カレンダー連携の資格情報が設定されていません。" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { title, start, end, description, location } = body;

    if (!title || !start || !end) {
      return Response.json(
        { message: "title, start, end は必須です。" },
        { status: 400 },
      );
    }

    const calendar = getCalendarClient();
    const result = await calendar.events.insert({
      calendarId: calendarId!,
      requestBody: {
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end },
        description,
        location,
      },
    });

    return Response.json({
      success: true,
      event: {
        id: result.data.id,
        title: result.data.summary,
        start: result.data.start?.dateTime,
        end: result.data.end?.dateTime,
        source: "google" as const,
      },
    });
  } catch (error) {
    console.error("Failed to create calendar event", error);
    return Response.json(
      { message: "予定の作成に失敗しました。" },
      { status: 500 },
    );
  }
}

// Delete a calendar event
export async function DELETE(request: NextRequest) {
  if (missingCredentials) {
    return Response.json(
      { message: "Google カレンダー連携の資格情報が設定されていません。" },
      { status: 400 },
    );
  }

  try {
    const eventId = request.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      return Response.json(
        { message: "eventId は必須です。" },
        { status: 400 },
      );
    }

    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: calendarId!,
      eventId,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete calendar event", error);
    return Response.json(
      { message: "予定の削除に失敗しました。" },
      { status: 500 },
    );
  }
}
