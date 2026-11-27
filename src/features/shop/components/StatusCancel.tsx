"use client";

import { useEffect, useRef, useState } from "react";
import { CANCEL_REQUEST_PATH, cancelDeadlineLabel, cancelRequestBodyByKey, readCancelRequestAnswer, statusCancelCopy, statusCancelView, type CancelRequestAction, type StatusCancelView } from "../order-cancel";
import { purchaseUi } from "./purchase-ui";
import { CancelFlowSteps } from "./CancelFlow";

async function send(purchaseKey: string, action: CancelRequestAction) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(CANCEL_REQUEST_PATH, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", cache: "no-store", body: JSON.stringify(cancelRequestBodyByKey(purchaseKey, action)), signal: controller.signal });
    let body: unknown = null; try { body = await response.json(); } catch { /* unreadable = not shown */ }
    return { status: response.status, body };
  } catch { return { status: 0, body: null }; } finally { clearTimeout(timer); }
}

/** The look of each state (checked separately in tests). */
export function StatusCancelBlock({ view, confirming, busy, onAsk, onYes, onNo }: { view: StatusCancelView; confirming: boolean; busy: boolean; onAsk(): void; onYes(): void; onNo(): void }) {
  if (view.kind === "hidden") return null;
  if (view.kind === "accepted") return <div role="status" className="mt-8 border-l-2 border-gold pl-4">
    <p className="text-sm font-medium leading-relaxed text-sumi">{view.recordedNow ? statusCancelCopy.recordedTitle : statusCancelCopy.requestedTitle}</p>
    <div className="mt-2"><CancelFlowSteps /></div>
  </div>;
  const deadline = cancelDeadlineLabel(view.deadline);
  return <section aria-label={statusCancelCopy.button} className="mt-8 border-t border-usuzumi pt-6">
    {deadline ? <p className="text-sm text-karekusa">{deadline}</p> : null}
    {view.kind === "retry" ? <p role="alert" className="mt-2 text-sm text-sumi">{statusCancelCopy.retry}</p> : null}
    {confirming ? <div className="mt-3">
      <p className="text-sm font-medium text-sumi">{statusCancelCopy.confirm}</p>
      <p className="mt-1 text-sm leading-relaxed text-sumi">{statusCancelCopy.confirmNote}</p>
      <div className="mt-3 flex gap-3">
        <button type="button" className={`${purchaseUi.primary} min-w-24`} disabled={busy} onClick={onYes}>{statusCancelCopy.yes}</button>
        <button type="button" className={`${purchaseUi.secondary} min-w-24`} disabled={busy} onClick={onNo}>{statusCancelCopy.no}</button>
      </div>
    </div> : <button type="button" className={`mt-3 ${purchaseUi.secondary}`} disabled={busy} onClick={onAsk}>{statusCancelCopy.button}</button>}
  </section>;
}

/** Order status page: 「キャンセルを申し込む」 while the order is paid and the
 * server says a request is possible. Asks once (preview) with the purchase key
 * the status already uses; any non-200 preview hides it silently. */
export function StatusCancel({ purchaseKey }: { purchaseKey: string }) {
  const [view, setView] = useState<StatusCancelView>({ kind: "hidden" });
  const [confirming, setConfirming] = useState(false); const [busy, setBusy] = useState(false);
  const asked = useRef("");
  useEffect(() => {
    if (asked.current === purchaseKey) return;
    asked.current = purchaseKey; let live = true;
    void (async () => {
      const result = await send(purchaseKey, "preview");
      if (live) setView(statusCancelView(readCancelRequestAnswer(result.status, result.body), "preview"));
    })();
    return () => { live = false; };
  }, [purchaseKey]);
  async function record() {
    const deadline = view.kind === "open" || view.kind === "retry" ? view.deadline : undefined;
    setBusy(true);
    const result = await send(purchaseKey, "record");
    setView(statusCancelView(readCancelRequestAnswer(result.status, result.body), "record", deadline)); setConfirming(false); setBusy(false);
  }
  return <StatusCancelBlock view={view} confirming={confirming} busy={busy} onAsk={() => setConfirming(true)} onYes={() => { void record(); }} onNo={() => setConfirming(false)} />;
}
