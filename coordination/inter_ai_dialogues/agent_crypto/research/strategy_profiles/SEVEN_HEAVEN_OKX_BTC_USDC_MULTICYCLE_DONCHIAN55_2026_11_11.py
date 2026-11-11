#!/usr/bin/env python3
"""Seven Heaven: audit multi-year OKX BTC-USDC daily history, then replay frozen Donchian 55.
Uses only public 1Dutc history. NO trading credentials, orders, or portfolio access.
"""
import datetime as dt
import gzip
import hashlib
import importlib.util
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
STEM="SEVEN_HEAVEN_OKX_BTC_USDC_MULTICYCLE_DONCHIAN55_2026_11_11"
END="2026-11-10"  # Last completely closed UTC day when study was designed
TARGETS=(("2022-01-01","2022-04-01"),("2023-01-01","2023-04-01"))
BASE_URL="https://www.okx.com/api/v5/market/history-candles"
BINANCE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
BIN_SHA="812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd"
PREVIOUS=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json"
SAMPLE=HERE/"SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_UTC_VERIFIED_SAMPLE_RESULTS_2026_11_10.json"
MODEL=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.py"

def iso(stamp):
    return dt.datetime.fromtimestamp(int(stamp)/1000,dt.timezone.utc).date().isoformat()

def dates_between(first,last):
    a=dt.date.fromisoformat(first);b=dt.date.fromisoformat(last)
    return [(a+dt.timedelta(days=k)).isoformat() for k in range((b-a).days+1)]

def fetch_daily():
    rows={}
    pages=[]
    cursor=None
    error=None
    previous_oldest=None
    for page_no in range(1,26): # bounded to 2500 days: no unbounded polling
        query={"instId":"BTC-USDC","bar":"1Dutc","limit":"100"}
        if cursor is not None:
            query["after"]=str(cursor)
        url=BASE_URL+"?"+urllib.parse.urlencode(query)
        payload=None
        issue=None
        for retry in range(3):
            try:
                request=urllib.request.Request(url,headers={
                    "User-Agent":"SevenHeavenResearch/2.0 (public 1Dutc, no account)",
                    "Accept":"application/json"})
                with urllib.request.urlopen(request,timeout=24) as stream:
                    payload=json.load(stream)
                if payload.get("code")!="0":
                    raise RuntimeError("OKX code "+str(payload.get("code"))+": "+str(payload.get("msg"))[:120])
                if not isinstance(payload.get("data"),list):
                    raise RuntimeError("OKX missing data list")
                break
            except Exception as exc:
                issue=str(exc)
                time.sleep(0.8+retry*1.6)
        if payload is None or payload.get("code")!="0":
            error="Source request failed at page "+str(page_no)+": "+str(issue)
            break
        data=payload["data"]
        if not data:
            break
        stamps=[int(item[0]) for item in data]
        oldest=min(stamps); newest=max(stamps)
        if previous_oldest is not None and oldest>=previous_oldest:
            error="Pagination made no backward progress"
            break
        previous_oldest=oldest
        page_confirmed=0
        for item in data:
            if len(item)<9:
                error="Missing OKX confirm field"
                break
            stamp=int(item[0]); date=iso(stamp)
            if stamp%86400000:
                error="Non-UTC-midnight candle timestamp"
                break
            if item[8]!="1":
                continue
            o,h,l,c,v=[float(x) for x in item[1:6]]
            if not(o>0 and c>0 and v>=0 and h>=max(o,c) and 0<l<=min(o,c)):
                error="OHLCV invalid on "+date
                break
            candle=dict(date=date,t=stamp,o=o,h=h,l=l,c=c,v=v)
            if date in rows and rows[date]!=candle:
                error="Conflicting duplicate UTC day "+date
                break
            rows[date]=candle
            page_confirmed+=1
        pages.append(dict(page=page_no,total=len(data),confirmed=page_confirmed,
                          oldest=iso(oldest),newest=iso(newest)))
        if error:
            break
        if iso(oldest)<=TARGETS[0][0]:
            break
        if len(data)<100:
            # Some APIs legitimately stop at listing date. The coverage test determines readiness.
            break
        cursor=oldest
        time.sleep(.2)
    return rows,pages,error

