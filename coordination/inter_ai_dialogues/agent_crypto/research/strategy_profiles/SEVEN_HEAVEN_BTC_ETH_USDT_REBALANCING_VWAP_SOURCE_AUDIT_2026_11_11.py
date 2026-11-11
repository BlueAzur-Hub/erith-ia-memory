#!/usr/bin/env python3
"""Offline BTC/ETH/cash fixed-allocation research; exact archived SHA-verified sources."""
import datetime as dt
import gzip
import hashlib
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[5]
HERE=Path(__file__).resolve().parent
SOURCE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards"
STEM="SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11"
YEARS=(2024,2025,2026)
FIRST="2024-01-01"
LAST="2026-10-31"
TARGET=(.5,.25,.25)  # BTC, ETH, cash. Fixed a priori; not optimized.
INITIAL=1000.

def day(ms):
    return dt.datetime.fromtimestamp(int(ms)/1000,dt.timezone.utc).date().isoformat()

def candles():
    index_bytes=(SOURCE/"index.json").read_bytes()
    index=json.loads(index_bytes)
    assert index["schema"]=="aerith.public.ohlcv.calendar-year-hourly-shard-index.v1"
    assert index["quote"]=="USDT"
    series={}; lineage={}
    for asset,pair in (("bitcoin","BTCUSDT"),("ethereum","ETHUSDT")):
        entry=next(x for x in index["assets"] if x["id"]==asset)
        assert entry["pair"]==pair and entry["quote"]=="USDT"
        selected=[x for x in entry["shards"] if x["year"] in YEARS]
        assert [x["year"] for x in selected]==list(YEARS)
        hours=[];details=[]
        for item in selected:
            b=(SOURCE/item["file"]).read_bytes()
            assert len(b)==item["bytes"] and hashlib.sha256(b).hexdigest()==item["sha256"]
            payload=json.loads(gzip.decompress(b))
            assert payload["schema"]=="aerith.public.ohlcv.calendar-year-hourly-shard.v1"
            assert payload["asset_id"]==asset and payload["quote"]=="USDT"
            assert payload["year"]==item["year"] and payload["first_trade_date_known"] is False
            part=payload["series"]
            assert len(part)==item["hourly_count"]
            assert payload["native_1m_count"]==len(part)*60
            assert len(payload["source_months"])==len(item["source_months"])
            assert all(a["month"]==q["month"] and a["source_zip_sha256"]==q["source_zip_sha256"]
                       for a,q in zip(payload["source_months"],item["source_months"]))
            assert int(part[0][0])==item["first_open_ms"] and int(part[-1][0])==item["last_open_ms"]
            for r in part:
                assert len(r)==8 and all(isinstance(n,(int,float)) and math.isfinite(n) for n in r)
                t,o,h,l,c,v,q,n=r
                assert int(t)%3600000==0 and 0<l<=min(o,c) and max(o,c)<=h
                assert v>=0 and q>=0 and n>=0
                if hours:assert int(r[0])-int(hours[-1][0])==3600000,"Missing hourly timestamp"
                hours.append(r)
            details.append(dict(year=item["year"],file=item["file"],sha256=item["sha256"],
                hours=len(part),source_minutes=payload["native_1m_count"]))
        assert len(hours)==24840 and day(hours[0][0])==FIRST and day(hours[-1][0])==LAST
        series[asset]=hours
        lineage[asset]=dict(pair=pair,hours=len(hours),shards=details)
    assert [x[0] for x in series["bitcoin"]]==[x[0] for x in series["ethereum"]]
    return series,lineage,hashlib.sha256(index_bytes).hexdigest()

