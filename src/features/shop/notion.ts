import {ProductSchema,type Product} from './product-schema';
import {readWebsitePublishedProducts} from './site-product-website-entry';
export {ProductSchema,type Product} from './product-schema';
import {
  notion,
  parseOrNull,
  getTitle,
  getRichText,
  getSelect,
  getMultiSelect,
  getNumber,
  getFile,
} from "@/shared/notion/client";

const databaseId = process.env.NOTION_DATABASE_ID!;

export async function getProducts(): Promise<Product[]> {
  const authority=process.env.MISOCA_SITE_VISIBILITY_AUTHORITY??'notion';
  if(authority!=='notion'&&authority!=='emdash')throw Error('SITE_CATALOG_CONFIG_INVALID');
  if(authority==='emdash'){
    if(!process.env.NOTION_API_KEY||databaseId?.replaceAll('-','').toLowerCase()!=='db3bf8892b8544cf9cb50c8403d283c9'||!process.env.MISOCA_SITE_PRODUCT_CATALOG_URL||!process.env.MISOCA_SITE_CATALOG_READ_KEY)throw Error('SITE_CATALOG_CONFIG_INVALID');
    return readWebsitePublishedProducts(process.env.NOTION_API_KEY,process.env.MISOCA_SITE_PRODUCT_CATALOG_URL,process.env.MISOCA_SITE_CATALOG_READ_KEY);
  }
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return [];
  }

  const response = await notion.dataSources.query({
    data_source_id: databaseId,
    filter: {
      property: "EC販売ステータス",
      status: {
        equals: "販売中",
      },
    },
    sorts: [
      {
        property: "表示順",
        direction: "ascending",
      },
    ],
  });

  return response.results
    .map((page) => {
      const props = (page as Record<string, unknown>)["properties"] as Record<string, Record<string, unknown>>;

      // 焙煎度合 is multi_select - join values
      const roastLevels = getMultiSelect(props["焙煎度合"]);

      return {
        id: (page as Record<string, unknown>)["id"] as string,
        name: getTitle(props["名前"]),
        origin: getSelect(props["エリア"]),
        roast: roastLevels,
        flavor: getRichText(props["フレーバー"]),
        price: getNumber(props["100g豆売売価"]),
        unit: "100g",
        image: getProductImageUrl((page as Record<string, unknown>)["id"] as string, props["画像"]),
        inStock: true, // Already filtered by EC販売ステータス = 販売中
        process: getSelect(props["生産処理"]),
        variety: getMultiSelect(props["品種"]),
        region: getRichText(props["地域"]),
        farm: getRichText(props["農園・WS"]),
        altitude: getRichText(props["標高"]),
        description: getRichText(props["コメント"]) || getRichText(props["テキスト"]),
      };
    })
    .map((raw) => parseOrNull(ProductSchema, raw, "商品"))
    .filter((p): p is Product => p !== null);
}

function getProductImageUrl(
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
