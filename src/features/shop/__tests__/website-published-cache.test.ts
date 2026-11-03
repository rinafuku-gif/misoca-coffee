import {expect,it,vi} from 'vitest';
import {createProcessWebsitePublicationReader} from '../website-published-cache';
const endpoint='https://example.invalid/api/site-products/catalog',key='a'.repeat(64),product={sourceId:'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',name:'CMS商品',origin:'',farm:'',variety:'',process:'',description:'公開本文'};
it('shares success for ten seconds within ONE reader, not across cold processes',async()=>{
 let now=100000;const send=vi.fn(async()=>Response.json({format:2,products:[product]})),read=createProcessWebsitePublicationReader(()=>now);
 await Promise.all(Array.from({length:30},()=>read(endpoint,key,send)));expect(send).toHaveBeenCalledTimes(1);
 await read(endpoint,key,send);expect(send).toHaveBeenCalledTimes(1);
 await createProcessWebsitePublicationReader(()=>now)(endpoint,key,send);expect(send).toHaveBeenCalledTimes(2);
 now+=10000;await read(endpoint,key,send);expect(send).toHaveBeenCalledTimes(3);
});
it('holds a fixed failure briefly without per-visitor retries or stale success',async()=>{
 let now=100000;const send=vi.fn(async()=>Response.json({format:2,products:[product]})),read=createProcessWebsitePublicationReader(()=>now);
 await read(endpoint,key,send);now+=10000;send.mockResolvedValue(Response.json({private:'DUMMY_PRIVATE'},{status:503}));
 for(let n=0;n<10;n++)await expect(read(endpoint,key,send)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');expect(send).toHaveBeenCalledTimes(2);
 now+=10000;send.mockResolvedValue(Response.json({format:2,products:[]}));expect(await read(endpoint,key,send)).toEqual([]);expect(send).toHaveBeenCalledTimes(3);
});
it('changed endpoint or credential scope does not reuse another cached result',async()=>{
 const send=vi.fn(async()=>Response.json({format:2,products:[product]})),read=createProcessWebsitePublicationReader(()=>100000);
 await read(endpoint,key,send);await read(endpoint,'b'.repeat(64),send);await read(endpoint.replace('example.invalid','other.invalid'),key,send);expect(send).toHaveBeenCalledTimes(3);await expect(read(endpoint,'invalid',send)).rejects.toThrow();expect(send).toHaveBeenCalledTimes(3);
});
it('rejects clock rollback, non-finite time and slow results without stale fallback',async()=>{
 let now=100000;const read=createProcessWebsitePublicationReader(()=>now),send=vi.fn(async()=>Response.json({format:2,products:[product]}));await read(endpoint,key,send);
 now--;await expect(read(endpoint,key,send)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');expect(send).toHaveBeenCalledTimes(1);
 now=NaN;await expect(read(endpoint,key,send)).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
 now=100000;await expect(createProcessWebsitePublicationReader(()=>now)(endpoint,key,async()=>{now+=10000;return Response.json({format:2,products:[product]});})).rejects.toThrow('SITE_CATALOG_UNAVAILABLE');
});
it('does not let a consumer change the next caller snapshot',async()=>{
 const read=createProcessWebsitePublicationReader(()=>100000),send=vi.fn(async()=>Response.json({format:2,products:[product]}));
 (await read(endpoint,key,send))[0].name='changed';expect((await read(endpoint,key,send))[0].name).toBe('CMS商品');expect(send).toHaveBeenCalledTimes(1);
});
