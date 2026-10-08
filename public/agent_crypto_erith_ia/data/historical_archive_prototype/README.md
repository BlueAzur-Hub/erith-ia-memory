# Seven Heaven — Prototype d'archive Top 10 (R1)

Ce prototype **réutilise les relevés historiques du Market Top 50** présents dans `data/history/`; il ne génère aucune chandelle OHLCV et ne récupère aucun prix externe. Les dix actifs sont fixés au dernier snapshot du **7 octobre 2026**; les variations de rang sont conservées dans chaque relevé. Les stablecoins font partie du classement par capitalisation.

## Contenu

- `top10/2026-10-01_2026-10-07/observations.json` : 30 relevés irréguliers, 10 actifs par relevé, prix EUR/USD, variation 24 h, volume et rang.
- `top10/2026-10-01_2026-10-07/manifest.json` : couverture, provenance GitHub, limites et métriques.
- `tools/build_historical_top10_prototype.py` : script standard Python, hors réseau, pour reconstituer ces archives et générer aussi `observations.json.gz` et un vrai rapport de compression.

## Lecture et sécurité

Les champs `t`, `snapshot_id`, `source_file` lient les observations aux journaux existants. `prices[i]` correspond à `assets[i]`, avec les colonnes précisées dans le JSON. **La cadence est irrégulière (30 observations sur 7 jours) : aucune fausse chandelle ni interpolation.** Ne pas l'utiliser comme série OHLCV pour un backtest. L'Interface, le Trader, le Market Core, les archives sources et l'IndexedDB ne sont pas modifiés.

## Reconstruction locale, facultative

```bash
python public/agent_crypto_erith_ia/tools/build_historical_top10_prototype.py --through 2026-10-07 --days 7 --output-dir /tmp/agent-crypto-top10-prototype
```

Sous Windows, remplacer `/tmp/...` par un dossier de sortie dédié. Aucun script ne publie les données automatiquement.

## Étape suivante

Comparer la couverture et les sources, ajouter le vrai *backfill* OHLCV Binance/OKX/CoinGecko selon les droits et quotas, calculer le coût/volume, puis choisir un stockage archive hors du dépôt principal si l'échelle 250/1000 devient trop importante.
