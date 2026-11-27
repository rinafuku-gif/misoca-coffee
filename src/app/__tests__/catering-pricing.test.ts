import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import catering from "@content/pages/catering.json";

const yen = (value: string) => Number(value.replace(/[¥,]/g, ""));
const maxCups = (includes: readonly string[]) => Number(/〜(\d+)杯分/.exec(includes.join(" "))?.[1]);

describe("コーヒーケータリングの料金（1杯350円で計算・2026-11-28 店主の指示）", () => {
  it("S・M・L は ¥7,000／¥14,000／¥21,000。どれも上限の杯数 × 350円", () => {
    const [s, m, l] = catering.plans.items;
    expect([s.price, m.price, l.price]).toEqual(["¥7,000", "¥14,000", "¥21,000"]);
    for (const plan of [s, m, l]) expect(yen(plan.price), plan.name).toBe(maxCups(plan.includes) * 350);
  });
  it("S の初回は30%オフ ¥4,900。M・L の注記は「1杯あたり350円」", () => {
    const [s, m, l] = catering.plans.items as { campaign?: string; note?: string; price: string }[];
    expect(s.campaign).toBe("初回30%オフ ¥4,900");
    expect(yen(s.price) * 0.7).toBe(4900);
    expect([m.note, l.note]).toEqual(["1杯あたり350円", "1杯あたり350円"]);
  });
  it("大規模プラン: LL（〜80名様）¥28,000、MAX（〜100名様）¥35,000", () => {
    expect(catering.largePlans.items).toEqual([
      { name: "LLプラン", capacity: "〜80名様", price: "¥28,000" },
      { name: "MAXプラン", capacity: "〜100名様", price: "¥35,000" },
    ]);
  });
  it("杯数・人数・含まれるもの・オプションは変えない", () => {
    expect(catering.plans.items.map(plan => [plan.description, plan.includes])).toEqual([
      ["〜15名様向け", ["ポット1本（約3.4L）", "15〜20杯分", "紙カップ付き", "配送・回収費込み"]],
      ["〜30名様向け", ["ポット2本（約6.8L）", "30〜40杯分", "紙カップ付き", "配送・回収費込み"]],
      ["〜45名様向け", ["ポット3本（約10.2L）", "45〜60杯分", "紙カップ付き", "配送・回収費込み"]],
    ]);
    expect(catering.planFootnotes[0]).toBe("※ オプション：シュガー・ミルク・マドラーセット +¥500/1ポット");
  });
  it("サイトの中（ページの元データ・よくある質問・トップ）に旧料金の言い方が残っていない", () => {
    for (const path of ["content/pages/catering.json", "content/pages/faq.json", "content/pages/home.json", "src/app/catering/page.tsx", "src/shared/seo/service-metadata.ts"]) {
      const source = readFileSync(path, "utf8");
      expect(source, path).not.toMatch(/¥(10|18|26|34|42),000|初回半額|2,000円お得|400円台/);
    }
  });
});
