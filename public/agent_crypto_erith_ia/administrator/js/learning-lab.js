/* ERITH.IA · Laboratoire IA — navigation pédagogique, aucune exécution ni accès au compte. */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("surface") !== "trader") return;

  const KEY = "agent_crypto_learning_lab_journal";
  const MAX_ENTRIES = 100;
  const ASSETS = Object.freeze({
    BTC: {
      name: "Bitcoin", type: "Référence du marché",
      purpose: "Comparer les stratégies expérimentales à une référence liquide ; ne jamais confondre le prix du marché et le coût de la position.",
      market: "Le graphique, la Lecture technique, le carnet et la profondeur restent propriétaires des cours. Le rapport BTC historique est conservé ci-dessous.",
      vault: "Archives Binance Spot BTCUSDT cotées USDT ; un rapport de source ne constitue ni un prix en USD ni une preuve du coût d’acquisition.",
      risks: "Volatilité, contrepartie, frais d'exécution et différences USD / USDC / USDT.",
      links: [["Bitcoin.org", "https://bitcoin.org/en/"],["OKX", "https://www.okx.com/en-eu/price/bitcoin-btc"],["CoinGecko", "https://www.coingecko.com/en/coins/bitcoin"]]
    },
    CT: {
      name: "Concrete", type: "Nouveau listing · DeFi",
      purpose: "Étudier un jeune marché Spot, l’écart entre historique, carnet et conversion, et la différence entre gain indicatif et vente réalisée.",
      market: "Observations datées des 13–14 octobre 2026 : courbes OKX CT/USDT 5 min, 15 min, 24 h et 7 j (jusqu’à 300 points selon la vue). Prix d’affichage USD parfois dérivé de USDT/USD CoinGecko. La position privée OKX relève de CT/USDC : ce n’est PAS le même instrument.",
      vault: "CT était hors du Top 250 de l’Interface lors de ces captures. Les 300 points de bougies OKX forment un historique externe observé ; ils ne prouvent pas la présence de mois complets certifiés dans le Coffre Top 250.",
      risks: "Jeune cotation, liquidité et spreads variables, ordre minimum (une capture indiquait 10 CT), conversion différente du carnet et sortie effective incertaine.",
      links: [["Concrete", "https://concrete.xyz/"],["OKX · annonce de cotation", "https://www.okx.com/en-us/help/okx-to-list-ct-usdt-concrete-for-spot-trading"],["CoinGecko", "https://www.coingecko.com/en/coins/concrete"]]
    },
    Q: {
      name: "Quack AI", type: "Étude des fortes hausses",
      purpose: "Comprendre une accélération du cours sans traiter un mouvement déjà réalisé comme une opportunité certaine.",
      market: "Capture du 14 octobre 2026 : Q apparaissait parmi les plus fortes hausses, environ +39 % sur 24 h et +93 % sur 7 j. Snapshot daté ; aucun cours actuel n’est fourni par ce dossier.",
      vault: "Comparer le volume, les périodes de cotation, les fenêtres manquantes et les sources exactes avant toute simulation.",
      risks: "Volatilité, liquidité, échéances de distribution des jetons, prix d’achat après forte hausse et slippage.",
      links: [["Site officiel", "https://quackai.ai/"],["CoinGecko", "https://www.coingecko.com/en/coins/quack-ai"]]
    }
  });
  const TABS = [
    ["synthese","Synthèse"],["marche","Marché"],
    ["coffre","Coffre"],["simulation","Simulation"],["journal","Journal IA"]
  ];
  const byId = id => document.getElementById(id);
  const elt = (tag, className, textValue) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  };
  const fmt = (n,unit) => Number.isFinite(n)
    ? new Intl.NumberFormat("fr-FR",{maximumFractionDigits:6}).format(n)+(unit||"") : "—";
  const decimal = value => Number(String(value||"").trim().replace(",","."));
  let asset="BTC", tab="synthese", follow=false, root, legacy, legacySlot, pane, tabsNode, status, report, simulationOutput, journalList, observer;
  function journalRead(){
    try {
      const parsed=JSON.parse(localStorage.getItem(KEY)||"[]");
      return Array.isArray(parsed)?parsed.filter(x=>x&&ASSETS[x.asset]&&typeof x.note==="string").slice(0,MAX_ENTRIES):[];
    } catch (_) { return []; }
  }
  function journalWrite(rows){
    try { localStorage.setItem(KEY,JSON.stringify(rows.slice(0,MAX_ENTRIES)));return true; }
    catch (_) { return false; }
  }
  function card(title,body){
    const a=elt("article","lab-card"),h=elt("h4",null,title),p=elt("p",null,body);
    a.append(h,p);return a;
  }
  function sourceLinks(data){
    const nav=elt("nav","lab-sources");
    nav.setAttribute("aria-label","Sources externes du dossier");
    for (const [name,url] of data.links) {
      const a=elt("a",null,name);a.href=url;a.target="_blank";a.rel="noopener noreferrer";nav.append(a);
    }
    return nav;
  }
  function syncMarket(){
    if (!follow || !root?.open) return;
    const title=(byId("atlasChartInsightOverlayTitle")?.textContent||"").trim();
    // Do not equate a Top 3/Top 5 comparative view with one selected coin.
    const match=/^(BTC|CT|Q)\s*[·:—-]/i.exec(title);
    if (match && ASSETS[match[1].toUpperCase()]) {
      const next=match[1].toUpperCase();
      if (next!==asset) select(next);
    }
  }
  function select(next) {
    if (!ASSETS[next]) return;
    asset=next;
    tab="synthese";
    render();
  }
  function render(){
    if (!pane) return;
    const data=ASSETS[asset];
    byId("lab-asset-label").textContent=asset+" · "+data.name;
    byId("lab-mode").textContent=follow?"Suit le graphique (si actif unique reconnu)":"Dossier épinglé · indépendant du graphique";
    byId("lab-mode-toggle").textContent=follow?"Épingler ce dossier":"Suivre le graphique";
    for (const b of root.querySelectorAll("[data-lab-asset]")) {
      const active=b.dataset.labAsset===asset;
      b.setAttribute("aria-pressed",String(active));
      b.classList.toggle("is-active",active);
    }
    tabsNode.replaceChildren();
    for (const [id,label] of TABS){
      const b=elt("button","lab-tab"+(id===tab?" is-active":""),label);
      b.type="button";b.dataset.labTab=id;b.setAttribute("role","tab");
      b.setAttribute("aria-selected",String(id===tab));
      b.addEventListener("click",()=>{tab=id;render()});
      tabsNode.append(b);
    }
    pane.replaceChildren();
    const h=elt("h3",null,asset+" · "+data.name+" — "+data.type);
    pane.append(h);
    if (tab==="synthese"){
      const grid=elt("div","lab-grid");
      grid.append(
        card("Objet du cas d'école",data.purpose),
        card("Ce que le marché montre",data.market),
        card("Ce que le Coffre prouve",data.vault),
        card("Risques et limites",data.risks)
      );
      pane.append(grid);
      if (asset==="CT"){
        const moment=elt("section","lab-note");
        moment.append(elt("h4",null,"CT · expérience de terrain, chiffres historiques"));
        moment.append(elt("p",null,"13–14 octobre 2026 : une position CT/USDC a été observée en lecture seule dans le Bridge. Les estimations de revente varient selon l’heure et le mécanisme. Aucune quantité détenue, aucun coût privé ni résultat du compte n’est publié dans ce module."));
        moment.append(elt("p",null,"Pour connaître la valeur effective, ouvrir le panneau privé OKX du Trader. Une estimation positive n’est pas un gain réalisé."));
        pane.append(moment);
      }
      if(asset==="BTC"){
        const explanation=elt("p","lab-hint","Le rapport BTC canonique est repris ci-dessous, sans copie ni deuxième moteur.");
        pane.append(explanation,legacySlot);
        legacySlot.append(legacy);
        legacy.style.display="";
      }else if(legacy){legacy.style.display="none";}
      pane.append(sourceLinks(data));
    } else if (tab==="marche"){
      pane.append(card("Marché public",data.market),card("Interprétation prudente",data.risks));
      pane.append(elt("p","lab-hint","Le Laboratoire ne change ni le graphique, ni les bougies, ni l’instrument du carnet. Les prix live sont à lire dans les panneaux originaux du Trader."));
    } else if(tab==="coffre"){
      pane.append(card("Disponibilité des preuves",data.vault));
      const link=elt("a","lab-link","Ouvrir le Coffre historique vérifié ↗");
      link.href="../administrator/historical-vault.html";link.target="_blank";link.rel="noopener noreferrer";pane.append(link);
    } else if(tab==="simulation"){
      renderSimulation();
    } else if(tab==="journal"){
      renderJournal();
    }
  }
  function labeledNumber(label,placeholder){
    const wrap=elt("label","lab-field"),name=elt("span",null,label),input=elt("input");
    input.type="text";input.inputMode="decimal";input.placeholder=placeholder;input.maxLength=28;
    wrap.append(name,input);return [wrap,input];
  }
  function renderSimulation(){
    pane.append(elt("p","lab-hint","Calcul hypothétique en devise de cotation unique. Aucun carnet ni ordre OKX utilisé ; le prix d’entrée et le prix de sortie sont saisis manuellement."));
    const grid=elt("div","lab-form-grid"),fields=[
      ["Capital fictif (USDC ou USDT)","4,00"],
      ["Prix d’entrée (même devise)","0,35"],
      ["Prix de sortie (même devise)","0,38"],
      ["Frais par opération (%)","0,2"],
      ["Glissement à la sortie (%)","0,1"]
    ],inputs=[];
    for(const [label,placeholder] of fields){const [field,input]=labeledNumber(label,placeholder);grid.append(field);inputs.push(input);}
    const button=elt("button","lab-action","Calculer une simulation");
    button.type="button";
    const output=elt("output","lab-note","Renseigne les cinq paramètres, puis calcule.");
    button.addEventListener("click",()=>{
      const [capital,entry,exit,fee,slip]=inputs.map(x=>decimal(x.value));
      if (![capital,entry,exit,fee,slip].every(Number.isFinite) || capital<=0 || entry<=0 || exit<=0 ||
          fee<0 || fee>=100 || slip<0 || slip>=100) {
        output.textContent="Saisie incomplète ou invalide : valeurs positives, frais et glissement entre 0 et 100 %.";return;
      }
      const bought=capital*(1-fee/100)/entry;
      const sold=bought*exit*(1-slip/100)*(1-fee/100);
      output.textContent="Quantité fictive : "+fmt(bought)+" "+asset+" · revente nette simulée : "+
        fmt(sold," unité(s) de cotation")+" · écart : "+fmt(sold-capital)+" ("+
        fmt((sold/capital-1)*100," %")+"). Prix, frais et glissement sont hypothétiques ; aucune exécution réelle.";
    });
    pane.append(grid,button,output);
  }
  function renderJournal(){
    const form=elt("form","lab-journal-form"),text=elt("textarea","lab-textarea");
    text.placeholder="Hypothèse formulée AVANT le résultat ; données disponibles, raison, risque, horizon…";
    text.required=true;text.maxLength=1200;text.rows=3;
    const btn=elt("button","lab-action","Enregistrer localement");btn.type="submit";
    const feedback=elt("p","lab-hint","Sans solde privé ni clé API. Conservé dans ce navigateur uniquement.");
    const list=elt("div","lab-journal-list");
    function updateList(){
      list.replaceChildren();
      const records=journalRead().filter(x=>x.asset===asset);
      if(!records.length){list.append(elt("p","lab-hint","Aucune hypothèse enregistrée pour "+asset+"."));return;}
      for (const item of records){
        const article=elt("article","lab-card");
        article.append(elt("small",null,new Date(item.at).toLocaleString("fr-FR")+" · hypothèse initiale"),elt("p",null,item.note));
        list.append(article);
      }
    }
    form.addEventListener("submit",event=>{
      event.preventDefault();
      const note=text.value.trim();
      if(!note){feedback.textContent="Formule une hypothèse avant de l’enregistrer.";return;}
      const entry={asset,note:note.slice(0,1200),at:new Date().toISOString(),kind:"observation",real_order:false};
      const saved=journalWrite([entry,...journalRead()]);
      feedback.textContent=saved?"Hypothèse horodatée et conservée localement. Aucune opération réelle.":"Stockage indisponible : copie ton texte avant de quitter.";
      if(saved){text.value="";updateList();}
    });
    form.append(text,btn);
    pane.append(form,feedback,list);
    updateList();
  }
  function init(){
    if(byId("agentCryptoLearningLab"))return;
    legacy=byId("traderOkbCaseStudy");
    if(!legacy || !legacy.parentNode)return;
    root=elt("details","agent-learning-lab");
    root.id="agentCryptoLearningLab";
    root.setAttribute("aria-label","Laboratoire IA · dossiers de recherche");
    const summary=elt("summary","lab-summary");
    summary.append(elt("span","lab-kicker","LABORATOIRE IA"),elt("strong",null,"Cas d’école · BTC / CT / Q"),elt("small",null,"Navigation en largeur · recherche en longueur · lecture seule"));
    const body=elt("div","lab-body"),header=elt("div","lab-header");
    const picker=elt("div","lab-picker");
    for(const [id,data] of Object.entries(ASSETS)){
      const b=elt("button","lab-asset",id+" · "+data.name);b.type="button";b.dataset.labAsset=id;
      b.addEventListener("click",()=>select(id));picker.append(b);
    }
    const modeButton=elt("button","lab-action lab-mode-toggle");modeButton.id="lab-mode-toggle";modeButton.type="button";
    modeButton.addEventListener("click",()=>{follow=!follow;render();syncMarket();});
    header.append(picker,modeButton);
    const assetLabel=elt("p","lab-current");assetLabel.id="lab-asset-label";
    const modeLabel=elt("p","lab-hint");modeLabel.id="lab-mode";
    tabsNode=elt("div","lab-tabs");tabsNode.setAttribute("role","tablist");tabsNode.setAttribute("aria-label","Rubriques du Laboratoire");
    pane=elt("div","lab-pane");
    pane.id="lab-content";pane.setAttribute("role","tabpanel");
    legacySlot=elt("section","lab-btc-report");
    body.append(header,assetLabel,modeLabel,tabsNode,pane);
    root.append(summary,body);
    legacy.parentNode.insertBefore(root,legacy);
    // Move, do not clone the previously validated BTC case. Other surfaces are unchanged.
    legacySlot.append(legacy);
    root.addEventListener("toggle",()=>{if(root.open)syncMarket();});
    const graphTitle=byId("atlasChartInsightOverlayTitle");
    if(graphTitle && typeof MutationObserver==="function"){
      observer=new MutationObserver(()=>syncMarket());
      observer.observe(graphTitle,{childList:true,characterData:true,subtree:true});
    }
    render();
    window.AgentCryptoLearningLab=Object.freeze({
      read:()=>({asset,tab,mode:follow?"follow":"pinned",read_only:true,real_order:false}),
      select:next=>select(String(next||"").toUpperCase()),
      source:"local_read_only"
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
