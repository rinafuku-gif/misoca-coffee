import {afterEach,expect,it,vi} from 'vitest';
import {notionSiteProductFieldNames} from '../notion-site-product-source';
const db='c2afe0cb-c2a6-40ab-85ce-b98d07e987d0',ds='db3bf889-2b85-44cf-9cb5-0c8403d283c9',id='bbbbbbbb-bbbb-4bbb-8bbb-000000000001';
const endpoint='https://management.example.invalid/api/site-products/index';
const properties=Object.fromEntries(notionSiteProductFieldNames.map((name,n)=>[name,{id:`field_${n}`,name,type:name==='名前'?'title':name==='EC販売ステータス'?'status':['100g豆売売価','表示順'].includes(name)?'number':name==='画像'?'files':'rich_text'}]));
function setup(index:unknown={format:1,sourceIds:[id]},status=200){
 vi.resetModules();vi.stubEnv('MISOCA_SITE_VISIBILITY_AUTHORITY','emdash');vi.stubEnv('MISOCA_SITE_PRODUCT_INDEX_URL',endpoint);vi.stubEnv('NOTION_DATABASE_ID',ds);vi.stubEnv('NOTION_API_KEY','ntn_fake_api_test_only_12345678901234567890');
 const send=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=new URL(String(input));
  if(url.href===endpoint)return Response.json(index,{status});
  expect(url.origin).toBe('https://api.notion.com');expect(init?.redirect).toBe('manual');
  if(url.pathname===`/v1/databases/${db}`)return Response.json({object:'database',id:db,archived:false,in_trash:false,title:[{plain_text:'生豆リスト'}],data_sources:[{id:ds}]});
  if(url.pathname===`/v1/data_sources/${ds}`)return Response.json({object:'data_source',id:ds,archived:false,in_trash:false,parent:{type:'database_id',database_id:db},properties});
  if(url.pathname===`/v1/data_sources/${ds}/query`){
   expect(JSON.parse(String(init?.body))).not.toHaveProperty('filter');
   return Response.json({object:'list',has_more:false,next_cursor:null,results:[{object:'page',id,archived:false,in_trash:false,last_edited_time:'2026-11-03T00:00:00Z',parent:{type:'data_source_id',data_source_id:ds},properties:Object.fromEntries(Object.entries(properties).map(([name,field])=>[name,{id:field.id,type:field.type,[field.type]:field.type==='status'?{name:'完売'}:field.type==='number'?null:field.type==='files'?[]:[{type:'text',plain_text:name==='名前'?'架空の掲載豆':name==='コメント'?'架空の紹介文':''}]}]))}]});
  }
  throw Error('UNEXPECTED_TEST_PROVIDER_REQUEST');
 });vi.stubGlobal('fetch',send);return send;
}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('real Next GET → no-store index → fixed Notion reader → public response, without the old filter',async()=>{
 const send=setup(),{GET}=await import('../../../app/api/products/route');const response=await GET();
 expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');expect(await response.json()).toEqual([expect.objectContaining({id,name:'架空の掲載豆',description:'架空の紹介文',price:null,priceIsReference:true,inStock:false})]);expect(send).toHaveBeenCalledTimes(4);
});
it('empty current publication is a real empty list without reading the old Notion sale state',async()=>{
 const send=setup({format:1,sourceIds:[]}),{GET}=await import('../../../app/api/products/route');const response=await GET();expect(response.status).toBe(200);expect(await response.json()).toEqual([]);expect(send).toHaveBeenCalledTimes(1);
});
it('public-index failure is a fixed 503 with no diagnostic leakage or old-filter fallback',async()=>{
 const send=setup({private:'PRIVATE_PROVIDER_DIAGNOSTIC'},503),log=vi.spyOn(console,'error'),{GET}=await import('../../../app/api/products/route');const response=await GET();expect(response.status).toBe(503);expect(response.headers.get('cache-control')).toBe('no-store');expect(await response.text()).not.toContain('PRIVATE_PROVIDER_DIAGNOSTIC');expect(log).not.toHaveBeenCalled();expect(send).toHaveBeenCalledTimes(1);
});
it('a wrong source configuration fails before any provider request',async()=>{
 const send=setup();vi.stubEnv('NOTION_DATABASE_ID','bbbbbbbb-bbbb-4bbb-8bbb-000000000999');const {GET}=await import('../../../app/api/products/route');expect((await GET()).status).toBe(503);expect(send).not.toHaveBeenCalled();
});
