# Workspace Rebuild V1 — Reset reproductible du laboratoire

## Pourquoi

Le `workspace/` de développement finit naturellement par mélanger : sources vérifiées, anciennes simulations, comparaisons intermédiaires, profils historiques et artefacts de validation. Cette couche ne doit pas devenir une archive indéfinie des essais de développement.

## Contrat

Le rebuild sépare deux familles :

**Préservé byte-for-byte**
- `datasets/`
- `okx_sources/`
- `binance_monthly_sources/`
- `catalog_sources/` lorsque présent

**Sauvegardé puis reconstruit**
- `profiles/`
- `strategy_specs/`
- `results/`
- `comparisons/`

Le script est en **dry-run par défaut**. Aucune suppression n'a lieu sans `--execute`.

## Sécurité

Avant tout reset, le script :
1. ouvre le vrai serveur local Seven sur un port loopback temporaire ;
2. relit le Source Catalog ;
3. refuse le rebuild si une source requise manque ;
4. calcule l'inventaire SHA-256 des fichiers source ;
5. sauvegarde l'ancien état généré dans `workspace_rebuild_backups/*.zip` ;
6. reconstruit via les endpoints réels `/api/profiles`, `/api/strategy-specs`, `/api/run` et `/api/compare` ;
7. rejoue Scientific/Research et vérifie qu'ils n'écrivent aucun fichier ;
8. refuse le résultat si un seul fichier source a changé.

## Matrice canonique V1

- BTC/USDC OKX 90 j · 1h : EMA, Bollinger, Donchian, DCA, Hold 50 %, Hold 100 %, Cash.
- BTC/USDC OKX 90 j · 4h : Donchian.
- ETH/USDC OKX 90 j · 1h : Donchian.
- BTC/USDT OKX 90 j · 1h : Donchian.
- BTC/USDT Binance janvier 2020 · 1h : Donchian.
- BTC/USDT Binance janvier 2026 · 1m : EMA.
- Comparaison des 7 références sur chacun de ces six régimes source/timeframe.
- Scientific sur les 7 familles du benchmark BTC/USDC 90 j 1h.
- Research filtres EMA sur ce même benchmark ; aucune écriture workspace pour ces deux études.

Le plan exact est versionné dans `data/workspace_rebuild_plan_v1.json`.

## Commandes

Prévisualiser :

```bash
python tools/workspace_rebuild_v1.py --workspace workspace
```

Exécuter :

```bash
python tools/workspace_rebuild_v1.py --workspace workspace --execute
```

Le rebuild ne télécharge aucune donnée et ne passe aucun ordre. Les sources nécessaires doivent déjà être vérifiées dans le workspace.
