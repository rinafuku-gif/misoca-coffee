import {afterEach,expect,it,vi} from 'vitest';
import {createSiteProductSourceCache,SITE_PRODUCT_SOURCE_REUSE_MS} from '../notion-site-product-cache';
import type {SiteProductSource} from '../site-product-view';
afterEach(()=>vi.useRealTimers());
const credential='ntn_'+'A'.repeat(32);
const source:SiteProductSource={sourceId:'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',sourceVersion:'2026-11-03T00:00:00Z',fingerprint:'a'.repeat(64),saleStatus:'販売中',displayOrder:1,missing:false,missingProperties:[],content:{name:'架空豆',origin:'',farm:'',variety:'',process:'',description:'',roast:'',flavor:'',region:'',altitude:'',referencePrice100g:null,image:null}};
it('short reuse is per actor and defensive copies do not mutate future results',async()=>{
 let now=0;const cache=createSiteProductSourceCache(()=>now),load=vi.fn(async()=>[source]);
 const first=await cache.read(credential,'owner1',load);first[0].content.name='caller mutation';
 expect((await cache.read(credential,'owner1',load))[0].content.name).toBe('架空豆');expect(load).toHaveBeenCalledTimes(1);
 await cache.read(credential,'owner2',load);expect(load).toHaveBeenCalledTimes(2);now=SITE_PRODUCT_SOURCE_REUSE_MS;
 await cache.read(credential,'owner1',load);expect(load).toHaveBeenCalledTimes(3);
});
it('credential rotation never serves prior credential data',async()=>{
 const cache=createSiteProductSourceCache(()=>0),before=vi.fn(async()=>[source]),after=vi.fn(async()=>[{...source,saleStatus:'完売'}]);
 await cache.read(credential,'owner1',before);expect((await cache.read('ntn_'+'B'.repeat(32),'owner1',after))[0].saleStatus).toBe('完売');expect(after).toHaveBeenCalledTimes(1);
});
it('expired load failures do not fall back to old data or become cached errors',async()=>{
 let now=0;const cache=createSiteProductSourceCache(()=>now);await cache.read(credential,'owner1',async()=>[source]);now=15001;
 await expect(cache.read(credential,'owner1',async()=>{throw Error('PRIVATE');})).rejects.toThrow(/^SITE_SOURCE_UNAVAILABLE$/);
 const load=vi.fn(async()=>[{...source,saleStatus:'完売'}]);expect((await cache.read(credential,'owner1',load))[0].saleStatus).toBe('完売');expect(load).toHaveBeenCalledTimes(1);
});
it('concurrent same-actor loads are deduplicated without exposing raw failures',async()=>{
 const cache=createSiteProductSourceCache(()=>0);let reject!: (reason:Error)=>void;const load=vi.fn(()=>new Promise<readonly SiteProductSource[]>((_yes,no)=>{reject=no;}));
 const first=cache.read(credential,'owner1',load),second=cache.read(credential,'owner1',load);const checks=[expect(first).rejects.toThrow(/^SITE_SOURCE_UNAVAILABLE$/),expect(second).rejects.toThrow(/^SITE_SOURCE_UNAVAILABLE$/)];reject(Error('PRIVATE'));await Promise.all(checks);expect(load).toHaveBeenCalledTimes(1);
});
it('at most four actors have in-flight loads; rotation cannot expand an active load',async()=>{
 const cache=createSiteProductSourceCache(()=>0),release:Array<(data:readonly SiteProductSource[])=>void>=[];
 const load=vi.fn(()=>new Promise<readonly SiteProductSource[]>(yes=>release.push(yes))),pending=[1,2,3,4].map(n=>cache.read(credential,'owner'+n,load));
 await expect(cache.read(credential,'owner5',load)).rejects.toThrow('SITE_SOURCE_UNAVAILABLE');await expect(cache.read('ntn_'+'B'.repeat(32),'owner1',load)).rejects.toThrow('SITE_SOURCE_UNAVAILABLE');expect(load).toHaveBeenCalledTimes(4);
 for(const done of release)done([source]);await Promise.all(pending);expect((await cache.read(credential,'owner5',async()=>[source])).length).toBe(1);
});
it('backward clock does not extend freshness',async()=>{
 let now=100;const cache=createSiteProductSourceCache(()=>now),load=vi.fn(async()=>[source]);await cache.read(credential,'owner1',load);now=99;await cache.read(credential,'owner1',load);expect(load).toHaveBeenCalledTimes(2);
});
const invalidBatches:{batch:unknown}[]=[{batch:[source,source]},{batch:[{...source,fingerprint:'bad'}]},{batch:Array.from({length:501},()=>source)},{batch:[{...source,content:{...source.content,description:'x'.repeat(2_000_001)}}]}];
it.each(invalidBatches)('invalid, duplicate or oversized source batches are not retained',async({batch})=>{
 const cache=createSiteProductSourceCache(()=>0),bad=vi.fn(async()=>batch as readonly SiteProductSource[]);await expect(cache.read(credential,'owner1',bad)).rejects.toThrow(/^SITE_SOURCE_UNAVAILABLE$/);expect((await cache.read(credential,'owner1',async()=>[source])).length).toBe(1);
});
it('missing actor or credential is refused before any source load',async()=>{
 const cache=createSiteProductSourceCache(()=>0),load=vi.fn(async()=>[source]);await expect(cache.read('', 'owner1',load)).rejects.toThrow('SITE_SOURCE_UNAVAILABLE');await expect(cache.read(credential,undefined as unknown as string,load)).rejects.toThrow('SITE_SOURCE_UNAVAILABLE');expect(load).not.toHaveBeenCalled();
});
it('stalled read is bounded and no stale-on-error result escapes',async()=>{
 vi.useFakeTimers();const cache=createSiteProductSourceCache(()=>0),pending=cache.read(credential,'owner1',()=>new Promise(()=>{})),check=expect(pending).rejects.toThrow(/^SITE_SOURCE_UNAVAILABLE$/);await vi.advanceTimersByTimeAsync(25001);await check;
});
