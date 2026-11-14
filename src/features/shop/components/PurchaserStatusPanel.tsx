"use client";

import { PurchaseBrandHeader, purchaseUi } from "./PurchaseBrand";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { emailCopy, giftCopy, paymentCopy, physicalCopy, purchaserStatusSchema, type BuyerStatus } from "../purchaser-status";
import { purchaseKeyForStatus, reconcilePurchasedCart, applyCheckoutCancellation, readPurchaseSession } from "../purchase-session";
import { CheckoutCancellationPanel } from "./CheckoutCancellationPanel";
import { PurchaseLegalLinks } from "./PurchaseTerms";
import { ProductPublicationDetails } from "./ProductPublicationDetails";

type View = { kind: "loading" | "missing" | "unavailable" | "busy" | "offline" | "ready" | "not_created"; status?: BuyerStatus; checkedAt?: number; purchaseKey?: string; cancelRequested?: boolean };
const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;
const card = purchaseUi.section;
type StatusRead = { kind: "missing" | "unavailable" | "busy" | "offline" } | { kind: "ready"; status: BuyerStatus; purchaseKey: string; cancelRequested: boolean };
async function readLatestStatus(signal: AbortSignal): Promise<StatusRead> {
  let key = ""; let cancelRequested = false;
  try {
    key = purchaseKeyForStatus(sessionStorage);
    const saved = readPurchaseSession(sessionStorage);
    cancelRequested = saved.attempt?.purchaseKey === key && saved.attempt.cancelRequested === true;
  } catch { /* Storage blocked is not a purchase failure. */ }
  if (!/^[a-f0-9]{64}$/.test(key)) return { kind: "missing" };
  const response = await fetch("/api/ec/purchase/status", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purchaseKey: key }), cache: "no-store", credentials: "omit", signal });
  if (!response.ok) return { kind: response.status === 404 ? "unavailable" : response.status === 429 ? "busy" : "offline" };
  return { kind: "ready", status: purchaserStatusSchema.parse((await response.json()).status), purchaseKey: key, cancelRequested };
}
export function PurchaserStatusPanel() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [cartWarning, setCartWarning] = useState("");
  const active = useRef<AbortController | null>(null);
  const refresh = useCallback(() => {
    active.current?.abort(); const controller = new AbortController(); active.current = controller;
    const timer = setTimeout(() => controller.abort(), 10000);
    return readLatestStatus(controller.signal).then(outcome => {
      if (active.current !== controller) return;
      if (controller.signal.aborted) throw new Error("STATUS_READ_ABORTED");
      if (outcome.kind !== "ready") {
        if (outcome.kind === "missing") setView({ kind: "missing" });
        else setView(previous => ({ ...previous, kind: outcome.kind }));
        return;
      }
      const { status: result, purchaseKey: key, cancelRequested } = outcome;
      try {
        reconcilePurchasedCart(sessionStorage, key, result);
        if (result.cancellation !== "none") applyCheckoutCancellation(sessionStorage, key, { cancellation: result.cancellation, status: result });
      } catch { setCartWarning("注文状況は確認できましたが、このタブのカート整理は完了していません。保存状態を確認するまで、同じ商品を買い直さないでください。"); }
      if (active.current === controller) setView({ kind: "ready", status: result, checkedAt: Date.now(), purchaseKey: key, cancelRequested });
    }).catch(() => {
      if (active.current === controller) setView(previous => ({ ...previous, kind: "offline" }));
    }).finally(() => { clearTimeout(timer); if (active.current === controller) setRefreshing(false); });
  }, []);
  useEffect(() => { void refresh(); return () => { active.current?.abort(); active.current = null; }; }, [refresh]);
  const data = view.status; const copy = data ? paymentCopy[data.payment] : undefined;
  const notice = view.kind === "missing" ? "このブラウザには注文を照合する情報がありません。注文したブラウザの同じタブで開いてください。請求があるか不明なときは、買い直す前に店舗へお問い合わせください。"
    : view.kind === "not_created" ? "この試行の注文は作られていませんでした。カートの内容は残しています。商品を選ぶ画面で合計を確認し直せます。"
    : view.kind === "unavailable" ? "注文を照合できませんでした。確認情報の有効期限などを店舗で確認する必要があります。新しい注文や再請求は行っていません。"
    : view.kind === "busy" ? "確認が続いたため、少し時間を空けてからお試しください。新しい注文は作っていません。"
    : view.kind === "offline" ? "現在、注文状況の接続確認ができません。通信が戻ってから「状況を再確認」を押してください。この表示は、支払失敗や注文取消を意味しません。" : "";
  return <main className={purchaseUi.page}>
    <div className={purchaseUi.container}>
      <PurchaseBrandHeader title="注文状況の確認" description="お支払い・商品の準備・発送を、記録に合わせて表示します。" />
      <div role="status" aria-live="polite" className={purchaseUi.status}>
        {view.kind === "loading" ? <p>注文記録を確認しています…</p> : null}
        {notice ? <p className={purchaseUi.notice}>{notice}</p> : null}
        {cartWarning ? <p className={`mt-3 ${purchaseUi.notice}`}>{cartWarning}</p> : null}
        {data && copy ? <><p className="mb-2 text-sm text-karekusa">{view.kind === "ready" ? "保存記録で確認した状況" : "前回確認できた時点の状況（最新ではありません）"}</p><h2 className={purchaseUi.statusTitle}>{copy.title}</h2><p className="mt-3 leading-relaxed">{copy.description}</p><p className="mt-4 break-all text-sm text-karekusa">注文番号：{data.orderReference}</p><p className="mt-1 text-sm text-karekusa">確認時刻：{new Date(view.checkedAt!).toLocaleString("ja-JP")}</p></> : null}
        <button disabled={refreshing || view.kind === "loading"} aria-busy={refreshing} onClick={() => { setRefreshing(true); void refresh(); }} className={`mt-5 ${purchaseUi.primary}`}>{refreshing ? "確認しています…" : "状況を再確認"}</button>
        <p className="mt-3 text-sm leading-relaxed text-karekusa">この操作は状況の読取だけです。注文・請求・メール送信は行いません。</p>
      </div>
      {data ? <>
        <section className={card}><h2 className={purchaseUi.heading}>商品とお支払い</h2><ul className="mt-4 divide-y divide-usuzumi">{data.items.map((item, i) => <li key={i} className="py-3"><p className="break-words font-medium">{item.name}</p><p className="mt-1 text-sm">{item.unit} × {item.quantity}点 ／ 1点 {yen(item.unitPrice)}</p><ProductPublicationDetails publication={item.publication} purchased /></li>)}</ul><dl className="mt-4 space-y-2 border-t border-usuzumi pt-4"><div className="flex justify-between gap-4"><dt>送料</dt><dd>{yen(data.shipping)}</dd></div><div className="flex justify-between gap-4 text-lg font-semibold"><dt>注文合計</dt><dd>{yen(data.total)}</dd></div>{data.refundedTotal > 0 ? <div className="flex justify-between gap-4"><dt>返金記録の合計</dt><dd>{yen(data.refundedTotal)}</dd></div> : null}</dl></section>
        <section className={card}><h2 className={purchaseUi.heading}>受け取りまでの状況</h2><dl className="mt-4 space-y-5">{data.physical !== "not_applicable" ? <div><dt className="font-semibold">商品の発送</dt><dd className="mt-1 leading-relaxed">{physicalCopy[data.physical]}</dd></div> : null}{data.giftDelivery !== "not_applicable" ? <div><dt className="font-semibold">ギフト券</dt><dd className="mt-1 leading-relaxed">{giftCopy[data.giftDelivery]}</dd></div> : null}<div><dt className="font-semibold">支払確認メール</dt><dd className="mt-1 leading-relaxed">{emailCopy[data.confirmationEmail]}</dd></div></dl></section>
      </> : null}
      {data && view.purchaseKey ? <CheckoutCancellationPanel purchaseKey={view.purchaseKey} payment={data.payment} pending={data.cancellation === "checking" || view.cancelRequested} state={data.cancellation} onOutcome={outcome => {
        if ("status" in outcome) setView(previous => ({ ...previous, kind: "ready", status: outcome.status, checkedAt: Date.now() }));
        else setView({ kind: "not_created" });
      }} /> : null}
      <section className={card}><h2 className={purchaseUi.heading}>わからないときは</h2><p className="mt-2 leading-relaxed">注文番号が表示されている場合は、その番号を添えて店舗へお問い合わせください。カード番号などの決済情報は送らないでください。</p><a className="mt-3 inline-flex min-h-12 items-center break-all underline underline-offset-4" href="mailto:misocacoffee@gmail.com">misocacoffee@gmail.com</a><p className="mt-2 text-sm">押すとメールアプリが開きます。自動送信はしません。</p></section>
      <Link href="/shop/order" className="inline-flex min-h-12 items-center underline underline-offset-4">商品を選ぶ画面へ</Link>
      <PurchaseLegalLinks />
    </div>
  </main>;
}
