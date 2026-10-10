import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root="public/agent_crypto_erith_ia/";
const js=fs.readFileSync(root+"administrator/js/top250-history-catalog.js","utf8");
const dir=root+"data/historical_archive_prototype/";
const fixtures=new Map([
 ["top250_multisource_coverage/index.json",JSON.parse(fs.readFileSync(dir+"top250_multisource_coverage/index.json","utf8"))],
 ["top250_history_catalog/index.json",JSON.parse(fs.readFileSync(dir+"top250_history_catalog/index.json","utf8"))],
 ["bitget_verified_views/index.json",JSON.parse(fs.readFileSync(dir+"bitget_verified_views/index.json","utf8"))],
 ["year_depth_index.json",JSON.parse(fs.readFileSync(dir+"year_depth_index.json","utf8"))]
]);
const base="https://blueazur-hub.github.io",path="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/";
function harness(mutate=()=>{}){
 const nodes=new Map(),requests=[],events=[];
 function element(id){
  if(nodes.has(id))return nodes.get(id);
  const listener={};
  const el={id,tagName:id,textContent:"",value:id==="top250-limit"?"250":"",checked:false,
   children:[],append(...items){this.children.push(...items)},
   replaceChildren(...items){this.children=[...items]},
   addEventListener(name,fn){listener[name]=fn},
   setAttribute(){},
   dispatch(name){return listener[name]?.()},
   get innerText(){return this.textContent}};
  nodes.set(id,el);return el;
 }
 const document={
  currentScript:{src:base+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/top250-history-catalog.js"},
  getElementById:element,
  createDocumentFragment:()=>element("fragment"+nodes.size),
  createElement:tag=>element("created-"+tag+"-"+nodes.size),
  dispatchEvent:event=>{events.push(event);return true}
 };
 const fetchMock=async uri=>{
  const url=new URL(uri);
  assert.equal(url.origin,base);
  assert.ok(url.pathname.startsWith(path));
  const id=url.pathname.slice(path.length);
  assert.ok(fixtures.has(id),"Unknown catalog "+id);
  requests.push(id);
  const data=structuredClone(fixtures.get(id));mutate(id,data);
  return new Response(JSON.stringify(data),{status:200});
 };
 const window={};
 vm.runInNewContext(js,{window,document,fetch:fetchMock,
   location:{origin:base},URL,Response,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}}},
   {timeout:5000});
 return {window,nodes,element,requests,events};
}
async function ready(h){
 for(let i=0;i<50;i++){
  if(!h.element("top250-status").textContent.includes("Contrôle des index"))return;
  await new Promise(resolve=>setImmediate(resolve));
 }
 throw Error("Timed out while loading the verified Top250");
}
test("single Top250 uses authentic Binance plus Bitget count and year-depth separately",async()=>{
 const h=harness();await ready(h);
 const f=fixtures.get("top250_multisource_coverage/index.json");
 const d=fixtures.get("year_depth_index.json");
 const result=h.window.SevenTop250Catalog.read();
 assert.ok(result,"Expected fully validated federated catalog: "+h.element("top250-status").textContent);
 assert.equal(result.archived_assets,f.archived_assets);
 assert.equal(result.binance_archived_assets+result.bitget_archived_assets,f.archived_assets);
 assert.equal(h.requests.length,4);
 assert.match(h.element("top250-title").textContent,/Binance \+ Bitget/);
 assert.match(h.element("top250-counts").textContent,/Top 250/);
 assert.ok(h.element("top250-summary").children.length>0);
 assert.ok(d.assets_with_at_least_12_consecutive_closed_months<=f.archived_assets);
 assert.equal(result.assets.length,250);
});
test("a forged Bitget month cannot silently inflate federated count",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_multisource_coverage/index.json"){
   const bitget=data.assets.find(x=>x.source?.startsWith("Bitget"));
   bitget.months+=1;bitget.native_1m_count+=43200;
   data.native_1m_candles+=43200;
  }
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Vérification refusée/);
});
test("Binance and Bitget sources remain distinct rather than fabricated exchanges",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_multisource_coverage/index.json")
   data.binance_archived_assets+=1;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Vérification refusée/);
});
test("the canonical vault mounts both verified readers without editing Trader",()=>{
 const html=fs.readFileSync(root+"administrator/historical-vault.html","utf8");
 assert.match(html,/id="top250-rows"/);
 assert.match(html,/id="shared-month-reader"/);
 assert.match(html,/id="vault-yearly-inline"/);
 assert.match(html,/src="\.\/js\/historical-yearly-browser\.js"/);
 assert.match(html,/src="\.\/js\/shared-historical-view\.js"/);
 assert.match(html,/id="vault-year-rows"/);
});

test("an older independently verified year-depth index never hides newly archived coins",async()=>{
 const h=harness((file,data)=>{
  if(file==="year_depth_index.json"){
   data.archive_assets=104;
   data.source_catalog_minutes=83676960;
  }
 });
 await ready(h);
 const result=h.window.SevenTop250Catalog.read();
 assert.ok(result,"Historical year-depth lag must not hide the verified Top250: "+
   h.element("top250-status").textContent);
 assert.equal(result.archived_assets,fixtures.get("top250_multisource_coverage/index.json").archived_assets);
 assert.match(h.element("top250-status").textContent,/index annuel en synchronisation/);
});
test("a future or impossible year-depth source is still rejected",async()=>{
 const h=harness((file,data)=>{
  if(file==="year_depth_index.json")data.source_catalog_minutes=9999999999999;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Vérification refusée/);
});
