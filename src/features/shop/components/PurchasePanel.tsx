"use client";

import { PurchaseBrandBar, PurchaseBrandHeader, purchaseUi } from "./PurchaseBrand";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { buyerProductPublicationSchema } from "../product-publication-view";
import { BEAN_DISPLAY_PATH, beanDisplayResponseSchema, groupCatalogItems, joinCatalogWithDisplay, type BeanDisplay } from "../bean-display";
import { drawerLines, quantityAfterAdd } from "../bean-cart";
import { BeanCard, type BeanItem } from "./BeanCard";
import { BeanDetailModal } from "./BeanDetailModal";
import { CartButton, CartDrawer } from "./CartDrawer";
import { FreshnessStrip, NewArrivalBanner } from "./shop-catalog-parts";
import { purchaserStatusSchema, cancellationCopy } from "../purchaser-status";
import { CheckoutCancellationPanel } from "./CheckoutCancellationPanel";
import { PurchaseConditions, PurchaseLegalLinks, ReceivingMethodChoice } from "./PurchaseTerms";
import { UnlistedCartItems } from "./UnlistedCartItems";
import { recoverRejectedCheckout, unlistedCartLines, shippingFailureNotice } from "../purchase-recovery";
import { allowedCheckoutLocation, purchaseKeyForStatus, readPurchaseSession, reconcilePurchasedCart, withDeliveryMethod, writePurchaseSession, type PurchaseAttempt, type PurchaseSession } from "../purchase-session";
import { catalogDeliveryMethodsSchema, checkoutRequestBody, quoteRequestBody, receivingCopy, requestedMethod, selectableMethods, shippingFeeLabel, type DeliveryMethod } from "../receiving-method";
import { catalogReceptionSchema, receptionPauseNotice } from "../reception-notice";

