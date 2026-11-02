// Reuse the verified external Next build; do not copy a build or credentials.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,watch} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
const base='/Volumes/KINGSTON/AI-Team-Work/01a06025-41fb-7471-8f77-7596451fbaf8/';
assert.ok(process.cwd().startsWith(base+'site-product-shop-browser-')&&process.cwd().endsWith('/source'));
const prior=base+'site-product-public-integration-0450258803',proof=JSON.parse(readFileSync(prior+'/evidence/public-integration.json')),work=JSON.parse(readFileSync(prior+'/workspace.json'));
assert.equal(proof.passed,true);assert.equal(work.state,'closed');assert.equal(work.exitCode,0);
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of work.manifest.files)assert.equal(hash(readFileSync(prior+'/source/'+f.path)),f.sha256,'BUILD_INPUT_CHANGED:'+f.path);
const file=resolve('../cache/dummy-catalog.json'),id=n=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,'0')}`;writeFileSync(file,JSON.stringify({sourceIds:[id(1),id(2)]}),{flag:'wx'});
const env={...Object.fromEntries(['PATH','HOME','TMPDIR','TMP','TEMP','NODE_COMPILE_CACHE'].filter(k=>process.env[k]).map(k=>[k,process.env[k]])),NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_BASE_URL:'http://127.0.0.1:4346',MISOCA_SITE_VISIBILITY_AUTHORITY:'emdash',MISOCA_SITE_PRODUCT_INDEX_URL:'https://management.example.invalid/api/site-products/index',NOTION_DATABASE_ID:'db3bf889-2b85-44cf-9cb5-0c8403d283c9',NOTION_JOURNAL_DB_ID:'cccccccc-cccc-4ccc-8ccc-000000000001',NOTION_API_KEY:'ntn_fake_browser_only_12345678901234567890',MISOCA_DUMMY_CATALOG_FILE:file};
const child=spawn(process.execPath,['--import',resolve('scripts/website-provider-preload.mjs'),prior+'/source/node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4346'],{cwd:prior+'/source',env,stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',v=>{if(log.length<500000)log+=v;});child.stderr.on('data',v=>{if(log.length<500000)log+=v;});
const result={at:new Date().toISOString(),passed:false,syntheticOnly:true,productionChanged:false,realProviderCalls:0,reusedBuild:prior,reusedBuildProof:hash(readFileSync(prior+'/evidence/public-integration.json')),cases:[]};
const get=()=>fetch('http://127.0.0.1:4346/api/products',{cache:'no-store',signal:AbortSignal.timeout(10000)});
try{
 let response;const deadline=Date.now()+30000;while(Date.now()<deadline){if(child.exitCode!==null)throw Error('SERVER_EXITED');try{response=await get();break;}catch{await new Promise(done=>setTimeout(done,200));}}
 assert.equal(response?.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const rows=await response.json();assert.deepEqual(rows.map(p=>p.id),[id(1),id(2)]);assert.equal(rows[1].price,null);assert.equal(rows[0].inStock,false);result.cases.push('actual-next-http-provider-selection-and-null-price');
 writeFileSync(file,JSON.stringify({sourceIds:[id(1)]}));const hidden=await get();assert.equal(hidden.status,200);assert.deepEqual((await hidden.json()).map(p=>p.id),[id(1)]);result.cases.push('next-http-hide-with-warm-reference-cache');
 writeFileSync(file,JSON.stringify({sourceIds:[id(1),id(2)]}));writeFileSync('../evidence/browser-ready.json',JSON.stringify({url:'http://127.0.0.1:4346/shop',syntheticOnly:true},null,2));
 await new Promise(done=>{const finish=()=>{clearTimeout(timer);watcher.close();done();},watcher=watch(resolve('../evidence'),(_event,name)=>{if(String(name)!=='browser-stop.json')return;try{if(JSON.parse(readFileSync('../evidence/browser-stop.json')).stop===true)finish();}catch{}}),timer=setTimeout(finish,10*60*1000);});
 const counts=JSON.parse(readFileSync('../evidence/provider-counts.json'));assert.equal(counts.unexpected,0);result.providerCounts=counts;
 for(const f of work.manifest.files)assert.equal(hash(readFileSync(prior+'/source/'+f.path)),f.sha256,'BUILD_INPUT_CHANGED_AFTER_SERVER:'+f.path);
 result.passed=true;
}catch{result.failure='LOCAL_SHOP_BROWSER_UNCONFIRMED';process.exitCode=1;}
finally{
 if(child.exitCode===null&&child.signalCode===null){child.kill('SIGTERM');await new Promise(done=>{if(child.exitCode!==null||child.signalCode!==null)return done();const timer=setTimeout(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');done();},3000);child.once('exit',()=>{clearTimeout(timer);done();});});}
 writeFileSync('../evidence/next-server.txt',log);writeFileSync('../evidence/site-product-shop-browser.json',JSON.stringify(result,null,2));
}
