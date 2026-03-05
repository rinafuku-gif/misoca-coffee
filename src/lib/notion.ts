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
}

export async function getProducts(): Promise<Product[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return [];
  }

  const response = await notion.dataSources.query({
    data_source_id: databaseId,
    filter: {
      property: "公開",
      checkbox: {
        equals: true,
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

    return {
      id: (page as Record<string, unknown>)["id"] as string,
      name: getTitle(props["名前"]),
      origin: getRichText(props["産地"]),
      roast: getSelect(props["焙煎度"]),
      flavor: getRichText(props["フレーバー"]),
      price: getNumber(props["価格"]),
      unit: getRichText(props["単位"]) || "100g",
      image: getFile(props["画像"]) || "/images/menu/ethiopia.jpg",
      inStock: getCheckbox(props["在庫あり"]),
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

function getNumber(prop: Record<string, unknown> | undefined): number {
  if (!prop || prop["type"] !== "number") return 0;
  return (prop["number"] as number) || 0;
}

function getCheckbox(prop: Record<string, unknown> | undefined): boolean {
  if (!prop || prop["type"] !== "checkbox") return true;
  return prop["checkbox"] as boolean;
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