const product = z.object({ skuId: z.string(), name: z.string(), unit: z.string(), unitPrice: z.number().int().nonnegative(), kind: z.enum(["physical", "gift"]), maxQuantity: z.number().int().min(0).max(20), publication: buyerProductPublicationSchema.optional() }).strict();
// deliveryMethods: present only when the management side offers receiving methods. Absent, or not in the agreed
// shape = shipping only, as before (it never fails the catalog). reception: present only when the reception
// switch is open AND the site asked for it. Absent, or not in the agreed shape, keeps the fixed sentence (G-4).
// Neither ever fails the catalog itself. Every other field is checked as strictly as before.
export const catalogSchema = z.object({ items: z.array(product).max(50), nextOffset: z.number().int().nonnegative().nullable(), acceptingOrders: z.boolean(), deliveryMethods: catalogDeliveryMethodsSchema, reception: catalogReceptionSchema }).strict();
const quotationSchema = z.object({ items: z.array(product.omit({ maxQuantity: true }).extend({ quantity: z.number().int().min(1).max(20) })).max(20), total: z.number().int().nonnegative(), shipping: z.number().int().nonnegative(), acceptedQuote: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
type Catalog = z.infer<typeof catalogSchema>; type Quotation = z.infer<typeof quotationSchema>;
const money = (value: number) => `¥${value.toLocaleString("ja-JP")}`;
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
  const [quotedMethod, setQuotedMethod] = useState<DeliveryMethod>("shipping");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(true); const inFlight = useRef(false);
  const alive = useRef(true);
  const cancellationIntents = useRef(new Set<string>());
  const [catalogLabels, setCatalogLabels] = useState(new Map<string, string>());
  const [physicalSkus, setPhysicalSkus] = useState(new Set<string>());
  const [catalogStale, setCatalogStale] = useState(false);
  const [notice, setNotice] = useState(""); const [fatal, setFatal] = useState(false);
  // Presentation only: Notion display rows, photo failures, the open detail and
  // the cart drawer. None of it is sent with a quote or a checkout.
  const [displays, setDisplays] = useState<BeanDisplay[]>([]);
  const [failedImages, setFailedImages] = useState(new Set<string>());
  const [detailSku, setDetailSku] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null); const addedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // After the cart's 「送料を含む合計を確認」: once that request has finished, move
  // focus (and the view) to the quoted total, or to the section with its notice.
  const revealQuote = useRef(false);
  useEffect(() => {
    // Optional display data. A failure only means cards without photos; it never
    // blocks, hides or changes what the catalog sells.
    let live = true; const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
    void (async () => {
      try {
        const response = await fetch(BEAN_DISPLAY_PATH, { credentials: "omit", signal: controller.signal });
        if (!response.ok) { await response.body?.cancel(); return; }
        const parsed = beanDisplayResponseSchema.safeParse(await response.json());
        if (live && parsed.success) setDisplays(parsed.data.items);
      } catch { /* Keep the cards without display data. */ } finally { clearTimeout(timer); }
    })();
    return () => { live = false; clearTimeout(timer); controller.abort(); clearTimeout(addedTimer.current); };
  }, []);
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
    setPhysicalSkus(previous => { const skus = new Set(previous); for (const item of next.items) { if (item.kind === "physical") skus.add(item.skuId); else skus.delete(item.skuId); } return skus; });
  }
  // Receiving method: offered by the catalog answer, chosen only while a shipped
  // product is in the cart. `method` is what the next quote asks for; a quote
  // taken for another method is never shown or paid (`currentQuotation`).
  const methodChoices = session && catalog ? selectableMethods(catalog.deliveryMethods, session.cart.some(line => physicalSkus.has(line.skuId))) : [];
  const method = requestedMethod(session?.deliveryMethod, methodChoices);
  const currentQuotation = quotation && quotedMethod === method ? quotation : null;
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
  function quantity(skuId: string, value: number): boolean {
    if (!session || session.attempt || busy) return false;
    if (value > 0 && !session.cart.some(l => l.skuId === skuId) && session.cart.length >= 20) { setNotice("一度に選べる商品は20種類までです。先に選んだ商品の数量を0にすると外せます。"); return false; }
    try {
      const cart = session.cart.filter(l => l.skuId !== skuId); if (value > 0) cart.push({ skuId, quantity: value });
      save({ ...session, cart }); setQuotation(null); setConfirmed(false); setNotice("");
      return true;
    } catch { setNotice("カートを保存できません。内容を保持できるまで決済は始めません。"); return false; }
  }
  function chooseMethod(next: DeliveryMethod) {
    if (!session || session.attempt || busy || !methodChoices.includes(next) || next === method) return;
    try {
      save(withDeliveryMethod(session, next === "shipping" ? undefined : next)); setQuotation(null); setConfirmed(false); setNotice("");
    } catch { setNotice(receivingCopy.saveFailed); }
  }
  async function preview() {
    if (!session?.cart.length || catalogStale) return;
    setQuotation(null); setConfirmed(false);
    const result = await send("quote", quoteRequestBody(session.cart, method));
    if (!result.ok) {
      const shippingNotice = shippingFailureNotice(result.body);
      if (shippingNotice) { setNotice(shippingNotice); return; }
      await refreshCatalog("合計を確認できませんでした。商品と数量を見直してください。この操作では注文・請求は始まりません。"); return;
    }
    setQuotation(quotationSchema.parse(result.body)); setQuotedMethod(method); setConfirmed(false); setNotice("");
  }
  // isNewPurchase: true only when called from begin() with a purchaseKey it just
  // generated in this tab (G-4). The "同じ注文の決済へ戻る" button below calls this
  // with its existing attempt and leaves it false; a prior attempt with that key may
  // already have created an order, so SALES_PAUSED is never read as "no order" there.
  async function checkout(attempt: PurchaseAttempt, isNewPurchase = false) {
    const current = readPurchaseSession(sessionStorage);
    save({ ...current, viewKey: attempt.purchaseKey });
    const result = await send("checkout", checkoutRequestBody(attempt));
    const latest = readPurchaseSession(sessionStorage);
    if (latest.attempt?.purchaseKey !== attempt.purchaseKey || latest.attempt.cancelRequested || cancellationIntents.current.has(attempt.purchaseKey)) { setNotice("決済中止の確認を続けています。新しい決済画面へは進みません。"); return; }
    if (!result.ok) {
      const recovered = recoverRejectedCheckout(latest, attempt.purchaseKey, result.body, { isNewPurchase });
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
    if (!session || session.attempt || !currentQuotation || !confirmed || catalogStale || !catalog?.acceptingOrders) return;
    const bytes = crypto.getRandomValues(new Uint8Array(32)); const purchaseKey = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    const attempt: PurchaseAttempt = { purchaseKey, lines: session.cart, acceptedQuote: currentQuotation.acceptedQuote, ...(method === "shipping" ? {} : { deliveryMethod: method }) };
    // Save the exact attempt atomically BEFORE an external outcome can become unknown.
    save({ ...session, attempt, viewKey: purchaseKey }); await checkout(attempt, true);
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
    // A new order starts from shipping again; the finished order keeps its own method on the server.
    save({ ...withDeliveryMethod(updated, undefined), attempt: null, history }); setQuotation(null); setConfirmed(false);
  }
  useEffect(() => {
    if (!revealQuote.current || busy) return;
    revealQuote.current = false;
    const target = document.getElementById(currentQuotation ? "purchase-quote" : "purchase-summary");
    target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: "start" });
  }, [busy, currentQuotation]);
  const selected = session?.cart.reduce((sum, l) => sum + l.quantity, 0) ?? 0;
  // Presentation of the selection. Every catalog item is shown (with or without
  // display data); adding goes through quantity(), the same path as before.
  const beans: BeanItem[] = catalog ? joinCatalogWithDisplay(catalog.items, displays) : [];
  const detail = beans.find(item => item.skuId === detailSku) ?? null;
  const blocked = busy || Boolean(session?.attempt);
  const qtyOf = (skuId: string) => session?.cart.find(l => l.skuId === skuId)?.quantity ?? 0;
  const failImage = (skuId: string) => setFailedImages(previous => new Set(previous).add(skuId));
  function addOne(item: BeanItem) {
    const next = quantityAfterAdd(item, qtyOf(item.skuId));
    if (next === null || !quantity(item.skuId, next)) return;
    setAdded(item.skuId); clearTimeout(addedTimer.current); addedTimer.current = setTimeout(() => setAdded(null), 1200);
  }
  function quoteFromCart() {
    setCartOpen(false); revealQuote.current = true;
    void run(preview);
  }
  const shopping = Boolean(catalog && session && !session.attempt);
  const intro = !session?.attempt;
  const shell = "mx-auto max-w-3xl px-6 md:px-8";
  const noticeBlock = notice ? <div role="alert" className={`${purchaseUi.notice} mb-8`}><p>{notice}</p>{notice.includes("配送条件") || notice.includes("発送できる数量") ? <a href="/contact" className={`mt-3 ${purchaseUi.link}`}>配送について相談する</a> : null}</div> : null;
  const busyBlock = busy ? <p role="status" className="mb-6 text-sm text-haicha">確認しています…</p> : null;
  return <main className="min-h-screen bg-kominka-white pb-28 text-sumi">
    {!shopRoot ? <div className="px-5 pt-8 sm:px-8"><div className="mx-auto max-w-6xl"><PurchaseBrandBar /></div></div> : null}
    {intro ? <>
      <PageHero title="ONLINE SHOP" subtitle="焙煎したてをお届け" image="/images/experience/coffee-beans-close.jpg" compact={!shopRoot} />
      {shopRoot ? <NewArrivalBanner /> : null}
      <FreshnessStrip />
    </> : <div className={`${shell} ${shopRoot ? "pt-28 md:pt-32" : "pt-6"}`}><PurchaseBrandHeader title="珈琲を選ぶ" description="商品について読みながら、お好きな珈琲をお選びください。送料と合計は、お支払いの前に確認できます。" shopRoot /></div>}

    {!shopping ? <div className={`${shell} ${intro ? "py-16 md:py-24" : ""}`}>
      {busyBlock}{noticeBlock}
      {fatal ? <section className={purchaseUi.section}><button className={purchaseUi.primary} onClick={() => location.reload()}>読み直す</button><p className="mt-4"><a href="/shop/success" className={purchaseUi.link}>以前の注文状況を確認</a></p></section> : null}
      {session?.attempt ? <section className={purchaseUi.section}>
        <h2 className={purchaseUi.heading}>{session.attempt.cancelRequested ? "決済中止の確認を続けています" : session.attempt.settledOrderId ? "前の注文のお支払いを確認済みです" : "決済の準備を始めた記録があります"}</h2>
        <p className="mt-3 text-sm leading-relaxed">同じ内容の新しい注文は作らず、このタブに残した確認情報を使って状況を確認・再開します。</p>
        <button disabled={busy} className={`mt-4 ${purchaseUi.link} font-medium`} onClick={() => {
          try { save({ ...session, viewKey: session.attempt!.purchaseKey }); location.assign("/shop/success"); }
          catch { setNotice("確認情報を保存できませんでした。"); }
        }}>この注文の状況を確認</button>
        {!session.attempt.cancelRequested ? <div className="mt-4">{session.attempt.settledOrderId
          ? <button className={purchaseUi.primary} disabled={busy} onClick={() => { void run(anotherOrder); }}>新しく商品を選ぶ</button>
          : <button className={purchaseUi.primary} disabled={busy || !catalog?.acceptingOrders} onClick={() => { void run(() => checkout(session.attempt!)); }}>同じ注文の決済へ戻る</button>}</div> : null}
      </section> : null}
      {session?.attempt ? <CheckoutCancellationPanel purchaseKey={session.attempt.purchaseKey} payment={session.attempt.settledOrderId ? "confirmed" : undefined} pending={session.attempt.cancelRequested} onIntent={() => {
        const key = session.attempt!.purchaseKey; cancellationIntents.current.add(key);
        setSession(previous => previous?.attempt?.purchaseKey === key ? { ...previous, attempt: { ...previous.attempt, cancelRequested: true } } : previous);
      }} onSessionChange={setSession} onOutcome={outcome => {
        setQuotation(null); setConfirmed(false);
        setNotice(outcome.cancellation === "not_created" ? "注文は作られていませんでした。カートの内容を残しています。合計を確認し直してから購入できます。" : outcome.cancellation === "closed" && outcome.status.payment === "closed" ? cancellationCopy.closed : "");
      }} /> : null}
    </div> : null}

    {catalog && session && !session.attempt ? <>
      <section id="bean-lineup" className="py-24 md:py-36 overflow-hidden scroll-mt-20" aria-label="商品と数量">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <p className="mx-auto mb-16 max-w-2xl text-center text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide md:mb-24">商品について読みながら、お好きな珈琲をお選びください。送料と合計は、お支払いの前に確認できます。</p>
          </ScrollReveal>
          {!catalog.acceptingOrders ? <p className={`${purchaseUi.notice} mb-10`}>{receptionPauseNotice(catalog.reception) ?? "現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。"}</p> : null}
          {catalogStale ? <p className="mb-10 text-sm leading-loose text-haicha">現在は更新前の商品一覧です。更新できるまで決済には進めません。選択から外す操作はできます。</p> : null}
          {!beans.length ? <p className="py-16 text-center text-sm text-haicha">現在選べる商品はありません。</p> : <div className="space-y-24 md:space-y-32">
            {groupCatalogItems(beans).map(group => <section key={group.key} aria-labelledby={`product-group-${group.key}`}>
              <ScrollReveal>
                <div className="text-center mb-12 md:mb-16">
                  <div aria-hidden="true" className="w-8 h-px bg-gold/40 mx-auto mb-6" />
                  <h2 id={`product-group-${group.key}`} className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">{group.heading}</h2>
                </div>
              </ScrollReveal>
              <ul className="grid gap-14 sm:grid-cols-2 md:grid-cols-3 md:gap-x-10 md:gap-y-16">
                {group.items.map((item, i) => <li key={item.skuId}><ScrollReveal delay={(i % 3) * 0.1} className="h-full">
                  <BeanCard item={item} quantity={qtyOf(item.skuId)} blocked={blocked} added={added === item.skuId}
                    imageFailed={failedImages.has(item.skuId)} onImageError={() => failImage(item.skuId)}
                    onOpen={() => setDetailSku(item.skuId)} onAdd={() => addOne(item)} />
                </ScrollReveal></li>)}
              </ul>
            </section>)}
          </div>}
          <div className="mx-auto mt-16 max-w-3xl">
            <UnlistedCartItems lines={unlistedCartLines(session.cart, catalog.items.map(item => item.skuId), catalogLabels)} busy={busy} onRemove={skuId => quantity(skuId, 0)} />
          </div>
          <div className="mt-10 flex flex-col items-center gap-2">
            {catalog.nextOffset !== null ? <button className={purchaseUi.secondary} disabled={busy || catalogStale} onClick={() => { void run(async () => { const result = await post("catalog", { offset: catalog.nextOffset }); if (!result.ok) throw new Error("CATALOG_UNAVAILABLE"); const next = catalogSchema.parse(result.body); rememberCatalog(next); setCatalog({ ...next, items: [...catalog.items, ...next.items.filter(i => !catalog.items.some(old => old.skuId === i.skuId))] }); }); }}>ほかの商品を表示</button> : null}
            <button className={purchaseUi.link} disabled={busy} onClick={() => { void run(() => refreshCatalog("商品と数量を確認し、合計を確認し直してください。")); }}>商品一覧を更新</button>
          </div>
          <p className="text-center text-sm text-haicha mt-12">※ 豆の在庫状況により、取り扱い銘柄が変更になる場合があります。</p>
        </div>
      </section>

      <section id="purchase-summary" tabIndex={-1} className="scroll-mt-20 border-t border-usuzumi bg-tsuchikabe/50 py-24 md:py-32 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-karekusa" aria-label="送料と合計">
        <div className={shell}>
          <p aria-hidden="true" className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">Order</p>
          <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">送料と合計を確認</h2>
          <div className="my-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-sm text-haicha">選択中：{selected}点</p>
            {selected ? <button type="button" className={purchaseUi.link} onClick={() => setCartOpen(true)}>カート（{selected}点）</button> : <span className="text-xs text-haicha">選ぶだけでは注文されません</span>}
          </div>
          {busyBlock}{noticeBlock}
          <ReceivingMethodChoice methods={methodChoices} value={method} disabled={busy} onChange={chooseMethod} />
          <button className={purchaseUi.secondary} disabled={busy || catalogStale || !selected} onClick={() => { void run(preview); }}>送料を含む合計を確認</button>
          {currentQuotation ? <div id="purchase-quote" tabIndex={-1} aria-label="送料を含む合計" className="mt-10 scroll-mt-24 space-y-6 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-karekusa">
            <ul className="divide-y divide-usuzumi/60">{currentQuotation.items.map(item => <li key={item.skuId} className="break-words py-4 first:pt-0">
              <p className="font-serif text-base tracking-wide text-konsumi">{item.name} {item.unit} × {item.quantity}</p>
              <p className="mt-1 text-sm text-haicha">{money(item.unitPrice * item.quantity)}</p>
            </li>)}</ul>
            <dl className="border-y border-usuzumi py-6">
              <div className="flex items-baseline justify-between gap-4 text-sm"><dt>{shippingFeeLabel(quotedMethod)}</dt><dd>{money(currentQuotation.shipping)}</dd></div>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 text-sm"><dt>合計</dt><dd className={purchaseUi.statusTitle}>{money(currentQuotation.total)}</dd></div>
            </dl>
            <PurchaseConditions method={quotedMethod} />
            <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3 text-sm leading-relaxed"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className={purchaseUi.checkbox} /><span>商品・数量と、送料を含む合計を確認しました</span></label>
            <button className={button} disabled={busy || catalogStale || !confirmed || !catalog.acceptingOrders} onClick={() => { void run(begin); }}>この金額で決済画面へ</button>
            <p className="text-sm leading-loose text-haicha">次はStripeでカード情報を入力します。まだ支払いは完了しません。</p>
            <p className="text-xs leading-loose text-haicha">注文の確認情報はこのタブに保存します。お支払いと結果の確認が終わるまで、タブを閉じずにお進みください。</p>
          </div> : null}
        </div>
      </section>

      <BeanDetailModal item={detail} quantity={detail ? qtyOf(detail.skuId) : 0} blocked={blocked} added={detail ? added === detail.skuId : false}
        imageFailed={detail ? failedImages.has(detail.skuId) : false} onImageError={() => { if (detail) failImage(detail.skuId); }}
        onAdd={() => { if (detail) { addOne(detail); setDetailSku(null); } }} onClose={() => setDetailSku(null)} />
      <CartButton count={selected} onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} lines={drawerLines(session.cart, catalog.items, catalogLabels)} count={selected} busy={busy} locked={Boolean(session.attempt)} stale={catalogStale}
        images={new Map(beans.flatMap(item => item.display?.image ? [[item.skuId, item.display.image] as const] : []))} failedImages={failedImages} onImageError={failImage}
        onChange={(skuId, value) => { quantity(skuId, value); }} onClose={() => setCartOpen(false)} onQuote={quoteFromCart} />
    </> : null}

    <div className={shell}>
      {session?.history.length ? <section className={purchaseUi.section}><h2 className={purchaseUi.heading}>このタブで確認した注文</h2>{session.history.map(h => <button disabled={busy} key={h.orderReference} className={`my-2 w-full break-all text-left ${purchaseUi.link}`} onClick={() => { try { save({ ...session, viewKey: h.purchaseKey }); location.assign("/shop/success"); } catch { setNotice("確認情報を保存できませんでした。"); } }}>注文 {h.orderReference} を確認</button>)}</section> : null}
      {session?.attempt ? <p className="mt-6 text-sm leading-relaxed">このタブを閉じると確認情報を失う場合があります。わからない場合は買い直さず、店舗へお問い合わせください。</p> : null}
      <div className="mt-10">{shopRoot ? <Link href="/" className={purchaseUi.link}>三十日珈琲のホームへ戻る</Link> : <a href="/shop" className={purchaseUi.link}>ショップの案内へ戻る</a>}</div>
      <PurchaseLegalLinks />
    </div>
  </main>;
}
