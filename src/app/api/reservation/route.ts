import { NextRequest, NextResponse } from "next/server";
import { isSlotAvailable, bookSlot, getSlotDateTime } from "@/lib/google-calendar";
import {
  sendReservationConfirmation,
  sendReservationNotification,
} from "@/lib/mail";
import { saveReservation } from "@/lib/notion";
import { sanitizeString, isValidEmail } from "@/lib/validation";

interface ReservationRequest {
  eventId: string;
  experienceType: string;
  email: string;
  name: string;
  nameKana: string;
  birthDate: string;
  phone: string;
  address: string;
  transportation: string;
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  numberOfGuests: number;
  coffeeDrinkingFrequency: string;
  paymentIntentId?: string;
  cancellationToken?: string;
  location?: string;
  transportFee?: number;
  transportDistance?: number;
}

const REQUIRED_FIELDS: (keyof ReservationRequest)[] = [
  "eventId",
  "experienceType",
  "email",
  "name",
  "nameKana",
  "birthDate",
  "phone",
  "address",
  "transportation",
  "howFound",
  "roastingExperience",
  "favoriteCoffee",
  "numberOfGuests",
  "coffeeDrinkingFrequency",
];


export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が不正です" },
      { status: 400 }
    );
  }

  // 必須項目チェック（12項目 + eventId + experienceType = 14項目）
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      return NextResponse.json(
        { error: `${field} は必須項目です` },
        { status: 400 }
      );
    }
  }

  // 体験種別を取得（人数上限の判定に使う）
  const experienceTypeForValidation = sanitizeString(body["experienceType"]);

  // 数値チェック（出張焙煎体験は1〜9名、その他は1〜4名）
  const numberOfGuests = Number(body["numberOfGuests"]);
  const maxGuestsForRoute = experienceTypeForValidation === "出張焙煎体験" ? 9 : 4;
  if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > maxGuestsForRoute) {
    return NextResponse.json(
      {
        error:
          experienceTypeForValidation === "出張焙煎体験"
            ? "来店人数は1〜9名で指定してください"
            : "来店人数は1〜4名で指定してください",
      },
      { status: 400 }
    );
  }

  // メール形式チェック
  const email = sanitizeString(body["email"]);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が不正です" },
      { status: 400 }
    );
  }

  const eventId = sanitizeString(body["eventId"]);

  // 二重予約防止: イベントがまだ予約可能か確認
  let available: boolean;
  try {
    available = await isSlotAvailable(eventId);
  } catch {
    return NextResponse.json(
      { error: "空き確認に失敗しました。しばらくしてから再度お試しください" },
      { status: 503 }
    );
  }

  if (!available) {
    return NextResponse.json(
      { error: "申し訳ございません。この枠はすでに予約済みです" },
      { status: 409 }
    );
  }

  // キャンセルトークン: Stripe決済フローではmetadataから渡される。直接予約の場合は新規生成
  const cancellationToken =
    typeof body["cancellationToken"] === "string" && body["cancellationToken"]
      ? sanitizeString(body["cancellationToken"])
      : crypto.randomUUID();

  const paymentIntentId =
    typeof body["paymentIntentId"] === "string" && body["paymentIntentId"]
      ? sanitizeString(body["paymentIntentId"])
      : undefined;

  const experienceType = sanitizeString(body["experienceType"]);
  const isOnsite = experienceType === "出張焙煎体験";
  const location = isOnsite
    ? sanitizeString(body["location"])
    : undefined;
  const transportFee =
    isOnsite && typeof body["transportFee"] === "number"
      ? (body["transportFee"] as number)
      : undefined;
  const transportDistance =
    isOnsite && typeof body["transportDistance"] === "number"
      ? (body["transportDistance"] as number)
      : undefined;

  try {
    await bookSlot(eventId, {
      name: sanitizeString(body["name"]),
      nameKana: sanitizeString(body["nameKana"]),
      email,
      phone: sanitizeString(body["phone"]),
      birthDate: sanitizeString(body["birthDate"]),
      address: sanitizeString(body["address"]),
      transportation: sanitizeString(body["transportation"]),
      howFound: sanitizeString(body["howFound"]),
      roastingExperience: sanitizeString(body["roastingExperience"]),
      favoriteCoffee: sanitizeString(body["favoriteCoffee"]),
      numberOfGuests,
      coffeeDrinkingFrequency: sanitizeString(body["coffeeDrinkingFrequency"]),
      experienceType,
      cancellationToken,
      paymentIntentId,
      location,
      transportFee,
      transportDistance,
    });
  } catch {
    return NextResponse.json(
      { error: "予約処理に失敗しました。しばらくしてから再度お試しください" },
      { status: 500 }
    );
  }

  // イベント日時を取得（メール・Notion用）
  let date = "";
  let startTime = "";
  let endTime = "";
  try {
    const slotDateTime = await getSlotDateTime(eventId);
    date = slotDateTime.date;
    startTime = slotDateTime.startTime;
    endTime = slotDateTime.endTime;
  } catch {
    // 日時取得失敗は致命的ではない
  }

  const mailParams = {
    eventId,
    experienceType: sanitizeString(body["experienceType"]),
    date,
    startTime,
    endTime,
    name: sanitizeString(body["name"]),
    nameKana: sanitizeString(body["nameKana"]),
    email,
    phone: sanitizeString(body["phone"]),
    birthDate: sanitizeString(body["birthDate"]),
    address: sanitizeString(body["address"]),
    transportation: sanitizeString(body["transportation"]),
    howFound: sanitizeString(body["howFound"]),
    roastingExperience: sanitizeString(body["roastingExperience"]),
    favoriteCoffee: sanitizeString(body["favoriteCoffee"]),
    numberOfGuests,
    coffeeDrinkingFrequency: sanitizeString(body["coffeeDrinkingFrequency"]),
    cancellationToken,
  };

  // メール送信（失敗しても予約自体はキャンセルしない）
  try {
    await sendReservationConfirmation(mailParams);
  } catch (err) {
    console.error("[reservation] 予約確認メール送信失敗:", err);
  }

  try {
    await sendReservationNotification(mailParams);
  } catch (err) {
    console.error("[reservation] 予約通知メール送信失敗:", err);
  }

  // Notion保存（失敗しても予約自体はキャンセルしない）
  try {
    await saveReservation({
      eventId,
      experienceType: mailParams.experienceType,
      date,
      startTime,
      endTime,
      name: mailParams.name,
      nameKana: mailParams.nameKana,
      email: mailParams.email,
      phone: mailParams.phone,
      address: mailParams.address,
      numberOfGuests,
      transportation: mailParams.transportation,
      howFound: mailParams.howFound,
      roastingExperience: mailParams.roastingExperience,
      favoriteCoffee: mailParams.favoriteCoffee,
      coffeeDrinkingFrequency: mailParams.coffeeDrinkingFrequency,
      location,
      transportFee,
      transportDistance,
    });
  } catch (err) {
    console.error("[reservation] Notion保存失敗:", err);
  }

  return NextResponse.json(
    {
      success: true,
      cancellationToken,
      message: "予約が確定しました",
      date,
      startTime,
      endTime,
    },
    { status: 201 }
  );
}
