# BTC/USD — Étude historique annuelle (non canonique)

**Statut : candidature de données à valider, dépôt isolé.**

- 15 fichiers annuels, **2012–2026 (2026 jusqu'au 9 septembre)** ; **5 366 bougies OHLCV 1 jour**, sans dates manquantes dans la série source.
- Cotation **BTC/USD Bitstamp**, ne pas confondre avec **BTC/USDT Binance**.
- Données agrégées issues du miroir communautaire https://github.com/alessiostomeo/btc-cycle-data ; source versionnée Git blob `33b0f78030ccf6f3070ea25c441145f51877a3eb`.
- Ce n'est **pas** une archive primaire de bougies 1 minute ; la série source est dérivée d'un miroir 1m pouvant combler certaines minutes sans activité avec des bougies plates.
- Vérifications : dates UTC, 1 jour entre lignes, valeurs numériques, OHLC, volumes, comparatif indicatif Coin Metrics (résultats et anomalies dans le manifeste).
- **4 dates en 2012 au-delà de 10 % d'écart de prix** par rapport à Coin Metrics. Cela ne prouve pas que les bougies soient fausses : Coin Metrics PriceUSD et clôture Bitstamp diffèrent de méthodologie et de marché.
- Pas d'utilisation pour exécution de transactions ni de substitution à l'archive canonique tant que les contrôles de provenance n'ont pas été achevés.

## Attribution et droits

Ce jeu de données est dérivé de https://github.com/ff137/bitstamp-btcusd-minute-data, dont la portion historique bulk est issue de **Zielak (mczielinski), Bitcoin Historical Data, Kaggle**, version 706, licence **CC BY-SA 4.0** : https://creativecommons.org/licenses/by-sa/4.0/ . Attribution recommandée : *Zielak (mczielinski), Bitcoin Historical Data, Kaggle* ; chaîne de transformation via ff137 et alessiostomeo.

Les **valeurs Coin Metrics** ne sont pas recopiées ; la comparaison n'est fournie que sous forme d'indicateurs et de dates d'alerte, la source imposant **CC BY-NC 4.0** : https://github.com/coinmetrics/data .

Ne pas fusionner ce jeu de données automatiquement sur main sans décision de provenance et licence, sans comparaison des données minute primaires et sans accord explicite.
