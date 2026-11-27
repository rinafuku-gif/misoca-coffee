import { contactReceiptSchema } from "@/features/contact/contract";

const publicPages = new Set(["/", "/experience", "/stand", "/shop", "/contact", "/catering", "/mobile-roasting", "/about", "/access", "/faq", "/shop/gift-ticket"]);
const destinations = new Map([["/experience", "experience"], ["/stand", "stand"], ["/shop", "shop"], ["/contact", "contact"], ["/catering", "catering"], ["/mobile-roasting", "mobile_roasting"]]);
const surfaces = new Set(["header", "footer", "visit_choices", "contact", "experience", "mobile_roasting", "gift_ticket"]);
export type JourneyEvent = { name: "journey_click" | "inquiry_received" | "inquiry_result_unknown"; params: Record<string, string> };
export type JourneyRuntime = { enabled: boolean; pageUrl: string; siteOrigin: string; gtag?: (command: "event", name: JourneyEvent["name"], params: Record<string, string>) => void };
const path = (value: string) => value === "/" ? value : value.replace(/\/$/, "");
function publicPage(pageUrl: string, siteOrigin: string): URL | null {
  try {
    const origin = new URL(siteOrigin), page = new URL(pageUrl);
    if (!["https:", "http:"].includes(origin.protocol) || origin.origin !== siteOrigin || page.origin !== siteOrigin || page.username || page.password || !publicPages.has(path(page.pathname))) return null;
    return page;
  } catch { return null; }
}
function context(page: URL) {
  // Never forward queries, fragments, referrers, dynamic titles or form fields.
  return { page_location: page.origin + path(page.pathname), page_referrer: "", page_title: "三十日珈琲" };
}
export function journeyClick(pageUrl: string, siteOrigin: string, href: string, surface: unknown): JourneyEvent | null {
  const page = publicPage(pageUrl, siteOrigin);
  if (!page) return null;
  try {
    const target = new URL(href, page);
    if (target.username || target.password || target.search || target.hash) return null;
    let destination: string | undefined;
    if (target.origin === page.origin) destination = destinations.get(path(target.pathname));
    else if (target.origin === "https://lin.ee" && target.pathname === "/ihDBxM8") destination = "line";
    else if (["https://instagram.com", "https://www.instagram.com"].includes(target.origin) && path(target.pathname) === "/misoca_coffee") destination = "instagram";
    return destination ? { name: "journey_click", params: { ...context(page), destination, surface: typeof surface === "string" && surfaces.has(surface) ? surface : "unknown" } } : null;
  } catch { return null; }
}
export function inquiryObservation(pageUrl: string, siteOrigin: string, status: number, body: unknown, expectedAttemptId: string): JourneyEvent | null {
  const page = publicPage(pageUrl, siteOrigin);
  if (!page || path(page.pathname) !== "/contact") return null;
  const receipt = contactReceiptSchema.safeParse(body);
  const stored = Number.isInteger(status) && status >= 200 && status < 300 && receipt.success && receipt.data.attemptId === expectedAttemptId;
  // Notification acknowledgement is not delivery, reservation confirmation or payment.
  return { name: stored ? "inquiry_received" : "inquiry_result_unknown", params: context(page) };
}
export function reportJourney(runtime: JourneyRuntime, event: JourneyEvent | null): boolean {
  if (!runtime.enabled || !runtime.gtag || !event) return false;
  try { runtime.gtag("event", event.name, { ...event.params }); return true; } catch { return false; }
}
export function browserJourneyRuntime(): JourneyRuntime {
  return { enabled: process.env.NEXT_PUBLIC_JOURNEY_ANALYTICS_ENABLED === "true", pageUrl: window.location.href, siteOrigin: window.location.origin, gtag: (window as Window & { gtag?: JourneyRuntime["gtag"] }).gtag };
}
export function observeBrowserInquiry(status: number, body: unknown, expectedAttemptId: string): boolean {
  try {
    const runtime = browserJourneyRuntime();
    return reportJourney(runtime, inquiryObservation(runtime.pageUrl, runtime.siteOrigin, status, body, expectedAttemptId));
  } catch { return false; } // Even unavailable browser/analytics objects must not change intake state.
}
