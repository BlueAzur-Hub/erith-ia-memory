/* Seven Heaven · Trader verified R9 archive; read-only, no live-chart changes. */
(()=>{"use strict";
const ID="traderVerifiedHistory",LABEL={"24h":"5 min","7d":"1 h","30d":"4 h"};
let reader=null,catalog=null,sequence=0;
const panel=()=>document.getElementById(ID);
const selected=()=>{try{const c=globalThis.getSelectedCoin?.();return c&&typeof c.id==="string"&&c.id&&typeof c.symbol==="string"?{id:c.id,symbol:c.symbol.toUpperCase()}:null;}catch(_){return null;}};
function utc(x){const d=new Date(x);return Number.isFinite(d.getTime())?d.toLocaleString("fr-FR",{timeZone:"UTC",dateStyle:"short",timeStyle:"short"})+" UTC":"date inconnue";}
function write(p,name,value){const e=p.querySelector("[data-history-"+name+"]");if(e)e.textContent=value;}
function empty(p){p.querySelector("[data-history-rows]")?.replaceChildren();write(p,"meta","—");const native=p.querySelector("[data-history-native]");if(native){native.hidden=true;native.querySelector("[data-native-rows]")?.replaceChildren();}}
function loadReader(){
 if(globalThis.SevenCompactArchiveReader?.readSeries)return Promise.resolve(globalThis.SevenCompactArchiveReader);
 if(reader)return reader;
 reader=new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.id="traderHistoryR9Loader";
  s.src=new URL("../administrator/js/historical-compact-reader.js",document.baseURI).href;
  s.onload=()=>{const x=globalThis.SevenCompactArchiveReader;x?.readSeries&&x?.refreshIndex?resolve(x):reject(Error("API R9 indisponible"));};
  s.onerror=()=>reject(Error("Chargement lecteur R9 impossible"));
  document.head.appendChild(s);
 }).catch(e=>{reader=null;document.getElementById("traderHistoryR9Loader")?.remove();throw e;});
 return reader;
}

/* Read-only projection of the native CoinGecko USD chart broker.
   NOT Binance R9 and NOT OHLCV. No new fetch, timer, storage or graph owner. */
