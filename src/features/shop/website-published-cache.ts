// Server only. No Next Data/Runtime Cache or external cache service is used.
// This bounds repeated calls inside ONE process, not across cold instances.
import {createHash} from 'node:crypto';
import {readPublishedWebsiteContent} from './published-product-website';
import {createServerCatalogTransport} from './published-product-server-access';
import {publishedProductContentsSchema,type PublishedProductContent} from './published-product-content';
export const WEBSITE_PUBLICATION_WINDOW_MS=10000;
const fail=():never=>{throw Error('SITE_CATALOG_UNAVAILABLE');};
type Snapshot={ok:false}|{ok:true;products:PublishedProductContent[]};
type Entry={scope:string;at:number;pending:Promise<Snapshot>};

/** A single bounded slot for the fixed server configuration. Concurrent API
 * and image checks share it within a process. Success AND fixed failure expire
 * after ten seconds from fetch start; neither stale success nor error details
 * are retained. Cloudflare still enforces its own shared reservation budget.
 * CDN response caching is deliberately disabled: expiry/error behavior on the
 * real platform is not proven. Do not add it to the initial adoption.
 */
export function createProcessWebsitePublicationReader(now:()=>number=()=>Date.now()){
 let entry:Entry|undefined;
 return async(endpoint:string,readKey:string,send:typeof fetch=fetch):Promise<PublishedProductContent[]>=>{
  const transport=createServerCatalogTransport(send,endpoint,readKey),at=now();
  if(!Number.isSafeInteger(at)||at<0)return fail();
  const scope=createHash('sha256').update('misoca-publication-process-v2\0').update(endpoint).update('\0').update(readKey).digest('hex');
  if(entry&&at<entry.at)return fail();
  if(!entry||entry.scope!==scope||at-entry.at>=WEBSITE_PUBLICATION_WINDOW_MS){
   entry={scope,at,pending:(async():Promise<Snapshot>=>{
    try{return{ok:true,products:await readPublishedWebsiteContent(transport,endpoint)};}
    catch{return{ok:false};}
   })()};
  }
  const active=entry,result=await active.pending,current=now();
  if(!Number.isSafeInteger(current)||current<active.at||current-active.at>=WEBSITE_PUBLICATION_WINDOW_MS||!result.ok)return fail();
  // Validation returns a fresh copy, so a consumer cannot mutate cached data.
  const parsed=publishedProductContentsSchema.safeParse({format:2,products:result.products});
  return parsed.success?parsed.data.products:fail();
 };
}
export const readWebsitePublication=createProcessWebsitePublicationReader();

