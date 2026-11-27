"use client";

import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** The purchase page, the order-status page and the cancel-request page (its
 * link carries a private token) are kept out of visit measurement. All are
 * entered by a full page load, so on those pages the measurement scripts are
 * never loaded at all. */
const unmeasured = ["/shop/order", "/shop/success", "/shop/order-cancel"] as const;

export const isUnmeasuredPath = (pathname: string) =>
  unmeasured.some(page => pathname === page || pathname.startsWith(`${page}/`));

/** Second guard for the two Vercel scripts: if one is already loaded when the
 * address changes to an unmeasured page, the event is dropped before sending.
 * An address that cannot be read is dropped too. */
export function dropUnmeasured<T extends { url: string }>(event: T): T | null {
  try {
    return isUnmeasuredPath(new URL(event.url, "https://site.invalid").pathname) ? null : event;
  } catch {
    return null;
  }
}

export function SiteMeasurement({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  if (isUnmeasuredPath(pathname)) return null;
  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <Analytics beforeSend={dropUnmeasured} />
      <SpeedInsights beforeSend={dropUnmeasured} />
    </>
  );
}
