import {
  getTitle,
  getRichText,
  getSelect,
  getMultiSelect,
  getFile,
} from "@/shared/notion/client";

/** The public display fields of one product page in the Notion product list
 * (生豆リスト). Shared by the legacy catalog (getProducts, 'notion' branch) and
 * the bean display route, so both read the same properties the same way.
 * Price, stock and sale state are deliberately NOT read here. */
export interface NotionProductFields {
  id: string; name: string; origin: string; roast: string; flavor: string;
  process: string; variety: string; region: string; farm: string; altitude: string;
  description: string; image: string;
}

export function readNotionProductFields(pageId: string, props: Record<string, Record<string, unknown>>): NotionProductFields {
  return {
    id: pageId,
    name: getTitle(props["名前"]),
    origin: getSelect(props["エリア"]),
    // 焙煎度合 is multi_select - join values
    roast: getMultiSelect(props["焙煎度合"]),
    flavor: getRichText(props["フレーバー"]),
    image: getProductImageUrl(pageId, props["画像"]),
    process: getSelect(props["生産処理"]),
    variety: getMultiSelect(props["品種"]),
    region: getRichText(props["地域"]),
    farm: getRichText(props["農園・WS"]),
    altitude: getRichText(props["標高"]),
    description: getRichText(props["コメント"]) || getRichText(props["テキスト"]),
  };
}

export function getProductImageUrl(
  pageId: string,
  fileProp: Record<string, unknown> | undefined
): string {
  const directUrl = getFile(fileProp);
  if (!directUrl) return "";
  // external型（Google Drive等の永続URL）はそのまま使う
  if (
    fileProp &&
    fileProp["type"] === "files" &&
    (fileProp["files"] as Array<{ type: string }>)?.[0]?.type === "external"
  ) {
    return directUrl;
  }
  // Notion file型（一時URL）はプロキシ経由にする
  return `/api/notion-image/${pageId}`;
}
