// Server-only read capability. It is NOT a manager session or write authority.
import {timingSafeEqual} from 'node:crypto';
import {Buffer} from 'node:buffer';
import {z} from 'zod';
import {publishedProductContentsSchema} from './published-product-content';
import {boundedExternal} from './ledger/timeout';

export const CATALOG_REFRESH_MS=30000;
export const CATALOG_DAILY_ATTEMPTS=3000;
const DAY=86400000,KEY='misoca-published-catalog-cache-v1';
const headers={'cache-control':'private, no-store','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','x-robots-tag':'noindex,nofollow','referrer-policy':'no-referrer'};
const fail=():never=>{throw Error('SITE_CATALOG_UNAVAILABLE');};
const keySchema=z.string().regex(/^[a-f0-9]{64}$/);
const stateSchema=z.object({format:z.literal(1),attemptAt:z.number().int().nonnegative().safe(),day:z.number().int().nonnegative().safe(),attempts:z.number().int().min(1).max(CATALOG_DAILY_ATTEMPTS),payload:publishedProductContentsSchema.optional()}).strict()
 .refine(s=>s.day===Math.floor(s.attemptAt/DAY));
type Catalog=z.infer<typeof publishedProductContentsSchema>;
type CatalogSnapshot={payload:Catalog;validUntil:number};
type CacheState=z.infer<typeof stateSchema>;
export interface PublishedCatalogTransaction{
 get(key:string):Promise<unknown>;
 put(key:string,value:unknown):Promise<void>;
}
export interface PublishedCatalogStorage{
 transaction<T>(callback:(txn:PublishedCatalogTransaction)=>Promise<T>):Promise<T>;
}
class ReadBudgetExceeded extends Error{
 constructor(readonly seconds:number){super('SITE_CATALOG_READ_BUDGET');}
}
function clock(now:()=>number){const value=now();if(!Number.isSafeInteger(value)||value<0)return fail();return value;}
function parseState(raw:unknown):CacheState|undefined{
 if(raw===undefined)return undefined;
 const parsed=stateSchema.safeParse(raw);if(!parsed.success||new TextEncoder().encode(JSON.stringify(parsed.data)).byteLength>263168)return fail();return parsed.data;
}
function configuredOrigin(origin:string){try{const url=new URL(origin);if(url.protocol!=='https:'||url.origin!==origin)return fail();return origin;}catch{return fail();}}

/** Only the singleton management DO's storage belongs here. Persist the read
 * reservation BEFORE any CMS query, so parallel factories/restarts/lost
 * responses cannot reset the interval or daily budget. Exactly one fixed
 * cache key; no per-client rows, alarms, writes to CMS or schema creation.
 */
function createBoundedPublishedCatalogSnapshot(storage:PublishedCatalogStorage,load:()=>Promise<unknown>,now:()=>number=Date.now){
 if(typeof storage?.transaction!=='function'||typeof load!=='function'||typeof now!=='function')return fail();
 let pending:Promise<CatalogSnapshot>|undefined;
 async function work():Promise<CatalogSnapshot>{
  const claimed=await storage.transaction(async txn=>{
   const at=clock(now),day=Math.floor(at/DAY),old=parseState(await txn.get(KEY));
   if(old&&at<old.attemptAt)return fail(); // clock rollback cannot reset budget
   if(old&&at-old.attemptAt<CATALOG_REFRESH_MS){
    if(old.payload)return{payload:old.payload,validUntil:old.attemptAt+CATALOG_REFRESH_MS};
    throw new ReadBudgetExceeded(Math.max(1,Math.ceil((old.attemptAt+CATALOG_REFRESH_MS-at)/1000)));
   }
   const attempts=old?.day===day?old.attempts:0;
   if(attempts>=CATALOG_DAILY_ATTEMPTS)throw new ReadBudgetExceeded(Math.ceil(((day+1)*DAY-at)/1000));
   const state:CacheState={format:1,attemptAt:at,day,attempts:attempts+1};
   await txn.put(KEY,state);return{state};
  });
  if('payload'in claimed)return{payload:claimed.payload!,validUntil:claimed.validUntil!};
  const reservation=claimed.state!;
  // Provider errors leave the reservation in place. Never retry automatically,
  // serve expired text, or hold a storage transaction across remote I/O.
  const payload=publishedProductContentsSchema.parse(await boundedExternal(load,5000));
  if(new TextEncoder().encode(JSON.stringify(payload)).byteLength>262144)return fail();
  await storage.transaction(async txn=>{
   const at=clock(now),current=parseState(await txn.get(KEY));
   if(at<reservation.attemptAt||at>=reservation.attemptAt+CATALOG_REFRESH_MS||!current||current.payload
    ||current.attemptAt!==reservation.attemptAt||current.day!==reservation.day||current.attempts!==reservation.attempts)return fail();
   await txn.put(KEY,{...reservation,payload});
  });
  return{payload,validUntil:reservation.attemptAt+CATALOG_REFRESH_MS};
 }
 return async():Promise<CatalogSnapshot>=>{
  pending??=work();const active=pending;
  try{return await active;}finally{if(pending===active)pending=undefined;}
 };
}
export function createBoundedPublishedCatalogCache(storage:PublishedCatalogStorage,load:()=>Promise<unknown>,now?:()=>number){
 const read=createBoundedPublishedCatalogSnapshot(storage,load,now);return async():Promise<Catalog>=>(await read()).payload;
}

