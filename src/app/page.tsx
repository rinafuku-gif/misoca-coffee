import Link from "next/link";

const features = [
  {
    icon: "🏠",
    title: "古民家で過ごす",
    description: "築300年の古民家で里山の時間を楽しむ。",
  },
  {
    icon: "🔥",
    title: "自分だけの焙煎体験",
    description: "生豆を選び、自分の手で焙煎する。世界に一つのコーヒーを。",
  },
  {
    icon: "🤝",
    title: "人とつながる",
    description:
      "ADDressと連携したコミュニティで、コーヒー好きと出会う。",
  },
];

const pickupMenus = [
  {
    name: "エチオピア イルガチェフェ",
    description: "フローラルな香りと柑橘系の明るい酸味",
    price: "¥1,580",
  },
  {
    name: "グアテマラ アンティグア",
    description: "チョコレートのようなコクと甘み",
    price: "¥1,480",
  },
  {
    name: "ブラジル セラード",
    description: "ナッツの甘みとクリーンな味",
    price: "¥1,380",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-konsumi text-white py-24 md:py-36">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
            古くて新しい、
            <br />
            みんなの焙煎所。
          </h1>
          <p className="text-lg md:text-xl text-ainezu mb-10 leading-relaxed">
            東京から約1時間。築300年の古民家で、
            <br className="hidden md:block" />
            自分だけのコーヒーを焙煎する体験。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
            <Link
              href="/menu"
              className="inline-block border-2 border-white text-white hover:bg-white hover:text-konsumi px-8 py-4 rounded font-medium transition-colors"
            >
              コーヒー豆を購入する
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 三十日珈琲でできること ──
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-lg text-center shadow-sm"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-3">
                  {feature.title}
                </h3>
                <p className="text-haicha text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience CTA Section */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-6">
            🔥 焙煎体験・見学のご予約
          </h2>
          <p className="text-haicha mb-8 leading-relaxed">
            生豆の選別から焙煎、ドリップまで。
            <br />
            あなただけのコーヒーを、古民家で仕上げる特別な時間。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-sumi mb-8">
            <span>✓ 所要時間: 約90分</span>
            <span>✓ 焙煎した豆はお持ち帰り（約200g）</span>
            <span>✓ 少人数制・完全予約制</span>
          </div>
          <Link
            href="/experience"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors"
          >
            焙煎体験を予約する
          </Link>
        </div>
      </section>

      {/* Pickup Menu Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 今月のおすすめ ──
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pickupMenus.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-tsuchikabe flex items-center justify-center text-haicha text-sm">
                  商品写真
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-konsumi mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-haicha mb-3">{item.description}</p>
                  <p className="font-bold text-karekusa mb-4">{item.price}</p>
                  <Link
                    href="/menu"
                    className="text-sm text-gold hover:underline"
                  >
                    詳しく見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-colors"
            >
              すべてのメニューを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription CTA Section */}
      <section className="bg-konsumi text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl mb-6">
            ✉ 毎月届く、上野原からの手紙。
          </h2>
          <p className="text-ainezu mb-8 leading-relaxed">
            焙煎したてのコーヒーと、
            <br />
            里山の暮らしの便り。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-ainezu mb-8">
            <span>✓ 焙煎から3日以内に発送</span>
            <span>✓ 焙煎所からの近況レター同封</span>
            <span>✓ いつでもスキップ・解約OK</span>
          </div>
          <p className="text-lg font-bold mb-6">月額 ¥2,980〜（税・送料込）</p>
          <Link
            href="/subscription"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors"
          >
            定期便プランを見る
          </Link>
        </div>
      </section>

      {/* Catering Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] bg-tsuchikabe rounded-lg flex items-center justify-center text-haicha text-sm">
              ケータリング実績写真
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-4">
                イベント・企業向け
                <br />
                出張珈琲
              </h2>
              <p className="text-haicha leading-relaxed mb-6">
                お客様のイベントに焙煎士が伺い、
                その場で淹れたてのコーヒーをご提供します。
              </p>
              <Link
                href="/catering"
                className="text-gold hover:underline font-medium"
              >
                詳しく見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 訪れた方の声 ──
          </h2>
          <div className="space-y-6">
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sumi leading-relaxed mb-3">
                &ldquo;東京から1時間で、まるで別世界。古民家で自分で焙煎したコーヒーは格別でした。&rdquo;
              </p>
              <cite className="text-sm text-haicha not-italic">
                ── 東京都 M.S.さん (30代)
              </cite>
            </blockquote>
            <blockquote className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sumi leading-relaxed mb-3">
                &ldquo;ADDressで知って訪問。後藤さん・稲福さんのお話が面白くて、毎月通いたくなります。&rdquo;
              </p>
              <cite className="text-sm text-haicha not-italic">
                ── 神奈川県 K.T.さん (40代)
              </cite>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