def to_daily(hours):
    audit=dict(nonzero_volume_hours=0,zero_volume_hours=0,
               hourly_quote_per_base_outside_ohlc=0,session_vwap_outside_daily_ohlc=0)
    days=[]
    for i in range(0,len(hours),24):
        chunk=hours[i:i+24]
        assert len(chunk)==24
        date=day(chunk[0][0])
        assert all(day(r[0])==date for r in chunk)
        hi=max(r[2] for r in chunk);lo=min(r[3] for r in chunk)
        base=sum(r[5] for r in chunk);quote=sum(r[6] for r in chunk)
        assert base>0
        for r in chunk:
            if r[5]>0:
                audit["nonzero_volume_hours"]+=1
                if not r[3]*.999<=r[6]/r[5]<=r[2]*1.001:
                    audit["hourly_quote_per_base_outside_ohlc"]+=1
            else:
                audit["zero_volume_hours"]+=1
                assert r[6]==0
        vwap=quote/base
        if not lo*.999<=vwap<=hi*1.001:
            audit["session_vwap_outside_daily_ohlc"]+=1
        days.append(dict(date=date,open=float(chunk[0][1]),close=float(chunk[-1][4]),
                         high=float(hi),low=float(lo),vwap_proxy=float(vwap)))
    assert len(days)==1035 and days[0]["date"]==FIRST and days[-1]["date"]==LAST
    for i in range(1,len(days)):
        assert dt.date.fromisoformat(days[i]["date"])-dt.date.fromisoformat(days[i-1]["date"])==dt.timedelta(days=1)
    return days,audit

def simulate(btc,eth,mode,fee=.001,slip=.0005):
    assert mode in ("passive","monthly","quarterly","btc_full","eth_full","cash_full")
    qty=[0.,0.];cash=INITIAL
    events=[];daily=[]
    buys=sells=0
    buy_eff=(1-fee)/(1+slip)
    sell_eff=(1-fee)*(1-slip)
    for i,(b,e) in enumerate(zip(btc,eth)):
        assert b["date"]==e["date"]
        date=b["date"]
        first_of_month=date.endswith("-01")
        quarter=first_of_month and date[5:7] in ("01","04","07","10")
        rebalance=(i==0 or mode=="monthly" and first_of_month or mode=="quarterly" and quarter)
        if rebalance:
            weights=TARGET if mode in ("passive","monthly","quarterly") else (
                (1.,0.,0.) if mode=="btc_full" else (0.,1.,0.) if mode=="eth_full" else (0.,0.,1.))
            px=[b["open"],e["open"]]
            gross=cash+sum(qty[k]*px[k] for k in range(2))
            # First sell overweight assets; never fund one asset with credit.
            for k in range(2):
                sell_value=max(0.,qty[k]*px[k]-weights[k]*gross)
                if sell_value>1e-8:
                    qty[k]-=sell_value/px[k]
                    cash+=sell_value*sell_eff;sells+=1
            after=cash+sum(qty[k]*px[k] for k in range(2))
            demands=[max(0.,weights[k]*after-qty[k]*px[k])/buy_eff for k in range(2)]
            reserve=max(0.,cash-weights[2]*after)
            scale=min(1.,reserve/sum(demands)) if sum(demands)>0 else 0.
            for k in range(2):
                spent=demands[k]*scale
                if spent>1e-8:
                    qty[k]+=spent*buy_eff/px[k]
                    cash-=spent;buys+=1
            assert cash>=-1e-6 and all(q>=0 for q in qty)
            events.append(dict(date=date,pre_trade_gross_usdt=round(gross,5),
                     cash_after_usdt=round(cash,5),btc_qty=round(qty[0],12),eth_qty=round(qty[1],12)))
        daily.append(dict(date=date,equity_usdt=round(cash+qty[0]*b["close"]*sell_eff+
                                                        qty[1]*e["close"]*sell_eff,8)))
    peak=INITIAL;worst=0.;run=longest=underwater=0
    annual={};prev=INITIAL
    for i,row in enumerate(daily):
        v=row["equity_usdt"]
        peak=max(peak,v);worst=min(worst,100*(v/peak-1))
        if v<peak-1e-7:
            underwater+=1;run+=1;longest=max(longest,run)
        else:run=0
        if i==len(daily)-1 or daily[i+1]["date"][:4]!=row["date"][:4]:
            annual[row["date"][:4]]=round(100*(v/prev-1),4);prev=v
    return dict(mode=mode,final_usdt=round(daily[-1]["equity_usdt"],4),
         net_return_pct=round(100*(daily[-1]["equity_usdt"]/INITIAL-1),4),
         max_daily_drawdown_pct=round(worst,4),
         longest_underwater_days=longest,underwater_days=underwater,
         buy_fills=buys,sell_fills=sells,rebalancing_events=len(events),
         year_returns_pct=annual,trade_events=events,daily_equity=daily)

