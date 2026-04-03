import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";
import crypto from "crypto";

// ---- 型定義 ----------------------------------------------------------------

export type ExperienceType = "プライベート焙煎体験" | "グループ焙煎体験" | "出張焙煎体験";

// クライアントコンポーネントからも安全に参照できるよう定数ファイルから再エクスポート
import { GROUP_MAX_GUESTS, GROUP_MIN_GUESTS } from "./group-reservation-constants";
export { GROUP_MAX_GUESTS, GROUP_MIN_GUESTS };

export interface CalendarSlot {
  eventId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  experienceType: ExperienceType;
  summary: string;
  /** グループ焙煎体験のみ: 残り受け入れ可能人数 */
  groupRemainingCapacity?: number;
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
  // 方式1: GOOGLE_APPLICATION_CREDENTIALS（JSONファイルパス、ローカル開発用）
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

  // 方式2: GOOGLE_SERVICE_ACCOUNT_JSON（JSON全体をBase64エンコード、Vercel本番用）
  const jsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonBase64) {
    const creds = JSON.parse(Buffer.from(jsonBase64, "base64").toString("utf-8"));
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
  }

  throw new Error("GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON is required");
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

// ---- グループ予約ヘルパー ---------------------------------------------------

/**
 * イベント説明文から「来店人数: X名」の合計を算出する。
 * グループ枠は複数の予約者情報が区切り線（────）で区切られて追記されるため
 * 全行を走査して合計する。
 */
export function calcGroupBookedGuests(description: string): number {
  const lines = description.split("\n");
  let total = 0;
  for (const line of lines) {
    const m = line.match(/^来店人数:\s*(\d+)名/);
    if (m) {
      total += parseInt(m[1], 10);
    }
  }
  return total;
}

/**
 * グループ枠のタイトルを生成する。
 * 0名の場合（全員キャンセル）は「予約可能｜グループ」に戻す。
 */
function buildGroupTitle(bookedGuests: number): string {
  if (bookedGuests === 0) return "予約可能｜グループ";
  if (bookedGuests >= GROUP_MAX_GUESTS) return `満席｜${bookedGuests}/${GROUP_MAX_GUESTS}名`;
  return `予約中｜${bookedGuests}/${GROUP_MAX_GUESTS}名`;
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
 * - プライベート・出張: タイトルに「予約可能」を含むイベントのみ返す
 * - グループ: 「予約可能」または「予約中」（満席でない）イベントを返す
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

  const slots: CalendarSlot[] = [];

  for (const event of events) {
    const summary = event.summary ?? "";
    const eventId = event.id ?? "";
    if (!eventId) continue;

    const startDateTime = event.start?.dateTime ?? "";
    const endDateTime = event.end?.dateTime ?? "";
    const isGroupEvent = summary.includes("グループ");

    if (isGroupEvent) {
      // グループ枠: 「予約可能」または「予約中」（満席は除外）
      const isAvailable = summary.includes("予約可能");
      const isPartiallyBooked = summary.includes("予約中");
      if (!isAvailable && !isPartiallyBooked) continue;

      const description = event.description ?? "";
      const bookedGuests = calcGroupBookedGuests(description);
      const remaining = GROUP_MAX_GUESTS - bookedGuests;
      if (remaining <= 0) continue; // 満席（念のため）

      slots.push({
        eventId,
        date: toDateString(startDateTime),
        startTime: toTimeString(startDateTime),
        endTime: toTimeString(endDateTime),
        experienceType: "グループ焙煎体験",
        summary,
        groupRemainingCapacity: remaining,
      });
    } else {
      // プライベート・出張: 「予約可能」のみ
      if (!summary.includes("予約可能")) continue;

      slots.push({
        eventId,
        date: toDateString(startDateTime),
        startTime: toTimeString(startDateTime),
        endTime: toTimeString(endDateTime),
        experienceType: resolveExperienceType(summary),
        summary,
      });
    }
  }

  return slots;
}

/**
 * 指定イベントが「まだ予約可能か」を確認する。
 * - プライベート・出張: タイトルに「予約可能」が含まれている場合のみ true
 * - グループ: 「予約可能」または「予約中」かつ残り人数 > 0 の場合 true
 */
export async function isSlotAvailable(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.events.get({ calendarId, eventId });
  const summary = response.data.summary ?? "";
  const isGroup = summary.includes("グループ");

  if (isGroup) {
    const isBookable = summary.includes("予約可能") || summary.includes("予約中");
    if (!isBookable) return false;
    const description = response.data.description ?? "";
    const booked = calcGroupBookedGuests(description);
    return booked < GROUP_MAX_GUESTS;
  }

  return summary.includes("予約可能");
}