def read_binance():
    raw=BINANCE.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==BIN_SHA
    archive=json.loads(gzip.decompress(raw))
    assert archive["pair"]=="BTCUSDT" and archive["interval"]=="1d" and len(archive["rows"])==3075
    result=[]
    for stamp,o,h,l,c,v,*extra in archive["rows"]:
        result.append(dict(date=iso(stamp),t=stamp,o=o,h=h,l=l,c=c,v=v))
    return result

def import_model():
    spec=importlib.util.spec_from_file_location("seven_existing_don55",str(MODEL))
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def comparisons_for_samples(rows):
    source=json.loads(SAMPLE.read_text(encoding="utf-8"))
    checks=[]
    for item in source.get("utc_day_evidence",[]):
        if item.get("status")!="VALIDATED":
            continue
        date=item["utc_date"]
        expected=item["ohlcv"]
        actual=rows.get(date)
        metrics={}
        if actual is not None:
            for k in ("open","high","low","close"):
                key={"open":"o","high":"h","low":"l","close":"c"}[k]
                metrics[k]=dict(archived=float(expected[k]),rest=actual[key],
                                difference_pct=round(100*(actual[key]/float(expected[k])-1),8))
        checks.append(dict(date=date,archive_status="CONFIRMED_VALIDATED",
                           rest_candle_present=actual is not None,metrics=metrics))
    return checks

