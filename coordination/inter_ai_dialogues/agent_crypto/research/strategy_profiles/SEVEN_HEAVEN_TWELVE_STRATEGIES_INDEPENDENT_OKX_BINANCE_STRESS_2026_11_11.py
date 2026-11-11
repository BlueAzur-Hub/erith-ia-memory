#!/usr/bin/env python3
"""Compare ALL twelve frozen BTC strategies on the same matched OKX/Binance daily data.
Reuses original canonical signal code by guarded in-memory adaptations.
Research-only, no exchange connection, no account credentials and no orders.
"""
import datetime as dt
import gzip
import hashlib
import json
import tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
NAME="SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11"
CANONICAL=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py"
BASELINE=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json"
QUARTER=HERE/"SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.json"
OKX_EVIDENCE=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json"
BIN_ARCHIVE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
BIN_SHA="812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd"
WARM="2025-08-21"
FIRST="2026-04-01"
SEP="2026-09-30"
OCT="2026-10-01"
END="2026-11-10"
M_KEYS=("EMA20_50","EMA50_200","PRICE_EMA200","MOM90","MOM180","DON20","DON55",
        "DON20_TREND","PULLBACK_FILTERED","REBOUND_FILTERED","REBOUND_UNFILTERED","MEANREV_Z2")

def guarded_engine():
    src=CANONICAL.read_text(encoding="utf-8").split("if __name__=='__main__':")[0]
    replacements=[
        ("def run(source):",
         "def run(source,study_start='2019-01-01',study_end='2026-09-30',expected_sha=SHA,expected_rows=3075,rsi_expected=(13,57)):"),
        ("assert sha==SHA,'Source must match verified historical dataset'",
         "assert sha==expected_sha,'Wrong source digest; abort'"),
        ("assert obj['pair']=='BTCUSDT' and obj['interval']=='1d' and len(obj['rows'])==3075",
         "assert obj['pair'] in ('BTCUSDT','BTCUSDC') and obj['interval']=='1d' and len(obj['rows'])==expected_rows"),
        ("if b:assert", "if b:assert"), # Avoid silently changing a substring if canonical is updated.
        ("if b:assert", "if b:assert"),
    ]
    # The original source is checked strictly rather than edited on disk.
    replacements=replacements[:3]+[
        ("start=next(i for i,b in enumerate(B) if b['date']=='2019-01-01')",
         "start=next(i for i,b in enumerate(B) if b['date']==study_start)"),
        ("end=next(i for i,b in enumerate(B) if b['date']=='2026-09-30')",
         "end=next(i for i,b in enumerate(B) if b['date']==study_end)"),
        ("assert start>=200 and end-start+1==2830",
         "assert start>=200 and end>start"),
        ("assert (filtered,unfiltered)==(13,57),f'RSI independent count regression {(filtered,unfiltered)}'",
         "if rsi_expected is not None: assert (filtered,unfiltered)==rsi_expected,f'RSI count regression {(filtered,unfiltered)}'"),
        ("def sim(k,fee,slip):",
         "def sim(k,fee,slip,allocation=1.0):"),
        ("spent=cash;price=b['o']*(1+slip)",
         "spent=cash*allocation;price=b['o']*(1+slip)"),
        ("qty=spent*(1-fee)/price;cash=0.;entered=(i,spent)",
         "qty=spent*(1-fee)/price;cash-=spent;entered=(i,spent)"),
        (" return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,",
         " quarter25={k:sim(k,.001,.0005,.25) for k in NAMES if k not in ('CASH','BUY_HOLD')}\n stress25={k:sim(k,.002,.001,.25) for k in NAMES if k not in ('CASH','BUY_HOLD')}\n return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,"),
        ("source=dict(pair='BTCUSDT Spot Binance daily',sha256=sha,rows=len(B)),",
         "source=dict(pair=obj['pair']+' Spot 1Dutc',sha256=sha,rows=len(B)),"),
        ("double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double])",
         "double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double],quarter25=quarter25,stress25=stress25)"),
        ("r['underperform_years']=[y for y,p in r['yearly'].items() if p<hold['yearly'][y]]",
         "r['underperform_years']=[y for y,p in r['yearly'].items() if y in hold['yearly'] and p<hold['yearly'][y]]"),
    ]
    for old,new in replacements:
        if src.count(old)!=1:
            raise RuntimeError("Frozen strategy engine has changed, refusing patch: "+old[:100]+"; matches="+str(src.count(old)))
        src=src.replace(old,new,1)
    sandbox={"__name__":"frozen_twelve_strategy_research","__file__":str(CANONICAL)}
    exec(compile(src,str(CANONICAL),"exec"),sandbox)
    assert len([k for k in sandbox["NAMES"] if k not in ("CASH","BUY_HOLD")])==12
    return sandbox["run"]

