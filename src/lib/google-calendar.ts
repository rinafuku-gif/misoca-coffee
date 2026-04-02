import { google } from "googleapis";
import crypto from "crypto";

// ---- 型定義 ----------------------------------------------------------------

export type ExperienceType = "プライベート焙煎体験" | "グループ焙煎体験" | "出張焙煎体験";

export interface CalendarSlot {
  eventId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  experienceType: ExperienceType;
  summary: string;
}

// ---- シングルトン -----------------------------------------------------------

let _auth: ReturnType<typeof createAuth> | null = null;

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}

function createAuth() {
  // 方式1: GOOGLE_APPLICATION_CREDENTIALS（JSONファイルパス）を優先
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const fs = require("fs") as typeof import("fs");
    const creds = JSON.parse(fs.readFileSync(credPath, "utf-8"));
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
  }

  // 方式2: 環境変数から直接読む（Vercel本番用）
  const email = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const rawKey = getRequiredEnv("GOOGLE_PRIVATE_KEY");

  let privateKey: string;
  if (rawKey.includes("-----BEGIN")) {
    privateKey = rawKey.replace(/\\n/g, "\n");
  } else {
    privateKey = Buffer.from(rawKey, "base64").toString("utf-8");
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getAuth() {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getAuth() });
}

function getCalendarId(): string {
  return getRequiredEnv("GOOGLE_CALENDAR_ID");
}

// ---- 体験種別の判定 ---------------------------------------------------------

const EXPERIENCE_TYPE_MAP: [string, ExperienceType][] = [
  ["プライベート", "プライベート焙煎体験"],
  ["グループ", "グループ焙煎体験"],
  ["出張", "出張焙煎体験"],
];

function resolveExperienceType(summary: string): ExperienceType {
  for (const [keyword, type] of EXPERIENCE_TYPE_MAP) {
    if (summary.includes(keyword)) return type;
  }
  // デフォルト
  return "プライベート焙煎体験";
}

// ---- 日時パース ------------------------------------------------------------

function toDateString(dateTime: string): string {
  // dateTime は ISO8601 (e.g. "2024-11-01T10:00:00+09:00")
  // Vercel(UTC) 環境でもずれないよう JST ロケールで変換する
  const d = new Date(dateTime);
  const parts = d
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  // ja-JP ロケールは "YYYY/MM/DD" 形式で返る
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function toTimeString(dateTime: string): string {
  const d = new Date(dateTime);
  // Vercel(UTC) 環境でもずれないよう JST ロケールで変換する
  return d.toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ---- 公開API ----------------------------------------------------------------

/**
 * 指定月の予約可能枠を取得する。
 * タイトルに「予約可能」を含むイベントのみを返す。
 */
export async function getAvailableSlots(
  year: number,
  month: number
): Promise<CalendarSlot[]> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  // JST オフセットを明示してタイムゾーンずれを防ぐ
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = String(lastDay).padStart(2, "0");
  const timeMin = `${year}-${mm}-01T00:00:00+09:00`;
  const timeMax = `${year}-${mm}-${lastDayStr}T23:59:59+09:00`;

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const events = response.data.items ?? [];

  return events
    .filter((event) => {
      const summary = event.summary ?? "";
      return summary.includes("予約可能");
    })
    .map((event): CalendarSlot => {
      const summary = event.summary ?? "";
      const startDateTime = event.start?.dateTime ?? "";
      const endDateTime = event.end?.dateTime ?? "";

      return {
        eventId: event.id ?? "",
        date: toDateString(startDateTime),
        startTime: toTimeString(startDateTime),
        endTime: toTimeString(endDateTime),
        experienceType: resolveExperienceType(summary),
        summary,
      };
    })
    .filter((slot) => slot.eventId !== "");
}

/**
 * 指定イベントが「まだ予約可能か」を確認する。
 * タイトルに「予約可能」が含まれている場合のみ true を返す（二重予約防止）。
 */
export async function isSlotAvailable(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.events.get({ calendarId, eventId });
  const summary = response.data.summary ?? "";
  return summary.includes("予約可能");
}

export interface ReservationInfo {
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  transportation: string;
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  numberOfGuests: number;
  coffeeDrinkingFrequency: string;
  experienceType: string;
  cancellationToken: string;
  paymentIntentId?: string;
}

/**
 * 予約確定時にイベントを書き換える。
 * タイトル →「予約済み｜{name}」
 * 説明 → 予約者情報すべて + キャンセルトークン + Stripe Payment Intent ID
 */
export async function bookSlot(
  eventId: string,
  info: ReservationInfo
): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const descriptionLines = [
    `【予約者情報】`,
    `お名前: ${info.name}`,
    `フリガナ: ${info.nameKana}`,
    `メールアドレス: ${info.email}`,
    `電話番号: ${info.phone}`,
    `生年月日: ${info.birthDate}`,
    `住所: ${info.address}`,
    `来店交通手段: ${info.transportation}`,
    `体験種別: ${info.experienceType}`,
    `来店人数: ${info.numberOfGuests}名`,
    `コーヒーを飲む頻度: ${info.coffeeDrinkingFrequency}`,
    `焙煎体験の有無: ${info.roastingExperience}`,
    `好きなコーヒー: ${info.favoriteCoffee}`,
    `きっかけ: ${info.howFound}`,
    ``,
    `cancellationToken:${info.cancellationToken}`,
  ];

  if (info.paymentIntentId) {
    descriptionLines.push(`stripePaymentIntentId:${info.paymentIntentId}`);
  }

  const description = descriptionLines.join("\n");

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      summary: `予約済み｜${info.name}`,
      description,
    },
  });
}

