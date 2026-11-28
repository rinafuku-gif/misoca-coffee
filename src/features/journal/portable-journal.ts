import { imageRef, journalMediaPath, object } from "./emdash-public";
import type { NotionBlock } from "./notion";

function href(value: unknown) {
  if (typeof value !== "string" || /[\u0000-\u001f\\]/.test(value) || value.trim() !== value) return;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const target = new URL(value);
    if (!target.username && !target.password && ["https:", "http:"].includes(target.protocol)) return value;
  } catch { /* An invalid link leaves the text visible. */ }
}

function richText(block: Record<string, unknown>) {
  const links = new Map<string, string>();
  if (Array.isArray(block.markDefs)) for (const definition of block.markDefs) {
    const link = object(definition), url = link?._type === "link" ? href(link.href) : undefined;
    if (typeof link?._key === "string" && url) links.set(link._key, url);
  }
  if (!Array.isArray(block.children)) return [];
  return block.children.flatMap(value => {
    const span = object(value);
    if (span?._type !== "span" || typeof span.text !== "string") return [];
    const marks: unknown[] = Array.isArray(span.marks) ? span.marks : [];
    return [{ plain_text: span.text, href: marks.map(mark => typeof mark === "string" ? links.get(mark) : undefined).find(Boolean),
      annotations: { bold: marks.includes("strong"), italic: marks.includes("em"), strikethrough: marks.includes("strike-through"),
        underline: marks.includes("underline"), code: marks.includes("code") } }];
  });
}

export function portableJournalBlocks(content: unknown[], articleId: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const styles: Record<string, string> = { h1: "heading_1", h2: "heading_1", h3: "heading_2", h4: "heading_3",
    h5: "heading_3", h6: "heading_3", blockquote: "quote" };
  let listStack: { type: "bullet" | "number"; items: { block: NotionBlock; lists: NotionBlock[] }[] }[] = [];
  for (const [index, value] of content.entries()) {
    const block = object(value);
    const id = "emdash-" + index;
    if (block?._type === "block" && (block.listItem === "bullet" || block.listItem === "number")) {
      const level = typeof block.level === "number" && Number.isSafeInteger(block.level) ? Math.min(Math.max(block.level, 1), listStack.length + 1, 8) : 1;
      listStack = listStack.slice(0, level);
      let list = listStack[level - 1];
      if (list?.type !== block.listItem) {
        list = { type: block.listItem, items: [] };
        const target = { id: id + "-list", type: "journal_list", journal_list: list };
        const parent = listStack[level - 2]?.items.at(-1);
        if (parent) parent.lists.push(target); else blocks.push(target);
        listStack[level - 1] = list;
      }
      list.items.push({ block: { id, type: "paragraph", paragraph: { rich_text: richText(block) } }, lists: [] });
      continue;
    }
    listStack = [];
    if (block?._type === "block") {
      const type = typeof block.style === "string" && Object.hasOwn(styles, block.style) ? styles[block.style] : "paragraph";
      blocks.push({ id, type, [type]: { rich_text: richText(block) } });
    } else if (block?._type === "image" || block?._type === "gallery") {
      const images = block._type === "image" ? [block] : Array.isArray(block.images) ? block.images : [];
      for (const [n, image] of images.entries()) {
        const data = object(image), key = imageRef(data);
        if (!key) continue;
        const align = typeof data?.caption === "string" ? [{ plain_text: data.caption }] : [];
        blocks.push({ id: id + "-" + n, type: "image", image: { type: "external", external: { url: journalMediaPath(articleId, key) },
          alt: typeof data?.alt === "string" ? data.alt : "", caption: align, link: href(object(data?.link)?.href ?? data?.link) } });
      }
    } else if (block?._type === "code" && typeof block.code === "string") {
      blocks.push({ id, type: "journal_code", journal_code: block.code });
    } else if (block?._type === "horizontalRule" || block?._type === "divider") {
      blocks.push({ id, type: "divider" });
    }
  }
  return blocks;
}
