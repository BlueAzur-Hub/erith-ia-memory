'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'ai-asset-reading-view.js'),'utf8');
const runtime=fs.readFileSync(path.join(__dirname,'technical-reading-data-sync.js'),'utf8');
const mirror=fs.readFileSync(path.join(__dirname,'trader-runtime-mirror.js'),'utf8');
const entry=fs.readFileSync(path.join(__dirname,'trading-desk.html'),'utf8');
const administrator=fs.readFileSync(path.join(__dirname,'../administrator/index.html'),'utf8');
const account=fs.readFileSync(path.join(__dirname,'trader-okx-account.js'),'utf8');
const ctBefore=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
class Fake {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];
  this.attributes={};this.parent=null;this.listeners={};this.hidden=false;
  this.open=false;this.className='';this.id='';this.dataset={};this.ownText='';}
 set textContent(v){this.ownText=String(v??'');this.children=[];}
 get textContent(){return this.ownText+this.children.map(v=>v?.textContent||'').join('');}
 append(...args){for(let x of args){if(typeof x==='string')x=new FakeText(x);
    this.children.push(x);x.parent=this;} }
 prepend(x){this.children.unshift(x);x.parent=this;}
 replaceChildren(...args){this.children=[];this.ownText='';this.append(...args);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 fire(type){for(const fn of this.listeners[type]||[])fn({type,target:this});}
 insertAdjacentElement(where,x){if(!this.parent)throw Error('No parent for '+this.id);
   const i=this.parent.children.indexOf(this);
   this.parent.children.splice(i+(where==='afterend'?1:0),0,x);x.parent=this;}
}
class FakeText{constructor(value){this.textContent=value;this.parent=null;}}
function setup(){
 const root=new Fake('div'),host=new Fake('div'),ct=new Fake('details'),nav=new Fake('nav');
 ct.id='aiCtPanel';ct.textContent='CT private untouched marker';ct.open=true;
 root.append(host,nav);host.append(ct);
 const elements=[root,host,ct];
 const document={baseURI:'https://example.invalid/public/agent_crypto_erith_ia/trader/trading-desk.html',
  head:new Fake('head'),createElement:tag=>new Fake(tag),
   querySelector:sel=>sel==='#accueil .atlas-v2-nav-essential'?nav:null,
  createTextNode:value=>new FakeText(String(value)),
  getElementById:id=>id==='detailPanelBody'?host:id==='aiCtPanel'?ct:
     id==='sevenAssetReading'?host.children.find(x=>x.id===id)||null:null};
 const listeners={};
 const window={addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn);},
  fire:(name)=>{for(const fn of listeners[name]||[])fn({type:name});}};
 const now=new Date().toISOString();
 let coin={id:'bitcoin',symbol:'BTC',name:'Bitcoin',priceUsd:82692,
  change24h:1.25,usdSource:'CoinGecko',usdUpdatedAt:now};
 let chart={mode:'candles',loadedInstrument:'BTC-USDC',loadedBar:'5m',
  rows:[{o:82600,h:82700,l:82500,c:82650,v:12}]};
 let privateWait=null,listing=null,live=null,external=null;
 const owner={
  ticketReadOnly:(pair)=>new Promise(resolve=>{if(!privateWait)privateWait={};
    privateWait.account={pair,resolve};}),
  basePositionReadOnly:(pair)=>new Promise(resolve=>{if(!privateWait)privateWait={};
    privateWait.position={pair,resolve};})
 };
 const globals={document,window,URL,Date,Number,String,Object,Array,
   console,queueMicrotask:fn=>fn(),
   AgentCryptoAiAssetReading:require('./ai-asset-reading-core.js'),
   AgentCryptoTraderMarket:{selected:()=>coin},
   AgentCryptoMarketMicroscope:{snapshot:()=>chart,technicalLevels:()=>null},
    AgentCryptoNewListingsNativeCategory:{snapshot:()=>listing},
    AgentCryptoNewListingLiveAsset:{snapshot:()=>live},
    AtlasExternalChart:{state:()=>external},
   AgentCryptoTraderOkxAccount:owner};
 globals.globalThis=globals;
 vm.runInNewContext(code,globals,{filename:'ai-asset-reading-view.js'});
 const panel=document.getElementById('sevenAssetReading');
 const descendants=(node)=>[node,...(node.children||[]).flatMap(descendants)];
 const byText=(x)=>descendants(panel).find(n=>n.tagName==='BUTTON'&&n.textContent.includes(x));
 const heading=()=>descendants(panel).find(x=>x.className==='seven-asset-title')?.textContent||'';
 const statuses=()=>descendants(panel).filter(x=>x.className==='seven-asset-card').map(x=>x.textContent);
 return {panel,ct,host,nav,window,owner,globals,byText,heading,statuses,
  quick:()=>nav.children.find(x=>x.id==='aiSevenToggle'),
  select:(id,symbol,instr)=>{
   live={active:false};listing={selectedId:null};external={active:false};
   coin={id,symbol,name:symbol,priceUsd:2443,usdSource:'CoinGecko',usdUpdatedAt:now};
   chart={...chart,loadedInstrument:instr||symbol+'-USDC'};
   window.fire('agent-crypto:trader-selection-changed');
  },
  externalSelect:(args={})=>{
   const id=args.id||'bitget:dnausdt',symbol=args.symbol||'DNA',quote='USDT';
   coin={id:'concrete',symbol:'CT',name:'Concrete'};
   chart={...chart,loadedInstrument:args.chartPair||'DNA-USDT'};
   listing={selectedId:id,selectedSymbol:symbol,selectedProvider:'bitget',
     selectedProviderSymbol:'DNAUSDT',selectedPair:args.categoryPair||'DNA/USDT'};
   live={active:true,id,base:symbol,symbol,quote,provider:'bitget',readOnly:true,
     instrument:symbol+'-'+quote,providerSymbol:'DNAUSDT',name:'DNA',
     marketTicker:{lastPrice:0.237531,quoteCurrency:'USDT',timestamp:now,change24h:4.63}};
   external={active:true,coin_id:id,loading:false,error:null};
   window.fire('agent-crypto:new-listing-line-ready');
  },settle:(account,position)=>{
   if(!privateWait)throw Error('No private pending request');
   privateWait.account.resolve(account);privateWait.position.resolve(position);privateWait=null;
  }};
}
test('seven-section dossier appears for BTC; restored Concrete CT remains untouched',()=>{
 const v=setup();
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/BTC/);
 assert.equal(v.statuses().length,7);
 assert.equal(v.ct.textContent,'CT private untouched marker');
 assert.equal(v.ct.open,true);
 assert.equal(v.byText('Lire mon compte').type,'button');
});
test('BTC → CT → ETH → CT does not delete, hide or rewrite any CT private node',()=>{
 const v=setup();
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ct.textContent,'CT private untouched marker');
 assert.equal(v.ct.hidden,false);
 assert.equal(v.ct.open,true);
 v.select('ethereum','ETH','ETH-USDC');
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/ETH/);
 assert.doesNotMatch(v.heading(),/BTC|Concrete/);
 assert.equal(v.statuses().length,7);
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ct.textContent,'CT private untouched marker');
 assert.equal(v.ct.hidden,false);
});
test('Market BTC with CT chart cannot paint private BTC or CT details incorrectly',()=>{
 const v=setup();
 v.select('bitcoin','BTC','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ct.textContent,'CT private untouched marker');
 v.select('bitcoin','BTC','ETH-USDC');
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
 assert.equal(v.byText('Lire mon compte').disabled,true);
});
test('late private BTC result cannot paint after an ETH selection',async()=>{
 const v=setup(),b=v.byText('Lire mon compte');
 b.fire('click');v.select('ethereum','ETH','ETH-USDC');
 v.settle({instId:'BTC-USDC',read_only:true,orders_enabled:false,
  verified:true,real_orders:0,account_at_utc:new Date().toISOString(),
  trading_available_quote:'10'},
  {pair:'BTC-USDC',read_only:true,verified:true,orders_enabled:false,
   real_orders:0,trading_base:'5',funding_base:'2',
   observed_at_utc:new Date().toISOString()});
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.match(v.heading(),/ETH/);
 assert.doesNotMatch(v.statuses().join('\n'),/Trading ETH5 ETH|Funding ETH2 ETH|Trading USDC10 USDC/);
 assert.equal(v.ct.textContent,'CT private untouched marker');
});
test('Trader iframe actually loads the Technical Reading owner once; Administrator does not',()=>{
 assert.match(entry,/src="\.\/trader-runtime-mirror\.js/);
 assert.match(entry,/src="\.\.\/administrator\/index\.html\?surface=trader"/);
 assert.match(mirror,/if\(!doc\.getElementById\("traderTechnicalReadingSyncScript"\)\)/);
 assert.equal((mirror.match(/script\.id="traderTechnicalReadingSyncScript"/g)||[]).length,1);
 assert.match(mirror,/script\.src=new URL\("\.\.\/trader\/technical-reading-data-sync\.js",doc\.baseURI\)\.href/);
 assert.ok(mirror.indexOf('traderAiCtContractScript')<
           mirror.indexOf('traderTechnicalReadingSyncScript'),
           'Seven loader must not replace the original CT owner');
 assert.match(runtime,/function mountSevenDossier\(\)/);
 assert.match(runtime,/new URL\("\.\.\/trader\/ai-asset-reading-core\.js",document\.baseURI\)/);
 assert.match(runtime,/new URL\("\.\.\/trader\/ai-asset-reading-view\.js",document\.baseURI\)/);
 assert.match(runtime,/function start\(\)\{bind\(\);mountSevenDossier\(\);\}/);
 assert.doesNotMatch(administrator,/technical-reading-data-sync\.js|traderTechnicalReadingSyncScript/);
 assert.doesNotMatch(mirror,/localStorage\.|indexedDB\.|orders_enabled\s*=\s*true/);
});
test('DNA Bitget displays Seven seven-section dossier despite stale CT Market selection',()=>{
 const v=setup();v.externalSelect();
 assert.equal(v.panel.hidden,false);
 assert.equal(v.panel.open,true);
 assert.match(v.heading(),/Dossier DNA/);
 assert.equal(v.statuses().length,7);
 assert.match(v.statuses().join(' '),/0,237531 USDT/);
 assert.equal(v.byText('Lire mon compte').disabled,true);
 assert.equal(v.byText('Actualiser les sources publiques').disabled,true);
 assert.match(v.quick().textContent,/Seven · DNA/);
 assert.equal(v.quick().hidden,false);
 assert.equal(v.ct.textContent,'CT private untouched marker');
 assert.equal(v.ct.open,true);
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.panel.hidden,true);assert.equal(v.quick().hidden,true);
 assert.equal(v.ct.textContent,'CT private untouched marker');
});
test('mismatched external graph/pair never borrows account or graph from other crypto',()=>{
 const v=setup();v.externalSelect({chartPair:'ETH-USDC'});
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
 assert.equal(v.byText('Lire mon compte').disabled,true);
 v.externalSelect({categoryPair:'CT/USDT'});
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
 assert.equal(v.ct.textContent,'CT private untouched marker');
});
test('CT source files unchanged by renderer and account proof is opt-in only',()=>{
 assert.match(runtime,/traderSevenAssetCoreScript/);
 assert.match(runtime,/traderSevenAssetViewScript/);
 assert.match(code,/if\(symbol==='CT'\|\|graphBase==='CT'\)/);
 assert.match(code,/!same\(initial.identity,token\)/);
 assert.match(code,/basePositionReadOnly\(pair\)/);
 assert.match(code,/privateButton\.addEventListener\('click'/);
 assert.match(account,/async function basePositionReadOnly\(instId\)/);
 assert.match(account,/Une sous-position/);
 assert.doesNotMatch(code,/aiCtPanel\.hidden|aiCtPanel\.open|aiCtDetails|localStorage\./);
 assert.match(ctBefore,/Lire ma position CT\/USDC/);
});
