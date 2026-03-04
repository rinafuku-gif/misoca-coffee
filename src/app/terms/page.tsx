import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="TERMS" subtitle="利用規約" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm text-haicha">
          <p>利用規約の内容は準備中です。</p>
        </div>
      </section>
    </>
  );
}
