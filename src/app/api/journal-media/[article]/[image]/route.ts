import { readJournalImage } from "@/features/journal/site-journal";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ article: string; image: string }> }) {
  const { article, image } = await params;
  return readJournalImage(article, image);
}
