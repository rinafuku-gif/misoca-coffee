import { NextRequest, NextResponse } from "next/server";
import { cancelSlot } from "@/features/reservation/google-calendar";
import { getStripe } from "@/shared/payments/stripe";
import {
  sendCancellationConfirmation,
  sendCancellationNotification,
} from "@/shared/email/mail";
import { cancelReservation } from "@/features/reservation/notion";
import { sanitizeString } from "@/shared/validation";

interface CancelRequest {
  eventId: string;
  cancellationToken: string;
}

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

  const { eventId: rawEventId, cancellationToken: rawToken } =
    body as Partial<CancelRequest>;

  if (!rawEventId || !rawToken) {
    return NextResponse.json(
      { error: "eventId と cancellationToken は必須項目です" },
      { status: 400 }
    );
  }

  const eventId = sanitizeString(rawEventId);
  const cancellationToken = sanitizeString(rawToken);

  if (!eventId || !cancellationToken) {
    return NextResponse.json(
      { error: "eventId と cancellationToken は必須項目です" },
      { status: 400 }
    );
  }

  let cancelledInfo: Awaited<ReturnType<typeof cancelSlot>>;
  try {
    cancelledInfo = await cancelSlot(eventId, cancellationToken);
  } catch {
    return NextResponse.json(
      { error: "キャンセル処理に失敗しました。しばらくしてから再度お試しください" },
      { status: 500 }
    );
  }

  if (!cancelledInfo) {
    return NextResponse.json(
      { error: "キャンセルトークンが一致しません" },
      { status: 403 }
    );
  }

  // Stripe 返金処理（失敗してもカレンダーはすでに「予約可能」に戻っている）
  let refundSucceeded = false;
  if (cancelledInfo.paymentIntentId) {
    try {
      const stripe = getStripe();
      await stripe.refunds.create({
        payment_intent: cancelledInfo.paymentIntentId,
      });
      refundSucceeded = true;
    } catch (err) {
      console.error("[cancel] Stripe返金失敗（手動対応が必要）:", err);
      // 返金失敗でもキャンセル自体は完了扱い。運営に通知メールで伝える
    }
  }

  const mailParams = {
    name: cancelledInfo.name,
    email: cancelledInfo.email,
    experienceType: cancelledInfo.experienceType,
    date: cancelledInfo.date,
    startTime: cancelledInfo.startTime,
  };

  // メール送信（失敗してもキャンセル自体は完了扱い）
  if (mailParams.email) {
    try {
      await sendCancellationConfirmation(mailParams);
    } catch (err) {
      console.error("[cancel] キャンセル確認メール送信失敗:", err);
    }
  }

  try {
    await sendCancellationNotification({
      ...mailParams,
      // 返金失敗の場合は通知メールに明記する
      ...(cancelledInfo.paymentIntentId && !refundSucceeded
        ? {
            name: `${mailParams.name}（★Stripe返金失敗 PI:${cancelledInfo.paymentIntentId} 手動対応要）`,
          }
        : {}),
    });
  } catch (err) {
    console.error("[cancel] キャンセル通知メール送信失敗:", err);
  }

  // Notionステータス更新（失敗してもキャンセル自体は完了扱い）
  try {
    await cancelReservation(eventId);
  } catch (err) {
    console.error("[cancel] Notion更新失敗:", err);
  }

  return NextResponse.json(
    {
      success: true,
      message: "予約をキャンセルしました",
      refundSucceeded: cancelledInfo.paymentIntentId ? refundSucceeded : null,
    },
    { status: 200 }
  );
}
