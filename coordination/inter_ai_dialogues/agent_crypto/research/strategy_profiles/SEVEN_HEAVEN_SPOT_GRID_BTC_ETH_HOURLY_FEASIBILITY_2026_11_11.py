#!/usr/bin/env python3
"""Spot Grid feasibility audit from SHA-verified hourly BTC ETH archives.
No fill, profit, or actual-order assertions; this is NOT a bot backtest.
"""
import datetime as dt
import importlib.util
import json
import math
from pathlib import Path

HERE=Path(__file__).resolve().parent
NAME="SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11"
READER=HERE/"SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.py"
YEARS=(2024,2025,2026)
WIDTHS=(.05,.10,.20)
STEPS=(5,10,20)
FEE=.001
SLIP=.0005

def date_of(t):
    return dt.datetime.fromtimestamp(t/1000,dt.timezone.utc).date().isoformat()

def study(rows,asset,year,width,count):
    center=float(rows[0][1])
    lower=center*(1-width);upper=center*(1+width)
    interval=(upper-lower)/count
    levels=[lower+k*interval for k in range(count+1)]
    inside=above=below=touches=multi=level_count=0
    longest_below=longest_above=below_streak=above_streak=0
    for row in rows:
        t,o,h,l,c,v,q,n=row
        assert 0<l<=min(o,c) and max(o,c)<=h
        if c<lower:
            below+=1;below_streak+=1;above_streak=0
        elif c>upper:
            above+=1;above_streak+=1;below_streak=0
        else:
            inside+=1;below_streak=above_streak=0
        longest_below=max(longest_below,below_streak)
        longest_above=max(longest_above,above_streak)
        first=max(0,math.ceil((l-lower)/interval-1e-12))
        last=min(count,math.floor((h-lower)/interval+1e-12))
        nlevels=max(0,last-first+1)
        if nlevels>0:touches+=1
        if nlevels>1:multi+=1
        level_count+=nlevels
    assert inside+above+below==len(rows)
    assert 0<=multi<=touches<=len(rows)
    factor=(1-FEE)*(1-SLIP)/((1+FEE)*(1+SLIP))
    lot=[100*(levels[i+1]/levels[i]*factor-1) for i in range(count)]
    return dict(
       asset=asset,year=year,quote="USDT",
       hours=len(rows),from_utc=date_of(rows[0][0]),to_utc=date_of(rows[-1][0]),
       starting_price=round(center,5),width_each_side_pct=round(width*100,3),
       intervals=count,lower_price=round(lower,5),upper_price=round(upper,5),
       one_step_price=round(interval,5),one_step_pct_center=round(100*interval/center,4),
       close_inside_hours=inside,close_above_hours=above,close_below_hours=below,
       close_inside_pct=round(100*inside/len(rows),2),
       close_above_pct=round(100*above/len(rows),2),
       close_below_pct=round(100*below/len(rows),2),
       longest_above_band_hours=longest_above,
       longest_below_band_hours=longest_below,
       hours_touching_one_or_more_levels=touches,
       hours_touching_multiple_levels=multi,
       level_incidences_not_verified_fills=level_count,
       conditional_completed_adjacent_lot_net_pct_range=[
          round(min(lot),3),round(max(lot),3)],
       actual_orders_known=False,actual_fills_known=False,
       intrahour_high_low_sequence_known=False,bot_profit_computed=False)