/** Exact read-only path, HTTPS origin and dedicated random 256-bit key. A
 * missing/invalid configuration never becomes anonymous access. The key is
 * compared with a platform primitive, never placed in URLs or responses.
 */
export function createServerCatalogAccess(siteOrigin:string,readKey:string){
 configuredOrigin(siteOrigin);const parsed=keySchema.safeParse(readKey);if(!parsed.success)return fail();
 const expected=Buffer.from(parsed.data,'hex');
 return(request:Request):Response|undefined=>{
  const url=new URL(request.url);
  if(url.origin!==siteOrigin||url.pathname!=='/api/site-products/catalog')return new Response(null,{status:404,headers});
  if(request.method!=='GET')return new Response(null,{status:405,headers:{...headers,allow:'GET'}});
  if(url.search||url.hash||request.headers.has('cookie')||request.headers.has('origin'))return Response.json({error:'SERVER_READ_ONLY'},{status:400,headers});
  const authorization=request.headers.get('authorization'),match=authorization?.match(/^Bearer ([a-f0-9]{64})$/);
  if(!match||!timingSafeEqual(Buffer.from(match[1],'hex'),expected))return Response.json({error:'SERVER_READ_REQUIRED'},{status:401,headers});
  return undefined;
 };
}
export function createServerCatalogHandler(options:{siteOrigin:string;readKey:string;storage:PublishedCatalogStorage;load:()=>Promise<unknown>;now?:()=>number}){
 const access=createServerCatalogAccess(options.siteOrigin,options.readKey),read=createBoundedPublishedCatalogSnapshot(options.storage,options.load,options.now);
 return async(request:Request):Promise<Response>=>{
  const denied=access(request);if(denied)return denied;
  try{const snapshot=await read();if(clock(options.now??Date.now)>=snapshot.validUntil)return fail();return Response.json(snapshot.payload,{headers:{...headers,'x-misoca-catalog-valid-until':String(snapshot.validUntil)}});}
  catch(error){return error instanceof ReadBudgetExceeded
   ?Response.json({error:'SITE_CATALOG_READ_BUDGET'},{status:429,headers:{...headers,'retry-after':String(error.seconds)}})
   :Response.json({error:'SITE_CATALOG_UNAVAILABLE'},{status:503,headers});}
 };
}

/** Bound server-to-server transport for the existing website consumer. It
 * cannot forward this key to arbitrary origins, redirects or other methods.
 */
export function createServerCatalogTransport(send:typeof fetch,endpoint:string,readKey:string):typeof fetch{
 let url:URL;try{url=new URL(endpoint);}catch{return fail();}
 if(typeof send!=='function'||url.protocol!=='https:'||url.username||url.password||url.pathname!=='/api/site-products/catalog'||url.search||url.hash||!keySchema.safeParse(readKey).success)return fail();
 return async(input,init)=>{
  if((typeof input!=='string'&&!(input instanceof URL))||String(input)!==url.href||init?.method!=='GET'||init.credentials!=='omit'||init.redirect!=='manual'||init.cache!=='no-store'
   ||Object.keys(init).some(key=>!['method','credentials','redirect','cache','signal'].includes(key)))return fail();
  return send(url.href,{...init,headers:{authorization:'Bearer '+readKey}});
 };
}
