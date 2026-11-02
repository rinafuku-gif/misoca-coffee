import { describe, expect, it, vi } from "vitest";
import { buildSitePublicationIndex, inspectSitePublicationIndex, inspectSiteProductSelection, createSitePublicationIndexHandler, readSitePublicationIndex, selectSiteProducts } from "../site-publication-index";
const id=(n=1)=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,"0")}`;
const entry=(n=1)=>({status:"published",id:"dummy-private-cms-id",data:{notion_source_id:id(n),title:"dummy-private-text",reference:"dummy-private-reference"}});
const index=(...n:number[])=>({format:1,sourceIds:n.map(id)});
const last=(...entries:unknown[])=>({entries,hasMore:false,nextCursor:null});
const port=(value:unknown)=>({readPublishedPage:vi.fn(async()=>value)});
const origin="https://management.example.com",endpoint=origin+"/api/site-products/index";

describe("EmDash publication, not Notion status, selects the site",()=>{
 it('missing safety guards refuse a public index before reading any CMS rows',async()=>{
  const reader=port(last(entry())),ready=vi.fn(async()=>{throw Error('PRIVATE');});
  const response=await createSitePublicationIndexHandler(reader,origin,ready)(new Request(endpoint));
  expect(response.status).toBe(503);expect(await response.json()).toEqual({error:'SITE_CATALOG_UNAVAILABLE'});expect(reader.readPublishedPage).not.toHaveBeenCalled();expect(ready).toHaveBeenCalledTimes(1);
 });
 it("projects only Notion source IDs and ignores private CMS fields",async()=>{
  const reader=port(last(entry()));const result=await buildSitePublicationIndex(reader);expect(result).toEqual(index(1));expect(JSON.stringify(result)).not.toContain("private");expect(reader.readPublishedPage).toHaveBeenCalledWith({collection:"product_notes",status:"published",limit:100});
 });
 it("rejects draft rows rather than allowing preview data through a public read",async()=>{
  await expect(buildSitePublicationIndex(port(last({...entry(),status:"draft"})))).rejects.toThrow(/^SITE_CATALOG_UNAVAILABLE$/);
 });
 it("duplicate or missing mappings exclude only affected products and retain private diagnostics",async()=>{
  const result=await inspectSitePublicationIndex(port(last(entry(),entry(2),entry(),{...entry(),data:{title:"same name"}})));
  expect(result.index).toEqual(index(2));expect(result.issues).toEqual([{code:"duplicate_cms_mapping",sourceId:id(1)},{code:"invalid_cms_mapping",row:4}]);
  const response=await createSitePublicationIndexHandler(port(last(entry(),entry(2),entry())),origin,async()=>{})(new Request(endpoint));
  expect(await response.json()).toEqual(index(2));
 });
 it("duplicate mappings across pages exclude every copy, never choose the first",async()=>{
  const reader={readPublishedPage:vi.fn().mockResolvedValueOnce({entries:[entry(),entry(2)],hasMore:true,nextCursor:"next"}).mockResolvedValueOnce(last(entry()))};
  expect((await inspectSitePublicationIndex(reader)).index).toEqual(index(2));
 });
 it("the item cap counts invalid rows too",async()=>{
  const reader=port({entries:Array.from({length:100},()=>({...entry(),data:{}})),hasMore:true,nextCursor:"next"});
  // Repeated cursors are structural errors, even if all rows are invalid.
  await expect(buildSitePublicationIndex(reader)).rejects.toThrow("SITE_CATALOG_UNAVAILABLE");
 });
 it("reads complete publication pages and detects cyclic cursors",async()=>{
  const reader={readPublishedPage:vi.fn().mockResolvedValueOnce({entries:[entry()],hasMore:true,nextCursor:"next"}).mockResolvedValueOnce(last(entry(2)))};expect(await buildSitePublicationIndex(reader)).toEqual(index(1,2));expect(reader.readPublishedPage).toHaveBeenLastCalledWith({collection:"product_notes",status:"published",limit:100,cursor:"next"});
  const cyclic=port({entries:[],hasMore:true,nextCursor:"same"});await expect(buildSitePublicationIndex(cyclic)).rejects.toThrow("SITE_CATALOG_UNAVAILABLE");expect(cyclic.readPublishedPage).toHaveBeenCalledTimes(2);
 });
 it("provider failure is fixed-format and not an empty successful catalog",async()=>{
  const reader={readPublishedPage:vi.fn().mockRejectedValue(new Error("dummy-private-value"))};const r=await createSitePublicationIndexHandler(reader,origin,async()=>{})(new Request(endpoint));expect(r.status).toBe(503);expect(await r.json()).toEqual({error:"SITE_CATALOG_UNAVAILABLE"});
 });
 it("public GET is no-store and returns no credential or CORS-credential headers",async()=>{
  const r=await createSitePublicationIndexHandler(port(last(entry())),origin,async()=>{})(new Request(endpoint));expect(r.status).toBe(200);expect(await r.json()).toEqual(index(1));expect(r.headers.get("cache-control")).toBe("no-store");expect(r.headers.get("set-cookie")).toBeNull();expect(r.headers.get("access-control-allow-credentials")).toBeNull();
 });
 it.each([new Request(endpoint+"?_preview=dummy"),new Request(endpoint,{headers:{cookie:"session=dummy"}}),new Request(endpoint,{headers:{authorization:"Bearer dummy"}})])("rejects preview/credential-bearing request before reading CMS",async request=>{
  const reader=port(last(entry()));const r=await createSitePublicationIndexHandler(reader,origin,async()=>{})(request);expect(r.status).toBe(400);expect(reader.readPublishedPage).not.toHaveBeenCalled();
 });
 it.each(["POST","PUT","DELETE","HEAD"])("does not expose a %s write action",async method=>{
  const reader=port(last(entry()));const r=await createSitePublicationIndexHandler(reader,origin,async()=>{})(new Request(endpoint,{method}));expect(r.status).toBe(405);expect(reader.readPublishedPage).not.toHaveBeenCalled();
 });
 it("consumes with no credentials, no redirects and no legacy fallback",async()=>{
  const send=vi.fn(async(_input: RequestInfo | URL,_init?: RequestInit)=>Response.json(index(1)));expect(await readSitePublicationIndex(send,endpoint)).toEqual(index(1));expect(send.mock.calls[0][1]).toMatchObject({credentials:"omit",redirect:"manual",cache:"no-store",method:"GET"});
 });
 it.each([302,401,503])("rejects status %s without retry",async status=>{
  const send=vi.fn(async()=>new Response("dummy",{status}));await expect(readSitePublicationIndex(send,endpoint)).rejects.toThrow(/^SITE_CATALOG_UNAVAILABLE$/);expect(send).toHaveBeenCalledTimes(1);
 });
 it.each([{format:1,sourceIds:[id(),id()]},{format:1,sourceIds:[id()],internal:"dummy-private"},{format:1,sourceIds:["not-an-id"]}])("rejects an invalid public response",async payload=>{
  await expect(readSitePublicationIndex(vi.fn(async()=>Response.json(payload)),endpoint)).rejects.toThrow("SITE_CATALOG_UNAVAILABLE");
 });
 it("rejects a response above the byte bound",async()=>{
  await expect(readSitePublicationIndex(vi.fn(async()=>new Response(" ".repeat(32769))),endpoint)).rejects.toThrow("SITE_CATALOG_UNAVAILABLE");
 });
 it("a nonresponding source times out once, without a fallback or retry",async()=>{
  const send=vi.fn(()=>new Promise<Response>(()=>{}));await expect(readSitePublicationIndex(send,endpoint,5)).rejects.toThrow(/^SITE_CATALOG_UNAVAILABLE$/);expect(send).toHaveBeenCalledTimes(1);
 });
 it("malformed configuration never echoes its value or starts a request",async()=>{
  const send=vi.fn(async()=>Response.json(index(1)));
  await expect(readSitePublicationIndex(send,"dummy-private-configuration")).rejects.toThrow(/^SITE_CATALOG_UNAVAILABLE$/);
  expect(()=>createSitePublicationIndexHandler(port(last()),"dummy-private-configuration",async()=>{})).toThrow(/^SITE_CATALOG_CONFIG_INVALID$/);expect(send).not.toHaveBeenCalled();
 });
 it("display -> hide -> display follows CMS alone without touching price/stock/status",async()=>{
  let published=[entry(1),entry(2)];const reader={readPublishedPage:vi.fn(async()=>last(...published))};const handler=createSitePublicationIndexHandler(reader,origin,async()=>{});
  const send=vi.fn(async()=>handler(new Request(endpoint)));
  const source=[{id:id(2),name:"same name",saleStatus:"完売",price:1200,stock:0},{id:id(1),name:"same name",saleStatus:"販売中",price:900,stock:2}],before=structuredClone(source);
  expect(selectSiteProducts(source,await readSitePublicationIndex(send,endpoint))).toEqual(source);
  published=[entry(2)];expect(selectSiteProducts(source,await readSitePublicationIndex(send,endpoint))).toEqual([source[0]]);
  published=[entry(1),entry(2)];expect(selectSiteProducts(source,await readSitePublicationIndex(send,endpoint))).toEqual(source);expect(source).toEqual(before);
 });
 it("empty published selection is authoritative, not a fallback to Notion 販売中",()=>{
  expect(selectSiteProducts([{id:id(),saleStatus:"販売中"}],index())).toEqual([]);
 });
 it("an archived/deleted source omits that product without removing unrelated products",()=>{
  expect(inspectSiteProductSelection([{id:id(1)}],index(1,2))).toEqual({products:[{id:id(1)}],issues:[{code:"missing_source",sourceId:id(2)}]});
 });
 it("duplicate source records omit every ambiguous copy while retaining unrelated products",()=>{
  const result=inspectSiteProductSelection([{id:id()},{id:id(2)},{id:id()}],index(1,2));
  expect(result).toEqual({products:[{id:id(2)}],issues:[{code:"duplicate_source_id",sourceId:id(1)}]});
 });
 it("invalid source IDs are omitted with diagnostics, never matched by title",()=>{
  expect(inspectSiteProductSelection([{id:"invalid"},{id:id()}],index(1))).toEqual({products:[{id:id()}],issues:[{code:"invalid_source_id",row:1}]});
 });
});
