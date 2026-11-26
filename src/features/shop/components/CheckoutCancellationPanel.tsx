"use client";

import { purchaseUi } from "./PurchaseBrand";
import { useEffect, useRef, useState } from "react";
import { cancellationCopy, purchaseCancellationResultSchema, type BuyerStatus, type PurchaseCancellationResult } from "../purchaser-status";
import { applyCheckoutCancellation, markCheckoutCancellation, type PurchaseSession } from "../purchase-session";

export function CheckoutCancellationPanel({ purchaseKey, pending = false, state = "none", payment, onSessionChange, onOutcome, onIntent }: {
  purchaseKey: string; pending?: boolean; state?: BuyerStatus["cancellation"]; payment?: BuyerStatus["payment"];
  onSessionChange?(session: PurchaseSession): void; onOutcome?(outcome: PurchaseCancellationResult): void;
  onIntent?(): void;
}) {
  const [open, setOpen] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const [requested, setRequested] = useState(false); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
  const [resultState, setResultState] = useState<BuyerStatus["cancellation"] | null>(null);
  const [orderReference, setOrderReference] = useState("");
  const active = useRef(false); const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  async function submit() {
    if (active.current || payment !== undefined && payment !== "waiting" || !confirmed && !pending && !requested) return;
    active.current = true; setBusy(true); setNotice("");
    setRequested(true); onIntent?.();
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const saved = markCheckoutCancellation(sessionStorage, purchaseKey);
      onSessionChange?.(saved);
      const response = await fetch("/api/ec/purchase/cancel", { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", cache: "no-store", body: JSON.stringify({ purchaseKey, confirmed: true }), signal: controller.signal });
      if (!alive.current) return;
      if (!response.ok) throw new Error("CANCELLATION_UNCONFIRMED");
      const result = purchaseCancellationResultSchema.parse(await response.json());
      if (!alive.current) return;
      const next = applyCheckoutCancellation(sessionStorage, purchaseKey, result);
      if ("status" in result) { setResultState(result.cancellation); setOrderReference(result.status.orderReference); }
      onOutcome?.(result); onSessionChange?.(next);
      setNotice(result.cancellation === "not_created" ? "注文は作られていませんでした。カートの内容はそのまま残しています。" : "");
    } catch { if (alive.current) setNotice("決済中止の受付・結果を確認できませんでした。新しい決済は始めず、同じ依頼の確認を続けてください。"); }
    finally { clearTimeout(timer); active.current = false; if (alive.current) setBusy(false); }
  }
  const effectiveState = state !== "none" ? state : resultState ?? (pending || requested ? "checking" : state);
  const repeat = pending || requested || effectiveState === "checking";
  if (payment === "closed" && effectiveState === "none") return null;
  if (payment !== undefined && payment !== "waiting" && effectiveState !== "closed" && effectiveState !== "payment_review") return <section className={purchaseUi.section}>
    <h2 className={purchaseUi.heading}>注文の変更・取消について</h2>
    <p className="mt-3 leading-relaxed">{payment === "confirmed" ? "お支払い確認後の変更・取消は、店舗へお問い合わせください。" : payment === "refunded" || payment === "partially_refunded" ? "返金の記録があります。注文の変更や返金について不明な点は、店舗へお問い合わせください。" : "この注文は店舗での確認が必要です。変更・取消をご希望の場合は店舗へお問い合わせください。"}</p>
    {repeat ? <p className="mt-3 text-sm leading-relaxed">中止の依頼履歴があっても、取消・返金が完了したという意味ではありません。注文状況を開いて最新の記録を確認してください。</p> : null}
    <a className={`mt-3 ${purchaseUi.link}`} href="mailto:misocacoffee@gmail.com">店舗へ問い合わせる（メールアプリを開く）</a>
    <p className="mt-3 text-sm leading-relaxed text-haicha">注文番号を添えてご連絡ください。この画面から取消・返金やメールの自動送信は行いません。</p>
  </section>;
  return <section className={purchaseUi.section}>
    <h2 className={purchaseUi.heading}>{effectiveState === "closed" ? "決済中止の結果" : effectiveState === "payment_review" ? "店舗での確認が必要です" : "決済をやめたいとき"}</h2>
    {effectiveState !== "none" ? <p className="mt-3 leading-relaxed">{cancellationCopy[effectiveState]}</p> : <p className="mt-3 leading-relaxed">未払いの決済受付を閉じるよう依頼します。支払い済みや処理中の場合は店舗での確認が必要で、ここから自動返金はしません。</p>}
    {orderReference ? <p className="mt-3 break-all text-sm">注文番号：{orderReference}</p> : null}
    {effectiveState === "payment_review" ? <a className={`mt-3 ${purchaseUi.link}`} href="mailto:misocacoffee@gmail.com">店舗へ問い合わせる（メールアプリを開く）</a> : null}
    {notice ? <p role="status" className={`mt-3 ${purchaseUi.notice}`}>{notice}</p> : null}
    {effectiveState !== "closed" && effectiveState !== "payment_review" ? repeat ? <button disabled={busy} className={`mt-4 ${purchaseUi.secondary}`} onClick={() => { void submit(); }}>{busy ? "中止の結果を確認中…" : "同じ中止依頼を再確認"}</button> : <>
      {!open ? <button className={`mt-4 ${purchaseUi.secondary}`} onClick={() => setOpen(true)}>決済中止の内容を確認</button> : <div className={`mt-4 space-y-4 ${purchaseUi.inset}`}>
        <p className="leading-relaxed">この注文の決済受付の中止を依頼します。確認中は別の決済へ進みません。支払済みなら取消・返金せず、店舗の確認へ回すことを理解してください。</p>
        <label className="flex min-h-12 items-start gap-3 py-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className={purchaseUi.checkbox} /><span>この注文の決済中止を依頼する内容を確認しました</span></label>
        <button disabled={!confirmed || busy} className={purchaseUi.primary} onClick={() => { void submit(); }}>{busy ? "中止を確認中…" : "確認して決済中止を依頼"}</button>
        <button disabled={busy} className={`ml-3 ${purchaseUi.link}`} onClick={() => { setOpen(false); setConfirmed(false); }}>戻る</button>
      </div>}
    </> : null}
    <p className="mt-4 text-sm leading-relaxed">{effectiveState === "closed" ? "買い直す場合は、商品を選ぶ画面で内容と金額を確認してください。" : effectiveState === "payment_review" ? "取消・返金の可否は、支払いや商品の準備状況を確認してから店舗が判断します。" : "表示を閉じるだけでは取消になりません。受付終了を確認できるまで、同じ商品を買い直さないでください。"}</p>
  </section>;
}
