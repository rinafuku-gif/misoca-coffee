import {expect,it,vi} from 'vitest';
import {readManagedWebsiteProducts} from '../site-product-website';
import {catalogPriceLabel,canPurchaseCatalogProduct} from '../product-schema';
import type {SiteProductSource} from '../site-product-view';
const id=(n:number)=>`bbbbbbbb-bbbb-4bbb-8bbb-${n.toString().padStart(12,'0')}`;
const source=(n:number):SiteProductSource=>({sourceId:id(n),sourceVersion:'2026-11-03T00:00:00Z',fingerprint:'a'.repeat(64),missing:false,missingProperties:[],saleStatus:'完売',displayOrder:n,content:{name:`架空の豆${n}`,origin:'架空産地',farm:'',variety:'',process:'',description:'紹介文',roast:'浅煎り',flavor:'',region:'',altitude:'',referencePrice100g:1200,image:null}});
const endpoint='https://management.example.invalid/api/site-products/index';
it('uses the full source and EmDash selection, not the old sale status',async()=>{
 const selected=source(1),hidden={...source(2),saleStatus:'販売中'};
 const load=vi.fn(async()=>[hidden,selected]),send=vi.fn(async()=>Response.json({format:1,sourceIds:[id(1)]}));
 const products=await readManagedWebsiteProducts(load,send,endpoint);
 expect(products.map(p=>p.id)).toEqual([id(1)]);expect(products[0].description).toBe('紹介文');
 expect(products[0]).toMatchObject({price:1200,priceIsReference:true,inStock:false});expect(canPurchaseCatalogProduct(products[0])).toBe(false);
 expect(catalogPriceLabel(products[0])).toBe('参考価格 ¥1,200');expect(send).toHaveBeenCalledWith(endpoint,expect.objectContaining({cache:'no-store',credentials:'omit',redirect:'manual'}));
});
it('reloads selection on every request even when source references are reused',async()=>{
 let ids=[id(1)];const send=vi.fn(async()=>Response.json({format:1,sourceIds:ids})),load=vi.fn(async()=>[source(1)]);
 expect(await readManagedWebsiteProducts(load,send,endpoint)).toHaveLength(1);ids=[];expect(await readManagedWebsiteProducts(load,send,endpoint)).toEqual([]);expect(send).toHaveBeenCalledTimes(2);expect(load).toHaveBeenCalledTimes(1);
});
it('never uses a stale or legacy fallback on index/provider failure',async()=>{
 const load=vi.fn(async()=>[source(1)]);await expect(readManagedWebsiteProducts(load,async()=>Response.json({}, {status:503}),endpoint)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');expect(load).not.toHaveBeenCalled();
 await expect(readManagedWebsiteProducts(async()=>{throw Error('SOURCE_FAILED');},async()=>Response.json({format:1,sourceIds:[id(1)]}),endpoint)).rejects.toThrow('SOURCE_FAILED');
});
it('unknown price stays visible without a zero price or purchasable state',async()=>{
 const row=source(1);row.content.referencePrice100g=null;const [product]=await readManagedWebsiteProducts(async()=>[row],async()=>Response.json({format:1,sourceIds:[id(1)]}),endpoint);
 expect(product.price).toBeNull();expect(catalogPriceLabel(product)).toBe('価格未設定');expect(canPurchaseCatalogProduct(product)).toBe(false);
});
it('keeps order, permanent/proxy images and omits missing or ambiguous rows only',async()=>{
 const a=source(1),b=source(2),c={...source(3),missing:true},duplicate=source(4);
 a.displayOrder=3;a.content.image={type:'notion_file',pageId:a.sourceId};b.displayOrder=1;b.content.image={type:'external',url:'https://images.example.invalid/bean.jpg'};
 const products=await readManagedWebsiteProducts(async()=>[a,b,c,duplicate,duplicate],async()=>Response.json({format:1,sourceIds:[id(1),id(2),id(3),id(4)]}),endpoint);
 expect(products.map(p=>p.id)).toEqual([id(2),id(1)]);expect(products.map(p=>p.image)).toEqual(['https://images.example.invalid/bean.jpg',`/api/notion-image/${id(1)}`]);
});
it('does not expose reference status, source revisions or internal IDs in public products',async()=>{
 const [product]=await readManagedWebsiteProducts(async()=>[source(1)],async()=>Response.json({format:1,sourceIds:[id(1)]}),endpoint);
 expect(Object.keys(product).sort()).toEqual(['id','name','origin','roast','flavor','price','priceIsReference','unit','image','inStock','process','variety','region','farm','altitude','description'].sort());
});
