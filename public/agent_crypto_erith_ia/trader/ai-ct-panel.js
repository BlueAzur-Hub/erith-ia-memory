/* ERITH.IA · premier panneau de lecture commun IA/Trader, opt-in manuel. */
(()=>{'use strict';
const model=globalThis.AgentCryptoAiCtContract;
if(!model)return;
const BRIDGE='http://127.0.0.1:8787';
const BACKEND='http://127.0.0.1:8790';
const TOKEN_KEY='agent_crypto_bridge_owner_token_v1';
const ROLE_KEY='agent_crypto_local_access_session_v1';
const detailBody=document.getElementById('detailPanelBody');
if(!detailBody||document.getElementById('aiCtPanel'))return;
const template=document.createElement('template');
template.innerHTML="<details id=\"aiCtPanel\" class=\"atlas-detail-subwindow atlas-primary-detail-window ai-ct-reading\" data-detail-window=\"ai-ct\">\n  <summary><span><b>IA · Concrete (CT)</b><small>Apprendre · Analyser · position privée CT/USDC</small></span><em id=\"aiCtExpandState\" data-window-state>Ouvrir</em></summary>\n  <div class=\"atlas-detail-subwindow-body ai-ct-panel-body\">\n    <p class=\"ai-ct-intro\">Assistance à la lecture du marché Concrete · aucun ordre réel. Le graphique public CT/USDT et ta position CT/USDC restent distincts.</p>\n    <div class=\"ai-ct-modes\" role=\"group\" aria-label=\"Mode d'assistance Concrete\">\n      <button id=\"aiCtModeLearn\" type=\"button\" aria-controls=\"aiCtLesson\" aria-pressed=\"true\">Apprendre</button>\n      <button id=\"aiCtModeAnalyze\" type=\"button\" aria-controls=\"aiCtLesson\" aria-pressed=\"false\">Analyser</button>\n    </div>\n    <div id=\"aiCtLesson\" class=\"ai-ct-lesson\" role=\"status\" aria-live=\"polite\"></div>\n    <div class=\"ai-ct-actions\">\n      <button id=\"aiCtRead\" type=\"button\">Lire ma position CT/USDC</button>\n      <button id=\"aiCtCopy\" type=\"button\" disabled>Copier le résumé privé</button>\n    </div>\n    <p id=\"aiCtStatus\" role=\"status\" aria-live=\"polite\">Prêt · aucune consultation privée automatique.</p>\n    <div id=\"aiCtDetails\"></div>\n    <details class=\"ai-ct-case\">\n      <summary>Cas d'école · Concrete CT — lecture et risques</summary>\n      <p><strong>Position réelle :</strong> marché CT/USDC, quantité et frais lus via le Bridge local uniquement sur demande. Une vente fictive estimée à partir du carnet ne garantit aucun prix réel.</p>\n      <p><strong>Analyse publique :</strong> les bougies CT/USDT proviennent d'un autre marché. Elles servent au contexte, sans être assimilées au prix CT/USDC ou à une mesure de ton gain personnel.</p>\n      <p><strong>Contrôles :</strong> volatilité, volumes, liquidité, commissions, fraîcheur et archives doivent être qualifiés. Aucun ordre automatique.</p>\n    </details>\n  </div>\n</details>";
const panel=template.content.firstElementChild;
const body=panel.querySelector('#aiCtDetails'),status=panel.querySelector('#aiCtStatus');
const read=panel.querySelector('#aiCtRead'),copy=panel.querySelector('#aiCtCopy');
const anchor=detailBody.querySelector('#detailCompactStrip');
if(anchor)anchor.insertAdjacentElement('afterend',panel);else detailBody.prepend(panel);
/* Raccourci Trader : ouvre la Lecture Technique existante, jamais un second panneau. */
const nav=document.querySelector('#accueil .atlas-v2-nav-essential');
if(nav&&!document.getElementById('aiCtToggle')){
 const btn=document.createElement('button');
 btn.id='aiCtToggle';btn.type='button';btn.className='atlas-quick-link';
 btn.textContent='IA · Concrete';
 btn.setAttribute('aria-controls','aiCtPanel');
 btn.setAttribute('aria-expanded','false');
 nav.appendChild(btn);
 btn.addEventListener('click',()=>{
  const detail=document.getElementById('detailPanel');
  if(detail?.hidden||document.getElementById('analyste')?.classList.contains('detail-collapsed')){
   document.getElementById('detailPanelToggle')?.click();
  }
  panel.open=true;
  btn.setAttribute('aria-expanded','true');
  panel.scrollIntoView({behavior:'auto',block:'nearest'});
 });
 panel.addEventListener('toggle',()=>{
  btn.setAttribute('aria-expanded',String(panel.open));
 });
}
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
 // Le compte rendu réunit les calculs déjà prouvés et la courbe publique chargée.
 const chart=model.publicCandles(globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null);
 const report=model.explain(doc,chart);
 const brief=document.createElement('section');brief.className='ai-ct-seven-brief';
 brief.setAttribute('aria-label','Synthèse Seven de la position Concrete');
 const heading=document.createElement('strong');heading.textContent='SEVEN · Analyse de ma position CT';
 brief.append(heading);
 for(const line of report.lines){const p=document.createElement('p');p.textContent=line;brief.append(p);}
 body.append(brief);
 const balances=doc.portfolio?.assets||{};
 for(const code of ['BTC','CT','USDC','EUR']){
  const entry=balances[code];
  field('Compte OKX · '+code,entry?.verified===true?number(entry.qty,code==='BTC'?16:8)+' '+code:'Non retourné / non vérifié');
 }
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
// Une seule lecture métier, deux présentations ; la consultation depuis OKX
// ne doit ni ouvrir la Lecture Technique ni reconstruire son contenu.
async function loadCtEvidence(){
 const session=sessionStorage.getItem(TOKEN_KEY)||'';
 if(sessionStorage.getItem(ROLE_KEY)!=='owner'||!session)
  throw new Error('Active d’abord ta session propriétaire Aether Trust dans le Trader.');
 const endpoints=[BRIDGE+'/okx/account',BRIDGE+'/okx/fills',BRIDGE+'/okx/fees?instId=CT-USDC',
  BACKEND+'/market-book?provider=okx&instrument=CT-USDC&limit=100'];
 const results=await Promise.allSettled(endpoints.map((url,i)=>get(url,i<3?session:null)));
 if(sessionStorage.getItem(ROLE_KEY)!=='owner'||sessionStorage.getItem(TOKEN_KEY)!==session)
  throw new Error('La session Aether Trust a changé pendant la lecture.');
 if(results[0].status!=='fulfilled')throw new Error('Solde privé OKX non accessible.');
 const data=results.map(x=>x.status==='fulfilled'?x.value:null);
 return model.compose({account:data[0],fills:data[1],fees:data[2],book:data[3]});
}
async function refresh(){
 latest=null;copy.disabled=true;read.disabled=true;body.replaceChildren();
 state('Lecture locale en cours…');
 try{
  const doc=await loadCtEvidence();
  latest=doc;paint(doc);
  state('Lecture seule · provenance OKX · '+new Date().toLocaleTimeString('fr-FR'));
  copy.disabled=false;
 }catch(e){state('Non disponible : '+String(e.message||e).slice(0,140));}
 finally{read.disabled=false;}
}
async function readForAccount(target){
 // Réutilise le calcul de Seven, mais affiche le résultat à l'endroit du clic.
 // Aucun scroll, aucune modification de l'actif, aucun mouvement du graphique.
 if(!target?.isConnected||!target.closest?.('#traderOkxAccountPanel'))return false;
 target.replaceChildren();
 const waiting=document.createElement('p');
 waiting.textContent='Lecture privée CT/USDC en cours…';
 target.append(waiting);
 try{
  const doc=await loadCtEvidence();
  if(!target.isConnected||target.hidden||sessionStorage.getItem(ROLE_KEY)!=='owner')
   return false;
  const chart=model.publicCandles(globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null);
  const report=model.explain(doc,chart);
  target.replaceChildren();
  const title=document.createElement('strong');
  title.textContent='SEVEN · Analyse de ma position CT';
  target.append(title);
  for(const line of report.lines){
   const p=document.createElement('p');p.textContent=line;target.append(p);
  }
  return true;
 }catch(e){
  if(target.isConnected&&!target.hidden){
   target.replaceChildren();
   const p=document.createElement('p');
   p.textContent='Analyse CT indisponible : '+String(e.message||e).slice(0,140);
   target.append(p);
  }
  return false;
 }
}
const lesson=panel.querySelector('#aiCtLesson');
const learnButton=panel.querySelector('#aiCtModeLearn');
const analyzeButton=panel.querySelector('#aiCtModeAnalyze');
const expandLabel=panel.querySelector('#aiCtExpandState');
let helpMode='learn',helpTopic='';
const INDICATORS=Object.freeze({
 ma:'MA : moyenne des derniers prix de clôture. Elle lisse les variations ; elle ne prévoit pas le prochain mouvement.',
 ema:'EMA : moyenne qui accorde plus de poids aux prix récents ; elle peut réagir plus vite, mais générer de faux signaux.',
 sr:'S/R : support et résistance sont des zones repérées dans les cours passés, pas des barrières garanties.',
 supertrend:'SUPER : indicateur calculé avec la volatilité. Un changement de couleur ou de sens peut être tardif.',
 boll:'BOLL : bandes de Bollinger mesurant la dispersion autour d’une moyenne ; toucher une bande ne suffit pas pour acheter ou vendre.',
 sar:'SAR : points de suivi de tendance ; en marché hésitant, ils peuvent changer de côté fréquemment.',
 vwap:'VWAP : prix moyen pondéré par les volumes sur la fenêtre calculée ; ce n’est pas un prix d’exécution garanti.',
 vp:'VP : répartition estimée du volume par zone de prix à partir des bougies ; ce n’est pas le carnet d’ordres réel.'
});
const periods=Object.freeze({'1m':60000,'5m':300000,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000});
const fmt=(n,d=6)=>Number(n).toLocaleString('fr-FR',{maximumFractionDigits:d});
function paintLesson(){
 const info=globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||{};
 const instrument=String(info.loadedInstrument||'').toUpperCase();
 const interval=String(info.loadedBar||'');
 const rows=Array.isArray(info.rows)?info.rows:[];
 const valid=info.mode==='candles'&&/^CT-(USDT|USDC)$/.test(instrument)&&rows.length>0;
 const lines=[];
 if(!valid){
   lines.push('Sélectionne Concrete (CT), affiche Bougies et charge sa période. Aucune analyse ne sera inventée pour un autre actif.');
 }else{
   const bar=rows[rows.length-1],open=Number(bar.o),close=Number(bar.c);
   const volume=Number(bar.v),time=Number(bar.t),age=Date.now()-time;
   const fresh=Number.isFinite(age)&&age>=0&&age<=(periods[interval]||900000)*2;
   lines.push('Source graphique : '+instrument+' · période '+interval+' · '+rows.length+' bougies. CT/USDT ne représente pas le prix de revente de ta position CT/USDC.');
   if(!fresh)lines.push('DONNÉES ANCIENNES ou heure non vérifiée : suspendre toute interprétation de mouvement récent et actualiser les bougies.');
   if(Number.isFinite(open)&&Number.isFinite(close)){
     const color=close>open?'verte (progression)':close<open?'rouge (recul)':'neutre';
     lines.push('Bougie affichée : '+color+' · ouverture '+fmt(open)+' · dernier cours '+fmt(close)+' '+instrument.split('-')[1]+'. La bougie en cours peut encore changer.');
   }
   if(helpMode==='learn'){
     lines.push('Une bougie indique quatre prix : ouverture, plus haut, plus bas et dernier cours/clôture pour l’intervalle sélectionné.');
     lines.push('Le volume mesure la quantité négociée sur la période, pas la quantité des ordres en attente. '+(Number.isFinite(volume)?'Volume de cette bougie : '+fmt(volume,2)+' CT (potentiellement en cours).':'Volume de cette bougie indisponible.'));
     lines.push('Le carnet montre des intentions d’achat et de vente qui peuvent être retirées. Pour une vente réelle, vérifie le marché CT/USDC.');
   }else{
     const levels=globalThis.AgentCryptoMarketMicroscope?.technicalLevels?.();
     if(levels?.instrument===instrument&&levels?.bar===interval){
       const support=Number(levels.support?.price),resistance=Number(levels.resistance?.price);
       if(Number.isFinite(support)&&Number.isFinite(resistance))
         lines.push('Repères du graphique : support '+fmt(support)+' · résistance '+fmt(resistance)+' '+instrument.split('-')[1]+'. Ce sont des zones d’observation, pas des ordres ni des prévisions.');
     }
     lines.push('Analyse prudente : une seule bougie ou un déséquilibre visible du carnet ne confirme pas une tendance. Croiser plusieurs bougies, volumes, fraîcheur et liquidité avant d’interpréter.');
     lines.push('Ta position est en CT/USDC. Pour son solde, ses frais et une estimation de revente, utilise « Lire ma position CT/USDC » ci-dessous ; cette lecture privée est manuelle.');
   }
   if(!fresh)lines.push('Les données anciennes ne doivent jamais être qualifiées de signal actuel.');
 }
 if(helpMode==='learn'&&helpTopic&&INDICATORS[helpTopic])lines.push('Indicateur choisi — '+INDICATORS[helpTopic]);
 lesson.replaceChildren();
 lines.forEach((line,i)=>{const p=document.createElement('p');p.textContent=line;if(i===0)p.className='ai-ct-source';lesson.appendChild(p);});
}
function setHelpMode(mode){
 helpMode=mode==='analyze'?'analyze':'learn';
 learnButton.setAttribute('aria-pressed',String(helpMode==='learn'));
 analyzeButton.setAttribute('aria-pressed',String(helpMode==='analyze'));
 paintLesson();
}
learnButton.addEventListener('click',()=>setHelpMode('learn'));
analyzeButton.addEventListener('click',()=>setHelpMode('analyze'));
panel.addEventListener('toggle',()=>{expandLabel.textContent=panel.open?'Réduire':'Ouvrir';if(panel.open)paintLesson();});
document.getElementById('atlasMarketMicroscope')?.addEventListener('click',event=>{
 const chosen=event.target?.closest?.('[data-amm-indicator]');
 if(!chosen||!INDICATORS[chosen.dataset.ammIndicator])return;
 helpTopic=chosen.dataset.ammIndicator;
 if(panel.open&&helpMode==='learn')queueMicrotask(paintLesson);
});
window.addEventListener('agent-crypto:candles-technical-levels',()=>{if(panel.open)paintLesson();},{passive:true});
setHelpMode('learn');
read.addEventListener('click',refresh);
// Point d'entrée interne pour le bouton du Compte OKX, sans navigation forcée.
globalThis.AgentCryptoAiCtPanel=Object.freeze({readForAccount,read_only:true});
window.addEventListener('aether-trust:logout-requested',()=>{
 latest=null;copy.disabled=true;body.replaceChildren();
 const local=document.querySelector('#traderOkxAccountPanel [data-okx-ctreading]');
 if(local){local.hidden=true;local.replaceChildren();}
},{passive:true});
copy.addEventListener('click',async()=>{
 if(!latest)return;
 // Explicit user action: private overview copied locally, never uploaded automatically.
 const sanitized={schema:latest.schema,market:latest.market,quote:latest.quote,read_only:true,
 portfolio:latest.portfolio,position:latest.position,acquisition:latest.acquisition,fee_taker_fraction:latest.fee_taker_fraction,
 exit_metrics:latest.exit_metrics,
 liquidation_illustrative:latest.liquidation_illustrative,
 pnl_illustrative_usdc:latest.pnl_illustrative_usdc,profit_proven:false};
 try{await navigator.clipboard.writeText(JSON.stringify(sanitized,null,2));state('Résumé privé copié. Partage uniquement si tu le souhaites.');}
 catch(_){state('Copie bloquée par le navigateur.');}
});
})();
