// Server-only entry; no environment value is exported to the browser. Reuse
// the reviewed fixed-source read transport, never the legacy filtered query.
import {createDedicatedNotionSiteProductConnection} from '../../../experiments/emdash-cloudflare/distribution/notion-site-product-connection.mjs';
import {createSiteProductSourceCache} from './notion-site-product-cache';
import {readManagedWebsiteProducts} from './site-product-website';
import {projectPublishedWebsiteProducts} from './published-product-website';
import {readWebsitePublication} from './website-published-cache';
const sources=createSiteProductSourceCache();
export function readWebsiteProducts(token:string,endpoint:string,send:typeof fetch=fetch){
 return readManagedWebsiteProducts(()=>sources.read(token,'public-catalog',()=>createDedicatedNotionSiteProductConnection(token,send).read()),send,endpoint);
}
/** Opt-in published-prose path. The credential stays in server transport;
 * Notion remains temporary image/reference enrichment, not prose/visibility.
 */
export async function readWebsitePublishedProducts(token:string,endpoint:string,readKey:string,send:typeof fetch=fetch){
 const products=await readWebsitePublication(endpoint,readKey,send);if(products.length===0)return [];
 const references=await sources.read(token,'public-catalog',()=>createDedicatedNotionSiteProductConnection(token,send).read());
 return projectPublishedWebsiteProducts(products,references);
}
export function readWebsitePublishedCatalog(endpoint:string,readKey:string,send:typeof fetch=fetch){
 return readWebsitePublication(endpoint,readKey,send);
}
