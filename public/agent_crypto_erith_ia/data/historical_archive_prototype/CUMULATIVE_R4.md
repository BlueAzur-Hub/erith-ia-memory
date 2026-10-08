# R4 — Seven Heaven · Conservation OHLCV incrémentale
État : pilote borné ; ni automate quotidien ni raccordement au Graphique.

## Propriétaires protégés
- Administrator `40.6.624` ; Market Core `38.15.11` ; Trader ; Bridge ; fichiers R2 historiques ; caches IndexedDB.
- Aucune commande de trading, aucune clé privée, aucune conversion implicite USDT → USD/EUR.

## Source et format
- **Source initiale immuable :** `ohlcv_spot_pilot/ohlcv_top10_2026-10-08.json.gz` (R2, SHA du manifeste).
- **Ajouts immuables :** `ohlcv_spot_pilot/deltas/delta_YYYYMMDDTHHMMSSZ.json.gz`, contenant uniquement des chandelles clôturées et postérieures au dernier `open_time_ms` conservé.
- **Index :** `ohlcv_spot_pilot/index.json` (manifestes, SHA-256, nombre et dernières dates pour chaque actif/période).
- Clé logique unique : `Binance Spot + paire + intervalle + open_time_ms`.
- Intervalles du pilote : 5 min (24h), 1 h (7j), 4 h (30j).
- Jusqu'à **240 chandelles nouvelles par série et exécution**, au plus 21 séries (7 actifs × 3 périodes). Le dépassement de la fenêtre est repris aux exécutions suivantes, pas ignoré.
- Le collecteur reconstruit et recalcule l'état à partir de **tous les fichiers physiques** puis compare à l'ancien index. Il refuse les doublons, trous, timestamps et données OHLC incohérents. Au moindre échec réseau, la publication n'a pas lieu.

## Déclenchement
- Première exécution lors de l'ajout du workflow/script sur `main` ; ensuite **manuel via GitHub Actions**.
- Pas de collecte automatique quotidienne avant la validation humaine.
- Exécution sans nouveaux points : sortie `NOOP`, pas de nouveau commit ni de fichier.
- Les tests automatisés utilisent des chandelles synthétiques **en mémoire uniquement** ; les archives publiées contiennent exclusivement les données réelles Binance Spot.

## Règle de passage
Avant de démarrer le Top 50 : vérifier l'index R4, la cohérence entre R2 et les deltas, puis effectuer une seconde exécution pour prouver l'idempotence / absence de doublons ; évaluer stockage / quotas GitHub Pages.
