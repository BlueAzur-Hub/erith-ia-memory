# Audit du workspace réel — 17 novembre 2026

## Provenance

Archive propriétaire étudiée : `seven_heaven_strategy_lab(5).zip`.

SHA-256 de l'archive reçue :

`13fc3563904526848a0c51d294ac8ea3083cd52b85fbe4502f07f1b40bad978f`

L'archive a été étudiée comme photographie de la clé ; aucun fichier original n'a été modifié.

## État avant rebuild

Le workspace contient 98 fichiers :

- 43 fichiers de sources/données vérifiées dans `datasets/`, `okx_sources/` et `binance_monthly_sources/` ;
- 1 profil ;
- 0 StrategySpec sauvegardé ;
- 28 résultats PAPER ;
- 26 comparaisons ;
- plusieurs snapshots OKX successifs utiles comme sources, mais de nombreux résultats/comparaisons proviennent d'étapes de développement antérieures.

Le profil historique unique est `EMA 12/32 1h`, capital 10 000, source BTC/USDC 720 bougies.

## Décision

Les sources sont de la **matière scientifique** ; les résultats/profils/comparaisons sont de l'**état généré**. Ils ne doivent plus être traités de la même manière.

Workspace Rebuild V1 :

- préserve les sources byte-for-byte ;
- archive l'ancien état généré ;
- reconstruit un état canonique minimal via les endpoints réels du Lab ;
- conserve Scientific/Research éphémères.

## État canonique reconstruit

Sur une copie exacte du workspace propriétaire :

- sources : **43/43 fichiers SHA-256 identiques avant/après** ;
- Source Catalog : 22 sources locales vérifiées ;
- profils : 12 ;
- StrategySpecs : 12 ;
- résultats PAPER : 12 ;
- comparaisons : 6 ;
- Scientific : 7 familles rejouées en mémoire, aucune écriture ;
- Research filtres EMA : 4 variantes / 2 fenêtres, aucune écriture.

### Références principales obtenues

BTC/USDC OKX 90 j · 1h :

- EMA 10/30 : -4,93014 % ;
- Bollinger 20/2 : -6,46895 % ;
- Donchian 55/20 : +5,21038 % ;
- DCA 1440 min / 50 : -6,76412 % ;
- Hold 50 % : +4,28958 % ;
- Hold 100 % : +8,57916 % ;
- Cash : 0 %.

Contrôles de régime :

- Donchian BTC/USDC 90 j · 4h : -11,44870 % ;
- Donchian ETH/USDC 90 j · 1h : -17,65070 % ;
- Donchian BTC/USDT OKX 90 j · 1h : -6,96279 % ;
- Donchian BTC/USDT Binance janvier 2020 · 1h : +15,05339 % ;
- EMA BTC/USDT Binance janvier 2026 · 1m : -92,20371 %.

Ces écarts sont précisément la raison scientifique d'ouvrir ensuite Historical Vault : une règle ne doit pas être jugée sur une seule période ou un seul actif.

## Reproductibilité

Plan : `data/workspace_rebuild_plan_v1.json`.

Outil : `tools/workspace_rebuild_v1.py`.

Dry-run :

`python tools/workspace_rebuild_v1.py --workspace workspace`

Exécution explicite :

`python tools/workspace_rebuild_v1.py --workspace workspace --execute`

Le script refuse de reset si une source requise manque et vérifie après rebuild que les SHA-256 des sources n'ont pas changé.
