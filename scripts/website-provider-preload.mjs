// Synthetic provider transport for a loopback-only Next server. Never used
// by a production build/config. Every unrecognized outbound request is denied.
import {readFileSync,writeFileSync} from 'node:fs';
const base='/Volumes/KINGSTON/AI-Team-Work/01a06025-41fb-7471-8f77-7596451fbaf8/';
const file=process.env.MISOCA_DUMMY_CATALOG_FILE;
if(typeof file!=='string'||!file.startsWith(base+'site-product-shop-browser-')||!file.endsWith('/cache/dummy-catalog.json')||process.env.NOTION_API_KEY!=='ntn_fake_browser_only_12345678901234567890')throw Error('SYNTHETIC_PROVIDER_REQUIRED');
const state={index:0,notion:0,unexpected:0},save=()=>writeFileSync(file.replace('/cache/dummy-catalog.json','/evidence/provider-counts.json'),JSON.stringify(state));
const db='c2afe0cb-c2a6-40ab-85ce-b98d07e987d0',ds='db3bf889-2b85-44cf-9cb5-0c8403d283c9';
const id=n=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12,'0')}`;
const journal='cccccccc-cccc-4ccc-8ccc-000000000001',article='dddddddd-dddd-4ddd-8ddd-000000000001';
const coverUrl='https://prod-files-secure.s3.us-west-2.amazonaws.com/dummy-public-journal-cover.jpg';
const coverBytes=readFileSync(new URL('../public/images/experience/bean-selection.jpg',import.meta.url));
const articlePage=()=>({object:'page',id:article,archived:false,in_trash:false,parent:{type:'data_source_id',data_source_id:journal},properties:{
 'タイトル':{type:'title',title:[{plain_text:'架空の表紙つき記事'}]},'カテゴリ':{type:'select',select:{name:'お知らせ'}},'ステータス':{type:'select',select:{name:'公開'}},'公開日':{type:'date',date:{start:'2026-11-03'}},'抜粋':{type:'rich_text',rich_text:[{plain_text:'画像接続を確認するための架空の記事です。'}]},'カバー画像':{type:'files',files:[{type:'file',file:{url:coverUrl}}]},
}});
const names=['名前','エリア','農園・WS','品種','生産処理','コメント','テキスト','焙煎度合','フレーバー','地域','標高','100g豆売売価','EC販売ステータス','表示順','画像'];
const fields=Object.fromEntries(names.map((name,n)=>[name,{id:'field_'+n,name,type:name==='名前'?'title':name==='EC販売ステータス'?'status':['100g豆売売価','表示順'].includes(name)?'number':name==='画像'?'files':'rich_text'}]));
function page(n){return{object:'page',id:id(n),last_edited_time:'2026-11-03T00:00:00Z',archived:false,in_trash:false,parent:{type:'data_source_id',data_source_id:ds},properties:Object.fromEntries(Object.entries(fields).map(([name,field])=>[name,{id:field.id,type:field.type,[field.type]:field.type==='status'?{name:'完売'}:field.type==='number'?name==='表示順'?n:n===1?950:null:field.type==='files'?[]:[{type:'text',plain_text:name==='名前'?n===1?'架空の掲載豆 A':'架空の掲載豆 B':name==='コメント'?'画面検証のための架空の紹介文です。実際の商品ではありません。':name==='エリア'?'架空産地':name==='焙煎度合'?'浅煎り':''}]}]))};}
globalThis.fetch=async(input,init)=>{
 const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
 if(url.href==='https://management.example.invalid/api/site-products/index'){
  if(init?.method!=='GET'||init?.credentials!=='omit'||init?.cache!=='no-store')throw Error('DUMMY_INDEX_REQUEST_INVALID');state.index++;save();const v=JSON.parse(readFileSync(file));if(v.failure)return Response.json({error:'DUMMY_UNAVAILABLE'},{status:503});return Response.json({format:1,sourceIds:v.sourceIds},{headers:{'cache-control':'no-store'}});
 }
 if(url.origin==='https://api.notion.com'){
  state.notion++;save();
  if(url.pathname===`/v1/data_sources/${journal}/query`&&init?.method==='POST')return Response.json({object:'list',results:[articlePage()],has_more:false,next_cursor:null});
  if(url.pathname===`/v1/pages/${article}`)return Response.json(articlePage());
  if(url.pathname===`/v1/blocks/${article}/children`)return Response.json({object:'list',results:[],has_more:false,next_cursor:null});
  if(url.pathname===`/v1/databases/${db}`)return Response.json({object:'database',id:db,archived:false,in_trash:false,title:[{plain_text:'生豆リスト'}],data_sources:[{id:ds}]});
  if(url.pathname===`/v1/data_sources/${ds}`)return Response.json({object:'data_source',id:ds,archived:false,in_trash:false,parent:{type:'database_id',database_id:db},properties:fields});
  if(url.pathname===`/v1/data_sources/${ds}/query`&&init?.method==='POST'&&!Object.hasOwn(JSON.parse(init.body),'filter'))return Response.json({object:'list',results:[page(1),page(2)],has_more:false,next_cursor:null});
 }
 if(url.href===coverUrl)return new Response(coverBytes,{headers:{'content-type':'image/jpeg'}});
 state.unexpected++;save();throw Error('UNEXPECTED_SYNTHETIC_OUTBOUND');
};
