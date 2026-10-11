(()=>{
"use strict";
const BUILD="40.6.626";
const frame=document.getElementById("traderInterfaceRuntime");
const status=document.getElementById("traderBootstrapStatus");
if(!frame)return;

function mount(){
  let win,doc;
  try{win=frame.contentWindow;doc=frame.contentDocument||win?.document;}catch(_){return false;}
  if(!doc?.documentElement||!doc?.body)return false;

  doc.documentElement.dataset.agentCryptoSurface="trader";
  doc.body.classList.add("atlas-trader-runtime-mirror");
  doc.body.dataset.traderRuntimeMirror=BUILD;

  if(!doc.getElementById("agentCryptoTraderRuntimeMirrorStyle")){
    const style=doc.createElement("style");
    style.id="agentCryptoTraderRuntimeMirrorStyle";
    style.textContent=[
      "body.atlas-trader-runtime-mirror main.shell > :not(#accueil):not(#livecheck):not(#market-zone){display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-view-switcher{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-atlas-essential-target]:not([data-atlas-essential-target='livecheck']):not([data-atlas-essential-target='market-workspace']):not([data-atlas-essential-target='analyste']){display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced.atlas-admin-dock{display:flex!important;flex:0 0 auto!important;margin-left:auto!important;width:auto!important;min-width:max-content!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced .atlas-admin-command-bar{display:flex!important;align-items:center!important;width:auto!important;min-width:0!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced .atlas-admin-command-shortcuts,body.atlas-trader-runtime-mirror #accueil #atlasAdminGraphToggle,body.atlas-trader-runtime-mirror #accueil #atlasAdminCenterToggle,body.atlas-trader-runtime-mirror #accueil #atlasAdminCenterDrawer{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil #atlasAetherStatusToggle{display:inline-flex!important}",
      "body.atlas-trader-runtime-mirror #atlasMarketDomainSwitch{pointer-events:none!important;cursor:default!important}",
      "body.atlas-trader-runtime-mirror #market-zone{margin-top:12px}",
      "body.atlas-trader-runtime-mirror .shell{padding-bottom:28px}"
    ].join("\n");
    doc.head.appendChild(style);
  }

  const hero=doc.getElementById("accueil");
  const eyebrow=hero?.querySelector(".title-block > .eyebrow");
  const brand=hero?.querySelector(".brandline");
  if(eyebrow)eyebrow.textContent="ERITH.IA · TRADING DESK";
  if(brand){
    const left=brand.querySelector("span"),right=brand.querySelector("strong");
    if(left)left.textContent="Agent-Crypto";
    if(right)right.textContent="· Trader";
  }

  const adminLink=doc.getElementById("traderSurfaceAdminLink");
  if(adminLink){
    adminLink.href="../administrator/index.html";
    adminLink.target="_top";
    adminLink.rel="noopener";
    adminLink.setAttribute("aria-label","Ouvrir Administrator");
    adminLink.setAttribute("title","Ouvrir Administrator");
  }

  const marketSwitch=doc.getElementById("atlasMarketDomainSwitch");
  if(marketSwitch){
    marketSwitch.setAttribute("aria-label","Marché Crypto · runtime Interface partagé");
    marketSwitch.setAttribute("title","Trader : marché Crypto partagé avec l’Interface");
    marketSwitch.disabled=true;
  }

  // Reuse the existing Trader case-study block from the shared runtime and retarget it to BTC here only.
  const caseStudy=doc.getElementById("traderOkbCaseStudy");
  if(caseStudy){
    caseStudy.dataset.traderCaseStudy="BTC";
    caseStudy.setAttribute("aria-label","Cas d’école BTC · lecture terrain du Trader");
    caseStudy.innerHTML=[
      '<summary>',
        '<span class="okb-case-kicker">CAS D’ÉCOLE</span>',
        '<span class="okb-case-title">BTC · lecture terrain · marché → historique → compte OKX</span>',
        '<span class="okb-case-summary-metrics" aria-label="Résumé du cas d’école BTC">',
          '<span>BTC actif de référence</span>',
          '<span>Coffre conservé</span>',
          '<span>OKX public actif</span>',
          '<span>Compte privé : prochaine étape</span>',
        '</span>',
        '<span class="okb-case-chevron" aria-hidden="true">⌄</span>',
      '</summary>',
      '<div class="okb-case-body">',
        '<div class="okb-case-meta">',
          '<span><b>But :</b> rendre lisible une opération BTC de bout en bout</span>',
          '<span><b>Règle :</b> aucune fusion silencieuse des sources</span>',
          '<span><b>Exécution réelle :</b> non activée à ce stade</span>',
        '</div>',
        '<div class="okb-case-grid">',
          '<article class="okb-case-card">',
            '<h3>1 · BTC devient le cas d’école central</h3>',
            '<p>BTC sert de référence pour vérifier la cohérence entre <strong>Market, Graphique, Lecture Technique, Bougies et Carnet</strong>. Le Trader doit montrer la même sélection d’actif partout.</p>',
            '<p>Ce panneau ne fixe aucun prix et ne fabrique aucune valeur : il décrit le parcours opérateur.</p>',
          '</article>',
          '<article class="okb-case-card">',
            '<h3>2 · Historique vérifié : on le garde</h3>',
            '<p>Le lecteur historique reste relié au <strong>Coffre vérifié</strong>. Les archives Binance Spot USDT restent distinctes des données live et distinctes des bougies OKX publiques.</p>',
            '<p>Le Coffre sert de mémoire et de preuve historique ; il ne devient pas un moteur d’ordre.</p>',
          '</article>',
          '<article class="okb-case-card">',
            '<h3>3 · OKX public : marché et microstructure</h3>',
            '<p>Les bougies et le carnet OKX publics continuent de fournir la lecture de l’instrument : bid, ask, spread, profondeur et chandelles.</p>',
            '<p><strong>Cette couche ne lit pas le compte personnel.</strong> Elle reste séparée des données privées.</p>',
          '</article>',
          '<article class="okb-case-card okb-case-warning">',
            '<h3>4 · Compte OKX privé : prochaine couche</h3>',
            '<p>Le compte réel doit passer par le <strong>backend local / Bridge</strong> puis l’authentification <strong>Aether Trust</strong>. Les secrets ne doivent jamais être exposés dans GitHub Pages ni dans le navigateur.</p>',
            '<p>Première cible : lecture du compte réel — soldes, ordres, exécutions et frais — avant toute permission d’envoi d’ordre.</p>',
          '</article>',
          '<article class="okb-case-card">',
            '<h3>5 · Ce que le Trader devra rendre lisible</h3>',
            '<p>Pour BTC, l’opérateur devra pouvoir lire au même endroit : <strong>solde BTC, solde de cotation, ordre ouvert, ordre exécuté, prix d’exécution, quantité, frais et historique</strong>.</p>',
            '<p>Le but est précisément d’éviter l’illisibilité rencontrée sur l’interface OKX.</p>',
          '</article>',
          '<article class="okb-case-card okb-case-warning">',
            '<h3>6 · Strategy A n’appartient plus à ce parcours Trader</h3>',
            '<p>Strategy A reste dans l’Interface Administrator, mais n’est plus chargée dans le Trader. Le chantier BTC du Trader est maintenant séparé du chantier Strategy A.</p>',
            '<p>La suite logique est donc : <strong>lecture privée OKX via Bridge + Trust</strong>, puis seulement plus tard l’exécution réelle avec validations explicites.</p>',
          '</article>',
        '</div>',
        '<p class="okb-case-foot">Cas BTC du Trader · Coffre conservé · OKX public conservé · Strategy A sortie du Trader · compte privé non connecté à ce stade.</p>',
      '</div>'
    ].join("");
  }

  // Inject only a standalone, read-only R9 viewer into the SAME runtime.
  if(!doc.getElementById("traderHistoricalPanelScript")){
    const script=doc.createElement("script");
    script.id="traderHistoricalPanelScript";
    script.src=new URL("../trader/trader-historical-panel.js?reader=top50-cohorts",doc.baseURI).href;
    doc.head.appendChild(script);
  }
  const traderBadge=doc.getElementById("traderSurfaceBadge");
  if(traderBadge)traderBadge.textContent="TRADER · "+BUILD;

  doc.title="ERITH.IA · Trading Desk — "+BUILD;
  try{
    win.dispatchEvent(new CustomEvent("agent-crypto:trader-runtime-mirror",{detail:{
      build:BUILD,
      administrator_runtime:true,
      filtered_presentation_only:true,
      real_orders:false,
      native_header:true,
      header_injection:false,
  minimum_nav:true,
  minimum_nav_items:Object.freeze(["Livecheck","Marché","Graphique","Aether"]),
      btc_case_study:true,
      btc_case_study_owner:"trader-runtime-mirror.js",
      strategy_a_in_trader:false
    }}));
  }catch(_){}

  if(status){
    status.textContent="Interface Administrator montée · filtrage Trader actif";
    status.dataset.state="ready";
  }
  frame.dataset.ready="true";
  return true;
}

frame.addEventListener("load",()=>{
  if(!mount()&&status){
    status.textContent="Interface chargée mais filtrage Trader indisponible";
    status.dataset.state="error";
  }
},{once:false});

globalThis.AgentCryptoTraderRuntimeMirror=Object.freeze({
  build:BUILD,
  mount,
  frame:()=>frame,
  administrator_runtime:true,
  filtered_presentation_only:true,
  duplicated_market_owner:false,
  duplicated_chart_owner:false,
  duplicated_math_owner:false,
  duplicated_detail_owner:false,
  real_orders:false,
  native_header:true,
  header_injection:false,
  btc_case_study:true,
  btc_case_study_owner:"trader/trader-btc-case-study.js",
  strategy_a_in_trader:false
});
})();