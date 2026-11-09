# Seven Heaven — Dogecoin (DOGE) : recherche du Top 10 et état des preuves OKX

**9 novembre 2026 · dossier documentaire en lecture seule · rang de recherche n°10 du Top 10 canonique.**
Complète la [monographie existante](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md), sans en remplacer le rang ou le snapshot historiques. Voir le [registre machine JSON](../data/crypto/research/seven_heaven_doge_spot_evidence_2026_11_09.json). Le rang CoinGecko contemporain et le rang de recherche interne sont volontairement **distincts**.

> **Décision :** DOGE-USDC est effectivement relevé dans les captures utilisateur du 8 novembre et cité par la liste Spot publique d'OKX Europe, mais aucun book DOGE horodaté n'est présent dans l'index des 18 paires ; ni state actuel, ni taille, ni profondeur, ni droit d'ordre sur le compte ne sont certifiés.

## 1. Snapshot de marché commun, provenance et comparaison BTC

- Source : fichier public [CoinGecko mis en cache dans le MASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), SHA Git `4f1f33162f2bf729f5772562e15a60fdb7017075` ; `generated_at=2026-11-09T07:53:59.646Z`, `lastUpdated=2026-11-09T07:52:59.000Z`.
- Prix DOGE : **0,0681229 USD**, rang CoinGecko **#13** au relevé du 09/11 ; ce n'est pas une cotation OKX native et n'actualise pas la monographie du 8 novembre.
- Variation : **-4,36 %** sur 24 h, **-9,41 %** sur 7 jours, **-20,59 %** sur 30 jours.
- Variation de référence BTC au **même instant** : 24 h -2,57 %, 7 j -5,15 %, 30 j -10,28 %.
- Écart DOGE − BTC en points de pourcentage : **-1,79** sur 24 h, **-4,27** sur 7 jours, **-10,31** sur 30 jours. La performance relative décrit ce snapshot, pas l'évolution future.
- Volume global 24 h CoinGecko : **591,48 M USD** ; ce n'est ni volume exécutable ni profondeur d'un carnet OKX.

## 2. Coffre d'historique natif : échange et devises conservés

| Élément | État source |
|---|---|
| Actif identifié | ID CoinGecko `dogecoin`, symbole `DOGE` |
| Archive originale | **Binance Spot**, instrument `DOGEUSDT` (quote **USDT**) |
| Mois indexés | 73 |
| Bougies 1 minute indexées | 3 205 440 |
| Provenance | [Index Top 250 des sources natives](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) ; SHA Git `71b25904a652fbd8cdea1ac6bb942c9789e930c3` |
| Contrôle complet des lots dans cette étude | **Non réalisé** ; un index n'est pas une revalidation des ZIP et SHA-256 |
| Couverture, trous et horodatages | À auditer sur les périodes retenues avant un backtest ; **aucune interpolation** |

Il serait incorrect de convertir implicitement une série `DOGEUSDT` en un prix comptable en USD ou en une paire OKX `DOGE-USDC`. Les paires et venues restent séparées.

## 3. Découverte et carnet sur OKX : preuve disponible ≠ permission de compte

| Vérification | Constat |
|---|---|
| 21 candidats vus sur captures OKX du 08/11 | 1 paire(s) DOGE relevée(s): `DOGE-USDC` |
| 18 paires couvertes par notre collecteur de carnets d'octobre | 0 paire(s) DOGE |
| Carnet natif OKX actuel avec timestamp exchange | **Non recueilli** dans ce dossier |
| Règles actuelles `state / minSz / lotSz / tickSz` | **Non vérifiées** sur endpoint public dans cette recherche |
| Autorisation de l'ordre et frais du compte | **Inconnus** ; aucune connexion privée effectuée |
| Test PAPER exécutable | **Non certifié** ; aucun ordre ni remplissage prouvé |

Sources du projet : [capture-candidates JSON](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json), SHA `ab1498c692eaaedb6f5a940f555fee13afa45ab4` ; [index du collecteur historique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json), SHA `3e20270ca0df74825a47a980f1d8b8ea8dd07d05`.

**Vérification publique additionnelle :** DOGE-USDC est effectivement relevé dans les captures utilisateur du 8 novembre et cité par la liste Spot publique d'OKX Europe, mais aucun book DOGE horodaté n'est présent dans l'index des 18 paires ; ni state actuel, ni taille, ni profondeur, ni droit d'ordre sur le compte ne sont certifiés.

### Publications officielles à consulter dans leur contexte daté

