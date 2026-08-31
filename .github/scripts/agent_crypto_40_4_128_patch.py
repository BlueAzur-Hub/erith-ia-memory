from pathlib import Path
import json
import hashlib
import re

root = Path("public/agent_crypto_erith_ia/administrator")
old = "40.4.127"
new = "40.4.128"
release = "AETHER REPRESENTATIVE NEWS DIGEST · SOURCE NO-CLIP · BOOK RESTORE LOCK"
status = "candidate_aether_representative_news_digest_operator_validation_required"


def read(rel):
    return (root / rel).read_text(encoding="utf-8")


def write(rel, text):
    (root / rel).write_text(text, encoding="utf-8")


def sha(rel):
    return hashlib.sha256((root / rel).read_bytes()).hexdigest()


def replace_once(text, before, after, label):
    count = text.count(before)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, got {count}")
    return text.replace(before, after, 1)


app = read("app.js")
if f'const ATLAS_BUILD = "{old}";' not in app:
    raise SystemExit("40.4.128 guard refused: current app.js is not 40.4.127")

aether = read("js/aether.js")
aether = replace_once(
    aether,
    "  Build: 40.4.127\n  Revision: 40.4.127 unique News queue recovery. Aether builds its five-story queue from both loaded News Sentinel event pools, ranks first, then canonical-deduplicates by event identity, merged identity, source URL and displayed French headline before taking the first five unique stories. The INFO phase no longer carries a redundant compact News tail.",
    "  Build: 40.4.128\n  Revision: 40.4.128 representative News digest. Aether keeps canonical deduplication but no longer mistakes the five highest critical scores for the richness of News Sentinel: one priority anchor is followed by distinct recent information families (macro/liquidity, ETF/institutional, regulation, leverage/market, security/other) when available. The INFO Book cell is restored and the whole INFO row uses shrink-safe geometry so Sources stays readable.",
    "aether header",
)

