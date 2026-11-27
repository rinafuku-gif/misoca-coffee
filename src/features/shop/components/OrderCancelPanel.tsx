"use client";

import { useEffect, useState } from "react";
import { PurchaseBrandBar, purchaseUi } from "./PurchaseBrand";
import { CANCEL_REQUEST_PATH, cancelCopy, cancelRequestBody, readCancelLink, readCancelRequestAnswer, type CancelRequestAction, type CancelView } from "../order-cancel";
import { usePageStartsAtTop } from "./use-page-top";

const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;
async function send(link: { orderReference: string; token: string }, action: CancelRequestAction) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(CANCEL_REQUEST_PATH, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", cache: "no-store", body: JSON.stringify(cancelRequestBody(link, action)), signal: controller.signal });
    let body: unknown = null; try { body = await response.json(); } catch { /* unreadable answer = try again */ }
    return { status: response.status, body };
  } catch { return { status: 0, body: null }; } finally { clearTimeout(timer); }
}

/** What the page shows for one state. Kept separate so each state can be checked. */
export function OrderCancelView({ view, busy, lastAction, onRecord, onRetry }: { view: CancelView; busy: boolean; lastAction: CancelRequestAction; onRecord(): void; onRetry(): void }) {
  const answer = view.kind === "answer" ? view.answer : view.kind === "retry" ? view.answer : undefined;
  const state = view.kind === "answer" ? view.answer.state : null;
  const title = state === "recorded" ? cancelCopy.recordedTitle : cancelCopy.title;
  const line = state === "recorded" ? cancelCopy.recorded : state === "requested" ? cancelCopy.requested : state === "shipped" || state === "closed" ? cancelCopy.refused
    : view.kind === "notAvailable" ? cancelCopy.notAvailable : view.kind === "retry" ? cancelCopy.retry : view.kind === "loading" ? cancelCopy.loading : "";
  return <>
    <div aria-hidden="true" className="mb-6 h-px w-10 bg-gold" />
    <h1 className="font-serif text-2xl font-light leading-relaxed tracking-wider text-konsumi sm:text-3xl">{title}</h1>
    {line ? <p role={view.kind === "loading" ? "status" : "alert"} className="mt-3 text-sm leading-relaxed text-sumi">{line}</p> : null}
    {answer ? <section aria-label="ご注文の内容" className="mt-8 border-t border-usuzumi pt-6">
      <p className="text-sm text-haicha">{cancelCopy.orderNumber}：<span className="break-all text-sumi">{answer.orderReference}</span></p>
      <ul className="mt-3 divide-y divide-usuzumi/60">{answer.items.map((item, i) => <li key={i} className="py-3 text-sm break-words">{item.name} <span className="text-haicha">{item.unit} × {item.quantity}</span></li>)}</ul>
      <p className="mt-2 flex items-baseline justify-between gap-4 border-t border-usuzumi pt-4 font-serif text-xl text-konsumi"><span>{cancelCopy.total}</span><span>{yen(answer.total)}</span></p>
    </section> : null}
    {state === "open" || view.kind === "retry" && lastAction === "record" && answer?.state === "open"
      ? <button type="button" className={`mt-8 ${purchaseUi.primary}`} disabled={busy} onClick={onRecord}>{busy ? cancelCopy.loading : cancelCopy.button}</button>
      : view.kind === "retry" ? <button type="button" className={`mt-8 ${purchaseUi.secondary}`} disabled={busy} onClick={onRetry}>{cancelCopy.again}</button> : null}
  </>;
}

export function OrderCancelPanel() {
  const [view, setView] = useState<CancelView>({ kind: "loading" });
  const [busy, setBusy] = useState(false); const [lastAction, setLastAction] = useState<CancelRequestAction>("preview");
  usePageStartsAtTop();
  async function ask(action: CancelRequestAction, previous?: CancelView) {
    const link = readCancelLink(window.location.search);
    if (!link) { setView({ kind: "notAvailable" }); return; }
    setBusy(true); setLastAction(action);
    const result = await send(link, action);
    const before = previous?.kind === "answer" ? previous.answer : previous?.kind === "retry" ? previous.answer : undefined;
    setView(readCancelRequestAnswer(result.status, result.body, before)); setBusy(false);
  }
  // On opening: one "preview" (records nothing). A malformed link is never sent.
  useEffect(() => {
    let live = true;
    void (async () => {
      const link = readCancelLink(window.location.search);
      const result = link ? await send(link, "preview") : { status: 400, body: null };
      if (live) setView(readCancelRequestAnswer(result.status, result.body));
    })();
    return () => { live = false; };
  }, []);
  return <main className={purchaseUi.page}>
    <div className={purchaseUi.container}>
      <PurchaseBrandBar />
      <section aria-live="polite" className="pt-4">
        <OrderCancelView view={view} busy={busy} lastAction={lastAction} onRecord={() => { void ask("record", view); }} onRetry={() => { void ask(lastAction, view); }} />
      </section>
      <div className="mt-10"><a href="/shop" className={purchaseUi.link}>{cancelCopy.back}</a></div>
    </div>
  </main>;
}
