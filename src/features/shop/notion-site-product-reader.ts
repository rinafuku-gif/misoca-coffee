import { z } from "zod";
import { boundedExternal } from "./ledger/timeout";
import { canonicalSiteSourceId, notionSiteProductFieldNames, type NotionSiteProductReader } from "./notion-site-product-source";

/** Inject an already authorized read-only SDK/transport. No client, credential,
 * write/search method, data-source selection or network request is constructed.
 */
export interface NotionSiteProductApi {
  schema(input: { data_source_id: string }): Promise<unknown>;
  query(input: { data_source_id: string; page_size: 100; filter_properties: string[]; sorts: { timestamp: "created_time"; direction: "ascending" }[]; result_type: "page"; start_cursor?: string }): Promise<unknown>;
  property(input: { page_id: string; property_id: string; page_size: 100; start_cursor?: string }): Promise<unknown>;
  page(input: { page_id: string; filter_properties: string[] }): Promise<unknown>;
}
const identifier=z.string().min(1).max(100).refine(value=>!/[\u0000-\u001f\u007f]/.test(value));
const list=z.object({object:z.literal("list"),results:z.array(z.unknown()).max(100),has_more:z.boolean(),next_cursor:z.string().min(1).max(2000).nullable()});
const fields=z.object({id:identifier,name:identifier,type:z.string()});
const fail=(code:string):never=>{throw new Error(code);};
const object=(raw:unknown):Record<string,unknown>=>raw!==null&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:fail("SITE_PRODUCT_SOURCE_INVALID");
const rich=z.object({plain_text:z.string().max(10000),type:z.string().optional()});

