import {ProductSchema,type Product} from './product-schema';
import type {SiteProductSource} from './site-product-view';
import {readSitePublicationIndex,selectSiteProducts} from './site-publication-index';

/** Reference data may be briefly reused by the caller; the EmDash index MUST
 * be fetched on EVERY request. No legacy-sale-state fallback, writes or order
 * activation. Unknown prices remain null instead of silently becoming zero.
 */
export async function readManagedWebsiteProducts(readSources:()=>Promise<readonly SiteProductSource[]>,send:typeof fetch,endpoint:string):Promise<Product[]>{
 const index=await readSitePublicationIndex(send,endpoint);
 if(index.sourceIds.length===0)return [];
 const sources=await readSources();
 const selected=selectSiteProducts(sources.map(source=>({...source,id:source.sourceId})),index);
 return selected.filter(source=>!source.missing).sort((a,b)=>(a.displayOrder??Number.POSITIVE_INFINITY)-(b.displayOrder??Number.POSITIVE_INFINITY)||a.sourceId.localeCompare(b.sourceId)).map(source=>{
  const c=source.content;
  return ProductSchema.parse({id:source.sourceId,name:c.name,origin:c.origin,roast:c.roast,flavor:c.flavor,
   price:c.referencePrice100g,priceIsReference:true,unit:'100g',inStock:false,
   image:c.image?.type==='external'?c.image.url:c.image?.type==='notion_file'?`/api/notion-image/${source.sourceId}`:'',
   process:c.process,variety:c.variety,region:c.region,farm:c.farm,altitude:c.altitude,description:c.description});
 });
}
