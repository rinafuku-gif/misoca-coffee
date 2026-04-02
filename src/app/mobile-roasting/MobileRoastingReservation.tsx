"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { ReservationFlow } from "@/components/reservation/ReservationFlow";

export function MobileRoastingReservation() {
  return (
    <section
      id="reservation"
      className="bg-tsuchikabe py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Reservation
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              出張焙煎のご予約
            </h2>
            <p className="text-haicha leading-loose max-w-md mx-auto text-sm">
              カレンダーから日程・時間枠を選び、
              <br />
              フォームにご記入ください。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mt-6" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <ReservationFlow />
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-xs text-haicha/60 tracking-wide mb-4">
              LINEでもお問い合わせいただけます
            </p>
            <a
              href="https://lin.ee/ihDBxM8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-konsumi/20 text-konsumi/60 hover:text-konsumi hover:border-konsumi/40 px-6 py-3 text-xs tracking-[0.2em] transition-all duration-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEでお問い合わせ
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
