/* ERITH.IA · Seven's multi-asset dossier UI, separate from restored Concrete.
   No writes, reset, orders, CT module edits or implicit private reads. */
(()=>{'use strict';
const core=globalThis.AgentCryptoAiAssetReading;
const host=document.getElementById('detailPanelBody');
if(!core?.createReading||!host||document.getElementById('sevenAssetReading'))return;
const el=(tag,cls='',value='')=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(value!==null&&value!==undefined)x.textContent=String(value);return x;
};
const panel=el('details','seven-asset-reading');
panel.id='sevenAssetReading';panel.hidden=true;
const summary=el('summary','seven-asset-title');
const heading=el('strong','','IA · Dossier multi-actifs');
const caption=el('small','','Même profondeur que Concrete, lectures PAPER séparées');
summary.append(heading,caption);panel.append(summary);
const content=el('div','seven-asset-body');
const intro=el('p','seven-asset-intro','Dossier indépendant de Concrete · aucune permission Trade.');
const modes=el('div','seven-asset-modes');
const learn=el('button','','Apprendre'),analyze=el('button','','Analyser');
const publicButton=el('button','','Actualiser les sources publiques');
const privateButton=el('button','','Lire mon compte (lecture seule)');
for(const btn of [learn,analyze,publicButton,privateButton])btn.type='button';
modes.append(learn,analyze);
const state=el('p','seven-asset-state','En attente de la sélection du Market.');
state.setAttribute('role','status');
const help=el('div','seven-asset-help');
const actions=el('div','seven-asset-actions');actions.append(publicButton,privateButton);
const cards=el('div','seven-asset-cards');
content.append(intro,modes,help,actions,state,cards);panel.append(content);
const ct=document.getElementById('aiCtPanel');
if(ct)ct.insertAdjacentElement('beforebegin',panel);
else host.prepend(panel);
const sheet=el('link');sheet.rel='stylesheet';sheet.id='sevenAssetReadingStyle';
sheet.href=new URL('../trader/ai-asset-reading.css',document.baseURI).href;
document.head.append(sheet);
let key='',coin=null,selection=null,market=null,chart=null,book=null,rules=null,
 account=null,position=null,mode='learn',epoch=0,busy=false;
const marketCoin=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
const microscope=()=>globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null;
const listing=()=>globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.()||null;
const liveListing=()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;
const externalGraph=()=>globalThis.AtlasExternalChart?.state?.()||null;
const nav=document.querySelector?.('#accueil .atlas-v2-nav-essential');
const quick=nav?el('button','atlas-quick-link','IA · Seven'):null;
if(quick){
 quick.id='aiSevenToggle';quick.type='button';quick.hidden=true;
 quick.setAttribute('aria-controls','sevenAssetReading');
 quick.setAttribute('aria-expanded','false');nav.append(quick);
 quick.addEventListener('click',()=>{
   const detail=document.getElementById('detailPanel');
   if(detail?.hidden||document.getElementById('analyste')?.classList.contains('detail-collapsed'))
     document.getElementById('detailPanelToggle')?.click();
   panel.open=true;quick.setAttribute('aria-expanded','true');
   panel.scrollIntoView?.({behavior:'auto',block:'nearest'});
 });
 panel.addEventListener('toggle',()=>quick.setAttribute('aria-expanded',String(panel.open)));
}
const available=(v)=>v===null||v===undefined||v===''?'Non certifié':String(v);
const money=(v,unit)=>available(v)+(v===null||v===undefined?'':' '+unit);
const row=(label,value)=>{
 const r=el('div','seven-asset-row');
 r.append(el('span','',label),el('strong','',available(value)));return r;
};
const block=(title,text)=>{
 const p=el('p','');p.append(el('b','',title+' · '),document.createTextNode(text));return p;
};
const format=(v,dec=8)=>{
 const n=Number(v);return Number.isFinite(n)?
  n.toLocaleString('fr-FR',{maximumFractionDigits:dec}):'non qualifié';
};
function chosen(){
 const c=marketCoin(),g=microscope(),native=listing(),live=liveListing(),chart=externalGraph();
 const graphPair=String(g?.loadedInstrument||'').toUpperCase().replace('/','-');
 const graphBase=graphPair.match(/^([A-Z0-9]{1,20})-([A-Z0-9]{2,12})$/)?.[1]||'';
 if(graphBase==='CT'||(live?.active===true&&live?.base==='CT'))
   return {ct:true,c,g};
 if(live?.active===true){
   const base=String(live.base||'').toUpperCase(),quote=String(live.quote||'').toUpperCase();
   const pair=base+'-'+quote,venue=String(live.provider||'').toLowerCase();
   const exact=live.readOnly===true&&['okx','bitget'].includes(venue)&&
     /^[A-Z][A-Z0-9]{0,19}$/.test(base)&&['USDC','USDT','EUR'].includes(quote)&&
     live.instrument===pair&&native?.selectedId===live.id&&
     native?.selectedSymbol===base&&native?.selectedProvider===venue&&
     native?.selectedProviderSymbol===live.providerSymbol&&
     native?.selectedPair===base+'/'+quote&&chart?.active===true&&
     chart.coin_id===live.id&&chart.loading!==true&&!chart.error;
   if(!exact||(graphPair&&graphPair!==pair))
     return {conflict:true,c:{symbol:base||'Listing'},g,graphBase:graphBase||'non chargé'};
   const ticker=live.marketTicker;
   const exactQuotePrice=ticker?.quoteCurrency===quote&&
     Number.isFinite(Number(ticker.lastPrice))&&Number(ticker.lastPrice)>0?
     ticker.lastPrice:null;
   return {
     c:{id:String(live.id),symbol:base,name:String(live.name||base),
       usdSource:'Prix USD non attesté · '+venue+' '+pair,
       change24h:ticker?.quoteCurrency===quote&&
         Number.isFinite(ticker?.change24h)?ticker.change24h:null},
     g,selection:{id:String(live.id),symbol:base,quote},
     identity:String(live.id)+'|'+pair+'|'+venue,venue,external:true,
     exactQuotePrice,quotePriceAt:ticker?.timestamp||null
   };
 }
 const symbol=String(c?.symbol||'').toUpperCase();
 if(symbol==='CT')return {ct:true,c,g};
 if(!c?.id||!/^[A-Z][A-Z0-9]{0,19}$/.test(symbol))return {pending:true,c,g};
 if(graphBase&&graphBase!==symbol)return {conflict:true,c,g,graphBase};
 const quote=String(c?.rawQuoteCurrency||c?.quote||c?.providerContext?.quote||'USDC').toUpperCase();
 if(!['USDC','USDT','EUR'].includes(quote))return {pending:true,c,g};
 return {c,g,selection:{id:String(c.id),symbol,quote},
   identity:String(c.id)+'|'+symbol+'|'+quote,venue:'okx',external:false};
}
function resetReading(){
 book=null;rules=null;account=null;position=null;busy=false;
 state.textContent='Nouvel actif : seules ses propres preuves seront utilisées.';
}
function same(original,seq){
 const now=chosen();return !now.ct&&!now.conflict&&!now.pending&&
    now.identity===original&&epoch===seq;
}
function change(){
 const choice=chosen();
 if(choice.ct){
  panel.hidden=true;if(quick)quick.hidden=true;
  key='CT';coin=null;selection=null;epoch++;resetReading();return;
 }
 if(choice.conflict||choice.pending){
  panel.hidden=false;
  if(quick){quick.hidden=false;quick.textContent='IA · Seven · Sources';}
  // For a conflict, show ONLY a warning, never another asset's private data.
  if(choice.conflict){
    panel.hidden=false;heading.textContent='IA · Sources en attente';
    caption.textContent='Sélection Market et bougies différentes';
    cards.replaceChildren();help.replaceChildren();
  }
  key='';coin=null;selection=null;epoch++;resetReading();
  if(choice.conflict)
    state.textContent='Conflit : Market '+choice.c?.symbol+
      ' · graphique '+choice.graphBase+'. Aucune analyse ou position n’est mélangée.';
  publicButton.disabled=true;privateButton.disabled=true;
  return;
 }
 if(choice.identity!==key){
   key=choice.identity;coin=choice.c;selection=choice.selection;
   epoch++;resetReading();panel.open=true;
 }
 panel.hidden=false;
 if(quick){quick.hidden=false;quick.textContent='IA · Seven · '+selection.symbol;}
 publicButton.disabled=busy||(choice.external&&choice.venue!=='okx');
 privateButton.disabled=busy||(choice.external&&choice.venue!=='okx');
 heading.textContent='IA · Dossier '+selection.symbol+' · Seven';
 caption.textContent=String(coin?.name||selection.symbol)+' · '+selection.symbol+
   '/'+selection.quote+' · Market, position, règles et scénarios PAPER';
 intro.textContent=choice.external?
   'Dossier '+selection.symbol+' · '+choice.venue.toUpperCase()+' Spot '+
   selection.symbol+'/'+selection.quote+
   ' · données publiques ; position et règles OKX non certifiées. Concrete CT reste intact.':
   'Même structure que Concrete (CT), données propres à '+
   selection.symbol+'. Concrete conserve intégralement son panneau et sa lecture privée.';
 paint();
}
function safeChart(){
 const info=microscope();
 const base=String(info?.loadedInstrument||'').toUpperCase().split('-')[0];
 if(base!==selection?.symbol)return null;
 return info;
}
function paint(){
 if(!selection||panel.hidden)return;
 const ch=safeChart(),now=Date.now(),choice=chosen();
 const study=core.createReading({selection,market:coin,chart:ch,
   book,rules,account,position,now});
 if(study.status!=='PAPER_READ_ONLY'){
   cards.replaceChildren(block('Lecture indisponible',study.reason));
   return;
 }
 learn.setAttribute('aria-pressed',String(mode==='learn'));
 analyze.setAttribute('aria-pressed',String(mode==='analyze'));
 help.replaceChildren();
 if(mode==='learn'){
   help.append(block('Apprendre',
    'La paire du graphique peut différer de la paire Spot. La variation 24 h, les bougies, le carnet et ton solde proviennent de sources différentes. Aucune direction future ne se déduit d’une seule bougie.'));
 }else{
   help.append(block('Analyser',
    'Rapprocher la fraîcheur, les volumes, la profondeur disponible, les frais et les minima Spot avant d’évaluer une hypothèse. Une estimation PAPER n’est pas un ordre ni un gain réalisé.'));
 }
 const previouslyOpen=new Set([...cards.children]
   .filter(x=>x.open===true).map(x=>x.dataset?.sectionName).filter(Boolean));
 const firstPaint=cards.children.length===0;
 cards.replaceChildren();
 const sections=study.sections;
 sections.forEach((entry,index)=>{
   const d=el('details','seven-asset-card');
   d.dataset.sectionName=entry.label;
   d.open=firstPaint?index<2:previouslyOpen.has(entry.label);
   const s=el('summary','');
   s.append(el('b','',entry.label),el('small','',entry.status));
   d.append(s,el('p','seven-asset-note',entry.details));
   const sub=el('div','seven-asset-values');
   const put=(name,value)=>sub.append(row(name,value));
   if(index===0){
     put('Instrument graphique',study.public.chart_instrument||'Non qualifié');
     put('Source des bougies',study.public.chart_source_verified?
       'Attestée et récente':'Non certifiée / à vérifier');
     if(study.public.chart_warning)put('Séparation des sources',study.public.chart_warning);
     if(ch&&study.public.chart_instrument){
       put('Période',study.public.chart_interval||'Non vérifiée');
       const last=ch.rows?.at(-1),values=['o','h','l','c','v'];
       if(last&&values.every(k=>last[k]!==null&&Number.isFinite(Number(last[k]))&&Number(last[k])>=0)){
         put('Bougie O / H / B / C',
           ['o','h','l','c'].map(k=>format(last[k])).join(' / '));
         put('Volume de la bougie',format(last.v)+' '+selection.symbol);
       }
       const lv=globalThis.AgentCryptoMarketMicroscope?.technicalLevels?.();
       if(lv?.instrument===study.public.chart_instrument&&
          lv?.bar===study.public.chart_interval){
         if(Number.isFinite(Number(lv?.support?.price)))
           put('Support historique',format(lv.support.price)+' (non garanti)');
         if(Number.isFinite(Number(lv?.resistance?.price)))
           put('Résistance historique',format(lv.resistance.price)+' (non garantie)');
       }
     }
   }
   if(index===1){
     if(choice.external){
       put('Marché Spot',choice.venue.toUpperCase()+' · '+study.asset.pair);
       put('Prix exchange natif',choice.exactQuotePrice===null?'Non certifié':
         money(format(choice.exactQuotePrice),study.asset.quote));
       put('Horodatage exchange',choice.quotePriceAt||'Non daté');
       put('Conversion en USD','Non certifiée');
     }
     put('Prix Market',money(study.public.market_price_usd,'USD'));
     put('Variation 24 h',study.public.change_24h===null?'Non certifiée':
       format(study.public.change_24h,2)+' %');
     put('Source Market',study.public.market_source);
     put('Horodatage Market',study.public.market_timestamp_verified?
       'Récent':'Non certifié');
     put('Capitalisation',money(coin?.marketCapUsd,'USD'));
     put('Volume 24 h',money(coin?.volume24hUsd,'USD'));
     put('Carnet natif',study.asset.pair+' · '+
       (study.public.book_verified?'récent':'non vérifié'));
     put('Meilleur bid',money(study.public.best_bid_quote,study.asset.quote));
     put('Meilleur ask',money(study.public.best_ask_quote,study.asset.quote));
   }
   if(index===2){
     put('Trading '+study.asset.base,position?.trading_base===null||
       position?.trading_base===undefined?'Non certifié':
       money(position.trading_base,study.asset.base)+' · daté');
     put('Funding '+study.asset.base,position?.funding_base===null||
       position?.funding_base===undefined?'Non certifié':
       money(position.funding_base,study.asset.base)+' · daté');
     put('Trading '+study.asset.quote,
       money(study.private.trading_quote,study.asset.quote));
     put('Funding '+study.asset.quote,
       money(study.private.funding_quote,study.asset.quote));
     put('Coût d’acquisition','Non prouvé sans mouvements complets');
     put('P&L personnel','Non calculable sans historique rapproché');
   }
   if(index===3){
     if(choice.external&&choice.venue!=='okx')
       put('Limite de preuve','Listing '+choice.venue.toUpperCase()+' · règles OKX non extrapolées');
     put('Paire native OKX',choice.external&&choice.venue!=='okx'?
       'Non certifiée pour cet exchange':study.asset.pair);
     put('Minimum minSz',money(study.public.min_size_base,study.asset.base));
     put('Pas lotSz',money(study.public.lot_size_base,study.asset.base));
     put('Pas de prix tickSz',money(study.public.tick_size_quote,study.asset.quote));
     put('Taux maker / taker',
       study.private.maker_rate===null?'Non certifiés':
         study.private.maker_rate+' / '+study.private.taker_rate+' (taux, pas débit effectif)');
     put('Devise réelle des frais','Non certifiée');
     put('Plafond de compte maxBuy','Non certifié');
   }
   if(index===4){
     study.simulations.forEach(sim=>{
       const desc=sim.status==='GROSS_ONLY'?
         sim.quantity_base+' '+study.asset.base+' → '+sim.gross_quote+
         ' '+study.asset.quote+' BRUT fictif · NET non certifié':
         sim.detail;
       put('Revente '+sim.percent+' %',desc);
     });
     put('Autorisation de vente','Aucune · simulation seulement');
   }
   if(index===5){
     put('Analyse des acquisitions','En attente des exécutions et transferts rapprochés');
     put('Prix de revient','Non prouvé');
     put('P&L réel','Non prouvé');
     put('Écart graphique / carnet','Sources distinctes, aucune assimilation');
   }
   if(index===6){
     put('Actif étudié',String(coin?.name||selection.symbol)+' ('+selection.symbol+')');
     put('Contexte','Historique, volumes, liquidité, minima et volatilité');
     put('Règle Seven','Aucune donnée manquante n’est remplacée par celle d’un autre actif');
     put('Trading','PAPER uniquement, sans ordre, transfert ou fonds engagés');
   }
   d.append(sub);cards.append(d);
 });
}
async function getPublic(url,ms=6500){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),ms);
 try{
  const response=await fetch(url,{cache:'no-store',signal:controller.signal});
  if(!response.ok)throw Error('HTTP '+response.status);
  return await response.json();
 }finally{clearTimeout(timeout);}
}
async function publicRead(){
 const initial=chosen();if(!initial.selection||busy)return;
 if(initial.external&&initial.venue!=='okx'){
   state.textContent='Règles OKX non applicables sans paire native certifiée.';
   return;
 }
 const pair=initial.selection.symbol+'-'+initial.selection.quote,token=epoch;
 busy=true;publicButton.disabled=true;privateButton.disabled=true;
 state.textContent='Lecture des preuves publiques exactes de '+pair+'…';
 try{
  const res=await Promise.allSettled([
   getPublic('http://127.0.0.1:8790/market-book?provider=okx&instrument='+
     encodeURIComponent(pair)+'&limit=100'),
   getPublic('https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId='+
     encodeURIComponent(pair))
  ]);
  if(!same(initial.identity,token))return;
  book=res[0].status==='fulfilled'?res[0].value:null;
  const native=res[1].status==='fulfilled'?res[1].value:null;
  const rr=Array.isArray(native?.data)?native.data.filter(x=>x.instId===pair):[];
  rules=native?.code==='0'&&rr.length===1?
    {...rr[0],observed_at_utc:new Date().toISOString()}:null;
  state.textContent='Preuves publiques '+pair+' : '+
    (book?'carnet reçu':'carnet indisponible')+' · '+
    (rules?'règles reçues':'règles indisponibles')+
    '. Chaque donnée est encore vérifiée par le contrat.';
 }catch(_){
  if(same(initial.identity,token)){
   book=null;rules=null;state.textContent='Lecture publique indisponible ; aucune valeur de substitution.';
  }
 }finally{
  if(same(initial.identity,token)){
   busy=false;publicButton.disabled=false;privateButton.disabled=false;paint();
  }
 }
}
async function privateRead(){
 const initial=chosen();if(!initial.selection||busy)return;
 if(initial.external&&initial.venue!=='okx'){
   state.textContent='Compte OKX non applicable au listing sur '+initial.venue.toUpperCase()+'.';
   return;
 }
 const pair=initial.selection.symbol+'-'+initial.selection.quote,token=epoch;
 const owner=globalThis.AgentCryptoTraderOkxAccount;
 if(typeof owner?.ticketReadOnly!=='function'||typeof owner?.basePositionReadOnly!=='function'){
   state.textContent='Compte OKX indisponible ou ancien Bridge : aucun solde inventé.';return;
 }
 busy=true;privateButton.disabled=true;publicButton.disabled=true;
 state.textContent='Lecture propriétaire '+pair+' sur demande (sans ordre)…';
 try{
  const [a,p]=await Promise.all([owner.ticketReadOnly(pair),owner.basePositionReadOnly(pair)]);
  if(!same(initial.identity,token))return;
  account=a?.instId===pair&&a?.read_only===true&&a?.orders_enabled===false&&
    a?.real_orders===0&&a?.verified===true?a:null;
  position=p?.pair===pair&&p?.read_only===true&&p?.orders_enabled===false&&
    p?.real_orders===0?p:null;
  state.textContent='Lecture '+pair+' terminée · Trading/Funding isolés. '+
    (position?.verified?'Deux sous-soldes de base qualifiés.':
     'Sous-soldes incomplets : aucune quantité de vente supposée.');
 }catch(_){
  if(same(initial.identity,token)){
   account=null;position=null;
   state.textContent='Compte privé non accessible ; aucune valeur précédemment lue n’est reprise.';
  }
 }finally{
  if(same(initial.identity,token)){
   busy=false;privateButton.disabled=false;publicButton.disabled=false;paint();
  }
 }
}
learn.addEventListener('click',()=>{mode='learn';paint();});
analyze.addEventListener('click',()=>{mode='analyze';paint();});
publicButton.addEventListener('click',()=>void publicRead());
privateButton.addEventListener('click',()=>void privateRead());
function schedule(){queueMicrotask(change);}
for(const event of ['agent-crypto:trader-selection-changed',
 'agent-crypto:external-asset-changed','agent-crypto:new-listing-line-ready',
 'agent-crypto:selected-market-changed','agent-crypto:trader-line-loaded',
 'agent-crypto:candles-technical-levels','agent-crypto:quote-architecture-changed']){
 window.addEventListener(event,schedule,{passive:true});
}
window.addEventListener('pageshow',schedule,{passive:true});
panel.addEventListener('toggle',()=>{if(panel.open)change();});
schedule();
globalThis.AgentCryptoSevenAssetReadingView=Object.freeze({
 active:()=>selection?.symbol||null,refresh:change,read_only:true,
 ct_modified:false,orders_enabled:false,real_orders:false});
})();
