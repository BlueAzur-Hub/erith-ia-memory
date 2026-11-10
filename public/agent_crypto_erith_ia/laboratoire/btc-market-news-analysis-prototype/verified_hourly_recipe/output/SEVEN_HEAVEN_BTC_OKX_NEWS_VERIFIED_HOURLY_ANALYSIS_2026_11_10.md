# Seven Heaven — Raccordement automatique des preuves horaires OKX et des actualités

**Période** : 5 et 8 novembre 2026, heures UTC · **Instrument** : `BTC-USDC`, OKX Spot, `1H`.
**Statut** : recette historique reproductible, source publique figée, lecture seule ; ni explication causale certifiée ni conseil financier.

| Donnée | 5 novembre | 8 novembre |
|---|---:|---:|
| Bougies clôturées | 24 | 24 |
| Clôture du jour (USDC/BTC) | 75 994,3 | 74 774,4 |
| Variation jour (ouverture → clôture) | -5,524 % | -1,314 % |
| Pic de volume (UTC) | 15:00 | 21:00 |
| Volume du pic (BTC) | 351,967 | 258,135 |
| Variation du pic | -2,86 % | -2,117 % |
| Part du volume journalier | 20,07 % | 25,97 % |
| Articles datés retenus | 5 | 1 |
| Rapprochements calculés après publication | 5 | 1 |

## Chronologie et prudence de l'analyseur

### 2026-11-05 — pic 15:00 UTC
- Volume du pic : **351,967 BTC** ; baisse horaire ouverture→clôture **-2,86 %**.
- Source brute : `okx-hourly-collector/evidence/btc-usdc-okx-1h-2026-11-05.json` ; empreinte SHA-256 `fd2064d06f0e11d7b5fea392081e241638f18673cb8ca1ffefbba4d57eac6aaa`.
- 5 événement(s) appariés avec des bougies clôturées après publication ; 0 non appariés. Cela n'établit aucun lien causal.
- Articles et heure de publication (ce n'est pas l'heure certaine de l'événement évoqué) :
  - 11:30 UTC — Bitcoin holds above $80,000 after Wednesday’s jump as injective rallies on staked ETF listing (hors fenêtre du pic) ; [source](https://www.coindesk.com/markets/2026/11/05/bitcoin-holds-above-usd80-000-after-wednesday-s-jump-as-injective-rallies-on-staked-etf-listing).
  - 05:13 UTC — Bitcoin holds above $80,000 as Zcash jumps 12% in post-election crypto rebound (hors fenêtre du pic) ; [source](https://www.coindesk.com/markets/2026/11/05/bitcoin-holds-above-usd80-000-as-zcash-jumps-12-in-post-election-crypto-rebound).
  - 08:22 UTC — Bitcoin, Ether ETFs draw $128M as crypto rebounds after midterms (hors fenêtre du pic) ; [source](https://cointelegraph.com/markets/bitcoin-ether-etfs-turn-green-post-election-rebound).
  - 12:25 UTC — James Wynn maintient sa prévision de krach de Bitcoin malgré de nouveaux flux entrants sur les ETF - BeInCrypto (hors fenêtre du pic) ; [source](https://news.google.com/rss/articles/CBMiekFVX3lxTE1YMzlXS2JIYWVBSlpFcXhzckR5UXhySjNVMzFtTGNzQmVja0NKMU9RNjYzWFVzZnZESi11SmJUYUYyY2k3WnpRSGw4bE96d21rdzRVbXU1ZlJxUG9xQkpScFhYWHQ1Y0NlUHFBMXZLRWZ0YTZNT0JwYl9B?oc=5).
  - 16:29 UTC — Bitcoin Erases Election Rally as AI Stocks Plunge, $428 Million in Crypto Longs Get Wiped Out (publié après l'heure du pic) ; [source](https://decrypt.co/382612/bitcoin-erases-election-rally-ai-stocks-plunge-428-million-crypto-longs).
  - **Aucun article qualifié du flux figé n’est publié à proximité immédiate avant ou pendant l’heure du pic.** Ne pas inventer de déclencheur.
- EMA 5/13/34 de cette seule série de 24 heures : 75 992,25 / 76 950,33 / indisponible USDC ; les EMA ne constituent pas une prédiction.

### 2026-11-08 — pic 21:00 UTC
- Volume du pic : **258,135 BTC** ; baisse horaire ouverture→clôture **-2,117 %**.
- Source brute : `okx-hourly-collector/evidence/btc-usdc-okx-1h-2026-11-08.json` ; empreinte SHA-256 `67254e161da5143784dcac915ef13eb07ec690867f35e13fab4344b5a48c03ca`.
- 1 événement(s) appariés avec des bougies clôturées après publication ; 0 non appariés. Cela n'établit aucun lien causal.
- Articles et heure de publication (ce n'est pas l'heure certaine de l'événement évoqué) :
  - 11:14 UTC — Les ETF bitcoin perdent 412 M$ tandis que les ETF ethereum enregistrent des sorties de 93 M - KuCoin (hors fenêtre du pic) ; [source](https://news.google.com/rss/articles/CBMinAFBVV95cUxNWTliYVAyY0ttNS1MR2FYRllRY3FHYkpzdnYwY1RrMXBOLXFaTnB3c0VLN0swSmdfUkkwVEpJb3J5bWpqVlpKTjd4bmpCQjJxTGxZSjluVVhfd0JGaDZZZ0k2QzNqc0xrSHMyU2tBWTFwdVBDbzRrb3RhaU5NSlE4VmFUeWFzTGc0TzBWVTZ1SWVCZTJ3RmI4OXF2NEw?oc=5).
  - **Aucun article qualifié du flux figé n’est publié à proximité immédiate avant ou pendant l’heure du pic.** Ne pas inventer de déclencheur.
- EMA 5/13/34 de cette seule série de 24 heures : 74 886,13 / 75 302,41 / indisponible USDC ; les EMA ne constituent pas une prédiction.

## Limites des preuves

- **Données Spot OKX** : les bougies et leurs volumes BTC ne permettent pas de mesurer les liquidations de positions dérivées ; l’hypothèse de ventes forcées nécessite une source séparée.
- **ETF** : les flux journaliers ne sont ni fournis ni recalculés par ce programme ; un titre d’article ne devient jamais un montant vérifié.
- **Horaires** : le rapprochement est fait sur les publications d’articles ; un article écrit après le pic ne peut pas prouver un déclenchement avant sa publication.
- **Indicateurs** : l’EMA 34 sur une seule journée de 24 bougies reste indisponible ; ne pas présenter cette lecture comme un historique continu.
- **Provenance** : les SHA-256 vérifient l’identité des fichiers GitHub, pas une signature des réponses par OKX.
- **Sécurité** : aucun compte, aucune clé, aucune transaction ni modification de l’Interface, du Trader ou du Bridge.

## Reproduction

- Lire `okx-hourly-collector/evidence/index.json` et vérifier les deux SHA-256 publiés.
- Lire le lot de nouvelles figé `verified_hourly_recipe/SEVEN_HEAVEN_BTC_OKX_NEWS_FROZEN_2026_11_05_08.json`, extrait de `data/news/latest.json` dont le Git blob est `3edeec8bc719f72929d2d9f7b282157da7327b74`.
- Exécuter le programme en Node.js sans accès réseau. Il refuse toute divergence d’instrument, d’heure, de clôture et d’empreinte.
- Les résultats sont descriptifs et rétrospectifs. Ne pas les transformer en signaux de trading.

*Seven Heaven — séparation stricte fait, hypothèse, inconnu. Aucun ordre réel.*
