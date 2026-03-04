import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="PRIVACY POLICY" subtitle="プライバシーポリシー" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm text-haicha">
          <p>プライバシーポリシーの内容は準備中です。</p>
        </div>
      </section>
    </>
  );
}
