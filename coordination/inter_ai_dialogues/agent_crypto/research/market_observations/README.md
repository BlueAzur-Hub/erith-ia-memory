# Seven Heaven · Agent-Crypto — Journal d'observations du marché

**Ouvert le :** 7 novembre 2026. **Statut :** documents de recherche, lecture seule ; aucun signal exécutable.

Ce dossier du répertoire partagé capitalise les résultats des études **08** et **08B**, à la suite des [sept fiches pédagogiques et de leur comparaison](../strategy_profiles/README.md). Il ne modifie pas l'Administrator, l'Operator, le Trader, les modules Atlas ni les sources de prix.

## Observation BTC du 11 novembre 2026

- [**BTC — informations recoupées et scénarios conditionnels à 3 jours, 3 semaines et 3 mois**](./SEVEN_HEAVEN_BTC_MARKET_WATCH_3_DAYS_3_WEEKS_3_MONTHS_2026_11_11.md) : capture utilisateur, inflation USA, sorties ETF, liquidations, niveaux techniques et limites de toute prévision.
- [**Synthèse des dix stratégies DCA / EMA / MACD / RSI / Bollinger / SuperTrend et autres**](../strategy_profiles/SEVEN_HEAVEN_BTC_TEN_STRATEGY_2022_2025_RESILIENCE_AUDIT_2026_11_11.md) : réanalyse historique du Coffre 2022–2025, distincte de l'observation actuelle.

## Lire les recherches

1. [**08 — Régimes observables et qualité des historiques**](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08_MARKET_REGIMES_DATA_QUALITY_AND_FORWARD_OBSERVATION_2026_11_07.md) : classification BTC/USDT 1j **sans regarder le futur** ; 1 377 journées étudiées (2022–2025) ; 68 observations de variation à 20 jours non chevauchantes ; hypothèses, limites, provenance.
   - [Données structurées 08](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08_CAPTURE_AND_REGIME_METRICS_2026_11_07.json) : règles et tableaux au format JSON.
2. [**08B — AKE / Akedo : Spot, perpétuels OKX et carnet**](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08B_AKE_AKEDO_OKX_SPOT_FUTURES_ORDERBOOK_AND_CHART_OBSERVATIONS_2026_11_07.md) : observation des cinq courbes Hausses 5, AKE leader à +23,29 % sur la capture, provenance **1 direct / 4 caches**, absence de paire Spot OKX confirmée, différenciation du perpétuel AKE/USDT et du carnet non synchronisé.
   - [Données structurées 08B](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08B_AKE_AKEDO_OKX_SPOT_FUTURES_ORDERBOOK_AND_CHART_OBSERVATIONS_2026_11_07.json) : lectures d'écran, empreintes des captures et statut des sources.

[Manifeste des preuves et empreintes SHA-256](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08_08B_EVIDENCE_MANIFEST_2026_11_07.json) : énumère les deux ZIP d'origine et leurs images, **sans les exposer publiquement**.

## Limites et décisions

- Les rapports conservent les **faits visibles** dans les captures de l'utilisateur, pas des prix live vérifiés.
- Le protocole 08 fournit des résultats **descriptifs**, pas un backtest de stratégie ; les sous-échantillons sont modestes et les paramètres non validés hors échantillon.
- La documentation 08B constate un carnet affiché « AKE/? · non synchronisé » ; l'absence d'une paire Spot OKX est **plausible mais pas une preuve du code**.
- Les deux ZIP de captures complets ont été livrés dans le fil d'origine, **pas transférés dans ce dépôt public**. Leurs empreintes permettent un rapprochement ultérieur des copies originales.
- Les JSON sont de la donnée documentaire et **ne sont pas des profils importables**.
- Aucune nouvelle configuration, logique Oracle, contrat Spot ou perpétuel, stratégie automatique ou ordre financier n'est créé.
- Les sources BTC/USDT historiques de la recherche 08 ne sont pas les données BTC/USDC OKX ni les tokens de la capture 08B.

**Point d'arrêt :** archivage documentaire de 08 et 08B. Prochaine étude : qualité temporelle par actif (provenance directe/cache et synchronisation) en lecture seule, seulement si demandée.
