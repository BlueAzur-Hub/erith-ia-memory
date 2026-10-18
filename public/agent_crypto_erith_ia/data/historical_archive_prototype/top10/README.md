# Coffre Seven Heaven · observations de prix Top10 authentiques

Ces relevés proviennent des **journaux publics CoinGecko du Market** déjà archivés dans `data/history/`. Ils ne sont **pas** des chandelles OHLCV Binance/Bitget/OKX et ne se substituent pas aux bougies du lecteur historique.

| Tranche UTC | Relevés | Prix EUR/USD observés | Statut |
|---|---:|---:|---|
| [01–07 octobre](./2026-10-01_2026-10-07/manifest.json) | 30 | 300 | Archive initiale inchangée |
| [08–18 octobre](./2026-10-08_2026-10-18/manifest.json) | 48 | 480 | Extension vérifiée, journée du 18 partielle |
| **Total** | **78** | **780** | Deux tranches sans chevauchement |

La [nouvelle tranche](./2026-10-08_2026-10-18/observations.json) garde **les dix identifiants CoinGecko figés au 7 octobre**, et leur rang observé à chaque relevé. Les **sept variations 24 h absentes** sont conservées à `null`, sans substitution. Les prix eux-mêmes sont présents et positifs pour les 480 enregistrements.

Le `volume_24h_eur` est une statistique glissante sur 24 h : il ne peut pas être additionné pour obtenir le volume réellement échangé entre deux relevés. Les observations sont irrégulières dans le temps et ne démontrent ni une séance complète ni une couverture depuis la création du jeton.

**Reproductibilité :** le test `tests/agent_crypto_vault_top10_append.cjs` relit les onze journaux d'origine, contrôle leurs empreintes Git pour les journées closes et compare toutes les valeurs à la nouvelle archive. Pour le 18 octobre encore ouvert, il vérifie les premières lignes figées à la publication, autorisant seulement de nouveaux relevés ajoutés ensuite. Aucun accès à une clé, au Trader, au Bridge ou à la base Firefox.

Les **bougies Spot archivées en USDT** sont un autre jeu de données, accessible depuis [le Coffre utilisateur](../../../administrator/historical-vault.html) et les indices `top250_multisource_coverage` / `top250_multiresolution_sources`. **Ne pas additionner leurs compteurs avec les 780 observations de prix.**
