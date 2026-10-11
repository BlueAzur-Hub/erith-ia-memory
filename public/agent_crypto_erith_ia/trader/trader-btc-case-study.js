(()=>{
"use strict";

const ID="traderBtcCaseStudy";

function byId(id){return document.getElementById(id)}

function removeLegacyOkbCase(){
  const legacy=byId("traderOkbCaseStudy");
  if(legacy) legacy.remove();
}

function ensureStyle(){
  if(byId("traderBtcCaseStudyStyle"))return;
  const style=document.createElement("style");
  style.id="traderBtcCaseStudyStyle";
  style.textContent=[
    "#traderBtcCaseStudy{grid-column:1/-1;display:block;width:99%;max-width:99%;margin:14px auto 0;border:1px solid rgba(83,222,222,.24);border-radius:16px;background:linear-gradient(180deg,rgba(7,23,34,.94),rgba(4,15,24,.9));overflow:hidden;box-sizing:border-box}",
    "#traderBtcCaseStudy>summary{display:flex;align-items:center;gap:10px;min-height:48px;padding:10px 14px;cursor:pointer;list-style:none;user-select:none;color:#d9f4f4;font-weight:800;letter-spacing:.015em}",
    "#traderBtcCaseStudy>summary::-webkit-details-marker{display:none}",
    "#traderBtcCaseStudy .btc-case-kicker{color:#79e6e1;font-size:11px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}",
    "#traderBtcCaseStudy .btc-case-title{font-size:14px;color:#fff1c7;min-width:0}",
    "#traderBtcCaseStudy .btc-case-summary{margin-left:auto;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;color:#b7c9d4;font-size:11px;font-weight:700}",
    "#traderBtcCaseStudy .btc-case-summary span{padding:4px 8px;border:1px solid rgba(142,164,186,.2);border-radius:999px;background:rgba(11,27,39,.66);white-space:nowrap}",
    "#traderBtcCaseStudy .btc-case-body{padding:0 14px 16px;border-top:1px solid rgba(83,222,222,.14)}",
    "#traderBtcCaseStudy .btc-case-meta{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;color:#9fb7c5;font-size:11px}",
    "#traderBtcCaseStudy .btc-case-meta b{color:#d9f4f4}",
    "#traderBtcCaseStudy .btc-case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
    "#traderBtcCaseStudy .btc-case-card{min-width:0;padding:12px;border:1px solid rgba(142,164,186,.16);border-radius:12px;background:rgba(5,18,28,.72)}",
    "#traderBtcCaseStudy .btc-case-card h3{margin:0 0 8px;color:#fff1c7;font-size:13px}",
    "#traderBtcCaseStudy .btc-case-card p{margin:0 0 7px;color:#c7d6df;font-size:12px;line-height:1.5}",
    "#traderBtcCaseStudy .btc-case-card p:last-child{margin-bottom:0}",
    "#traderBtcCaseStudy .btc-case-card strong{color:#ecfbfb}",
    "#traderBtcCaseStudy .btc-case-status{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}",
    "#traderBtcCaseStudy .btc-case-status div{padding:9px;border-radius:9px;background:rgba(11,27,39,.78);border:1px solid rgba(83,222,222,.12)}",
    "#traderBtcCaseStudy .btc-case-status span{display:block;color:#8ea4ba;font-size:10px;text-transform:uppercase;letter-spacing:.06em}",
    "#traderBtcCaseStudy .btc-case-status b{display:block;margin-top:3px;color:#dffafa;font-size:12px}",
    "#traderBtcCaseStudy .btc-case-ok{color:#79efaa!important}",
    "#traderBtcCaseStudy .btc-case-warn{color:#ffd98a!important}",
    "#traderBtcCaseStudy .btc-case-foot{margin:10px 0 0;color:#8ea4ba;font-size:10.5px;line-height:1.45}",
    "@media(max-width:900px){#traderBtcCaseStudy .btc-case-grid{grid-template-columns:1fr}#traderBtcCaseStudy .btc-case-summary{margin-left:0}}"
  ].join("\n");
  document.head.appendChild(style);
}

function refresh(){
  const root=byId(ID);
  if(!root)return;
  const history=byId("traderVerifiedHistory");
  const historyState=root.querySelector("[data-btc-history-state]");
  if(historyState){
    historyState.textContent=history?"DISPONIBLE · lecture à la demande":"CHARGEMENT";
    historyState.className=history?"btc-case-ok":"btc-case-warn";
  }
  const graphState=root.querySelector("[data-btc-graph-state]");
  if(graphState){
    const zone=byId("market-zone");
    graphState.textContent=zone?"ACTIF · runtime partagé":"INDISPONIBLE";
    graphState.className=zone?"btc-case-ok":"btc-case-warn";
  }
}

function mount(){
  removeLegacyOkbCase();
  if(byId(ID)){refresh();return true}
  const zone=byId("market-zone");
  if(!zone)return false;
  ensureStyle();

  const panel=document.createElement("details");
  panel.id=ID;
  panel.setAttribute("aria-label","Cas d’école BTC · lecture terrain du Trader");
  panel.innerHTML=[
    '<summary>',
      '<span class="btc-case-kicker">CAS D’ÉCOLE</span>',
      '<span class="btc-case-title">BTC · lecture terrain · marché, historique et futur compte OKX</span>',
      '<span class="btc-case-summary" aria-label="Résumé du cas d’école">',
        '<span>Actif central : BTC</span>',
        '<span>Spot uniquement</span>',
        '<span>Exécution réelle : désactivée</span>',
      '</span>',
    '</summary>',
    '<div class="btc-case-body">',
      '<div class="btc-case-meta">',
        '<span><b>But :</b> apprendre à lire une opération BTC réelle avant toute automatisation</span>',
        '<span><b>Principe :</b> une source = un rôle · aucune donnée inventée</span>',
      '</div>',
      '<div class="btc-case-grid">',
        '<article class="btc-case-card">',
          '<h3>1 · BTC devient l’actif de référence du Trader</h3>',
          '<p><strong>BTC est le cas d’école central.</strong> Le Graphique, le Market, les bougies, le carnet et les historiques doivent raconter la même histoire sans fusionner leurs sources.</p>',
          '<p>Le prix affiché reste celui du module qui le produit. Ce panneau ne copie pas une cotation figée et ne fabrique aucun prix.</p>',
          '<div class="btc-case-status"><div><span>Graphique / Market</span><b data-btc-graph-state>CHARGEMENT</b></div><div><span>Mode</span><b class="btc-case-ok">OBSERVATION</b></div></div>',
        '</article>',
        '<article class="btc-case-card">',
          '<h3>2 · Historique vérifié conservé</h3>',
          '<p>Le lecteur historique du Trader reste branché sur le Coffre vérifié. Pour BTC, les archives Binance Spot USDT restent distinctes des données live et distinctes des bougies publiques OKX.</p>',
          '<p>Le Coffre reste une preuve historique : il ne devient ni un moteur d’ordre ni une conversion cachée USD/USDT/USDC.</p>',
          '<div class="btc-case-status"><div><span>Coffre</span><b data-btc-history-state>CHARGEMENT</b></div><div><span>Écriture</span><b class="btc-case-ok">AUCUNE</b></div></div>',
        '</article>',
        '<article class="btc-case-card">',
          '<h3>3 · OKX public reste la vérité microstructure</h3>',
          '<p>Les bougies et le carnet OKX publics servent à lire l’instrument et la microstructure : bid, ask, spread, profondeur et chandelles. Ils ne donnent pas accès au compte personnel.</p>',
          '<p><strong>Aucune clé privée n’est nécessaire pour cette partie.</strong> Le backend public local peut continuer à alimenter ces données.</p>',
        '</article>',
        '<article class="btc-case-card">',
          '<h3>4 · Compte OKX privé : prochaine couche, pas ici</h3>',
          '<p>Le compte réel sera relié séparément par le <strong>Bridge local authentifié avec Aether Trust</strong>. Première étape prévue : lecture des soldes, ordres et exécutions avec une clé READ dédiée.</p>',
          '<p>La permission TRADE viendra seulement après validation de cette lecture. <strong>Aucune permission de retrait API n’est nécessaire.</strong></p>',
          '<div class="btc-case-status"><div><span>Compte privé</span><b class="btc-case-warn">NON CONNECTÉ</b></div><div><span>Chemin prévu</span><b>BRIDGE + TRUST</b></div></div>',
        '</article>',
        '<article class="btc-case-card">',
          '<h3>5 · Strategy A retirée du Trader</h3>',
          '<p>Le Trader n’embarque plus le dossier Strategy A / Paper / T0. Strategy A reste dans l’Interface Administrator, où son chantier peut continuer sans polluer le parcours BTC.</p>',
          '<p>Le Trader redevient un poste lisible : marché → historique → compte → ordre manuel confirmé.</p>',
        '</article>',
        '<article class="btc-case-card">',
          '<h3>6 · Critère de réussite du cas BTC</h3>',
          '<p>Le premier pont privé sera considéré valide lorsque le Trader affichera, via le Bridge sécurisé, <strong>la quantité BTC réelle du compte OKX, les soldes associés et l’historique des ordres</strong>, sans exposer les secrets au navigateur.</p>',
          '<p>Ensuite seulement viendront achat/vente réels, avec confirmations explicites et journal local.</p>',
        '</article>',
      '</div>',
      '<p class="btc-case-foot">CAS BTC · Trader séparé de Strategy A · Coffre conservé · OKX public conservé · compte privé prévu via Bridge local + Aether Trust. Aucune exécution réelle activée par ce module.</p>',
    '</div>'
  ].join("");

  zone.appendChild(panel);
  panel.addEventListener("toggle",refresh,{passive:true});
  globalThis.setTimeout(refresh,0);
  globalThis.setTimeout(refresh,1200);
  return true;
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();

globalThis.AgentCryptoTraderBtcCaseStudy=Object.freeze({
  mount,
  refresh,
  asset:"BTC",
  private_account:false,
  strategy_a:false,
  real_orders:false
});
})();