export interface SlotDateTime {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * イベントIDから日時情報を取得する
 */
export async function getSlotDateTime(eventId: string): Promise<SlotDateTime> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.events.get({ calendarId, eventId });
  const startDateTime = response.data.start?.dateTime ?? "";
  const endDateTime = response.data.end?.dateTime ?? "";

  return {
    date: startDateTime ? toDateString(startDateTime) : "",
    startTime: startDateTime ? toTimeString(startDateTime) : "",
    endTime: endDateTime ? toTimeString(endDateTime) : "",
  };
}

export interface CancelledReservationInfo {
  name: string;
  email: string;
  experienceType: string;
  date: string;
  startTime: string;
  paymentIntentId?: string;
}

/**
 * キャンセル時にイベントを「予約可能｜○○」に戻す。
 * キャンセルトークンの検証も行う。
 * 戻り値: 成功時は予約者情報 / トークン不一致は null
 */
export async function cancelSlot(
  eventId: string,
  cancellationToken: string
): Promise<CancelledReservationInfo | null> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.events.get({ calendarId, eventId });
  const description = response.data.description ?? "";

  // トークン検証
  const tokenLine = description
    .split("\n")
    .find((line) => line.startsWith("cancellationToken:"));

  if (!tokenLine) return null;

  const storedToken = tokenLine.replace("cancellationToken:", "").trim();
  // タイミング攻撃対策: 通常の文字列比較ではなく timingSafeEqual を使用
  const storedBuf = Buffer.from(storedToken);
  const inputBuf = Buffer.from(cancellationToken);
  const tokenMatch =
    storedBuf.length === inputBuf.length &&
    crypto.timingSafeEqual(storedBuf, inputBuf);
  if (!tokenMatch) return null;

  // 予約者情報を description から抽出
  const lines = description.split("\n");
  const findValue = (prefix: string) =>
    lines.find((l) => l.startsWith(prefix))?.replace(prefix, "").trim() ?? "";

  const name = findValue("お名前: ");
  const email = findValue("メールアドレス: ");
  const experienceType = findValue("体験種別: ");
  const paymentIntentId = findValue("stripePaymentIntentId:") || undefined;

  // 元の体験種別をタイトルから復元
  const experienceLabel = experienceType || "プライベート";
  const shortLabel = experienceLabel.replace("焙煎体験", "").trim() || experienceLabel;

  // 予約日時を取得
  const startDateTime = response.data.start?.dateTime ?? "";
  const date = startDateTime ? toDateString(startDateTime) : "";
  const startTime = startDateTime ? toTimeString(startDateTime) : "";

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      summary: `予約可能｜${shortLabel}`,
      description: "",
    },
  });

  return { name, email, experienceType, date, startTime, paymentIntentId };
}
