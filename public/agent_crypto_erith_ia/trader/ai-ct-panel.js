/* ERITH.IA · premier panneau de lecture commun IA/Trader, opt-in manuel. */
(()=>{'use strict';
const model=globalThis.AgentCryptoAiCtContract;
if(!model)return;
const BRIDGE='http://127.0.0.1:8787';
const BACKEND='http://127.0.0.1:8790';
const TOKEN_KEY='agent_crypto_bridge_owner_token_v1';
const ROLE_KEY='agent_crypto_local_access_session_v1';
const nav=document.querySelector('#accueil .atlas-v2-nav-essential');
const zone=document.getElementById('market-zone');
if(!nav||!zone||document.getElementById('aiCtToggle'))return;
const btn=document.createElement('button');
btn.id='aiCtToggle';btn.type='button';btn.className='atlas-quick-link';btn.textContent='IA · Concrete';
btn.setAttribute('aria-controls','aiCtPanel');btn.setAttribute('aria-expanded','false');
const template=document.createElement('template');
template.innerHTML="<section id=\"aiCtPanel\" role=\"region\" aria-label=\"Passerelle IA, pilote Concrete\" hidden>\n    <header><h2>Passerelle IA · Concrete</h2><button class=\"ai-ct-close\" type=\"button\" id=\"aiCtClose\" aria-label=\"Fermer\">×</button></header>\n    <p>Lecture privée sur ton PC · aucun ordre réel · marché CT/USDC.</p>\n    <div class=\"ai-ct-actions\"><button id=\"aiCtRead\" type=\"button\">Lire ma position CT</button><button id=\"aiCtCopy\" type=\"button\" disabled>Copier le résumé privé</button></div>\n    <p id=\"aiCtStatus\" role=\"status\" aria-live=\"polite\">Prêt · aucune consultation automatique.</p>\n    <div id=\"aiCtDetails\"></div>\n    <details class=\"ai-ct-case\">\n      <summary>Cas d’école · Concrete CT — lecture et risques</summary>\n      <p><strong>Position réelle :</strong> marché CT/USDC, quantité et frais lus via le Bridge local uniquement sur demande. Une vente fictive estimée à partir du carnet ne garantit aucun prix réel.</p>\n      <p><strong>Analyse publique :</strong> les bougies CT/USDT proviennent d’un autre marché. Elles servent au contexte, sans être assimilées au prix CT/USDC ou à une mesure de ton gain personnel.</p>\n      <p><strong>Contrôles :</strong> volatilité, volumes, liquidité, commission, fraîcheur et archives disponibles doivent être qualifiés. Aucune recommandation ni ordre automatique.</p>\n    </details>\n  </section>";
const panel=template.content.firstElementChild;
const body=panel.querySelector('#aiCtDetails'),status=panel.querySelector('#aiCtStatus');
const read=panel.querySelector('#aiCtRead'),copy=panel.querySelector('#aiCtCopy'),close=panel.querySelector('#aiCtClose');
nav.appendChild(btn);
const history=zone.querySelector('#traderVerifiedHistory');
if(history)zone.insertBefore(panel,history);else zone.appendChild(panel);
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.id='aiCtNativeStyle';
sheet.href=new URL('../trader/ai-ct-panel.css?scope=native',document.baseURI).href;
document.head.appendChild(sheet);
let latest=null;
function state(message){status.textContent=message;}
function field(label,value){const row=document.createElement('div');row.className='ai-ct-row';
 const a=document.createElement('span');a.textContent=label;
 const b=document.createElement('strong');b.textContent=value;
 row.append(a,b);body.append(row);}
function number(value,decimals=6){return typeof value==='number' && Number.isFinite(value)
 ?value.toLocaleString('fr-FR',{maximumFractionDigits:decimals}):'Non disponible';}
async function get(url,token){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
 try{const response=await fetch(url,{method:'GET',headers:{Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{})},cache:'no-store',signal:controller.signal});
 if(!response.ok)throw new Error('Lecture indisponible ('+response.status+')');return await response.json();}
 finally{clearTimeout(timeout);}}
function paint(doc){body.replaceChildren();
 field('Marché exact',doc.market+' (pas CT/USDT)');
 field('Solde vérifié',number(doc.position.qty_ct,8)+' CT');
 field('Prix d’acquisition',doc.acquisition.status==='reconciled_fills_only'?number(doc.acquisition.cost_per_ct_usdc,7)+' USDC/CT':'Non confirmé');
 field('Montant acheté',doc.acquisition.status==='reconciled_fills_only'?number(doc.acquisition.spent_usdc,7)+' USDC':'Non confirmé');
 field('Frais de revente',doc.fee_taker_fraction===null?'Non vérifiés':number(doc.fee_taker_fraction*100,4)+' %');
 field('Valeur revente fictive',doc.liquidation_illustrative.status==='indicative'?number(doc.liquidation_illustrative.net_usdc,6)+' USDC':'Non disponible');
 field('Différence indicative après frais',doc.pnl_illustrative_usdc===null?'Non calculable':(doc.pnl_illustrative_usdc>=0?'+':'')+number(doc.pnl_illustrative_usdc,6)+' USDC');
 const warn=document.createElement('p');warn.className='ai-ct-warning';
 warn.textContent=doc.acquisition.status!=='reconciled_fills_only'?doc.acquisition.reason:
 doc.liquidation_illustrative.status!=='indicative'?doc.liquidation_illustrative.reason:
 'Estimation du carnet à un instant donné, pas un bénéfice réalisé ni une recommandation d’achat/vente.';
 body.append(warn);}
async function refresh(){latest=null;copy.disabled=true;read.disabled=true;body.replaceChildren();state('Lecture locale en cours…');
 try{
  const token=sessionStorage.getItem(TOKEN_KEY)||'';
  if(sessionStorage.getItem(ROLE_KEY)!=='owner'||!token)throw new Error('Active d’abord ta session propriétaire Aether Trust dans le Trader.');
  const endpoints=[BRIDGE+'/okx/account',BRIDGE+'/okx/fills',BRIDGE+'/okx/fees?instId=CT-USDC',
   BACKEND+'/market-book?provider=okx&instrument=CT-USDC&limit=100'];
  const results=await Promise.allSettled(endpoints.map((url,i)=>get(url,i<3?token:null)));
  if(results[0].status!=='fulfilled')throw new Error('Solde privé OKX non accessible.');
  const data=results.map(x=>x.status==='fulfilled'?x.value:null);
  latest=model.compose({account:data[0],fills:data[1],fees:data[2],book:data[3]});
  paint(latest);state('Lecture seule · provenance OKX · '+new Date().toLocaleTimeString('fr-FR'));
  copy.disabled=false;
 }catch(e){state('Non disponible : '+String(e.message||e).slice(0,140));}
 finally{read.disabled=false;}}
if(btn.dataset.aiCtBound!=='1'){
 btn.dataset.aiCtBound='1';
 btn.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;
  btn.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden){panel.scrollIntoView({behavior:'auto',block:'start'});}
 });
}
close.addEventListener('click',()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false');});
read.addEventListener('click',refresh);
copy.addEventListener('click',async()=>{
 if(!latest)return;
 // Explicit user action: private overview copied locally, never uploaded automatically.
 const sanitized={schema:latest.schema,market:latest.market,quote:latest.quote,read_only:true,
 position:latest.position,acquisition:latest.acquisition,fee_taker_fraction:latest.fee_taker_fraction,
 liquidation_illustrative:latest.liquidation_illustrative,
 pnl_illustrative_usdc:latest.pnl_illustrative_usdc,profit_proven:false};
 try{await navigator.clipboard.writeText(JSON.stringify(sanitized,null,2));state('Résumé privé copié. Partage uniquement si tu le souhaites.');}
 catch(_){state('Copie bloquée par le navigateur.');}
});
})();
