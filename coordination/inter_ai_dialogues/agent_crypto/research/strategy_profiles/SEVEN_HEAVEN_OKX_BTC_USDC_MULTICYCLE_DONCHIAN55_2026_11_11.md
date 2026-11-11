# Seven Heaven — Qualification pluriannuelle OKX BTC/USDC et Donchian 55

**Étude 11 novembre 2026 — recherche uniquement, aucun ordre.**

## Source, période et état réel

- Source : OKX, endpoint public /api/v5/market/history-candles, instrument BTC-USDC, bougies 1Dutc (confirm=1 seulement).
- Objectif fixé avant les résultats : disposer de l'amorçage à partir du 1er janvier 2022, puis étudier sans changer les paramètres Donchian.
- Fenêtre alternative déclarée à l'avance si 2022 n'est pas accessible : amorçage au 1er janvier 2023.
- Jusqu'à 25 pages de 100 bougies; aucune interpolation de date manquante.
- Source capturée : 2026-11-11T15:21:01.599267+00:00
- Statut vérifié : **INSUFFICIENT_CONTIGUOUS_2022_OR_2023_HISTORY**.
- Première journée OKX trouvée : 2025-08-21. Dernière : 2026-11-10.
- Nombre de journées clôturées uniques : 447.
- Journées manquantes pour couvrir du 1er janvier 2022 au 10 novembre 2026 : 1328.
- Contrôle avec la précédente série OKX 2025–2026 : 447 journées en commun; 0 divergences, 0 journées précédemment vues mais absentes.
- Source Binance de comparaison : archive BTC/USDT figée, SHA-256 812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd.

## Qualité des archives ponctuelles

- 2022-06-15: REST 1Dutc absent. 
- 2025-02-15: REST 1Dutc absent. 

Les archives officielles minute de 2023 et 2024 comportent des marqueurs confirm=0 dans les échantillons déjà audités : elles ne sont PAS artificiellement converties en données confirmées.

## Résultats — si série continue effectivement qualifiée

**AUCUN NOUVEAU BACKTEST PLURIANNUEL VALIDÉ.** Les conditions de continuité et de cohérence entre sources n'ont pas toutes été satisfaites.
Ne pas remplacer les données manquantes par Binance, CoinGecko ou des archives minute non qualifiées.

## Causes de blocage

- Erreur API : None
- Divergences avec la série OKX précédemment vérifiée : []
- Dates absentes de la série OKX précédente : []
- Disponibilité des fenêtres prédéclarées : [{'warmup_start': '2022-01-01', 'study_start': '2022-04-01', 'ready': False, 'missing_count': 1328, 'first_missing_days': ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', '2022-01-05', '2022-01-06', '2022-01-07', '2022-01-08', '2022-01-09', '2022-01-10', '2022-01-11', '2022-01-12', '2022-01-13', '2022-01-14', '2022-01-15', '2022-01-16', '2022-01-17', '2022-01-18', '2022-01-19', '2022-01-20']}, {'warmup_start': '2023-01-01', 'study_start': '2023-04-01', 'ready': False, 'missing_count': 963, 'first_missing_days': ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05', '2023-01-06', '2023-01-07', '2023-01-08', '2023-01-09', '2023-01-10', '2023-01-11', '2023-01-12', '2023-01-13', '2023-01-14', '2023-01-15', '2023-01-16', '2023-01-17', '2023-01-18', '2023-01-19', '2023-01-20']}]

## Limites et interprétation

- Un résultat in-sample, même sur plusieurs années, n'est pas une validation prospective aveugle ; paramètres fixés avant cette nouvelle étude, mais Bitcoin déjà connu.
- BTC/USDT Binance n'est pas BTC/USDC OKX. Comparer dates, frais et résultats, sans confondre les devises.
- Les règles de sortie des backtests ne donnent aucune consigne pour les actifs de l'utilisateur ; Swing Trading / Buy & Hold personnel inchangé.
- Pas de contrôle de l'exécution réelle, de la profondeur historique ni de la disponibilité des exchanges à la minute.
- Le périmètre ne touche ni le Trader, ni Administrator, ni le Bridge, ni les identifiants OKX.

## Reproduction

- Programme : SEVEN_HEAVEN_OKX_BTC_USDC_MULTICYCLE_DONCHIAN55_2026_11_11.py
- Données et preuves : SEVEN_HEAVEN_OKX_BTC_USDC_MULTICYCLE_DONCHIAN55_2026_11_11.json
- Normalisation d'archives isolées : SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_UTC_NORMALIZER.py (chantier séparé).
