/* Agent-Crypto @erith.IA — Atlas Decision Context
   Introduced by Administrator 40.6.114.
   Purpose: compose existing read-only truths into one descriptive operator context.
   Sources: market/oracle presentation, CEX+DEX Source Intelligence, News Event Intelligence,
   Strategy A state and TRADUS shadow state.
   No fetch, recurring timer, MutationObserver, storage write, strategy mutation,
   canonical price, wallet, order or financial signal. */
(()=>{
  "use strict";

  const OWNER="atlas-decision-context";
  const ROOT_ID="atlasDecisionContext";
  const STYLE_ID="atlasDecisionContextStyle";
  let lastModel=null;

  const upper=value=>String(value??"").trim().toUpperCase();
  const finite=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search).get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"runtime").trim();

  function safeCall(fn,fallback=null){try{return typeof fn==="function"?fn():fallback;}catch(_){return fallback;}}

  function readOracleAndMarket(){
    const oracleNode=document.getElementById("atlasOracleV0")||document.querySelector('[data-atlas-oracle], [aria-label*="Oracle"]');
    const local=String(oracleNode?.innerText||"").replace(/\u00a0/g," ");
    const body=String(document.body?.innerText||"").replace(/\u00a0/g," ");
    const text=local||body;
    const bias=text.match(/Biais mesur[ée]\s*:\s*([A-ZÀ-Ü_-]+)/i)?.[1]||text.match(/ORACLE\s+(?:OP[ÉE]RATEUR\s*)?.*?\b(MIXTE|HAUSSIER|BAISSIER|NEUTRE)\b/i)?.[1]||null;
    const confidence=finite(text.match(/Confiance donn[ée]es\s*(\d+)\s*\/\s*100/i)?.[1]||text.match(/CONF\.?\s*(\d+)\s*\/\s*100/i)?.[1]);
    const direction=finite(text.match(/Atlas\s*:\s*[^\n]*?score direction\s*(-?\d+)\s*\/\s*100/i)?.[1]);

    let positive=null,negative=null,stable=null;
    const breadth=body.match(/Top\s*5\s*:\s*(\d+)\s*\/\s*5\s*positifs?\s*[·\-–—,; ]+\s*(\d+)\s*n[ée]gatifs?/i);
    if(breadth){positive=finite(breadth[1]);negative=finite(breadth[2]);stable=positive!==null&&negative!==null?Math.max(0,5-positive-negative):null;}
    const broadMarket=body.match(/(\d+)\s*hausses?\s*[·\-–—,; ]+\s*(\d+)\s*baisses?\s*[·\-–—,; ]+\s*(\d+)\s*stables?/i);
    const marketUp=finite(broadMarket?.[1]),marketDown=finite(broadMarket?.[2]),marketStable=finite(broadMarket?.[3]);
    const marketTone=marketUp!==null&&marketDown!==null
      ? (marketUp>marketDown?"POSITIVE":marketDown>marketUp?"NÉGATIVE":"PARTAGÉE")
      : (positive!==null&&negative!==null?(positive>negative?"POSITIVE":negative>positive?"NÉGATIVE":"PARTAGÉE"):"INCONNUE");

    return Object.freeze({
      oracle:Object.freeze({bias:bias?upper(bias):"INCONNU",confidence,direction_score:direction}),
      market:Object.freeze({tone:marketTone,top5_positive:positive,top5_negative:negative,top5_stable:stable,breadth_up:marketUp,breadth_down:marketDown,breadth_stable:marketStable})
    });
  }

  function readSources(){
    const api=globalThis.ErithPrivateBackendSources4054;
    const intel=safeCall(api?.sourceIntelligence,null);
    const cex=safeCall(api?.snapshot,null);
    const dexDiag=safeCall(globalThis.AgentCryptoDexExclusionDiagnostics?.report,null);
    return Object.freeze({
      state:String(intel?.state||"unknown").toLowerCase(),
      cex_comparable:finite(intel?.cex?.comparable_assets),
      cex_total:finite(intel?.cex?.total_assets),
      cex_max_spread_pct:finite(intel?.cex?.max_spread_pct),
      dex_eligible:finite(intel?.dex?.atlas_eligible),
      dex_total:finite(intel?.dex?.total_assets),
      dex_proved:finite(intel?.dex?.identity_proved),
      dex_bounded:finite(intel?.dex?.identity_bounded),
      dex_mismatch:finite(intel?.dex?.address_mismatch),
      dex_anomalies:finite(intel?.dex?.liquidity_review),
      freshness_seconds:finite(intel?.freshness?.max_age_seconds),
      dex_excluded:finite(dexDiag?.excluded_assets),
      dex_reasons:clone(dexDiag?.reasons)||{},
      cex_available:Boolean(cex)
    });
  }

  function readNews(){
    const current=safeCall(globalThis.AtlasEventIntelligence405000?.current,null);
    if(!current)return Object.freeze({state:"NO_DATA",headline:null,evidence:null,impact:null,action:null,causal_claim:false});
    return Object.freeze({
      state:"READY",
      headline:String(current?.language?.display_headline||current?.language?.headline_original||current?.event_label||"Événement qualifié"),
      family:String(current?.event_family||"market_event"),
      evidence:finite(current?.evidence?.score),
      impact:finite(current?.impact?.score),
      action:String(current?.decision?.action||"OBSERVATION"),
      causal_claim:current?.causal_claim===true
    });
  }

  function readStrategy(){
    const reader=globalThis.AgentCryptoTradusStrategyReconcile406105;
    const raw=safeCall(reader?.readStrategyA,{decision:"INCONNU",phase:null,direction_score:null})||{decision:"INCONNU"};
    const state=globalThis.AgentCryptoTradusStrategyFailClosed?.stateOf?.(raw)||"UNKNOWN";
    return Object.freeze({decision:String(raw.decision||"INCONNU"),phase:raw.phase||null,direction_score:finite(raw.direction_score),state});
  }

  function readTradus(strategy){
    const row=clone(safeCall(globalThis.AgentCryptoTradusShadow406066?.read,null));
    if(!row)return Object.freeze({state:"NO_DATA",action:"NO_TRADE",imbalance:null,spread:null,comparison:"EN ATTENTE",fresh:false});
    const action=upper(row?.signal?.action||"NO_TRADE")||"NO_TRADE";
    const age=(()=>{const at=Date.parse(String(row?.at||""));return Number.isFinite(at)?Math.max(0,(Date.now()-at)/1000):null;})();
    const fresh=row?.ok===true&&age!==null&&age<=15;
    const comparison=globalThis.AgentCryptoTradusStrategyFailClosed?.compare?.(strategy,row?.signal)||row?.comparison||{state:"NON COMPARABLE"};
    return Object.freeze({
      state:row?.ok===true?(fresh?"FRESH":"STALE"):"UNAVAILABLE",
      action,
      imbalance:finite(row?.signal?.imbalance),
      spread:finite(row?.signal?.spread_ratio),
      comparison:String(comparison?.state||"NON COMPARABLE"),
      comparison_text:String(comparison?.text||""),
      fresh
    });
  }

  function descriptiveDirection(market,tradus,oracle){
    const notes=[];
    if(market?.tone==="NÉGATIVE"&&tradus?.action==="SELL")notes.push("Marché et TRADUS orientés vendeurs");
    if(market?.tone==="POSITIVE"&&tradus?.action==="BUY")notes.push("Marché et TRADUS orientés acheteurs");
    if(Number.isFinite(oracle?.direction_score)&&oracle.direction_score<=-12&&tradus?.action==="SELL")notes.push("Atlas directionnel et TRADUS convergent à la baisse");
    if(Number.isFinite(oracle?.direction_score)&&oracle.direction_score>=12&&tradus?.action==="BUY")notes.push("Atlas directionnel et TRADUS convergent à la hausse");
    return notes;
  }

  function buildModel(parts){
    const market=parts.market||{},oracle=parts.oracle||{},sources=parts.sources||{},news=parts.news||{},strategy=parts.strategy||{},tradus=parts.tradus||{};
    const convergence=descriptiveDirection(market,tradus,oracle);
    const divergences=[];
    const blockers=[];

    if(upper(oracle.bias)==="MIXTE"||upper(oracle.bias)==="NEUTRE")divergences.push(`Oracle ${upper(oracle.bias)}`);
    if(["WAIT","OFF","STOP","UNKNOWN"].includes(upper(strategy.state))&&["BUY","SELL"].includes(upper(tradus.action)))divergences.push(`Strategy A ${strategy.decision||strategy.state} ne confirme pas TRADUS ${tradus.action}`);
    if(tradus.state==="STALE")blockers.push("TRADUS à rafraîchir");
    if(sources.state!=="ready")blockers.push("Source Intelligence partielle");
    if(Number.isFinite(sources.dex_total)&&Number.isFinite(sources.dex_eligible)&&sources.dex_eligible<sources.dex_total)blockers.push(`DEX ${sources.dex_eligible}/${sources.dex_total} éligibles Atlas`);
    if(news.state==="NO_DATA")blockers.push("News Intelligence indisponible");
    if(upper(strategy.state)==="STOP")blockers.push("Strategy A en STOP");
    if(upper(strategy.state)==="UNKNOWN")blockers.push("Strategy A inconnue");

    const known=[market.tone!=="INCONNUE",upper(oracle.bias)!=="INCONNU",sources.state!=="unknown",news.state!=="NO_DATA",upper(strategy.state)!=="UNKNOWN",tradus.state!=="NO_DATA"].filter(Boolean).length;
    let verdict="OBSERVER";
    if(known<4)verdict="INCOMPLET";
    else if(upper(strategy.state)==="STOP")verdict="STOP / OBSERVER";
    else if(blockers.length===0&&convergence.length>=1&&!["MIXTE","NEUTRE","INCONNU"].includes(upper(oracle.bias)))verdict="COHÉRENCE DESCRIPTIVE";
    else if(convergence.length>=1)verdict="CONVERGENCE DESCRIPTIVE · OBSERVER";

    const summary=[];
    if(market.tone&&market.tone!=="INCONNUE")summary.push(`marché ${market.tone.toLowerCase()}`);
    if(oracle.bias&&upper(oracle.bias)!=="INCONNU")summary.push(`Oracle ${oracle.bias}${Number.isFinite(oracle.confidence)?` ${oracle.confidence}/100`:""}`);
    if(strategy.decision)summary.push(`Strategy A ${strategy.decision}`);
    if(tradus.action)summary.push(`TRADUS ${tradus.action}`);
    if(sources.state!=="unknown")summary.push(`sources ${sources.state==="ready"?"prêtes":"partielles"}`);

    return Object.freeze({
      schema:"agent_crypto_atlas_decision_context_v1",
      owner:OWNER,
      build:runtimeBuild(),
      generated_at_utc:new Date().toISOString(),
      market:Object.freeze({...market}),oracle:Object.freeze({...oracle}),sources:Object.freeze({...sources}),news:Object.freeze({...news}),strategy:Object.freeze({...strategy}),tradus:Object.freeze({...tradus}),
      convergence:Object.freeze(convergence),divergences:Object.freeze(divergences),blockers:Object.freeze(blockers),
      completeness:`${known}/6`,
      verdict,
      summary:summary.join(" · "),
      stop_point:blockers.length?blockers.join(" · "):"Aucun verrou technique supplémentaire détecté ; validation humaine maintenue.",
      contract:Object.freeze({read_only:true,descriptive_only:true,financial_signal:false,automatic_order:false,canonical_price_created:false,strategy_mutation:false,market_data_mutation:false,fetch:false,recurring_timer:false,observer:false,storage_write:false})
    });
  }

  function snapshot(){
    const om=readOracleAndMarket();
    const strategy=readStrategy();
    return buildModel({market:om.market,oracle:om.oracle,sources:readSources(),news:readNews(),strategy,tradus:readTradus(strategy)});
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}{margin:12px 0;padding:14px;border:1px solid rgba(94,232,207,.32);border-radius:14px;background:linear-gradient(135deg,rgba(4,26,37,.91),rgba(11,17,38,.92));box-shadow:0 14px 32px rgba(0,0,0,.16),inset 0 0 0 1px rgba(255,255,255,.025)}
      #${ROOT_ID} .adc-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
      #${ROOT_ID} .adc-kicker{font-size:8px;font-weight:950;letter-spacing:.16em;text-transform:uppercase;color:#74f2dc}
      #${ROOT_ID} .adc-title{margin:3px 0 0;font-size:15px;font-weight:950;color:#fff1b3}
      #${ROOT_ID} .adc-sub{margin-top:4px;font-size:9px;line-height:1.5;opacity:.76}
      #${ROOT_ID} .adc-verdict{padding:8px 11px;border-radius:999px;border:1px solid rgba(255,217,125,.38);background:rgba(255,217,125,.08);font-size:9px;font-weight:950;color:#ffe39a;white-space:nowrap}
      #${ROOT_ID} .adc-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:12px}
      #${ROOT_ID} .adc-card{padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(2,14,23,.52);min-width:0}
      #${ROOT_ID} .adc-card span{display:block;font-size:7px;font-weight:950;letter-spacing:.09em;text-transform:uppercase;opacity:.64}
      #${ROOT_ID} .adc-card b{display:block;margin-top:4px;font-size:10.5px;line-height:1.35;overflow-wrap:anywhere}
      #${ROOT_ID} .adc-card small{display:block;margin-top:4px;font-size:7.5px;line-height:1.4;opacity:.68}
      #${ROOT_ID} .adc-read{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
      #${ROOT_ID} .adc-box{padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.07);background:rgba(1,10,18,.44);font-size:8.5px;line-height:1.5}
      #${ROOT_ID} .adc-box strong{color:#7ff0d5}
      #${ROOT_ID} .adc-stop{margin-top:8px;padding:9px 10px;border-left:3px solid #ffd97d;background:rgba(255,217,125,.055);font-size:8.5px;line-height:1.5}
      #${ROOT_ID}[data-verdict^="INCOMPLET"] .adc-verdict,#${ROOT_ID}[data-verdict^="STOP"] .adc-verdict{border-color:rgba(255,133,151,.44);color:#ff9eae;background:rgba(255,93,120,.07)}
      @media(max-width:1100px){#${ROOT_ID} .adc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#${ROOT_ID} .adc-read{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot(){
    let root=document.getElementById(ROOT_ID);
    if(root)return root;
    const anchor=document.getElementById("decisionDualMemory395")||document.getElementById("decisionMemoryV2")||document.getElementById("decision-board");
    if(!anchor)return null;
    ensureStyle();
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.setAttribute("aria-label","Atlas Decision Context · lecture seule");
    root.innerHTML=`
      <div class="adc-head"><div><div class="adc-kicker">ATLAS DECISION CONTEXT · READ ONLY</div><h3 class="adc-title">Convergence, contradictions et raison d’attendre</h3><div class="adc-sub">Les moteurs restent indépendants. Cette carte ne recalibre rien et ne produit aucun ordre.</div></div><div class="adc-verdict" data-adc="verdict">EN ATTENTE</div></div>
      <div class="adc-grid">
        <article class="adc-card"><span>Marché</span><b data-adc="market">—</b><small data-adc="market-detail">largeur observée</small></article>
        <article class="adc-card"><span>Oracle</span><b data-adc="oracle">—</b><small data-adc="oracle-detail">biais + confiance</small></article>
        <article class="adc-card"><span>Sources</span><b data-adc="sources">—</b><small data-adc="sources-detail">CEX + DEX qualifié</small></article>
        <article class="adc-card"><span>News</span><b data-adc="news">—</b><small data-adc="news-detail">preuve sans causalité forcée</small></article>
        <article class="adc-card"><span>Strategy A</span><b data-adc="strategy">—</b><small data-adc="strategy-detail">état du pilote Paper</small></article>
        <article class="adc-card"><span>TRADUS</span><b data-adc="tradus">—</b><small data-adc="tradus-detail">shadow microstructure</small></article>
      </div>
      <div class="adc-read"><div class="adc-box"><strong>Convergences descriptives</strong><div data-adc="convergence">—</div></div><div class="adc-box"><strong>Contradictions / réserves</strong><div data-adc="divergences">—</div></div></div>
      <div class="adc-stop"><strong>STOP POINT · </strong><span data-adc="stop">—</span></div>`;
    anchor.insertAdjacentElement("afterend",root);
    return root;
  }

  function set(root,key,value){const node=root?.querySelector?.(`[data-adc="${key}"]`);if(node)node.textContent=String(value??"—");}

  function render(){
    const root=ensureRoot();
    if(!root)return null;
    const model=snapshot();lastModel=model;
    root.dataset.verdict=model.verdict;
    root.dataset.owner=OWNER;
    set(root,"verdict",model.verdict);
    const m=model.market;
    set(root,"market",m.tone||"INCONNU");
    set(root,"market-detail",Number.isFinite(m.breadth_up)?`${m.breadth_up} hausses · ${m.breadth_down} baisses · ${m.breadth_stable} stables`:Number.isFinite(m.top5_positive)?`Top 5 · ${m.top5_positive} positifs · ${m.top5_negative} négatifs`:"largeur non lue");
    set(root,"oracle",`${model.oracle.bias}${Number.isFinite(model.oracle.confidence)?` · ${model.oracle.confidence}/100`:""}`);
    set(root,"oracle-detail",Number.isFinite(model.oracle.direction_score)?`score direction ${model.oracle.direction_score}/100`:"direction non lue");
    set(root,"sources",model.sources.state==="ready"?"CEX/DEX FILTRÉS":"PARTIEL");
    set(root,"sources-detail",`${Number.isFinite(model.sources.cex_comparable)?`CEX ${model.sources.cex_comparable}/${model.sources.cex_total}`:"CEX —"} · ${Number.isFinite(model.sources.dex_eligible)?`DEX ${model.sources.dex_eligible}/${model.sources.dex_total} Atlas`:"DEX —"}`);
    set(root,"news",model.news.state==="READY"?(model.news.action||"OBSERVATION"):"INDISPONIBLE");
    set(root,"news-detail",model.news.state==="READY"?`${model.news.family}${Number.isFinite(model.news.evidence)?` · preuve ${model.news.evidence}/100`:""}`:"aucun événement courant structuré");
    set(root,"strategy",`${model.strategy.decision||"INCONNU"}`);
    set(root,"strategy-detail",Number.isFinite(model.strategy.direction_score)?`direction ${model.strategy.direction_score}/100 · état ${model.strategy.state}`:`état ${model.strategy.state}`);
    set(root,"tradus",`${model.tradus.action||"NO_TRADE"}`);
    set(root,"tradus-detail",`${model.tradus.state}${Number.isFinite(model.tradus.imbalance)?` · imbalance ${(model.tradus.imbalance*100).toFixed(1)} %`:""} · ${model.tradus.comparison}`);
    set(root,"convergence",model.convergence.length?model.convergence.join(" · "):"Aucune convergence directionnelle suffisante.");
    set(root,"divergences",[...model.divergences,...model.blockers].length?[...model.divergences,...model.blockers].join(" · "):"Aucune contradiction majeure détectée.");
    set(root,"stop",`${model.stop_point} · Aucun ordre automatique.`);
    document.documentElement.dataset.atlasDecisionContext=model.verdict.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    try{document.dispatchEvent(new CustomEvent("agentcrypto:atlas-decision-context",{detail:model}));}catch(_){}
    return model;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){try{render();}catch(__){}}});}

  ["erith:source-intelligence","agentcrypto:dex-exclusion-diagnostics","agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle","agentcrypto:current-finalized"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  document.addEventListener("click",event=>{const label=upper(event.target instanceof Element?event.target.closest("button")?.innerText:"");if(/RAFRAÎCHIR|RELANCER|FORCER|TRADUS|D[ÉE]CISION/.test(label))schedule();},true);
  if(document.readyState==="complete")schedule();else window.addEventListener("load",schedule,{once:true,passive:true});

  function selfTest(){
    const base={market:{tone:"NÉGATIVE"},oracle:{bias:"MIXTE",confidence:87,direction_score:-4},sources:{state:"partial",dex_eligible:3,dex_total:5},news:{state:"READY"},strategy:{decision:"NO TRADE",state:"WAIT"},tradus:{state:"FRESH",action:"SELL"}};
    const a=buildModel(base);
    const b=buildModel({market:{tone:"INCONNUE"},oracle:{bias:"INCONNU"},sources:{state:"unknown"},news:{state:"NO_DATA"},strategy:{decision:"INCONNU",state:"UNKNOWN"},tradus:{state:"NO_DATA",action:"NO_TRADE"}});
    const c=buildModel({market:{tone:"POSITIVE"},oracle:{bias:"HAUSSIER",confidence:90,direction_score:20},sources:{state:"ready",dex_eligible:5,dex_total:5},news:{state:"READY"},strategy:{decision:"PAPER",state:"PAPER"},tradus:{state:"FRESH",action:"BUY"}});
    const checks=[
      a.verdict.includes("OBSERVER")&&a.convergence.length===1&&a.contract.financial_signal===false,
      b.verdict==="INCOMPLET"&&b.contract.automatic_order===false,
      c.verdict==="COHÉRENCE DESCRIPTIVE"&&c.contract.strategy_mutation===false,
      c.contract.fetch===false&&c.contract.recurring_timer===false&&c.contract.storage_write===false
    ];
    return Object.freeze({pass:checks.every(Boolean),total:checks.length,passed:checks.filter(Boolean).length,checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoAtlasDecisionContext=Object.freeze({owner:OWNER,build:runtimeBuild(),snapshot,render,selfTest,read_only:true,descriptive_only:true,financial_signal:false,automatic_order:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,strategy_mutation:false,trading:false,wallet:false});
})();
