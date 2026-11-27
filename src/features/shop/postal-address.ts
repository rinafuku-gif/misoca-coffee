import { normalizePostalCode } from "./checkout-form";

/** Postcode → 都道府県・市区町村・町域, from the site's own files
 * (public/postal-addresses/<first 2 digits>.json, built from Japan Post's
 * public KEN_ALL data; same layout as Hayari's). No external service: the
 * request goes to this site only, without cookies or referrer, and only the
 * first two digits of the postcode leave the page. */
export type PostalAddress = { prefecture: string; city: string; town: string };
export async function lookupPostalAddress(postalCode: string, signal?: AbortSignal): Promise<PostalAddress | null> {
  const code = normalizePostalCode(postalCode);
  if (!/^\d{7}$/.test(code)) return null;
  const response = await fetch(`/postal-addresses/${code.slice(0, 2)}.json`, { signal, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) return null;
  const entry: unknown = (await response.json())[code.slice(2)];
  if (!Array.isArray(entry) || entry.length !== 3 || !entry.every(value => typeof value === "string")) return null;
  const [prefecture, city, town] = entry as [string, string, string];
  return prefecture ? { prefecture, city, town } : null;
}
