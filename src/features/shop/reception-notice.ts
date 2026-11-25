import { z } from "zod";

/** Website-only reading of the catalog answer's `reception` field (F-2 / G-4).
 * purchaser-status.ts and ledger/purchase-server-transport.ts are the files kept
 * byte-identical with the management side; the agreed shape of `reception` lives
 * there too (same union, enforced strictly). This file only concerns itself with
 * how the purchase screen reads that field and turns it into Japanese copy. */
const receptionSchema = z.union([
  z.object({ state: z.literal("open") }).strict(),
  z.object({ state: z.literal("paused"), reopensAt: z.number().int().nonnegative().max(8_640_000_000_000_000).nullable(), message: z.string().max(80) }).strict(),
]);
/** A value that does not have the agreed shape (missing, wrong keys, bad
 * types…) is read as if the field were absent: the purchase screen keeps
 * today's fixed sentence (G-4, row 3: no switch, or not paused by it). It
 * never fails the catalog itself. */
export const catalogReceptionSchema = receptionSchema.optional().catch(undefined);
export type CatalogReception = z.infer<typeof catalogReceptionSchema>;

/** 日本時間で「12月5日（土）ごろ」。入力は UTC ミリ秒（日本は夏時間が無いので常に
 * 9時間の差。B-3）。端末のタイムゾーン設定には頼らない。 */
export function reopensAtLabel(reopensAt: number) {
  const parts = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", weekday: "short" })
    .formatToParts(new Date(reopensAt));
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return `${get("month")}月${get("day")}日（${get("weekday")}）ごろ`;
}

/** 購入画面のいちばん上に出す、お休み中の文（G-4）。`reception` が無い・
 * `state` が `"open"`（販売を始める前で `acceptingOrders` が false なだけ）の
 * ときは null を返す。呼び出し側は null のとき今までの固定の一文を出す。 */
export function receptionPauseNotice(reception: CatalogReception) {
  if (!reception || reception.state === "open") return null;
  const lead = reception.reopensAt === null
    ? "ただいま、ご注文の受付をお休みしています。再開の時期は、このページでお知らせします。"
    : `ただいま、ご注文の受付をお休みしています。${reopensAtLabel(reception.reopensAt)}に再開する予定です。`;
  // 店の一言が句点なしで終わっていても、次の文とつながらないようにする。
  const message = reception.message && !/[。！？!?]$/.test(reception.message) ? `${reception.message}。` : reception.message;
  return `${lead}${message}金額の確認はできますが、決済へは進めません。`;
}