def read_inputs():
    compressed=BIN_ARCHIVE.read_bytes()
    assert hashlib.sha256(compressed).hexdigest()==BIN_SHA
    bj=json.loads(gzip.decompress(compressed))
    assert bj["pair"]=="BTCUSDT" and bj["interval"]=="1d" and len(bj["rows"])==3075
    prior=json.loads(OKX_EVIDENCE.read_text(encoding="utf-8"))
    assert prior["verification"]["canonical_25pct_matches"]
    assert prior["verification"]["okx_confirmed_contiguous"]
    assert prior["sources"]["okx_meta"]["instrument"]=="BTC-USDC"
    assert prior["sources"]["okx_meta"]["bar"]=="1Dutc"
    candles=prior["okx_daily_candles"]
    assert len(candles)==447
    assert candles[0]["date"]==WARM and candles[-1]["date"]==END
    for i in range(1,len(candles)):
        assert int(candles[i]["t"])-int(candles[i-1]["t"])==86400000
    bn=[r for r in bj["rows"] if WARM<=dt.datetime.fromtimestamp(int(r[0])/1000,dt.timezone.utc).date().isoformat()<=SEP]
    assert len(bn)==406
    assert len(candles)==(dt.date.fromisoformat(END)-dt.date.fromisoformat(WARM)).days+1
    assert {x["date"] for x in candles if x["date"]<=SEP}=={
      dt.datetime.fromtimestamp(int(r[0])/1000,dt.timezone.utc).date().isoformat() for r in bn}
    oj=dict(pair="BTCUSDC",interval="1d",
            rows=[[b["t"],b["o"],b["h"],b["l"],b["c"],b["v"]] for b in candles])
    bpartial=dict(pair="BTCUSDT",interval="1d",rows=bn)
    return compressed,oj,bpartial,prior

def run_model(run,bytestr,tag,from_date,to_date,rows=None):
    with tempfile.TemporaryDirectory() as directory:
        p=Path(directory)/"study.json.gz"
        p.write_bytes(bytestr)
        j=run(str(p),study_start=from_date,study_end=to_date,
              expected_sha=hashlib.sha256(bytestr).hexdigest(),
              expected_rows=(rows if rows is not None else 3075),
              rsi_expected=((13,57) if tag=="CANONICAL" else None))
    return j

def compress_object(x):
    return gzip.compress(json.dumps(x,separators=(",",":"),ensure_ascii=False).encode("utf-8"),mtime=0)

def benchmark_hold25(rows,start,end):
    idx={dt.datetime.fromtimestamp(int(r[0])/1000,dt.timezone.utc).date().isoformat():r for r in rows}
    open_price=float(idx[start][1]);last_close=float(idx[end][4])
    qty=250*(1-.001)/(open_price*(1+.0005))
    return round(100*((750+qty*last_close*(1-.001)*(1-.0005))/1000-1),3)

def check_canonical(j):
    baseline=json.loads(BASELINE.read_text(encoding="utf-8"))
    baseline25=json.loads(QUARTER.read_text(encoding="utf-8"))
    old={x["key"]:x for x in baseline["strategies"]}
    full={x["key"]:x for x in j["strategies"]}
    quarter={x["key"]:x for x in baseline25["methods"]}
    assert len(old)==len(full)==14 and set(j["quarter25"])==set(M_KEYS)
    for k in full:
        for field in ("net_pct","max_dd_pct","trades","wins","losses","exposure_pct","yearly"):
            assert full[k][field]==old[k][field],f"Canonical 100% mismatch {k}.{field}"
    for k in M_KEYS:
        x=j["quarter25"][k];y=quarter[k]
        assert x["net_pct"]==y["net_return_pct"]
        assert x["max_dd_pct"]==y["max_daily_drawdown_pct"]
        assert x["trades"]==y["trade_count"] and x["wins"]==y["wins"] and x["losses"]==y["losses"]
    return True

