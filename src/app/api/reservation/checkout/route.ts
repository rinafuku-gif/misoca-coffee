import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { isSlotAvailable, getGroupRemainingCapacity } from "@/lib/google-calendar";
import { calculatePrice, isValidExperienceType, isFreeArea, calculateTransportFee } from "@/lib/pricing";
import { sanitizeString, isValidEmail } from "@/lib/validation";

interface CheckoutRequest {
  eventId: string;
  experienceType: string;
  email: string;
  name: string;
  nameKana: string;
  birthDate: string;
  phone: string;
  addressPrefecture: string;
  addressCity: string;
  transportation: string;
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  numberOfGuests: number;
  coffeeDrinkingFrequency: string;
  location?: string;
  transportFee?: number;
  transportDistance?: number;
  transportIsFreeArea?: boolean;
}

const GOOGLE_MAPS_ORIGIN = "山梨県大月市大月町大月1−14−15";

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: { value: number };
    }>;
  }>;
  status: string;
}

interface TransportInfo {
  fee: number;
  distanceKm: number;
}

async function fetchTransportInfoFromMaps(location: string): Promise<TransportInfo> {
  if (isFreeArea(location)) return { fee: 0, distanceKm: 0 };

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    origins: GOOGLE_MAPS_ORIGIN,
    destinations: location,
    mode: "driving",
    language: "ja",
    key: apiKey,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(`Google Maps API HTTP error: ${res.status}`);
  }

  const data = (await res.json()) as DistanceMatrixResponse;
  if (data.status !== "OK") {
    const msg =
      data.status === "REQUEST_DENIED"
        ? "距離計算サービスが利用できません（APIが無効）"
        : `Distance Matrix API returned status: ${data.status}`;
    throw new Error(msg);
  }

  const element = data.rows[0]?.elements[0];
  if (!element || element.status !== "OK" || !element.distance) {
    throw new Error("距離の取得に失敗しました");
  }

  const oneWayKm = element.distance.value / 1000;
  return {
    fee: calculateTransportFee(oneWayKm),
    distanceKm: Math.round(oneWayKm * 10) / 10,
  };
}

