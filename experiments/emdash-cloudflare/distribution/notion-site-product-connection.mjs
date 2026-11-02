// Dedicated fixed-source read capability. Not mounted until reviewed together
// with the CMS routes. No SDK/search/write API, credential discovery or eager IO.
import {boundedExternal} from '../../../src/features/shop/ledger/timeout.ts';
import {createNotionSiteProductReader} from '../../../src/features/shop/notion-site-product-reader.ts';
import {canonicalSiteSourceId,notionSiteProductFieldNames,prepareNotionSiteProducts} from '../../../src/features/shop/notion-site-product-source.ts';
const databaseId='c2afe0cb-c2a6-40ab-85ce-b98d07e987d0';
const dataSourceId='db3bf889-2b85-44cf-9cb5-0c8403d283c9';
const fail=()=>{throw Error('NOTION_SITE_PRODUCT_READ_UNCONFIRMED');};
const record=value=>value&&Object.getPrototypeOf(value)===Object.prototype;
const keys=(value,expected)=>record(value)&&Object.keys(value).sort().join(',')===[...expected].sort().join(',');
const sameId=(a,b)=>{try{return canonicalSiteSourceId(a)===canonicalSiteSourceId(b);}catch{return false;}};
const cursor=value=>value===undefined||typeof value==='string'&&value.length>0&&value.length<=2000&&!/[\u0000-\u001f\u007f]/.test(value);
const sameProperties=(value,expected)=>Array.isArray(value)&&value.length===expected.size&&new Set(value).size===value.length&&value.every(item=>expected.has(item));
const propertyId=value=>typeof value==='string'&&value.length>0&&value.length<=100&&!/[\u0000-\u001f\u007f]/.test(value);
/** Fresh instance per complete read. Only pages returned by this exact source
 * and only the schema-projected property IDs may be read again for pagination.
 */