export function createNotionSiteProductReader(api: NotionSiteProductApi, dataSourceId: string, timeoutMs=25000): NotionSiteProductReader {
  const sourceId=canonicalSiteSourceId(dataSourceId);
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw new Error("SITE_PRODUCT_CONFIG_INVALID");
  let deadline:number|null=null,requests=0,expected:string|undefined,busy=false,finished=false;
  let selected:Map<string,z.infer<typeof fields>>|null=null;
  const seenPages=new Set<string>(),seenCursors=new Set<string>();
  async function read(operation:()=>Promise<unknown>){
    if(++requests>40)return fail("SITE_PRODUCT_SOURCE_LIMIT");
    const remaining=Math.floor((deadline??0)-performance.now());if(remaining<1)return fail("SITE_PRODUCT_SOURCE_READ_FAILED");
    let result:unknown;try{result=await boundedExternal(operation,remaining);}catch{return fail("SITE_PRODUCT_SOURCE_READ_FAILED");}
    if(performance.now()>=deadline!)return fail("SITE_PRODUCT_SOURCE_READ_FAILED");return result;
  }
  async function schema(){
    const raw=object(await read(()=>api.schema({data_source_id:sourceId})));
    if(raw.object!=="data_source"||canonicalSiteSourceId(raw.id)!==sourceId||raw.archived!==false||raw.in_trash!==false)return fail("SITE_PRODUCT_SOURCE_INVALID");
    const properties=object(raw.properties),result=new Map<string,z.infer<typeof fields>>(),ids=new Set<string>();
    for(const name of notionSiteProductFieldNames){
      if(!Object.hasOwn(properties,name))continue;
      const field=fields.safeParse(properties[name]);
      const validType=name==="EC販売ステータス"?field.data?.type==="status":name==="100g豆売売価"||name==="表示順"?field.data?.type==="number":name==="画像"?field.data?.type==="files":["title","rich_text","select","multi_select"].includes(field.data?.type??"");
      if(!field.success||field.data.name!==name||!validType||ids.has(field.data.id))return fail("SITE_PRODUCT_SOURCE_INVALID");
      ids.add(field.data.id);result.set(name,field.data);
    }
    if(!result.has("名前"))return fail("SITE_PRODUCT_SOURCE_INVALID");return result;
  }
  function pageIdentity(raw:unknown){
    const page=object(raw),parent=object(page.parent);
    if(page.object!=="page"||page.archived!==false||page.in_trash!==false||parent.type!=="data_source_id"
      ||canonicalSiteSourceId(parent.data_source_id)!==sourceId||!z.string().datetime({offset:true}).safeParse(page.last_edited_time).success)return fail("SITE_PRODUCT_SOURCE_INVALID");
    return{page,id:canonicalSiteSourceId(page.id),version:page.last_edited_time};
  }
  return{async readPage(cursor){
    if(busy||finished||cursor!==expected)return fail("SITE_PRODUCT_PAGINATION_INVALID");
    busy=true;deadline??=performance.now()+timeoutMs;
    try{
      selected??=await schema();const filterProperties=[...selected.values()].map(field=>field.id);
      const response=list.safeParse(await read(()=>api.query({data_source_id:sourceId,page_size:100,filter_properties:filterProperties,sorts:[{timestamp:"created_time",direction:"ascending"}],result_type:"page",...(cursor?{start_cursor:cursor}:{})})));
      if(!response.success)return fail("SITE_PRODUCT_PAGINATION_INVALID");
      if(response.data.has_more?response.data.next_cursor===null||seenCursors.has(response.data.next_cursor):response.data.next_cursor!==null)return fail("SITE_PRODUCT_PAGINATION_INVALID");
      const rows=[];
      for(const value of response.data.results){
        const original=pageIdentity(value);if(seenPages.has(original.id))return fail("SITE_PRODUCT_DUPLICATE_SOURCE");seenPages.add(original.id);
        const properties=object(original.page.properties),projected:Record<string,unknown>={},completeProperties=new Set<string>();
        for(const[name,field]of selected){
          const prop=object(properties[name]);if(prop.id!==field.id||prop.type!==field.type)return fail("SITE_PRODUCT_SOURCE_INVALID");
          if(field.type!=="title"&&field.type!=="rich_text"){projected[name]=prop;continue;}
          const inline=z.array(rich).max(100).safeParse(prop[field.type]);if(!inline.success)return fail("SITE_PRODUCT_SOURCE_INVALID");
          if(inline.data.length<25&&!inline.data.some(value=>value.type==="mention")){projected[name]=prop;continue;}
          const items:z.infer<typeof rich>[]=[],cursors=new Set<string>();let propertyCursor:string|undefined,done=false,length=0;
          for(let n=0;n<10;n++){
            const part=list.safeParse(await read(()=>api.property({page_id:original.id,property_id:field.id,page_size:100,...(propertyCursor?{start_cursor:propertyCursor}:{})})));
            if(!part.success)return fail("SITE_PRODUCT_SOURCE_INVALID");
            for(const value of part.data.results){const item=object(value),text=rich.safeParse(item[field.type]);if(item.object!=="property_item"||item.id!==field.id||item.type!==field.type||!text.success)return fail("SITE_PRODUCT_SOURCE_INVALID");items.push(text.data);length+=text.data.plain_text.length;if(items.length>1000||length>10000)return fail("SITE_PRODUCT_SOURCE_LIMIT");}
            if(!part.data.has_more){if(part.data.next_cursor!==null)return fail("SITE_PRODUCT_PAGINATION_INVALID");done=true;break;}
            if(part.data.next_cursor===null||cursors.has(part.data.next_cursor))return fail("SITE_PRODUCT_PAGINATION_INVALID");
            propertyCursor=part.data.next_cursor;cursors.add(propertyCursor);
          }
          if(!done)return fail("SITE_PRODUCT_PAGINATION_LIMIT");
          projected[name]={id:field.id,type:field.type,[field.type]:items};completeProperties.add(name);
        }
        if(completeProperties.size){const current=pageIdentity(await read(()=>api.page({page_id:original.id,filter_properties:filterProperties})));if(current.id!==original.id||current.version!==original.version)return fail("SITE_PRODUCT_SOURCE_VERSION_CONFLICT");}
        // Strip unknown provider properties even if the provider ignored the
        // requested field projection. No raw costs or contacts leave this port.
        rows.push({page:{object:"page",id:original.id,last_edited_time:original.version,archived:false,in_trash:false,parent:{type:"data_source_id",data_source_id:sourceId},properties:projected},completeProperties});
      }
      if(performance.now()>=deadline)return fail("SITE_PRODUCT_SOURCE_READ_FAILED");
      expected=response.data.next_cursor??undefined;if(expected)seenCursors.add(expected);else finished=true;
      return{rows,hasMore:response.data.has_more,nextCursor:response.data.next_cursor};
    }catch(error){finished=true;throw error;}finally{busy=false;}
  }};
}
