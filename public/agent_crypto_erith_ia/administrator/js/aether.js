/*
  Agent-Crypto Administrator — Aether runtime
  Responsibility: Aether status synthesis + read-only system/weather/BTC values.
  Presentation/animation belongs to admin-ribbons.css.
  Build: 40.4.136
  Revision: 40.4.134 discoverability lock. Existing Aether Attention, Maintenon five-day weather and Atlas AUTO owners preserved; the visible system band opens the existing detailed panel.
*/
(() => {
  "use strict";
  function aetherText4084(id,fallback="—"){const n=document.getElementById(id);const v=String(n?.textContent||"").replace(/\s+/g," ").trim();return v||fallback;}
  function aetherCurrent4084(){try{return typeof atlasCurrentStateRead==="function"?(atlasCurrentStateRead()||null):null;}catch(_){return null;}}
  const AETHER_VEILLE_TOP_4087=12;
  const AETHER_MARQUEE_SPEED_PX_S_40121=72;
  const AETHER_MARQUEE_MIN_OVERFLOW_PX_40121=48;
  const AETHER_MARQUEE_DELAY_S_40121=0.55;
  const aetherVeilleState4087={index:0,kind:"alert",fingerprint:"",viewportWidth:0,last:null,storyEvent:null,storyContext:null,feedWasVisible:false};
  function aetherNewsCanonicalFrenchEvent40110(event){
    if(!event)return event;
    const id=String(event?.event_id||event?.id||event?.fingerprint||"").trim();
    const headline=String(event?.headline||"").replace(/\s+/g," " ).trim();
    const sourceUrl=String(event?.source_url||"").trim();
    const mergedIds=new Set((Array.isArray(event?.merged_event_ids)?event.merged_event_ids:[]).map(v=>String(v||"").trim()).filter(Boolean));
    try{
      const pools=[];
      // 40.4.132 — canonical translated collector payload is the first matching authority.
      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);
      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);
      for(const pool of pools){
        const match=pool.find(row=>{
          if(!String(row?.headline_fr_display||row?.headline_fr||"").trim())return false;
          const rowId=String(row?.event_id||row?.id||row?.fingerprint||"").trim();
          const rowMerged=Array.isArray(row?.merged_event_ids)?row.merged_event_ids.map(v=>String(v||"").trim()):[];
          const sameId=Boolean(id&&(rowId===id||rowMerged.includes(id)||mergedIds.has(rowId)));
          const sameUrl=Boolean(sourceUrl&&String(row?.source_url||"").trim()===sourceUrl);
          const sameHeadline=Boolean(headline&&String(row?.headline||"").replace(/\s+/g," " ).trim()===headline);
          return sameId||sameUrl||sameHeadline;
        });
        if(match)return match;
      }
    }catch(_){}
    return event;
  }
  function aetherNewsLooksEnglish40124(value){
    const text=String(value||"").toLowerCase();
    if(!text)return false;
    const hits=(text.match(/\b(?:the|after|as|and|with|from|loses?|lost|drops?|drains?|trader|traders|bets?|below|above|tops?|buys?|voting|power|million|billion|seconds?|why|speech|made|shorting|crypto)\b/g)||[]).length;
    return hits>=2;
  }
  function aetherNewsMoneyFacts40124(value){
    const text=String(value||"");
    const out=[];
    const push=v=>{if(v&&!out.includes(v))out.push(v);};
    for(const m of text.matchAll(/\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(billion|million|bn|m)?/gi)){
      const raw=String(m[1]||"").replace(/,/g,"");
      const n=Number(raw);if(!Number.isFinite(n))continue;
      const unit=String(m[2]||"").toLowerCase();
      const shown=n.toLocaleString("fr-FR",{maximumFractionDigits:2});
      push(unit==="billion"||unit==="bn"?`${shown} Md$`:unit==="million"||unit==="m"?`${shown} M$`:`${shown} $`);
    }
    for(const m of text.matchAll(/([0-9]+(?:[.,][0-9]+)?)\s*%/g))push(`${String(m[1]).replace(".",",")} %`);
    for(const m of text.matchAll(/([0-9]+)\s*(seconds?|minutes?|hours?)/gi)){
      const n=Number(m[1]);const unit=String(m[2]||"").toLowerCase();
      push(`${n} ${unit.startsWith("second")?"s":unit.startsWith("minute")?"min":"h"}`);
    }
    return out.slice(0,4);
  }
  function aetherNewsFrenchPattern40124(original){
    let m=null;
    if((m=original.match(/^Maya Protocol exploit drains bitcoin and other assets as pool value drops by \$([0-9.,]+) million$/i)))return `Maya Protocol : un exploit draine du bitcoin et d’autres actifs · valeur du pool -${String(m[1]).replace(".",",")} M$`;
    if((m=original.match(/^Bearish crypto bets lose record \$([0-9.,]+) billion as bitcoin tops \$([0-9,]+)$/i)))return `Paris baissiers crypto : perte record ${String(m[1]).replace(".",",")} Md$ · Bitcoin dépasse ${String(m[2]).replace(/,/g," ")} $`;
    if((m=original.match(/^Trader who made \$([0-9.,]+) million shorting crypto lost \$([0-9.,]+) million on ether in ([0-9]+) seconds$/i)))return `Un trader ayant gagné ${String(m[1]).replace(".",",")} M$ en vendant les cryptos à découvert perd ${String(m[2]).replace(".",",")} M$ sur ETH en ${m[3]} s`;
    if((m=original.match(/^Bitcoin below \$([0-9,]+), XRP leads losses as traders start betting on (?:a )?Fed hike$/i)))return `Bitcoin sous ${String(m[1]).replace(/,/g," ")} $ · XRP mène les pertes · paris croissants sur une hausse des taux de la Fed`;
    if(/^Why .*Jackson Hole.*big event for bitcoin and gold/i.test(original))return "Pourquoi le discours de Jackson Hole est un événement majeur pour Bitcoin et l’or";
    return "";
  }
  function aetherNewsFrenchFactualFallback40124(event,original,fallback){
    const pattern=aetherNewsFrenchPattern40124(original);if(pattern)return pattern;
    if(!aetherNewsLooksEnglish40124(original))return original||fallback;
    const label=String(event?.event_label||"").replace(/\s+/g," ").trim();
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").trim().toUpperCase()).filter(Boolean).slice(0,3);
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").replace(/\s+/g," ").trim()).filter(Boolean).slice(0,1);
    const facts=aetherNewsMoneyFacts40124(original);
    const parts=[];
    const push=value=>{const v=String(value||"").trim();if(v&&!parts.includes(v))parts.push(v);};
    push(label&&!/information de march[eé] [aà] qualifier/i.test(label)?label:"Actualité de marché");
    if(assets.length)push(assets.join("/"));else if(sectors.length)push(sectors[0]);
    facts.forEach(push);
    return parts.join(" · ")||fallback;
  }
  function aetherNewsHeadlineFr40104(event,fallback="Événement à qualifier"){
    const canonical=aetherNewsCanonicalFrenchEvent40110(event);
    const original=String(canonical?.headline||canonical?.event_label||event?.headline||event?.event_label||"").replace(/\s+/g," ").trim();
    const explicitFrench=String(canonical?.headline_fr_display||canonical?.headline_fr||"").replace(/\s+/g," ").trim();
    // 40.4.132 — never let a derived presentation helper overwrite a canonical French headline.
    if(explicitFrench)return explicitFrench;
    try{
      const owner=globalThis.AgentCryptoNewsFrenchPresentation40104;
      if(owner&&typeof owner.headline==="function"){
        const value=String(owner.headline(canonical,fallback)||"").replace(/\s+/g," ").trim();
        if(explicitFrench||value!==original)return value||fallback;
      }
    }catch(_){}
    // 40.4.124 — no “traduction en attente” and no raw English leakage in the scarce Aether ribbon.
    // News Sentinel keeps the canonical original; this is presentation-only, deterministic and factual.
    return aetherNewsFrenchFactualFallback40124(canonical,original,fallback);
  }
  function aetherNewsHeadlineSource40133(event,fallback="Event to qualify"){
  const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};
  const original=String(canonical?.headline||event?.headline||"").replace(/\s+/g," ").trim();
  return original||aetherNewsHeadlineFr40104(canonical,fallback);
}
  function aetherFrenchMechanismLabel40110(value){
    const label=String(value||"").replace(/\s+/g," ").trim();
    if(/^SHORT SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS VENDEUSES";
    if(/^LONG SQUEEZE \/ LIQUIDATIONS$/i.test(label))return "LIQUIDATIONS DE POSITIONS ACHETEUSES";
    return label;
  }
  const aetherVeilleNumber4087=value=>{const n=Number(value);return Number.isFinite(n)?n:0;};
  function aetherVeilleTimestamp4087(event){
    try{if(typeof newsFeedEventTimestamp==="function")return Number(newsFeedEventTimestamp(event)||0);}catch(_){}
    const parsed=Date.parse(event?.event_time||event?.published_at||event?.updated_at||event?.last_seen_at||"");
    return Number.isFinite(parsed)?parsed:0;
  }
  function aetherVeilleFreshnessWeight4087(event){
    const ts=aetherVeilleTimestamp4087(event);if(!ts)return 0;
    const hours=Math.max(0,(Date.now()-ts)/3600000);
    if(hours<2)return 90;if(hours<12)return 70;if(hours<48)return 50;if(hours<168)return 20;return 0;
  }
  function aetherVeilleDecisionWeight4087(event){
    const action=String(event?.decision?.action||"").toLowerCase(),tone=String(event?.decision?.tone||"").toLowerCase();
    let score=/alerte prioritaire/.test(action)?500:/surveillance renforc/.test(action)?360:/attendre.*source|vérifier|verifier/.test(action)?300:/archiver/.test(action)?60:140;
    if(tone==="danger")score+=120;else if(tone==="warn")score+=60;else if(tone==="ok")score+=20;
    return score;
  }
  function aetherVeilleContextWeight4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").toUpperCase());
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").toLowerCase());
    const active=`${aetherText4084("selectedAssetTitle","")} ${aetherText4084("atlasOracleAsset","")}`.toUpperCase();
    const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
    let score=assets.some(symbol=>symbol&&active.includes(symbol))?80:0;
    if(assets.some(symbol=>top5.has(symbol)))score+=40;
    if(sectors.some(value=>value.includes("marché global")||value.includes("marche global")))score+=35;
    return score;
  }
  function aetherVeilleRank4087(event){
    return aetherVeilleDecisionWeight4087(event)
      +aetherVeilleNumber4087(event?.impact?.score)*10
      +aetherVeilleNumber4087(event?.evidence?.score)*2
      +Math.min(30,Math.max(0,aetherVeilleNumber4087(event?.source_count))*5)
      +aetherVeilleFreshnessWeight4087(event)
      +aetherVeilleContextWeight4087(event);
  }
  function aetherVeilleStoryTokens40127(event){
    const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};
    const tokens=[];
    const push=(prefix,value)=>{const v=String(value||"").replace(/\s+/g," ").trim().toLowerCase();if(v)tokens.push(`${prefix}:${v}`);};
    push("id",canonical?.event_id||canonical?.id||canonical?.fingerprint);
    for(const id of (Array.isArray(canonical?.merged_event_ids)?canonical.merged_event_ids:[]))push("id",id);
    push("url",canonical?.source_url);
    push("fr",aetherNewsHeadlineFr40104(canonical,""));
    push("raw",canonical?.headline||canonical?.event_label);
    return [...new Set(tokens)];
  }
  function aetherVeilleFamily40128(event){
    const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};
    const type=String(canonical?.event_type||"").toLowerCase();
    const label=String(canonical?.event_label||"").toLowerCase();
    const headline=String(canonical?.headline||canonical?.headline_fr_display||canonical?.headline_fr||"").toLowerCase();
    const domains=(Array.isArray(canonical?.driver_domains)?canonical.driver_domains:[]).map(v=>String(v||"").toLowerCase());
    const topics=(Array.isArray(canonical?.matched_topics)?canonical.matched_topics:[]).map(v=>String(v||"").toLowerCase());
    const sectors=(Array.isArray(canonical?.sectors)?canonical.sectors:[]).map(v=>String(v||"").toLowerCase());
    const text=[type,label,headline,...domains,...topics,...sectors].join(" " );
    if(type==="security"||/hack|exploit|cybers[ée]curit|attaque|pirat/.test(`${label} ${headline}`))return "security";
    if(domains.includes("institutional_flows")||/\betf\b|institution|inflows?|outflows?|fonds cot/.test(text))return "institutional";
    if(domains.includes("regulation")||/r[ée]glement|\bsec\b|\bcftc\b|\bmica\b|custody rule|congress|white house/.test(text))return "regulation";
    if(domains.includes("leverage")||/liquidat|leverage|funding rate|futures?|open interest|short squeeze|long squeeze|positions? vendeuses?|positions? acheteuses?/.test(text))return "leverage";
    if(domains.includes("macro_liquidity")||/federal reserve|\bfed\b|\bbce\b|\becb\b|treasury|taux|rates?|inflation|emploi|jobs|liquidit|jackson hole/.test(text))return "macro";
    if(type)return type;
    return "market";
  }
  function aetherVeilleEvents4087(){
    const events=[];
    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};
    try{
      if(typeof newsFeedState!=="undefined"){
        const canonical=(Array.isArray(newsFeedState?.payload?.events)?newsFeedState.payload.events:[])
          .filter(event=>String(event?.headline_fr_display||event?.headline_fr||event?.headline||"").replace(/\s+/g," ").trim());
        // 40.4.132 — VEILLE is a story reader: canonical content-bearing events own the queue.
        // Derived/UI rows remain usable only when the canonical payload is genuinely absent.
        if(canonical.length)addPool(canonical);
        else addPool(newsFeedState?.events);
      }
    }catch(_){}
    const ranked=events.map((event,order)=>({event,order,rank:aetherVeilleRank4087(event),time:aetherVeilleTimestamp4087(event)})).sort((a,b)=>b.rank-a.rank||b.time-a.time||a.order-b.order);
    const canonicalRows=[];const seenTokens=new Set();
    for(const row of ranked){
      const tokens=aetherVeilleStoryTokens40127(row.event);
      if(tokens.length&&tokens.some(token=>seenTokens.has(token)))continue;
      tokens.forEach(token=>seenTokens.add(token));
      canonicalRows.push({...row,family:aetherVeilleFamily40128(row.event)});
    }
    if(!canonicalRows.length)return [];
    const sevenDays=Date.now()-7*24*60*60*1000;
    const recent=canonicalRows.filter(row=>!row.time||row.time>=sevenDays);
    const pool=recent.length>=AETHER_VEILLE_TOP_4087?recent:canonicalRows;
    const chosen=[];const usedEvents=new Set();const usedFamilies=new Set();const usedSources=new Set();
    const key=row=>String(row?.event?.event_id||row?.event?.id||row?.event?.fingerprint||row?.order);
    const source=row=>String(row?.event?.source_host||row?.event?.source_name||"").toLowerCase();
    const take=row=>{if(!row||usedEvents.has(key(row)))return false;chosen.push(row);usedEvents.add(key(row));if(row.family)usedFamilies.add(row.family);if(source(row))usedSources.add(source(row));return true;};
    const anchor24=pool.find(row=>row.time&&row.time>=Date.now()-24*60*60*1000)||pool[0];
    take(anchor24);
    const preferred=["macro","institutional","regulation","leverage","security","market"];
    for(const family of preferred){
      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;
      if(usedFamilies.has(family))continue;
      const candidates=pool.filter(row=>row.family===family&&!usedEvents.has(key(row)));
      const diverse=candidates.find(row=>!source(row)||!usedSources.has(source(row)))||candidates[0];
      take(diverse);
    }
    for(const row of pool){
      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;
      if(usedEvents.has(key(row)))continue;
      if(usedFamilies.has(row.family)&&source(row)&&usedSources.has(source(row)))continue;
      take(row);
    }
    for(const row of pool){if(chosen.length>=AETHER_VEILLE_TOP_4087)break;take(row);}
    return chosen.slice(0,AETHER_VEILLE_TOP_4087).map(row=>row.event);
  }
  function aetherVeilleScope4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").trim()).filter(Boolean);
    if(assets.length)return assets.slice(0,3).join("/");
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").trim()).filter(Boolean);
    return sectors[0]||"GLOBAL";
  }
  function aetherVeilleStatus4087(){
    let status="idle",payload=null,events=[];try{if(typeof newsFeedState!=="undefined"){status=String(newsFeedState.status||"idle");payload=newsFeedState.payload||null;events=Array.isArray(newsFeedState.events)?newsFeedState.events:[];}}catch(_){}
    let stats=null;try{if(typeof newsFeedUniqueStats==="function")stats=newsFeedUniqueStats()||null;}catch(_){}
    const cutoff24h=Date.now()-24*60*60*1000;
    const recent=events.filter(event=>{const ts=aetherVeilleTimestamp4087(event);return ts>0&&ts>=cutoff24h;});
    const derivedStats={
      events24:recent.length,
      priority24:recent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=68).length,
      critical24:recent.filter(event=>aetherVeilleNumber4087(event?.impact?.score)>=85).length
    };
    const canonicalStats=stats&&[stats.events24,stats.priority24,stats.critical24].every(value=>Number.isFinite(Number(value)))?stats:derivedStats;
    const events24=Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.events24)));
    stats={
      events24,
      priority24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.priority24)))),
      critical24:Math.min(events24,Math.max(0,Math.round(aetherVeilleNumber4087(canonicalStats.critical24))))
    };
    const decision=String(payload?.summary?.decision||"").trim();
    if((status==="idle"||status==="loading")&&!events.length)return{label:"EN ATTENTE",text:"Veille non chargée · News Sentinel en attente",tone:"neutral",events:[],stats,status,decision};
    if(status==="error"&&!events.length)return{label:"INDISPONIBLE",text:"Archive News Sentinel indisponible · aucune actualité inventée",tone:"danger",events:[],stats,status,decision};
    if(!events.length)return{label:"0 PRIORITAIRE",text:status==="ok"?"Archive chargée · aucun événement prioritaire":"Archive partielle · aucun événement exploitable",tone:status==="partial"?"warn":"ok",events:[],stats,status,decision};
    const ranked=aetherVeilleEvents4087();
    const globalTone=stats.critical24>0?"danger":stats.priority24>0||status==="partial"?"warn":"ok";
    const label=stats.priority24>0?`${stats.priority24} PRIORITAIRE${stats.priority24>1?"S":""} 24H`:"VEILLE QUALIFIÉE";
    return{label,text:decision||"Surveillance",tone:globalTone,events:ranked,stats,status,decision};
  }
  function aetherNewsMarketContext4089(currentEvent=null){
    try{
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence40235;
      if(!owner||typeof owner.compute!=="function")return null;
      const n=currentEvent?owner.compute(currentEvent):owner.compute();
      if(!n||n.status!=="observed")return null;
      const lead=currentEvent||n.current_event||n.lead_event||n.event||null;
      if(!lead)return null;
      const proof=n?.base?.amplifier?.evidence||n?.flow?.evidence||lead?.evidence||n?.event?.evidence||null;
      const proofScore=aetherVeilleNumber4087(proof?.score);
      const assets=(Array.isArray(lead?.assets)?lead.assets:Array.isArray(n?.event?.assets)?n.event.assets:[])
        .map(value=>String(value||"").trim().toUpperCase()).filter(Boolean).slice(0,3);
      const scope=assets.length?assets.join("/"):"MARCHÉ";
      const headline=aetherNewsHeadlineFr40104(lead||n?.event,"Contexte News Sentinel");
      const source=String(lead?.source_name||lead?.source_host||n?.event?.source_name||n?.event?.source_host||"").replace(/^www\./,"").trim();
      const mechanismTitle=aetherFrenchMechanismLabel40110(n?.mechanism?.title||"");
      const mechanismDirection=String(n?.mechanism?.direction||"").trim();
      const explains=String(n?.mechanism?.explains||"").replace(/\s+/g," ").trim();
      const flowLabel=String(n?.flow?.label||"").trim();
      const flowDirection=String(n?.flow?.direction||"").trim();
      const breadth=String(n?.market_confirmation?.breadth||"").replace(/\s+/g," ").trim();
      const marketTone=String(n?.market_confirmation?.tone||"").replace(/\s+/g," ").trim();
      return {n,lead,proofScore,scope,headline,source,mechanismTitle,mechanismDirection,explains,flowLabel,flowDirection,breadth,marketTone,assets};
    }catch(_){return null;}
  }
  const AETHER_NON_INFORMATION_RE_40122=/(?:pas une pr[eé]vision|aucune recommandation|recommandation financi[eè]re|conseil d[’']achat|signal d[’']achat|causalit[eé]|non d[eé]montr[eé]|ne prouve|sans preuve causale|preuve causale|r[oô]le plausible|ne suffit pas|ne peut pas conclure|insuffisant[^·.]*conclure|aucune conclusion|aucune cause|narration causale|prudence|prudent|non qualifi[eé]|non identifi[eé]|ind[eé]termin[eé]|inconnu|indisponible|non comparable|information insuffisante)/i;
  function aetherInformationFact40122(value){
    const text=String(value||"").replace(/\s+/g," " ).trim();
    if(!text||AETHER_NON_INFORMATION_RE_40122.test(text))return "";
    return text;
  }
  function aetherInformationLine40122(value){
    return String(value||"").split("·").map(part=>aetherInformationFact40122(part)).filter(Boolean).join(" · " );
  }
  function aetherContextCurrent4089(model=null){
    const c=model;if(!c)return null;
    const proof=c.proofScore>0?`PREUVE ${Math.round(c.proofScore)}/100`:"PREUVE N/D";
    const qualified=value=>{
      return aetherInformationFact40122(value);
    };
    const marketRows=(()=>{
      try{
        const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
        const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
        return coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
          .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber4086(row?.change24h)}))
          .filter(row=>row.change!==null);
      }catch(_){return[];}
    })();
    const focusRows=marketRows.filter(row=>(c.assets||[]).includes(row.symbol));
    const positives=marketRows.filter(row=>row.change>0).length;
    const negatives=marketRows.filter(row=>row.change<0).length;
    const marketSummary=marketRows.length?`Top 5 ${positives}/${marketRows.length} positifs${negatives?` · ${negatives} négatif${negatives>1?"s":""}`:""}`:"";
    const focusSummary=focusRows.slice(0,3).map(row=>`${row.symbol} ${row.change>=0?"+":""}${row.change.toFixed(2)} %`).join(" · ");
    const mechanism=qualified(c.mechanismTitle);
    const direction=qualified(c.mechanismDirection);
    const flow=qualified(c.flowLabel);
    const flowDirection=qualified(c.flowDirection);
    // 40.4.123 — context is a compact fact stack, not a prose explanation.
    // The previous generic “le mécanisme peut expliquer…” sentence is deliberately not repeated in the scarce ribbon lane.
    const facts=[];
    const pushFact=value=>{const fact=qualified(value);if(fact&&!facts.includes(fact))facts.push(fact);};
    // 40.4.125 — keep the translated News Sentinel fact visible through the paired CONTEXTE phase.
    // Context enriches the story; it no longer replaces the story with mechanism-only telemetry.
    pushFact(c.headline);
    pushFact(mechanism?`${mechanism}${direction?` · ${direction}`:""}`:"");
    pushFact(flow?`${flow}${flowDirection?` · ${flowDirection}`:""}`:"");
    pushFact(focusSummary);
    pushFact(marketSummary);
    if(!marketSummary)pushFact(c.breadth);
    pushFact(c.marketTone);
    pushFact(c.source);
    if(!facts.length){pushFact(c.headline);pushFact(c.source);}
    return {kind:"context",brand:"♥ CONTEXTE",tone:"context",index:0,total:1,event:c.lead,meta:`${c.scope} · ${proof}`,detail:facts.join(" · "),context:c.n};
  }
  function aetherVeilleCurrent4087(){
    const snapshot=aetherVeilleStatus4087(),events=snapshot.events||[];
    if(!events.length)return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:0,total:0,event:null,meta:snapshot.label,detail:snapshot.text};
    aetherVeilleState4087.index=((aetherVeilleState4087.index%events.length)+events.length)%events.length;
    if(aetherVeilleState4087.kind==="context"){
      const story=aetherVeilleState4087.storyEvent||events[aetherVeilleState4087.index]||null;
      const context=aetherVeilleState4087.storyContext||aetherNewsMarketContext4089(story);
      if(context){const current=aetherContextCurrent4089(context);if(current)return current;}
      aetherVeilleState4087.kind="alert";
      aetherVeilleState4087.storyEvent=null;
      aetherVeilleState4087.storyContext=null;
    }
    const event=events[aetherVeilleState4087.index],impactLevel=String(event?.impact?.level||"Impact").toUpperCase(),impact=Math.round(aetherVeilleNumber4087(event?.impact?.score));
    const scope=aetherVeilleScope4087(event),evidence=Math.round(aetherVeilleNumber4087(event?.evidence?.score));
    const source=String(event?.source_name||event?.source_host||event?.source_class||"").replace(/^www\./,"").trim();
    const freshness=String(event?.freshness?.label||"").trim();
    const headline=aetherNewsHeadlineSource40133(event,"Event to qualify");
    // 40.4.123 — priority first: asset/scope and impact are readable before the queue position.
    const meta=`${scope} · ${impactLevel} ${impact}/100 · ${aetherVeilleState4087.index+1}/${events.length}`;
    // 40.4.130 — VEILLE alone owns the long translated story; fixed telemetry remains in brand/meta.
    const detail=[headline,source||null].filter(Boolean).join(" · ");
    return{...snapshot,kind:"alert",brand:"♥ VEILLE",index:aetherVeilleState4087.index,total:events.length,event,meta,detail};
  }
  function aetherVeilleMarqueeSync40121(host,viewport,marquee,copy,fingerprint,fingerprintChanged){
    if(!host||!viewport||!marquee||!copy)return;
    const viewportWidth=Math.max(0,Math.round(viewport.clientWidth));
    const geometryChanged=Math.abs(viewportWidth-aetherVeilleState4087.viewportWidth)>1;
    if(!fingerprintChanged&&!geometryChanged)return;
    aetherVeilleState4087.viewportWidth=viewportWidth;
    // 40.4.121: speed is a velocity, not a fixed duration.
    // Fixed 8.6 s made short overflows crawl and long overflows race.
    host.dataset.scroll="0";
    host.style.removeProperty("--aether-veille-shift-4087");
    host.style.removeProperty("--aether-veille-duration-40121");
    host.style.removeProperty("--aether-veille-delay-40121");
    void marquee.offsetWidth;
    requestAnimationFrame(()=>{
      if(aetherVeilleState4087.fingerprint!==fingerprint||!copy.isConnected||!viewport.isConnected)return;
      const overflow=Math.max(0,Math.ceil(copy.scrollWidth-viewport.clientWidth+12));
      host.style.setProperty("--aether-veille-shift-4087",`${-overflow}px`);
      if(overflow>AETHER_MARQUEE_MIN_OVERFLOW_PX_40121){
        const duration=Math.max(0.01,overflow/AETHER_MARQUEE_SPEED_PX_S_40121);
        host.style.setProperty("--aether-veille-duration-40121",`${duration.toFixed(3)}s`);
        host.style.setProperty("--aether-veille-delay-40121",`${AETHER_MARQUEE_DELAY_S_40121}s`);
        host.dataset.scrollSpeed=String(AETHER_MARQUEE_SPEED_PX_S_40121);
        host.dataset.scroll="0";
        void marquee.offsetWidth;
        host.dataset.scroll="1";
      }else{
        host.dataset.scrollSpeed="0";
        host.dataset.scroll="0";
      }
    });
  }
  function renderAetherVeille4087(){
    const host=document.getElementById("atlasAetherVeille4087"),meta=document.getElementById("atlasAetherVeilleMeta4087"),viewport=document.getElementById("atlasAetherVeilleViewport4087");
    if(!host||!meta||!viewport)return null;
    const current=aetherVeilleCurrent4087(),copy=host.querySelector("[data-aether-veille-copy-4087]"),brand=host.querySelector(".atlas-aether-veille-brand-4087"),marquee=host.querySelector(".atlas-aether-veille-marquee-4087");
    if(meta.textContent!==current.meta)meta.textContent=current.meta;
    if(brand&&brand.textContent!==current.brand)brand.textContent=current.brand;
    host.dataset.tone=current.tone||"neutral";
    host.dataset.kind=current.kind||"alert";
    host.dataset.contextFacet=current.kind==="context"?String(current.facet??0):"";
    host.setAttribute("aria-label",current.kind==="context"?"Aether Contexte · même événement News Sentinel · mécanisme, flux et réaction marché":"Aether Veille · synthèse prioritaire News Sentinel");
    const fingerprint=`${current.kind}|${current.eventKey||""}|${current.meta}|${current.detail}`;
    const fingerprintChanged=aetherVeilleState4087.fingerprint!==fingerprint;
    if(fingerprintChanged){
      // Stop the previous message before mutating its text; motion restarts only after re-measure.
      host.dataset.scroll="0";
      host.style.removeProperty("--aether-veille-shift-4087");
      host.style.removeProperty("--aether-veille-duration-40121");
      host.style.removeProperty("--aether-veille-delay-40121");
      if(copy&&copy.textContent!==current.detail)copy.textContent=current.detail;
      if(copy)copy.title=current.detail;
      aetherVeilleState4087.fingerprint=fingerprint;
    }
    aetherVeilleMarqueeSync40121(host,viewport,marquee,copy,fingerprint,fingerprintChanged);
    aetherVeilleState4087.last=current;
    return current;
  }
  function aetherVeilleAdvance4087(){
    const ranked=aetherVeilleEvents4087();
    if(!ranked.length){
      aetherVeilleState4087.index=0;aetherVeilleState4087.kind="alert";aetherVeilleState4087.storyEvent=null;aetherVeilleState4087.storyContext=null;aetherVeilleState4087.fingerprint="";
      return renderAetherVeille4087();
    }
    // 40.4.126+ / 40.4.130 — scarce FEED time belongs to News stories only.
    // 40.4.129 continuity is preserved: the cursor is not reset when a FEED window closes.
    aetherVeilleState4087.index=(aetherVeilleState4087.index+1)%ranked.length;
    aetherVeilleState4087.kind="alert";
    aetherVeilleState4087.storyEvent=null;
    aetherVeilleState4087.storyContext=null;
    aetherVeilleState4087.fingerprint="";
    return renderAetherVeille4087();
  }
  function aetherCompact4088(value, max=88){
    const text=String(value||"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,Math.max(8,max-1)).trimEnd()}…`:text;
  }
  function aetherMarketBrief4088(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()));
      const btc=rows.find(row=>String(row?.symbol||"").toUpperCase()==="BTC")||coins.find(row=>row?.id==="bitcoin");
      const price=aetherSystemNumber4086(btc?.price),change=aetherSystemNumber4086(btc?.change24h);
      const leader=rows.filter(row=>aetherSystemNumber4086(row?.change24h)!==null).sort((x,y)=>Number(y.change24h)-Number(x.change24h))[0]||null;
      const parts=[];
      if(price!==null&&price>0){
        parts.push(`BTC ${new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(price)}`);
        if(change!==null)parts.push(`${change>=0?"+":""}${change.toFixed(2)} %`);
      }
      const leaderChange=aetherSystemNumber4086(leader?.change24h);
      if(leader&&leaderChange!==null)parts.push(`${String(leader.symbol||"").toUpperCase()} leader ${leaderChange>=0?"+":""}${leaderChange.toFixed(2)} %`);
      return parts.join(" · ")||"marché en attente";
    }catch(_){return"marché en attente";}
  }
  function aetherOracleBrief4088(){
    const identity=aetherText4084("atlasOracleOperatorIdentity","");
    const bias=aetherText4084("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim();
    const confidence=aetherText4084("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim();
    const legacyAsset=aetherText4084("atlasOracleAsset","");
    const legacyBias=aetherText4084("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const legacyConfidence=aetherText4084("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const readyIdentity=identity&&!/EN ATTENTE|LIVE CHECK|LIVECHECK/i.test(identity)?identity:legacyAsset&&!/EN ATTENTE/i.test(legacyAsset)?legacyAsset:"";
    const readyBias=bias&&!/[—-]$|ATTENTE|REQUIS/i.test(bias)?bias:legacyBias&&!/ATTENTE|REQUIS/i.test(legacyBias)?legacyBias:"";
    const readyConfidence=confidence&&!/[—-]$|ATTENTE/i.test(confidence)?confidence:legacyConfidence&&!/[—-]$/.test(legacyConfidence)?legacyConfidence:"";
    return [readyIdentity,readyBias,readyConfidence].filter(Boolean).join(" · ")||"en attente";
  }
  function aetherAtlasBrief4088(){
    const current=aetherCurrent4084();
    const status=String(current?.status||"").trim().toUpperCase();
    const operator=aetherText4084("atlasOracleAtlas","").replace(/^Atlas\s*:\s*/i,"").trim();
    if(operator&&!/en attente/i.test(operator)){
      const first=operator.split("·").map(v=>v.trim()).filter(Boolean)[0]||"";
      const score=(operator.match(/(?:score\s+direction|direction)\s*([+−-]?\s*\d+\s*\/\s*100)/i)||[])[1]||"";
      const scoreClean=score.replace(/\s+/g,"").replace("−","-");
      let signal=first.replace(/^momentum\s*/i,"").trim();
      if(/partag/i.test(first))signal="PARTAGÉ";
      else if(/hauss|bull/i.test(first))signal="HAUSSIER";
      else if(/baiss|bear/i.test(first))signal="BAISSIER";
      else signal=aetherCompact4088(signal||first,20).toUpperCase();
      return [status&&status!=="IDLE"?status:null,signal||null,scoreClean||null].filter(Boolean).join(" · ");
    }
    const reports=Array.isArray(current?.reports)?current.reports.length:0;
    return `${status||"VEILLE"}${reports?` · ${reports}/4`:""}`;
  }
  function aetherSourcesBrief4088(){
    const live=aetherText4084("liveStatus","");
    const raw=live&&!/requis|attente/i.test(live)?live:aetherText4084("sourceName","Aucune source");
    const ratio=(raw.match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,"")||"";
    if(/binance/i.test(raw))return `Binance${ratio?` · ${ratio}`:""}`;
    return aetherCompact4088(raw.replace(/^Prix live\s*/i,""),34);
  }
  function aetherBreadthBrief40121(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
      const rows=coins.filter(row=>top5.has(String(row?.symbol||"").toUpperCase()))
        .map(row=>({symbol:String(row?.symbol||"").toUpperCase(),change:aetherSystemNumber4086(row?.change24h)}))
        .filter(row=>row.symbol&&row.change!==null);
      if(!rows.length)return "en attente";
      const pos=rows.filter(row=>row.change>0).length,neg=rows.filter(row=>row.change<0).length,flat=rows.length-pos-neg;
      const ordered=rows.slice().sort((a,b)=>b.change-a.change),leader=ordered[0],laggard=ordered.at(-1);
      const breadth=`${pos}/${rows.length} positifs${neg?` · ${neg} négatif${neg>1?"s":""}`:""}${flat?` · ${flat} neutre${flat>1?"s":""}`:""}`;
      const edges=[];
      if(leader)edges.push(`${leader.symbol} ${leader.change>=0?"+":""}${leader.change.toFixed(2)} %`);
      if(laggard&&laggard.symbol!==leader?.symbol)edges.push(`${laggard.symbol} ${laggard.change>=0?"+":""}${laggard.change.toFixed(2)} %`);
      return [breadth,...edges].filter(Boolean).join(" · ");
    }catch(_){return "en attente";}
  }
  function aetherAnalysisBrief40121(){
    // 40.4.123 — the prime INFO lane always exposes breadth + both edges.
    // This is denser and more stable than mirroring an arbitrary moves sentence.
    const breadth=aetherBreadthBrief40121();
    return `Top 5 · ${aetherCompact4088(breadth,86)}`;
  }
  function aetherOraclePriorityBrief40123(){
    const identity=aetherText4084("atlasOracleOperatorIdentity","");
    const legacyAsset=aetherText4084("atlasOracleAsset","");
    const parts=identity.split("·").map(v=>v.trim()).filter(Boolean);
    const asset=(parts[0]&&!/ATTENTE|LIVE CHECK|LIVECHECK/i.test(parts[0]))?parts[0]:(legacyAsset&&!/ATTENTE/i.test(legacyAsset)?legacyAsset:"");
    const mode=parts.slice(1).join(" · ");
    const bias=aetherText4084("atlasOracleOperatorBias","").replace(/^BIAIS\s*/i,"").trim()
      ||aetherText4084("atlasOracleBias","").replace(/^Biais mesuré\s*:\s*/i,"").trim();
    const confidence=aetherText4084("atlasOracleOperatorConfidence","").replace(/^CONF\.\s*/i,"").trim()
      ||aetherText4084("atlasOracleConfidence","").replace(/^Confiance données\s*/i,"").trim();
    const clean=value=>String(value||"").trim();
    const ready=[asset,(!/ATTENTE|REQUIS|^[—-]$/i.test(clean(bias))?clean(bias):""),(!/ATTENTE|^[—-]$/i.test(clean(confidence))?clean(confidence):""),mode].filter(Boolean);
    return ready.join(" · ");
  }
  function aetherSignalBrief40121(){
    const oracle=aetherInformationLine40122(aetherOraclePriorityBrief40123());
    if(oracle&&!/en attente/i.test(oracle))return `Oracle · ${aetherCompact4088(oracle,78)}`;
    const risk=aetherInformationLine40122(aetherText4084("atlasOperatorRisk35",""));
    const riskDetail=aetherInformationLine40122(aetherText4084("atlasOperatorRiskDetail35",""));
    // A positive anomaly is information; “pas d’anomalie / aucune donnée” is filler.
    if(risk&&!/attente|aucune|pas d|non /i.test(risk))return `Signal · ${aetherCompact4088([risk,riskDetail].filter(Boolean).join(" · "),78)}`;
    return `Top 5 · ${aetherCompact4088(aetherBreadthBrief40121(),78)}`;
  }
  function aetherVeilleBrief40121(){
    try{
      const snapshot=aetherVeilleStatus4087(),events=snapshot.events||[];
      if(!events.length)return `Veille · ${snapshot.label||"aucun événement prioritaire"}`;
      const event=events[0],scope=aetherVeilleScope4087(event),impact=Math.round(aetherVeilleNumber4087(event?.impact?.score));
      const headline=aetherNewsHeadlineSource40133(event,"");
      // 40.4.125 — information first: the French headline owns the visible prefix; scope/impact follow.
      return `Veille · ${aetherCompact4088(headline,88)}${scope?` · ${scope}`:""}${impact?` ${impact}/100`:""}`;
    }catch(_){return "Veille · News Sentinel";}
  }
  const aetherNewsWake4088={attempted:false,inflight:null};
  function aetherWakeNewsSentinel4088(){
    if(aetherNewsWake4088.inflight)return aetherNewsWake4088.inflight;
    try{
      const events=(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))?newsFeedState.events:[];
      const status=typeof newsFeedState!=="undefined"?String(newsFeedState?.status||"idle"):"unavailable";
      const runtimeFresh=typeof newsFeedState!=="undefined"
        && newsFeedState?.startupSucceeded===true
        && status==="ok";
      const frenchPresentationReady=events.length>0
        && events.every(event=>String(event?.headline_fr_display||event?.headline_fr||"").trim());
      if(status==="loading"||aetherNewsWake4088.attempted||typeof loadNewsLiveFeed!=="function")return Promise.resolve(false);
      // 40.4.112: cached events are a continuity fallback, never proof that the current archive was fetched.
      // Wake the existing News owner once on page start, even when a previous localStorage cache populated the ribbon.
      if(runtimeFresh&&frenchPresentationReady)return Promise.resolve(false);
      aetherNewsWake4088.attempted=true;
      aetherNewsWake4088.inflight=Promise.resolve(loadNewsLiveFeed({force:true,automatic:false}))
        .catch(()=>false)
        .finally(()=>{
          aetherNewsWake4088.inflight=null;
          try{aetherVeilleState4087.fingerprint="";renderAether4084();renderAetherVeille4087();}catch(_){}
        });
      return aetherNewsWake4088.inflight;
    }catch(_){return Promise.resolve(false);}
  }

  function aetherSnapshot4084(){
    const current=aetherCurrent4084();
    const reports=Array.isArray(current?.reports)?current.reports.length:0;
    const currentStatus=String(current?.status||"").trim().toUpperCase();
    const atlas=aetherAtlasBrief4088();
    const oracle=aetherOracleBrief4088();
    const sources=aetherSourcesBrief4088();
    const market=aetherMarketBrief4088();
    const analysis=aetherAnalysisBrief40121();
    const signal=aetherSignalBrief40121();
    const veilleBrief=aetherVeilleBrief40121();
    let book="APRÈS AUTH";
    try{
      if(typeof atlasBookMirrorBridgeState40377!=="undefined"){
        book=atlasBookMirrorBridgeState40377.credentialReady===true?"PRÊT":atlasBookMirrorBridgeState40377.credentialReady===false?"CREDENTIAL REQUIS":"EN VEILLE";
      }
    }catch(_){}
    const veille=aetherVeilleCurrent4087();
    const news=veille.detail||veille.text||"Veille non chargée";
    const graphTop5=document.getElementById("btnChartTop5")?.classList?.contains("active")===true;
    const graphTitle=aetherText4084("selectedAssetTitle","Aucune sélection");
    const graph=graphTop5?"TOP 5":graphTitle;
    return {current,reports,currentStatus,atlas,oracle,sources,book,market,analysis,signal,veilleBrief,news,graph};
  }
  function aetherMarketBreadth40133(){
  try{const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];const rows=coins.map(r=>aetherSystemNumber4086(r?.change24h)).filter(v=>v!==null);if(!rows.length)return "Marché non chargé";const up=rows.filter(v=>v>.05).length,down=rows.filter(v=>v<-.05).length,flat=rows.length-up-down;const bias=down>up*1.35?"largeur négative":up>down*1.35?"largeur positive":"largeur mixte";return `${up} hausses · ${down} baisses · ${flat} stables · ${bias}`;}catch(_){return "Marché non chargé";}
}
function aetherAtlasAuto40133(){
  try{const o=globalThis.ErithAtlasResidentWake40133,s=o&&typeof o.snapshot==="function"?o.snapshot():null;if(!s)return "Résident · owner en attente";if(s.last_action==="current-kick")return `ARMÉ · CURRENT relancé · ${s.last_market_id||"snapshot canonique"}`;if(s.last_action==="bridge-sync")return "ARMÉ · nouveau snapshot détecté · Bridge en reprise";if(s.last_action==="already-current")return "ARMÉ · snapshot déjà CURRENT";return s.installed?"ARMÉ · surveille le prochain snapshot canonique":"NON ARMÉ";}catch(_){return "Résident · état indisponible";}
}
function aetherSystemBrief40133(){
  const sys=aetherSystemState4086.system||{},cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),ct=aetherSystemTemperature4086(sys?.cpu?.temperature_c),gs=String(sys?.gpu?.status||"").trim().toLowerCase(),gpu=gs&&gs!=="ok"?null:aetherSystemPercent4086(sys?.gpu?.usage_pct),gt=gs&&gs!=="ok"?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c),ram=aetherSystemPercent4086(sys?.memory?.usage_pct);const part=(l,v,t=null)=>`${l} ${v===null?"N/D":`${Math.round(v)}%${t===null?"":` ${Math.round(t)}°`}`}`;return `${part("CPU",cpu,ct)} · ${part("GPU",gpu,gt)} · ${part("RAM",ram)}`;
}
function aetherWeatherOutlook40133(){return String(aetherSystemState4086.weather?.daily_summary||"Prévisions 5 jours en attente").trim();}
function aetherWeatherRisk40133(){return String(aetherSystemState4086.weather?.electrical_risk||"Risque orage/rafales en attente").trim();}
function aetherAttention40133(){
  const w=aetherSystemState4086.weather||{};if(w.risk_level==="danger"||w.risk_level==="warn")return `Météo · ${aetherWeatherRisk40133()}`;const sys=aetherSystemState4086.system||{},cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),gpu=aetherSystemPercent4086(sys?.gpu?.usage_pct),ram=aetherSystemPercent4086(sys?.memory?.usage_pct),ct=aetherSystemTemperature4086(sys?.cpu?.temperature_c),gt=aetherSystemTemperature4086(sys?.gpu?.temperature_c);if((cpu!==null&&cpu>=88)||(gpu!==null&&gpu>=92)||(ram!==null&&ram>=90)||(ct!==null&&ct>=90)||(gt!==null&&gt>=84))return `Système · ${aetherSystemBrief40133()}`;const a=aetherAtlasAuto40133();if(/NON ARMÉ|indisponible/i.test(a))return `Atlas AUTO · ${a}`;return `Marché · ${aetherMarketBreadth40133()}`;
}
  function aetherPanelEnsure4084(){
    let panel=document.getElementById("atlasAetherStatusPanel4084");if(panel)return panel;
    panel=document.createElement("section");panel.id="atlasAetherStatusPanel4084";panel.hidden=true;panel.setAttribute("aria-label","Synthèse Aether");
    panel.innerHTML=`<div class="atlas-aether-panel-head-4084"><b>♥ AETHER · ATTENTION · OPERATOR WATCH</b><button type="button" data-aether-close-4084 aria-label="Fermer">×</button></div><div class="atlas-aether-panel-grid-4084"><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article><article><span>Marché</span><b data-aether-row-4084="market">—</b></article><article><span>Atlas AUTO</span><b data-aether-row-4084="atlas_auto">—</b></article><article><span>Atlas</span><b data-aether-row-4084="atlas">—</b></article><article><span>Oracle</span><b data-aether-row-4084="oracle">—</b></article><article><span>Sources</span><b data-aether-row-4084="sources">—</b></article><article><span>Système</span><b data-aether-row-4084="system">—</b></article><article data-aether-wide-4084><span>Météo 5 j</span><b data-aether-row-4084="weather">—</b></article><article data-aether-wide-4084><span>Risque météo</span><b data-aether-row-4084="weather_risk">—</b></article><article data-aether-wide-4084><span>Dernière veille</span><b data-aether-row-4084="news">—</b></article></div>`;
    document.body.appendChild(panel);panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));return panel;
  }
  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open)renderAether4084();}
  function renderAether4084(){
    const s=aetherSnapshot4084();
    const put=(id,value)=>{const n=document.getElementById(id);if(n&&n.textContent!==value)n.textContent=value;};
    // 40.4.130 — restore the healthy semantic INFO contract. No global INFO marquee.
    // Long News text belongs only to the dedicated VEILLE phase.
    put("atlasAetherRibbonMarket4088","");
    put("atlasAetherRibbonAtlas4084",`Atlas · ${s.atlas}`);
    put("atlasAetherRibbonOracle4084",`Oracle · ${s.oracle}`);
    put("atlasAetherRibbonSources4084",`Sources · ${s.sources}`);
    put("atlasAetherRibbonBook4084",`Book · ${s.book}`);
    renderAetherVeille4087();
    let stateLabel="VEILLE";if(/open|running|active|produ/i.test(s.currentStatus))stateLabel="CURRENT";else if(s.reports>=4)stateLabel="ATLAS 4/4";else if(s.oracle&&!/ATTENTE/.test(s.oracle))stateLabel="ORACLE";try{const feed=aetherVeilleCurrent4087();if(feed.kind==="context")stateLabel="CONTEXTE";else if(feed.tone==="danger")stateLabel="ATTENTION";}catch(_){}put("atlasAetherStatusLabel4084",`Aether · ${stateLabel}`);
    const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row-4084="${k}"]`);if(n)n.textContent=v;};row("attention",aetherAttention40133());row("market",aetherMarketBreadth40133());row("atlas_auto",aetherAtlasAuto40133());row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("system",aetherSystemBrief40133());row("weather",aetherWeatherOutlook40133());row("weather_risk",aetherWeatherRisk40133());row("news",s.news);}
  }

  const AETHER_SYSTEM_BACKEND_4086="http://127.0.0.1:8790/system";
  const AETHER_WEATHER_4086=Object.freeze({latitude:48.5876,longitude:1.5784,timezone:"Europe/Paris",ttl:15*60*1000,label:"Maintenon",days:5});
  const aetherSystemState4086={system:null,systemAt:0,systemInflight:null,weather:null,weatherAt:0,weatherInflight:null,weatherStale:false};
  const aetherSystemNumber4086=value=>{
    if(value===null||value===undefined)return null;
    if(typeof value==="string"&&!value.trim())return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const aetherSystemPercent4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>=0&&n<=100?n:null;};
  const aetherSystemTemperature4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>0&&n<150?n:null;};
  function aetherSystemSet4086(key,value,{icon=null,tone=null,title=null}={}){
    const item=document.querySelector(`#atlasAetherSystem4086 [data-aether-system-4086="${key}"]`);if(!item)return;
    const out=item.querySelector(".atlas-aether-system-value-4086");if(out&&out.textContent!==String(value))out.textContent=String(value);
    if(icon){const node=item.querySelector(".atlas-aether-system-icon-4086");if(node&&node.textContent!==icon)node.textContent=icon;}
    if(title)item.title=title;
    if(key==="btc")item.dataset.tone=tone||"flat";
  }
  function aetherWeatherIcon4086(code){const c=aetherSystemNumber4086(code);if(c===null)return"·";if(c===0)return"☀";if([1,2,3].includes(c))return"☁";if([45,48].includes(c))return"≋";if((c>=51&&c<=67)||(c>=80&&c<=82))return"☂";if((c>=71&&c<=77)||(c>=85&&c<=86))return"❄";if(c>=95)return"⚡";return"☁";}
  function aetherBtc4086(){
    try{
      const coin=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins.find(row=>String(row?.symbol||"").toUpperCase()==="BTC"||row?.id==="bitcoin"):null;
      const price=aetherSystemNumber4086(coin?.price),change=aetherSystemNumber4086(coin?.change24h);
      if(price===null||price<=0)return{value:"—",tone:"flat",title:"BTC live indisponible"};
      const priceText=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:price>=1000?0:2}).format(price);
      const changeText=change===null?"":` · ${change>=0?"+":""}${change.toFixed(2)} %`;
      return{value:`${priceText}${changeText}`,tone:change>0?"positive":change<0?"negative":"flat",title:"Bitcoin · prix live Agent-Crypto"};
    }catch(_){return{value:"—",tone:"flat",title:"BTC live indisponible"};}
  }
  function renderAetherSystem4086(){
    const sys=aetherSystemState4086.system||{};
    const cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature4086(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||"").trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemPercent4086(sys?.gpu?.usage_pct);
    const gpuTemp=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent4086(sys?.memory?.usage_pct),used=aetherSystemNumber4086(sys?.memory?.used_gb),total=aetherSystemNumber4086(sys?.memory?.total_gb);
    aetherSystemSet4086("cpu",cpu===null?"N/D":`${Math.round(cpu)} %${cpuTemp===null?"":` · ${Math.round(cpuTemp)}°`}`,{title:sys?.cpu?.name||"CPU Windows · backend local 8790"});
    aetherSystemSet4086("gpu",gpu===null?"N/D":`${Math.round(gpu)} %${gpuTemp===null?"":` · ${Math.round(gpuTemp)}°`}`,{title:sys?.gpu?.name||"GPU · backend local 8790"});
    const ramDetail=used!==null&&total!==null&&total>0&&used>=0&&used<=total?` · ${used.toFixed(1)}/${total.toFixed(1)} Go`:"";
    aetherSystemSet4086("ram",ram===null?"N/D":`${Math.round(ram)} %${ramDetail}`,{title:"RAM Windows · backend local 8790"});
    const weather=aetherSystemState4086.weather;
    const weatherTemp=aetherSystemNumber4086(weather?.temperature_c);
    aetherSystemSet4086("weather",weatherTemp!==null&&weatherTemp>=-80&&weatherTemp<=60?`${Math.round(weatherTemp)} °C${aetherSystemState4086.weatherStale?" · cache":""}`:"N/D",{icon:aetherWeatherIcon4086(weather?.weather_code),title:`Maintenon · Eure-et-Loir · Open-Meteo${aetherSystemState4086.weatherStale?" · dernière valeur valide conservée":""}`});
    const btc=aetherBtc4086();aetherSystemSet4086("btc",btc.value,{tone:btc.tone,title:btc.title});
  }
  function aetherSystemBackend4086(force=false){
    const now=Date.now();if(aetherSystemState4086.systemInflight)return aetherSystemState4086.systemInflight;
    if(!force&&now-aetherSystemState4086.systemAt<15000){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.system);}
    const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),1800);
    aetherSystemState4086.systemInflight=fetch(AETHER_SYSTEM_BACKEND_4086,{cache:"no-store",headers:{Accept:"application/json"},signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{aetherSystemState4086.system=payload&&payload.read_only===true?payload:null;aetherSystemState4086.systemAt=Date.now();return aetherSystemState4086.system;})
      .catch(()=>{aetherSystemState4086.system=null;aetherSystemState4086.systemAt=Date.now();return null;})
      .finally(()=>{window.clearTimeout(timeout);aetherSystemState4086.systemInflight=null;renderAetherSystem4086();});
    return aetherSystemState4086.systemInflight;
  }
  function aetherWeatherForecast40133(payload){
  const t=aetherSystemNumber4086(payload?.current?.temperature_2m),c=aetherSystemNumber4086(payload?.current?.weather_code),d=payload?.daily||{},times=Array.isArray(d.time)?d.time:[],codes=Array.isArray(d.weather_code)?d.weather_code:[],maxs=Array.isArray(d.temperature_2m_max)?d.temperature_2m_max:[],mins=Array.isArray(d.temperature_2m_min)?d.temperature_2m_min:[],probs=Array.isArray(d.precipitation_probability_max)?d.precipitation_probability_max:[],gusts=Array.isArray(d.wind_gusts_10m_max)?d.wind_gusts_10m_max:[],fmt=new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit"});
  const daily=times.slice(0,5).map((time,i)=>{let label=time;try{label=fmt.format(new Date(`${time}T12:00:00`));}catch(_){}const hi=aetherSystemNumber4086(maxs[i]),lo=aetherSystemNumber4086(mins[i]),pr=aetherSystemNumber4086(probs[i]),gu=aetherSystemNumber4086(gusts[i]),co=aetherSystemNumber4086(codes[i]);return {time,code:co,gust:gu,text:`${label} ${aetherWeatherIcon4086(co)} ${hi===null||lo===null?"N/D":`${Math.round(hi)}/${Math.round(lo)}°`}${pr===null?"":` · pluie ${Math.round(pr)}%`}${gu===null?"":` · raf. ${Math.round(gu)} km/h`}`};});
  const h=payload?.hourly||{},ht=Array.isArray(h.time)?h.time:[],hc=Array.isArray(h.weather_code)?h.weather_code:[],hp=Array.isArray(h.precipitation_probability)?h.precipitation_probability:[],hg=Array.isArray(h.wind_gusts_10m)?h.wind_gusts_10m:[];let thunder=null,maxG=null,maxAt="",maxP=null;for(let i=0;i<ht.length;i++){const co=aetherSystemNumber4086(hc[i]),gu=aetherSystemNumber4086(hg[i]),pr=aetherSystemNumber4086(hp[i]);if(co!==null&&co>=95&&!thunder)thunder={time:ht[i],gust:gu,prob:pr};if(gu!==null&&(maxG===null||gu>maxG)){maxG=gu;maxAt=ht[i];}if(pr!==null&&(maxP===null||pr>maxP))maxP=pr;}
  const when=x=>{try{return new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(x));}catch(_){return x||"";}};let level="ok",risk="";if(thunder){level="danger";risk=`⚡ Orage prévu ${when(thunder.time)}${thunder.prob===null?"":` · pluie ${Math.round(thunder.prob)}%`}${thunder.gust===null?"":` · raf. ${Math.round(thunder.gust)} km/h`}`;}else if(maxG!==null&&maxG>=70){level="warn";risk=`Rafales fortes prévues ${when(maxAt)} · max ${Math.round(maxG)} km/h · surveiller alimentation/réseau`;}else if(maxG!==null&&maxG>=55){level="watch";risk=`Vent soutenu sur 5 j · rafales max ${Math.round(maxG)} km/h · aucun orage WMO signalé`;}else risk=`Aucun orage WMO signalé sur 5 j${maxG===null?"":` · rafales max ${Math.round(maxG)} km/h`}${maxP===null?"":` · pluie max ${Math.round(maxP)}%`}`;return {temperature_c:t,weather_code:c,daily,daily_summary:daily.map(x=>x.text).join(" | "),risk_level:level,electrical_risk:risk,max_gust_kmh:maxG,first_thunder:thunder};
}
  function aetherSystemWeather4086(force=false){
    const now=Date.now();if(aetherSystemState4086.weatherInflight)return aetherSystemState4086.weatherInflight;
    if(!force&&now-aetherSystemState4086.weatherAt<AETHER_WEATHER_4086.ttl){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.weather);}
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${AETHER_WEATHER_4086.latitude}&longitude=${AETHER_WEATHER_4086.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max&hourly=weather_code,precipitation_probability,wind_gusts_10m&forecast_days=${AETHER_WEATHER_4086.days}&timezone=${encodeURIComponent(AETHER_WEATHER_4086.timezone)}`;
    aetherSystemState4086.weatherInflight=fetch(url,{cache:"no-store",headers:{Accept:"application/json"}})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{const forecast=aetherWeatherForecast40133(payload);aetherSystemState4086.weather=forecast;aetherSystemState4086.weatherStale=false;aetherSystemState4086.weatherAt=Date.now();return forecast;})
      .catch(()=>{aetherSystemState4086.weatherStale=Boolean(aetherSystemState4086.weather);aetherSystemState4086.weatherAt=Date.now();return aetherSystemState4086.weather;})
      .finally(()=>{aetherSystemState4086.weatherInflight=null;renderAetherSystem4086();renderAether4084();});
    return aetherSystemState4086.weatherInflight;
  }
  function aetherSystemRefresh4086({force=false}={}){
    renderAetherSystem4086();
    if(document.hidden)return Promise.resolve(false);
    return Promise.allSettled([aetherSystemBackend4086(force),aetherSystemWeather4086(force)]);
  }

  function aetherBindOracleCompletion4088(){
    if(globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__===true)return true;
    try{
      if(typeof atlasRenderOracleV0!=="function")return false;
      const base=atlasRenderOracleV0;
      atlasRenderOracleV0=function atlasRenderOracleV0Aether4088(){
        const result=base.apply(this,arguments);
        queueMicrotask(()=>{try{renderAether4084();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__=true;
      return true;
    }catch(_){return false;}
  }

  function aetherBindMarketCompletion4086(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether4086(options={}){
        const result=base.apply(this,arguments);
        queueMicrotask(()=>{try{renderAether4084();renderAetherSystem4086();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    renderAether4084();
    renderAetherVeille4087();
    void aetherWakeNewsSentinel4088();
    return aetherSystemRefresh4086({force});
  }

  function bindAether(){
    const button=document.getElementById("atlasAetherStatusToggle4084");
    if(button&&button.dataset.aetherBound!=="1"){
      button.dataset.aetherBound="1";
      button.addEventListener("click",()=>aetherPanelSet4084(button.getAttribute("aria-expanded")!=="true"));
    }
    const quickPanel=document.getElementById("atlasAetherSystem4086");
    if(quickPanel&&quickPanel.dataset.aetherDetailBound404134!=="1"){
      quickPanel.dataset.aetherDetailBound404134="1";
      quickPanel.setAttribute("role","button");
      quickPanel.setAttribute("tabindex","0");
      quickPanel.setAttribute("aria-label","Ouvrir Aether : météo Maintenon 5 jours, risque météo, système et Atlas AUTO");
      quickPanel.setAttribute("title","Ouvrir Aether · météo 5 j · risque · système · Atlas AUTO");
      quickPanel.style.cursor="pointer";
      const openDetail404134=()=>aetherPanelSet4084(true);
      quickPanel.addEventListener("click",openDetail404134);
      quickPanel.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openDetail404134();}});
    }
    window.addEventListener("erith:operator-priority-release",()=>{renderAether4084();renderAetherSystem4086();renderAetherVeille4087();},{passive:true});
    const feed=document.getElementById("atlasAetherVeille4087");
    if(feed&&feed.dataset.aetherFeedPulseBound40120!=="1"){
      feed.dataset.aetherFeedPulseBound40120="1";
      feed.addEventListener("animationiteration",event=>{
        if(event.target!==feed||event.animationName!=="atlasAetherFeedPulse40112"||document.hidden)return;
        const style=getComputedStyle(feed);
        const visible=style.visibility==="visible"&&Number.parseFloat(style.opacity||"0")>.5;
        if(visible){
          // 40.4.131 — first visible pulse arms the batch; story 1 keeps its full reading slot.
          if(!aetherVeilleState4087.feedWasVisible){
            aetherVeilleState4087.feedWasVisible=true;
            return;
          }
          aetherVeilleAdvance4087();
        }else if(aetherVeilleState4087.feedWasVisible){
          aetherVeilleState4087.feedWasVisible=false;
          aetherVeilleState4087.kind="alert";
          aetherVeilleState4087.storyEvent=null;
          aetherVeilleState4087.storyContext=null;
          aetherVeilleState4087.fingerprint="";
          renderAetherVeille4087();
        }
      },{passive:true});
    }
    aetherBindMarketCompletion4086();
    aetherBindOracleCompletion4088();
    refreshAether({force:true});
  }

  const api=Object.freeze({
    build:"40.4.136",
    backend:AETHER_SYSTEM_BACKEND_4086,
    weather:"Maintenon · Eure-et-Loir",
    refresh:refreshAether,
    pulse:()=>refreshAether(),
    snapshot:()=>Object.freeze({
      status:aetherSnapshot4084(),
      system:aetherSystemState4086.system,
      weather:aetherSystemState4086.weather,
      system_at:aetherSystemState4086.systemAt,
      weather_at:aetherSystemState4086.weatherAt,
      veille:aetherVeilleState4087.last||aetherVeilleCurrent4087()
    }),
    single_lane:true,
    presentation_owner:"admin-ribbons.css",
    new_recurring_timer:false,
    bridge_telemetry_owner:false,
    telemetry_null_is_zero:false,
    market_completion_refresh:true,
    veille_owner:"News Sentinel state (read-only) via existing loadNewsLiveFeed owner",
    veille_top:AETHER_VEILLE_TOP_4087,
    veille_new_timer:false,
    veille_feed_pulse_seconds:18,
    veille_alert_context_pairing:false,
    veille_same_event_context:true,
    veille_new_fetch:false,
    veille_existing_owner_wake:true,
    info_operator_synthesis:true,
    oracle_render_refresh:true,
    cadence_seconds:270,
    normal_seconds:30,
    info_seconds:15,
    veille_seconds:216,
    system_seconds:9,
    veille_full_batch_before_system:true,
    veille_first_visible_pulse_advances:false,
    veille_marquee_phase_synced:true,
    veille_marquee_constant_speed_px_s:AETHER_MARQUEE_SPEED_PX_S_40121,
    info_operator_fact_cells:true,
    explanatory_context_owner:"AtlasNewsToMarketOperatorIntelligence40235 (read-only compute)",
    explanatory_context_alternation:false,
    explanatory_context_new_fetch:false,
    explanatory_context_new_timer:false,
    explanatory_context_causal_claim:false,
    operator_disclaimer_segments:false,
    operator_non_conclusion_segments:false,
    context_label_deduplicated:true,
    news_display_language:"source-original",
    news_source_original_headline_first:true,
    news_translation_preferred:"headline_fr_display → headline_fr (secondary data retained)",
    news_translation_story_owner:"News Sentinel source-original headline owns VEILLE; translated fields remain preserved",
    news_feed_news_only_rotation:true,
    news_feed_context_interleave:false,
    news_feed_ranked_story_count:12,
    news_feed_selection:"representative digest: priority anchor + distinct recent families",
    news_feed_family_order:"macro + institutional + regulation + leverage + security + market",
    news_feed_source_diversity_tiebreak:true,
    news_feed_recent_family_window_days:7,
    news_feed_pool_union:"canonical newsFeedState.payload.events; derived newsFeedState.events only if canonical payload absent",
    news_feed_primary_pool:"newsFeedState.payload.events",
    news_feed_canonical_headline_required:true,
    news_feed_derived_rows_reading_fallback_only:true,
    news_feed_derived_rows_can_displace_canonical_story:false,
    news_feed_unique_before_limit:true,
    news_feed_unique_tokens:"canonical id + merged ids + source URL + French headline + raw headline",
    news_feed_truthful_total:true,
    news_feed_story_detail:"headline + source",
    news_feed_cursor_persists_between_windows:true,
    info_semantic_owners:"Atlas + Oracle + Sources + Book",
    info_global_marquee:false,
    info_news_preview:false,
    news_translation_context_keeps_headline:true,
    news_translation_compact_headline_first:true,
    news_translation_fallback:"deterministic French factual summary → original only when already non-English",
    news_translation_browser_runtime:false,
    news_translation_raw_english_in_aether:true,
    weather_forecast_days:5,
    weather_storm_warning:true,
    weather_high_gust_warning_kmh:70,
    aether_attention_operator_watch:true,
    aether_attention_new_timer:false,
    aether_attention_new_network_owner:false,
    news_translation_canonical_original_untouched:true,
    news_translation_canonical_original_preserved:true
  });
  globalThis.AgentCryptoAether=api;
  /* Compatibility read-only alias for diagnostics that knew the R6/R7 object. */
  globalThis.AgentCryptoAetherSystem4086=api;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
  else bindAether();
})();