/**
 * グループ枠の残り受け入れ可能人数を返す。
 * グループ以外のイベントを渡した場合は null を返す。
 */
export async function getGroupRemainingCapacity(eventId: string): Promise<number | null> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.events.get({ calendarId, eventId });
  const summary = response.data.summary ?? "";
  if (!summary.includes("グループ")) return null;

  const description = response.data.description ?? "";
  const booked = calcGroupBookedGuests(description);
  return Math.max(0, GROUP_MAX_GUESTS - booked);
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
  location?: string;
  transportFee?: number;
  transportDistance?: number;
}

/**
 * 予約確定時にイベントを書き換える。
 *
 * グループ焙煎体験:
 *   - 既存の説明欄に区切り線＋新予約者情報を追記（上書きしない）
 *   - タイトルを「予約中｜X/6名」または「満席｜6/6名」に更新
 *
 * プライベート・出張:
 *   - タイトル →「予約済み｜{name}」（出張の場合は「予約済み｜{name}（出張準備含む）」）
 *   - 説明 → 予約者情報すべて + キャンセルトークン + Stripe Payment Intent ID
 *   - 出張焙煎体験の場合: 開始60分前〜終了30分後に時間を拡張してブロック
 */
export async function bookSlot(
  eventId: string,
  info: ReservationInfo
): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const isOnsite = info.experienceType === "出張焙煎体験";
  const isGroup = info.experienceType === "グループ焙煎体験";

  if (isGroup) {
    // ---- グループ予約: 追記方式 ----
    const eventRes = await calendar.events.get({ calendarId, eventId });
    const existingDescription = eventRes.data.description ?? "";
    const existingBooked = calcGroupBookedGuests(existingDescription);
    const newTotal = existingBooked + info.numberOfGuests;

    // 区切り線付きで新予約者ブロックを構築
    const reservationIndex = existingBooked === 0 ? 1
      : existingDescription.split("cancellationToken:").length; // 既存予約件数+1

    const newBlock = [
      existingDescription ? `\n────────────\n` : "",
      `【予約${reservationIndex}】${info.name} 様（${info.numberOfGuests}名）`,
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
    ].join("\n");

    if (info.paymentIntentId) {
      const updatedBlock = newBlock + `\nstripePaymentIntentId:${info.paymentIntentId}`;
      await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          summary: buildGroupTitle(newTotal),
          description: existingDescription + updatedBlock,
        },
      });
    } else {
      await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          summary: buildGroupTitle(newTotal),
          description: existingDescription + newBlock,
        },
      });
    }
    return;
  }

  // ---- プライベート・出張: 従来通り ----
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
  ];

  if (isOnsite) {
    if (info.location) {
      descriptionLines.push(`出張先: ${info.location}`);
    }
    if (info.transportFee !== undefined) {
      const feeText =
        info.transportFee === 0 ? "無料（対象エリア）" : `¥${info.transportFee.toLocaleString()}`;
      descriptionLines.push(`交通費: ${feeText}`);
    }
    if (info.transportDistance !== undefined && info.transportDistance > 0) {
      descriptionLines.push(`片道距離: ${info.transportDistance}km`);
    }
    descriptionLines.push(`※開始60分前〜終了30分後を準備・片付け時間として確保`);
  }

  descriptionLines.push(``, `cancellationToken:${info.cancellationToken}`);

  if (info.paymentIntentId) {
    descriptionLines.push(`stripePaymentIntentId:${info.paymentIntentId}`);
  }

  const description = descriptionLines.join("\n");

  const patchBody: calendar_v3.Schema$Event = {
    summary: isOnsite
      ? `予約済み｜${info.name}（出張準備含む）`
      : `予約済み｜${info.name}`,
    description,
  };

  // 出張焙煎体験: 現在のイベント時刻を取得して開始60分前・終了30分後に拡張
  if (isOnsite) {
    const eventRes = await calendar.events.get({ calendarId, eventId });
    const origStart = eventRes.data.start?.dateTime;
    const origEnd = eventRes.data.end?.dateTime;

    if (origStart && origEnd) {
      const startDate = new Date(origStart);
      const endDate = new Date(origEnd);

      // 元の開始・終了をイベント説明に保存（cancelSlotで復元するため）
      descriptionLines.push(
        `originalStart:${origStart}`,
        `originalEnd:${origEnd}`
      );
      patchBody.description = descriptionLines.join("\n");

      const newStart = new Date(startDate.getTime() - 60 * 60 * 1000);
      const newEnd = new Date(endDate.getTime() + 30 * 60 * 1000);

      patchBody.start = { dateTime: newStart.toISOString(), timeZone: "Asia/Tokyo" };
      patchBody.end = { dateTime: newEnd.toISOString(), timeZone: "Asia/Tokyo" };
    }
  }

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: patchBody,
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
 * キャンセル時にイベントを更新する。
 *
 * グループ焙煎体験:
 *   - 該当トークンの予約者ブロックのみ説明欄から除去する
 *   - 残り予約者がいる場合はタイトルを「予約中｜X/6名」に更新
 *   - 全員キャンセルの場合は「予約可能｜グループ」に戻す
 *
 * プライベート・出張:
 *   - 従来通り「予約可能｜○○」に戻す
 *
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
  const summary = response.data.summary ?? "";
  const isGroup = summary.includes("グループ") || description.includes("グループ焙煎体験");

  if (isGroup) {
    // ---- グループ: 該当予約ブロックのみ除去 ----
    // ブロックは「────────────\n」または先頭から始まり、次の区切り or 末尾まで
    // cancellationToken: <token> を含むブロックを特定して除去する

    // 全行を走査してトークンが存在するか確認
    const lines = description.split("\n");
    const tokenLineIdx = lines.findIndex(
      (l) => l.startsWith("cancellationToken:") &&
        (() => {
          const stored = l.replace("cancellationToken:", "").trim();
          const storedBuf = Buffer.from(stored);
          const inputBuf = Buffer.from(cancellationToken);
          return storedBuf.length === inputBuf.length &&
            crypto.timingSafeEqual(storedBuf, inputBuf);
        })()
    );
    if (tokenLineIdx === -1) return null;

    // 予約ブロックの開始・終了インデックスを特定
    // 区切り線「────────────」か先頭（index=0）がブロック開始
    let blockStart = 0;
    for (let i = tokenLineIdx - 1; i >= 0; i--) {
      if (lines[i].startsWith("────────────")) {
        blockStart = i; // 区切り線込みで除去
        break;
      }
    }
    // 次の区切り線または末尾がブロック終了
    let blockEnd = lines.length;
    for (let i = tokenLineIdx + 1; i < lines.length; i++) {
      if (lines[i].startsWith("────────────")) {
        blockEnd = i;
        break;
      }
    }

    // 除去対象ブロックから予約者情報を抽出
    const blockLines = lines.slice(blockStart, blockEnd);
    const findInBlock = (prefix: string) =>
      blockLines.find((l) => l.startsWith(prefix))?.replace(prefix, "").trim() ?? "";

    const name = findInBlock("お名前: ");
    const email = findInBlock("メールアドレス: ");
    const experienceType = findInBlock("体験種別: ");
    const cancelledGuests = parseInt(findInBlock("来店人数: ").replace("名", ""), 10) || 0;
    const paymentIntentId = findInBlock("stripePaymentIntentId:") || undefined;

    // 現在の予約日時
    const currentStartDateTime = response.data.start?.dateTime ?? "";
    const date = currentStartDateTime ? toDateString(currentStartDateTime) : "";
    const startTime = currentStartDateTime ? toTimeString(currentStartDateTime) : "";

    // ブロックを除去して新しい説明文を構築
    const remainingLines = [
      ...lines.slice(0, blockStart),
      ...lines.slice(blockEnd),
    ];
    // 先頭の空行・区切り線を整理
    const trimmedLines = remainingLines.join("\n").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n");

    // 除去後の残り予約者数を再計算してタイトルを更新
    const newBooked = calcGroupBookedGuests(trimmedLines);

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        summary: buildGroupTitle(newBooked),
        description: trimmedLines,
      },
    });

    // cancelledGuests は将来の拡張用に保持（現在は除去後の再計算で代用）
    void cancelledGuests;

    return { name, email, experienceType, date, startTime, paymentIntentId };
  }

  // ---- プライベート・出張: 従来通り ----

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

  // 予約日時を取得（出張の場合はoriginalStartを優先）
  const originalStart = findValue("originalStart:");
  const originalEnd = findValue("originalEnd:");
  const currentStartDateTime = response.data.start?.dateTime ?? "";
  const startDateTime = originalStart || currentStartDateTime;
  const date = startDateTime ? toDateString(startDateTime) : "";
  const startTime = startDateTime ? toTimeString(startDateTime) : "";

  const patchBody: calendar_v3.Schema$Event = {
    summary: `予約可能｜${shortLabel}`,
    description: "",
  };

  // 出張焙煎体験で元の時間が保存されている場合、元の時間に戻す
  if (originalStart && originalEnd) {
    patchBody.start = { dateTime: originalStart, timeZone: "Asia/Tokyo" };
    patchBody.end = { dateTime: originalEnd, timeZone: "Asia/Tokyo" };
  }

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: patchBody,
  });

  return { name, email, experienceType, date, startTime, paymentIntentId };
}
