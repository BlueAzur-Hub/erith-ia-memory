# R7 — Comparateur BTC multi-sources · Seven Heaven

**Point de départ validé :** BTC calibré dans l'Administrator 40.6.624, Graphique Ligne CoinGecko USD 24 h, Graphique Bougies OKX BTC-USDC 1j / 5m, lecteur d'archives Binance Spot BTCUSDT (R6) validé. Le Market Core 38.15.11 et le Top 5 canonique restent protégés.

## Une seule section dans le Coffre existant

La section repliable `R7 · Comparer BTC` apparaît sous R6 dans `administrator/historical-vault.html`. Le bouton « Comparer les sources BTC » effectue trois lectures **sur demande**, sans modifier l'Interface :

1. **CoinGecko, USD** : dernier snapshot public de `data/crypto/latest.json` (id bitcoin, prix `priceUsd`, horodatage `lastUpdated`), statut `MARKET_SNAPSHOT` : ce n'est pas une bougie.
2. **Binance Spot, USDT** : dernière clôture réelle de `BTCUSDT` dans l'archive R6 (5m, 24h) déjà validée SHA-256, schéma, chronologie, série et index ; statut `ARCHIVED_CANDLE_CLOSE` : pas une cotation live.
3. **OKX, USDC** : ticker public BTC-USDC si le Backend local répond au GET explicite `http://127.0.0.1:8790/okx-public?endpoint=ticker&instId=BTC-USDC` ; statut `SPOT_TICKER`. Ni Backend privé, ni ordre, ni accès à un portefeuille. Si indisponible, afficher `UNAVAILABLE` ; ne pas inventer de prix.

La valeur OKX affichée est un **ticker**, pas nécessairement la bougie sélectionnée sur le Graphique 5m ou 1j. Les trois sources sont horodatées, leurs devises restent explicites.

## Sécurité et intégrité

- La comparaison ne calcule **aucun écart de marché** ni arbitrage USD/USDT/USDC. Pas de conversion cachée en EUR, pas de signal trading.
- Seuils d'âge descriptifs : `STALE` au-delà de 15 min pour CoinGecko/Binance et de 3 min pour OKX ; ce n'est pas un label de fiabilité.
- Aucun démarrage automatique du comparateur, aucune périodicité. L'appel au Backend est déclenché uniquement par le bouton ; `GET` public sans identifiant, timeout borné 6 secondes si disponible.
- **Non modifiés** : `administrator/app.js`, `market-microscope-candles.js`, tous les graphes, valeurs canon Top 5, Market Core, Trader, Bridge, IndexedDB et archives R2/R4.
- La page conserve ses scripts précédents à l'identique. Module : `administrator/js/historical-btc-comparator.js` (nom stable).

## Vérification

GitHub Actions exécute tests Node 22 hors réseau sur le snapshot CoinGecko et les archives OHLCV **réelles** du dépôt avec un mock de ticker OKX. Cas testés : aucun chargement sans clic, trois devises distinctes, échec OKX indépendant, rejet d'un snapshot CoinGecko dont la devise a été altérée.

**Validation Firefox F11 attendue** : ouvrir le Coffre, déplier R7, cliquer « Comparer les sources BTC » et relever trois cartes ; OKX peut afficher « Indisponible » si le Backend local est arrêté. Revenir au Graphique, tester Ligne puis Bougies 5m/1j, sans régression.

**Étape suivante :** seulement après validation terrain R7, réfléchir à l'utilisation facultative des archives pour des instruments explicitement compatibles dans le Graphique. Aucun remplacement du moteur natif par défaut.