def summarize(j,venue,period,start,end,assetrows,source_sha):
    full={x["key"]:x for x in j["strategies"]}
    methods=[]
    for key in M_KEYS:
        q=j["quarter25"][key];stress=j["stress25"][key];allin=full[key]
        assert q["trades"]==allin["trades"] and q["wins"]==allin["wins"] and q["losses"]==allin["losses"]
        assert stress["trades"]==q["trades"] and len(q["yearly"])<=2
        methods.append(dict(key=key,label=allin["label"],
            result25_pct=q["net_pct"],drawdown25_pct=q["max_dd_pct"],
            trades=q["trades"],wins=q["wins"],losses=q["losses"],
            exposed_calendar_days_pct=q["exposure_pct"],
            double_cost_return25_pct=stress["net_pct"],
            result100_pct=allin["net_pct"],drawdown100_pct=allin["max_dd_pct"],
            annual_returns25_pct=q["yearly"]))
    return dict(venue=venue,period=period,start_utc=start,end_utc=end,
        days=j["model"]["days"],source_sha256=source_sha,
        cash_return_pct=0.,buy_hold25_return_pct=benchmark_hold25(assetrows,start,end),
        buy_hold100_return_pct=full["BUY_HOLD"]["net_pct"],methods=methods)

def make_report(e):
    lines=[
      "# Seven Heaven — 12 stratégies : contrôle multi-méthodes sur OKX et Binance",
      "",
      "**11 novembre 2026.** Aucune stratégie exclue pour mauvais résultat. **Aucun compte, aucun ordre réel.**",
      "",
      "## Question et protocole",
      "",
      "Comment les 12 règles du catalogue quantitatif se comportent-elles sur les **mêmes journées vérifiées**,",
      "dans un marché OKX BTC/USDC différent de leur archive Binance BTC/USDT initiale ?",
      "",
      "- **Toutes les 12 variantes** sont exécutées avec les règles gelées du programme canonique du 10 novembre.",
      "- Les variantes sont allouées fictivement à **25 % des liquidités disponibles à chaque entrée**, sans levier et sans rééquilibrage annuel.",
      "- Frais 0,10 % par côté, glissement supposé 0,05 % par côté ; stress avec coûts doublés.",
      "- Seules des bougies UTC closes sont utilisées ; signaux sur clôture, exécutions fictives à l'ouverture suivante.",
      "- **Même préchauffage 21 août 2025** pour la comparaison entre sources. Fenêtre commune 1er avril au 30 septembre 2026 ;",
      "  le scénario récent du 1er octobre au 10 novembre **redémarre le capital à zéro position**, alors que le scénario combiné",
      "  du 1er avril au 10 novembre **garde les positions déjà ouvertes**.",
      "- Le modèle source est adapté **en mémoire seulement** ; chaque fragment transformé est vérifié, et les douze variantes",
      "  sont préalablement reproduites **à l'identique** sur les données canoniques Binance 2019–2026, y compris les résultats à 25 %.",
      "- On ne fusionne jamais les deux paires et on ne prétend pas que l'USDT et l'USDC sont identiques.",
      "",
      "## Résultats : même fenêtre de 183 jours",
      "",
      "| Stratégie | Binance 25 % | OKX 25 % | Baisse max. OKX | Opérations OKX | Coûts doublés OKX |",
      "|---|---:|---:|---:|---:|---:|",
    ]
    by={x["period"]:x for x in e["windows"] if x["venue"]=="OKX"}
    o=by["overlap"]
    b=next(x for x in e["windows"] if x["venue"]=="BINANCE")
    bm={x["key"]:x for x in b["methods"]}
    for row in o["methods"]:
        a=bm[row["key"]]
        lines.append("| "+row["label"]+" ("+row["key"]+") | "+
                     str(a["result25_pct"])+" % | "+str(row["result25_pct"])+" % | "+
                     str(row["drawdown25_pct"])+" % | "+str(row["trades"])+" | "+
                     str(row["double_cost_return25_pct"])+" % |")
    lines += [
      "",
      "## Octobre–novembre et portefeuille continu",
      "",
      "**Attention :** un zéro opération dans la fenêtre récente démarrée en liquidités ne signifie pas zéro exposition dans le portefeuille continu.",
      "",
      "| Code | Récent isolé 41 j | Continu avril–novembre 224 j | DD max. continu | Opérations continues |",
      "|---|---:|---:|---:|---:|",
    ]
    recent=by["recent"]
    full=by["combined"]
    rm={x["key"]:x for x in recent["methods"]}
    for row in full["methods"]:
        lines.append("| "+row["key"]+" | "+str(rm[row["key"]]["result25_pct"])+" % | "+
                     str(row["result25_pct"])+" % | "+str(row["drawdown25_pct"])+" % | "+
                     str(row["trades"])+" |")
    lines += [
      "",
      "## Ce que l'étude peut et ne peut pas démontrer",
      "",
      "- **Le résultat porte sur toutes les douze règles de ce catalogue**, pas sur toutes les stratégies imaginables ni les neuf profils documentaires du Coffre.",
      "- Le résultat Binance comparé repose sur le même préchauffage et le même calendrier que OKX ; ne pas le confondre avec une stratégie tenue sans interruption depuis 2019.",
      "- La série OKX réutilisée a été qualifiée comme 447 journées closes consécutives dans un précédent rapport ; **aucune nouvelle vérification réseau** ici.",
      "- Les résultats restent rétrospectifs, pas un véritable test prospectif aveugle ; les règles ont été étudiées auparavant sur des cycles BTC connus.",
      "- Un faible drawdown passé peut résulter de l'absence de position : conserver le nombre d'opérations et l'exposition dans le rapport.",
      "- Les frais et stops sont théoriques, la liquidité, les gaps réels et les risques des stablecoins sont incomplets.",
      "- Ces résultats ne prescrivent ni achat ni vente pour les BTC personnels conservés en Swing Trading / Buy & Hold.",
      "",
      "## Provenance",
      "",
      "- Programme original : SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py.",
      "- Archive source Binance : public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz (SHA-256 figée).",
      "- Archive source OKX : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json (447 bougies 1Dutc confirmées).",
      "- Résultats des 12 allocations 25 % à contrôler : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.json.",
      "- Preuves structurées de la nouvelle étude : "+NAME+".json.",
      "- Code de reproduction : "+NAME+".py.",
      "",
    ]
    return "\n".join(lines)

