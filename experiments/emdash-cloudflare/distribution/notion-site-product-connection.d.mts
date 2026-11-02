import type {SiteProductSource} from '../../../src/features/shop/site-product-view';
import type {NotionSiteProductApi} from '../../../src/features/shop/notion-site-product-reader';
export function createDedicatedSiteProductApi(token:unknown,send:typeof fetch):NotionSiteProductApi;
export function createDedicatedNotionSiteProductConnection(token:unknown,send:typeof fetch):{
 read(previous?:readonly SiteProductSource[]):Promise<SiteProductSource[]>;
};
