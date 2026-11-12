# Seven Heaven — ETH/USD sur deuxième fournisseur : protocole figé avant calcul

**Date : 12 novembre 2026** · Étude PAPER, lecture seule · **Protocole déposé avant d'observer les performances et les concordances de signaux sur la nouvelle source.**

## Motif de la fenêtre réduite

La série `SeedFlora/idx-daily-data/data/ETH-USD.csv` est une publication publique d'OHLCV ETH-USD, format de type Yahoo Finance, sans garantie qu'elle constitue une capture d'exchange unique. Copie GitHub **blob SHA-1 `f92d8c4fce1ea30f16b0195d0ea5f05b9e4fe185`**. À l'audit préliminaire de couverture, 462 lignes du 28 juin 2025 au 11 novembre 2026 et trois interruptions :
- du 1er au 13 août 2026, inclus ;
- du 15 au 17 septembre 2026, inclus ;
- du 6 au 29 octobre 2026, inclus.

**Aucun remplissage, interpolation ou réutilisation de prix de Binance comme seconde source.** Une fenêtre complète de 2024 à octobre 2026 ne peut pas être prétendue avec cette copie.

## Échantillon arrêté par disponibilité, pas par performance

- Bloc OHLCV continu **2025-06-28→2026-07-31** : **399 jours**.
- **90 premiers jours** : chauffe indépendante des EMA du 28 juin au 25 septembre 2025 inclus.
- **309 jours d'évaluation** : **26 septembre 2025→31 juillet 2026** inclus. Si un jour manque, abandonner le replay plutôt que changer les dates.
- Source témoin : historique Binance ETH/USDT de la comparaison BTC+ETH, `SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv` (blob SHA `c8ed2a206ea616ea87eeb83e31f7138d5b131588`), colonne `eth_exposed`, état dérivé d'un indicateur initialisé dès 2023-04-01. Les différences de période d'initialisation seront mentionnées.
- Vérifier l'unicité, l'ordre et la régularité UTC des dates ; OHLC strictement positifs, volumes non négatifs. Le format de date fournit des journées supposées UTC, **à ne pas certifier comme clôtures d'exchange authentifiées sans preuve supplémentaire**.

## Stratégies et métriques figées

- EMA10 et EMA30, semence = close du **premier jour de chauffe**, mises à jour uniquement avec les clôtures antérieures ou du jour t :
  `ema10(t)>ema30(t) AND close(t)>ema30(t)`.
- Exposition sur la journée t+1 selon le signal en clôture de t ; achats et ventes fictifs à l'**ouverture de la journée suivante** uniquement, aucun regard dans le futur.
- Capital fictif **1 000 USD** sur la deuxième source ; frais **0,10 %** et glissement **0,05 %** par côté. Sensibilité fixe frais+glissement **×2**.
- Buy & Hold ETH et liquidités comme témoins ; sans levier, sans short, sans rééquilibrage, sans intérêt ni staking.
- Rendement final net, drawdown maximum sur capital de référence initial, nombre d'opérations, jours exposés, concordance d'exposition ETH/USD vs Binance ETH/USDT et liste exhaustive des dates de désaccord.
- Les **309 états de position** sont comparés sur les mêmes dates au témoin Binance (la source de prix reste distincte). Ne pas comparer naïvement les capitaux USD et USDT comme une même devise ni annoncer une performance Binance réinitialisée si elle n'est pas rejouée sur la même fenêtre.
- Coder le replay autonome avec vérification du SHA de la copie ; rejeter les erreurs avant toute statistique.

## Interprétations autorisées et interdites

Le jeu est **indépendant par fournisseur de données, non par calendrier**. Il peut mesurer la reproductibilité locale des signaux sur une fenêtre continue, mais ne permet aucune affirmation sur 2024, ni l'année 2026 entière, ni la rentabilité future. Le Yahoo-style ETH-USD est un agrégat ou une source secondaire à provenance détaillée non certifiée ; ne pas l'appeler « Coinbase Spot » ni « Bitstamp Spot ». Un écart peut provenir du fournisseur, du numéraire USD/USDT, du fuseau ou du préchauffage.

**À livrer dans ce répertoire :** code, preuves JSON, CSV des désaccords, rapport critique et référence dans la passation inter-IA. Aucun changement Administrator / Operator / Trader / Bridge, aucune transaction réelle.
