/* Agent-Crypto @erith.IA — Operator Cockpit
   Administrator 40.6.116.
   Human-readable read-only cockpit over existing Strategy A / TRADUS / Paper truths.
   It does not calculate a new market signal and does not alter any engine.
   No fetch, recurring timer, MutationObserver, storage write, wallet or order path. */
(()=>{
  "use strict";

  const OWNER="operator-cockpit";
  const ROOT_ID="agentCryptoOperatorCockpit";
  const STYLE_ID="agentCryptoOperatorCockpitStyle";
  const MAX_TRADUS_AGE_SECONDS=15;
  let lastModel=null;

  const upper=v=>String(v??"").trim().toUpperCase();
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;
  const safe=(fn,fallback=null)=>{try{return typeof fn==="function"?fn():fallback;}catch(_){return fallback;}};
  const money=v=>finite(v)===null?"N/D":new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v));
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search).get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"40.6.116").trim();

  function strategyFallback(){
    const owner=globalThis.AgentCryptoTradusStrategyFailClosed||globalThis.AgentCryptoTradusStrategyReconcile;
    const raw=safe(owner?.readStrategyA,{decision:"INCONNU",phase:null,direction_score:null,blocker:null,reason:null})||{};
    const state=globalThis.AgentCryptoTradusStrategyFailClosed?.stateOf?.(raw)
      ||(/STOP|REFUS|REJECT|BLOCK/.test(upper(raw.decision||raw.phase))?"STOP":/PAPER|SIMUL/.test(upper(raw.decision||raw.phase))?"PAPER":/NO TRADE|WAIT/.test(upper(raw.decision||raw.phase))?"WAIT":/^OFF$/.test(upper(raw.decision||raw.phase))?"OFF":"UNKNOWN");
    return Object.freeze({
      decision:String(raw.decision||"INCONNU"),
      phase:raw.phase||null,
      direction_score:finite(raw.direction_score),
      blocker:raw.blocker||null,
      reason:raw.reason||null,
      state
    });
  }

  function tradusFallback(){
    const row=safe(globalThis.AgentCryptoTradusShadow?.read,null);
    if(!row)return Object.freeze({available:false,fresh:false,action:"NO_TRADE",imbalance:null,spread:null,age_seconds:null,row:null});
    const at=Date.parse(String(row.at||""));
    const age=Number.isFinite(at)?Math.max(0,(Date.now()-at)/1000):null;
    return Object.freeze({
      available:row.ok===true,
      fresh:row.ok===true&&age!==null&&age<=MAX_TRADUS_AGE_SECONDS,
      action:upper(row.signal?.action||"NO_TRADE")||"NO_TRADE",
      imbalance:finite(row.signal?.imbalance),
      spread:finite(row.signal?.spread_ratio),
      age_seconds:age,
      row
    });
  }

  function comparisonFallback(strategy,tradus){
    if(!tradus.available)return Object.freeze({state:"EN ATTENTE",plain:"TRADUS n’a pas encore de lecture exploitable."});
    if(!tradus.fresh)return Object.freeze({state:"À RAFRAÎCHIR",plain:"La lecture TRADUS est ancienne. Strategy A reste la référence de prudence et aucune action n’est confirmée."});
    const raw=globalThis.AgentCryptoTradusStrategyFailClosed?.compare?.(strategy,tradus.row?.signal)
      ||globalThis.AgentCryptoTradusStrategyReconcile?.compare?.(strategy,tradus.row?.signal)
      ||{state:"NON COMPARABLE",text:"Comparaison indisponible"};
    return Object.freeze({state:upper(raw.state||"NON COMPARABLE"),plain:String(raw.text||"")});
  }

  function paperFallback(){
    const paper=safe(globalThis.AgentCryptoTradusPaperObservability?.stats,{trades:0,wins:0,losses:0,net:0,fees:0,max_drawdown:0})||{};
    return Object.freeze({
      trades:finite(paper.trades)||0,
      wins:finite(paper.wins)||0,
      losses:finite(paper.losses)||0,
      net:finite(paper.net)||0,
      fees:finite(paper.fees)||0,
      drawdown:finite(paper.max_drawdown)||0
    });
  }

  function readEvidence(){
    const comparative=safe(globalThis.AgentCryptoStrategyTradusComparativeIntelligence?.model,null);
    if(comparative){
      return Object.freeze({
        strategy:comparative.strategy||strategyFallback(),
        tradus:comparative.tradus||tradusFallback(),
        comparison:comparative.comparison||comparisonFallback(comparative.strategy,comparative.tradus),
        paper:Object.freeze({
          trades:finite(comparative.memory?.paper_trades)||0,
          wins:finite(comparative.memory?.paper_wins)||0,
          losses:finite(comparative.memory?.paper_losses)||0,
          net:finite(comparative.memory?.paper_net)||0,
          fees:finite(comparative.memory?.paper_fees)||0,
          drawdown:finite(comparative.memory?.paper_drawdown)||0
        }),
        observations:finite(comparative.memory?.observations)||0,
        agreements:finite(comparative.memory?.convergence)||0,
        disagreements:finite(comparative.memory?.divergence)||0
      });
    }
    const strategy=strategyFallback();
    const tradus=tradusFallback();
    return Object.freeze({strategy,tradus,comparison:comparisonFallback(strategy,tradus),paper:paperFallback(),observations:0,agreements:0,disagreements:0});
  }

  function humanTradus(action){
    if(action==="BUY")return "PRESSION ACHETEUSE";
    if(action==="SELL")return "PRESSION VENDEUSE";
    return "ATTEND";
  }

  function humanStrategy(state,decision){
    if(state==="STOP")return "BLOQUÉE";
    if(state==="PAPER"||state==="ACTIVE")return "SIMULATION ACTIVE";
    if(state==="WAIT"||upper(decision)==="NO TRADE")return "ATTEND";
    if(state==="OFF")return "ARRÊTÉE";
    return "LECTURE INCOMPLÈTE";
  }

  function blockerPlain(blocker,direction){
    const b=upper(blocker||"");
    if(b.includes("DIRECTION"))return Number.isFinite(direction)
      ? `La direction du marché est trop faible pour continuer la simulation (${direction}/100).`
      : "La direction du marché n’est pas assez nette pour continuer la simulation.";
    if(b.includes("BTC"))return "La variation du Bitcoin ne remplit pas encore la condition prévue par Strategy A.";
    if(b.includes("COST")||b.includes("COÛT"))return "Le mouvement attendu ne couvre pas encore suffisamment les coûts simulés.";
    if(b.includes("RISK")||b.includes("RISQUE"))return "Le contrôle de risque bloque la proposition simulée.";
    if(b.includes("DATA")||b.includes("DONN"))return "Les données nécessaires ne sont pas assez solides pour continuer.";
    if(b.includes("RÉENTR")||b.includes("REENTR"))return "La condition de réentrée n’est pas encore atteinte.";
    if(b)return `Strategy A attend au verrou « ${blocker} ».`;
    return "Les conditions de Strategy A ne sont pas encore suffisantes pour agir en simulation.";
  }

  function buildModel(evidence){
    const strategy=evidence.strategy||{};
    const tradus=evidence.tradus||{};
    const comparison=evidence.comparison||{};
    const state=upper(strategy.state||"UNKNOWN");
    const action=upper(tradus.action||"NO_TRADE");
    const compare=upper(comparison.state||"NON COMPARABLE");
    const directional=action==="BUY"||action==="SELL";

    let decision="ATTENDRE";
    let operatorAction="RIEN À FAIRE POUR L’INSTANT";
    let why=blockerPlain(strategy.blocker,strategy.direction_score);
    let agreement="PAS ENCORE COMPARABLE";

    if(state==="STOP"){
      decision="STOP";
      operatorAction="NE RIEN FAIRE";
      why="Strategy A a bloqué la chaîne de simulation. Le système reste en observation.";
    }else if(!tradus.available){
      decision="ATTENDRE";
      operatorAction="OBSERVER SEULEMENT";
      why=`${blockerPlain(strategy.blocker,strategy.direction_score)} TRADUS n’a pas encore de lecture exploitable.`;
    }else if(!tradus.fresh){
      decision="ATTENDRE";
      operatorAction="OBSERVER SEULEMENT";
      why=`${blockerPlain(strategy.blocker,strategy.direction_score)} La lecture TRADUS doit être rafraîchie avant comparaison.`;
    }else if((compare.includes("CONVERGENCE")||compare.includes("ACCORD"))&&!directional){
      decision="ATTENDRE";
      operatorAction="RIEN À FAIRE POUR L’INSTANT";
      why="Strategy A attend et TRADUS attend aussi. Aucun signal d’action n’est confirmé.";
      agreement="OUI · LES DEUX ATTENDENT";
    }else if(compare.includes("DIVERGENCE")||compare.includes("OPPOSITION")){
      decision="SURVEILLER";
      operatorAction="NE PAS AGIR · OBSERVER";
      why=`Strategy A attend ou bloque, tandis que TRADUS voit une ${action==="BUY"?"pression acheteuse":"pression vendeuse"}. Les deux lectures ne sont pas d’accord.`;
      agreement="NON · DÉSACCORD";
    }else if((compare.includes("CONVERGENCE")||compare.includes("ACCORD"))&&directional){
      decision="SIMULATION À OBSERVER";
      operatorAction="OBSERVER LE PAPER UNIQUEMENT";
      why=`Strategy A et TRADUS vont dans le même sens en simulation (${action}). Cela ne déclenche aucun ordre réel.`;
      agreement="OUI · MÊME SENS EN PAPER";
    }else if(compare.includes("NON COMPARABLE")){
      decision="ATTENDRE";
      operatorAction="OBSERVER SEULEMENT";
      why="Les deux lectures ne sont pas dans un état comparable. Aucun accord ne doit être inventé.";
    }

    return Object.freeze({
      schema:"agent_crypto_operator_cockpit_v1",
      owner:OWNER,
      build:runtimeBuild(),
      generated_at_utc:new Date().toISOString(),
      decision,
      operator_action:operatorAction,
      why,
      agreement,
      strategy:Object.freeze({label:humanStrategy(state,strategy.decision),decision:String(strategy.decision||"INCONNU"),state,direction_score:finite(strategy.direction_score),blocker:strategy.blocker||null}),
      tradus:Object.freeze({label:humanTradus(action),action,fresh:Boolean(tradus.fresh),available:Boolean(tradus.available),imbalance:finite(tradus.imbalance)}),
      comparison_state:compare,
      paper:Object.freeze({...evidence.paper}),
      memory:Object.freeze({observations:evidence.observations||0,agreements:evidence.agreements||0,disagreements:evidence.disagreements||0}),
      contract:Object.freeze({read_only:true,human_summary_only:true,financial_signal:false,automatic_order:false,real_order:false,market_mutation:false,strategy_mutation:false,tradus_mutation:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,wallet:false})
    });
  }

  function model(){return buildModel(readEvidence());}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}{margin:14px 10px 18px;padding:22px;border:2px solid rgba(102,238,214,.48);border-radius:20px;background:linear-gradient(135deg,rgba(3,22,34,.98),rgba(15,18,41,.97));box-shadow:0 18px 42px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.035);color:#ecf8fb}
      #${ROOT_ID} .oc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}
      #${ROOT_ID} .oc-kicker{font:950 12px/1.2 system-ui,sans-serif;letter-spacing:.16em;color:#76f0d9;text-transform:uppercase}
      #${ROOT_ID} .oc-title{margin:7px 0 0;font:950 clamp(24px,2.3vw,38px)/1.05 system-ui,sans-serif;color:#fff0b6;letter-spacing:-.02em}
      #${ROOT_ID} .oc-sub{margin-top:9px;font:600 16px/1.45 system-ui,sans-serif;color:#b9d0da;max-width:900px}
      #${ROOT_ID} .oc-decision{min-width:220px;padding:16px 20px;border-radius:16px;border:2px solid rgba(255,221,125,.46);background:rgba(255,221,125,.08);text-align:center}
      #${ROOT_ID} .oc-decision span{display:block;font:900 11px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#c9d9df}
      #${ROOT_ID} .oc-decision b{display:block;margin-top:6px;font:950 25px/1.05 system-ui,sans-serif;color:#ffe494}
      #${ROOT_ID} .oc-action{margin-top:18px;padding:18px 20px;border-left:5px solid #70ead3;border-radius:10px;background:rgba(84,222,194,.075)}
      #${ROOT_ID} .oc-action span{display:block;font:900 11px/1.2 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#85e9d5}
      #${ROOT_ID} .oc-action b{display:block;margin-top:6px;font:950 clamp(22px,2vw,31px)/1.2 system-ui,sans-serif;color:#fff}
      #${ROOT_ID} .oc-why{margin-top:12px;font:650 18px/1.55 system-ui,sans-serif;color:#d8e9ef}
      #${ROOT_ID} .oc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
      #${ROOT_ID} .oc-card{padding:17px;border:1px solid rgba(255,255,255,.11);border-radius:14px;background:rgba(1,12,20,.55);min-width:0}
      #${ROOT_ID} .oc-card span{display:block;font:900 11px/1.2 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#91aeb9}
      #${ROOT_ID} .oc-card b{display:block;margin-top:8px;font:950 21px/1.25 system-ui,sans-serif;color:#fff;overflow-wrap:anywhere}
      #${ROOT_ID} .oc-card small{display:block;margin-top:8px;font:600 14px/1.45 system-ui,sans-serif;color:#a9c1cb}
      #${ROOT_ID} .oc-paper{margin-top:13px;padding:15px 17px;border:1px solid rgba(255,210,103,.18);border-radius:13px;background:rgba(255,200,88,.045);font:650 15px/1.5 system-ui,sans-serif;color:#dce9ed}
      #${ROOT_ID} .oc-paper strong{color:#ffe29a}
      #${ROOT_ID} details{margin-top:14px;border-top:1px solid rgba(255,255,255,.09);padding-top:13px}
      #${ROOT_ID} summary{cursor:pointer;font:900 16px/1.3 system-ui,sans-serif;color:#80e8d4;user-select:none}
      #${ROOT_ID} .oc-detail{padding:12px 2px 0;font:600 16px/1.62 system-ui,sans-serif;color:#c9dbe2}
      #${ROOT_ID} .oc-detail p{margin:7px 0}
      #${ROOT_ID} .oc-buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
      #${ROOT_ID} button{appearance:none;border:1px solid rgba(112,234,211,.35);border-radius:999px;padding:11px 16px;background:rgba(78,213,190,.08);color:#eafffb;font:900 14px/1 system-ui,sans-serif;cursor:pointer}
      #${ROOT_ID} button:hover{background:rgba(78,213,190,.16)}
      #${ROOT_ID} .oc-safe{margin-top:14px;font:800 13px/1.4 system-ui,sans-serif;color:#86d9c9}
      #${ROOT_ID}[data-decision="STOP"] .oc-decision,#${ROOT_ID}[data-decision="SURVEILLER"] .oc-decision{border-color:rgba(255,119,143,.5);background:rgba(255,80,110,.075)}
      #${ROOT_ID}[data-decision="STOP"] .oc-decision b,#${ROOT_ID}[data-decision="SURVEILLER"] .oc-decision b{color:#ff9fb0}
      @media(max-width:1000px){#${ROOT_ID}{margin-left:6px;margin-right:6px;padding:17px}#${ROOT_ID} .oc-grid{grid-template-columns:1fr}#${ROOT_ID} .oc-decision{width:100%;box-sizing:border-box;text-align:left}}
    `;
    document.head.appendChild(style);
  }

  function mountAnchor(){
    const ticker=document.getElementById("tickerTrack");
    const tickerSection=ticker?.closest?.("section");
    if(tickerSection)return {anchor:tickerSection,mode:"after"};
    const bar=document.querySelector(".atlas-v2-interface-bar");
    if(bar)return {anchor:bar,mode:"after"};
    const main=document.querySelector("main");
    if(main)return {anchor:main,mode:"prepend"};
    return document.body?{anchor:document.body,mode:"prepend"}:null;
  }

  function ensureRoot(){
    let root=document.getElementById(ROOT_ID);
    if(root)return root;
    const mount=mountAnchor();
    if(!mount)return null;
    ensureStyle();
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.dataset.owner=OWNER;
    root.setAttribute("aria-label","Cockpit opérateur Agent-Crypto");
    root.innerHTML=`
      <div class="oc-head">
        <div><div class="oc-kicker">COCKPIT OPÉRATEUR · LECTURE HUMAINE</div><h2 class="oc-title">Que fait la machine maintenant ?</h2><div class="oc-sub">Une seule lecture claire. Les pages techniques restent disponibles dessous pour l’audit, mais elles ne sont plus nécessaires pour comprendre la décision.</div></div>
        <div class="oc-decision"><span>Décision actuelle</span><b data-oc="decision">EN ATTENTE</b></div>
      </div>
      <div class="oc-action"><span>Ce que tu dois faire</span><b data-oc="action">OBSERVER</b></div>
      <div class="oc-why" data-oc="why">Lecture en cours…</div>
      <div class="oc-grid">
        <article class="oc-card"><span>Strategy A</span><b data-oc="strategy">—</b><small data-oc="strategy-detail">—</small></article>
        <article class="oc-card"><span>TRADUS</span><b data-oc="tradus">—</b><small data-oc="tradus-detail">—</small></article>
        <article class="oc-card"><span>Les deux sont-ils d’accord ?</span><b data-oc="agreement">—</b><small data-oc="comparison">—</small></article>
      </div>
      <div class="oc-paper"><strong>Simulation Paper :</strong> <span data-oc="paper">aucune mesure disponible</span><br><span data-oc="paper-note">Ce résultat sert à mesurer la simulation ; il ne prouve aucune rentabilité future.</span></div>
      <details><summary>Explication détaillée — en français normal</summary><div class="oc-detail">
        <p data-oc="detail-strategy">Strategy A : lecture en cours.</p>
        <p data-oc="detail-tradus">TRADUS : lecture en cours.</p>
        <p data-oc="detail-compare">Comparaison : lecture en cours.</p>
        <p data-oc="detail-paper">Paper : lecture en cours.</p>
      </div></details>
      <div class="oc-buttons"><button type="button" data-oc-action="comparison">Voir le comparateur détaillé</button><button type="button" data-oc-action="paper">Voir la salle des machines</button></div>
      <div class="oc-safe">SIMULATION / OBSERVATION UNIQUEMENT · aucun ordre réel · aucune clé · aucun wallet</div>`;
    if(mount.mode==="after")mount.anchor.insertAdjacentElement("afterend",root);else mount.anchor.prepend(root);
    return root;
  }

  function set(root,key,value){const node=root?.querySelector?.(`[data-oc="${key}"]`);if(node)node.textContent=String(value??"—");}

  function render(){
    const root=ensureRoot();
    if(!root)return null;
    const m=model();lastModel=m;
    root.dataset.decision=m.decision;
    set(root,"decision",m.decision);
    set(root,"action",m.operator_action);
    set(root,"why",m.why);
    set(root,"strategy",m.strategy.label);
    set(root,"strategy-detail",`${m.strategy.decision}${Number.isFinite(m.strategy.direction_score)?` · direction ${m.strategy.direction_score}/100`:""}${m.strategy.blocker?` · bloque sur ${m.strategy.blocker}`:""}`);
    set(root,"tradus",m.tradus.label);
    set(root,"tradus-detail",`${m.tradus.fresh?"lecture fraîche":m.tradus.available?"lecture à rafraîchir":"lecture indisponible"}${Number.isFinite(m.tradus.imbalance)?` · déséquilibre ${(m.tradus.imbalance*100).toFixed(1)} %`:""}`);
    set(root,"agreement",m.agreement);
    set(root,"comparison",m.comparison_state.replaceAll("_"," "));
    set(root,"paper",`${m.paper.trades} trade${m.paper.trades===1?"":"s"} TRADUS Paper · ${m.paper.wins} gagnant${m.paper.wins===1?"":"s"} / ${m.paper.losses} perdant${m.paper.losses===1?"":"s"} · résultat archive ${money(m.paper.net)}`);
    set(root,"paper-note",`Mémoire comparative : ${m.memory.observations} observation${m.memory.observations===1?"":"s"}, ${m.memory.agreements} accord(s), ${m.memory.disagreements} désaccord(s). Ce résultat ne prouve pas la rentabilité de Strategy A.`);
    set(root,"detail-strategy",`Strategy A : ${m.strategy.label}. ${blockerPlain(m.strategy.blocker,m.strategy.direction_score)}`);
    set(root,"detail-tradus",`TRADUS : ${m.tradus.label}. ${m.tradus.fresh?"La lecture est assez récente pour être comparée.":"La lecture n’est pas assez récente pour renforcer une conclusion."}`);
    set(root,"detail-compare",`Comparaison : ${m.agreement}. ${m.why}`);
    set(root,"detail-paper",`Paper : ${m.paper.trades} trade(s), ${m.paper.wins} gagnant(s), ${m.paper.losses} perdant(s), résultat ${money(m.paper.net)}. C’est une expérience fictive, pas une preuve de performance future.`);
    document.documentElement.dataset.operatorCockpitDecision=m.decision.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    try{document.dispatchEvent(new CustomEvent("agentcrypto:operator-cockpit",{detail:m}));}catch(_){}
    return m;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){try{render();}catch(__){}}});}

  ["agentcrypto:strategy-tradus-comparative-intelligence","agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle","agentcrypto:tradus-paper-snapshot","agentcrypto:current-finalized"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  document.addEventListener("click",event=>{
    const action=event.target instanceof Element?event.target.closest("button")?.dataset?.ocAction:null;
    if(action==="comparison")document.getElementById("strategyTradusComparativeIntelligence")?.scrollIntoView?.({behavior:"smooth",block:"center"});
    if(action==="paper")document.getElementById("strategyAReplaySandbox")?.scrollIntoView?.({behavior:"smooth",block:"start"});
  });
  if(document.readyState==="loading")window.addEventListener("load",schedule,{once:true,passive:true});else schedule();

  function selfTest(){
    const fixture=(strategyState,decision,tradusAction,compareState,fresh=true)=>buildModel({
      strategy:{state:strategyState,decision,direction_score:-1,blocker:"DIRECTION"},
      tradus:{available:true,fresh,action:tradusAction,imbalance:0},
      comparison:{state:compareState},
      paper:{trades:0,wins:0,losses:0,net:0,fees:0,drawdown:0},observations:0,agreements:0,disagreements:0
    });
    const a=fixture("WAIT","NO TRADE","NO_TRADE","CONVERGENCE");
    const b=fixture("WAIT","NO TRADE","SELL","DIVERGENCE");
    const c=fixture("STOP","STOP","BUY","OPPOSITION SÉCURITÉ");
    const d=fixture("WAIT","NO TRADE","BUY","CONVERGENCE POTENTIELLE");
    const checks=[
      a.decision==="ATTENDRE"&&a.operator_action.includes("RIEN"),
      b.decision==="SURVEILLER"&&b.agreement.includes("DÉSACCORD"),
      c.decision==="STOP"&&c.operator_action==="NE RIEN FAIRE",
      d.decision==="SIMULATION À OBSERVER"&&d.contract.real_order===false,
      d.contract.fetch===false&&d.contract.recurring_timer===false&&d.contract.storage_write===false
    ];
    return Object.freeze({pass:checks.every(Boolean),total:checks.length,passed:checks.filter(Boolean).length,checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoOperatorCockpit=Object.freeze({owner:OWNER,build:runtimeBuild(),model,render,read:()=>lastModel,selfTest,read_only:true,human_summary_only:true,financial_signal:false,automatic_order:false,real_order:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,strategy_mutation:false,tradus_mutation:false,wallet:false});
})();
