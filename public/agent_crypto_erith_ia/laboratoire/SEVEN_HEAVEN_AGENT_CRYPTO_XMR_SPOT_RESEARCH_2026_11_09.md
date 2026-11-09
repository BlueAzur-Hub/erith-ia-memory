# Seven Heaven — Monero (XMR) : recherche du Top 10 et état des preuves OKX

**9 novembre 2026 · dossier documentaire en lecture seule · rang de recherche n°9 du Top 10 canonique.**
Complète la [monographie existante](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md), sans en remplacer le rang ou le snapshot historiques. Voir le [registre machine JSON](../data/crypto/research/seven_heaven_xmr_spot_evidence_2026_11_09.json). Le rang CoinGecko contemporain et le rang de recherche interne sont volontairement **distincts**.

> **Décision :** Les avis officiels OKX de 2023 et 2024 documentent le retrait de paires XMR et l'arrêt de prise en charge en EEE. Ce constat daté prime sur une hypothèse de paire actuelle. Dossier pour la connaissance, pas candidat PAPER OKX sans confirmation explicite conforme.

## 1. Snapshot de marché commun, provenance et comparaison BTC

- Source : fichier public [CoinGecko mis en cache dans le MASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), SHA Git `4f1f33162f2bf729f5772562e15a60fdb7017075` ; `generated_at=2026-11-09T07:53:59.646Z`, `lastUpdated=2026-11-09T07:52:59.000Z`.
- Prix XMR : **590,18 USD**, rang CoinGecko **#12** au relevé du 09/11 ; ce n'est pas une cotation OKX native et n'actualise pas la monographie du 8 novembre.
- Variation : **-1,35 %** sur 24 h, **-2,31 %** sur 7 jours, **13,47 %** sur 30 jours.
- Variation de référence BTC au **même instant** : 24 h -2,57 %, 7 j -5,15 %, 30 j -10,28 %.
- Écart XMR − BTC en points de pourcentage : **1,22** sur 24 h, **2,83** sur 7 jours, **23,75** sur 30 jours. La performance relative décrit ce snapshot, pas l'évolution future.
- Volume global 24 h CoinGecko : **111,73 M USD** ; ce n'est ni volume exécutable ni profondeur d'un carnet OKX.

## 2. Coffre d'historique natif : échange et devises conservés

| Élément | État source |
|---|---|
| Actif identifié | ID CoinGecko `monero`, symbole `XMR` |
| Archive originale | **Binance Spot**, instrument `XMRUSDT` (quote **USDT**) |
| Mois indexés | 11 |
| Bougies 1 minute indexées | 480 960 |
| Provenance | [Index Top 250 des sources natives](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) ; SHA Git `71b25904a652fbd8cdea1ac6bb942c9789e930c3` |
| Contrôle complet des lots dans cette étude | **Non réalisé** ; un index n'est pas une revalidation des ZIP et SHA-256 |
| Couverture, trous et horodatages | À auditer sur les périodes retenues avant un backtest ; **aucune interpolation** |

Il serait incorrect de convertir implicitement une série `XMRUSDT` en un prix comptable en USD ou en une paire OKX `XMR-USDC`. Les paires et venues restent séparées.

## 3. Découverte et carnet sur OKX : preuve disponible ≠ permission de compte

| Vérification | Constat |
|---|---|
| 21 candidats vus sur captures OKX du 08/11 | 0 paire(s) XMR relevée(s) |
| 18 paires couvertes par notre collecteur de carnets d'octobre | 0 paire(s) XMR |
| Carnet natif OKX actuel avec timestamp exchange | **Non recueilli** dans ce dossier |
| Règles actuelles `state / minSz / lotSz / tickSz` | **Non vérifiées** sur endpoint public dans cette recherche |
| Autorisation de l'ordre et frais du compte | **Inconnus** ; aucune connexion privée effectuée |
| Test PAPER exécutable | **Non certifié** ; aucun ordre ni remplissage prouvé |

Sources du projet : [capture-candidates JSON](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json), SHA `ab1498c692eaaedb6f5a940f555fee13afa45ab4` ; [index du collecteur historique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json), SHA `3e20270ca0df74825a47a980f1d8b8ea8dd07d05`.

**Vérification publique additionnelle :** Les avis officiels OKX de 2023 et 2024 documentent le retrait de paires XMR et l'arrêt de prise en charge en EEE. Ce constat daté prime sur une hypothèse de paire actuelle. Dossier pour la connaissance, pas candidat PAPER OKX sans confirmation explicite conforme.

### Publications officielles à consulter dans leur contexte daté

- [GetMonero — FAQ et bases de Monero](https://www.getmonero.org/get-started/faq/)
- [OKX — retrait des paires XMR, communiqué 29 Dec 2023](https://www.okx.com/fr/help/okx-to-delist-several-spot-trading-pairs-12-29)
- [OKX — arrêt de la prise en charge XMR en EEE, communiqué 30 Apr 2024](https://www.okx.com/en-us/help/important-security-updates-and-token-adjustments-at-okx-in-eea)

Ces pages sont des preuves de **publication ou de présentation de marché** à leur date de publication ; elles ne fournissent pas un carnet exchange actuel ni l'état personnel des permissions de compte.

## 4. Utilité du réseau, phénomènes de marché et risques

**Fonctionnement à documenter :** Monero est un réseau de paiement axé sur la confidentialité. Les signatures de cercle, les adresses furtives et les montants masqués compliquent une analyse du flux économique comparable à des chaînes transparentes. Le nombre d'utilisateurs, les montants masqués et l'activité effective ne peuvent pas être reconstitués en additionnant simplement des transactions publiques.

**Risques concrets :** Restrictions géographiques d'accès aux actifs de confidentialité, absence de cote OKX EEE démontrée, profondeur difficile à vérifier, accessibilité des échanges, risques opérationnels de garde et de transfert. Ne jamais proposer de contournement de restrictions régionales.

**Contrôles méthodologiques** : distinguer le jeton natif de ses applications, l'activité réelle des transferts, les frais du protocole, les frais de plateforme et les dérivés. Un classement de capitalisation, une annonce ou un niveau historique ne prouve pas la rentabilité d'un instrument.

## 5. Décision de recherche, seuils et prochaines preuves

- **Acquis :** identité du projet, snapshot global daté, prix et variations comparables à BTC, index des historiques natifs, contexte public OKX ci-dessus.
- **Non acquis :** règles Spot courantes, carnet actuel dans la devise native, garanties de liquidité ou de remplissage, frais maker/taker personnels, contrôle des ZIP sur les périodes retenues et permissions OKX individuelles.
- **Travail suivant :** qualification **publique** des instruments et carnets à la date de collecte. Ne pas demander les identifiants ni ouvrir une session privée ; si la réglementation régionale exclut l'actif, conserver le dossier en recherche uniquement.
- **PAPER :** une étude hypothétique n'est acceptable qu'avec données horodatées et cohérentes, frais/tailles explicites, fenêtres historiques vérifiées et journal reproductible ; aucune certification PAPER dans ce dossier.

**Statut : EEA_RESTRICTION_HISTORICAL_NOTICE.** Aucun ordre réel, aucune action Bridge, aucun changement de l'Administrator, du Trader ni des droits OKX. Document à publier via PR de recherche, pas une mise à jour logicielle.
