import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { ReservationCompleteClient } from "./ReservationCompleteClient";

export const metadata: Metadata = {
  title: "予約完了 | 焙煎体験",
  description: "焙煎体験のご予約が確定しました。",
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ReservationCompletePage({
  searchParams,
}: PageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/experience");
  }

  // Stripe Session を取得して決済完了を確認
  let sessionData: {
    paymentIntentId: string;
    customerEmail: string | null;
    metadata: Record<string, string>;
  };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      redirect("/experience#reservation");
    }

    if (!session.payment_intent || typeof session.payment_intent !== "string") {
      redirect("/experience#reservation");
    }

    sessionData = {
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email,
      metadata: (session.metadata ?? {}) as Record<string, string>,
    };
  } catch {
    redirect("/experience#reservation");
  }

  const {
    eventId,
    experienceType,
    email,
    name,
    nameKana,
    birthDate,
    phone,
    address,
    transportation,
    howFound,
    roastingExperience,
    favoriteCoffee,
    numberOfGuests,
    coffeeDrinkingFrequency,
    cancellationToken,
  } = sessionData.metadata;

  // 必須フィールドが欠けている場合はリダイレクト
  if (!eventId || !experienceType || !name || !cancellationToken) {
    redirect("/experience");
  }

  return (
    <ReservationCompleteClient
      eventId={eventId}
      experienceType={experienceType}
      email={email ?? sessionData.customerEmail ?? ""}
      name={name}
      nameKana={nameKana ?? ""}
      birthDate={birthDate ?? ""}
      phone={phone ?? ""}
      address={address ?? ""}
      transportation={transportation ?? ""}
      howFound={howFound ?? ""}
      roastingExperience={roastingExperience ?? ""}
      favoriteCoffee={favoriteCoffee ?? ""}
      numberOfGuests={Number(numberOfGuests ?? 1)}
      coffeeDrinkingFrequency={coffeeDrinkingFrequency ?? ""}
      cancellationToken={cancellationToken}
      paymentIntentId={sessionData.paymentIntentId}
    />
  );
}
