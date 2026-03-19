import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "アクセス",
  description:
    "三十日珈琲へのアクセス。山梨県上野原市松留939。JR中央本線「上野原」駅から。新宿から中央特快で約65分、高尾から約16分。中央自動車道「上野原IC」から約10分。",
};

export default function AccessPage() {
  return (
    <>
      <PageHero
        title="ACCESS"
        subtitle="アクセス"
        description="東京から約1時間。里山の古民家へ。"
        image="/images/about/river-landscape.jpg"
      />

      {/* Address & Map */}
      <section className="py-36 md:py-52 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 md:mb-28">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Address
              </p>
              <p className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-4">
                三十日珈琲 Shared Roasting
              </p>
              <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                〒409-0115 山梨県上野原市松留939
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-konsumi font-medium tracking-wide">
                  完全予約制
                </p>
                <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                  TEL: <a href="tel:09080802165" className="underline underline-offset-4 decoration-gold/30 hover:text-konsumi transition-colors">090-8080-2165</a>
                </p>
                <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                  MAIL: <a href="mailto:misocacoffee@gmail.com" className="underline underline-offset-4 decoration-gold/30 hover:text-konsumi transition-colors">misocacoffee@gmail.com</a>
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="overflow-hidden mb-16">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.5!2d139.1055!3d35.6305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601917e8a7e14a8d%3A0x4e7a9b6f1b3c5d2e!2z5bGx5qKo55yM5LiK6YeO5Y6f5biC5p2-55WZ939!5e0!3m2!1sja!2sjp!4v1710000000000"
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
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Transportation
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                交通手段
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 md:p-12 h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  電車でお越しの方
                </h3>
                <div className="w-8 h-px bg-gold/30 mb-8" />
                <ul className="text-sm text-haicha space-y-5 leading-[2.2] tracking-wide">
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    JR中央本線「上野原」駅
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    上野原駅からバスで約10分「松留入口」下車 徒歩2分
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    新宿から約65分（中央特快利用）
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    高尾から約16分
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="bg-white p-10 md:p-12 h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  お車でお越しの方
                </h3>
                <div className="w-8 h-px bg-gold/30 mb-8" />
                <ul className="text-sm text-haicha space-y-5 leading-[2.2] tracking-wide">
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    中央自動車道「上野原IC」から約10分
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                    駐車場あり（無料・6台）
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="py-28 md:py-40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-[21/9] overflow-hidden">
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
            <p className="text-center text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mt-10 max-w-2xl mx-auto">
              東京から約1時間。都会の喧騒を離れ、
              里山の自然のなかでゆっくりとした時間をお過ごしください。
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