def main():
    captured_at=dt.datetime.now(dt.timezone.utc).isoformat()
    source_rows,pages,source_error=fetch_daily()
    newest=sorted(source_rows)
    missing_all=[day for day in dates_between(TARGETS[0][0],END) if day not in source_rows]
    target_readiness=[]
    for warm,begin in TARGETS:
        missing=[day for day in dates_between(warm,END) if day not in source_rows]
        target_readiness.append(dict(warmup_start=warm,study_start=begin,
                                     ready=len(missing)==0,
                                     missing_count=len(missing),first_missing_days=missing[:20]))
    prior=json.loads(PREVIOUS.read_text(encoding="utf-8"))
    old_daily={bar["date"]:bar for bar in prior["okx_daily_candles"]}
    past_overlap=sorted(set(old_daily).intersection(source_rows))
    conflicting=[]
    for date in past_overlap:
        a=source_rows[date];b=old_daily[date]
        if any(a[k]!=b[k] for k in ("o","h","l","c","v")):
            conflicting.append(date)
    # Existing data conflicts are important enough to block new performance claims.
    if not all(day in source_rows for day in old_daily):
        missing_prior=sorted(set(old_daily)-set(source_rows))
    else:
        missing_prior=[]
    quality_ok=not source_error and not conflicting and not missing_prior
    winner=next((x for x in target_readiness if x["ready"]),None)
    model=None
    scenarios=[]
    matched=[]
    if quality_ok and winner is not None:
        model=import_model()
        candles=[source_rows[k] for k in newest if winner["warmup_start"]<=k<=END]
        start=winner["study_start"]
        # One continuous portfolio with fixed rules and no annual resetting.
        long_run=model.simulate(candles,start,END,.25)
        stressful=model.simulate(candles,start,END,.25,.002,.001)
        passive=model.passive(candles,start,END,.25)
        scenarios.append(dict(venue="OKX BTC-USDC",kind="continuous",
                              from_utc=start,to_utc=END,
                              model25=long_run,stress25=stressful,
                              buy_hold25_pct=passive))
        bn=read_binance()
        # Identical calendar between venues, stopped at archived Binance end.
        matched_end="2026-09-30"
        for name,src in (("OKX BTC-USDC",candles),("BINANCE BTC-USDT",bn)):
            sim=model.simulate(src,start,matched_end,.25)
            scenarios.append(dict(venue=name,kind="matched_source",
                                  from_utc=start,to_utc=matched_end,
                                  model25=sim,
                                  buy_hold25_pct=model.passive(src,start,matched_end,.25)))
        # Calendar-year checks are independent NEW portfolios, not additive.
        for year in range(int(start[:4]),2027):
            ys=max(start,str(year)+"-01-01")
            ye=min(END,str(year)+"-12-31")
            if ys>ye:
                continue
            r=model.simulate(candles,ys,ye,.25)
            scenarios.append(dict(venue="OKX BTC-USDC",kind="calendar_reset_diagnostic",
                                  from_utc=ys,to_utc=ye,
                                  model25=r,buy_hold25_pct=model.passive(candles,ys,ye,.25)))
        matched=dict(
            source_windows_utc=[start,matched_end],
            analysis="Same calendar days; different quote currencies",
        )
    status=("VERIFIED_MULTICYCLE_REPLAY" if scenarios else
            "SOURCE_QUALIFICATION_BLOCKED" if source_error or conflicting or missing_prior else
            "INSUFFICIENT_CONTIGUOUS_2022_OR_2023_HISTORY")
    evidence=dict(
        schema="seven.crypto.okx.donchian55.multicycle-qualified-source.v1",
        study_date="2026-11-11",read_only=True,orders_enabled=False,
        status=status,source_url=BASE_URL,source_pair="BTC-USDC",
        bar="1Dutc",close_confirmation="confirm=1 only",
        captured_at_utc=captured_at,requested_warmup=TARGETS[0][0],requested_end=END,
        page_coverage=pages,source_error=source_error,
        actual_first_date=newest[0] if newest else None,
        actual_last_date=newest[-1] if newest else None,
        confirmed_unique_days=len(source_rows),
        missing_count_for_2022_target=len(missing_all),
        first_missing_days_for_2022_target=missing_all[:20],
        readiness=target_readiness,
        verification_with_previous_447=dict(overlap_days=len(past_overlap),
             conflicting_dates=conflicting[:20],missing_prior_days=missing_prior[:20]),
        crosscheck_with_official_confirmed_minute_archive=comparisons_for_samples(source_rows),
        source_sha256_utc_daily_rows=hashlib.sha256(json.dumps([source_rows[k] for k in newest],
                         sort_keys=True,separators=(",",":")).encode()).hexdigest(),
        assumptions=dict(initial_fictitious_capital=1000,allocation_fraction=.25,
            original_rules_preserved=True,entry_high_lookback=55,exit_low_lookback=20,
            trailing_stop=3,atr_days=14,maximum_holding_days=120,
            fee_per_side=.001,assumed_slippage_per_side=.0005,
            no_leverage=True,orders_enabled=False),
        matched_comparison=matched,
        simulations=scenarios,
        full_confirmed_utc_candles=[source_rows[k] for k in newest if TARGETS[0][0]<=k<=END],
    )
    # Trim long daily series from redundant full-input when the JSON gets unwieldy:
    # Here we deliberately RETAIN all verified daily candles and daily portfolio paths for reproducibility.
    (HERE/(STEM+".json")).write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=[
        "# Seven Heaven — Qualification pluriannuelle OKX BTC/USDC et Donchian 55",
        "",
        "**Étude 11 novembre 2026 — recherche uniquement, aucun ordre.**",
        "",
        "## Source, période et état réel",
        "",
        "- Source : OKX, endpoint public /api/v5/market/history-candles, instrument BTC-USDC, bougies 1Dutc (confirm=1 seulement).",
        "- Objectif fixé avant les résultats : disposer de l'amorçage à partir du 1er janvier 2022, puis étudier sans changer les paramètres Donchian.",
        "- Fenêtre alternative déclarée à l'avance si 2022 n'est pas accessible : amorçage au 1er janvier 2023.",
        "- Jusqu'à 25 pages de 100 bougies; aucune interpolation de date manquante.",
        "- Source capturée : "+captured_at,
        "- Statut vérifié : **"+status+"**.",
        "- Première journée OKX trouvée : "+str(evidence["actual_first_date"])+". Dernière : "+str(evidence["actual_last_date"])+".",
        "- Nombre de journées clôturées uniques : "+str(len(source_rows))+".",
        "- Journées manquantes pour couvrir du 1er janvier 2022 au 10 novembre 2026 : "+str(len(missing_all))+".",
        "- Contrôle avec la précédente série OKX 2025–2026 : "+str(len(past_overlap))+
          " journées en commun; "+str(len(conflicting))+" divergences, "+str(len(missing_prior))+" journées précédemment vues mais absentes.",
        "- Source Binance de comparaison : archive BTC/USDT figée, SHA-256 "+BIN_SHA+".",
        "",
        "## Qualité des archives ponctuelles",
        "",
    ]
    for ck in evidence["crosscheck_with_official_confirmed_minute_archive"]:
        lines.append("- "+ck["date"]+": "+
                     ("REST 1Dutc présent. " if ck["rest_candle_present"] else "REST 1Dutc absent. ")+
                     "; ".join(k+" "+str(v["difference_pct"])+" % vs ZIP confirmé"
                              for k,v in ck["metrics"].items()))
    lines += [
        "",
        "Les archives officielles minute de 2023 et 2024 comportent des marqueurs confirm=0 dans les échantillons déjà audités : elles ne sont PAS artificiellement converties en données confirmées.",
        "",
        "## Résultats — si série continue effectivement qualifiée",
        "",
    ]
    if scenarios:
        lines += [
            "Même allocation fictive de 25 % des liquidités à chaque entrée, Donchian 55 / sortie 20 / stop 3×ATR / 120 jours, sans changement de paramètres.",
            "",
            "| Type de fenêtre | Marché | Période UTC | Jours | Transactions | Gain net Donchian | DD quotidien max. | Buy & Hold 25 % |",
            "|---|---|---|---:|---:|---:|---:|---:|",
        ]
        for item in scenarios:
            a=item["model25"]
            lines.append("| "+item["kind"]+" | "+item["venue"]+" | "+item["from_utc"]+
                " à "+item["to_utc"]+" | "+str(a["days"])+" | "+str(a["trades"])+
                " | "+str(a["net_pct"])+" % | "+str(a["max_dd_pct"])+
                " % | "+str(item["buy_hold25_pct"])+" % |")
        lines += [
            "",
            "Les diagnostics annuels sont des expériences INDÉPENDANTES réinitialisées chaque année ; ne pas additionner leurs rendements au résultat continu.",
            "L'exécution fictive à l'ouverture suivante et le stop intrajournalier sont estimés à partir de l'OHLC journalier, pas d'un carnet d'ordres historique.",
        ]
    else:
        lines += [
            "**AUCUN NOUVEAU BACKTEST PLURIANNUEL VALIDÉ.** Les conditions de continuité et de cohérence entre sources n'ont pas toutes été satisfaites.",
            "Ne pas remplacer les données manquantes par Binance, CoinGecko ou des archives minute non qualifiées.",
            "",
            "## Causes de blocage",
            "",
            "- Erreur API : "+str(source_error),
            "- Divergences avec la série OKX précédemment vérifiée : "+str(conflicting[:10]),
            "- Dates absentes de la série OKX précédente : "+str(missing_prior[:10]),
            "- Disponibilité des fenêtres prédéclarées : "+str(target_readiness),
        ]
    lines += [
        "",
        "## Limites et interprétation",
        "",
        "- Un résultat in-sample, même sur plusieurs années, n'est pas une validation prospective aveugle ; paramètres fixés avant cette nouvelle étude, mais Bitcoin déjà connu.",
        "- BTC/USDT Binance n'est pas BTC/USDC OKX. Comparer dates, frais et résultats, sans confondre les devises.",
        "- Les règles de sortie des backtests ne donnent aucune consigne pour les actifs de l'utilisateur ; Swing Trading / Buy & Hold personnel inchangé.",
        "- Pas de contrôle de l'exécution réelle, de la profondeur historique ni de la disponibilité des exchanges à la minute.",
        "- Le périmètre ne touche ni le Trader, ni Administrator, ni le Bridge, ni les identifiants OKX.",
        "",
        "## Reproduction",
        "",
        "- Programme : "+STEM+".py",
        "- Données et preuves : "+STEM+".json",
        "- Normalisation d'archives isolées : SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_UTC_NORMALIZER.py (chantier séparé).",
        "",
    ]
    (HERE/(STEM+".md")).write_text("\n".join(lines),encoding="utf-8")
    print("MULTICYCLE_STATUS",status)
    print("OKX_COVERAGE",len(source_rows),"first",evidence["actual_first_date"],
          "last",evidence["actual_last_date"],"pages",len(pages),
          "missing_from_2022",len(missing_all),"error",source_error)
    print("CROSSCHECK",evidence["crosscheck_with_official_confirmed_minute_archive"])
    for item in scenarios:
        a=item["model25"]
        print("WINDOW",item["kind"],item["venue"],item["from_utc"],item["to_utc"],
              "trades",a["trades"],"net",a["net_pct"],"dd",a["max_dd_pct"],
              "buy_hold",item["buy_hold25_pct"])

if __name__=="__main__":
    main()
