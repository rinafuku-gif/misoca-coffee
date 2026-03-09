import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "アクセス",
  description:
    "三十日珈琲へのアクセス。山梨県上野原市松留939。JR中央本線「上野原」駅から。新宿から特急で約50分、高尾から約15分。中央自動車道「上野原IC」から約10分。",
};

export default function AccessPage() {
  return (
    <>
      <PageHero
        title="ACCESS"
        subtitle="アクセス"
        description="東京から約1時間。里山の古民家へ。"
        image="/images/about/exterior-window.jpg"
      />

      {/* Address & Map */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                ADDRESS
              </p>
              <p className="font-serif text-2xl md:text-3xl text-konsumi mb-2">
                三十日珈琲 Shared Roasting
              </p>
              <p className="text-haicha text-lg leading-loose">
                〒409-0115 山梨県上野原市松留939
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="rounded-lg overflow-hidden shadow-xl mb-16">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.5!2d139.11!3d35.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5LiK6YeO5Y6f!5e0!3m2!1sja!2sjp!4v1700000000000"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="三十日珈琲の地図"
                className="w-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Transportation */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              TRANSPORTATION
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              交通手段
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 md:p-12 rounded-lg shadow-sm h-full">
                <div className="flex items-center gap-3 mb-8">
                  <svg
                    className="w-6 h-6 text-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7h8m-8 4h8m-4 4v4m-6-4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="font-serif text-xl font-bold text-konsumi">
                    電車でお越しの方
                  </h3>
                </div>
                <ul className="text-haicha space-y-5">
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    <span>
                      <strong className="text-konsumi">最寄り駅:</strong>{" "}
                      JR中央本線「上野原」駅
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    <span>
                      新宿から約<strong className="text-konsumi">50分</strong>（特急利用）
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    <span>
                      高尾から約<strong className="text-konsumi">15分</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="bg-white p-10 md:p-12 rounded-lg shadow-sm h-full">
                <div className="flex items-center gap-3 mb-8">
                  <svg
                    className="w-6 h-6 text-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h-4m4 0h4a1 1 0 001-1v-4.586a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0016.586 6H13"
                    />
                  </svg>
                  <h3 className="font-serif text-xl font-bold text-konsumi">
                    お車でお越しの方
                  </h3>
                </div>
                <ul className="text-haicha space-y-5">
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    <span>
                      中央自動車道「上野原IC」から約
                      <strong className="text-konsumi">10分</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    <span>
                      <strong className="text-konsumi">駐車場あり</strong>
                      （無料）
                    </span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/about/scenery-1.jpg"
                alt="上野原の風景"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-center text-haicha text-lg leading-loose mt-10 max-w-2xl mx-auto">
              東京から約1時間。都会の喧騒を離れ、
              里山の自然のなかでゆっくりとした時間をお過ごしください。
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
