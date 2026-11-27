"use client";

import { PurchaseBrandBar, purchaseUi } from "./PurchaseBrand";

import { useCallback, useEffect, useRef, useState } from "react";
import { giftCopy, paymentCopy, purchaserStatusSchema, type BuyerStatus } from "../purchaser-status";
import { physicalStatusView, shippingFeeLabel, showsShippingWindow } from "../receiving-method";
import { purchaseKeyForStatus, reconcilePurchasedCart, applyCheckoutCancellation, readPurchaseSession } from "../purchase-session";
import { PurchaseLegalLinks, purchaseConditions } from "./PurchaseTerms";
import { statusCopy } from "../checkout-copy";
import { usePageStartsAtTop } from "./use-page-top";
import { StatusCancel } from "./StatusCancel";

type View = { kind: "loading" | "missing" | "unavailable" | "busy" | "offline" | "ready"; status?: BuyerStatus; purchaseKey?: string };
const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;
/** While the payment notice has not arrived, the page checks again by itself
 * (a read only) every few seconds; a button appears only after 30 seconds. */
export const STATUS_POLL_MS = 2500, STATUS_POLL_LIMIT_MS = 30000;
type StatusRead = { kind: "missing" | "unavailable" | "busy" | "offline" } | { kind: "ready"; status: BuyerStatus; purchaseKey: string };
async function readLatestStatus(signal: AbortSignal): Promise<StatusRead> {
  let key = "";
  try { key = purchaseKeyForStatus(sessionStorage); readPurchaseSession(sessionStorage); } catch { /* Storage blocked is not a purchase failure. */ }
  if (!/^[a-f0-9]{64}$/.test(key)) return { kind: "missing" };
  const response = await fetch("/api/ec/purchase/status", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purchaseKey: key }), cache: "no-store", credentials: "omit", signal });
  if (!response.ok) return { kind: response.status === 404 ? "unavailable" : response.status === 429 ? "busy" : "offline" };
  return { kind: "ready", status: purchaserStatusSchema.parse((await response.json()).status), purchaseKey: key };
}
/** The physical part of an order. An answer without `receiving` (every
 * shipping order) renders the heading, wording and shipping window exactly as
 * before; with it, the wording follows the receiving method. */
