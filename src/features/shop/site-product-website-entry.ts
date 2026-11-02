// Server-only entry; no environment value is exported to the browser. Reuse
// the reviewed fixed-source read transport, never the legacy filtered query.
import {createDedicatedNotionSiteProductConnection} from '../../../experiments/emdash-cloudflare/distribution/notion-site-product-connection.mjs';
import {createSiteProductSourceCache} from './notion-site-product-cache';
import {readManagedWebsiteProducts} from './site-product-website';
const sources=createSiteProductSourceCache();
export function readWebsiteProducts(token:string,endpoint:string,send:typeof fetch=fetch){
 return readManagedWebsiteProducts(()=>sources.read(token,'public-catalog',()=>createDedicatedNotionSiteProductConnection(token,send).read()),send,endpoint);
}
