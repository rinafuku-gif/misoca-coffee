import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import catering from "@content/pages/catering.json";
import faq from "@content/pages/faq.json";

const question = "何日前までに予約すれば良いですか？";
const answer = "基本的には7日前までにご予約ください。ただし、豆の在庫状況によっては直前のご注文にも対応できる場合がございますので、お急ぎの場合はお気軽にご相談ください。";

describe("コーヒーケータリングの予約は7日前まで（2026-11-28 店主の指示）", () => {
  it("ご注文の流れの「ご予約」は7日前まで", () => {
    expect(catering.orderFlow.steps[0]).toEqual({ num: "01", title: "ご予約", text: "7日前までにLINE・メール・お電話でご予約ください。" });
  });
  it("ケータリングのページと、よくある質問（ケータリングについて）の答えも7日前まで", () => {
    expect(catering.faq.items.find(item => item.q === question)?.a).toBe(answer);
    const section = faq.categories.find(category => category.title === "ケータリングについて");
    expect(section?.items.find(item => item.q === question)?.a).toBe(answer);
  });
  it("ケータリングの文に「3日前」は残っていない。焙煎体験の期限（利用規約のキャンセルは前日まで）は変えない", () => {
    for (const path of ["content/pages/catering.json", "content/pages/faq.json"]) expect(readFileSync(path, "utf8"), path).not.toContain("3日前");
    expect(readFileSync("src/app/terms/page.tsx", "utf8")).toContain("<li>キャンセルは前日までにご連絡ください。</li>");
  });
});
