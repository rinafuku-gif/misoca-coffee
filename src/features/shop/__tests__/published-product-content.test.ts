import {expect,it} from 'vitest';
import {readPublishedProductContents,inspectPublishedProductContents,createNativePublishedProductContentReader} from '../published-product-content';
const id=(n=1)=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,'0')}`;
const entry=(n=1,extra={})=>({status:'published',data:{notion_source_id:id(n),title:'公開した架空の商品',description:'公開した架空の紹介文',...extra}});
const reader=(entries:unknown[])=>({async read(){return{entries,hasMore:false,nextCursor:null};}});
it('exports only published display fields; never a price, inventory proposal or internal evidence',async()=>{
 const value=await readPublishedProductContents(reader([entry(1,{price:999,stock:999,actorId:'DUMMY_PRIVATE',seed:'DUMMY_PRIVATE',draftRevisionId:'DUMMY_PRIVATE'})]));
 expect(value).toEqual({format:2,products:[{sourceId:id(),name:'公開した架空の商品',description:'公開した架空の紹介文',origin:'',farm:'',variety:'',process:''}]});expect(JSON.stringify(value)).not.toContain('DUMMY_PRIVATE');
});
it('missing optional text stays empty, with no fallback to old Notion prose or invented content',async()=>{
 const value=await readPublishedProductContents(reader([entry(1,{description:null,origin:undefined})]));expect(value.products[0].description).toBe('');expect(value.products[0].origin).toBe('');
});
it('ambiguous source mappings suppress all copies, including a malformed duplicate',async()=>{
 const result=await inspectPublishedProductContents(reader([entry(),entry(1,{title:null}),entry(2)]));expect(result.catalog.products.map(p=>p.sourceId)).toEqual([id(2)]);expect(result.diagnostics).toEqual({invalidRows:1,ambiguousSources:1});expect(result.catalog).not.toHaveProperty('diagnostics');
});
it('draft rows and broken pagination are failures, never silently treated as an empty valid catalogue',async()=>{
 await expect(readPublishedProductContents(reader([{...entry(),status:'draft'}]))).rejects.toThrow('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');
 for(const page of [{entries:[],hasMore:false,nextCursor:'unexpected'},{entries:[],hasMore:true,nextCursor:null}])await expect(readPublishedProductContents({read:async()=>page})).rejects.toThrow('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');
 let reads=0;await expect(readPublishedProductContents({read:async()=>{reads++;return{entries:[],hasMore:true,nextCursor:'same'};}})).rejects.toThrow('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');expect(reads).toBe(2);
});
it('caps work at 500 rows and 10 pages',async()=>{
 let page=0;await expect(readPublishedProductContents({async read(){page++;return{entries:Array.from({length:100},(_,n)=>entry((page-1)*100+n+1)),hasMore:true,nextCursor:String(page)};}})).rejects.toThrow('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');expect(page).toBe(6);
});
it('caps aggregate UTF-8 output before a public response can grow without bound',async()=>{
 await expect(readPublishedProductContents(reader(Array.from({length:10},(_,n)=>entry(n+1,{description:'あ'.repeat(10000)}))))).rejects.toThrow('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');
});
it('native adapter fixes locale/status/read mode and does not echo provider failures',async()=>{
 const calls:unknown[]=[];const r=createNativePublishedProductContentReader({async findMany(...args){calls.push(args);return{items:[entry()]};}});
 expect((await readPublishedProductContents(r)).products).toHaveLength(1);expect(calls).toEqual([['product_notes',{where:{status:'published',locale:'ja'},limit:100,orderBy:{field:'createdAt',direction:'asc'}}]]);
 await expect(readPublishedProductContents(createNativePublishedProductContentReader({async findMany(){throw Error('DUMMY_PRIVATE');}}))).rejects.toThrow(/^PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE$/);
});
