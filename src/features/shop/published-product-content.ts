import {z} from 'zod';
import {boundedExternal} from './ledger/timeout';
import type {PublishedContentRepository} from './site-publication-reader';

const uuid=z.string().regex(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
const text=z.string().max(10000);
export const publishedProductContentSchema=z.object({
 sourceId:uuid,name:text.refine(value=>!!value.trim()),origin:text,farm:text,variety:text,process:text,description:text,
}).strict();
export type PublishedProductContent=z.infer<typeof publishedProductContentSchema>;
export const publishedProductContentsSchema=z.object({format:z.literal(2),products:z.array(publishedProductContentSchema).max(500)}).strict()
 .refine(value=>new Set(value.products.map(row=>row.sourceId)).size===value.products.length);
/** Published content only. Prices, inventory, actor IDs, proof, raw revision
 * records and source fallbacks have no place in this public display contract.
 * The existing EC ledger remains the authority for economic facts. This
 * capability is not mounted and never enables ordering or publication.
 */
export interface PublishedProductContentReader{
 read(cursor?:string):Promise<unknown>;
}
const pageSchema=z.object({entries:z.array(z.object({status:z.literal('published'),data:z.record(z.string(),z.unknown())})).max(100),hasMore:z.boolean(),nextCursor:z.string().min(1).max(2000).nullable()});
const fail=():never=>{throw Error('PUBLISHED_PRODUCT_CONTENT_UNAVAILABLE');};
const optionalText=(value:unknown)=>value===undefined||value===null?'':value;
function project(data:Record<string,unknown>){
 // Construct an allowlist, never spread native data or an admin envelope.
 return publishedProductContentSchema.safeParse({sourceId:data.notion_source_id,name:data.title,
  origin:optionalText(data.origin),farm:optionalText(data.farm),variety:optionalText(data.variety),
  process:optionalText(data.process),description:optionalText(data.description)});
}
export async function inspectPublishedProductContents(reader:PublishedProductContentReader){
 return boundedExternal(async()=>{
  const products:PublishedProductContent[]=[],seen=new Set<string>(),duplicates=new Set<string>(),cursors=new Set<string>();
  let cursor:string|undefined,rows=0,invalidRows=0,payloadBytes=64;
  for(let n=0;n<10;n++){
   let raw:unknown;try{raw=await reader.read(cursor);}catch{return fail();}
   const parsed=pageSchema.safeParse(raw);if(!parsed.success)return fail();
   for(const entry of parsed.data.entries){
    if(++rows>500)return fail();
    // An invalid copy of an otherwise valid source ID must also suppress its
    // valid duplicate, not allow an ambiguous publication to survive.
    const source=uuid.safeParse(entry.data.notion_source_id);
    if(source.success){if(seen.has(source.data))duplicates.add(source.data);seen.add(source.data);}
    const value=project(entry.data);if(!value.success){invalidRows++;continue;}
    payloadBytes+=new TextEncoder().encode(JSON.stringify(value.data)).byteLength+1;if(payloadBytes>262144)return fail();products.push(value.data);
   }
   if(!parsed.data.hasMore){
    if(parsed.data.nextCursor!==null)return fail();
    const result=publishedProductContentsSchema.parse({format:2,products:products.filter(row=>!duplicates.has(row.sourceId)).sort((a,b)=>a.sourceId.localeCompare(b.sourceId))});
    return{catalog:result,diagnostics:{invalidRows,ambiguousSources:duplicates.size}};
   }
   if(!parsed.data.nextCursor||cursors.has(parsed.data.nextCursor))return fail();cursor=parsed.data.nextCursor;cursors.add(cursor);
  }
  return fail();
 },5000).catch(()=>fail());
}
export async function readPublishedProductContents(reader:PublishedProductContentReader){return(await inspectPublishedProductContents(reader)).catalog;}

/** Use the real repository's live-only findMany, NOT handleContentGet/edit
 * mode or an admin list, which may include a pending draft revision.
 */
export function createNativePublishedProductContentReader(repository:PublishedContentRepository):PublishedProductContentReader{
 return{async read(cursor){
  if(cursor!==undefined&&(typeof cursor!=='string'||!cursor.length||cursor.length>2000))return fail();
  let result:unknown;try{result=await repository.findMany('product_notes',{where:{status:'published',locale:'ja'},limit:100,orderBy:{field:'createdAt',direction:'asc'},...(cursor?{cursor}:{})});}catch{return fail();}
  const parsed=z.object({items:z.array(z.object({status:z.literal('published'),data:z.record(z.string(),z.unknown())})).max(100),nextCursor:z.string().min(1).max(2000).optional()}).safeParse(result);
  if(!parsed.success)return fail();
  return{entries:parsed.data.items.map(row=>({status:row.status,data:row.data})),hasMore:parsed.data.nextCursor!==undefined,nextCursor:parsed.data.nextCursor??null};
 }};
}
