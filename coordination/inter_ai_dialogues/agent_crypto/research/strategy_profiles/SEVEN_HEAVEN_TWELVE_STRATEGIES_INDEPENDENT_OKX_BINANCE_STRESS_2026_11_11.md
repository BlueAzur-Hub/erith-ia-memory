# Seven Heaven — 12 stratégies : contrôle multi-méthodes sur OKX et Binance

**11 novembre 2026.** Aucune stratégie exclue pour mauvais résultat. **Aucun compte, aucun ordre réel.**

## Question et protocole

Comment les 12 règles du catalogue quantitatif se comportent-elles sur les **mêmes journées vérifiées**,
dans un marché OKX BTC/USDC différent de leur archive Binance BTC/USDT initiale ?

- **Toutes les 12 variantes** sont exécutées avec les règles gelées du programme canonique du 10 novembre.
- Les variantes sont allouées fictivement à **25 % des liquidités disponibles à chaque entrée**, sans levier et sans rééquilibrage annuel.
- Frais 0,10 % par côté, glissement supposé 0,05 % par côté ; stress avec coûts doublés.
- Seules des bougies UTC closes sont utilisées ; signaux sur clôture, exécutions fictives à l'ouverture suivante.
- **Même préchauffage 21 août 2025** pour la comparaison entre sources. Fenêtre commune 1er avril au 30 septembre 2026 ;
  le scénario récent du 1er octobre au 10 novembre **redémarre le capital à zéro position**, alors que le scénario combiné
  du 1er avril au 10 novembre **garde les positions déjà ouvertes**.
- Le modèle source est adapté **en mémoire seulement** ; chaque fragment transformé est vérifié, et les douze variantes
  sont préalablement reproduites **à l'identique** sur les données canoniques Binance 2019–2026, y compris les résultats à 25 %.
- On ne fusionne jamais les deux paires et on ne prétend pas que l'USDT et l'USDC sont identiques.

## Résultats : même fenêtre de 183 jours

| Stratégie | Binance 25 % | OKX 25 % | Baisse max. OKX | Opérations OKX | Coûts doublés OKX |
|---|---:|---:|---:|---:|---:|
| Tendance EMA20 > EMA50 (EMA20_50) | 3.073 % | 3.019 % | -2.866 % | 2 | 2.858 % |
| Tendance EMA50 > EMA200 (EMA50_200) | 0.653 % | 0.638 % | -0.951 % | 1 | 0.561 % |
| Clôture au-dessus de EMA200 (PRICE_EMA200) | 3.542 % | 3.523 % | -1.891 % | 1 | 3.438 % |
| Momentum positif 90 jours (MOM90) | -2.733 % | -2.777 % | -5.709 % | 3 | -2.989 % |
| Momentum positif 180 jours (MOM180) | 5.211 % | 5.208 % | -1.964 % | 2 | 5.038 % |
| Cassure 20 j, sortie 10 j (DON20) | 4.85 % | 4.83 % | -2.412 % | 3 | 4.583 % |
| Cassure 55 j, sortie 20 j (DON55) | 0.843 % | 0.811 % | -2.916 % | 3 | 0.583 % |
| Cassure 20 j avec filtre EMA50/200 (DON20_TREND) | -0.937 % | -0.946 % | -0.976 % | 1 | -1.018 % |
| Repli EMA10 avec filtre EMA50/200 (PULLBACK_FILTERED) | 0.0 % | 0.0 % | 0.0 % | 0 | 0.0 % |
| Rebond RSI35 au-dessus de EMA200 (REBOUND_FILTERED) | 0.0 % | 0.0 % | 0.0 % | 0 | 0.0 % |
| Rebond RSI35 sans filtre EMA200 (ablation) (REBOUND_UNFILTERED) | -0.157 % | -0.144 % | -1.761 % | 2 | -0.293 % |
| Retour à la moyenne, écart-type 2 sur 20 j (MEANREV_Z2) | -3.458 % | -3.423 % | -6.265 % | 6 | -3.812 % |

## Octobre–novembre et portefeuille continu

**Attention :** un zéro opération dans la fenêtre récente démarrée en liquidités ne signifie pas zéro exposition dans le portefeuille continu.

| Code | Récent isolé 41 j | Continu avril–novembre 224 j | DD max. continu | Opérations continues |
|---|---:|---:|---:|---:|
| EMA20_50 | -2.465 % | 0.689 % | -3.234 % | 2 |
| EMA50_200 | -3.344 % | -2.385 % | -3.895 % | 1 |
| PRICE_EMA200 | -2.971 % | 0.657 % | -3.736 % | 2 |
| MOM90 | -3.344 % | -5.778 % | -6.275 % | 3 |
| MOM180 | -3.551 % | 1.65 % | -4.379 % | 3 |
| DON20 | 0.0 % | 4.258 % | -2.914 % | 3 |
| DON55 | 0.0 % | -0.261 % | -3.919 % | 3 |
| DON20_TREND | 0.0 % | -1.485 % | -1.485 % | 1 |
| PULLBACK_FILTERED | -3.742 % | -3.742 % | -3.743 % | 4 |
| REBOUND_FILTERED | 0.886 % | 0.886 % | -0.5 % | 1 |
| REBOUND_UNFILTERED | 0.886 % | 0.741 % | -1.761 % | 3 |
| MEANREV_Z2 | 0.753 % | -2.696 % | -6.265 % | 7 |

## Ce que l'étude peut et ne peut pas démontrer

- **Le résultat porte sur toutes les douze règles de ce catalogue**, pas sur toutes les stratégies imaginables ni les neuf profils documentaires du Coffre.
- Le résultat Binance comparé repose sur le même préchauffage et le même calendrier que OKX ; ne pas le confondre avec une stratégie tenue sans interruption depuis 2019.
- La série OKX réutilisée a été qualifiée comme 447 journées closes consécutives dans un précédent rapport ; **aucune nouvelle vérification réseau** ici.
- Les résultats restent rétrospectifs, pas un véritable test prospectif aveugle ; les règles ont été étudiées auparavant sur des cycles BTC connus.
- Un faible drawdown passé peut résulter de l'absence de position : conserver le nombre d'opérations et l'exposition dans le rapport.
- Les frais et stops sont théoriques, la liquidité, les gaps réels et les risques des stablecoins sont incomplets.
- Ces résultats ne prescrivent ni achat ni vente pour les BTC personnels conservés en Swing Trading / Buy & Hold.

## Provenance

- Programme original : SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py.
- Archive source Binance : public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz (SHA-256 figée).
- Archive source OKX : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json (447 bougies 1Dutc confirmées).
- Résultats des 12 allocations 25 % à contrôler : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.json.
- Preuves structurées de la nouvelle étude : SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.json.
- Code de reproduction : SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.py.
