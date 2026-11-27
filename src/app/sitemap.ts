import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://misoca-coffee.vercel.app";

  return [
    // Build time is not a content update time. Omit unverified lastModified.
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/experience`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/stand`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/catering`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/mobile-roasting`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/access`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/tokushoho`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/shop/gift-ticket`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/shop/uenohara-yuzu`, changeFrequency: "weekly", priority: 0.85 },
  ];
}
