# Seven Heaven — ZEC / Zcash : recherche Spot du Top 10

**9 novembre 2026 — rang 7 du Top 10 canonique du projet — dossier de recherche et lecture seule.**
Complément de la monographie ZEC déjà présente dans la bibliothèque Top 50 ; ne remplace ni le snapshot du 8 novembre ni sa fiche originale.

## 1. Marché commun BTC et ZEC

Source figée : [CoinGecko — fichier MASTER du 09/11](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), blob Git `4f1f33162f2bf729f5772562e15a60fdb7017075`, généré à **07:53:59 UTC**, actifs actualisés à **07:52:59 UTC**.

- **ZEC** : 1 194,1671 USD ; 24 h **−5,54612 %**, 7 jours **−4,7574 %**, 30 jours **−1,1536 %** ; rang CoinGecko **#10** dans cet instantané.
- **BTC** sur le même snapshot : 24 h −2,57318 %, 7 jours −5,1455 %, 30 jours −10,2806 %.
- Comparaison ZEC moins BTC : **−2,97294 points** sur 24 h, **+0,3881 point** sur 7 jours, **+9,1270 points** sur 30 jours.

ZEC était plus faible que BTC sur 24 h, mais relativement moins baissier sur 7 et 30 jours. Ce n'est pas un signal de trading. Les prix CoinGecko sont en **USD**, pas les prix de carnet OKX en **USDC**.

## 2. Carnets OKX ZEC-USDC : collecte élargie du Coffre

J'ai contrôlé les sept fichiers publics du dossier `data/crypto/case-market-hourly/`. Ils contiennent **85 instantanés publics OKX Spot ZEC-USDC**, chacun avec cinq niveaux d'achat et cinq niveaux de vente, avec `fill_proven=false`, sans ordres réels.

| Source du Coffre | Relevés ZEC à cinq niveaux | Blob Git |
|---|---:|---|
| [22 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-22.json) | 7 | `275eecee85a1990ef120d736117423672f3fee68` |
| [23 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-23.json) | 13 | `84cbde707131a4850f72295999dd1dbd957a2d47` |
| [24 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-24.json) | 17 | `5d2f49aecbf348d202d86c9f32e8929e0c39f32c` |
| [25 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-25.json) | 15 | `81d44bb5e6781b9915cf90b64081f154fec13eaf` |
| [26 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-26.json) | 13 | `58c02af4c1d006695c55a0559c6f04bd8942175f` |
| [27 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-27.json) | 15 | `6e23dfe1a8dab5ba25e05b308408f7f940807499` |
| [28 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-28.json) | 5 | `2397f13e5c858ab533b05f395871edd971cc96b7` |

Fenêtre totale du **22/10/2026 à 05:37:40 UTC** au **28/10/2026 à 08:34:23 UTC**. Les 85 instants ne constituent **pas** une série continue.

| Statistiques de spread sur ces 85 relevés | Mesure |
|---|---:|
| Minimum | 0,08 point de base |
| Médiane | 2,92 points de base |
| Maximum | 9,79 points de base |
| Dernier meilleur bid, 28/10 08:34:23 UTC | 1 316,98 USDC/ZEC |
| Dernier meilleur ask, même instant | 1 317,23 USDC/ZEC |
| Quantité au premier bid / ask | 2,57968 / 0,30781 ZEC |

**Attention au périmètre :** le [dossier ZEC préexistant](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/zcash.json), blob `50b64b080aad9599fadcb44b1069be1767821f3b`, résumait seulement **17 relevés du 24 octobre**, dont la médiane était **1,65 pb**. La médiane de 85 relevés n'est pas contradictoire : elle couvre d'autres dates. Le même ancien dossier signale **36 intervalles 15 minutes absents** d'un échantillon de 59 bougies closes ; ce n'est pas une continuité reconstituée.

Le précédent scénario rétrospectif PAPER (premier ask et dernier bid du 24/10, hypothèses de frais de 0,10 % ou 0,20 % par côté) est **un exercice descriptif a posteriori**. Aucune entrée préalable ni aucun prix rempli n'est certifié ; il ne faut pas le présenter comme un rendement de stratégie.

### Règles observées, historiques uniquement

Dans les 85 sources d'octobre : `minSz = 0.001 ZEC`, `lotSz = 0.00001 ZEC`, `tickSz = 0.01 USDC`. **Ni l'état `live` actuel, ni les frais du compte, ni l'accès régional ne sont revalidés le 9 novembre.**

## 3. Historique natif et protocole

L'[index historique MASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json), SHA `71b25904a652fbd8cdea1ac6bb942c9789e930c3`, référence **74 mois** et **3 248 640 bougies natives 1 minute** `ZECUSDT` sur Binance Spot (**USDT**, distinct des carnets OKX **USDC**). Les ZIP, lacunes et checksums de tous les mois n'ont pas été revalidés pendant ce travail.

La confidentialité cryptographique de Zcash distingue adresses transparentes et protégées ; l'activité invisible dans des transactions protégées ne se déduit pas simplement de statistiques de volumes publics. [Documentation Zcash](https://zcash.readthedocs.io/en/latest/rtd_pages/addresses.html).

## 4. Chronologie des annonces OKX, sans confusion régionale

- [Retrait de ZEC-USDC annoncé pour janvier 2024](https://www.okx.com/fr/help/okx-to-delist-several-spot-trading-pairs-12-29).
- [Annonce de ZEC/USDT au Spot en novembre 2025](https://www.okx.com/fr/help/okx-to-list-zcash-zec-for-spot-trading).
- [Catalogue public Europe des paires USDC incluant ZEC](https://www.okx.com/en-eu/markets/spot/usdc-all).
- [Regroupement de frais de juillet 2026 mentionnant ZEC-USDC](https://www.okx.com/en-gb/help/important-notice-token-pairs-adjustment).

Ce sont des preuves **datées** de décisions ou de présentation de marchés. Le carnet courant, le `state`, les droits du compte et les frais ne sont pas déduits d'une annonce.

## 5. Qualification, méthode et prochaine preuve

**Acquis :** identité ZEC, contexte de confidentialité, snapshot de marché du 9 novembre, 85 carnets publics horodatés d'octobre, règles historiques, dossier original de 17 relevés et archives natives indexées.

**À vérifier :** carnet et état Spot actuels, accès du compte France, frais maker/taker et minimum notionnel, ZIP des périodes utilisées et lacunes des bougies. Une capture ancienne ne garantit pas une exécution à la taille voulue.

**Décision : RECHERCHE DOCUMENTÉE ; PAS DE CERTIFICATION PAPER.** Aucune opération réelle, aucune modification du Bridge R31, de l'Administrator ou du Trader.

**Étude croisée du 09/11/2026 :** [ZEC/USDC vs HYPE/USDC — 58 couples horodatés, spreads, profondeurs et coûts purement fictifs](./SEVEN_HEAVEN_AGENT_CRYPTO_ZEC_HYPE_SPOT_BOOK_COMPARATIVE_RESEARCH_2026_11_09.md). Les observations datent d'octobre ; aucune exécution ni certification PAPER.