export function PhysicalStatus({ status }: { status: BuyerStatus }) {
  const physical = physicalStatusView(status);
  return <div><dt className="font-semibold">{physical.heading}</dt><dd className="mt-1 leading-relaxed">{physical.text}</dd>{showsShippingWindow(status) ? <dd className="mt-1 text-sm leading-relaxed text-karekusa">{purchaseConditions.shipping}</dd> : null}{physical.place ? <dd className="mt-1 text-sm leading-relaxed text-karekusa">{physical.place}</dd> : null}</div>;
}
export function PurchaserStatusPanel() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [slow, setSlow] = useState(false);
  const [cartWarning, setCartWarning] = useState("");
  const active = useRef<AbortController | null>(null);
  const startedAt = useRef(0);
  usePageStartsAtTop();
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
      const { status: result, purchaseKey: key } = outcome;
      try {
        reconcilePurchasedCart(sessionStorage, key, result);
        if (result.cancellation !== "none") applyCheckoutCancellation(sessionStorage, key, { cancellation: result.cancellation, status: result });
      } catch { setCartWarning("このタブのカートを整理できませんでした。同じ商品を買い直す前に、カートをご確認ください。"); }
      if (active.current === controller) setView({ kind: "ready", status: result, purchaseKey: key });
    }).catch(() => {
      if (active.current === controller) setView(previous => ({ ...previous, kind: "offline" }));
    }).finally(() => { clearTimeout(timer); if (active.current === controller) setRefreshing(false); });
  }, []);
  useEffect(() => { startedAt.current = Date.now(); void refresh(); return () => { active.current?.abort(); active.current = null; }; }, [refresh]);
  const waiting = view.kind === "ready" && view.status?.payment === "waiting";
  useEffect(() => {
    if (!waiting || slow) return;
    const timer = setTimeout(() => { if (Date.now() - startedAt.current >= STATUS_POLL_LIMIT_MS) setSlow(true); else void refresh(); }, STATUS_POLL_MS);
    return () => clearTimeout(timer);
  }, [waiting, slow, view, refresh]);
  const data = view.status;
  const title = view.kind === "loading" || waiting && !slow ? statusCopy.confirming
    : data?.payment === "confirmed" ? statusCopy.thanks : data ? paymentCopy[data.payment].title : null;
  const problem = view.kind === "missing" ? statusCopy.missing : view.kind === "unavailable" ? statusCopy.unavailable
    : view.kind === "busy" || view.kind === "offline" ? statusCopy.offline : waiting && slow ? statusCopy.slow : "";
  const showCheck = view.kind === "busy" || view.kind === "offline" || waiting && slow;
  return <main className={purchaseUi.page}>
    <div className={purchaseUi.container}>
      <PurchaseBrandBar />
      <section role="status" aria-live="polite" className="pt-4">
        {title ? <>
          <div aria-hidden="true" className="mb-6 h-px w-10 bg-gold" />
          <h1 className="font-serif text-2xl font-light leading-relaxed tracking-wider text-konsumi sm:text-3xl">{title}</h1>
        </> : null}
        {problem ? <p className="mt-3 text-sm leading-relaxed text-sumi">{problem}</p> : null}
        {cartWarning ? <p className={`mt-3 ${purchaseUi.notice}`}>{cartWarning}</p> : null}
        {showCheck ? <button disabled={refreshing} aria-busy={refreshing} onClick={() => { setRefreshing(true); setSlow(false); startedAt.current = Date.now(); void refresh(); }} className={`mt-5 ${purchaseUi.primary}`}>{refreshing ? "確認しています…" : statusCopy.check}</button> : null}
      </section>
      {data ? <section aria-label="ご注文の内容" className="mt-10 border-t border-usuzumi pt-8">
        <p className="text-sm text-haicha">{statusCopy.orderNumber}：<span className="break-all text-sumi">{data.orderReference}</span></p>
        <ul className="mt-4 divide-y divide-usuzumi/60">{data.items.map((item, i) => <li key={i} className="flex items-baseline justify-between gap-4 py-3 text-sm">
          <span className="min-w-0 break-words">{item.name} <span className="text-haicha">{item.unit} × {item.quantity}</span></span><span className="shrink-0">{yen(item.unitPrice * item.quantity)}</span>
        </li>)}</ul>
        <dl className="mt-2 space-y-2 border-t border-usuzumi pt-4 text-sm">
          <div className="flex justify-between gap-4"><dt>{shippingFeeLabel(data.receiving ?? "shipping")}</dt><dd>{yen(data.shipping)}</dd></div>
          <div className="flex items-baseline justify-between gap-4 font-serif text-xl text-konsumi"><dt>注文合計</dt><dd>{yen(data.total)}</dd></div>
          {data.refundedTotal > 0 ? <div className="flex justify-between gap-4"><dt>返金記録の合計</dt><dd>{yen(data.refundedTotal)}</dd></div> : null}
        </dl>
        {data.payment === "confirmed" ? <dl className="mt-8 space-y-4 text-sm">
          {data.physical !== "not_applicable" ? <PhysicalStatus status={data} /> : null}
          {data.giftDelivery !== "not_applicable" ? <div><dt className="font-medium">ギフト券</dt><dd className="mt-1 leading-relaxed">{giftCopy[data.giftDelivery]}</dd></div> : null}
        </dl> : null}
        {/* Paid orders only: the server's preview decides whether a request is possible. */}
        {data.payment === "confirmed" && view.purchaseKey ? <StatusCancel purchaseKey={view.purchaseKey} /> : null}
      </section> : null}
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2">
        <a href="/shop" className={purchaseUi.primary}>{statusCopy.back}</a>
        <a href="mailto:misocacoffee@gmail.com" className={purchaseUi.link}>{statusCopy.contact}</a>
      </div>
      <PurchaseLegalLinks />
    </div>
  </main>;
}
