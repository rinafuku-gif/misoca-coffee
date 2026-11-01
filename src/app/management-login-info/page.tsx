import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";
const siteOrigin = "https://misoca-coffee.vercel.app";

export const metadata: Metadata = {
  title: "管理ログインメールについて",
  description: "三十日珈琲の運営担当者向けログインメールと、Googleの送信専用接続についてのご案内。",
  alternates: { canonical: siteOrigin + "/management-login-info" },
  robots: { index: false, follow: true },
};

export default function ManagementLoginInfoPage() {
  return (
    <>
      <PageHero title="MANAGEMENT LOGIN" subtitle="管理ログインメールについて" />
      <section className="py-16 md:py-24">
        <article className="max-w-3xl mx-auto px-4 prose prose-sm text-haicha">
          <p>三十日珈琲の運営担当者が、メールに届く一度限りのリンクから管理画面へ入るための機能です。お客様の会員登録や、商品の購入・支払いのための機能ではありません。</p>
          <p className="border-l-2 border-gold pl-4">現在は接続を準備しています。このページは機能の説明であり、ログインやメール送信は行いません。</p>
          <h2>Googleとの接続は、当店の差出人アカウントだけ</h2>
          <p>当店のGmailアカウントを、管理ログインメールの送信元として接続します。Googleに許可を求めるのはメールの送信だけです。受信箱、連絡先、カレンダーを読む接続ではありません。</p>
          <p>ログインメールを受け取る運営担当者に、ご自身のGmailの送信権限を当店へ渡していただく仕組みではありません。</p>
          <h2>登録された担当者だけが使います</h2>
          <p>管理画面の利用は、個別に登録された運営担当者に限ります。ログインしても、担当外の操作や、送信・公開・権限変更などの重要な操作をまとめて許可することにはなりません。</p>
          <h2>データの扱いとお問い合わせ</h2>
          <p>Googleの送信専用接続と管理用情報の扱いは、<a href="/privacy#management-login" className="underline underline-offset-4">プライバシーポリシー</a>をご確認ください。サイトの<a href="/terms" className="underline underline-offset-4">利用規約</a>もご覧いただけます。</p>
          <p>ご不明な点は <a href="mailto:misocacoffee@gmail.com" className="underline underline-offset-4">misocacoffee@gmail.com</a> へお問い合わせください。</p>
        </article>
      </section>
    </>
  );
}
