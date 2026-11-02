import { describe, expect, it, vi } from "vitest";
import { canonicalSiteSourceId, parseNotionSiteProduct, prepareNotionSiteProducts } from "../notion-site-product-source";
import { notionSiteReferenceState } from "../site-product-view";

const sourceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const id = (n = 1) => `bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,"0")}`;
const rich = (value: string) => ({ type: "rich_text", rich_text: [{ type: "text", plain_text: value }] });
const select = (name: string) => ({ type: "select", select: { name } });
function page(n = 1, status: string | null = "販売中") {
  return {
    object: "page", id: id(n), last_edited_time: "2026-11-03T00:00:00.000Z", archived: false, in_trash: false,
    parent: { type: "data_source_id", data_source_id: sourceId },
    properties: {
      名前: { type: "title", title: [{ type: "text", plain_text: `架空の焙煎豆 ${n}` }] },
      エリア: select("エチオピア"), "農園・WS": rich("架空農園"),
      品種: { type: "multi_select", multi_select: [{ name: "ブルボン" },{ name: "カトゥーラ" }] },
      生産処理: select("ナチュラル"), コメント: rich("果実のような香り"), テキスト: rich("予備の紹介文"),
      焙煎度合: { type: "multi_select", multi_select: [{ name: "浅煎り" }] }, フレーバー: rich("ベリー"),
      地域: rich("架空地域"), 標高: rich("1800m"),
      "100g豆売売価": { type: "number", number: 900 as number | null },
      EC販売ステータス: { type: "status", status: status === null ? null : { name: status } },
      表示順: { type: "number", number: 2 }, 画像: { type: "files", files: [] as unknown[] },
      "仕入原価（取り込み禁止）": { type: "number", number: 12345 },
      "担当連絡先（取り込み禁止）": rich("dummy-private@example.invalid"),
    },
  };
}
const parsed = (n = 1, status = "販売中") => parseNotionSiteProduct(page(n,status),sourceId);
function reader(...pages: { rows: { page: unknown }[]; hasMore: boolean; nextCursor: string | null }[]) {
  let offset = 0; return { readPage: vi.fn(async () => pages[offset++]) };
}
const last = (...rows: unknown[]) => ({ rows: rows.map(page => ({page})), hasMore: false, nextCursor: null });

