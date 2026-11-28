export const journalPath = "/api/site-journal";
export const legacyJournalPhotoId = "31f0f0fd-afad-81e7-884a-cdb9c6eb54f3";
const articlePattern = /^(?:[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}|[0-9A-HJKMNP-TV-Z]{26})$/;
export const isJournalId = (value: unknown): value is string => typeof value === "string" && articlePattern.test(value);
export const isJournalMediaId = (value: unknown): value is string => typeof value === "string" && /^[0-9A-HJKMNP-TV-Z]{26}$/.test(value);
export const isJournalCoverRoute = (url: string) => url.startsWith("/api/notion-image/") || url.startsWith("/api/journal-media/");

export function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

export function imageRef(value: unknown) {
  const image = object(value);
  const asset = object(image?.asset);
  const id = asset?._ref ?? image?.id;
  const provider = asset?.provider ?? image?.provider;
  return isJournalMediaId(id) && (provider === undefined || provider === "local") ? id : undefined;
}

export function bodyImageRefs(content: unknown[]) {
  return content.flatMap(value => {
    const block = object(value);
    const images = block?._type === "image" ? [block] : block?._type === "gallery" && Array.isArray(block.images) ? block.images : [];
    return images.map(imageRef).filter((id): id is string => Boolean(id));
  });
}

export const journalMediaPath = (articleId: string, imageId: string) => "/api/journal-media/" + articleId + "/" + imageId;
