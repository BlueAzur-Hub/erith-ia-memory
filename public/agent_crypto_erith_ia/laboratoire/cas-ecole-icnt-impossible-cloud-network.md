# ERITH.IA — ICNT / Impossible Cloud Network · Dossier Radar, Spot et Coffre

**Fiche vérifiée le 8 novembre 2026 ; conservation documentaire, lecture seule.**  
**ID CoinGecko :** `impossible-cloud-network-token` · **Ticker :** `ICNT` · **Marché de référence :** Bitget **Spot ICNTUSDT**, coté en **USDT**.  
**Frontière :** un relevé ne prouve ni un trade réel, ni un résultat PAPER réalisé. Les relevés de prix Radar sont des snapshots **USD CoinGecko** et doivent rester distincts des carnets Bitget en **USDT**.

[Retour à l'index des trois cas](RECONCILIATION_RADAR_Q_ICNT_FLUID_2026_11_08.md) · [Radar Historique](radar-historique.html) · [Bibliothèque des projets](crypto-knowledge.html)

## 1 — Projet et identité du marché

**Preuve primaire :** [Bitget a annoncé ICNT/USDT Spot](https://www.bitgetapp.com/fr/support/articles/12560603830653), pour une ouverture au trading le **3 juillet 2025 à 10 h UTC**. Le contrat annoncé est situé sur **Base** : `0xe0cd4cacddcbf4f36e845407ce53e87717b6601d`.

La [fiche CoinGecko ICNT](https://www.coingecko.com/fr/coins/impossible-cloud-network-token) référence le même ID, le même actif, et l'adresse Base. **Attention : CoinGecko mentionne aussi une autre adresse sur Ethereum.** Il ne faut jamais transférer un jeton sur une autre chaîne sans une vérification explicite du réseau.

Le projet présente ICNT comme un jeton d'accès aux services de stockage/calcul, de rémunération des opérateurs de matériel et de dépôt en garantie. Ces fonctions proviennent de la [documentation officielle du projet](https://docs.icn.global/icn-economics/tokenomics/token-utility) ; **l'adoption indépendante, les revenus réellement attribuables et la valeur pour le jeton ne sont pas démontrés ici**.

### Statuts internes divergents, à ne pas écraser

- [`spot-identity-latest.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/spot-identity-latest.json) (édition **2026-11-07T23:51:50Z**) inscrit `identity_proven=true`, `CONTRACT_MATCH_AT_COLLECTION` pour ICNTUSDT et le contrat Base ci-dessus. C'est une **concordance de contrat dans la collecte**, pas une permission d'ordre réel.
- [`qualification-latest.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/qualification-latest.json) à **2026-11-07T23:51:40Z** conserve `SYMBOL_ONLY_NOT_COIN_ID_PROVEN`, `SPOT_SYMBOL_PAIR_OBSERVED` ; ce module exige d'autres preuves et ne suit pas exactement le même protocole.
- [`asset-knowledge.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/asset-knowledge.json) conserve le booléen d'identité non certifiée de la qualification **du 17 octobre** : ancien état documentaire, **pas un démenti** de la collecte contractuelle plus récente.
- **État concilié :** annonce Bitget et adresse de contrat documentées, contrat rapproché dans la collecte, **aucun contrôle d'accès authentifié ni garantie de liquidité future**.

## 2 — Neuf détections Radar, leurs suivis datés

Source **unique** des pourcentages : [`dynamic-followups.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/dynamic-followups.json), `id=impossible-cloud-network-token` ; dernière archive de cette version **2026-11-07**.

| T0 de détection UTC | Catégorie Radar | Prix initial USD | J+1 | Statut J+1 | J+7 | Statut J+7 |
|---|---|---:|---:|---|---:|---|
| 2026-10-16 00:49 | Momentum | 0.14503565 | +34,33 % | mesuré | +23,91 % | mesuré |
| 2026-10-17 10:34 | Momentum | 0.19482202 | +2,75 % | mesuré | +1,23 % | mesuré |
| 2026-10-18 11:21 | Momentum | 0.20018402 | -7,15 % | mesuré | -5,98 % | mesuré |
| 2026-10-21 12:01 | Momentum | 0.20628580 | — | relevé manquant | -6,29 % | mesuré |
| 2026-10-24 12:04 | Momentum | 0.19722197 | -4,57 % | mesuré | -7,09 % | mesuré |
| 2026-10-28 13:36 | Rebond | 0.19330279 | -4,81 % | mesuré | +16,13 % | mesuré |
| 2026-11-03 02:17 | Rebond | 0.18697597 | +20,06 % | mesuré | — | en attente |
| 2026-11-04 00:40 | Momentum | 0.22448539 | +0,15 % | mesuré | — | en attente |
| 2026-11-07 00:08 | Momentum | 0.29818088 | — | en attente | — | en attente |

**Comptage :** sept J+1 mesurés, un **relevé J+1 manquant** (pas « 0 % »), un en attente ; six J+7 mesurés, trois en attente. Le pas J+1/J+7 correspond à des **jours de suivi** : selon l'heure réelle du snapshot, ce n'est pas nécessairement 24 h/168 h pile.

Ces détections se chevauchent et **ne sont pas indépendantes**. Leur évolution ne démontre pas une rentabilité de stratégie : ni frais, ni fill, ni véritable portefeuille n'ont été reconstitués.

## 3 — Carnet Bitget : un relevé daté, pas une exécution

Le collecteur de qualification à **2026-11-07T23:51:40Z** contient :
- **20 bougies horaires closes** de `2026-11-07T03:00:00Z` à `2026-11-07T22:00:00Z`, avec dernière clôture **0.3196 USDT** ;
- carnet à `2026-11-07T23:51:45Z` : **bid 0.3206**, **ask 0.3208 USDT**, spread **6.24 pb** ;
- `book_age_seconds=-0.26` : léger **écart d'horloges** (valeur négative), pas accès à une information future ;
- aller-retour fictif **100 USDT** avec frais hypothétiques **0,1 %/côté** : coût estimé **0.276 %**, non garanti, minimum d'ordre et frais authentifiés non établis ;
- `okx_spot.best_book_status=NOT_COLLECTED` dans cette enquête : **aucun carnet OKX collecté à cet instant**, ce qui ne prouve pas une absence globale de paire OKX.

[`spot-paper-forward.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/spot-paper-forward.json) contient un candidat ICNT de **100 USDT théoriques**, ask **0.3001 USDT** au **2026-11-07T00:15:39Z**, `HYPOTHETICAL_NO_FILL`, `executed_order=false`, `realized_profit_usdt=null`. **Aucun fill**, aucun gain réalisé, aucune transaction.

## 4 — Historical Vault : ne pas inventer la couverture

Les catalogues examinés sont [`top250_multiresolution_sources/index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multiresolution_sources/index.json) et [`top250_multisource_coverage/index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json).

Ils ne comportent **aucune entrée `impossible-cloud-network-token`** dans les portions consultées pour 1D native et 1m native. **C'est une absence d'inscription dans ces deux catalogues, pas une preuve de l'absence de tout historique ICNT ailleurs dans le Coffre.** Les 20 bougies horaires de qualification et les snapshots du Radar sont bien des relevés archivés, mais **ils ne constituent pas un historique quotidien natif certifié**.

Les contrôles suivants restent documentaires : chercher une série native et ses empreintes avant une simulation ; vérifier le mapping de la paire et de la chaîne ; préserver le snapshot J+1 absent ; vérifier indépendamment l'activité réelle du réseau et les mécanismes de valeur du jeton.

**Point d'arrêt ICNT : les sources sont reliées, les preuves contradictoires contextualisées, les manques visibles. Aucun JSON, code, archive ou ordre modifié.**
