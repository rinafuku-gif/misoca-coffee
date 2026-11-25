import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { receptionPauseNotice, reopensAtLabel } from "../reception-notice";
import { catalogSchema } from "../components/PurchasePanel";

const read = (path: string) => readFileSync(resolve(path), "utf8");
const plain = { items: [], nextOffset: null, acceptingOrders: true };

describe("reopensAtLabel: 日本時間の「◯月◯日（◯）ごろ」", () => {
  it("UTCミリ秒を日本時間の月日と曜日で表す（端末のタイムゾーンに頼らない）", () => {
    expect(reopensAtLabel(Date.UTC(2026, 11, 5, 0, 0, 0))).toBe("12月5日（土）ごろ");
  });
  it("年末年始をまたぐ（UTC日付とJST日付が違う日）", () => {
    expect(reopensAtLabel(Date.UTC(2026, 11, 31, 15, 0, 0))).toBe("1月1日（金）ごろ");
  });
});

describe("receptionPauseNotice（G-4 の3場面）", () => {
  it("reception が無い・state が open のときは null（呼び出し側が今の固定の一文を出す）", () => {
    expect(receptionPauseNotice(undefined)).toBeNull();
    expect(receptionPauseNotice({ state: "open" })).toBeNull();
  });
  it("再開の予定ありのとき、日付入りの文＋店の一言＋今の後半の文を続ける", () => {
    const notice = receptionPauseNotice({ state: "paused", reopensAt: Date.UTC(2026, 11, 5, 0, 0, 0), message: "年末年始はお休みをいただきます。" });
    expect(notice).toBe("ただいま、ご注文の受付をお休みしています。12月5日（土）ごろに再開する予定です。年末年始はお休みをいただきます。金額の確認はできますが、決済へは進めません。");
  });
  it("再開が未定のとき", () => {
    const notice = receptionPauseNotice({ state: "paused", reopensAt: null, message: "" });
    expect(notice).toBe("ただいま、ご注文の受付をお休みしています。再開の時期は、このページでお知らせします。金額の確認はできますが、決済へは進めません。");
  });
});

describe("商品一覧の reception の読み方（ブラウザ側・購入画面の検査）", () => {
  it("項目が無い応答は今までどおり読む", () => {
    expect(catalogSchema.parse(plain)).toEqual(plain);
    expect(catalogSchema.parse(plain).reception).toBeUndefined();
  });
  it.each([
    [{ state: "open" }],
    [{ state: "paused", reopensAt: null, message: "" }],
    [{ state: "paused", reopensAt: 1, message: "a" }],
  ])("決まった形 %j は読める", reception => {
    expect(catalogSchema.parse({ ...plain, reception }).reception).toEqual(reception);
  });
  it.each([
    ["知らないstate", { state: "closed" }],
    ["pausedにreopensAtが無い", { state: "paused", message: "" }],
    ["pausedにmessageが無い", { state: "paused", reopensAt: null }],
    ["messageが81字", { state: "paused", reopensAt: null, message: "あ".repeat(81) }],
    ["reopensAtが負", { state: "paused", reopensAt: -1, message: "" }],
    ["余分な項目", { state: "open", extra: 1 }],
    ["配列でない値（文字列）", "paused"],
    ["配列でない値（null）", null],
    ["配列でない値（数）", 1],
  ])("形が合わない %s のときは、商品一覧は読めて reception は無いのと同じ扱い（一覧全体を失敗させない）", (_label, reception) => {
    const parsed = catalogSchema.safeParse({ ...plain, reception });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.reception).toBeUndefined();
    expect(parsed.data!.acceptingOrders).toBe(true);
  });
  it("ボタンを止めるかは、reception の形に関わらず acceptingOrders だけで決める", () => {
    const panel = read("src/features/shop/components/PurchasePanel.tsx");
    expect(panel).toContain("disabled={busy || catalogStale || !confirmed || !catalog.acceptingOrders}");
    expect(panel).not.toMatch(/disabled=\{[^}]*reception/);
  });
  it("写した受け渡し部品（管理側と同じ内容に保つファイル）は、この読み方を使わない", () => {
    expect(read("src/features/shop/ledger/purchase-server-transport.ts")).not.toContain("reception-notice");
    expect(read("src/features/shop/purchaser-status.ts")).not.toContain("reception-notice");
  });
});

describe("店の一言と再開の日時の端", () => {
  it("句点のない一言でも、次の文とつながらない。句点があれば重ねない", () => {
    expect(receptionPauseNotice({ state: "paused", reopensAt: null, message: "関西に帰っています" })).toContain("関西に帰っています。金額の確認は");
    expect(receptionPauseNotice({ state: "paused", reopensAt: null, message: "関西に帰っています。" })).toContain("関西に帰っています。金額の確認は");
    expect(receptionPauseNotice({ state: "paused", reopensAt: null, message: "" })).toContain("お知らせします。金額の確認は");
  });
  it("日付にできない大きさの reopensAt は「無い」として扱い、画面を壊さない", () => {
    const parsed = catalogSchema.parse({ ...plain, acceptingOrders: false, reception: { state: "paused", reopensAt: Number.MAX_SAFE_INTEGER, message: "" } });
    expect(parsed.reception).toBeUndefined();
  });
});
