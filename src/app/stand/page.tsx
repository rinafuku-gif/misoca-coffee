import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StandCalendar } from "@/components/stand/StandCalendar";

export const metadata: Metadata = {
  title: "コーヒースタンド | misoca coffee stand",
  description:
    "暮らしのそばに、景色とおいしいコーヒーを。見晴亭（上野原駅北口から徒歩すぐ）で毎週水曜日営業。ハンドドリップコーヒーと自家焙煎豆の購入ができます。",
};

const menuItems = [
  {
    name: "ハンドドリップコーヒー",
    price: "¥500",
    note: "Hot",
  },
  {
    name: "本日のコーヒー",
    price: "¥300",
    note: "水曜 8:00〜9:30 限定5杯",
  },
  {
    name: "オーツミルクラテ",
    price: "¥800",
    note: "Hot",
  },
  {
    name: "オーツミルク単品",
    price: "¥400",
    note: "Hot",
  },
];

const sceneryPhotos = [
  { month: "2026年3月", src: "/images/stand/scenery-2026-03.jpg" },
  { month: "2026年2月", src: "/images/stand/scenery-2026-02.jpg" },
  { month: "2026年1月", src: "/images/stand/scenery-2026-01.jpg" },
  { month: "2025年12月", src: "/images/stand/scenery-2025-12.jpg" },
  { month: "2025年11月", src: "/images/stand/scenery-2025-11.jpg" },
  { month: "2025年10月", src: "/images/stand/scenery-2025-10.jpg" },
  { month: "2025年9月", src: "/images/stand/scenery-2025-09.jpg" },
  { month: "2025年8月", src: "/images/stand/scenery-2025-08.jpg" },
  { month: "2025年7月", src: "/images/stand/scenery-2025-07.jpg" },
  { month: "2025年6月", src: "/images/stand/scenery-2025-06.jpg" },
  { month: "2025年5月", src: "/images/stand/scenery-2025-05.jpg" },
  { month: "2025年4月", src: "/images/stand/scenery-2025-04.jpg" },
  { month: "2025年3月", src: "/images/stand/scenery-2025-03.jpg" },
  { month: "2025年2月", src: "/images/stand/scenery-2025-02.jpg" },
  { month: "2025年1月", src: "/images/stand/scenery-2025-01.jpg" },
  { month: "2024年12月", src: "/images/stand/scenery-2024-12.jpg" },
  { month: "2024年11月", src: "/images/stand/scenery-2024-11.jpg" },
  { month: "2024年10月", src: "/images/stand/scenery-2024-10.jpg" },
  { month: "2024年9月", src: "/images/stand/scenery-2024-09.jpg" },
  { month: "2024年8月", src: "/images/stand/scenery-2024-08.jpg" },
  { month: "2024年7月", src: "/images/stand/scenery-2024-07.jpg" },
];

export default function StandPage() {
  return (
    <>
      <PageHero
        title="COFFEE STAND"
        subtitle="コーヒースタンド"
        description="暮らしのそばに、景色とおいしいコーヒーを。"
        image="/images/stand/stand-1.jpg"
      />

      {/* About the Stand */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                misoca coffee stand
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                暮らしのそばに、
                <br />
                景色とおいしいコーヒーを。
              </h2>
              <div className="w-16 h-px bg-gold mb-10" />
              <p className="text-haicha leading-loose mb-6">
                見晴亭（上野原駅北口から徒歩すぐ）で営業中。
                ハンドドリップコーヒーと自家焙煎豆の購入ができます。
              </p>
              <p className="text-haicha leading-loose mb-6">
                景色を眺めてゆったりコーヒーを楽しめる、
                ホッと一息つけるコーヒースタンドです。
              </p>
              <p className="text-haicha leading-loose">
                珈琲初心者さんも常連さんも、電車の待ち時間などでも、
                お気軽にお立ち寄りください。
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/stand/stand-morning-mist.jpg"
                  alt="朝霧と朝日の風景"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-video rounded-sm overflow-hidden">
              <Image
                src="/images/stand/stand-summer-lake.jpg"
                alt="夏の緑と湖の景色"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Menu */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Menu
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              メニュー
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-0">
            {menuItems.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.1}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-haicha">{item.note}</p>
                  </div>
                  <p className="text-2xl font-light text-gold whitespace-nowrap">
                    {item.price}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 space-y-2">
              <p className="text-sm text-haicha leading-relaxed">
                ※ アイスはすべて +¥50
              </p>
              <p className="text-sm text-haicha leading-relaxed">
                ※ オーツミルク変更 +¥50
              </p>
              <p className="text-sm text-haicha leading-relaxed">
                ※ 砂糖・ミルクの標準提供はございません
              </p>
              <p className="text-sm text-haicha leading-relaxed">
                ※ 自家焙煎豆の販売もしています（100g ¥800〜 / 種類により変動）
              </p>
              <p className="text-xs text-haicha/60 mt-4">
                季節や仕入れ状況により、メニュー・価格が変わる場合があります。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 営業情報 */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Info
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              営業情報
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-sm text-center">
              <p className="font-serif text-xl text-konsumi tracking-wider font-light mb-8">
                毎週水曜日
              </p>

              <div className="space-y-4 mb-10">
                <p className="text-haicha leading-loose">
                  8:00 〜 9:30 / 10:30 〜 16:00
                </p>
              </div>

              <div className="w-16 h-px bg-gold mx-auto mb-8" />

              <div className="space-y-2">
                <p className="text-sm text-haicha leading-relaxed">
                  見晴亭（上野原駅北口から徒歩すぐ）
                </p>
                <p className="text-xs text-haicha/60 leading-relaxed">
                  〒409-0115 山梨県上野原市上野原
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 営業カレンダー */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Calendar
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              営業カレンダー
            </h2>
            <p className="text-center text-sm text-haicha mb-4">
              青いセルが営業日です。営業時間は日によって変わることがあります。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <StandCalendar />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA - 最新情報 */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Follow Us
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              最新情報をチェック
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="text-haicha leading-loose mb-12">
              営業日や新しい豆の入荷情報は、Instagramでお知らせしています。
              <br />
              ご来店前にぜひご確認ください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/misoca_coffeestand"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                @misoca_coffeestand をフォロー
              </a>
              <Link
                href="/shop"
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                オンラインショップへ
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Scenery Archive - 朝の景色アーカイブ */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Scenery
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              見晴亭からの景色
            </h2>
            <p className="text-center text-sm text-haicha mb-4">
              毎朝、同じ場所から撮り続けている景色
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {sceneryPhotos.map((photo, i) => (
              <ScrollReveal key={photo.month} direction="up" delay={i * 0.1}>
                <div className="relative">
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={`${photo.month}の朝の景色`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <p className="text-xs text-haicha/60 tracking-wide mt-3 text-center">
                    {photo.month}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 三十日珈琲への導線 */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              misoca coffee
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              焙煎体験もやっています
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="text-haicha leading-loose mb-12">
              三十日珈琲では、築300年の古民家での焙煎体験も行っています。
              <br />
              コーヒースタンドとはまた違った、特別な時間をお過ごしください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/experience"
              className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
