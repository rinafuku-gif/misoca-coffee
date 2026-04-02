import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// コーヒースタンドのカレンダーID（共有済みの公開カレンダー）
const STAND_CALENDAR_ID = "misocacoffee@gmail.com";

export interface StandEvent {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  description: string;
}

function getAuth() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    const creds = JSON.parse(fs.readFileSync(credPath, "utf-8")) as {
      client_email: string;
      private_key: string;
    };
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  }

  const jsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonBase64) {
    const creds = JSON.parse(
      Buffer.from(jsonBase64, "base64").toString("utf-8")
    ) as { client_email: string; private_key: string };
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  }

  throw new Error(
    "GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON is required"
  );
}

function toDateString(dateTime: string): string {
  const d = new Date(dateTime);
  const parts = d
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function toTimeString(dateTime: string): string {
  const d = new Date(dateTime);
  return d.toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  if (
    isNaN(year) ||
    isNaN(month) ||
    month < 1 ||
    month > 12 ||
    year < 2000 ||
    year > 2100
  ) {
    return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
  }

  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const mm = String(month).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    const lastDayStr = String(lastDay).padStart(2, "0");
    const timeMin = `${year}-${mm}-01T00:00:00+09:00`;
    const timeMax = `${year}-${mm}-${lastDayStr}T23:59:59+09:00`;

    const response = await calendar.events.list({
      calendarId: STAND_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    const events = response.data.items ?? [];

    const standEvents: StandEvent[] = events
      .filter((event) => {
        const summary = event.summary ?? "";
        return summary.toLowerCase().includes("misoca coffee stand");
      })
      .map((event): StandEvent | null => {
        const startDateTime = event.start?.dateTime;
        const endDateTime = event.end?.dateTime;
        if (!startDateTime || !endDateTime) return null;

        return {
          date: toDateString(startDateTime),
          startTime: toTimeString(startDateTime),
          endTime: toTimeString(endDateTime),
          description: event.description ?? "",
        };
      })
      .filter((e): e is StandEvent => e !== null);

    return NextResponse.json({ events: standEvents });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch calendar", detail: message },
      { status: 500 }
    );
  }
}