const REQUIRED_FIELDS: (keyof CheckoutRequest)[] = [
  "eventId",
  "experienceType",
  "email",
  "name",
  "nameKana",
  "birthDate",
  "phone",
  "addressPrefecture",
  "addressCity",
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

  // 必須項目チェック
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      return NextResponse.json(
        { error: `${field} は必須項目です` },
        { status: 400 }
      );
    }
  }

  // 体験種別チェック（人数上限の判定に先に使うので先に実施）
  const experienceTypeRaw = sanitizeString(body["experienceType"]);
  if (!isValidExperienceType(experienceTypeRaw)) {
    return NextResponse.json(
      { error: "体験種別が不正です" },
      { status: 400 }
    );
  }

  // 人数チェック（出張焙煎体験は1〜9名、その他は1〜4名）
  const numberOfGuests = Number(body["numberOfGuests"]);
  const maxGuests = experienceTypeRaw === "出張焙煎体験" ? 9 : 4;
  if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > maxGuests) {
    return NextResponse.json(
      {
        error:
          experienceTypeRaw === "出張焙煎体験"
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
  const isGroupExperience = experienceTypeRaw === "グループ焙煎体験";

  // 予約枠の空き確認（決済前に二重予約を防ぐ）
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
      { error: isGroupExperience ? "申し訳ございません。この枠は満席です" : "申し訳ございません。この枠はすでに予約済みです" },
      { status: 409 }
    );
  }

  // グループ: 残り人数チェック
  if (isGroupExperience) {
    let remaining: number | null;
    try {
      remaining = await getGroupRemainingCapacity(eventId);
    } catch {
      return NextResponse.json(
        { error: "空き確認に失敗しました。しばらくしてから再度お試しください" },
        { status: 503 }
      );
    }
    if (remaining === null || numberOfGuests > remaining) {
      return NextResponse.json(
        {
          error: remaining !== null && remaining > 0
            ? `この枠の残り受付人数は${remaining}名です。人数を変更してください`
            : "申し訳ございません。この枠は満席です",
          remainingCapacity: remaining ?? 0,
        },
        { status: 409 }
      );
    }
  }

  // サーバー側で体験料金を計算（クライアントの値は信用しない）
  const pricing = calculatePrice(experienceTypeRaw, numberOfGuests);

  // 出張焙煎体験の場合: location必須 + 交通費をサーバー側で再計算して検証
  const isOnsite = experienceTypeRaw === "出張焙煎体験";
  const location = isOnsite ? sanitizeString(body["location"]) : "";

  if (isOnsite && !location) {
    return NextResponse.json(
      { error: "出張焙煎体験には出張先住所（location）が必須です" },
      { status: 400 }
    );
  }

  let verifiedTransportFee = 0;
  let verifiedDistance = 0;
  if (isOnsite && location) {
    try {
      const transport = await fetchTransportInfoFromMaps(location);
      verifiedTransportFee = transport.fee;
      verifiedDistance = transport.distanceKm;
    } catch (err) {
      console.error("[reservation/checkout] 交通費計算失敗:", err);
      return NextResponse.json(
        { error: "交通費の計算に失敗しました。住所を確認してから再度お試しください" },
        { status: 422 }
      );
    }
  }

  const totalAmount = pricing.totalAmount + verifiedTransportFee;
  const cancellationToken = crypto.randomUUID();

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : null) ||
    "https://misoca-coffee.vercel.app"
  ).replace(/\/$/, "");

  // Stripe Checkout Session を作成
  try {
    const stripe = getStripe();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: experienceTypeRaw,
            description: `${numberOfGuests}名 / ${sanitizeString(body["name"])} 様`,
          },
          unit_amount: pricing.totalAmount,
        },
        quantity: 1,
      },
    ];

    if (isOnsite && verifiedTransportFee > 0) {
      const roundTripKm = verifiedDistance * 2;
      lineItems.push({
        price_data: {
          currency: "jpy",
          product_data: {
            name: `交通費（往復${Math.round(roundTripKm * 10) / 10}km）`,
            description: "出張先までの往復交通費",
          },
          unit_amount: verifiedTransportFee,
        },
        quantity: 1,
      });
    }

    const metadata: Record<string, string> = {
      eventId,
      experienceType: experienceTypeRaw,
      email,
      name: sanitizeString(body["name"]),
      nameKana: sanitizeString(body["nameKana"]),
      birthDate: sanitizeString(body["birthDate"]),
      phone: sanitizeString(body["phone"]),
      address: `${sanitizeString(body["addressPrefecture"])}${sanitizeString(body["addressCity"])}`,
      transportation: sanitizeString(body["transportation"]),
      howFound: sanitizeString(body["howFound"]),
      roastingExperience: sanitizeString(body["roastingExperience"]),
      // Stripe metadata value は最大500文字のため長文はトリミング
      favoriteCoffee: sanitizeString(body["favoriteCoffee"]).slice(0, 490),
      numberOfGuests: String(numberOfGuests),
      coffeeDrinkingFrequency: sanitizeString(body["coffeeDrinkingFrequency"]),
      cancellationToken,
    };

    if (isOnsite && location) {
      metadata.location = location.slice(0, 490);
      metadata.transportFee = String(verifiedTransportFee);
      metadata.transportDistance = String(verifiedDistance);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/experience/reservation-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/experience#reservation`,
      customer_email: email,
      metadata,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("[reservation/checkout] Stripe session作成失敗:", err);
    return NextResponse.json(
      { error: "決済処理でエラーが発生しました。しばらくしてから再度お試しください" },
      { status: 500 }
    );
  }
}
