import { expect, it, vi } from "vitest";
import { inquiryObservation, journeyClick, observeBrowserInquiry, reportJourney } from "./journey-events";
const origin = "https://misoca.example.invalid", page = origin + "/contact", id = "11111111-1111-4111-8111-111111111111";
const receipt = { state: "stored", attemptId: id, notification: "provider_acknowledged" };
it("missing browser objects cannot interrupt intake", () => expect(observeBrowserInquiry(200, receipt, id)).toBe(false));
it("classifies approved links as clicks, not confirmed outcomes", () => {
  for (const [href, destination] of [["/shop", "shop"], ["/experience", "experience"], ["https://lin.ee/ihDBxM8", "line"], ["https://instagram.com/misoca_coffee/", "instagram"]]) {
    expect(journeyClick(page, origin, href, "contact")).toMatchObject({ name: "journey_click", params: { destination } });
  }
});
it.each(["/admin", "/admin/crm", "/shop/order", "/shop/success", "/experience/cancel", "/experience/reservation-complete", "/unknown"])("excludes private or unknown page %s", route => {
  expect(journeyClick(origin + route, origin, "/shop", "contact")).toBeNull();
  expect(inquiryObservation(origin + route, origin, 200, receipt, id)).toBeNull();
});
it("never forwards campaign queries, identifiers, fragments or arbitrary labels", () => {
  const event = journeyClick(page + "?utm_source=instagram&email=PRIVATE#PRIVATE", origin, "/shop", "PRIVATE");
  expect(event?.params).toEqual({ page_location: page, page_referrer: "", page_title: "三十日珈琲", destination: "shop", surface: "unknown" });
  expect(JSON.stringify(event)).not.toContain("PRIVATE");
});
it.each(["https://lin.ee.evil.invalid/ihDBxM8", "https://lin.ee/other", "http://lin.ee/ihDBxM8", "https://person:password@lin.ee/ihDBxM8", "/shop?private=x", "/shop#private", "javascript:alert(1)", "/shop/order"])("rejects unapproved destination %s", href => {
  expect(journeyClick(page, origin, href, "header")).toBeNull();
});
it("counts only the current attempt's strict saved receipt", () => {
  for (const notification of ["provider_acknowledged", "unconfirmed", "not_configured"]) expect(inquiryObservation(page, origin, 200, { ...receipt, notification }, id)?.name).toBe("inquiry_received");
  for (const body of [{ success: true }, { success: true, receipt: { stored: true, notified: true } }, { ...receipt, attemptId: "22222222-2222-4222-8222-222222222222" }, null]) expect(inquiryObservation(page, origin, 200, body, id)?.name).toBe("inquiry_result_unknown");
  for (const status of [0, 200.5, 302, 400, 503, NaN]) expect(inquiryObservation(page, origin, status, receipt, id)?.name).toBe("inquiry_result_unknown");
});
it("does not forward receipts, attempt ids or notification details", () => {
  expect(inquiryObservation(page, origin, 200, receipt, id)?.params).toEqual({ page_location: page, page_referrer: "", page_title: "三十日珈琲" });
});
it("disabled, absent and failing GA never queue or retry", () => {
  const gtag = vi.fn(() => { throw Error("PRIVATE"); });
  const event = journeyClick(page, origin, "/shop", "header");
  expect(reportJourney({ enabled: false, pageUrl: page, siteOrigin: origin, gtag }, event)).toBe(false);
  expect(gtag).not.toHaveBeenCalled();
  expect(reportJourney({ enabled: true, pageUrl: page, siteOrigin: origin }, event)).toBe(false);
  expect(reportJourney({ enabled: true, pageUrl: page, siteOrigin: origin, gtag }, event)).toBe(false);
  expect(gtag).toHaveBeenCalledTimes(1);
});