queue_re = re.compile(r"  function aetherVeilleEvents4087\(\)\{.*?\n  \}\n  function aetherVeilleScope4087", re.S)
queue_lines = [
    "  function aetherVeilleFamily40128(event){",
    "    const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};",
    "    const type=String(canonical?.event_type||\"\").toLowerCase();",
    "    const label=String(canonical?.event_label||\"\").toLowerCase();",
    "    const headline=String(canonical?.headline||canonical?.headline_fr_display||canonical?.headline_fr||\"\").toLowerCase();",
    "    const domains=(Array.isArray(canonical?.driver_domains)?canonical.driver_domains:[]).map(v=>String(v||\"\").toLowerCase());",
    "    const topics=(Array.isArray(canonical?.matched_topics)?canonical.matched_topics:[]).map(v=>String(v||\"\").toLowerCase());",
    "    const sectors=(Array.isArray(canonical?.sectors)?canonical.sectors:[]).map(v=>String(v||\"\").toLowerCase());",
    "    const text=[type,label,headline,...domains,...topics,...sectors].join(\" \" );",
    "    if(type===\"security\"||/hack|exploit|cybers[ée]curit|attaque|pirat/.test(`${label} ${headline}`))return \"security\";",
    "    if(domains.includes(\"institutional_flows\")||/\\betf\\b|institution|inflows?|outflows?|fonds cot/.test(text))return \"institutional\";",
    "    if(domains.includes(\"regulation\")||/r[ée]glement|\\bsec\\b|\\bcftc\\b|\\bmica\\b|custody rule|congress|white house/.test(text))return \"regulation\";",
    "    if(domains.includes(\"leverage\")||/liquidat|leverage|funding rate|futures?|open interest|short squeeze|long squeeze|positions? vendeuses?|positions? acheteuses?/.test(text))return \"leverage\";",
    "    if(domains.includes(\"macro_liquidity\")||/federal reserve|\\bfed\\b|\\bbce\\b|\\becb\\b|treasury|taux|rates?|inflation|emploi|jobs|liquidit|jackson hole/.test(text))return \"macro\";",
    "    if(type)return type;",
    "    return \"market\";",
    "  }",
    "  function aetherVeilleEvents4087(){",
    "    const events=[];",
    "    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};",
    "    try{if(typeof newsFeedState!==\"undefined\"){addPool(newsFeedState?.events);addPool(newsFeedState?.payload?.events);}}catch(_){}",
    "    const ranked=events.map((event,order)=>({event,order,rank:aetherVeilleRank4087(event),time:aetherVeilleTimestamp4087(event)})).sort((a,b)=>b.rank-a.rank||b.time-a.time||a.order-b.order);",
    "    const canonicalRows=[];const seenTokens=new Set();",
    "    for(const row of ranked){",
    "      const tokens=aetherVeilleStoryTokens40127(row.event);",
    "      if(tokens.length&&tokens.some(token=>seenTokens.has(token)))continue;",
    "      tokens.forEach(token=>seenTokens.add(token));",
    "      canonicalRows.push({...row,family:aetherVeilleFamily40128(row.event)});",
    "    }",
    "    if(!canonicalRows.length)return [];",
    "    const sevenDays=Date.now()-7*24*60*60*1000;",
    "    const recent=canonicalRows.filter(row=>!row.time||row.time>=sevenDays);",
    "    const pool=recent.length>=AETHER_VEILLE_TOP_4087?recent:canonicalRows;",
    "    const chosen=[];const usedEvents=new Set();const usedFamilies=new Set();const usedSources=new Set();",
    "    const key=row=>String(row?.event?.event_id||row?.event?.id||row?.event?.fingerprint||row?.order);",
    "    const source=row=>String(row?.event?.source_host||row?.event?.source_name||\"\").toLowerCase();",
    "    const take=row=>{if(!row||usedEvents.has(key(row)))return false;chosen.push(row);usedEvents.add(key(row));if(row.family)usedFamilies.add(row.family);if(source(row))usedSources.add(source(row));return true;};",
    "    const anchor24=pool.find(row=>row.time&&row.time>=Date.now()-24*60*60*1000)||pool[0];",
    "    take(anchor24);",
    "    const preferred=[\"macro\",\"institutional\",\"regulation\",\"leverage\",\"security\",\"market\"];",
    "    for(const family of preferred){",
    "      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;",
    "      if(usedFamilies.has(family))continue;",
    "      const candidates=pool.filter(row=>row.family===family&&!usedEvents.has(key(row)));",
    "      const diverse=candidates.find(row=>!source(row)||!usedSources.has(source(row)))||candidates[0];",
    "      take(diverse);",
    "    }",
    "    for(const row of pool){",
    "      if(chosen.length>=AETHER_VEILLE_TOP_4087)break;",
    "      if(usedEvents.has(key(row)))continue;",
    "      if(usedFamilies.has(row.family)&&source(row)&&usedSources.has(source(row)))continue;",
    "      take(row);",
    "    }",
    "    for(const row of pool){if(chosen.length>=AETHER_VEILLE_TOP_4087)break;take(row);}",
    "    return chosen.slice(0,AETHER_VEILLE_TOP_4087).map(row=>row.event);",
    "  }",
    "  function aetherVeilleScope4087",
]
aether, count = queue_re.subn(lambda _: "\n".join(queue_lines), aether, count=1)
if count != 1:
    raise SystemExit(f"representative News queue: expected one match, got {count}")

