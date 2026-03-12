import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

const sections = [
  {
    title: "1. 個人情報の収集",
    content:
      "当サイトでは、焙煎体験のご予約、オンラインショップでのご注文、お問い合わせの際に、お名前、メールアドレス、電話番号、ご住所等の個人情報をお預かりすることがあります。",
  },
  {
    title: "2. 個人情報の利用目的",
    content:
      "お預かりした個人情報は、以下の目的で利用いたします。\n・焙煎体験の予約確認・ご連絡\n・商品の発送・配送状況のご案内\n・お問い合わせへの回答\n・サービス改善のための分析（匿名化した上で）",
  },
  {
    title: "3. 個人情報の第三者提供",
    content:
      "お預かりした個人情報は、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。ただし、商品の配送に必要な範囲で配送業者に情報を提供する場合があります。",
  },
  {
    title: "4. 決済情報について",
    content:
      "クレジットカード情報は、決済代行サービス「Stripe」により安全に処理されます。当サイトがカード情報を直接保存・閲覧することはありません。",
  },
  {
    title: "5. アクセス解析について",
    content:
      "当サイトでは、サービス向上のためにGoogle Analyticsを利用しています。Google Analyticsはデータ収集のためにCookieを使用します。このデータは匿名で収集されており、個人を特定するものではありません。",
  },
  {
    title: "6. 個人情報の管理",
    content:
      "お預かりした個人情報は、不正アクセス・紛失・漏洩等が起きないよう、適切な安全管理措置を講じます。",
  },
  {
    title: "7. 個人情報の開示・訂正・削除",
    content:
      "ご本人から個人情報の開示・訂正・削除のご請求があった場合は、速やかに対応いたします。下記のお問い合わせ先までご連絡ください。",
  },
  {
    title: "8. お問い合わせ先",
    content: "三十日珈琲\n所在地：〒409-0115 山梨県上野原市松留939\nメール：misocacoffee@gmail.com",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="PRIVACY POLICY" subtitle="プライバシーポリシー" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <p className="text-sm text-haicha mb-12 leading-relaxed">
            三十日珈琲（以下「当店」）は、お客様の個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定めます。
          </p>
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-lg text-konsumi mb-4">
                  {section.title}
                </h2>
                <p className="text-sm text-haicha leading-loose whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-usuzumi/30">
            <p className="text-xs text-haicha">制定日：2026年3月12日</p>
          </div>
        </div>
      </section>
    </>
  );
}
