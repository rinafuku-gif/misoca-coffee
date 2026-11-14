import { describe, expect, it } from "vitest";
import access from "@content/pages/access.json";
import stand from "@content/pages/stand.json";
import { locationEntities, postalAddress, siteEntities, siteOrigin, structuredDataJson } from "@/shared/seo/site-entities";
import { metadata as accessMetadata } from "../access/page";
import { metadata as standMetadata } from "../stand/page";

describe("two distinct public locations", () => {
  it("keeps the site organization separate from a physical location", () => {
    expect(siteEntities["@graph"].map(row => row["@type"])).toEqual(["Organization", "WebSite"]);
    expect(siteEntities["@graph"].every(row => !Object.hasOwn(row, "address"))).toBe(true);
  });
  it("derives each address from the same content displayed on that page", () => {
    const main = locationEntities("roastery")["@graph"][0], branch = locationEntities("stand")["@graph"][0];
    expect(main.address).toEqual(postalAddress(access.addressBlock.postalAddress));
    expect(branch.address).toEqual(postalAddress(stand.info.address));
    expect(main.address).not.toEqual(branch.address); expect(main["@id"]).not.toBe(branch["@id"]);
    expect(main["@type"]).toBe("LocalBusiness"); expect(branch["@type"]).toBe("CafeOrCoffeeShop");
  });
  it("does not copy the roastery phone or booking conditions onto the stand", () => {
    const data = structuredDataJson(locationEntities("stand"));
    expect(data).not.toContain(access.addressBlock.tel); expect(data).not.toContain(access.addressBlock.reservationNote);
    expect(data).toContain(stand.info.hours); expect(data).toContain(stand.followUs.igHref);
  });
  it("does not invent weekly exceptions, ratings, prices or coordinates", () => {
    for (const location of ["roastery", "stand"] as const) {
      const data = structuredDataJson(locationEntities(location));
      for (const key of ["openingHoursSpecification", "aggregateRating", "review", "priceRange", "geo", "dateModified"]) expect(data).not.toContain(`"${key}"`);
    }
  });
  it("gives each location page its own canonical and share description", () => {
    for (const [metadata, content, path] of [[accessMetadata, access, "/access"], [standMetadata, stand, "/stand"]] as const) {
      expect(metadata.alternates?.canonical).toBe(siteOrigin + path);
      expect(metadata.openGraph).toMatchObject({ url: siteOrigin + path, description: content.seo.description });
    }
  });
  it("links each page to its own location and the same website", () => {
    for (const location of ["roastery", "stand"] as const) {
      const [business, page] = locationEntities(location)["@graph"];
      expect(page.about).toEqual({ "@id": business["@id"] }); expect(page.isPartOf).toEqual({ "@id": `${siteOrigin}/#website` });
    }
  });
  it("does not guess components for a changed address format", () => {
    expect(postalAddress("住所確認中")).toBe("住所確認中");
  });
  it("escapes script-closing editor input without changing JSON data", () => {
    const value = { description: '</script><script>alert("dummy")</script>' }, encoded = structuredDataJson(value);
    expect(encoded).not.toContain("<"); expect(JSON.parse(encoded)).toEqual(value);
  });
});
