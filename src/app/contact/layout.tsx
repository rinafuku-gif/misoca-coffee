import type { ReactNode } from "react";
import { serviceMetadata } from "@/shared/seo/service-metadata";
import contactContent from "@content/pages/contact.json";

// The page is a client component and cannot export metadata, so its search
// and share text lives here. Both strings repeat words shown on the page.
export const metadata = serviceMetadata("/contact", {
  title: contactContent.hero.subtitle,
  description: contactContent.hero.description,
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
