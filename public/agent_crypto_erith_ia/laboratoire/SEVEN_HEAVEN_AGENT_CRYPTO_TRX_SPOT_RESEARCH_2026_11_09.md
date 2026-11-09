# Seven Heaven — TRON (TRX) : recherche du Top 10 et état des preuves OKX

**9 novembre 2026 · dossier documentaire en lecture seule · rang de recherche n°6 du Top 10 canonique.**
Complète la [monographie existante](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md), sans en remplacer le rang ou le snapshot historiques. Voir le [registre machine JSON](../data/crypto/research/seven_heaven_trx_spot_evidence_2026_11_09.json). Le rang CoinGecko contemporain et le rang de recherche interne sont volontairement **distincts**.

> **Décision :** Paire historique TRX-USDT annoncée dans un regroupement global OKX de juillet 2026, mais aucune paire TRX dans les 21 captures USDC ni les 18 paires de carnet du Coffre. Ne pas présumer un TRX-USDC ni un droit d'ordre EEE.

## 1. Snapshot de marché commun, provenance et comparaison BTC

- Source : fichier public [CoinGecko mis en cache dans le MASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), SHA Git `4f1f33162f2bf729f5772562e15a60fdb7017075` ; `generated_at=2026-11-09T07:53:59.646Z`, `lastUpdated=2026-11-09T07:52:59.000Z`.
- Prix TRX : **0,3162062 USD**, rang CoinGecko **#8** au relevé du 09/11 ; ce n'est pas une cotation OKX native et n'actualise pas la monographie du 8 novembre.
- Variation : **-1,31 %** sur 24 h, **0,78 %** sur 7 jours, **-4,30 %** sur 30 jours.
- Variation de référence BTC au **même instant** : 24 h -2,57 %, 7 j -5,15 %, 30 j -10,28 %.
- Écart TRX − BTC en points de pourcentage : **1,27** sur 24 h, **5,92** sur 7 jours, **5,98** sur 30 jours. La performance relative décrit ce snapshot, pas l'évolution future.
- Volume global 24 h CoinGecko : **322,38 M USD** ; ce n'est ni volume exécutable ni profondeur d'un carnet OKX.

## 2. Coffre d'historique natif : échange et devises conservés

| Élément | État source |
|---|---|
| Actif identifié | ID CoinGecko `tron`, symbole `TRX` |
| Archive originale | **Binance Spot**, instrument `TRXUSDT` (quote **USDT**) |
| Mois indexés | 79 |
| Bougies 1 minute indexées | 3 466 080 |
| Provenance | [Index Top 250 des sources natives](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) ; SHA Git `71b25904a652fbd8cdea1ac6bb942c9789e930c3` |
| Contrôle complet des lots dans cette étude | **Non réalisé** ; un index n'est pas une revalidation des ZIP et SHA-256 |
| Couverture, trous et horodatages | À auditer sur les périodes retenues avant un backtest ; **aucune interpolation** |

Il serait incorrect de convertir implicitement une série `TRXUSDT` en un prix comptable en USD ou en une paire OKX `TRX-USDC`. Les paires et venues restent séparées.

## 3. Découverte et carnet sur OKX : preuve disponible ≠ permission de compte

| Vérification | Constat |
|---|---|
| 21 candidats vus sur captures OKX du 08/11 | 0 paire(s) TRX relevée(s) |
| 18 paires couvertes par notre collecteur de carnets d'octobre | 0 paire(s) TRX |
| Carnet natif OKX actuel avec timestamp exchange | **Non recueilli** dans ce dossier |
| Règles actuelles `state / minSz / lotSz / tickSz` | **Non vérifiées** sur endpoint public dans cette recherche |
| Autorisation de l'ordre et frais du compte | **Inconnus** ; aucune connexion privée effectuée |
| Test PAPER exécutable | **Non certifié** ; aucun ordre ni remplissage prouvé |

Sources du projet : [capture-candidates JSON](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json), SHA `ab1498c692eaaedb6f5a940f555fee13afa45ab4` ; [index du collecteur historique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json), SHA `3e20270ca0df74825a47a980f1d8b8ea8dd07d05`.

**Vérification publique additionnelle :** Paire historique TRX-USDT annoncée dans un regroupement global OKX de juillet 2026, mais aucune paire TRX dans les 21 captures USDC ni les 18 paires de carnet du Coffre. Ne pas présumer un TRX-USDC ni un droit d'ordre EEE.

### Publications officielles à consulter dans leur contexte daté

- [TRON — documentation développeur](https://developers.tron.network/docs)
- [OKX — Spot group adjustment 30 Jul 2026 (TRX-USDT)](https://www.okx.com/en-gb/help/important-notice-token-pairs-adjustment)
- [OKX EEA — Spot market listings](https://www.okx.com/en-eu/markets/rankings/spot)

Ces pages sont des preuves de **publication ou de présentation de marché** à leur date de publication ; elles ne fournissent pas un carnet exchange actuel ni l'état personnel des permissions de compte.

## 4. Utilité du réseau, phénomènes de marché et risques

**Fonctionnement à documenter :** TRX sert aux ressources du réseau TRON (bandwidth et energy) et aux frais. L'activité USDT sur TRON est un usage du réseau mais pas une mesure du prix, du rendement ou de l'adoption économique de TRX. Distinguer nombre d'opérations, transferts économiques, adresses et revenus effectivement attribuables au protocole.

**Risques concrets :** Concentration de gouvernance/validation, dépendance des activités de stablecoins, conformité des plateformes, ressources et coûts des transactions, différence entre volume transféré et circulation réelle.

**Contrôles méthodologiques** : distinguer le jeton natif de ses applications, l'activité réelle des transferts, les frais du protocole, les frais de plateforme et les dérivés. Un classement de capitalisation, une annonce ou un niveau historique ne prouve pas la rentabilité d'un instrument.

## 5. Décision de recherche, seuils et prochaines preuves

- **Acquis :** identité du projet, snapshot global daté, prix et variations comparables à BTC, index des historiques natifs, contexte public OKX ci-dessus.
- **Non acquis :** règles Spot courantes, carnet actuel dans la devise native, garanties de liquidité ou de remplissage, frais maker/taker personnels, contrôle des ZIP sur les périodes retenues et permissions OKX individuelles.
- **Travail suivant :** qualification **publique** des instruments et carnets à la date de collecte. Ne pas demander les identifiants ni ouvrir une session privée ; si la réglementation régionale exclut l'actif, conserver le dossier en recherche uniquement.
- **PAPER :** une étude hypothétique n'est acceptable qu'avec données horodatées et cohérentes, frais/tailles explicites, fenêtres historiques vérifiées et journal reproductible ; aucune certification PAPER dans ce dossier.

**Statut : PUBLIC_GROUP_HISTORY_NOT_USER_PERMISSION.** Aucun ordre réel, aucune action Bridge, aucun changement de l'Administrator, du Trader ni des droits OKX. Document à publier via PR de recherche, pas une mise à jour logicielle.
