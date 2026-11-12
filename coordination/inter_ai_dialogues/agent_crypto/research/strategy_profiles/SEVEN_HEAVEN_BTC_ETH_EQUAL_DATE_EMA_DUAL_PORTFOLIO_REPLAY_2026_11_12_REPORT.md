# Seven Heaven — BTC + ETH, même calendrier, EMA et portefeuille 50/50 (2024–2026)

**Rapport du 12 novembre 2026** · Recherche PAPER, aucune transaction réelle.

## Résumé exécutif

**Comparaison sur 1 035 journées UTC strictement identiques**, du 1er janvier 2024 au 31 octobre 2026. Deux actifs Binance Spot **BTC/USDT** et **ETH/USDT**, un même protocole EMA10/30, portefeuille initial fictif de **1 000 USDT**, frais 0,10 % et glissement 0,05 % **par côté**. Huit archives horaires issues de minutes officielles ont été contrôlées SHA-256, totalisant **62 880 heures** (31 440 heures par actif), agrégées en 1 310 jours par actif, dont 275 jours de chauffage en 2023.

Le portefeuille **EMA 50/50 en deux poches indépendantes** termine à **1 792,03 USDT (+79,20 %)** contre **1 407,43 USDT (+40,74 %)** pour **Buy & Hold 50/50**, avec une baisse maximale liquidable respective de **−41,92 %** et **−58,50 %**. La stratégie EMA 50/50 a effectué **124 transactions fictives**, contre deux achats initiaux du Buy & Hold 50/50. Elle a passé **45,70 % des journées entièrement en cash USDT** dans les deux poches. **Aucun résultat ne prouve une supériorité prospective.**

Avec coûts **doublés**, EMA 50/50 passe à **+63,38 %** sur l'ensemble continu ; sur janvier–octobre 2026 pris isolément, sa performance **+2,74 % devient −0,24 %**, signal important de fragilité aux coûts.

## 1. Protocole et provenance

Règles [figées avant calcul](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_FROZEN_PROTOCOL_2026_11_12.md) : commit `63164145e0fcd8e99c05574af975d3ff972017cc`. Les indicateurs sont initialisés au **1er avril 2023**. Chaque jour UTC t, une poche devient exposée si `EMA10(t)>EMA30(t)` **et** `close(t)>EMA30(t)`, sinon elle reste en cash. Transaction fictive exclusivement à l'**ouverture t+1**, sans anticipation des cours futurs. Aucune optimisation EMA ni modification des pondérations.

Source : `public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json` et huit shards `bitcoin` / `ethereum` de 2023-avril→2026-octobre. Les noms et **huit SHA-256 exacts**, ainsi que les comptes horaires, figurent dans les [preuves JSON](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json). Chaque jour doit avoir 24 heures vérifiées. **Les prix et volumes concernent les paires Binance BTCUSDT / ETHUSDT, non OKX BTC/USDC.** Les cotations actuelles montrées par l'Administrator sont distinctes.

**Portefeuille EMA 50/50** : allocation initiale de 500 USDT à la poche BTC et 500 USDT à la poche ETH. Chaque poche exécute son propre filtrage EMA et conserve seule les liquidités libérées. **Aucun transfert, aucun rebalancement ultérieur, aucun levier ni short**. La valorisation quotidienne inclut un coût fictif de sortie pour les pièces encore détenues. La valeur finale de la stratégie mixte est donc arithmétiquement égale à la moyenne des valeurs finales de deux simulations individuelles de 1 000 USDT, **pas une découverte algorithmique** ; sa baisse maximale est toutefois mesurée sur sa trajectoire quotidienne combinée.

## 2. Portefeuille continu, 2024→octobre 2026

| Portefeuille | Capital final | Rendement net | Baisse maximale | Opérations fictives |
|---|---:|---:|---:|---:|
| BTC EMA seul | 1 671,38 USDT | +67,14 % | −34,21 % | 68 |
| ETH EMA seul | 1 912,68 USDT | +91,27 % | −53,82 % | 56 |
| **BTC/ETH EMA 50/50** | **1 792,03 USDT** | **+79,20 %** | **−41,92 %** | **124** |
| BTC Buy & Hold seul | 1 829,30 USDT | +82,93 % | −52,97 % | 1 |
| ETH Buy & Hold seul | 985,55 USDT | −1,44 % | −67,55 % | 1 |
| BTC/ETH Buy & Hold 50/50 | 1 407,43 USDT | +40,74 % | −58,50 % | 2 |
| Cash USDT 100 % | 1 000 USDT | 0,00 % | 0,00 % | 0 |