def report(data):
    lines=[
      "# Seven Heaven — Rééquilibrage BTC / ETH / liquidités et qualification du VWAP",
      "",
      "Étude du 11 novembre 2026. Binance Spot BTC/USDT et ETH/USDT. Portefeuilles fictifs ; aucune connexion de compte.",
      "",
      "## Sources contrôlées",
      "",
      "- Coffre public : calendar_year_hourly_shards/index.json et six fichiers .json.gz (BTC, ETH ; 2024, 2025, janvier–octobre 2026).",
      "- Taille et SHA-256 de chaque shard vérifiés contre l'index, identité Binance Spot / USDT, mois natifs documentés.",
      "- 24 840 heures sans trou par actif, horodatages exactement identiques entre BTC et ETH : 1 035 journées du 1er janvier 2024 au 31 octobre 2026.",
      "- Volumes base/quote et OHLC vérifiés, sans interpolation, aucun prix novembre 2026.",
      "- SHA-256 de l'index : "+data["index_sha256"],
      "",
      "## Comparaison fixée avant le calcul",
      "",
      "- Capital initial : 1 000 USDT fictifs ; panier 50 % BTC, 25 % ETH, 25 % liquidités, acheté au premier open UTC.",
      "- Référence passive : mêmes quantités conservées jusqu'au 31 octobre 2026.",
      "- Méthodes actives : rétablir les poids 50/25/25 le premier jour UTC de chaque mois ou trimestre.",
      "- Autres témoins : 100 % BTC, 100 % ETH, 100 % liquidités. Les niveaux de risque ne sont pas égaux.",
      "- Frais simulés 0,10 % et glissement 0,05 % de chaque côté ; stress avec coûts doublés.",
      "- Valorisation quotidienne au produit de vente fictive après coûts. Pas d'intérêt sur le cash, pas de fiscalité ni financement.",
      "",
      "## Résultats des portefeuilles",
      "",
      "| Stratégie | Final USDT | Rendement | Drawdown max. | Sous sommet (max) | Dates de rééquilibrage, initial compris | Coûts doublés : rendement |",
      "|---|---:|---:|---:|---:|---:|---:|",
    ]
    labels=dict(passive="Panier 50/25/25 passif",monthly="Panier 50/25/25 mensuel",
        quarterly="Panier 50/25/25 trimestriel",btc_full="100 % BTC",
        eth_full="100 % ETH",cash_full="100 % liquidités")
    for name in labels:
        s=data["scenarios"][name]
        lines.append(f"| {labels[name]} | {s['final_usdt']:,.2f} | {s['net_return_pct']:+.2f}% | {s['max_daily_drawdown_pct']:.2f}% | {s['longest_underwater_days']} j | {s['rebalancing_events']} | {data['double_cost_return_pct'][name]:+.2f}% |")
    lines += [
      "",
      "## D18 — VWAP : contrôle de la source, pas une stratégie inventée",
      "",
      "Les bougies horaires possèdent volume de base et volume en USDT de cotation. Leur rapport sur une heure, puis le rapport des sommes sur une session UTC, est une mesure de prix pondéré par le volume des échanges Binance.",
      "Cela ne définit ni entrée ni sortie, et ne doit pas être présenté comme la stratégie VWAP du Trader.",
    ]
    for asset,a in data["vwap_quality"].items():
        lines.append(f"- {asset} : {a['nonzero_volume_hours']} heures à volume positif ; {a['hourly_quote_per_base_outside_ohlc']} ratios horaires hors OHLC (tolérance 0,1 %), {a['session_vwap_outside_daily_ohlc']} sessions hors extrêmes ; {a['zero_volume_hours']} heures sans volume.")
    lines += [
      "",
      "## Contrôle des autres profils documentaires",
      "",
      "| Profil | État après audit | Condition du prochain backtest |",
      "|---|---|---|",
      "| D13 Rééquilibrage BTC/ETH/cash | TESTÉ sur archives horaires vérifiées | Pondérations supplémentaires figées, frais comparables OKX, prospectif |",
      "| D18 VWAP | Source de volume horaire qualifiée, ratio base/quote contrôlé | Règles d'entrée/sortie fixées et validation distincte |",
      "| D19 SAR parabolique | OHLC quotidiennes disponibles | Formule SAR, AF, initialisation, inversions à figer avant le test |",
      "| D11 Spot Grid | Archives horaires disponibles, exécution non certifiable | Ordre des touches intrahoraires, remplissages réels, frais maker |",
      "| D12 Spot DCA Martingale | Documentation disponible, non testé | Taille et plafond des renforts, gaps, pire cas sans rebond |",
      "| D14 Arbitrage | Les deux actifs ne sont pas deux places d'exécution | Carnets synchronisés multi-plateformes + coûts de transfert |",
      "| D15 TWAP | Données horaires grossières seulement | Carnet et exécution de lots, fenêtres plus fines |",
      "| D16 Iceberg | Non vérifiable à partir des OHLC | Ordres limites, queue et exécutions partielles |",
      "| D17 Scalping | Données horaires insuffisantes | Séries minute/seconde et spread/exécutions |",
      "",
      "## Incertitudes et limites",
      "",
      "- Rééquilibrer n'assure pas moins de pertes : acheter un actif qui baisse peut augmenter le risque. Les résultats sont rétrospectifs et non validés sur un second exchange.",
      "- L'USDT est valorisé comme liquidité stable, sans défaut d'émetteur, rendement ni risque de change.",
      "- Les paramètres 50/25/25 ont été choisis à titre pédagogique, non optimisés ; le portefeuille d'origine n'est pas celui de l'utilisateur.",
      "- Les volumes de cotation ne sont pas des preuves d'exécution possible d'un ordre de taille donnée.",
      "- La simulation n'emploie aucun prix ultérieur à la date d'exécution ; rééquilibrages aux ouvertures calendrier connues.",
      "",
      "## Reproduction",
      "",
      "- Script : "+STEM+".py",
      "- Rapport : "+STEM+".md",
      "- Résultats, sources, SHA et trajectoires quotidiennes : "+STEM+".json",
      "",
    ]
    return "\n".join(lines)

