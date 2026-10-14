import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const moduleFile=new URL("../administrator/js/learning-lab.js",import.meta.url);
const htmlFile=new URL("../administrator/index.html",import.meta.url);
const cssFile=new URL("../administrator/css/learning-lab.css",import.meta.url);
const source=fs.readFileSync(moduleFile,"utf8");
const html=fs.readFileSync(htmlFile,"utf8");
const css=fs.readFileSync(cssFile,"utf8");

class Elem {
  constructor(tag,registry){
    this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;
    this.dataset={};this.style={};this.attributes={};this.listeners={};
    this.className="";this.value="";this._text="";this._id="";this.registry=registry;
    this.classList={toggle:()=>{},add:()=>{},remove:()=>{}};
  }
  set id(v){this._id=v;this.registry.set(v,this);}
  get id(){return this._id;}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent||"").join("");}
  append(...children){for(const x of children){
    if(x.parentNode){const index=x.parentNode.children.indexOf(x);if(index>=0)x.parentNode.children.splice(index,1);}
    x.parentNode=this;this.children.push(x);
  }}
  replaceChildren(...children){this.children.forEach(x=>x.parentNode=null);this.children=[];this._text="";this.append(...children);}
  insertBefore(node,ref){
    const idx=this.children.indexOf(ref);assert.ok(idx>=0);
    if(node.parentNode){const old=node.parentNode.children.indexOf(node);if(old>=0)node.parentNode.children.splice(old,1);}
    this.children.splice(idx,0,node);node.parentNode=this;
  }
  setAttribute(k,v){this.attributes[k]=String(v);}
  addEventListener(name,fn){this.listeners[name]=fn;}
  fire(name,extra={}){this.listeners[name]?.({preventDefault(){},...extra});}
  querySelectorAll(selector){
    const results=[];
    function walk(node){
      for(const child of node.children){
        if(selector==="[data-lab-asset]"&&child.dataset.labAsset)results.push(child);
        walk(child);
      }
    }
    walk(this);return results;
  }
}
function boot(query="?surface=trader"){
  const registry=new Map(),legacy=new Elem("details",registry),parent=new Elem("section",registry);
  legacy.id="traderOkbCaseStudy";parent.append(legacy);
  const graphTitle=new Elem("strong",registry);graphTitle.id="atlasChartInsightOverlayTitle";
  const top5Button=new Elem("button",registry);top5Button.id="btnChartTop5";
  top5Button.active=false;top5Button.classList.contains=name=>name==="active"&&top5Button.active;
  const storage=new Map();
  const doc={
    readyState:"complete",
    createElement:tag=>new Elem(tag,registry),
    getElementById:id=>registry.get(id)||null,
    addEventListener(){},
    documentElement:{}
  };
  const sandbox={
    location:{search:query},document:doc,URLSearchParams,Intl,Date,Number,String,JSON,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},
    window:{},MutationObserver:class{observe(){}},console
  };
  vm.runInNewContext(source,sandbox,{timeout:1000});
  return {registry,legacy,parent,sandbox,storage,graphTitle,top5Button,
          get:id=>registry.get(id)};
}
test("Trader HTML mounts only the isolated lab, with no new account capability",()=>{
  assert.match(html,/css\/learning-lab\.css/);
  assert.match(html,/js\/learning-lab\.js/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(source,/XMLHttpRequest|sendOrder|placeOrder|privateKey|API_SECRET/i);
  assert.match(source,/fetch\(CATALOG_PATH,\{credentials:"omit",cache:"no-cache"\}\)/);
});
test("Administrator never mounts or displaces the BTC report",()=>{
  const t=boot("?surface=administrator");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab,undefined);
  assert.equal(t.legacy.parentNode,t.parent);
});
test("Trader mounts a single report and changes educational dossier without placing orders",()=>{
  const t=boot();
  const lab=t.get("agentCryptoLearningLab"),api=t.sandbox.window.AgentCryptoLearningLab;
  assert.ok(lab);
  assert.equal(t.legacy.parentNode.className,"lab-btc-report");
  assert.equal(api.read().asset,"BTC");
  assert.equal(api.read().real_order,false);
  api.select("CT");
  assert.equal(api.read().asset,"CT");
  assert.match(t.get("lab-content").textContent,/CT\/USDT/);
  assert.match(t.get("lab-content").textContent,/CT\/USDC/);
  assert.equal(t.legacy.style.display,"none");
  api.select("Q");
  assert.equal(api.read().asset,"Q");
  api.select("BTC");
  assert.equal(t.legacy.style.display,"");
});
test("Follow mode does not interpret a Top 5 comparison as a single crypto",()=>{
  const t=boot(),lab=t.get("agentCryptoLearningLab");
  lab.open=true;t.graphTitle.textContent="TOP 5 · 24h · BTC/ETH/BNB";
  t.get("lab-mode-toggle").fire("click");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().mode,"follow");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().asset,"BTC");
  t.graphTitle.textContent="CT · Concrete · 7j · prix USD";
  // Retoggle mode twice to exercise the read-only market sync.
  t.get("lab-mode-toggle").fire("click");
  t.get("lab-mode-toggle").fire("click");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().asset,"CT");
});
test("an old BTC headline cannot override CT while Top 5 remains active",()=>{
  const h=boot(),api=h.sandbox.window.AgentCryptoLearningLab;
  api.select("CT");
  h.get("agentCryptoLearningLab").open=true;
  h.graphTitle.textContent="BTC · Bitcoin · 24h prix USD historique conservé";
  h.top5Button.active=true;
  h.get("lab-mode-toggle").fire("click");
  assert.equal(api.read().mode,"follow");
  assert.equal(api.read().asset,"CT");
  h.top5Button.active=false;
  h.get("lab-mode-toggle").fire("click");
  h.get("lab-mode-toggle").fire("click");
  assert.equal(api.read().asset,"BTC");
});
test("The journal contains no bundled account balances or private bridge data",()=>{
  assert.doesNotMatch(source,/9[,.]99\s*CT|3[,.]522\s*USDC|0[,.]3525526|CT\-USDC.*9,99/);
  assert.match(source,/real_order:false/);
  assert.match(source,/localStorage\.setItem/);
  assert.match(source,/textContent/);
});
