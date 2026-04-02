import { NextRequest, NextResponse } from "next/server";
import { isFreeArea, calculateTransportFee } from "@/lib/pricing";
import { sanitizeString } from "@/lib/validation";

const ORIGIN_ADDRESS = "山梨県大月市大月町大月1−14−15";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        value: number; // メートル
        text: string;
      };
    }>;
  }>;
  status: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationRaw = searchParams.get("location");

  if (!locationRaw || !locationRaw.trim()) {
    return NextResponse.json(
      { error: "location パラメータが必要です" },
      { status: 400 }
    );
  }

  const location = sanitizeString(locationRaw);

  // 無料エリア判定（APIコール不要）
  if (isFreeArea(location)) {
    return NextResponse.json({ fee: 0, distance: 0, isFreeArea: true });
  }

  let apiKey: string;
  try {
    apiKey = getRequiredEnv("GOOGLE_MAPS_API_KEY");
  } catch {
    return NextResponse.json(
      { error: "交通費計算サービスが利用できません" },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    origins: ORIGIN_ADDRESS,
    destinations: location,
    mode: "driving",
    language: "ja",
    key: apiKey,
  });

  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

  let data: DistanceMatrixResponse;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`Google Maps API HTTP error: ${res.status}`);
    }
    data = (await res.json()) as DistanceMatrixResponse;
  } catch (err) {
    console.error("[transport-fee] Google Maps API呼び出し失敗:", err);
    return NextResponse.json(
      { error: "距離の取得に失敗しました。しばらくしてから再度お試しください" },
      { status: 503 }
    );
  }

  if (data.status !== "OK") {
    console.error("[transport-fee] Distance Matrix API status:", data.status);
    const errorMessage =
      data.status === "REQUEST_DENIED"
        ? "距離計算サービスが利用できません。管理者にお問い合わせください"
        : "住所から距離を計算できませんでした。住所を確認してください";
    return NextResponse.json(
      { error: errorMessage },
      { status: data.status === "REQUEST_DENIED" ? 503 : 422 }
    );
  }

  const element = data.rows[0]?.elements[0];
  if (!element || element.status !== "OK" || !element.distance) {
    return NextResponse.json(
      { error: "住所から距離を計算できませんでした。住所を確認してください" },
      { status: 422 }
    );
  }

  const oneWayMeters = element.distance.value;
  const oneWayKm = oneWayMeters / 1000;
  const fee = calculateTransportFee(oneWayKm);

  return NextResponse.json({
    fee,
    distance: Math.round(oneWayKm * 10) / 10,
    isFreeArea: false,
  });
}