def main():
    bfull,okx,bpart,previous=read_inputs()
    run=guarded_engine()
    c=run_model(run,bfull,"CANONICAL","2019-01-01",SEP)
    check_canonical(c)
    okx_bytes=compress_object(okx)
    bn_bytes=compress_object(bpart)
    scenarios=[]
    for tag,compressed,obj,periods in [
        ("OKX",okx_bytes,okx,[("overlap",FIRST,SEP),("recent",OCT,END),("combined",FIRST,END)]),
        ("BINANCE",bn_bytes,bpart,[("overlap",FIRST,SEP)]),
    ]:
        for label,a,b in periods:
            result=run_model(run,compressed,tag,a,b,rows=len(obj["rows"]))
            scenarios.append(summarize(result,tag,label,a,b,obj["rows"],hashlib.sha256(compressed).hexdigest()))
    assert len(scenarios)==4 and all(len(x["methods"])==12 for x in scenarios)
    x=dict(schema="seven.crypto.twelve-strategies.okx-binance-matched.v1",
      study_date="2026-11-11",research_only=True,orders_enabled=False,
      baseline_verification="ALL 14 canonical strategies and all 12 canonical 25pct scenarios matched",
      sources=dict(okx_confirmed_utc_daily_candles=len(okx["rows"]),okx_pair="BTC-USDC",
                   binance_warmup_daily_bars=len(bpart["rows"]),binance_pair="BTCUSDT",
                   binance_original_sha256=BIN_SHA,different_quote_currencies=True),
      assumptions=dict(starting_capital=1000,allocation_fraction=.25,
                       fees_per_side=.001,slippage_per_side=.0005,no_leverage=True,
                       warmup_from_utc=WARM,
                       already_known_past_not_blind_prospective=True),
      windows=scenarios)
    (HERE/(NAME+".json")).write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(NAME+".md")).write_text(make_report(x),encoding="utf-8")
    print("SEVEN_ALL_TWELVE_OKX_BINANCE_REPLAY_VERIFIED")
    for w in scenarios:
        print("WINDOW",w["venue"],w["period"],w["start_utc"],w["end_utc"],
              "trades",{r["key"]:r["trades"] for r in w["methods"]})
    print("OUTPUT",NAME+".json",NAME+".md")

if __name__=="__main__":
    main()
