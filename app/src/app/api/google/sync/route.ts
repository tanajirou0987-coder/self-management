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
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: serviceAccountKey!.replace(/\\n/g, "\n"),
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
    return Response.json({
      events: [],
      message:
        "Google カレンダー連携の資格情報(GOOGLE_SERVICE_ACCOUNT_*)が設定されていません。",
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
    return Response.json(
      {
        message:
          "Google カレンダー連携で問題が発生しました。認証設定を再確認してください。",
        events: [],
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
