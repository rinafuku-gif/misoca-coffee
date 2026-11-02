import {z} from 'zod';
import {siteProductSourceSchema,type SiteProductSource} from './site-product-view';
import {boundedExternal} from './ledger/timeout';

export const SITE_PRODUCT_SOURCE_REUSE_MS=15000;
const rows=z.array(siteProductSourceSchema).max(500);
type Entry={credential:string;at:number;data:readonly SiteProductSource[]|null;pending:Promise<readonly SiteProductSource[]>|null};
const unavailable=():never=>{throw Error('SITE_SOURCE_UNAVAILABLE');};
/** Reference data only: NEVER an identity, role, revocation, permission,
 * current CMS visibility, schema readiness, or write-authorization cache.
 * Native read/draft permission must already have passed on every request.
 * Four actors at most; token rotation cannot serve an old token's result.
 * No errors, partial reads, expired data or stale-on-error fallback retained.
 */
export function createSiteProductSourceCache(clock:()=>number=()=>performance.now()){
 const entries=new Map<string,Entry>();
 return{async read(credential:unknown,actorId:string,load:()=>Promise<readonly SiteProductSource[]>):Promise<readonly SiteProductSource[]>{
  if(typeof credential!=='string'||credential.length<16||credential.length>5120||typeof actorId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(actorId))return unavailable();
  const now=clock();if(!Number.isFinite(now))return unavailable();
  let entry=entries.get(actorId);
  if(entry&&entry.credential===credential){
   if(entry.pending){try{return structuredClone(await entry.pending);}catch{return unavailable();}}
   if(entry.data&&now>=entry.at&&now-entry.at<SITE_PRODUCT_SOURCE_REUSE_MS)return structuredClone(entry.data);
  }
  if(entry?.pending)return unavailable();
  if(entry)entries.delete(actorId);
  if(entries.size>=4){const candidate=[...entries].filter(([,value])=>!value.pending).sort((a,b)=>a[1].at-b[1].at)[0];if(!candidate)return unavailable();entries.delete(candidate[0]);}
  entry={credential,at:now,data:null,pending:null};entries.set(actorId,entry);const current=entry;
  current.pending=boundedExternal(async()=>{
   const raw=await load();if(!Array.isArray(raw)||raw.length>500||new TextEncoder().encode(JSON.stringify(raw)).byteLength>2_000_000)return unavailable();
   const data=rows.parse(raw);if(new Set(data.map(row=>row.sourceId)).size!==data.length)return unavailable();
   return data;
  },25000);
  try{
   const data=await current.pending,at=clock();if(!Number.isFinite(at))return unavailable();
   if(entries.get(actorId)===current){current.data=structuredClone(data);current.at=at;current.pending=null;}
   return structuredClone(data);
  }catch{if(entries.get(actorId)===current)entries.delete(actorId);return unavailable();}
 }};
}
