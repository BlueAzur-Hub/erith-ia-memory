from pathlib import Path
import json, hashlib, datetime, re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
AETHER = ROOT/'js/aether.js'
RIBBONS = ROOT/'admin-ribbons.css'

PROTECTED = [
    ROOT/'admin-chronos.css',
    ROOT/'js/version-truth.js',
    ROOT/'oracle-presentation-405010.css',
    ROOT/'oracle-fx-406013.css',
    ROOT/'js/oracle-fx-406013.js',
    ROOT/'js/core/admin-window-manager.js',
    ROOT/'views/atlas.html',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js',
    ROOT/'js/strategy-a-after-cost-metrics-404298.js',
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

before = {str(p): sha(p) for p in PROTECTED if p.exists()}

html = INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.25"' in html, '40.6.25 checkpoint missing'
html = html.replace('<meta name="atlas-build" content="40.6.25" />','<meta name="atlas-build" content="40.6.26" />',1)
html = html.replace('<meta name="administrator-build" content="40.6.25" />','<meta name="administrator-build" content="40.6.26" />',1)
html = html.replace('<meta name="administrator-release" content="FOOTER VERSION TRUTH CLEANUP · CANONICAL OWNERS LOCK" />','<meta name="administrator-release" content="AETHER OPERATOR WATCH · CONVERGENCE MATRIX · PARKER SIGNATURE LOCK" />',1)
html = html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.25" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.26" />',1)
html = html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.25 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.26 · Administrator</title>',1)
html, n = re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', r'\g<1>40.6.26', html, count=1)
assert n == 1, 'admin-ribbons token not found'
html, n = re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.26', html, count=1)
assert n == 1, 'aether token not found'
html = html.replace('./js/footer-version-truth-406025.js?v=administrator-build-40.6.25','./js/footer-version-truth-406026.js?v=administrator-build-40.6.26',1)
html = html.replace('Agent-Crypto @erith.IA · Administrator 40.6.25 · Market Core 38.15.11 · Web Classic · manifeste',"Administrator 40.6.26 · Market Core 38.15.11 · Web Classic · vérification… · Version : Parker Lewis Can't Lose",1)
INDEX.write_text(html,encoding='utf-8')

js = AETHER.read_text(encoding='utf-8')
marker = '  function aetherPanelEnsure4084(){\n'
assert marker in js, 'Aether panel owner marker missing'
helper = r'''  function aetherDirectionalWord406026(value){
    const text=String(value||"").toLowerCase();
    if(/hauss|bull|positive|risk-on|risk on|inflow|entrants?/.test(text))return 1;
    if(/baiss|bear|negative|risk-off|risk off|outflow|sortants?/.test(text))return -1;
    if(/mixte|partag|neutre|stable|lat[ée]ral|non [ée]tablie/.test(text))return 0;
    return null;
  }
  function aetherOracleDirection406026(){
    try{
      const host=document.getElementById("atlasOracleV0");
      const text=String(host?.textContent||"").replace(/\s+/g," ");
      const up=Number((text.match(/HAUSSE\s*(\d+)\s*\/\s*100/i)||[])[1]);
      const down=Number((text.match(/BAISSE\s*(\d+)\s*\/\s*100/i)||[])[1]);
      if(Number.isFinite(up)&&Number.isFinite(down)){
        if(up>=down+2)return 1;
        if(down>=up+2)return -1;
        return 0;
      }
      return aetherDirectionalWord406026(aetherText4084("atlasOracleOperatorBias","")||aetherText4084("atlasOracleBias",""));
    }catch(_){return null;}
  }
  function aetherMarketDirection406026(){
    try{
      const coins=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins:[];
      const values=coins.map(row=>aetherSystemNumber4086(row?.change24h)).filter(v=>v!==null);
      if(!values.length)return null;
      const up=values.filter(v=>v>.05).length,down=values.filter(v=>v<-.05).length;
      if(up>=down*1.25&&up-down>=3)return 1;
      if(down>=up*1.25&&down-up>=3)return -1;
      return 0;
    }catch(_){return null;}
  }
  function aetherNewsDirection406026(){
    try{
      const feed=aetherVeilleCurrent4087();
      const event=feed?.event||null;
      if(!event)return null;
      const owner=globalThis.AtlasNewsToMarketOperatorIntelligence40235;
      const narrative=owner&&typeof owner.compute==="function"?owner.compute(event):null;
      const fields=[narrative?.mechanism?.direction,narrative?.flow?.direction,narrative?.market_confirmation?.focus,narrative?.verdict?.direction,feed?.tone];
      const votes=fields.map(aetherDirectionalWord406026).filter(v=>v!==null&&v!==0);
      if(votes.length){const sum=votes.reduce((a,b)=>a+b,0);return sum>0?1:sum<0?-1:0;}
      return aetherDirectionalWord406026([event?.event_label,event?.decision?.tone,event?.sentiment].filter(Boolean).join(" "));
    }catch(_){return null;}
  }
  function aetherAtlasDirection406026(){
    try{return aetherDirectionalWord406026(`${aetherAtlasBrief4088()} ${aetherText4084("atlasOracleAtlas","")}`);}catch(_){return null;}
  }
  function aetherOperatorWatch406026(){
    const layers=[
      {name:"News",value:aetherNewsDirection406026()},
      {name:"Marché",value:aetherMarketDirection406026()},
      {name:"Atlas",value:aetherAtlasDirection406026()},
      {name:"Oracle",value:aetherOracleDirection406026()},
    ];
    const known=layers.filter(row=>row.value!==null);
    const positive=known.filter(row=>row.value===1),negative=known.filter(row=>row.value===-1),neutral=known.filter(row=>row.value===0);
    const dominant=positive.length>negative.length?1:negative.length>positive.length?-1:0;
    const aligned=dominant===0?neutral.length:known.filter(row=>row.value===dominant||row.value===0).length;
    const pct=known.length?Math.round(aligned/known.length*100):0;
    const sourceReady=!/attente|aucune|requis|indisponible/i.test(aetherSourcesBrief4088());
    const systemReady=!/N\/D|indisponible/i.test(aetherSystemBrief40133());
    const feed=aetherVeilleCurrent4087();
    const impact=Number(feed?.event?.impact?.score),evidence=Number(feed?.event?.evidence?.score);
    const attentionBase=aetherAttention40133();
    let level="MODÉRÉ";
    if(/danger|critique|non armé|indisponible/i.test(attentionBase)||(Number.isFinite(impact)&&impact>=95&&Number.isFinite(evidence)&&evidence>=85))level="CRITIQUE";
    else if((Number.isFinite(impact)&&impact>=85)||(pct>=75&&known.length>=3))level="ÉLEVÉ";
    else if(!known.length||(!sourceReady&&!systemReady))level="FAIBLE";
    const dirLabel=dominant>0?"HAUSSIÈRE":dominant<0?"BAISSIÈRE":"PARTAGÉE";
    const convergence=known.length?`${aligned}/${known.length} couches · ${pct}% · dominante ${dirLabel}`:"Données directionnelles insuffisantes";
    const opposed=dominant===0?[]:known.filter(row=>row.value===-dominant).map(row=>row.name);
    const divergence=opposed.length?`${opposed.join(" + ")} en contradiction avec la dominante`:neutral.length&&dominant!==0?`${neutral.map(row=>row.name).join(" + ")} restent neutres`:`Aucune divergence directionnelle forte détectée`;
    const watch=[];
    const oracle=aetherOracleDirection406026();
    watch.push(oracle===0?"Oracle : sortie du 50/50":"Oracle : bascule ou renforcement ≥ 60/40");
    if(aetherMarketDirection406026()===0)watch.push("Largeur marché : rupture de l’équilibre");
    if(Number.isFinite(impact)&&impact>=80)watch.push("News : nouvelle preuve ou changement de ton");
    if(!sourceReady)watch.push("Sources : retour à un état complet");
    let note="Lecture encore partagée : surveiller la prochaine confirmation avant toute interprétation forte.";
    if(dominant>0&&pct>=75)note="Convergence plutôt constructive, mais Aether reste en observation : confirmer par le marché et les sources.";
    else if(dominant<0&&pct>=75)note="Convergence plutôt défensive : risque prioritaire, aucune exécution automatique.";
    else if(opposed.length)note=`Divergence active : ${opposed.join(" / ")} ne confirme pas la lecture dominante.`;
    return {level:`${level} · ${sourceReady?"sources prêtes":"sources partielles"} · ${systemReady?"système lisible":"système partiel"}`,convergence,divergence,watch:watch.slice(0,4).join(" · "),note};
  }
'''
js = js.replace(marker, helper+marker,1)
old = '<article data-aether-wide-4084><span>Lecture News → Marché</span><b data-aether-row-4084="semantic">—</b></article><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article>'
new = '<article data-aether-wide-4084><span>Lecture News → Marché</span><b data-aether-row-4084="semantic">—</b></article><article data-aether-wide-4084 data-aether-watch-summary-406026><span>Niveau d’attention</span><b data-aether-row-4084="level">—</b></article><article><span>Convergence</span><b data-aether-row-4084="convergence">—</b></article><article><span>Divergence</span><b data-aether-row-4084="divergence">—</b></article><article data-aether-wide-4084><span>À surveiller maintenant</span><b data-aether-row-4084="watch">—</b></article><article data-aether-wide-4084 data-aether-note-406026><span>Aether Note</span><b data-aether-row-4084="note">—</b></article><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article>'
assert old in js, 'Aether panel insertion point missing'
js = js.replace(old,new,1)
old_render='row("why",aetherOperatorWhy405012());row("semantic",aetherNewsMarketSemantic405013());row("attention",aetherAttention40133());'
new_render='row("why",aetherOperatorWhy405012());row("semantic",aetherNewsMarketSemantic405013());const watch406026=aetherOperatorWatch406026();row("level",watch406026.level);row("convergence",watch406026.convergence);row("divergence",watch406026.divergence);row("watch",watch406026.watch);row("note",watch406026.note);row("attention",aetherAttention40133());'
assert old_render in js, 'Aether render insertion point missing'
js = js.replace(old_render,new_render,1)
AETHER.write_text(js,encoding='utf-8')

css=RIBBONS.read_text(encoding='utf-8')
css += '''\n\n/* 40.6.26 — AETHER OPERATOR WATCH · CONVERGENCE MATRIX */\n#atlasAetherStatusPanel4084 [data-aether-watch-summary-406026]{border-color:rgba(245,184,96,.28)!important;background:linear-gradient(90deg,rgba(64,42,15,.22),rgba(7,23,34,.62))!important}\n#atlasAetherStatusPanel4084 [data-aether-row-4084="level"]{color:#ffd98a!important;font-size:11px!important}\n#atlasAetherStatusPanel4084 [data-aether-row-4084="convergence"]{color:#9fe7ff!important}\n#atlasAetherStatusPanel4084 [data-aether-row-4084="divergence"]{color:#e7c6ff!important}\n#atlasAetherStatusPanel4084 [data-aether-row-4084="watch"]{color:#f5df91!important}\n#atlasAetherStatusPanel4084 [data-aether-note-406026]{border-color:rgba(236,123,197,.24)!important;background:linear-gradient(90deg,rgba(45,16,43,.24),rgba(7,23,34,.62))!important}\n#atlasAetherStatusPanel4084 [data-aether-row-4084="note"]{color:#f1c6e4!important;line-height:1.35!important}\n'''
RIBBONS.write_text(css,encoding='utf-8')

footer=ROOT/'js/footer-version-truth-406026.js'
footer.write_text('''(() => {\n  "use strict";\n  const BUILD="40.6.26", MANIFEST="../web/version.json", SIGNATURE="Version : Parker Lewis Can't Lose";\n  const meta=name=>document.querySelector(`meta[name="${name}"]`)?.content?.trim()||"UNKNOWN";\n  async function render(){\n    const admin=meta("administrator-build"),engine=meta("atlas-engine-build"),footer=document.getElementById("footerRelease"),classic=document.getElementById("atlasClassicVersionTruth406025");\n    const base=web=>`Administrator ${admin} · Market Core ${engine} · Web Classic ${web} · ${SIGNATURE}`;\n    if(footer)footer.textContent=base("vérification…");\n    try{\n      const response=await fetch(MANIFEST,{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);\n      const manifest=await response.json(),web=String(manifest?.build||"").trim(),webEngine=String(manifest?.engine?.reference_build||"").trim()||engine;if(!web)throw new Error("classic build absent");\n      if(classic){classic.textContent=`CLASSIC ${web}`;classic.title=`Ouvrir la Web Classique ${web} · Engine ${webEngine}`;classic.dataset.versionTruth="manifest";}\n      if(footer)footer.textContent=base(web);\n      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406026__=Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:web,classic_engine:webEngine,signature:SIGNATURE,one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});\n    }catch(error){\n      if(classic){classic.textContent="CLASSIC · version inconnue";classic.dataset.versionTruth="unknown";}\n      if(footer)footer.textContent=base("version inconnue");\n      globalThis.__AGENT_CRYPTO_FOOTER_VERSION_TRUTH_406026__=Object.freeze({build:BUILD,administrator_build:admin,market_core:engine,classic_build:null,signature:SIGNATURE,error:String(error?.message||error||"unknown"),one_shot_fetch:true,recurring_timer:false,observer:false,storage_write:false});\n    }\n  }\n  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();\n})();\n''',encoding='utf-8')

now=datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release='AETHER OPERATOR WATCH · CONVERGENCE MATRIX · PARKER SIGNATURE LOCK'
cascade={'parent_build':'40.6.25','release':release,'aether_attention_level':True,'aether_convergence_matrix':True,'aether_divergence':True,'aether_watch_conditions':True,'aether_note':True,'existing_sources_only':True,'new_network_owner':False,'new_recurring_timer':False,'new_observer':False,'new_storage_owner':False,'automatic_order':False,'real_order':False,'market_core_modified':False,'footer_signature_verbatim':"Version : Parker Lewis Can't Lose"}
for path in [ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json']:
    data=json.loads(path.read_text(encoding='utf-8'))
    data['build']='40.6.26';data['release']=release;data['status']='aether_operator_watch_convergence_matrix_406026';data['parent_build']='40.6.25';data['cascade_40_6_26']=cascade
    if 'asset_token' in data:data['asset_token']='market-core-v2.0-alpha-build-40.6.26'
    if 'administrator_build' in data:data['administrator_build']='40.6.26'
    if 'build_label' in data:data['build_label']='Build 40.6.26'
    if 'release_status' in data:data['release_status']=release
    for key in ('timestamp','prepared_at','published_at'):
        if key in data:data[key]=now
    if isinstance(data.get('current_version_truth'),dict):data['current_version_truth']['loaded_build']='40.6.26'
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

(ROOT/'RELEASE_40_6_26.md').write_text("""# Agent-Crypto 40.6.26 — Aether Operator Watch · Convergence Matrix\n\nParent: `40.6.25`\n\n- Niveau d’attention.\n- Convergence News / Marché / Atlas / Oracle.\n- Divergence explicite.\n- Conditions à surveiller.\n- Aether Note déterministe.\n- Footer canonique avec `Version : Parker Lewis Can't Lose`.\n\nAucun nouvel ordre, timer, observer, propriétaire réseau ou stockage. Market Core 38.15.11 et zones validées restent gelés.\n""",encoding='utf-8')

after={str(p):sha(p) for p in PROTECTED if p.exists()}
assert before==after, 'protected checksum changed'
print('40.6.26 guarded patch ready')
