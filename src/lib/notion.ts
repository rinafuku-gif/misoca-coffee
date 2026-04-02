import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;
const journalDbId = process.env.NOTION_JOURNAL_DB_ID || "";

export interface JournalPost {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  excerpt: string;
  coverImage: string;
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  if (!process.env.NOTION_API_KEY || !journalDbId) {
    return [];
  }

  const response = await notion.dataSources.query({
    data_source_id: journalDbId,
    filter: {
      property: "ステータス",
      select: {
        equals: "公開",
      },
    },
    sorts: [
      {
        property: "公開日",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: unknown) => {
    const pageObj = page as Record<string, unknown>;
    const props = pageObj["properties"] as Record<string, Record<string, unknown>>;
    const pageId = pageObj["id"] as string;

    // カバー画像の取得: 1) プロパティ「カバー画像」 2) ページカバー（page.cover）
    const coverImage = resolveJournalCoverImage(pageId, props, pageObj);

    return {
      id: pageId,
      title: getTitle(props["タイトル"]),
      category: getSelect(props["カテゴリ"]),
      status: getSelect(props["ステータス"]),
      date: getDate(props["公開日"]),
      excerpt: getRichText(props["抜粋"]),
      coverImage,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotionBlock = Record<string, any>;

export async function getJournalPostById(id: string): Promise<JournalPost | null> {
  if (!process.env.NOTION_API_KEY) return null;

  try {
    const page = await notion.pages.retrieve({ page_id: id }) as Record<string, unknown>;
    const props = page["properties"] as Record<string, Record<string, unknown>>;
    const pageId = page["id"] as string;

    return {
      id: pageId,
      title: getTitle(props["タイトル"]),
      category: getSelect(props["カテゴリ"]),
      status: getSelect(props["ステータス"]),
      date: getDate(props["公開日"]),
      excerpt: getRichText(props["抜粋"]),
      coverImage: resolveJournalCoverImage(pageId, props, page),
    };
  } catch {
    return null;
  }
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!process.env.NOTION_API_KEY) return [];

  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(response.results as NotionBlock[]));
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

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
      image: getProductImageUrl((page as Record<string, unknown>)["id"] as string, props["画像"]),
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

// ---- 焙煎体験予約 DB --------------------------------------------------------

const reservationDbId = process.env.NOTION_RESERVATION_DB_ID || "";

export interface ReservationRecord {
  eventId: string;
  experienceType: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  address: string;
  numberOfGuests: number;
  transportation: string;
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  coffeeDrinkingFrequency: string;
  location?: string;
  transportFee?: number;
  transportDistance?: number;
}

/**
 * 予約をNotionデータベースに保存する
 */
export async function saveReservation(record: ReservationRecord): Promise<void> {
  if (!process.env.NOTION_API_KEY || !reservationDbId) {
    return;
  }

  await notion.pages.create({
    parent: { database_id: reservationDbId },
    properties: {
      "お名前": {
        title: [{ text: { content: record.name } }],
      },
      "フリガナ": {
        rich_text: [{ text: { content: record.nameKana } }],
      },
      "メールアドレス": {
        email: record.email,
      },
      "電話番号": {
        phone_number: record.phone,
      },
      "住所": {
        rich_text: [{ text: { content: record.address } }],
      },
      "体験種別": {
        select: { name: record.experienceType },
      },
      "予約日時": {
        date: {
          start: record.date && record.startTime
            ? `${record.date}T${record.startTime}:00+09:00`
            : record.date || new Date().toISOString().slice(0, 10),
          end: record.date && record.endTime
            ? `${record.date}T${record.endTime}:00+09:00`
            : undefined,
        },
      },
      "来店人数": {
        number: record.numberOfGuests,
      },
      "来店交通手段": {
        select: { name: record.transportation },
      },
      "認知経路": {
        rich_text: [{ text: { content: record.howFound } }],
      },
      "焙煎体験の有無": {
        select: { name: record.roastingExperience },
      },
      "好きなコーヒー": {
        rich_text: [{ text: { content: record.favoriteCoffee } }],
      },
      "コーヒーを飲む頻度": {
        select: { name: record.coffeeDrinkingFrequency },
      },
      "ステータス": {
        select: { name: "予約済み" },
      },
      "イベントID": {
        rich_text: [{ text: { content: record.eventId } }],
      },
      ...(record.location
        ? {
            "出張先住所": {
              rich_text: [{ text: { content: record.location } }],
            },
          }
        : {}),
      ...(record.transportFee !== undefined
        ? {
            "交通費": {
              number: record.transportFee,
            },
          }
        : {}),
      ...(record.transportDistance !== undefined && record.transportDistance > 0
        ? {
            "片道距離(km)": {
              number: record.transportDistance,
            },
          }
        : {}),
    },
  });
}

/**
 * イベントIDでNotionの予約ページを検索してステータスをキャンセルに更新する
 */
export async function cancelReservation(eventId: string): Promise<void> {
  if (!process.env.NOTION_API_KEY || !reservationDbId) {
    return;
  }

  // dataSources.query（既存コードのパターン）でイベントIDを検索
  const response = await notion.dataSources.query({
    data_source_id: reservationDbId,
    filter: {
      property: "イベントID",
      rich_text: {
        equals: eventId,
      },
    },
  });

  if (response.results.length === 0) return;

  const pageId = (response.results[0] as Record<string, unknown>)["id"] as string;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "ステータス": {
        select: { name: "キャンセル" },
      },
    },
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

function getDate(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "date") return "";
  const date = prop["date"] as { start: string } | null;
  return date?.start || "";
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

function resolveJournalCoverImage(
  pageId: string,
  props: Record<string, Record<string, unknown>>,
  pageObj: Record<string, unknown>,
): string {
  // 1) プロパティ「カバー画像」から取得
  const fileProp = props["カバー画像"];
  const directUrl = getFile(fileProp);
  if (directUrl) {
    // external型（Google Drive等の永続URL）はそのまま使う
    if (
      fileProp &&
      fileProp["type"] === "files" &&
      (fileProp["files"] as Array<{ type: string }>)?.[0]?.type === "external"
    ) {
      return directUrl;
    }
    // Notion file型はプロキシ経由（クエリパラメータなし）
    return `/api/notion-image/${pageId}`;
  }

  // 2) ページカバー（page.cover）から取得
  const cover = pageObj["cover"] as Record<string, unknown> | undefined;
  if (cover) {
    if (cover["type"] === "external") {
      const ext = cover["external"] as { url: string } | undefined;
      if (ext?.url) return ext.url;
    }
    if (cover["type"] === "file") {
      // プロキシが自動的にページカバーを検出する
      return `/api/notion-image/${pageId}`;
    }
  }

  return "";
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