aether = replace_once(
    aether,
    'put("atlasAetherRibbonMarket4088",`Marché · ${s.market}`);put("atlasAetherRibbonAtlas4084",s.analysis);put("atlasAetherRibbonOracle4084",s.signal);put("atlasAetherRibbonSources4084",`Sources · ${s.sources}`);put("atlasAetherRibbonBook4084","");',
    'put("atlasAetherRibbonMarket4088",`Marché · ${s.market}`);put("atlasAetherRibbonAtlas4084",s.analysis);put("atlasAetherRibbonOracle4084",s.signal);put("atlasAetherRibbonSources4084",`Sources · ${s.sources}`);put("atlasAetherRibbonBook4084",s.veilleBrief);',
    "restore INFO Book",
)
aether = replace_once(aether, '    build:"40.4.127",', '    build:"40.4.128",', "Aether API build")
aether = replace_once(
    aether,
    '    news_feed_ranked_story_count:5,\n    news_feed_pool_union:"newsFeedState.events + newsFeedState.payload.events",',
    '    news_feed_ranked_story_count:5,\n    news_feed_selection:"representative digest: priority anchor + distinct recent families",\n    news_feed_family_order:"macro + institutional + regulation + leverage + security + market",\n    news_feed_source_diversity_tiebreak:true,\n    news_feed_recent_family_window_days:7,\n    news_feed_pool_union:"newsFeedState.events + newsFeedState.payload.events",',
    "representative News flags",
)
write("js/aether.js", aether)

ribbons = read("admin-ribbons.css")
marker = "/* 40.4.128 — AETHER INFO NO-CLIP FLEX + BOOK RESTORE */"
if marker in ribbons:
    raise SystemExit("40.4.128 CSS marker already present")
css_lines = [
    "",
    marker,
    "/* 40.4.126 made every fact cell intrinsic/non-shrinking; hiding Book in 40.4.127 only moved clipping onto Sources. */",
    "/* Restore Book and let all information cells share width; Sources keeps a protected readable floor. */",
    "@media (min-width:901px){",
    "  body #atlasAetherRibbonBook4084{display:flex!important}",
    "  body #atlasAetherRibbon4084 .atlas-aether-ribbon-track-4085{gap:8px!important;padding-right:0!important;overflow:hidden!important}",
    "  body #atlasAetherRibbonMarket4088{flex:1.05 1 270px!important;min-width:185px!important;max-width:none!important;overflow:hidden!important;text-overflow:ellipsis!important}",
    "  body #atlasAetherRibbonAtlas4084{flex:.82 1 205px!important;min-width:145px!important;max-width:none!important;overflow:hidden!important;text-overflow:ellipsis!important}",
    "  body #atlasAetherRibbonOracle4084{flex:1 1 275px!important;min-width:195px!important;max-width:none!important;overflow:hidden!important;text-overflow:ellipsis!important}",
    "  body #atlasAetherRibbonSources4084{flex:.58 1 175px!important;min-width:150px!important;max-width:none!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}",
    "  body #atlasAetherRibbonBook4084{flex:.72 1 205px!important;min-width:90px!important;max-width:none!important;justify-content:flex-start!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;padding-inline:5px!important}",
    "}",
    "@media (min-width:901px) and (max-width:1180px){",
    "  body #atlasAetherRibbon4084{font-size:11.2px!important;padding-inline:7px!important}",
    "  body #atlasAetherRibbon4084 .atlas-aether-ribbon-track-4085{gap:5px!important}",
    "  body #atlasAetherRibbonMarket4088{min-width:150px!important}",
    "  body #atlasAetherRibbonAtlas4084{min-width:115px!important}",
    "  body #atlasAetherRibbonOracle4084{min-width:155px!important}",
    "  body #atlasAetherRibbonSources4084{min-width:125px!important}",
    "  body #atlasAetherRibbonBook4084{min-width:70px!important}",
    "}",
    "",
]
write("admin-ribbons.css", ribbons + "\n".join(css_lines))

index = read("index.html")
count = index.count(old)
if count < 10:
    raise SystemExit(f"index build-token guard refused: expected many {old} tokens, got {count}")
index = index.replace(old, new)
old_release = "AETHER UNIQUE NEWS QUEUE · CANONICAL DEDUP · RIGHT EDGE CLEANUP LOCK"
if old_release in index:
    index = index.replace(old_release, release)
write("index.html", index)

