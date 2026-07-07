import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/cms", "/cms/"],
    },
    sitemap: "https://misoca-coffee.vercel.app/sitemap.xml",
  };
}
