import access from "@content/pages/access.json";
import stand from "@content/pages/stand.json";

export const siteOrigin = "https://misoca-coffee.vercel.app";
const organizationId = `${siteOrigin}/#organization`;
const websiteId = `${siteOrigin}/#website`;

// Parse only the two current, publicly displayed address forms. A changed
// format stays text rather than inventing locality or postal-code fields.
export function postalAddress(value: string) {
  const found = /^〒(\d{3}-\d{4}) (山梨県)(上野原市)(.+)$/.exec(value);
  return found ? { "@type": "PostalAddress", postalCode: found[1], addressRegion: found[2], addressLocality: found[3], streetAddress: found[4], addressCountry: "JP" } : value;
}

export const siteEntities = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": organizationId, name: access.addressBlock.name, url: siteOrigin, email: access.addressBlock.email },
    { "@type": "WebSite", "@id": websiteId, name: access.addressBlock.name, url: siteOrigin, publisher: { "@id": organizationId }, inLanguage: "ja" },
  ],
};

export function locationEntities(location: "roastery" | "stand") {
  const isStand = location === "stand", url = `${siteOrigin}/${isStand ? "stand" : "access"}`, id = `${url}#${isStand ? "coffee-stand" : "roastery"}`;
  const business = isStand
    ? { "@type": "CafeOrCoffeeShop", "@id": id, name: stand.aboutStand.eyebrow, url, address: postalAddress(stand.info.address), description: `${stand.info.location}。営業時間 ${stand.info.hours}。${stand.followUs.bodyLine1}${stand.followUs.bodyLine2}`, sameAs: [stand.followUs.igHref], parentOrganization: { "@id": organizationId } }
    : { "@type": "LocalBusiness", "@id": id, name: access.addressBlock.name, url, address: postalAddress(access.addressBlock.postalAddress), telephone: access.addressBlock.tel, email: access.addressBlock.email, description: access.addressBlock.reservationNote, parentOrganization: { "@id": organizationId } };
  // Calendar-specific days and exceptions are not a verified recurring rule.
  // Do not invent openingHoursSpecification, ratings, prices or geo coordinates.
  return { "@context": "https://schema.org", "@graph": [business, { "@type": "WebPage", "@id": `${url}#webpage`, url, name: isStand ? stand.seo.title : access.seo.title, about: { "@id": id }, isPartOf: { "@id": websiteId } }] as const };
}

export function structuredDataJson(value: unknown): string {
  // JSON-LD is data, including if an editor later enters a closing script tag.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
