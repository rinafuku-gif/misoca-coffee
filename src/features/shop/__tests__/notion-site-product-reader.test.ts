import {expect,it,vi} from "vitest";
import {createNotionSiteProductReader} from "../notion-site-product-reader";
import {prepareNotionSiteProducts} from "../notion-site-product-source";
const source="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",id="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const title={id:"title",name:"名前",type:"title"},status={id:"status",name:"EC販売ステータス",type:"status"},description={id:"text",name:"コメント",type:"rich_text"};
function page(){return{object:"page",id,last_edited_time:"2026-11-03T00:00:00.000Z",archived:false,in_trash:false,parent:{type:"data_source_id",data_source_id:source},properties:{名前:{id:"title",type:"title",title:[{plain_text:"架空の豆",type:"text"}]},EC販売ステータス:{id:"status",type:"status",status:{name:"完売"}},コメント:{id:"text",type:"rich_text",rich_text:[{plain_text:"架空の紹介文",type:"text"}]},仕入原価:{id:"private-cost",type:"number",number:12345}}};}
const list=(...results:unknown[])=>({object:"list",results,has_more:false,next_cursor:null});
function api(){return{
 schema:vi.fn(async():Promise<unknown>=>({object:"data_source",id:source,archived:false,in_trash:false,properties:{名前:title,EC販売ステータス:status,コメント:description,仕入原価:{id:"private-cost",name:"仕入原価",type:"number"}}})),
 query:vi.fn(async(_input:unknown):Promise<unknown>=>list(page())),property:vi.fn(async(_input:unknown):Promise<unknown>=>list()),page:vi.fn(async(_input:unknown):Promise<unknown>=>page()),
};}
it("is lazy and requests only allowed schema properties with no sale-state filter",async()=>{
 const sdk=api(),reader=createNotionSiteProductReader(sdk,source);expect(sdk.schema).not.toHaveBeenCalled();
 const result=await prepareNotionSiteProducts(reader,source);expect(result).toHaveLength(1);expect(result[0].saleStatus).toBe("完売");
 expect(sdk.query.mock.calls[0][0]).toEqual({data_source_id:source,page_size:100,filter_properties:["title","text","status"],sorts:[{timestamp:"created_time",direction:"ascending"}],result_type:"page"});
 expect(JSON.stringify(result)).not.toContain("private-cost");expect(JSON.stringify(result)).not.toContain("12345");expect(sdk.property).not.toHaveBeenCalled();
});
it("does not expose unexpected properties even if the provider ignores its filter",async()=>{
 const output=await createNotionSiteProductReader(api(),source).readPage();const properties=(output.rows[0].page as ReturnType<typeof page>).properties;expect(Object.keys(properties).sort()).toEqual(["名前","コメント","EC販売ステータス"].sort());
});
it("completes a long text property and checks the page version again",async()=>{
 const sdk=api(),raw=page();raw.properties.コメント.rich_text=Array.from({length:25},()=>({plain_text:"省略",type:"text"}));sdk.query.mockResolvedValueOnce(list(raw));
 sdk.property.mockResolvedValueOnce(list({object:"property_item",id:"text",type:"rich_text",rich_text:{plain_text:"全文を取得",type:"text"}}));
 const result=await prepareNotionSiteProducts(createNotionSiteProductReader(sdk,source),source);expect(result[0].content.description).toBe("全文を取得");expect(sdk.page).toHaveBeenCalledTimes(1);expect(sdk.property.mock.calls[0][0]).toEqual({page_id:id,property_id:"text",page_size:100});
});
it("a changed page while expanding a property invalidates the whole snapshot",async()=>{
 const sdk=api(),raw=page();raw.properties.コメント.rich_text=Array.from({length:25},()=>({plain_text:"省略",type:"text"}));sdk.query.mockResolvedValueOnce(list(raw));sdk.property.mockResolvedValueOnce(list());sdk.page.mockResolvedValueOnce({...page(),last_edited_time:"2026-11-04T00:00:00.000Z"});
 await expect(createNotionSiteProductReader(sdk,source).readPage()).rejects.toThrow("SITE_PRODUCT_SOURCE_VERSION_CONFLICT");
});
it("does not read any property from a page outside the configured data source",async()=>{
 const sdk=api(),raw=page();raw.parent.data_source_id=id;sdk.query.mockResolvedValueOnce(list(raw));await expect(createNotionSiteProductReader(sdk,source).readPage()).rejects.toThrow("SITE_PRODUCT_SOURCE_INVALID");expect(sdk.property).not.toHaveBeenCalled();
});
it("stops on schema type changes before querying records",async()=>{
 const sdk=api();sdk.schema.mockResolvedValueOnce({object:"data_source",id:source,archived:false,in_trash:false,properties:{名前:{...title,type:"number"}}});await expect(createNotionSiteProductReader(sdk,source).readPage()).rejects.toThrow("SITE_PRODUCT_SOURCE_INVALID");expect(sdk.query).not.toHaveBeenCalled();
});
it("does not allow a failed reader to be retried or expose provider errors",async()=>{
 const sdk=api();sdk.query.mockRejectedValueOnce(new Error("dummy-private-token"));const reader=createNotionSiteProductReader(sdk,source);await expect(reader.readPage()).rejects.toThrow(/^SITE_PRODUCT_SOURCE_READ_FAILED$/);await expect(reader.readPage()).rejects.toThrow("SITE_PRODUCT_PAGINATION_INVALID");expect(sdk.query).toHaveBeenCalledTimes(1);
});
it("rejects an unexpected caller cursor before invoking any SDK method",async()=>{
 const sdk=api();await expect(createNotionSiteProductReader(sdk,source).readPage("arbitrary")).rejects.toThrow("SITE_PRODUCT_PAGINATION_INVALID");expect(sdk.schema).not.toHaveBeenCalled();
});