def main():
    raw,lineage,index_sha=candles()
    btc,bq=to_daily(raw["bitcoin"])
    eth,eq=to_daily(raw["ethereum"])
    assert [x["date"] for x in btc]==[x["date"] for x in eth]
    cases=("passive","monthly","quarterly","btc_full","eth_full","cash_full")
    scenarios={k:simulate(btc,eth,k) for k in cases}
    expensive={k:simulate(btc,eth,k,.002,.001)["net_return_pct"] for k in cases}
    assert scenarios["monthly"]["rebalancing_events"]==34
    assert scenarios["quarterly"]["rebalancing_events"]==12
    assert scenarios["passive"]["rebalancing_events"]==1
    assert scenarios["cash_full"]["final_usdt"]==INITIAL
    assert all(s["max_daily_drawdown_pct"]<=0 for s in scenarios.values())
    result=dict(schema="seven.crypto.rebalance-btc-eth-vwap-source.v1",
        study_date="2026-11-11",read_only=True,orders_enabled=False,
        venues="Binance Spot USDT",study_window=[FIRST,LAST],initial_capital_usdt=INITIAL,
        weights=dict(btc=.5,eth=.25,cash=.25),index_sha256=index_sha,asset_lineage=lineage,
        hourly_bars_per_asset=24840,daily_bars_per_asset=1035,
        fees_per_side=.001,slippage_per_side=.0005,
        vwap_quality=dict(bitcoin=bq,ethereum=eq),
        scenarios=scenarios,double_cost_return_pct=expensive)
    (HERE/(STEM+".json")).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(STEM+".md")).write_text(report(result),encoding="utf-8")
    print("SEVEN_BTC_ETH_HOURLY_SOURCE_AND_REBALANCING_VERIFIED")
    for k,x in scenarios.items():
        print("SCENARIO",k,"RETURN",x["net_return_pct"],"DD",x["max_daily_drawdown_pct"],"EVENTS",x["rebalancing_events"])
    print("VWAP_SOURCE",bq,eq)

if __name__=="__main__":
    main()
