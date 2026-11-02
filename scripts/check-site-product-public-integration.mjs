// Clean public-main integration only: pinned existing dependencies, no secrets/providers.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,symlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const base='/Volumes/KINGSTON/AI-Team-Work/01a06025-41fb-7471-8f77-7596451fbaf8/';
assert.ok(process.cwd().startsWith(base+'site-product-public-integration-')&&process.cwd().endsWith('/source'));
const dependencies=base+'disclosure-local-deps-881c9b4a16/source';
const hash=b=>createHash('sha256').update(b).digest('hex');
const expectedLock='9b391302a58741a640a6f64fe24d5409f4987f3638f0dce9cecc2c1a4f58449c';
assert.equal(hash(readFileSync('package-lock.json')),expectedLock);
assert.equal(hash(readFileSync(dependencies+'/package-lock.json')),expectedLock);
const lock=JSON.parse(readFileSync('package-lock.json')),pkg=JSON.parse(readFileSync('package.json'));
for(const name of Object.keys({...pkg.dependencies,...pkg.devDependencies}))assert.equal(JSON.parse(readFileSync(dependencies+'/node_modules/'+name+'/package.json')).version,lock.packages['node_modules/'+name].version,name);
symlinkSync(dependencies+'/node_modules',resolve('node_modules'));
const env={...Object.fromEntries(['PATH','HOME','TMPDIR','TMP','TEMP','NODE_COMPILE_CACHE','npm_config_cache'].filter(k=>process.env[k]).map(k=>[k,process.env[k]])),NEXT_TELEMETRY_DISABLED:'1'};
const manifest=JSON.parse(readFileSync('../workspace.json')).manifest.files;
const proof={at:new Date().toISOString(),passed:false,baseline:'18e5cd0e7d32da6b76e33c512cf8d51a1048ba46',lock:expectedLock,productionChanged:false,realMailSent:false,remoteBindings:false,inputs:manifest.map(f=>({path:f.path,sha256:hash(readFileSync(f.path))})),checks:[]};
const steps=[['route-types',process.execPath,['node_modules/next/dist/bin/next','typegen']],['full-tests','npm',['test','--','--maxWorkers=1']],['full-typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--incremental','false']],['production-build','npm',['run','build','--','--webpack']]];
for(const[name,command,args]of steps){const result=spawnSync(command,args,{env,encoding:'utf8',timeout:240000,maxBuffer:5000000});writeFileSync('../evidence/'+name+'.txt',(result.stdout??'')+(result.stderr??''));proof.checks.push({name,exit:result.status,signal:result.signal});console.log(JSON.stringify(proof.checks.at(-1)));if(result.status!==0)break;}
proof.inputsUnchanged=proof.inputs.every(f=>hash(readFileSync(f.path))===f.sha256);
proof.passed=proof.inputsUnchanged&&proof.checks.length===steps.length&&proof.checks.every(c=>c.exit===0);
writeFileSync('../evidence/public-integration.json',JSON.stringify(proof,null,2));if(!proof.passed)process.exitCode=1;
