import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { isSlotAvailable } from "@/lib/google-calendar";
import { calculatePrice, isValidExperienceType } from "@/lib/pricing";
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

  // 人数チェック
  const numberOfGuests = Number(body["numberOfGuests"]);
  if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 4) {
    return NextResponse.json(
      { error: "来店人数は1〜4名で指定してください" },
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

  // 体験種別チェック
  const experienceTypeRaw = sanitizeString(body["experienceType"]);
  if (!isValidExperienceType(experienceTypeRaw)) {
    return NextResponse.json(
      { error: "体験種別が不正です" },
      { status: 400 }
    );
  }

  const eventId = sanitizeString(body["eventId"]);

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
      { error: "申し訳ございません。この枠はすでに予約済みです" },
      { status: 409 }
    );
  }

  // サーバー側で料金を計算（クライアントの値は信用しない）
  const pricing = calculatePrice(experienceTypeRaw, numberOfGuests);

  const cancellationToken = crypto.randomUUID();

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    "https://misoca-coffee.vercel.app";

  // Stripe Checkout Session を作成
  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
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
      ],
      mode: "payment",
      success_url: `${baseUrl}/experience/reservation-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/experience#reservation`,
      customer_email: email,
      metadata: {
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
      },
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
