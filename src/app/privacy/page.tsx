import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="PRIVACY POLICY" subtitle="プライバシーポリシー" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm text-haicha">
          <h2>個人情報の取り扱いについて</h2>
          <p>三十日珈琲（以下「当店」）は、お客様の個人情報の重要性を認識し、以下のとおりプライバシーポリシーを定め、個人情報の保護に努めます。</p>

          <h3>1. 収集する情報</h3>
          <p>当店は、以下の場合に個人情報を収集することがあります。</p>
          <ul>
            <li>焙煎体験のご予約時（お名前、メールアドレス、電話番号）</li>
            <li>オンラインショップでのご注文時（お名前、住所、メールアドレス、電話番号）</li>
            <li>お問い合わせ時（お名前、メールアドレス）</li>
          </ul>

          <h3>2. 利用目的</h3>
          <p>収集した個人情報は、以下の目的で利用いたします。</p>
          <ul>
            <li>焙煎体験の予約確認・ご連絡</li>
            <li>商品の発送・配送に関するご連絡</li>
            <li>お問い合わせへの回答</li>
            <li>サービス向上のための分析（個人を特定しない統計データとして）</li>
          </ul>

          <h3>3. 第三者提供</h3>
          <p>当店は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。ただし、商品の配送に必要な範囲で配送業者に情報を提供する場合があります。</p>

          <h3>4. 決済情報</h3>
          <p>クレジットカード情報は、Stripe, Inc.が安全に管理しており、当店がカード情報を直接保持することはありません。</p>

          <h3>5. アクセス解析</h3>
          <p>当サイトでは、サービス向上のためGoogle Analyticsを使用しています。Google Analyticsはクッキーを使用して情報を収集しますが、個人を特定する情報は含まれません。</p>

          <h3>6. お問い合わせ</h3>
          <p>個人情報の取り扱いに関するお問い合わせは、misocacoffee@gmail.com までご連絡ください。</p>

          <h3 id="management-login">7. 運営担当者の管理ログインメール</h3>
          <p>管理用ログインは現在準備中です。有効化する場合は、個別に登録した運営担当者のメールアドレスと担当者の識別情報を、ログイン確認と担当権限の照合に利用します。お客様向けの会員登録や、一斉配信のための情報ではありません。</p>
          <p>ログインメールの配送には、当店が認可したGoogleアカウントとGmail APIの送信専用権限を利用します。登録された運営担当者の宛先とログインリンクを、メールの作成・配送のためにGoogleへ送ります。この接続では受信箱の閲覧、連絡先やカレンダーへのアクセスを求めません。Googleへの接続を認可するのは当店の差出人アカウントであり、受取人のGmailへのアクセスを求めるものではありません。</p>
          <p>Googleの認可情報はサーバー側で保護し、公開ソースやブラウザに含めません。Google APIから得た情報を広告目的に利用したり、販売したり、汎用AIモデルの学習に利用したりしません。Googleから受け取った情報の利用と他のアプリへの転送は、Limited Use要件を含む<a href="https://developers.google.com/terms/api-services-user-data-policy" className="underline underline-offset-4">Google API Services User Data Policy</a>に従います。</p>
          <p>差出人のGoogleアカウントで、対象アプリへのアクセスを取り消すと送信専用接続を停止できます。保存済みの認可情報や運営担当者の登録の削除については、上記の連絡先へお問い合わせください。接続の停止後は新しいログインメールを送れなくなるため、復旧方法もあわせて確認します。現在の接続と運営者登録の確認をせず、自動で登録し直すことはありません。</p>
          <p>機能の概要は<a href="/management-login-info" className="underline underline-offset-4">管理ログインメールについて</a>をご覧ください。</p>

          <p className="text-xs text-haicha/60 mt-8">制定日: 2025年1月1日</p>
        </div>
      </section>
    </>
  );
}