export function createDedicatedSiteProductApi(token,send){
 if(typeof token!=='string'||!/^(?:secret_|ntn_)[A-Za-z0-9._~-]{16,4090}$/.test(token)||typeof send!=='function')fail();
 let deadline=null,count=0,bytes=0,busy=false,failed=false,schemaRead=false,schemaReady=false;
 const properties=new Set(),textProperties=new Set(),seenPages=new Set();
 async function request(path,method='GET',body){
  if(failed||busy||++count>40)fail();busy=true;deadline??=performance.now()+25000;
  const remaining=Math.floor(deadline-performance.now()),abort=new AbortController();
  if(remaining<1){busy=false;failed=true;fail();}
  const timer=setTimeout(()=>abort.abort(),remaining);
  try{return await boundedExternal(async()=>{
   const response=await send('https://api.notion.com/v1/'+path,{method,redirect:'manual',cache:'no-store',signal:abort.signal,
    headers:{authorization:'Bearer '+token,'Notion-Version':'2025-09-03',...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
   if(!response.ok||!response.body){try{await response.body?.cancel();}catch{}fail();}
   const stream=response.body.getReader(),decoder=new TextDecoder();let text='',size=0;
   try{for(;;){const chunk=await stream.read();if(chunk.done)break;size+=chunk.value.byteLength;bytes+=chunk.value.byteLength;
    if(size>2097152||bytes>4194304||abort.signal.aborted||performance.now()>=deadline){await stream.cancel();fail();}
    text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();}
   finally{stream.releaseLock();}
   if(abort.signal.aborted||performance.now()>=deadline)fail();return JSON.parse(text);
  },remaining);}catch{failed=true;fail();}finally{clearTimeout(timer);abort.abort();busy=false;}
 }
 const guarded=operation=>async input=>{if(failed)fail();try{return await operation(input);}catch{failed=true;fail();}};
 return Object.freeze({
  schema:guarded(async input=>{
   if(!keys(input,['data_source_id'])||!sameId(input.data_source_id,dataSourceId)||schemaRead)fail();
   schemaRead=true;
   const database=await request('databases/'+databaseId);
   if(database?.object!=='database'||!sameId(database.id,databaseId)||database.archived!==false||database.in_trash!==false
    ||!Array.isArray(database.title)||database.title.map(item=>item.plain_text).join('')!=='生豆リスト'
    ||!Array.isArray(database.data_sources)||database.data_sources.filter(item=>sameId(item.id,dataSourceId)).length!==1)fail();
   const schema=await request('data_sources/'+dataSourceId);
   if(schema?.object!=='data_source'||!sameId(schema.id,dataSourceId)||schema.archived!==false||schema.in_trash!==false
    ||schema.parent?.type!=='database_id'||!sameId(schema.parent.database_id,databaseId)||!record(schema.properties))fail();
   const selected={};
   for(const name of notionSiteProductFieldNames){
    if(!Object.hasOwn(schema.properties,name))continue;
    const field=schema.properties[name];
    if(!record(field)||field.name!==name||!propertyId(field.id)||typeof field.type!=='string'||properties.has(field.id))fail();
    selected[name]={id:field.id,name:field.name,type:field.type};properties.add(field.id);
    if(['title','rich_text'].includes(field.type))textProperties.add(field.id);
   }
   if(!Object.hasOwn(selected,'名前'))fail();
   // Drop all unrelated schema metadata, including supplier/cost field names.
   schemaReady=true;return{object:'data_source',id:dataSourceId,archived:false,in_trash:false,properties:selected};
  }),
  query:guarded(async input=>{
   const expected=['data_source_id','page_size','filter_properties','sorts','result_type',...(input?.start_cursor?['start_cursor']:[])];
   if(!schemaReady||!properties.size||!keys(input,expected)||!sameId(input.data_source_id,dataSourceId)||input.page_size!==100||input.result_type!=='page'
    ||!sameProperties(input.filter_properties,properties)||!cursor(input.start_cursor)
    ||JSON.stringify(input.sorts)!==JSON.stringify([{timestamp:'created_time',direction:'ascending'}]))fail();
   const url=new URL('https://api.notion.com/v1/data_sources/'+dataSourceId+'/query');
   for(const id of properties)url.searchParams.append('filter_properties',id);
   const result=await request(url.pathname.slice(4)+url.search,'POST',{page_size:100,sorts:input.sorts,result_type:'page',...(input.start_cursor?{start_cursor:input.start_cursor}:{})});
   if(result?.object!=='list'||!Array.isArray(result.results)||result.results.length>100)fail();
   for(const row of result.results){if(row?.object!=='page'||!sameId(row.parent?.data_source_id,dataSourceId)||row.parent?.type!=='data_source_id'||row.archived!==false||row.in_trash!==false)fail();
    let id;try{id=canonicalSiteSourceId(row.id);}catch{fail();}seenPages.add(id);
   }
   return result;
  }),
  page:guarded(async input=>{
   if(!keys(input,['page_id','filter_properties'])||!seenPages.has(input.page_id)||!sameProperties(input.filter_properties,properties))fail();
   const url=new URL('https://api.notion.com/v1/pages/'+input.page_id);for(const id of properties)url.searchParams.append('filter_properties',id);
   return request(url.pathname.slice(4)+url.search);
  }),
  property:guarded(async input=>{
   const expected=['page_id','property_id','page_size',...(input?.start_cursor?['start_cursor']:[])];
   if(!keys(input,expected)||!seenPages.has(input.page_id)||!textProperties.has(input.property_id)||input.page_size!==100||!cursor(input.start_cursor))fail();
   let encoded;try{encoded=encodeURIComponent(decodeURIComponent(input.property_id));}catch{fail();}
   const expectedPath='/v1/pages/'+input.page_id+'/properties/'+encoded,url=new URL('https://api.notion.com'+expectedPath);
   // Even an upstream schema ID must not turn a property read into a page
   // read through URL dot-segment normalization (".." or "%2e%2e").
   if(url.pathname!==expectedPath)fail();
   url.searchParams.set('page_size','100');if(input.start_cursor)url.searchParams.set('start_cursor',input.start_cursor);
   return request(url.pathname.slice(4)+url.search);
  }),
 });
}
export function createDedicatedNotionSiteProductConnection(token,send){
 // Binding validation is eager; Notion access remains lazy and never retries.
 // The old six-field description importer is not altered or replaced here.
 if(typeof token!=='string'||!/^(?:secret_|ntn_)[A-Za-z0-9._~-]{16,4090}$/.test(token)||typeof send!=='function')fail();
 return Object.freeze({async read(previous=[]){
  const api=createDedicatedSiteProductApi(token,send);
  return prepareNotionSiteProducts(createNotionSiteProductReader(api,dataSourceId),dataSourceId,previous);
 }});
}