write("app.js", replace_once(app, f'const ATLAS_BUILD = "{old}";', f'const ATLAS_BUILD = "{new}";', "ATLAS_BUILD"))
jsapp = read("js/app.js")
jsapp = replace_once(jsapp, f'const ADMIN_BUILD = "{old}";', f'const ADMIN_BUILD = "{new}";', "ADMIN_BUILD")
old_admin_release = 'const ADMIN_RELEASE = "AETHER INFORMATION ONLY · NO DISCLAIMER RIBBON · CONTEXT LABEL DEDUP · VERSION TRUTH LOCK";'
if old_admin_release in jsapp:
    jsapp = jsapp.replace(old_admin_release, f'const ADMIN_RELEASE = "{release}";', 1)
write("js/app.js", jsapp)

changed_hashes = {rel: sha(rel) for rel in ["index.html", "app.js", "admin-ribbons.css", "js/app.js", "js/aether.js"]}
lineage_add = " → 40.4.128 Aether representative News digest + shrink-safe INFO geometry: priority anchor followed by distinct recent News families; Sources protected; Book restored."
note = "40.4.128 — operator evidence showed that five highest-ranked critical stories did not represent the 107-event News Sentinel archive and that the 40.4.126 intrinsic-width INFO contract merely moved clipping from Book to Sources after Book was hidden. Aether now selects a representative five-item digest across distinct recent information families and restores Book with shrink-safe proportional geometry."
release_note = "40.4.128: Aether presentation/read-only selection correction only; no new fetch, collector, translator, timer, Market Core, Oracle engine, Graph, Bridge or Window Manager change."
reason = "Operator screenshots and page dump show a rich News Sentinel archive (107 unique events, 15/15 sources, explicit macro/ETF/regulation/leverage coverage) while Aether exposed mostly critical security stories. Selection is now diversity-aware without changing News Sentinel truth."


def update_manifest(rel):
    p = root / rel
    d = json.loads(p.read_text(encoding="utf-8"))
    if d.get("build") != old:
        raise SystemExit(f"{rel}: expected build {old}, got {d.get('build')}")
    d["build"] = new
    d["release"] = release
    d["status"] = status
    d["prepared_at"] = "2026-08-31T08:22:00Z"
    d["published_at"] = None
    if "global_versioning" in d:
        d["global_versioning"] = new
    if "asset_token" in d:
        d["asset_token"] = f"market-core-v2.0-alpha-build-{new}"
    d["parent_build"] = old
    if isinstance(d.get("lineage"), str) and "40.4.128 Aether representative News digest" not in d["lineage"]:
        d["lineage"] += lineage_add
    pub = d.setdefault("integrity", {}).setdefault("publication_identity", {})
    pub["build"] = new
    pub["asset_token"] = f"market-core-v2.0-alpha-build-{new}"
    if "app_sha256" in pub:
        pub["app_sha256"] = changed_hashes["app.js"]
    if note not in d.setdefault("notes", []):
        d["notes"].append(note)
    if release_note not in d.setdefault("release_notes", []):
        d["release_notes"].append(release_note)
    d["publication_revision"] = new
    d["publication_revision_reason"] = reason
    d.setdefault("files", {}).update(changed_hashes)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


update_manifest("version.json")
update_manifest("administrator-version.json")
admin_sha = sha("administrator-version.json")
vp = root / "version.json"
vd = json.loads(vp.read_text(encoding="utf-8"))
vpub = vd.setdefault("integrity", {}).setdefault("publication_identity", {})
if "administrator_version_sha256" in vpub:
    vpub["administrator_version_sha256"] = admin_sha
vp.write_text(json.dumps(vd, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

final = read("js/aether.js")
assert "function aetherVeilleFamily40128" in final
assert 'news_feed_selection:"representative digest: priority anchor + distinct recent families"' in final
assert 'put("atlasAetherRibbonBook4084",s.veilleBrief)' in final
assert marker in read("admin-ribbons.css")
print("40.4.128 PATCH PASS")