def report(data):
    lookup={(x["asset"],x["year"],x["width_each_side_pct"],x["intervals"]):x for x in data["scenarios"]}
    lines=[
     "# Seven Heaven - Spot Grid : faisabilite historique avec les archives BTC et ETH",
     "",
     "11 novembre 2026. Ce rapport NE constitue PAS un backtest du profit d'un bot de grille.",
     "",
     "## Principe",
     "",
     "Une grille Spot vise a acheter sous le cours courant et revendre aux niveaux superieurs dans une fourchette fixe.",
     "Le resultat total d'un bot inclut aussi la valeur des BTC encore detenus, le capital immobilise et les frais.",
     "Source OKX Europe : https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it",
     "",
     "## Preuves de donnees",
     "",
     "- Les six archives Binance BTC/USDT et ETH/USDT sont controlees SHA-256 par le lecteur du Coffre.",
     "- 24 840 bougies horaires continues par actif, du 1er janvier 2024 au 31 octobre 2026.",
     "- Trois etudes independantes : 2024, 2025, janvier-octobre 2026.",
     "- Bornes fixees au prix d'ouverture du premier jour de chaque periode : +/-5 %, +/-10 %, +/-20 %.",
     "- Pour chaque bande, 5, 10 ou 20 intervalles arithmetiques : 54 scenarios declares avant calcul.",
     "- Un niveau entre le plus haut et le plus bas d'une bougie est seulement un seuil potentiellement touche.",
     "- Plusieurs niveaux dans la meme bougie = chronologie inconnue; on NE fabrique pas l'ordre favorable des passages.",
     "- Frais 0,10 % de chaque cote et glissement 0,05 % de chaque cote : calcul conditionnel d'un seul lot seulement.",
     "",
     "## Cas pedagogique +/-10 % et 10 intervalles",
     "",
     "| Marche | Annee | Prix initial | Bande basse | Bande haute | Heures dedans | Heures dessous | Heures avec plusieurs niveaux | Plus longue serie sous bande |",
     "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for asset in ("bitcoin","ethereum"):
        for y in YEARS:
            r=lookup[(asset,y,10.,10)]
            lines.append("| "+asset.upper()+" | "+str(y)+" | "+
               f"{r['starting_price']:,.2f} | {r['lower_price']:,.2f} | {r['upper_price']:,.2f} | "+
               str(r["close_inside_pct"])+" % | "+str(r["close_below_pct"])+" % | "+
               str(r["hours_touching_multiple_levels"])+"/"+str(r["hours"])+" | "+
               str(r["longest_below_band_hours"])+" h |")
    lines+=["","## Espacement et couts d'un seul lot fictif","",
      "| Bande | Intervalles | Distance initiale entre paliers | Lot ACHETE puis VENDU sur paliers adjacents, frais inclus |",
      "|---|---:|---:|---:|"]
    for width,count in ((5.,20),(10.,10),(20.,5)):
        r=lookup[("bitcoin",2024,width,count)]
        a,b=r["conditional_completed_adjacent_lot_net_pct_range"]
        lines.append(f"| +/-{width:.0f}% | {count} | {r['one_step_pct_center']:.2f}% | {a:+.2f}% a {b:+.2f}% |")
    lines+=["",
      "Ces valeurs par lot supposent deux executions effectives a des prix adjacents.",
      "Elles ne constituent PAS un profit de la grille ni une estimation du resultat global.",
      "",
      "## Pourquoi ne pas afficher de profit global",
      "",
      "Une bougie horaire donne ouverture, haut, bas, cloture et volumes, sans l'ordre exact des passages.",
      "Des ordres limites peuvent ne pas etre executes bien que le seuil apparaisse dans la plage haut/bas.",
      "Le moteur exact des ordres et l'inventaire des BTC doivent etre connus pour calculer le P&L total.",
      "Une simulation qui presume toujours des achats puis des ventes favorables serait injustifiee.",
      "",
      "## Prochaine validation utile",
      "",
      "- Retrouver les archives natives une minute referencees par l'index et verifier leur integrite.",
      "- Rejouer la chronologie minute sans considerer un prix touche comme un remplissage certain.",
      "- Simuler l'inventaire complet, les frais maker et taker, les ordres manques, les limites OKX.",
      "- Produire des bornes prudentes de resultat, comparer avec Buy & Hold aux memes dates.",
      "- Obtenir des donnees de transactions/carnet si une precision d'execution est necessaire.",
      "",
      "## Frontieres",
      "",
      "Etude Binance BTC/USDT et ETH/USDT, pas OKX BTC/USDC 15 min.",
      "Aucune optimisation de bornes a posteriori. Les niveaux fictifs ne sont pas des recommandations.",
      "Pas de modification des cinq profils graphiques de l'Administrator.",
      "",
      "Code : "+NAME+".py",
      "Preuves et 54 configurations : "+NAME+".json",
      ""
    ]
    return "\n".join(lines)

def main():
    spec=importlib.util.spec_from_file_location("seven_grid_archive",str(READER))
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    assets,lineage,sha=mod.candles()
    assert set(assets)=={"bitcoin","ethereum"}
    assert all(len(rows)==24840 for rows in assets.values())
    assert [r[0] for r in assets["bitcoin"]]==[r[0] for r in assets["ethereum"]]
    results=[]
    for asset,full in assets.items():
        for year in YEARS:
            subset=[r for r in full if date_of(r[0])[:4]==str(year)]
            assert len(subset)==(8784 if year==2024 else 8760 if year==2025 else 7296)
            for width in WIDTHS:
                for count in STEPS:
                    results.append(study(subset,asset,year,width,count))
    assert len(results)==54
    assert all(not r["actual_fills_known"] and not r["bot_profit_computed"] for r in results)
    data=dict(schema="seven.crypto.spot-grid.hourly-feasibility.v1",
      study_date="2026-11-11",research_only=True,orders_enabled=False,
      backtest_profit_reported=False,hourly_bars_per_asset=24840,
      source_index_sha256=sha,lineage=lineage,
      fee_per_side=FEE,assumed_slippage_per_side=SLIP,
      grid_widths_pct=[5,10,20],grid_intervals=[5,10,20],
      scenarios=results)
    (HERE/(NAME+".json")).write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(NAME+".md")).write_text(report(data),encoding="utf-8")
    print("SEVEN_SPOT_GRID_FEASIBILITY_ALL_54_CASES_VERIFIED")
    for r in results:
        if r["width_each_side_pct"]==10 and r["intervals"]==10:
            print("CASE",r["asset"],r["year"],"inside",r["close_inside_pct"],
              "below",r["close_below_pct"],"multi",r["hours_touching_multiple_levels"],
              "under",r["longest_below_band_hours"])
    print("RESEARCH_OUTPUT",NAME+".md",NAME+".json")

if __name__=="__main__":
    main()
