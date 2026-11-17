# Historical Vault V2 — bundle canonique BTC/ETH 2024–2025

Cette DEV ajoute quatre années horaires **réellement installables sans re-télécharger 24 ZIP mensuels** : BTC/USDT 2024, BTC/USDT 2025, ETH/USDT 2024 et ETH/USDT 2025.

Les quatre fichiers `.json.gz` proviennent du répertoire partagé `calendar_year_hourly_shards`. Chaque shard est dérivé des ZIP mensuels Binance Spot 1m déjà vérifiés, conserve les SHA-256 source mois par mois, puis est lui-même verrouillé par SHA-256. À l'installation, le Lab revalide le hash du shard, son schéma, ses 12 mois, la continuité 1h, les OHLCV, puis produit un `bars.csv` et un `manifest.json` dans `workspace/catalog_sources`.

Aucun compte, aucune clé API et aucun ordre réel ne sont utilisés. Les sources installées restent PAPER-only.

Le chemin réseau V1 reste disponible pour BNB/XRP/SOL 2024/2025 jusqu'à leur ajout dans un prochain bundle.
