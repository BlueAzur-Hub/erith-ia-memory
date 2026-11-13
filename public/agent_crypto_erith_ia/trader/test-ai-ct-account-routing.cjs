'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const nodePath=require('node:path');
const root=__dirname;
const account=fs.readFileSync(nodePath.join(root,'trader-okx-account.js'),'utf8');
const ai=fs.readFileSync(nodePath.join(root,'ai-ct-panel.js'),'utf8');
const route=account.split('p.querySelector("[data-okx-analyze-ct]")?.addEventListener("click",async()=>{')[1]
  ?.split('p.querySelector("[data-okx-auth]")?.addEventListener')[0]||'';
const inline=ai.split('async function readForAccount(target){')[1]
  ?.split('const lesson=panel.querySelector')[0]||'';
test('analyze CT from OKX account stays locally without graph scroll or state switch',()=>{
 assert.ok(route.length>100,'CTA account route exists');
 assert.match(route,/target.hidden=false/);
 assert.match(route,/await ai.readForAccount\(target\)/);
 assert.doesNotMatch(route,/scrollIntoView|scrollTo|detailPanelToggle|ai\.open|window\.location|atlasSelectMarketCoin|aiCtRead.*click\(/);
});
test('existing CT gateway is called once for inline account brief, no technical panel repaint',()=>{
 assert.ok(inline.length>100);
 assert.match(inline,/const doc=await loadCtEvidence\(\)/);
 assert.match(inline,/model\.explain\(doc,chart\)/);
 assert.match(inline,/showEvidence\(target,doc\)/);
 assert.match(inline,/showFullReport\(target,report\)/);
 assert.doesNotMatch(inline,/paint\(doc\)|scrollIntoView|detailPanelToggle|\.open\s*=\s*true/);
 assert.equal((ai.match(/BACKEND\+'\/market-book\?provider=okx&instrument=CT-USDC&limit=100'/g)||[]).length,1);
});
test('inline private CT text is hidden on owner logout and denied on lost session',()=>{
 assert.match(account,/function logoutBridge\(\)\{[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(account,/error\?\.status===401[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(ai,/sessionStorage\.getItem\(TOKEN_KEY\)!==session/);
 assert.match(ai,/!target\.isConnected\|\|target\.hidden/);
});
test('CT inline view exists in the current OKX panel, before position table',()=>{
 assert.match(account,/data-okx-ctreading hidden role="status" aria-live="polite"/);
 assert.match(account,/#traderOkxAccountPanel \.okx-ct-reading\[hidden\]\{display:none!important\}/);
});

test('under-minimum CT may open official OKX Convert manually without sending any order',()=>{
 const links=account.match(/<a class="okx-convert-link"[^>]+>Convertir mes CT sur OKX ↗<\/a>/g)||[];
 assert.equal(links.length,1);
 const link=links[0];
 assert.match(link,/href="https:\/\/www\.okx\.com\/fr-fr\/trade-convert"/);
 assert.match(link,/target="_blank"/);
 assert.match(link,/rel="noopener noreferrer"/);
 assert.doesNotMatch(link,/\b(onclick|authorization|token|amount|sz|qty|instId)=/i);
});
test('Convert warns about manual confirmation and potential spread, not zero guaranteed costs',()=>{
 assert.match(account,/À sélectionner manuellement sur OKX \(CT → USDC\)/);
 assert.match(account,/Vérifie le devis, son délai et le spread possible/);
 assert.doesNotMatch(account,/function\s+convertCtOrder\s*\(/);
});

const vm=require('node:vm');
function ctReadHarness(){
 const start=ai.indexOf('async function refresh(){');
 const end=ai.indexOf("const lesson=panel.querySelector('#aiCtLesson');",start);
 assert.ok(start>0&&end>start);
 const handlers=ai.slice(start,end);
 const body={childNodes:[],replaceChildren(...nodes){this.childNodes=nodes;}};
 let currentToken='OWNER_A',currentRole='owner',fault=null;
 const states=[],reads=[];
 const makeTarget=()=>({
  childNodes:[],isConnected:true,hidden:false,
  closest:()=>({}),
  replaceChildren(...nodes){this.childNodes=nodes;},
  prepend(node){this.childNodes.unshift(node);},
  append(node){this.childNodes.push(node);}
 });
 const target=makeTarget();
 const ctx={
  latest:null,latestSession:null,ctInlineSessions:new WeakMap(),
  copy:{disabled:true},read:{disabled:false},body,
  sessionStorage:{getItem:key=>key.includes('token')?currentToken:currentRole},
  TOKEN_KEY:'agent_crypto_bridge_owner_token_v1',
  ROLE_KEY:'agent_crypto_local_access_session_v1',
  state:message=>states.push(message),
  getDoc:()=>{},
  async loadCtEvidence(){
   if(fault)throw new Error(fault);
   return {id:reads.push('read')};
  },
  paint(doc){body.replaceChildren({value:'CT report '+doc.id});},
  ensureCtOrderTicket:async()=>true,
  document:{createElement:()=>({
   textContent:'',setAttribute(){},className:''
  })},
  model:{publicCandles:()=>null,explain:()=>({lines:[]})},
  globalThis:{AgentCryptoMarketMicroscope:{snapshot:()=>null},AgentCryptoCtOrderTicket:{mount(){}}},
  showEvidence:(dest,doc)=>dest.append({value:'CT inline '+doc.id}),
  showFullReport:(dest)=>dest.append({value:'CT report details'}),
  WeakMap,Date,Boolean,String,Error
 };
 const out=vm.runInNewContext(handlers+';({refresh,readForAccount})',ctx);
 return {...out,ctx,body,target,states,
  setFault:e=>{fault=e;},
  setSession:(role,token)=>{currentRole=role;currentToken=token;}};
}
test('CT technical last verified DOM survives a failed refresh in one owner session',async()=>{
 const h=ctReadHarness();
 await h.refresh();
 const previous=h.body.childNodes[0];
 h.setFault('Bridge unavailable');
 await h.refresh();
 assert.equal(h.body.childNodes[0],previous,'exact same report nodes are retained');
 assert.match(h.states.at(-1),/RAPPORT PRÉCÉDENT, NON ACTUEL/);
 assert.equal(h.ctx.copy.disabled,false);
 assert.equal(h.ctx.read.disabled,false);
});
test('CT technical prior report is cleared on owner-session loss, not carried to new owner',async()=>{
 const h=ctReadHarness();
 await h.refresh();
 h.setSession('guest',null);
 h.setFault('Bridge unavailable');
 await h.refresh();
 assert.equal(h.body.childNodes.length,0);
 assert.equal(h.ctx.copy.disabled,true);
 assert.match(h.states.at(-1),/Session Aether Trust non liée/);
});
test('CT inline report is only replaced after successful reading and remains labeled stale on failure',async()=>{
 const h=ctReadHarness();
 assert.equal(await h.readForAccount(h.target),true);
 const prior=h.target.childNodes.filter(n=>n.value);
 assert.equal(prior.length,2);
 h.setFault('Timed out');
 assert.equal(await h.readForAccount(h.target),false);
 assert.equal(h.target.childNodes[1],prior[0]);
 assert.equal(h.target.childNodes[2],prior[1]);
 assert.match(h.target.childNodes[0].textContent,/NON ACTUELLE/);
});
test('CT inline private DOM is never retained across session revocation',async()=>{
 const h=ctReadHarness();
 assert.equal(await h.readForAccount(h.target),true);
 h.setSession('guest',null);
 h.setFault('No authorized session');
 assert.equal(await h.readForAccount(h.target),false);
 assert.equal(h.target.childNodes.length,0);
});
test('CT owner logout listener still explicitly erases all private CT views',()=>{
 assert.match(ai,/aether-trust:logout-requested[\s\S]{0,200}latest=null;latestSession=null;copy.disabled=true;body.replaceChildren\(\)/);
 assert.match(ai,/local.hidden=true;local.replaceChildren\(\)/);
});
