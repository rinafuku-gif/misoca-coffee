"use client";

import { PurchaseBrandBar, purchaseUi } from "./PurchaseBrand";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { buyerProductPublicationSchema } from "../product-publication-view";
import { BEAN_DISPLAY_PATH, beanDisplayResponseSchema, groupCatalogItems, joinCatalogWithDisplay, type BeanDisplay } from "../bean-display";
import { cartSubtotal, drawerLines, quantityAfterAdd } from "../bean-cart";
import { BeanCard, type BeanItem } from "./BeanCard";
import { BeanDetailModal } from "./BeanDetailModal";
import { CartButton, CartDrawer } from "./CartDrawer";
import { CheckoutTerms, MethodPicker, PaymentPendingBanner } from "./CheckoutParts";
import { FreshnessStrip, NewArrivalBanner } from "./shop-catalog-parts";
import { purchaserStatusSchema } from "../purchaser-status";
import { PurchaseLegalLinks } from "./PurchaseTerms";
import { UnlistedCartItems } from "./UnlistedCartItems";
import { recoverRejectedCheckout, unlistedCartLines, shippingFailureNotice } from "../purchase-recovery";
import { allowedCheckoutLocation, applyCheckoutCancellation, markCheckoutCancellation, purchaseKeyForStatus, readPurchaseSession, reconcilePurchasedCart, withDeliveryMethod, writePurchaseSession, type PurchaseAttempt, type PurchaseSession } from "../purchase-session";
import { catalogDeliveryMethodsSchema, checkoutRequestBody, quoteRequestBody, receivingCopy, requestedMethod, selectableMethods, shippingFeeLabel, type DeliveryMethod } from "../receiving-method";
import { catalogReceptionSchema, receptionPauseNotice } from "../reception-notice";
import { checkoutCopy } from "../checkout-copy";
import { checkoutFormWire, emptyCheckoutForm, localDeliveryAllowed, readCheckoutFormDraft, validateCheckoutForm, writeCheckoutFormDraft, type CheckoutFormDraft, type FormField } from "../checkout-form";
import { CheckoutFormFields, fieldId } from "./CheckoutForm";
import { isAttemptConflict, isCheckoutRefused, isFormRefused, readRestartOutcome } from "../checkout-outcome";
import { usePageStartsAtTop } from "./use-page-top";

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
  return error instanceof Error && error.message === "PURCHASE_BUSY" ? checkoutCopy.busy : fallback;
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
  const [busy, setBusy] = useState(true); const inFlight = useRef(false);
  const alive = useRef(true);
  const cancellationIntents = useRef(new Set<string>());
  const [catalogLabels, setCatalogLabels] = useState(new Map<string, string>());
  const [physicalSkus, setPhysicalSkus] = useState(new Set<string>());
  const [catalogStale, setCatalogStale] = useState(false);
  const [notice, setNotice] = useState(""); const [fatal, setFatal] = useState(false);
  // 「お支払い画面を開けませんでした」: kept apart from `notice` so the total that is
  // asked for right after does not wipe it; cleared on the next press.
  const [refused, setRefused] = useState(false);
  // The purchase form. Errors show under a field once it was left, or for every
  // field after 「お支払いへ進む」 was pressed with something missing.
  const [form, setForm] = useState<CheckoutFormDraft>(emptyCheckoutForm);
  const [touched, setTouched] = useState(new Set<FormField>()); const [submitted, setSubmitted] = useState(false);
  // The server refused the form (400): one short line next to the pay button.
  const [formRefused, setFormRefused] = useState(false);
  // 409 ATTEMPT_CONFLICT is answered once per press (no loops).
  const conflictHandled = useRef(false);
  // Presentation only: Notion display rows, photo failures, the open detail and
  // the cart panel. None of it is sent with a quote or a checkout.
  const [displays, setDisplays] = useState<BeanDisplay[]>([]);
  const [failedImages, setFailedImages] = useState(new Set<string>());
  const [detailSku, setDetailSku] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<"cart" | "checkout">("cart");
  const [added, setAdded] = useState<string | null>(null); const addedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // The total is asked for once per (cart, method) while the checkout section is
  // open. A failed quote is not repeated by itself (no request loops).
  const lastQuoteKey = useRef("");
  const settledChecked = useRef(false);
  usePageStartsAtTop();
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
        if (live) { rememberCatalog(loaded); setSession(saved); setCatalog(loaded); setForm(readCheckoutFormDraft(sessionStorage)); }
      } catch (error) {
        if (live) { setFatal(true); setNotice(purchaseNotice(error, checkoutCopy.loadFailed)); }
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
    try { await action(); } catch (error) { if (alive.current) setNotice(purchaseNotice(error, checkoutCopy.network)); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  async function refreshCatalog(message: string) {
    setQuotation(null); setCatalogStale(true); setNotice(message);
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
      save({ ...session, cart }); setQuotation(null); setNotice("");
      return true;
    } catch { setNotice("カートを保存できません。内容を保持できるまで決済は始めません。"); return false; }
  }
  function chooseMethod(next: DeliveryMethod) {
    if (!session || session.attempt || busy || !methodChoices.includes(next) || next === method) return;
    try {
      save(withDeliveryMethod(session, next === "shipping" ? undefined : next)); setQuotation(null); setNotice("");
    } catch { setNotice(receivingCopy.saveFailed); }
  }
  async function preview() {
    if (!session?.cart.length || catalogStale) return;
    setQuotation(null);
    const result = await send("quote", quoteRequestBody(session.cart, method));
    if (!result.ok) {
      const shippingNotice = shippingFailureNotice(result.body);
      if (shippingNotice) { setNotice(shippingNotice); return; }
      await refreshCatalog(checkoutCopy.quoteFailed); return;
    }
    setQuotation(quotationSchema.parse(result.body)); setQuotedMethod(method); setNotice("");
  }
  // isNewPurchase: true only when called from begin() with a purchaseKey it just
  // generated in this tab (G-4). 「お支払いに戻る」 calls this with its existing
  // attempt and leaves it false; a prior attempt with that key may already have
  // created an order, so SALES_PAUSED is never read as "no order" there.
  async function checkout(attempt: PurchaseAttempt, isNewPurchase = false) {
    const current = readPurchaseSession(sessionStorage);
    save({ ...current, viewKey: attempt.purchaseKey });
    const result = await send("checkout", checkoutRequestBody(attempt));
    const latest = readPurchaseSession(sessionStorage);
    // 「やり直す」 was pressed meanwhile: never open a new payment page.
    if (latest.attempt?.purchaseKey !== attempt.purchaseKey || latest.attempt.cancelRequested || cancellationIntents.current.has(attempt.purchaseKey)) return;
    // Stripe refused the payment page and the server ended that order (409, or
    // the same key replayed: 200 with no page and payment closed). Clear the
    // attempt; the next 「お支払いへ進む」 starts a new one with a new key.
    if (isCheckoutRefused(result.ok, result.body)) { save({ ...latest, attempt: null, viewKey: null }); setRefused(true); openCheckout(); return; }
    // The form broke a rule: nothing was accepted, so no banner; fix and press again.
    if (isFormRefused(result.ok, result.body)) { save({ ...latest, attempt: null, viewKey: null }); setFormRefused(true); setSubmitted(true); openCheckout(); return; }
    // Same key, different input: end the old checkout and continue with a new key.
    if (isAttemptConflict(result.ok, result.body)) { await replaceAttempt(attempt); return; }
    if (!result.ok) {
      const recovered = recoverRejectedCheckout(latest, attempt.purchaseKey, result.body, { isNewPurchase });
      if (recovered) { save(recovered.session); await refreshCatalog(recovered.notice); return; }
      // Unknown outcome: keep the attempt. The banner offers お支払いに戻る / やり直す.
      showPending(); return;
    }
    purchaserStatusSchema.parse(result.body.status);
    if (result.body.checkoutUrl === null) { window.location.assign("/shop/success"); return; }
    if (typeof result.body.checkoutUrl !== "string" || !allowedCheckoutLocation(result.body.checkoutUrl, location.origin)) throw new Error("CHECKOUT_DESTINATION_INVALID");
    window.location.assign(result.body.checkoutUrl);
  }
  function newPurchaseKey() {
    const bytes = crypto.getRandomValues(new Uint8Array(32)); return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  }
  /** Shows the form's problems (all fields) and moves to the first one. */
  function formProblems(target: DeliveryMethod) {
    const invalid = Object.keys(validateCheckoutForm(form, target)) as FormField[];
    if (invalid.length) { setSubmitted(true); requestAnimationFrame(() => document.getElementById(fieldId(invalid[0]))?.focus()); }
    return invalid.length > 0;
  }
  async function begin() {
    if (!session || session.attempt || !currentQuotation || catalogStale || !catalog?.acceptingOrders) return;
    setRefused(false); setFormRefused(false); conflictHandled.current = false;
    if (formProblems(method)) return;
    const purchaseKey = newPurchaseKey();
    const attempt: PurchaseAttempt = { purchaseKey, lines: session.cart, acceptedQuote: currentQuotation.acceptedQuote, ...(method === "shipping" ? {} : { deliveryMethod: method }), form: checkoutFormWire(form, method) };
    // Save the exact attempt atomically BEFORE an external outcome can become unknown.
    save({ ...session, attempt, viewKey: purchaseKey }); await checkout(attempt, true);
  }
  /** 409 ATTEMPT_CONFLICT: end the previous checkout (one cancel request), then
   * the same lines, quote and method with the current form under a NEW key. */
  async function replaceAttempt(previous: PurchaseAttempt) {
    if (conflictHandled.current) { showPending(); return; }
    conflictHandled.current = true;
    const outcome = await endAttempt(previous.purchaseKey);
    if (outcome !== "ended") return;
    const target = previous.deliveryMethod ?? "shipping";
    if (formProblems(target)) { openCheckout(); return; }
    const purchaseKey = newPurchaseKey(), current = readPurchaseSession(sessionStorage);
    const attempt: PurchaseAttempt = { purchaseKey, lines: previous.lines, acceptedQuote: previous.acceptedQuote, ...(previous.deliveryMethod ? { deliveryMethod: previous.deliveryMethod } : {}), form: checkoutFormWire(form, target) };
    save({ ...current, attempt, viewKey: purchaseKey }); await checkout(attempt, true);
  }
  // 「やり直す」: ONE cancel request for the previous checkout (never resent by
  // itself). Ended → straight back to the checkout section, cart kept.
  async function restart() {
    if (!session?.attempt) return;
    if (await endAttempt(session.attempt.purchaseKey) === "ended") { setQuotation(null); openCheckout(); }
  }
  /** ONE cancel request for a previous checkout. ended → the attempt is cleared
   * (cart kept); toStatus → the status page; retry → one line on the banner. */
  async function endAttempt(key: string): Promise<"ended" | "toStatus" | "retry"> {
    cancellationIntents.current.add(key);
    setSession(markCheckoutCancellation(sessionStorage, key));
    const result = await send("cancel", { purchaseKey: key, confirmed: true });
    const outcome = readRestartOutcome(result.ok, result.body);
    if (outcome.kind === "toStatus") { save({ ...readPurchaseSession(sessionStorage), viewKey: key }); location.assign("/shop/success"); return "toStatus"; }
    if (outcome.kind === "ended") {
      const next = applyCheckoutCancellation(sessionStorage, key, outcome.result);
      if (!next.attempt) { cancellationIntents.current.delete(key); setSession(next); return "ended"; }
    }
    setNotice(checkoutCopy.restartRetry); showPending(); return "retry";
  }
  async function anotherOrder() {
    if (!session?.attempt) return;
    const result = await send("status", { purchaseKey: session.attempt.purchaseKey });
    if (cancellationIntents.current.has(session.attempt.purchaseKey)) return;
    if (!result.ok) throw new Error("STATUS_UNAVAILABLE");
    const status = purchaserStatusSchema.parse(result.body.status);
    if (status.payment !== "confirmed") return;
    const updated = reconcilePurchasedCart(sessionStorage, session.attempt.purchaseKey, status);
    const history = updated.history.some(h => h.orderReference === status.orderReference) ? updated.history : [...updated.history, { purchaseKey: session.attempt.purchaseKey, orderReference: status.orderReference }];
    // A new order starts from shipping again; the finished order keeps its own method on the server.
    save({ ...withDeliveryMethod(updated, undefined), attempt: null, history }); setQuotation(null);
  }
  /** Opens the cart panel on the checkout section; its total is asked for right away. */
  function openCheckout() { lastQuoteKey.current = ""; setDetailSku(null); setDrawerStep("checkout"); setCartOpen(true); }
  /** An unfinished checkout: close the panel and start the page at the banner. */
  function showPending() {
    setCartOpen(false); setDrawerStep("cart");
    requestAnimationFrame(() => { const target = document.getElementById("payment-pending"); target?.scrollIntoView({ block: "start", behavior: "instant" }); target?.focus({ preventScroll: true }); });
  }
  // A paid order kept in this tab (back from the status page): read its status
  // once (a read, not an order) and start a fresh cart. No button to press.
  const finishSettled = useEffectEvent(() => { void run(anotherOrder); });
  const settled = Boolean(session?.attempt?.settledOrderId);
  useEffect(() => {
    if (!settled || busy || settledChecked.current) return;
    settledChecked.current = true; finishSettled();
  }, [settled, busy]);
  const selected = session?.cart.reduce((sum, l) => sum + l.quantity, 0) ?? 0;
  const quoteKey = session && !session.attempt && session.cart.length ? `${JSON.stringify(session.cart)}|${method}` : "";
  const requestQuote = useEffectEvent(() => { void run(preview); });
  useEffect(() => {
    if (!cartOpen || drawerStep !== "checkout" || !quoteKey || busy || catalogStale || currentQuotation || lastQuoteKey.current === quoteKey) return;
    lastQuoteKey.current = quoteKey; requestQuote();
  }, [cartOpen, drawerStep, quoteKey, busy, catalogStale, currentQuotation]);
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
  const lines = catalog && session ? drawerLines(session.cart, catalog.items, catalogLabels) : [];
  function changeForm(update: (current: CheckoutFormDraft) => CheckoutFormDraft) {
    setFormRefused(false);
    setForm(previous => { const next = update(previous); writeCheckoutFormDraft(sessionStorage, next); return next; });
  }
  const allErrors = validateCheckoutForm(form, method);
  const shownErrors = Object.fromEntries(Object.entries(allErrors).filter(([field]) => submitted || touched.has(field as FormField)));
  // 上野原市内お届け needs a complete Uenohara postcode; told at once while typing.
  const unavailableMethods = localDeliveryAllowed(form.postalCode) === false ? ["local_delivery" as const] : [];
  const pending = Boolean(session?.attempt && !session.attempt.settledOrderId);
  const shell = "mx-auto max-w-3xl px-6 md:px-8";
  const noticeBlock = notice ? <div role="alert" className={`${purchaseUi.notice} mb-6`}><p>{notice}</p>{notice.includes("配送条件") || notice.includes("発送できる数量") ? <a href="/contact" className={`mt-2 ${purchaseUi.link}`}>配送について相談する</a> : null}</div> : null;
  const banner = pending && session?.attempt ? <div className={`${shell} ${shopRoot ? "pt-12" : "pt-2"} pb-2`}>
    <PaymentPendingBanner canResume={!session.attempt.cancelRequested} resumeDisabled={!catalog?.acceptingOrders} busy={busy} line={notice}
      onResume={() => { void run(() => checkout(session.attempt!)); }} onRestart={() => { void run(restart); }} />
  </div> : null;
  const checkoutBody = currentQuotation ? currentQuotation.items : null;
  return <main className="min-h-screen bg-kominka-white pb-28 text-sumi">
    {!shopRoot ? <div className="px-5 pt-8 sm:px-8"><div className="mx-auto max-w-6xl"><PurchaseBrandBar /></div></div> : null}
    {!shopRoot ? banner : null}
    <PageHero title="ONLINE SHOP" subtitle="焙煎したてをお届け" image="/images/experience/coffee-beans-close.jpg" compact={!shopRoot} />
    {shopRoot ? <NewArrivalBanner /> : null}
    <FreshnessStrip />
    {shopRoot ? banner : null}

    {!catalog || fatal ? <div className={`${shell} py-16 md:py-24`}>
      {busy && !catalog ? <p role="status" className="text-center text-sm text-haicha">確認しています…</p> : null}
      {fatal ? <div className="text-center"><p role="alert" className="text-sm text-haicha">{notice}</p><button className={`mt-6 ${purchaseUi.primary}`} onClick={() => location.reload()}>読み直す</button><p className="mt-2"><a href="/shop/success" className={purchaseUi.link}>以前の注文状況を確認</a></p></div> : null}
    </div> : null}

    {catalog && session ? <>
      <section id="bean-lineup" className="py-24 md:py-36 overflow-hidden scroll-mt-20" aria-label="商品と数量">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          {!pending && !cartOpen ? <div className="mx-auto max-w-3xl">{noticeBlock}</div> : null}
          {!catalog.acceptingOrders ? <p className={`${purchaseUi.notice} mb-10`}>{receptionPauseNotice(catalog.reception) ?? "現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。"}</p> : null}
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
            {catalogStale ? <button className={purchaseUi.link} disabled={busy} onClick={() => { void run(() => refreshCatalog("")); }}>商品一覧を更新</button> : null}
          </div>
        </div>
      </section>

      <BeanDetailModal item={detail} quantity={detail ? qtyOf(detail.skuId) : 0} blocked={blocked} added={detail ? added === detail.skuId : false}
        imageFailed={detail ? failedImages.has(detail.skuId) : false} onImageError={() => { if (detail) failImage(detail.skuId); }}
        onAdd={() => { if (detail) { addOne(detail); setDetailSku(null); } }} onClose={() => setDetailSku(null)} />
      <CartButton count={selected} onOpen={() => { setDrawerStep("cart"); setCartOpen(true); }} />
      <CartDrawer open={cartOpen} step={drawerStep} lines={lines} count={selected} subtotal={cartSubtotal(lines)} busy={busy} locked={Boolean(session.attempt)} stale={catalogStale}
        images={new Map(beans.flatMap(item => item.display?.image ? [[item.skuId, item.display.image] as const] : []))} failedImages={failedImages} onImageError={failImage}
        onChange={(skuId, value) => { quantity(skuId, value); }} onClose={() => { setCartOpen(false); setDrawerStep("cart"); }}
        onCheckout={openCheckout} onBack={() => setDrawerStep("cart")}
        checkout={<div className="space-y-6">
          {refused ? <p role="alert" className={purchaseUi.notice}>{checkoutCopy.refused}</p> : null}
          {noticeBlock}
          {catalogStale ? <button className={purchaseUi.link} disabled={busy} onClick={() => { void run(() => refreshCatalog("")); }}>商品一覧を更新</button> : null}
          <ul aria-label="ご注文の商品" className="divide-y divide-usuzumi/60 border-y border-usuzumi">{(checkoutBody ?? lines.flatMap(line => line.item ? [{ skuId: line.skuId, name: line.item.name, unit: line.item.unit, unitPrice: line.item.unitPrice, quantity: line.quantity }] : [])).map(item => <li key={item.skuId} className="flex items-baseline justify-between gap-4 py-3 text-sm">
            <span className="min-w-0 break-words">{item.name} <span className="text-haicha">{item.unit} × {item.quantity}</span></span>
            <span className="shrink-0">{money(item.unitPrice * item.quantity)}</span>
          </li>)}</ul>
          <MethodPicker methods={methodChoices} value={method} disabled={busy} unavailable={unavailableMethods} onChange={chooseMethod} />
          {currentQuotation ? <div id="purchase-quote" aria-live="polite">
            <dl className="space-y-2">
              <div className="flex items-baseline justify-between gap-4 text-sm"><dt>{shippingFeeLabel(quotedMethod)}</dt><dd>{money(currentQuotation.shipping)}</dd></div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 text-sm"><dt>合計</dt><dd className={purchaseUi.statusTitle}>{money(currentQuotation.total)}</dd></div>
            </dl>
          </div> : busy ? <p role="status" className="text-sm text-haicha">確認しています…</p> : <button type="button" className={purchaseUi.link} disabled={busy || catalogStale} onClick={() => { void run(preview); }}>{checkoutCopy.quoteRetry}</button>}
          <CheckoutFormFields form={form} method={method} errors={shownErrors} disabled={busy} onChange={changeForm} onBlur={field => setTouched(previous => new Set(previous).add(field))} />
          <CheckoutTerms method={currentQuotation ? quotedMethod : method} />
        </div>}
        checkoutFooter={<>
          {!catalog.acceptingOrders ? <p className="text-sm text-sumi">{receptionPauseNotice(catalog.reception) ?? "現在は注文を受け付けていません。"}</p> : null}
          {formRefused ? <p role="alert" className="text-sm text-sumi">{checkoutCopy.formRefused}</p> : null}
          {currentQuotation ? <p className="flex items-baseline justify-between gap-4 text-sm"><span className="text-haicha">合計</span><span className="font-serif text-xl text-konsumi">{money(currentQuotation.total)}</span></p> : null}
          <button className={`${button} w-full`} disabled={busy || catalogStale || !currentQuotation || !catalog.acceptingOrders || Boolean(session.attempt)} onClick={() => { void run(begin); }}>{checkoutCopy.pay}</button>
        </>} />
    </> : null}

    <div className={shell}>
      <div className="mt-6">{shopRoot ? <Link href="/" className={purchaseUi.link}>三十日珈琲のホームへ戻る</Link> : <a href="/shop" className={purchaseUi.link}>ショップの案内へ戻る</a>}</div>
      <PurchaseLegalLinks />
    </div>
  </main>;
}
