import { ScrollReveal } from "@/shared/ui/ScrollReveal";

/** Approved copy for the /shop section. While sales are paused it sits right
 * before 配送について in ShopCatalog; after reopening it follows the purchase
 * panel (src/app/shop/page.tsx). why-online.test.tsx pins every title and
 * sentence, so edit both together. */
export const whyOnlineHeading = "オンラインで頼むと、いいこと";

export const whyOnlineItems = [
  {
    title: "あなたの注文のために焙煎します",
    body: "三十日珈琲の焙煎豆は、ご注文をいただいてから焙煎します。そのため発送まで7日以内のお時間をいただきますが、届くのは焙煎したての豆です。",
  },
  {
    title: "少しずつ、ていねいに",
    body: "焙煎機に入れるのは、一度に最大1kgまで。温度の記録を見ながら、豆ごとの個性に合わせて仕上げます。",
  },
  {
    title: "飲みごろの1か月を、最初から",
    body: "コーヒー豆がおいしく飲めるのは、焙煎からおよそ1か月。焙煎したてで届くから、ひと月かけて変わっていく風味を、はじめから楽しめます。保管は冷暗所で十分。冷凍もできます。",
  },
  {
    title: "ポストに届きます",
    body: "発送から1〜3日でお届け。ポスト投函なので、受け取りを待つ必要はありません。",
  },
  {
    title: "送料は全国どこでも¥370",
    body: "¥5,000以上のご注文で送料無料です。",
  },
  {
    title: "上野原に来られない月も",
    body: "焙煎体験で使っているのと同じスペシャルティコーヒーを、ご自宅でどうぞ。",
  },
] as const;

/** Same block structure and spacing as the 配送について section in ShopCatalog. */
export function WhyOnline() {
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Why Online
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
              {whyOnlineHeading}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          {whyOnlineItems.map((item, i) => (
            <ScrollReveal key={item.title} direction="up" delay={(i % 3) * 0.15}>
              <div className="text-center">
                <p className="text-[10px] tracking-[0.3em] text-gold/70 uppercase mb-4">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                  {item.title}
                </h3>
                <div className="w-8 h-px bg-gold/30 mx-auto mb-6" />
                <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                  {item.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
