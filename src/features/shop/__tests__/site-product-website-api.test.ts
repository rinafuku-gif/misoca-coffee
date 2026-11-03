import {afterEach,expect,it,vi} from 'vitest';
import {notionSiteProductFieldNames} from '../notion-site-product-source';
const db='c2afe0cb-c2a6-40ab-85ce-b98d07e987d0',ds='db3bf889-2b85-44cf-9cb5-0c8403d283c9',id='bbbbbbbb-bbbb-4bbb-8bbb-000000000001';
const endpoint='https://management.example.invalid/api/site-products/catalog',key='a'.repeat(64);
const request=()=>new Request('https://misoca-coffee.vercel.app/api/products');
const published={format:2,products:[{sourceId:id,name:'EmDashで編集した豆',origin:'CMS産地',farm:'CMS農園',variety:'CMS品種',process:'CMS精製',description:'EmDashの公開本文'}]};
const properties=Object.fromEntries(notionSiteProductFieldNames.map((name,n)=>[name,{id:`field_${n}`,name,type:name==='名前'?'title':name==='EC販売ステータス'?'status':['100g豆売売価','表示順'].includes(name)?'number':name==='画像'?'files':'rich_text'}]));
function setup(index:unknown=published,status=200){
 vi.resetModules();vi.stubEnv('MISOCA_SITE_VISIBILITY_AUTHORITY','emdash');vi.stubEnv('MISOCA_SITE_PRODUCT_CATALOG_URL',endpoint);vi.stubEnv('MISOCA_SITE_CATALOG_READ_KEY',key);vi.stubEnv('NOTION_DATABASE_ID',ds);vi.stubEnv('NOTION_API_KEY','ntn_fake_api_test_only_12345678901234567890');
 const send=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=new URL(String(input));
  if(url.href===endpoint){expect(init).toMatchObject({method:'GET',credentials:'omit',redirect:'manual',cache:'no-store',headers:{authorization:'Bearer '+key}});return Response.json(index,{status});}
  expect(url.origin).toBe('https://api.notion.com');expect(init?.redirect).toBe('manual');
  expect(new Headers(init?.headers).get('authorization')).not.toBe('Bearer '+key);
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
it('real Next GET uses protected CMS prose and Notion references without the old filter or key leakage',async()=>{
 const send=setup(),{GET}=await import('../../../app/api/products/route');const response=await GET(new Request('https://misoca-coffee.vercel.app/api/products'));expect(response.headers.get('vercel-cdn-cache-control')).toBeNull();
 expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');const body=await response.text();expect(body).not.toContain(key);expect(body).not.toContain('架空の紹介文');expect(JSON.parse(body)).toEqual([expect.objectContaining({id,name:'EmDashで編集した豆',description:'EmDashの公開本文',origin:'CMS産地',farm:'CMS農園',price:null,priceIsReference:true,inStock:false})]);expect(send).toHaveBeenCalledTimes(4);
});
it('empty current publication is a real empty list without reading the old Notion sale state',async()=>{
 const send=setup({format:2,products:[]}),{GET}=await import('../../../app/api/products/route');const response=await GET(request());expect(response.status).toBe(200);expect(await response.json()).toEqual([]);expect(send).toHaveBeenCalledTimes(1);
});
it('public-index failure is a fixed 503 with no diagnostic leakage or old-filter fallback',async()=>{
 const send=setup({private:'PRIVATE_PROVIDER_DIAGNOSTIC'},503),log=vi.spyOn(console,'error'),{GET}=await import('../../../app/api/products/route');const response=await GET(request());expect(response.status).toBe(503);expect(response.headers.get('cache-control')).toBe('no-store');expect(response.headers.get('vercel-cdn-cache-control')).toBeNull();expect(await response.text()).not.toContain('PRIVATE_PROVIDER_DIAGNOSTIC');expect(log).not.toHaveBeenCalled();expect(send).toHaveBeenCalledTimes(1);
});
it('a wrong source configuration fails before any provider request',async()=>{
 const send=setup();vi.stubEnv('NOTION_DATABASE_ID','bbbbbbbb-bbbb-4bbb-8bbb-000000000999');const {GET}=await import('../../../app/api/products/route');expect((await GET(request())).status).toBe(503);expect(send).not.toHaveBeenCalled();
});
it('missing read-only configuration cannot fall back to the old anonymous index',async()=>{
 for(const name of ['MISOCA_SITE_PRODUCT_CATALOG_URL','MISOCA_SITE_CATALOG_READ_KEY']){
  const send=setup();vi.stubEnv(name,'');vi.stubEnv('MISOCA_SITE_PRODUCT_INDEX_URL','https://management.example.invalid/api/site-products/index');const{GET}=await import('../../../app/api/products/route');expect((await GET(request())).status).toBe(503);expect(send).not.toHaveBeenCalled();
 }
});
it('an old ID index is not accepted as a published-prose catalog',async()=>{
 const send=setup({format:1,sourceIds:[id]}),{GET}=await import('../../../app/api/products/route');expect((await GET(request())).status).toBe(503);expect(send).toHaveBeenCalledTimes(1);
});
it('does not opt any request variant into CDN caching',async()=>{
 setup();const {GET}=await import('../../../app/api/products/route');
 for(const input of [request(),new Request('https://misoca-coffee.vercel.app/api/products?q=1'),new Request('https://misoca-coffee.vercel.app/api/products',{headers:{authorization:'DUMMY'}})]){
  const result=await GET(input);expect(result.status).toBe(200);expect(result.headers.get('cache-control')).toBe('no-store');expect(result.headers.get('vercel-cdn-cache-control')).toBeNull();expect(result.headers.get('cdn-cache-control')).toBeNull();
 }
});