Sur cette trajectoire, la diversification entre les deux **EMA** réduit la baisse maximale par rapport à ETH EMA seul (−53,82 % → −41,92 %), **mais pas par rapport à BTC EMA seul (−34,21 %)**. Elle n'élimine donc pas le risque. La moitié du capital initial seulement n'est pas synonyme d'un plafonnement de la perte à 50 %.

## 3. Sous-périodes annuelles, portefeuilles réinitialisés

**Attention : ces rendements ne s'additionnent pas et ne reproduisent pas à eux seuls le portefeuille continu.** Chaque expérience annuelle repart indépendamment de 1 000 USDT, en gardant les EMA préchauffées depuis avril 2023.

| Période | BTC EMA | ETH EMA | EMA 50/50 | Buy & Hold 50/50 | Max DD EMA 50/50 |
|---|---:|---:|---:|---:|---:|
| 2024 | +64,40 % | −9,01 % | +27,70 % | +83,24 % | −41,92 % |
| 2025 | +4,84 % | +93,72 % | +49,28 % | −8,93 % | −14,55 % |
| Janv.–oct. 2026 | −3,03 % | +8,51 % | +2,74 % | −18,04 % | −22,78 % |

En 2024, le Buy & Hold 50/50 **surpasse largement EMA 50/50** et connaît même une moindre baisse maximale (−35,42 % contre −41,92 %). En 2025, les filtres améliorent nettement la simulation ; en 2026, la marge de performance est faible.

## 4. Coûts et exposition

| Période | EMA 50/50 coûts normaux | EMA 50/50 coûts ×2 | Journées avec les deux poches en cash |
|---|---:|---:|---:|
| 2024 | +27,70 % | +22,91 % | 38,25 % |
| 2025 | +49,28 % | +45,87 % | 51,51 % |
| Janv.–oct. 2026 | +2,74 % | **−0,24 %** | 47,70 % |
| Continu 2024–oct. 2026 | +79,20 % | +63,38 % | 45,70 % |

Ce temps en liquidités limite l'exposition au prix, mais implique des **opportunités de hausse manquées** et une exposition aux risques d'émetteur/plateforme USDT que les simulations ne modélisent pas.

**Ne pas comparer la baisse maximale seule sans comparer les performances :** une méthode qui reste en cash peut mécaniquement moins baisser tout en gagnant beaucoup moins pendant une hausse.

## 5. Reproductibilité, contrôle et limites

- [**Code Python autonome**](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12.py) : depuis une copie locale du dépôt, lit les huit shards gzip, contrôle SHA-256 et horaires, agrège chaque journée UTC, calcule EMA et simule les portefeuilles. Exécutable sans réseau et sans identifiant de compte avec `--repo-root` et `--output`. Les tests synthétiques et la compilation sont passés ; **la réexécution intégrale indépendante des huit shards avec ce programme reste à confirmer**.
- [**Preuves JSON**](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json) : hashes sources, paramètres, statistiques par période et par coût, **18 contrôles de causalité EMA**, **4 140 identités journalières de poches**, reproduction des quatre résultats ETH précédemment publiés.
- [**Courbes quotidiennes**](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv) : trajectoires EMA et Buy & Hold des deux actifs et du mélange sur 1 035 jours.
- [**Journal des opérations fictives**](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_TRADES.csv) : achats/ventes des deux modèles EMA et achats Buy & Hold. Ces opérations ne sont **pas** des ordres OKX.
- Série Binance Spot 1m agrégée en 1h puis en 1d ; aucune reconstitution de transactions intrabougies, profondeur réelle, spread courant, partial fill ou impact d'ordre. Les coûts fixes sont hypothétiques et peuvent être insuffisants.
- **2024–2026 a déjà été étudié sur BTC et ETH séparément. Cette comparaison à dates identiques reste exploratoire, pas un holdout neuf ni une validation prospective.**

## 6. Conclusion utilisable par les autres IA

Le portefeuille 50/50 **ne sélectionne pas** une stratégie gagnante à l'avance ; il rassemble des règles identiques sur deux actifs. Les résultats observés varient sensiblement entre 2024, 2025 et 2026, et le bénéfice hypothétique 2026 est annulé par le stress de coûts doublés.

**Recherche suivante recommandée** : examiner la sensibilité au type de marché et à la corrélation des décisions BTC/ETH, puis vérifier sur un autre actif ou une période réellement inédite, **sans changer les règles à partir de ces résultats**. Aucune activation du Trader, Operator, Administrator ou Bridge.
