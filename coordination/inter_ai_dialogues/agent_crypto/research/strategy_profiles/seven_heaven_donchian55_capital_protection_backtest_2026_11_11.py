#!/usr/bin/env python3
"""Seven Heaven — reproduction from verified yearly returns, research only.

This is a YEARLY REBALANCED portfolio reconstruction, not trade-by-trade
backtesting. The historical Donchian strategy's annual net returns include
underlying model fees (0.10% each side) and assumed slippage (0.05% each side).
No extra costs are modeled for the yearly rebalancing between sleeves.
"""
from pathlib import Path
import argparse

SOURCE = "https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json"
YEARS = {
    2019: 67.413,
    2020: 56.394,
    2021: 19.757,
    2022: -10.695,
    2023: 27.382,
    2024: 48.174,
    2025: -4.033,
    2026: -3.962,  # Through 2026-09-30 only.
}
START_USDT = 1000.0
WEIGHTS = [1.0, 0.5, 0.25]
SOURCE_TOTAL_RETURN_PCT = 387.115
SOURCE_MAX_DRAWDOWN_PCT = -33.530

# Preserve the source output from the full Donchian 55 model as a reconciliation.
source_ending = START_USDT * (1 + SOURCE_TOTAL_RETURN_PCT / 100)

portfolios = {}
for weight in WEIGHTS:
    balance = START_USDT
    peak_at_year_end = START_USDT
    rows = []
    for year, strategy_annual_return_pct in YEARS.items():
        # At each YEAR START, w of that year's beginning balance goes into a
        # virtual Donchian strategy sleeve, (1-w) remains flat cash.
        # At YEAR END, the sleeve value uses the SOURCE'S NET annual return.
        # No additional rebalancing cost is accounted for.
        portfolio_return_pct = weight * strategy_annual_return_pct
        balance *= 1.0 + portfolio_return_pct / 100.0
        peak_at_year_end = max(peak_at_year_end, balance)
        year_end_dd_pct = 100.0 * (balance / peak_at_year_end - 1.0)
        rows.append((year, strategy_annual_return_pct, portfolio_return_pct, balance, year_end_dd_pct))
    portfolios[weight] = rows

assert abs(portfolios[1.0][-1][3] - source_ending) < 0.02, "Reconciliation with source failed"

# STATIC capital split at inception only; separate sensitivity, NOT annual rebalancing.
static_final = {w: START_USDT * (1-w) + source_ending * w for w in WEIGHTS}

report = [
    "# SEVEN HEAVEN — Donchian 55 : protection du capital par allocation",
    "",
    "**Date du calcul : 11 novembre 2026**  ",
    "**Période source : 1er janvier 2019 – 30 septembre 2026 (2026 partiel)**  ",
    "**Statut : reconstruction analytique par année, lecture seule, sans ordres réels.**",
    "",
    "## 1. Données et règles inchangées",
    "",
    f"- [Archive vérifiée des 12 stratégies et 2 témoins]({SOURCE}) : méthode `DON55`.",
    "- Série d'origine : Binance Spot BTC/USDT, bougies journalières ; 2 830 jours étudiés, 3 075 jours source.",
    "- Donchian : clôture au-dessus du plus haut des 55 jours précédents ; sortie sous le plus bas des 20 jours précédents ; stop ATR14 × 3, période maximale 120 jours.",
    "- Simulation source : achat/vente fictifs, signal à la clôture, exécution à l'ouverture suivante ; 0,10 % de frais et 0,05 % de glissement par côté, sans levier.",
    "- Rendement historique net source : +387,115 % ; maximum drawdown journalier estimé source : −33,530 % ; 29 opérations (16 gagnantes, 13 perdantes) ; temps exposé au BTC : 29,19 %.",
    "- Capital initial fictif : 1 000 USDT ; les pourcentages d'allocation représentent la fraction **allouée à la stratégie**, et non le pourcentage de jours effectivement exposés au Bitcoin.",
    "",
    "## 2. Méthode de ce calcul (et limite)",
    "",
    "Au début de chaque année civile, le portefeuille est **rééquilibré théoriquement** entre une poche `DON55` et des liquidités qui ne rapportent rien. À la fin de l'année, on applique le rendement net annuel source à la seule poche DON55.",
    "",
    "`Capital_fin_année = Capital_début_année × [1 + (allocation × rendement_annuel_source / 100)]`",
    "",
    "Les rendements annuels source sont arrondis à 0,001 point. Le modèle ne facture aucun coût additionnel pour les rééquilibrages annuels : c'est optimiste. Les frais et glissements de la stratégie source sont déjà pris en compte, mais les rééquilibrages n'ont PAS été rejoués opération par opération.",
    "",
    "**Ce n'est pas un vrai backtest à exposition constante par opération.** Il permet une comparaison contrôlée à fréquence annuelle, mais ne permet pas de calculer le drawdown intrajournalier exact des portefeuilles à 50 % et 25 %, leurs risques de gap, les prix réels d'exécution ou les effets d'un rééquilibrage quotidien. Les mesures de drawdown à fin d'année ci-dessous sont des **bornes inférieures en amplitude** du drawdown maximal réel simulé à fréquence quotidienne.",
    "",
    "## 3. Résultat annuel des trois allocations",
    "",
    "| Période | Rendement DON55 source | Capital 100 % | Capital 50 % | Capital 25 % |",
    "|---|---:|---:|---:|---:|",
    "| Départ | — | 1 000,00 | 1 000,00 | 1 000,00 |",
]
for i,year in enumerate(YEARS):
    def fr(value):
        return f"{value:,.2f}".replace(",", " ").replace(".", ",")
    row = portfolios[1][i]
    v100 = portfolios[1][i][3]
    v50 = portfolios[0.5][i][3]
    v25 = portfolios[0.25][i][3]
    report.append(f"| {year}{' (janv.–sept.)' if year==2026 else ''} | {row[1]:+.3f} % | {fr(v100)} | {fr(v50)} | {fr(v25)} |")
