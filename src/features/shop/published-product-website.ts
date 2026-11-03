import {publishedProductContentsSchema,type PublishedProductContent} from './published-product-content';
import {ProductSchema,type Product} from './product-schema';
import {boundedExternal} from './ledger/timeout';
import type {SiteProductSource} from './site-product-view';

const fail=():never=>{throw Error('SITE_CATALOG_UNAVAILABLE');};
/** Server-only, public-only transport. No browser cookies or caller headers,
 * redirects, stale selection, or old Notion-sale-state fallback. The endpoint
 * is server configuration, not an arbitrary URL accepted from a visitor.
 */
export async function readPublishedWebsiteContent(send:typeof fetch,endpoint:string,timeoutMs=5000):Promise<PublishedProductContent[]>{
 let url:URL;try{url=new URL(endpoint);}catch{return fail();}
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/api/site-products/catalog'||url.search||url.hash
  ||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)return fail();
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),timeoutMs);
 try{return await boundedExternal(async()=>{
  const response=await send(url.href,{method:'GET',credentials:'omit',redirect:'manual',cache:'no-store',signal:abort.signal});
  if(!response.ok||!response.body||!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type')??'')){void response.body?.cancel().catch(()=>{});return fail();}
  const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});let text='',bytes=0;
  const cancel=()=>{void reader.cancel().catch(()=>{});};abort.signal.addEventListener('abort',cancel,{once:true});
  try{
   for(;;){const row=await reader.read();if(row.done)break;bytes+=row.value.byteLength;if(bytes>262144||abort.signal.aborted){cancel();return fail();}text+=decoder.decode(row.value,{stream:true});}
   text+=decoder.decode();if(abort.signal.aborted)return fail();
   const parsed=publishedProductContentsSchema.safeParse(JSON.parse(text));return parsed.success?parsed.data.products:fail();
  }catch{cancel();return fail();}finally{abort.signal.removeEventListener('abort',cancel);reader.releaseLock();}
 },timeoutMs);}catch{return fail();}finally{abort.abort();clearTimeout(timer);}
}

/** EmDash owns visibility and all editable prose. Optional, non-authoritative
 * Notion references enrich only fields the native collection does not expose.
 * Missing/ambiguous references never erase a published CMS product or invent
 * text/zero prices. This catalog remains non-purchasable: the existing EC
 * ledger, not CMS/Notion reference prices, must authorize an actual order.
 */
export async function readPublishedWebsiteProducts(send:typeof fetch,endpoint:string,readReferences?:()=>Promise<readonly SiteProductSource[]>):Promise<Product[]>{
 const contents=await readPublishedWebsiteContent(send,endpoint);if(contents.length===0)return [];
 return projectPublishedWebsiteProducts(contents,readReferences?await readReferences():[]);
}
export function projectPublishedWebsiteProducts(contents:readonly PublishedProductContent[],references:readonly SiteProductSource[]=[]):Product[]{
 if(contents.length>500||references.length>500)return fail();
 const refs=new Map<string,SiteProductSource>(),duplicates=new Set<string>();
 for(const reference of references){if(refs.has(reference.sourceId))duplicates.add(reference.sourceId);else refs.set(reference.sourceId,reference);}
 return contents.map(content=>{
  const candidate=refs.get(content.sourceId),reference=!duplicates.has(content.sourceId)&&!candidate?.missing?candidate:undefined,c=reference?.content;
  return{order:reference?.displayOrder??Number.POSITIVE_INFINITY,product:ProductSchema.parse({
   id:content.sourceId,name:content.name,origin:content.origin,farm:content.farm,variety:content.variety,process:content.process,description:content.description,
   roast:c?.roast??'',flavor:c?.flavor??'',region:c?.region??'',altitude:c?.altitude??'',
   image:c?.image?.type==='external'?c.image.url:c?.image?.type==='notion_file'?`/api/notion-image/${content.sourceId}`:'',
   price:c?.referencePrice100g??null,priceIsReference:true,unit:'100g',inStock:false,
  })};
 }).sort((a,b)=>a.order-b.order||a.product.id.localeCompare(b.product.id)).map(row=>row.product);
}
