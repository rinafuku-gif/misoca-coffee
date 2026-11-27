"use client";

import { useEffect } from "react";

/** The purchase pages always open at their top. Cause of the "opens at the
 * footer" problem: when the customer comes back from the payment page (browser
 * back) or reloads, the browser restores the old scroll position while the page
 * is still short (products/status not loaded yet), so it lands at the bottom,
 * on the footer. Turning restoration off for this page and starting at the top
 * fixes that; leaving the page puts the previous setting back. */
export function usePageStartsAtTop() {
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => { window.history.scrollRestoration = previous; };
  }, []);
}
