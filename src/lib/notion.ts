import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

export interface Product {
  id: string;
  name: string;
  origin: string;
  roast: string;
  flavor: string;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
  process: string;
  variety: string;
  region: string;
  farm: string;
  altitude: string;
  description: string;
}

export async function getProducts(): Promise<Product[]> {
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

  return response.results.map((page) => {
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
      image: getFile(props["画像"]) || "/images/menu/default-bean.jpg",
      inStock: true, // Already filtered by EC販売ステータス = 販売中
      process: getSelect(props["生産処理"]),
      variety: getMultiSelect(props["品種"]),
      region: getRichText(props["地域"]),
      farm: getRichText(props["農園・WS"]),
      altitude: getRichText(props["標高"]),
      description: getRichText(props["コメント"]) || getRichText(props["テキスト"]),
    };
  });
}

function getTitle(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "title") return "";
  const title = prop["title"] as Array<{ plain_text: string }>;
  return title?.[0]?.plain_text || "";
}

function getRichText(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "rich_text") return "";
  const text = prop["rich_text"] as Array<{ plain_text: string }>;
  return text?.[0]?.plain_text || "";
}

function getSelect(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "select") return "";
  const select = prop["select"] as { name: string } | null;
  return select?.name || "";
}

function getMultiSelect(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "multi_select") return "";
  const options = prop["multi_select"] as Array<{ name: string }>;
  return options?.map((o) => o.name).join("・") || "";
}

function getNumber(prop: Record<string, unknown> | undefined): number {
  if (!prop || prop["type"] !== "number") return 0;
  return (prop["number"] as number) || 0;
}

function getFile(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "files") return "";
  const files = prop["files"] as Array<{
    type: string;
    file?: { url: string };
    external?: { url: string };
  }>;
  if (!files || files.length === 0) return "";
  const file = files[0];
  if (file.type === "file") return file.file?.url || "";
  if (file.type === "external") return file.external?.url || "";
  return "";
}