describe("Notion product source, no publication/stock authority",()=>{
  it("preserves the complete explicit public-product information and source status",()=>{
    const result=parsed();expect(result.content).toMatchObject({name:"架空の焙煎豆 1",origin:"エチオピア",farm:"架空農園",variety:"ブルボン・カトゥーラ",process:"ナチュラル",description:"果実のような香り",roast:"浅煎り",flavor:"ベリー",region:"架空地域",altitude:"1800m",referencePrice100g:900,image:null});
    expect(result.saleStatus).toBe("販売中");expect(result.displayOrder).toBe(2);expect(result.missingProperties).toEqual([]);
    expect(result).not.toHaveProperty("active");expect(result).not.toHaveProperty("siteVisibility");
    expect(JSON.stringify(result)).not.toContain("dummy-private");expect(JSON.stringify(result)).not.toContain("12345");
  });
  it.each(["準備中","公開前","EC販売なし","サンプル","完売","新しい未定義の状態","販売中 "])("keeps source status %s without making it a site/sale permission",status=>{
    const result=parsed(1,status);expect(result.saleStatus).toBe(status);expect(notionSiteReferenceState(result)).toBe("not_listed_by_notion");
  });
  it("distinguishes a source-rule reference from managed publication",()=>{
    expect(notionSiteReferenceState(parsed())).toBe("listed_by_notion");
    const raw=page(1,null);expect(notionSiteReferenceState(parseNotionSiteProduct(raw,sourceId))).toBe("unconfirmed");
    expect(notionSiteReferenceState({...parsed(),missing:true})).toBe("unconfirmed");
  });
  it("canonicalizes UUID aliases for identity rather than joining on names",()=>{
    expect(canonicalSiteSourceId(id().replaceAll("-","").toUpperCase())).toBe(id());
    const a=parsed(),b=parsed(2);expect(a.sourceId).not.toBe(b.sourceId);expect(a.content.name).not.toBe(b.content.name);
  });
  it("retains an unknown price as null, never zero, and exposes missing fields",()=>{
    const raw=page();raw.properties["100g豆売売価"].number=null;
    expect(parseNotionSiteProduct(raw,sourceId).content.referencePrice100g).toBeNull();
    const missing=page();Reflect.deleteProperty(missing.properties,"100g豆売売価");
    const result=parseNotionSiteProduct(missing,sourceId);expect(result.content.referencePrice100g).toBeNull();expect(result.missingProperties).toContain("100g豆売売価");
  });
  it.each([-1,0.5,Number.MAX_SAFE_INTEGER+1,NaN,Infinity])("rejects invalid reference price %s",price=>{
    const raw=page();raw.properties["100g豆売売価"].number=price;expect(()=>parseNotionSiteProduct(raw,sourceId)).toThrow("SITE_PRODUCT_SOURCE_INVALID");
  });
  it("preserves an explicit zero for later review, without authorizing free checkout",()=>{
    const raw=page();raw.properties["100g豆売売価"].number=0;const result=parseNotionSiteProduct(raw,sourceId);
    expect(result.content.referencePrice100g).toBe(0);expect(result).not.toHaveProperty("orderAcceptance");
  });
  it("matches the legacy comment-or-text description fallback",()=>{
    const raw=page();raw.properties.コメント=rich("");expect(parseNotionSiteProduct(raw,sourceId).content.description).toBe("予備の紹介文");
  });
  it("records a Notion file by page identity, never its signed URL",()=>{
    const raw=page();raw.properties.画像.files=[{type:"file",file:{url:"https://example.invalid/image?signature=dummy-sensitive-url",expiry_time:"2026-11-03T00:10:00Z"}}];
    const result=parseNotionSiteProduct(raw,sourceId);expect(result.content.image).toEqual({type:"notion_file",pageId:id()});expect(JSON.stringify(result)).not.toContain("signature");
  });
  it("keeps a valid external HTTPS image as a reference only",()=>{
    const raw=page();raw.properties.画像.files=[{type:"external",external:{url:"https://images.example.com/coffee.jpg"}}];
    expect(parseNotionSiteProduct(raw,sourceId).content.image).toEqual({type:"external",url:"https://images.example.com/coffee.jpg"});
  });
  it.each(["http://example.com/a","https://user:pass@example.com/a","https://localhost/a","https://127.0.0.1/a","javascript:alert(1)"])("rejects unsafe image reference %s",url=>{
    const raw=page();raw.properties.画像.files=[{type:"external",external:{url}}];expect(()=>parseNotionSiteProduct(raw,sourceId)).toThrow("SITE_PRODUCT_SOURCE_INVALID");
  });
  it.each(["parent","archived","trash","version","name"])("rejects invalid page identity/content %s",kind=>{
    const raw=page();if(kind==="parent")raw.parent.data_source_id=id(9);if(kind==="archived")raw.archived=true;if(kind==="trash")raw.in_trash=true;if(kind==="version")raw.last_edited_time="unknown";if(kind==="name")raw.properties.名前.title=[];
    expect(()=>parseNotionSiteProduct(raw,sourceId)).toThrow("SITE_PRODUCT_SOURCE_INVALID");
  });
  it("refuses truncated rich text until its server reader completes property pagination",()=>{
    const raw=page();raw.properties.コメント.rich_text=Array.from({length:25},()=>({type:"text",plain_text:"長"}));
    expect(()=>parseNotionSiteProduct(raw,sourceId)).toThrow("SITE_PRODUCT_PROPERTY_READ_REQUIRED");
    expect(parseNotionSiteProduct(raw,sourceId,new Set(["コメント"])).content.description).toHaveLength(25);
  });
  it("a changed status, price or sort order changes the source fingerprint",()=>{
    const original=parsed();for(const alter of [(p:ReturnType<typeof page>)=>{p.properties.EC販売ステータス.status={name:"完売"};},(p:ReturnType<typeof page>)=>{p.properties["100g豆売売価"].number=1000;},(p:ReturnType<typeof page>)=>{p.properties.表示順.number=1;}]){
      const raw=page();alter(raw);expect(parseNotionSiteProduct(raw,sourceId).fingerprint).not.toBe(original.fingerprint);
    }
  });
  it("reads all 81 records across pages and never filters to currently selling ones",async()=>{
    const rows=Array.from({length:81},(_,n)=>page(n+1,n%2?"完売":"販売中")),source=reader({rows:rows.slice(0,50).map(page=>({page})),hasMore:true,nextCursor:"next"},last(...rows.slice(50)));
    const result=await prepareNotionSiteProducts(source,sourceId);expect(result).toHaveLength(81);expect(result.filter(r=>r.saleStatus==="完売")).toHaveLength(40);expect(source.readPage).toHaveBeenNthCalledWith(2,"next");
  });
  it("missing source retains the previous information without hiding or deleting a site product",async()=>{
    const before=parsed(),source=reader(last());const result=await prepareNotionSiteProducts(source,sourceId,[before]);expect(result).toEqual([{...before,missing:true}]);expect(before.missing).toBe(false);expect(result[0]).not.toHaveProperty("siteVisibility");
  });
  it("duplicate ID aliases reject the whole snapshot",async()=>{
    const alias=page();alias.id=id().replaceAll("-","").toUpperCase();await expect(prepareNotionSiteProducts(reader(last(page(),alias)),sourceId)).rejects.toThrow("SITE_PRODUCT_DUPLICATE_SOURCE");
  });
  it("same source version with changed metadata is a conflict, not a silent overwrite",async()=>{
    const raw=page();raw.properties.EC販売ステータス.status={name:"完売"};await expect(prepareNotionSiteProducts(reader(last(raw)),sourceId,[parsed()])).rejects.toThrow("SITE_PRODUCT_SOURCE_VERSION_CONFLICT");
  });
  it("rejects a regressed source timestamp and permits a newer snapshot",async()=>{
    const raw=page();raw.last_edited_time="2026-11-02T00:00:00.000Z";await expect(prepareNotionSiteProducts(reader(last(raw)),sourceId,[parsed()])).rejects.toThrow("SITE_PRODUCT_SOURCE_VERSION_CONFLICT");
    raw.last_edited_time="2026-11-04T00:00:00.000Z";raw.properties.EC販売ステータス.status={name:"完売"};expect((await prepareNotionSiteProducts(reader(last(raw)),sourceId,[parsed()]))[0].saleStatus).toBe("完売");
  });
  it("later-page failure preserves caller data and never echoes provider diagnostics",async()=>{
    const before=parsed(),prior=structuredClone(before),source={readPage:vi.fn().mockResolvedValueOnce({rows:[{page:page(2)}],hasMore:true,nextCursor:"next"}).mockRejectedValueOnce(new Error("dummy-private-provider-value"))};
    await expect(prepareNotionSiteProducts(source,sourceId,[before])).rejects.toThrow(/^SITE_PRODUCT_SOURCE_READ_FAILED$/);expect(before).toEqual(prior);
  });
  it("rejects malformed pagination and a repeated cursor",async()=>{
    await expect(prepareNotionSiteProducts(reader({rows:[],hasMore:false,nextCursor:"unexpected"}),sourceId)).rejects.toThrow("SITE_PRODUCT_PAGINATION_INVALID");
    await expect(prepareNotionSiteProducts(reader({rows:[],hasMore:true,nextCursor:"same"},{rows:[],hasMore:true,nextCursor:"same"}),sourceId)).rejects.toThrow("SITE_PRODUCT_PAGINATION_INVALID");
  });
  it("does not accept an altered previous snapshot with an old fingerprint",async()=>{
    const before=parsed();before.saleStatus="完売";await expect(prepareNotionSiteProducts(reader(last()),sourceId,[before])).rejects.toThrow("SITE_PRODUCT_PREVIOUS_INVALID");
  });
});
