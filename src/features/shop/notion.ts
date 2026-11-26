import {ProductSchema,type Product} from './product-schema';
import {readWebsitePublishedProducts} from './site-product-website-entry';
import {readNotionProductFields} from './notion-product-fields';
export {ProductSchema,type Product} from './product-schema';
import {
  notion,
  parseOrNull,
  getNumber,
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
      return {
        ...readNotionProductFields((page as Record<string, unknown>)["id"] as string, props),
        price: getNumber(props["100g豆売売価"]),
        unit: "100g",
        inStock: true, // Already filtered by EC販売ステータス = 販売中
      };
    })
    .map((raw) => parseOrNull(ProductSchema, raw, "商品"))
    .filter((p): p is Product => p !== null);
}