- [Dogecoin — site officiel et ressources](https://dogecoin.com/)
- [OKX Europe — liste publique Spot USDC](https://www.okx.com/en-eu/markets/spot/usdc-meme)
- [OKX — Spot group adjustment 30 Jul 2026 (DOGE-USDC)](https://www.okx.com/en-gb/help/important-notice-token-pairs-adjustment)

Ces pages sont des preuves de **publication ou de présentation de marché** à leur date de publication ; elles ne fournissent pas un carnet exchange actuel ni l'état personnel des permissions de compte.

## 4. Utilité du réseau, phénomènes de marché et risques

**Fonctionnement à documenter :** Dogecoin est une monnaie de preuve de travail à émissions continues. Il faut séparer transferts et frais du réseau, activités de marché sur plateformes et variations d'attention publique : une popularité sociale ou une annonce ne constitue pas une mesure de demande économique pérenne.

**Risques concrets :** Mouvements liés au sentiment et à la communication publique, volatilité, concentration des carnets, frais et tailles minimales propres à la paire, disponibilité par région.

**Contrôles méthodologiques** : distinguer le jeton natif de ses applications, l'activité réelle des transferts, les frais du protocole, les frais de plateforme et les dérivés. Un classement de capitalisation, une annonce ou un niveau historique ne prouve pas la rentabilité d'un instrument.

## 5. Décision de recherche, seuils et prochaines preuves

- **Acquis :** identité du projet, snapshot global daté, prix et variations comparables à BTC, index des historiques natifs, contexte public OKX ci-dessus.
- **Non acquis :** règles Spot courantes, carnet actuel dans la devise native, garanties de liquidité ou de remplissage, frais maker/taker personnels, contrôle des ZIP sur les périodes retenues et permissions OKX individuelles.
- **Travail suivant :** qualification **publique** des instruments et carnets à la date de collecte. Ne pas demander les identifiants ni ouvrir une session privée ; si la réglementation régionale exclut l'actif, conserver le dossier en recherche uniquement.
- **PAPER :** une étude hypothétique n'est acceptable qu'avec données horodatées et cohérentes, frais/tailles explicites, fenêtres historiques vérifiées et journal reproductible ; aucune certification PAPER dans ce dossier.

## 6. Couverture native DOGEUSDT — contrôle croisé des index du Coffre (09/11)

**Nouveau contrôle documentaire :** la couverture des mois dans l'index doit être séparée de la continuité vérifiée de chaque bougie et du prix Spot OKX. Les index sont des **déclarations archivées**, pas des ZIP téléchargés et indépendamment recalculés pendant cette étude.

- [Catalogue actuel `year_depth_index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json) — SHA Git `f97dc90291ec67661ff2b263de1de78a56f8a100`. Entrée `dogecoin` : **73 mois considérés vérifiés dans l'index**, de **septembre 2019** à **octobre 2026** ; **3 205 440 minutes natives** annoncées en `DOGEUSDT`, quote **USDT**, source Binance Spot.
- [Index fédéré actuel de la minute native](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) — SHA Git `71b25904a652fbd8cdea1ac6bb942c9789e930c3`. Il reprend exactement **73 mois** et **3 205 440 minutes** pour DOGE ; les deux **index courants** se correspondent.
- **Plus longue succession de mois listés : avril 2023 → octobre 2026 inclus, 43 mois.** C'est un **candidat de période historique** pour audit préalable, pas une série de bougies ayant été toutes relues ou un backtest approuvé.
- De septembre 2019 à octobre 2026 inclus, **86 mois calendaires** ; 73 figurent dans le catalogue de mois repris dans l'index, soit **13 mois non couverts par cet index**. Il ne faut **pas** conclure qu'il n'y a eu aucun échange sur ces mois ou qu'il manque autant de bougies dans les ZIP.
- Mois sans entrée dans ce catalogue, sur cette plage : `2019-11`, `2020-02`, `2020-03`, `2020-04`, `2020-06`, `2020-11`, `2020-12`, `2021-02`, `2021-03`, `2021-04`, `2021-08`, `2021-09`, `2023-03`. Un **mois non indexé** est différent d'une **minute manquante dans un mois vérifié**.

### Pourquoi un ancien rapport comptait 62 mois

Le [rapport de réconciliation du 12 octobre 2026](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_coverage_reconciliation.json) (SHA Git `a663d29a07d93b27b4e1454eec2481b826532093`) décrivait un **checkpoint plus ancien** avec **62 mois complets dans la fédération de l'époque** et **67 mois clos dans l'index indépendant de profondeur**. Ce rapport référençait l'ancienne empreinte du catalogue minute `5446dc85c93660ce80a85db7fe2b32093fb2d8ff`, différente de l'index actuel `71b25904a652fbd8cdea1ac6bb942c9789e930c3`. Les 62, 67 et 73 ne sont **pas** à additionner. Ne pas afficher « 11 nouveaux mois vérifiés aujourd'hui » sans historique de migration des sources.

### Décision de qualité pour DOGE

1. **Coffre** : les 43 mois consécutifs indexés constituent une bonne fenêtre **candidate** pour un prochain audit réel des lots; commencer par des intervalles UTC bornés puis vérifier téléchargement, checksums SHA-256, doublons, trous intramensuels et quote native.
2. **OKX** : la page [Spot DOGE/USDC d'OKX Europe](https://www.okx.com/en-eu/markets/spot/usdc-meme) affiche la paire à la consultation du 9 novembre, mais **n'affiche pas ici de bid/ask chiffré exploitable**. Un GET direct vers les endpoints publics `/api/v5/public/instruments` et `/api/v5/market/books` n'a pas abouti depuis cet environnement. Le `state`, le `minSz`, le `lotSz`, le `tickSz`, l'heure exchange du carnet et les permissions de compte restent **inconnus**.
3. **PAPER** : toujours **non certifié**, faute de règles actuelles, d'un carnet horodaté et d'une série réellement validée sur les périodes retenues. Aucune conversion implicite USD/USDT/USDC.

**Statut : USER_SCREEN_AND_PUBLIC_PAIR_LISTING_NOT_ORDER_CERTIFIED.** Aucun ordre réel, aucune action Bridge, aucun changement de l'Administrator, du Trader ni des droits OKX. Document à publier via PR de recherche, pas une mise à jour logicielle.

## 7. Contrôle ciblé DOGE/USDC — couverture des archives et preuve publique (9 novembre 2026)

**Audit complémentaire, sans modification de l'application :** les 14 fichiers quotidiens de `case-market-hourly` et `okx-hourly` du 22 au 28 octobre ont été ouverts, analysés et rapprochés des empreintes Git. Ils contiennent 172 blocs horaires (85 + 87), mais **aucune observation mentionnant DOGE**. L'absence concerne uniquement ces deux collecteurs ; elle n'établit pas que le marché DOGE/USDC était absent de la plateforme.

| Collecteur | Fichiers | Blocs horaires archivés | Observations DOGE |
|---|---:|---:|---:|
| `case-market-hourly` | 7 | 85 | 0 |
| `okx-hourly` | 7 | 87 | 0 |
| **Total** | **14** | **172** | **0** |

Les chemins et SHA Git des 14 archives figurent dans le [registre des preuves DOGE](../data/crypto/research/seven_heaven_doge_spot_evidence_2026_11_09.json). Dans les répertoires examinés, le dernier fichier quotidien est daté du **28 octobre 2026**. Les index `latest.json` de ces deux collecteurs pointent eux aussi sur le 28 octobre.

### Contrôle de la paire et des règles de négociation

- **Référencement public constaté :** [catalogue OKX Europe Spot / USDC](https://www.okx.com/en-eu/markets/spot/usdc-all) et [catalogue Meme / USDC](https://www.okx.com/en-eu/markets/spot/usdc-meme) citent DOGE/USDC. Les tableaux récupérés ne présentent pas de bid/ask chiffré exploitable.
- **Contrat officiel de données** : [documentation API OKX](https://www.okx.com/docs-v5/en/) pour les requêtes `GET /api/v5/public/instruments?instType=SPOT&instId=DOGE-USDC`, `GET /api/v5/market/books?instId=DOGE-USDC&sz=5` et éventuellement `GET /api/v5/market/ticker?instId=DOGE-USDC`.
- **Vérification non aboutie :** l'accès à ces réponses actuelles depuis l'environnement d'analyse a échoué. Il n'y a donc **aucune valeur DOGE courante vérifiée** pour `state`, `minSz`, `lotSz`, `tickSz`, `ts`, bids/asks, spread ou profondeur. L'échec d'accès du client n'établit pas une indisponibilité du service OKX.
- **Droits régionaux :** une paire affichée dans un catalogue public ne prouve pas l'éligibilité d'un compte individuel EEE, les frais maker/taker personnels ni l'autorisation d'ordre.

### La prochaine preuve utile (sans clé privée)

Collecter un couple de réponses publiques de la même période depuis un environnement autorisé : métadonnées de l'instrument et carnet cinq niveaux, avec code HTTP, horodatage exchange du carnet et heure de réception UTC, plus provenance. Vérifier alors `instId`, `state`, `minSz`, `lotSz`, `tickSz`, `bids`, `asks` et la couverture du montant. **Ne pas utiliser l'historique Binance DOGEUSDT comme substitut au carnet OKX DOGE-USDC.**

**Statut documentaire : `PUBLIC_PAIR_LISTED / DOGE_NOT_IN_EXAMINED_ARCHIVES / CURRENT_RULES_AND_BOOK_UNVERIFIED / PAPER_NOT_CERTIFIED`.** Aucun ordre réel ou PAPER, aucune modification de l'Administrator, du Trader ou du Bridge R31.

## 7. Contrôle complémentaire — restrictions d'accès API et identifiants USD/USDC (09/11/2026)

**Objet :** vérifier sans connexion privée si un relevé Spot public **actuel** peut être produit pour DOGE, et éviter d'attribuer des paramètres chiffrés au seul catalogue visuel.

**Preuves officielles consultées :**
- [OKX Europe — catalogue Spot USDC](https://www.okx.com/en-eu/markets/spot/usdc-meme) : affiche **DOGE/USDC**, mais ne livre pas de bid, ask ni de profondeur exploitable dans l'extraction disponible.
- [OKX — documentation API V5](https://www.okx.com/docs-v5) : spécifie **`state`**, **`minSz`**, **`lotSz`**, **`tickSz`** pour les instruments ; indique que les utilisateurs EU enregistrés sur `my.okx.com` doivent employer le domaine régional **`eea.okx.com`**.
- [OKX Europe — utilisation de USDC avec une paire USD, 03/09/2026](https://www.okx.com/en-eu/help/how-do-i-trade-a-usd-pair-using-usdc-or-another-stablecoin) : explique la liquidité partagée des carnets USD/stablecoins sur les marchés concernés.
- [OKX — journal API du 30/09/2026](https://www.okx.com/docs-v5/log_en/) : annonce une migration `Crypto-USD` vers `Crypto-USDC` pour **des instruments concernés**, sans prouver par lui-même la disponibilité ou l'identifiant applicable à **DOGE sur ce compte EEE**. Les communications régionales et les changements datés ne doivent pas être fusionnés en une règle universelle.

**Tests publics tentés le 09/11/2026 (aucune clé) :**
1. `GET https://eea.okx.com/api/v5/public/instruments?instType=SPOT&instId=DOGE-USDC`
2. `GET https://eea.okx.com/api/v5/market/books?instId=DOGE-USDC&sz=5`
3. Contrôle de découverte de l'alias possible `DOGE-USD` sur le domaine EEE et le domaine standard.

L'outil de consultation distante n'a **pas pu accéder** aux réponses de ces endpoints. Un essai réseau indépendant a également échoué à la résolution du domaine, **sans réponse HTTP attribuable à OKX**. Ces échecs décrivent **l'environnement de recherche**, pas une suspension de DOGE, un dysfonctionnement du Bridge R31 ni un refus du compte.

| Preuve requise | Résultat |
|---|---|
| Publication de la paire DOGE/USDC | **Oui, dans le catalogue Europe** |
| Identifiant réellement accepté par l'API EEE (`DOGE-USDC` ou autre) | **Non établi** |
| `state`, `minSz`, `lotSz`, `tickSz` avec horodatage | **Non obtenus** |
| Carnet cinq niveaux OKX avec `ts`, bids et asks | **Non obtenu** |
| Éligibilité du compte et frais personnels | **Non vérifiés** |
| Certification PAPER / exécution réelle | **Aucune** |

**Décision :** ne pas réinterpréter la liste publique comme un carnet, ne pas recopier d'anciennes règles comme si elles étaient actuelles et ne pas modifier le MASTER. Pour clore ce point, le prochain *relevé public vérifiable* doit contenir le JSON brut `public/instruments` et `market/books` du même domaine régional, son heure de collecte UTC, l'identifiant renvoyé et la provenance. Si l'API du poste local devient accessible, cette collecte reste **GET, sans authentification ni ordre**. Tant qu'elle manque, DOGE conserve son état **USER_SCREEN_AND_PUBLIC_PAIR_LISTING_NOT_ORDER_CERTIFIED**.