function nativeChart(coin){
 let chart=null;
 try{chart=typeof state!=="undefined"?state?.dataBroker?.chart:null;}catch(_){}
 if(!chart||chart.status!=="ready"||chart.coinId!==coin.id||chart.result?.blocked)return null;
 const r=chart.result;
 if(String(r?.currency||"").toUpperCase()!=="USD"||
    String(r?.quoteCurrency||"").toUpperCase()!=="USD"||
    !/coingecko/i.test([r?.sourceFamily,r?.source,chart.source].join(" ")))return null;
 if(!Array.isArray(r.series)||r.series.length<2)return null;
 const rows=r.series.filter(v=>Array.isArray(v)&&v.length>=2&&
   Number.isFinite(v[0])&&v[0]>0&&Number.isFinite(v[1])&&v[1]>0);
 if(rows.length<2||rows.some((v,i)=>i&&v[0]<=rows[i-1][0]))return null;
 return{rows:rows.slice(-12),count:rows.length,days:Number(chart.period||0),
   source:String(r.source||chart.source||"CoinGecko USD"),asOf:r.generatedAt||chart.seriesTimestamp||null,
   first:rows[0][0],last:rows[rows.length-1][0]};
}
function paintNative(p,coin){
 const host=p.querySelector("[data-history-native]");if(!host)return false;
 host.hidden=false;
 const label=host.querySelector("[data-native-status]"),body=host.querySelector("[data-native-rows]");
 body?.replaceChildren();
 const view=nativeChart(coin);
 if(!view){if(label)label.textContent="Aucun historique CoinGecko USD disponible dans le graphique actif pour cet actif.";return false;}
 const periodLabel=({"1":"24 h","7":"7 j","30":"30 j","60":"60 j","90":"90 j","365":"1 an"})[String(view.days)]||view.days+" j";
 if(label)label.textContent=coin.symbol+" · "+view.count+" points CoinGecko USD · fenêtre graphique "+periodLabel+
   " · "+utc(view.first)+" → "+utc(view.last)+
   " · "+(view.asOf?"série "+utc(view.asOf)+" · ":"")+
   "cache/graphique natif · NON LIVE · NON R9";
 for(const [t,value] of view.rows.slice().reverse()){
  const tr=document.createElement("tr"),a=document.createElement("td"),b=document.createElement("td");
  a.textContent=utc(t);b.textContent=value.toLocaleString("fr-FR",{maximumFractionDigits:8})+" USD";
  tr.append(a,b);body?.appendChild(tr);
 }
 return true;
}
function paint(p,result){
 const m=result.metadata,rows=result.candles;
 if(m.source!=="Binance Spot"||m.quote!=="USDT"||m.status!=="VALIDATED_SNAPSHOT"||
  m.isLive!==false||m.graphConnected!==false||!Array.isArray(rows))throw Error("Archive non qualifiée");
 write(p,"meta",m.pair+" · Binance Spot · USDT · "+m.interval+" · "+rows.length+
  " chandelles · "+utc(m.firstOpenMs)+" → "+utc(m.lastOpenMs)+
  " · capture "+utc(m.sourceIndexUpdatedAt)+" · SHA-256 vérifié · NON LIVE");
 const body=p.querySelector("[data-history-rows]");body?.replaceChildren();
 for(const row of rows.slice(-12).reverse()){
  const tr=document.createElement("tr");
  for(const v of [utc(row[0]),...row.slice(1,6)]){
   const td=document.createElement("td");
   td.textContent=typeof v==="number"?v.toLocaleString("fr-FR",{maximumFractionDigits:8}):v;
   tr.appendChild(td);
  }body?.appendChild(tr);
 }
}
async function refresh({reload=false}={}){
 const p=panel();if(!p?.open)return;
 const seq=++sequence,c=selected(),period=p.querySelector("[data-history-period]")?.value||"24h";
 empty(p);
 if(!c){write(p,"status","Aucun actif sélectionné");return;}
 write(p,"status",c.symbol+" · recherche d'archive…");
 write(p,"detail","Archive Binance Spot USDT, distincte des Bougies OKX USDC.");
 try{
  const api=await loadReader();if(seq!==sequence||!p.open)return;
  if(reload||!catalog)catalog=await api.refreshIndex();
  if(seq!==sequence||!p.open)return;
  if(!catalog?.snapshot||catalog.quote!=="USDT"||catalog.coverage?.length!==21)throw Error("Catalogue non qualifié");
  const entry=catalog.coverage.find(x=>x.id===c.id&&x.period===period);
  if(!entry){
   write(p,"status",c.symbol+" · archive non disponible");
   write(p,"detail","Pas d’archive Binance Spot R9 pour cet actif. Jamais de substitution BTC. Historique graphique natif séparé ci-dessous.");
   paintNative(p,c);
   return;
  }
  write(p,"status",c.symbol+" · contrôle SHA-256…");
  const data=await api.readSeries({assetId:c.id,period});
  if(seq!==sequence||!p.open||selected()?.id!==c.id||
   p.querySelector("[data-history-period]")?.value!==period)return;
  if(data.metadata.id!==c.id||data.metadata.pair!==entry.pair||
   data.metadata.period!==period||data.candles.length!==entry.candles)
   throw Error("Réponse R9 hors contexte");
  paint(p,data);
  write(p,"status",c.symbol+" · "+LABEL[period]+" · ARCHIVE VÉRIFIÉE");
  write(p,"detail","Capture historique figée : aucune conversion USDT/USDC, aucun ordre.");
 }catch(e){if(seq!==sequence||!p.open)return;empty(p);
  write(p,"status",c.symbol+" · archive indisponible");
  write(p,"detail","Erreur R9 : "+String(e?.message||e).slice(0,150)+" · aucune donnée inventée.");
  paintNative(p,c);
 }
}
function mount(){
 if(panel())return true;
 const zone=document.getElementById("market-zone");if(!zone)return false;
 if(!document.getElementById("traderVerifiedHistoryStyle")){
  const style=document.createElement("style");style.id="traderVerifiedHistoryStyle";
  style.textContent=[
   "#traderVerifiedHistory{grid-column:1/-1;display:block;box-sizing:border-box;width:99%;margin:14px auto 24px;",
   "color:#d7eff0;background:#071d2a;border:1px solid #2b5965;border-radius:14px;overflow:hidden;",
   "font:12px system-ui,sans-serif}",
   "#traderVerifiedHistory>summary{padding:14px;cursor:pointer;display:flex;gap:12px;flex-wrap:wrap;",
   "font-size:14px;font-weight:bold;list-style:none}",
   "#traderVerifiedHistory [data-history-status]{color:#83e9db;font-weight:normal;font-size:12px}",
   "#traderVerifiedHistory .history-body{border-top:1px solid #325461;padding:12px}",
   "#traderVerifiedHistory .history-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px}",
   "#traderVerifiedHistory select,#traderVerifiedHistory button{color:#fff;background:#123743;",
   "border:1px solid #436d7a;border-radius:8px;padding:7px 10px;cursor:pointer}",
   "#traderVerifiedHistory .history-note{color:#a9c3cf}",
   "#traderVerifiedHistory [data-history-meta]{color:#ffe0a0;line-height:1.5}",
   "#traderVerifiedHistory .history-scroll{overflow-x:auto}",
   "#traderVerifiedHistory [data-history-native]{margin-top:12px;padding:11px;border:1px solid #2d6370;border-radius:10px;background:#0a2b31}",
   "#traderVerifiedHistory [data-history-native][hidden]{display:none!important}",
   "#traderVerifiedHistory [data-history-native] h4{margin:0 0 7px;color:#9cfff1}",
   "#traderVerifiedHistory table{min-width:550px;width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}",
   "#traderVerifiedHistory td,#traderVerifiedHistory th{padding:7px;border-bottom:1px solid #2a4b59;text-align:right}",
   "#traderVerifiedHistory td:first-child,#traderVerifiedHistory th:first-child{text-align:left}"
  ].join("");document.head.appendChild(style);
 }
 const p=document.createElement("details");p.id=ID;
 p.setAttribute("aria-label","Historique Binance Spot vérifié · lecture seule");
 p.innerHTML=[
 '<summary><strong>HISTORIQUE VÉRIFIÉ · R9</strong>',
 '<span data-history-status>Fermé · aucune lecture</span></summary>',
 '<div class="history-body"><div class="history-controls">',
 '<label for="traderHistoryPeriod">Période</label><select id="traderHistoryPeriod" data-history-period>',
 '<option value="24h">24 h · 5 min</option><option value="7d">7 j · 1 h</option>',
 '<option value="30d">30 j · 4 h</option></select>',
 '<button type="button" data-history-reload>Actualiser le catalogue</button></div>',
 '<p class="history-note" data-history-detail>Lecture à la demande, sans impact sur OKX.</p>',
 '<p data-history-meta>—</p><div class="history-scroll"><table>',
 '<thead><tr><th>Ouverture UTC</th><th>Ouverture USDT</th><th>Haut</th><th>Bas</th>',
 '<th>Clôture</th><th>Volume actif</th></tr></thead><tbody data-history-rows></tbody>',
 '</table></div><section data-history-native hidden aria-label="Historique du graphique natif, distinct de R9">',
 '<h4>HISTORIQUE DU GRAPHIQUE · CoinGecko USD · HORS R9</h4>',
 '<p class="history-note" data-native-status>En attente du graphique existant.</p>',
 '<div class="history-scroll"><table><thead><tr><th>Heure UTC</th><th>Prix USD</th></tr></thead>',
 '<tbody data-native-rows></tbody></table></div></section></div>'
 ].join("");
 zone.appendChild(p);
 p.addEventListener("toggle",()=>{
  if(p.open)void refresh({reload:true});
  else{sequence++;empty(p);write(p,"status","Fermé · aucune lecture");}
 });
 p.querySelector("[data-history-period]")?.addEventListener("change",()=>{if(p.open)void refresh();});
 p.querySelector("[data-history-reload]")?.addEventListener("click",()=>{if(p.open)void refresh({reload:true});});
 globalThis.addEventListener("agent-crypto:selected-market-changed",()=>{sequence++;if(p.open)void refresh();},{passive:true});
 return true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
globalThis.AgentCryptoTraderHistoricalPanel=Object.freeze({mount,refresh,read_only:true,is_live:false,quote:"USDT",real_orders:false});
})();