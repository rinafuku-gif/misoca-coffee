"use client";

import { PurchaseBrandHeader, PurchaseSelectionSummary, purchaseUi } from "./PurchaseBrand";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { buyerProductPublicationSchema } from "../product-publication-view";
import { ProductPublicationDetails } from "./ProductPublicationDetails";
import { purchaserStatusSchema, cancellationCopy } from "../purchaser-status";
import { CheckoutCancellationPanel } from "./CheckoutCancellationPanel";
import { UnlistedCartItems } from "./UnlistedCartItems";
import { recoverRejectedCheckout, unlistedCartLines, shippingFailureNotice } from "../purchase-recovery";
import { allowedCheckoutLocation, purchaseKeyForStatus, readPurchaseSession, reconcilePurchasedCart, writePurchaseSession, type PurchaseAttempt, type PurchaseSession } from "../purchase-session";

const product = z.object({ skuId: z.string(), name: z.string(), unit: z.string(), unitPrice: z.number().int().nonnegative(), kind: z.enum(["physical", "gift"]), maxQuantity: z.number().int().min(0).max(20), publication: buyerProductPublicationSchema.optional() }).strict();
const catalogSchema = z.object({ items: z.array(product).max(50), nextOffset: z.number().int().nonnegative().nullable(), acceptingOrders: z.boolean() }).strict();
const quotationSchema = z.object({ items: z.array(product.omit({ maxQuantity: true }).extend({ quantity: z.number().int().min(1).max(20) })).max(20), total: z.number().int().nonnegative(), shipping: z.number().int().nonnegative(), acceptedQuote: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
type Catalog = z.infer<typeof catalogSchema>; type Quotation = z.infer<typeof quotationSchema>;
const money = (value: number) => `¥${value.toLocaleString("ja-JP")}`;
const card = purchaseUi.section;
const button = purchaseUi.primary;
function purchaseNotice(error: unknown, fallback: string) {
  return error instanceof Error && error.message === "PURCHASE_BUSY"
    ? "現在アクセスが集中しています。少し時間を空けてからもう一度お試しください。決済を始めた場合は買い直さず、同じ注文の状況を確認してください。"
    : fallback;
}
async function post(action: string, body: unknown) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/ec/purchase/${action}`, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", cache: "no-store", body: JSON.stringify(body), signal: controller.signal });
    if (response.status === 429) {
      await response.body?.cancel();
      throw new Error("PURCHASE_BUSY");
    }
    return { ok: response.ok, body: await response.json() };
  } finally { clearTimeout(timer); }
}
export function PurchasePanel({ shopRoot = false }: { shopRoot?: boolean } = {}) {
  const [session, setSession] = useState<PurchaseSession | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(true); const inFlight = useRef(false);
  const alive = useRef(true);
  const cancellationIntents = useRef(new Set<string>());
  const [catalogLabels, setCatalogLabels] = useState(new Map<string, string>());
  const [catalogStale, setCatalogStale] = useState(false);
  const [notice, setNotice] = useState(""); const [fatal, setFatal] = useState(false);
  useEffect(() => {
    alive.current = true;
    let live = true;
    void (async () => {
      try {
        const saved = readPurchaseSession(sessionStorage);
        if (!saved.attempt && !saved.history.length && purchaseKeyForStatus(sessionStorage)) throw new Error("OLDER_PURCHASE_PRESENT");
        const result = await post("catalog", {});
        if (!result.ok) throw new Error("CATALOG_UNAVAILABLE");
        const loaded = catalogSchema.parse(result.body);
        if (live) { rememberCatalog(loaded); setSession(saved); setCatalog(loaded); }
      } catch (error) {
        if (live) { setFatal(true); setNotice(purchaseNotice(error, "商品または保存情報を確認できませんでした。以前の注文がある場合は状況を確認し、買い直さないでください。")); }
      } finally { if (live) setBusy(false); }
    })();
    return () => { live = false; alive.current = false; };
  }, []);
  function save(next: PurchaseSession) { writePurchaseSession(sessionStorage, next); setSession(next); }
  function rememberCatalog(next: Catalog) {
    setCatalogLabels(previous => new Map([...previous, ...next.items.map(item => [item.skuId, `${item.name} ${item.unit}`] as const)]));
  }
  async function send(action: string, body: unknown) {
    const result = await post(action, body); if (!alive.current) throw new Error("PAGE_LEFT"); return result;
  }
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return; inFlight.current = true; setBusy(true); setNotice("");
    try { await action(); } catch (error) { if (alive.current) setNotice(purchaseNotice(error, "通信または保存情報を確認できませんでした。決済を始めた場合は同じ注文の状況を確認してください。自動で新しい注文は作りません。")); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  async function refreshCatalog(message: string) {
    setQuotation(null); setConfirmed(false); setCatalogStale(true); setNotice(message);
    try {
      const result = await send("catalog", {});
      if (!result.ok) throw new Error("CATALOG_UNAVAILABLE");
      const next = catalogSchema.parse(result.body);
      rememberCatalog(next); setCatalog(next); setCatalogStale(false);
    } catch {
      // Preserve a proven no-order outcome even if this read fails. Never turn
      // a failed catalog read into an unknown charge or discard the cart.
      if (alive.current) setNotice(`${message} 商品一覧の更新はできませんでした。「商品一覧を更新」を押してください。`);
    }
  }
  function quantity(skuId: string, value: number) {
    if (!session || session.attempt || busy) return;
    if (value > 0 && !session.cart.some(l => l.skuId === skuId) && session.cart.length >= 20) { setNotice("一度に選べる商品は20種類までです。先に選んだ商品の数量を0にすると外せます。"); return; }
    try {
      const cart = session.cart.filter(l => l.skuId !== skuId); if (value > 0) cart.push({ skuId, quantity: value });
      save({ ...session, cart }); setQuotation(null); setConfirmed(false); setNotice("");
    } catch { setNotice("カートを保存できません。内容を保持できるまで決済は始めません。"); }
  }
  async function preview() {
    if (!session?.cart.length || catalogStale) return;
    setQuotation(null); setConfirmed(false);
    const result = await send("quote", { lines: session.cart });
    if (!result.ok) {
      const shippingNotice = shippingFailureNotice(result.body);
      if (shippingNotice) { setNotice(shippingNotice); return; }
      await refreshCatalog("合計を確認できませんでした。商品と数量を見直してください。この操作では注文・請求は始まりません。"); return;
    }
    setQuotation(quotationSchema.parse(result.body)); setConfirmed(false); setNotice("");
  }
  async function checkout(attempt: PurchaseAttempt) {
    const current = readPurchaseSession(sessionStorage);
    save({ ...current, viewKey: attempt.purchaseKey });
    const result = await send("checkout", { purchaseKey: attempt.purchaseKey, lines: attempt.lines, acceptedQuote: attempt.acceptedQuote });
    const latest = readPurchaseSession(sessionStorage);
    if (latest.attempt?.purchaseKey !== attempt.purchaseKey || latest.attempt.cancelRequested || cancellationIntents.current.has(attempt.purchaseKey)) { setNotice("決済中止の確認を続けています。新しい決済画面へは進みません。"); return; }
    if (!result.ok) {
      const recovered = recoverRejectedCheckout(latest, attempt.purchaseKey, result.body);
      if (recovered) {
        save(recovered.session);
        await refreshCatalog(recovered.notice);
      } else setNotice(shippingFailureNotice(result.body, true) ?? "同じ注文の確認が必要です。買い直さず「この注文の状況を確認」から確認してください。決済の再開も同じ注文を使います。");
      return;
    }
    purchaserStatusSchema.parse(result.body.status);
    if (result.body.checkoutUrl === null) { window.location.assign("/shop/success"); return; }
    if (typeof result.body.checkoutUrl !== "string" || !allowedCheckoutLocation(result.body.checkoutUrl, location.origin)) throw new Error("CHECKOUT_DESTINATION_INVALID");
    window.location.assign(result.body.checkoutUrl);
  }
  async function begin() {
    if (!session || session.attempt || !quotation || !confirmed || catalogStale || !catalog?.acceptingOrders) return;
    const bytes = crypto.getRandomValues(new Uint8Array(32)); const purchaseKey = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    const attempt: PurchaseAttempt = { purchaseKey, lines: session.cart, acceptedQuote: quotation.acceptedQuote };
    // Save the exact attempt atomically BEFORE an external outcome can become unknown.
    save({ ...session, attempt, viewKey: purchaseKey }); await checkout(attempt);
  }
  async function anotherOrder() {
    if (!session?.attempt) return;
    const result = await send("status", { purchaseKey: session.attempt.purchaseKey });
    if (cancellationIntents.current.has(session.attempt.purchaseKey)) return;
    if (!result.ok) throw new Error("STATUS_UNAVAILABLE");
    const status = purchaserStatusSchema.parse(result.body.status);
    if (status.payment !== "confirmed") { setNotice("前の注文をまだ確認できません。先に注文状況を確認してください。"); return; }
    const updated = reconcilePurchasedCart(sessionStorage, session.attempt.purchaseKey, status);
    const history = updated.history.some(h => h.orderReference === status.orderReference) ? updated.history : [...updated.history, { purchaseKey: session.attempt.purchaseKey, orderReference: status.orderReference }];
    save({ ...updated, attempt: null, history }); setQuotation(null); setConfirmed(false);
  }
  const selected = session?.cart.reduce((sum, l) => sum + l.quantity, 0) ?? 0;
  return <main className={purchaseUi.page}><div className="mx-auto max-w-6xl">
    <PurchaseBrandHeader title="珈琲を選ぶ" description="商品について読みながら、お好きな珈琲をお選びください。送料と合計は、お支払いの前に確認できます。" shopIntroduction={Boolean(session && !session.attempt)} shopRoot={shopRoot} />
    {busy ? <p role="status">確認しています…</p> : null}
    {notice ? <div role="alert" className={purchaseUi.notice}><p>{notice}</p>{notice.includes("配送条件") || notice.includes("発送できる数量") ? <a href="/contact" className="mt-3 inline-flex min-h-12 items-center underline">配送について相談する</a> : null}</div> : null}
    {fatal ? <section className={card}><button className={button} onClick={() => location.reload()}>読み直す</button><p className="mt-4"><a href="/shop/success" className="inline-flex min-h-12 items-center underline">以前の注文状況を確認</a></p></section> : null}
    {session?.attempt ? <section className={card}>
      <h2 className={purchaseUi.heading}>{session.attempt.cancelRequested ? "決済中止の確認を続けています" : session.attempt.settledOrderId ? "前の注文のお支払いを確認済みです" : "決済の準備を始めた記録があります"}</h2>
      <p className="mt-3 leading-relaxed">同じ内容の新しい注文は作らず、このタブに残した確認情報を使って状況を確認・再開します。</p>
      <button disabled={busy} className="mt-4 flex min-h-12 items-center font-semibold underline" onClick={() => {
        try { save({ ...session, viewKey: session.attempt!.purchaseKey }); location.assign("/shop/success"); }
        catch { setNotice("確認情報を保存できませんでした。"); }
      }}>この注文の状況を確認</button>
      {!session.attempt.cancelRequested ? session.attempt.settledOrderId
        ? <button className={button} disabled={busy} onClick={() => { void run(anotherOrder); }}>新しく商品を選ぶ</button>
        : <button className={button} disabled={busy || !catalog?.acceptingOrders} onClick={() => { void run(() => checkout(session.attempt!)); }}>同じ注文の決済へ戻る</button> : null}
    </section> : null}
    {session?.attempt ? <CheckoutCancellationPanel purchaseKey={session.attempt.purchaseKey} payment={session.attempt.settledOrderId ? "confirmed" : undefined} pending={session.attempt.cancelRequested} onIntent={() => {
      const key = session.attempt!.purchaseKey; cancellationIntents.current.add(key);
      setSession(previous => previous?.attempt?.purchaseKey === key ? { ...previous, attempt: { ...previous.attempt, cancelRequested: true } } : previous);
    }} onSessionChange={setSession} onOutcome={outcome => {
      setQuotation(null); setConfirmed(false);
      setNotice(outcome.cancellation === "not_created" ? "注文は作られていませんでした。カートの内容を残しています。合計を確認し直してから購入できます。" : outcome.cancellation === "closed" && outcome.status.payment === "closed" ? cancellationCopy.closed : "");
    }} /> : null}
    {catalog && session && !session.attempt ? <>
      {!catalog.acceptingOrders ? <p className={purchaseUi.notice}>現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。</p> : null}
      <div className="my-6">
        {catalogStale ? <p className="text-sm leading-loose text-haicha">現在は更新前の商品一覧です。更新できるまで決済には進めません。選択から外す操作はできます。</p> : null}
      </div>
      <PurchaseSelectionSummary count={selected} />
      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <section className={card} aria-label="商品と数量">
        <p aria-hidden="true" className={purchaseUi.step}>01 / SELECT</p>
        <h2 className={purchaseUi.heading}>お好きな珈琲を選ぶ</h2>
        <p className="mt-3 text-sm text-haicha">数量を選んでください。選択をやめるときは0に戻せます。</p>
        {!catalog.items.length ? <p className="mt-4">現在選べる商品はありません。</p> : null}
        <ul className="mt-8 divide-y divide-usuzumi/60">{catalog.items.map(item => {
          const qty = session.cart.find(l => l.skuId === item.skuId)?.quantity ?? 0;
          return <li key={item.skuId} className="py-8 first:pt-0">
            <div className={`border-l-2 pl-5 ${qty > 0 ? "border-gold" : "border-transparent"}`}>
            <h3 className="break-words font-serif text-xl font-normal tracking-wider text-konsumi">{item.name}</h3>
            <p className="mt-3 text-sm text-haicha">{item.unit}<span className="ml-5 text-base text-sumi">{money(item.unitPrice)}</span></p>
            <ProductPublicationDetails publication={item.publication} />
            <label className="mt-6 flex items-center justify-between gap-4"><span className="text-sm">{item.maxQuantity === 0 ? "在庫なし" : qty > 0 ? `${qty}点を選択中` : "数量"}</span><select aria-label={`${item.name} ${item.unit}の数量`} disabled={busy || item.maxQuantity === 0 && qty === 0} value={qty} onChange={event => quantity(item.skuId, Number(event.target.value))} className={purchaseUi.select}>{Array.from({ length: Math.max(item.maxQuantity, qty) + 1 }, (_, i) => <option key={i} value={i} disabled={i > item.maxQuantity}>{i}{i > item.maxQuantity ? "（現在の在庫以上）" : ""}</option>)}</select></label>
            </div>
          </li>;
        })}</ul>
        <UnlistedCartItems lines={unlistedCartLines(session.cart, catalog.items.map(item => item.skuId), catalogLabels)} busy={busy} onRemove={skuId => quantity(skuId, 0)} />
        {catalog.nextOffset !== null ? <button className={`${purchaseUi.secondary} mt-4`} disabled={busy || catalogStale} onClick={() => { void run(async () => { const result = await post("catalog", { offset: catalog.nextOffset }); if (!result.ok) throw new Error("CATALOG_UNAVAILABLE"); const next = catalogSchema.parse(result.body); rememberCatalog(next); setCatalog({ ...next, items: [...catalog.items, ...next.items.filter(i => !catalog.items.some(old => old.skuId === i.skuId))] }); }); }}>ほかの商品を表示</button> : null}
        <button className={`${purchaseUi.link} mt-6`} disabled={busy} onClick={() => { void run(() => refreshCatalog("商品と数量を確認し、合計を確認し直してください。")); }}>商品一覧を更新</button>
      </section>
      <section id="purchase-summary" tabIndex={-1} className="scroll-mt-8 border-t border-usuzumi bg-tsuchikabe/50 px-5 py-10 sm:px-8 sm:py-14 focus-visible:outline-2 focus-visible:outline-karekusa" aria-label="送料と合計">
        <p aria-hidden="true" className={purchaseUi.step}>02 / ORDER</p>
        <h2 className={purchaseUi.heading}>送料と合計を確認</h2>
        <p className="my-6 text-sm text-haicha">選択中：{selected}点</p>
        <button className={purchaseUi.secondary} disabled={busy || catalogStale || !selected} onClick={() => { void run(preview); }}>送料を含む合計を確認</button>
        {quotation ? <div className="mt-10 space-y-6">
          <ul className="divide-y divide-usuzumi/60">{quotation.items.map(item => <li key={item.skuId} className="break-words py-4 first:pt-0">
            <p>{item.name} {item.unit} × {item.quantity}</p>
            <p className="mt-1 text-sm text-haicha">{money(item.unitPrice * item.quantity)}</p>
          </li>)}</ul>
          <dl className="border-y border-usuzumi py-6">
            <div className="flex items-baseline justify-between gap-4 text-sm"><dt>送料</dt><dd>{money(quotation.shipping)}</dd></div>
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4"><dt>合計</dt><dd className={purchaseUi.statusTitle}>{money(quotation.total)}</dd></div>
          </dl>
          <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className={purchaseUi.checkbox} /><span>商品・数量と、送料を含む合計を確認しました</span></label>
          <button className={button} disabled={busy || catalogStale || !confirmed || !catalog.acceptingOrders} onClick={() => { void run(begin); }}>この金額で決済画面へ</button>
          <p className="text-sm leading-loose text-haicha">次はStripeでカード情報を入力します。まだ支払いは完了しません。</p>
          <p className="text-xs leading-loose text-haicha">注文の確認情報はこのタブに保存します。お支払いと結果の確認が終わるまで、タブを閉じずにお進みください。</p>
        </div> : null}
      </section>
      </div>
    </> : null}
    {session?.history.length ? <section className={card}><h2 className={purchaseUi.heading}>このタブで確認した注文</h2>{session.history.map(h => <button disabled={busy} key={h.orderReference} className="my-2 min-h-12 w-full break-all text-left underline" onClick={() => { try { save({ ...session, viewKey: h.purchaseKey }); location.assign("/shop/success"); } catch { setNotice("確認情報を保存できませんでした。"); } }}>注文 {h.orderReference} を確認</button>)}</section> : null}
    {session?.attempt ? <p className="text-sm leading-relaxed">このタブを閉じると確認情報を失う場合があります。わからない場合は買い直さず、店舗へお問い合わせください。</p> : null}<Link href={shopRoot ? "/" : "/shop"} className="inline-flex min-h-12 items-center underline">{shopRoot ? "三十日珈琲のホームへ戻る" : "ショップの案内へ戻る"}</Link>
  </div></main>;
}
