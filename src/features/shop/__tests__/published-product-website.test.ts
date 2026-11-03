import {expect,it,vi} from 'vitest';
import {readPublishedWebsiteContent,readPublishedWebsiteProducts} from '../published-product-website';
import {canPurchaseCatalogProduct} from '../product-schema';
import type {SiteProductSource} from '../site-product-view';
const id=(n:number)=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,'0')}`;
const endpoint='https://management.example.invalid/api/site-products/catalog';
const content=(n:number)=>({sourceId:id(n),name:`CMS${n}`,origin:'CMS産地',farm:'CMS農園',variety:'CMS品種',process:'CMS精製',description:'公開済みの説明'});
const source=(n:number):SiteProductSource=>({sourceId:id(n),sourceVersion:'2026-11-03T00:00:00Z',fingerprint:'a'.repeat(64),missing:false,missingProperties:[],saleStatus:'完売',displayOrder:n,content:{name:'旧Notion名',origin:'旧産地',farm:'旧農園',variety:'旧品種',process:'旧精製',description:'古い本文',roast:'浅煎り',flavor:'柑橘',region:'参考地域',altitude:'参考標高',referencePrice100g:1200,image:null}});
const send=(products= [content(1)])=>vi.fn(async()=>Response.json({format:2,products}));
it('projects published CMS prose, not the old Notion text or sale-state selection',async()=>{
 const load=vi.fn(async()=>[source(1),{...source(2),saleStatus:'販売中'}]);
 const [p]=await readPublishedWebsiteProducts(send(),endpoint,load);
 expect(p).toMatchObject({id:id(1),name:'CMS1',origin:'CMS産地',farm:'CMS農園',variety:'CMS品種',process:'CMS精製',description:'公開済みの説明',roast:'浅煎り',price:1200,priceIsReference:true,inStock:false});
 expect(canPurchaseCatalogProduct(p)).toBe(false);expect(JSON.stringify(p)).not.toContain('旧Notion');expect(JSON.stringify(p)).not.toContain('fingerprint');
});
it('never fills deliberately empty CMS prose from Notion',async()=>{
 const [p]=await readPublishedWebsiteProducts(send([{...content(1),origin:'',farm:'',variety:'',process:'',description:''}]),endpoint,async()=>[source(1)]);
 expect([p.origin,p.farm,p.variety,p.process,p.description]).toEqual(['','','','','']);
});
it('works without Notion and does not hide products when a reference is missing or duplicated',async()=>{
 const [without]=await readPublishedWebsiteProducts(send(),endpoint);expect(without).toMatchObject({name:'CMS1',price:null,image:'',inStock:false});
 const row=source(1);for(const refs of [[{...row,missing:true}],[row,row],[]]){
  const [p]=await readPublishedWebsiteProducts(send(),endpoint,async()=>refs);expect(p).toMatchObject({name:'CMS1',price:null,image:'',description:'公開済みの説明'});
 }
});
it('refreshes CMS every time and never calls references for an empty publication',async()=>{
 let products=[content(1)];const fetcher=vi.fn(async()=>Response.json({format:2,products})),load=vi.fn(async()=>[source(1)]);
 expect(await readPublishedWebsiteProducts(fetcher,endpoint,load)).toHaveLength(1);products=[];expect(await readPublishedWebsiteProducts(fetcher,endpoint,load)).toEqual([]);
 expect(fetcher).toHaveBeenCalledTimes(2);expect(load).toHaveBeenCalledTimes(1);expect(fetcher).toHaveBeenCalledWith(endpoint,expect.objectContaining({credentials:'omit',redirect:'manual',cache:'no-store'}));
});
it('preserves reference order and safe image forms but never enables purchasing',async()=>{
 const a=source(1),b=source(2);a.displayOrder=3;a.content.image={type:'notion_file',pageId:id(1)};b.content.image={type:'external',url:'https://images.example.invalid/b.jpg'};
 const products=await readPublishedWebsiteProducts(send([content(1),content(2),content(3)]),endpoint,async()=>[a,b]);
 expect(products.map(p=>p.id)).toEqual([id(2),id(1),id(3)]);expect(products.map(p=>p.image)).toEqual(['https://images.example.invalid/b.jpg',`/api/notion-image/${id(1)}`,'']);expect(products.every(p=>!canPurchaseCatalogProduct(p))).toBe(true);
});
it('rejects malformed payloads, duplicate mappings, private fields and an old index without fallback',async()=>{
 const load=vi.fn(async()=>[source(1)]);
 for(const body of [{format:1,sourceIds:[id(1)]},{format:2,products:[content(1),content(1)]},{format:2,products:[{...content(1),actorId:'private'}]},{format:2,products:[{...content(1),name:''}]}]){
  await expect(readPublishedWebsiteProducts(async()=>Response.json(body),endpoint,load)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
 }expect(load).not.toHaveBeenCalled();
});
it('rejects configuration before making a request',async()=>{
 const fetcher=send();for(const bad of ['http://management.example.invalid/api/site-products/catalog',endpoint+'?edit=1',endpoint+'#draft',endpoint.replace('/catalog','/index'),'https://user:pass@management.example.invalid/api/site-products/catalog'])await expect(readPublishedWebsiteContent(fetcher,bad)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
 for(const ms of [0,10001,NaN])await expect(readPublishedWebsiteContent(fetcher,endpoint,ms)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');expect(fetcher).not.toHaveBeenCalled();
});
it('rejects transport errors, redirects, HTML, invalid UTF8, invalid JSON and oversized streams with fixed errors',async()=>{
 for(const make of [()=>new Response(null,{status:302,headers:{location:'https://elsewhere.example.invalid/'}}),()=>new Response('secret',{status:503}),()=>new Response('<html>not json</html>',{headers:{'content-type':'text/html'}}),()=>new Response('{',{headers:{'content-type':'application/json'}}),()=>new Response(new Uint8Array([0xff]),{headers:{'content-type':'application/json'}}),()=>new Response(' '.repeat(262145),{headers:{'content-type':'application/json'}})])await expect(readPublishedWebsiteContent(async()=>make(),endpoint)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
 await expect(readPublishedWebsiteContent(async()=>{throw Error('private provider detail');},endpoint)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
});
it('times out a stuck stream, cancels it and does not return stale content',async()=>{
 const cancel=vi.fn(),body=new ReadableStream<Uint8Array>({start(){},cancel});
 await expect(readPublishedWebsiteContent(async()=>new Response(body,{headers:{'content-type':'application/json'}}),endpoint,10)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');expect(cancel).toHaveBeenCalledOnce();
});