report += [
    "",
    "## 4. Synthèse",
    "",
    "| Allocation annuelle | Capital final | Gain total fictif | Pire baisse **constatée aux fins d'année** |",
    "|---|---:|---:|---:|",
]
for w in WEIGHTS:
    rows=portfolios[w]
    final=rows[-1][3]
    min_yearend_dd=min(r[4] for r in rows)
    report.append(f"| {round(w*100)} % | {fr(final)} USDT | {(final/1000-1)*100:+.2f} % | {min_yearend_dd:.2f} % |")
report += [
    "",
    "Les baisses mesurées aux fins d'année ne remplacent pas le drawdown **quotidien** source de −33,53 % pour l'allocation 100 %. Ne pas assimiler une perte de fin d'année de −10,70 % en 2022 à la pire baisse survenue pendant cette année.",
    "",
    "Sur l'année 2022 seulement, le rendement DON55 source était −10,695 %, soit environ −10,70 % / −5,35 % / −2,67 % selon l'allocation annuelle ; le témoin Buy & Hold à 100 % affichait −64,207 % la même année.",
    "",
    "## 5. Sensibilité : ne PAS rééquilibrer après le départ",
    "",
    "Une question distincte consiste à immobiliser dès le début une poche fixe de 100 %, 50 % ou 25 % pour la même stratégie et à laisser le reste en liquidités pendant toute la période, sans jamais déplacer de capital entre les deux poches. L'exposition relative peut alors dériver fortement avec les années : ce n'est pas une exposition de 50 % / 25 % constamment maintenue.",
    "",
    "| Poche initiale Donchian | Capital final, sans rééquilibrage |",
    "|---|---:|",
]
for w in WEIGHTS:
    report.append(f"| {round(w*100)} % | {fr(static_final[w])} USDT |")
report += [
    "",
    "La différence avec le tableau principal montre que **le calendrier des rééquilibrages fait partie de la stratégie**. On ne peut pas présenter ces scénarios comme interchangeables.",
    "",
    "## 6. Conclusions et limites",
    "",
    "- Cette comparaison établit mathématiquement la conséquence de réduire l'allocation **sur les rendements annuels historiques déjà calculés** : volatilité et pertes annuelles amorties, mais gains également réduits.",
    "- Elle ne prouve PAS qu'une allocation de 25 % assure une protection sûre en cas de liquidation, décrochage brusque, panne de plateforme ou faillite d'une stablecoin.",
    "- Le prix, la liquidité, les frais réels, les gaps et la tenue d'un stop ne sont pas certifiés par des bougies journalières.",
    "- Cette étude est rétrospective et ne valide pas prospectivement DON55.",
    "- Pour comparer **précisément** la taille de position à chaque entrée, le prochain calcul exige le fichier OHLC quotidien source, afin de rejouer les 29 opérations avec un capital disponible différent à chaque achat, et calculer le drawdown quotidien de chaque portefeuille.",
    "- Aucun changement de paramètre, aucun ordre, aucun accès à un compte, aucune modification du Trader, de l'Administrator ou du Bridge.",
    "",
    "## 7. Source canonique et contrôle",
    "",
    f"- Résultats vérifiés : {SOURCE}",
    "- Algorithme de référence : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py",
    "- Jeu de bougies déclaré : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz` (Binance BTC/USDT, archive SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`).",
    "- Contrôle de cohérence : la composition de huit rendements annuels source reproduit +387,115 % à quelques millièmes près (arrondi), cohérent avec le rapport vérifié.",
    "",
    "**Arrêt :** résultat limité à la reconstruction annuelle et à la sensibilité statique, sans substituer un calcul annuel à un backtest de 29 transactions.",
]
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reproduce the Donchian 55 annual allocation comparison")
    parser.add_argument("--output", type=Path, help="Optional Markdown destination; otherwise print to stdout")
    args = parser.parse_args()
    markdown = "\n".join(report) + "\n"
    if args.output:
        args.output.write_text(markdown, encoding="utf-8")
        print(f"REPORT: {args.output}")
    else:
        print(markdown, end="")
    print("YEAR_END_SUMMARY:")
    for weight in WEIGHTS:
        rows = portfolios[weight]
        print(f"{weight:.0%}: final={rows[-1][3]:.2f} total_return={100*(rows[-1][3]/1000-1):.2f} worst_year_end_dd={min(x[4] for x in rows):.2f}% static_final={static_final[weight]:.2f}")
