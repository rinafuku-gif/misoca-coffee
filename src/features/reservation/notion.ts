import { z } from "zod";
import { notion } from "@/shared/notion/client";

const reservationDbId = process.env.NOTION_RESERVATION_DB_ID || "";

// スキーマを「型の真実の源」にする（手書きinterfaceを廃止し z.infer で型を導出）
export const ReservationRecordSchema = z.object({
  eventId: z.string(),
  experienceType: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  name: z.string(),
  nameKana: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  numberOfGuests: z.number(),
  transportation: z.string(),
  howFound: z.string(),
  roastingExperience: z.string(),
  favoriteCoffee: z.string(),
  coffeeDrinkingFrequency: z.string(),
  location: z.string().optional(),
  transportFee: z.number().optional(),
  transportDistance: z.number().optional(),
});
export type ReservationRecord = z.infer<typeof ReservationRecordSchema>;

/**
 * 予約をNotionデータベースに保存する
 */
export async function saveReservation(record: ReservationRecord): Promise<void> {
  if (!process.env.NOTION_API_KEY || !reservationDbId) {
    return;
  }

  // 書き込み前に入力データを検証（不正な形のまま保存しない＝静かなデータ破損を防ぐ）
  const validated = ReservationRecordSchema.safeParse(record);
  if (!validated.success) {
    console.error("[notion] 予約データの形が不正です", validated.error.issues);
    throw new Error("Invalid reservation record");
  }

  await notion.pages.create({
    parent: { database_id: reservationDbId },
    properties: {
      "お名前": {
        title: [{ text: { content: record.name } }],
      },
      "フリガナ": {
        rich_text: [{ text: { content: record.nameKana } }],
      },
      "メールアドレス": {
        email: record.email,
      },
      "電話番号": {
        phone_number: record.phone,
      },
      "住所": {
        rich_text: [{ text: { content: record.address } }],
      },
      "体験種別": {
        select: { name: record.experienceType },
      },
      "予約日時": {
        date: {
          start: record.date && record.startTime
            ? `${record.date}T${record.startTime}:00+09:00`
            : record.date || new Date().toISOString().slice(0, 10),
          end: record.date && record.endTime
            ? `${record.date}T${record.endTime}:00+09:00`
            : undefined,
        },
      },
      "来店人数": {
        number: record.numberOfGuests,
      },
      "来店交通手段": {
        select: { name: record.transportation },
      },
      "認知経路": {
        rich_text: [{ text: { content: record.howFound } }],
      },
      "焙煎体験の有無": {
        select: { name: record.roastingExperience },
      },
      "好きなコーヒー": {
        rich_text: [{ text: { content: record.favoriteCoffee } }],
      },
      "コーヒーを飲む頻度": {
        select: { name: record.coffeeDrinkingFrequency },
      },
      "ステータス": {
        select: { name: "予約済み" },
      },
      "イベントID": {
        rich_text: [{ text: { content: record.eventId } }],
      },
      ...(record.location
        ? {
            "出張先住所": {
              rich_text: [{ text: { content: record.location } }],
            },
          }
        : {}),
      ...(record.transportFee !== undefined
        ? {
            "交通費": {
              number: record.transportFee,
            },
          }
        : {}),
      ...(record.transportDistance !== undefined && record.transportDistance > 0
        ? {
            "片道距離(km)": {
              number: record.transportDistance,
            },
          }
        : {}),
    },
  });
}

/**
 * イベントIDでNotionの予約ページを検索してステータスをキャンセルに更新する
 */
export async function cancelReservation(eventId: string): Promise<void> {
  if (!process.env.NOTION_API_KEY || !reservationDbId) {
    return;
  }

  // dataSources.query（既存コードのパターン）でイベントIDを検索
  const response = await notion.dataSources.query({
    data_source_id: reservationDbId,
    filter: {
      property: "イベントID",
      rich_text: {
        equals: eventId,
      },
    },
  });

  if (response.results.length === 0) return;

  const pageId = (response.results[0] as Record<string, unknown>)["id"] as string;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "ステータス": {
        select: { name: "キャンセル" },
      },
    },
  });
}
