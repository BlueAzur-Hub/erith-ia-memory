# ERITH.IA — Q / Quack AI · Cas d'école Radar → Trader → Coffre

**Statut : recherche PAPER, lecture seule — aucune exécution réelle.**
**Date initiale d'étude : 17 octobre 2026.** Une date de publication documentaire n'est pas un relevé de carnet.

[Page humaine Trader](../trader/quack-ai-case-study.html) · [Journal PAPER JSON](../data/trader_flux/q_paper/state.json) · [Radar — protocole](PROTOCOLE_RADAR_CIBLAGE.md)

## 1. Identité, marchés, contexte

- Identifiant CoinGecko : `quack-ai` ; symbole `Q` ; projet Quack AI.
- Adresse annoncée BNB Smart Chain (BEP-20) : `0xc07e1300dc138601FA6B0b59f8D0FA477e690589`.
- Quack AI était coté le **2 septembre 2025**, notamment Bitget Spot Q/USDT à 08:00 UTC, **bien avant** sa hausse du 17 octobre 2026. Binance Alpha n'est pas Binance Spot.
- [Annonce officielle Bitget](https://www.bitget.com/support/articles/12560603836754) · [site du projet](https://quackai.ai/) · [historique Bitget publié sur notre GitHub](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-bitget-spot-native-daily-2026-09-single-symbol-owners).
- Marché de travail : **Bitget Spot QUSDT (USDT)**. Les cours CoinGecko sont **USD** et ne constituent pas des exécutions QUSDT. Aucun dérivé Futures n'est inclus.

La qualification Radar du 17 octobre a observé `QUSDT` en Spot Bitget ; elle a marqué **`SYMBOL_ONLY_NOT_COIN_ID_PROVEN`**. Le dossier d'identité historique a par ailleurs établi un candidat « exact CoinGecko ID + contrat » ; il ne certifie pas par magie l'adresse d'un carnet à chaque nouvelle lecture. Croiser les références du jeton avec l'instrument officiel avant de déclarer « identité certifiée ».

## 2. Trois familles de données déjà présentes

### A. Archive quotidienne dans le Coffre — **historique, pas temps réel**

Le catalogue `data/historical_archive_prototype/top250_multiresolution_sources/index.json` référence pour `quack-ai` **390 chandelles natives journalières QUSDT Bitget**, 4 lacunes dans l'intervalle observé, et le fichier de release `quack-ai-QUSDT-1D.json.gz` (empreinte SHA-256 cataloguée). Cette couverture s'arrête à la fin septembre 2026. Il s'agit d'une référence externe GitHub Release, pas de la confirmation d'une série 1m intégrée dans le lecteur du Coffre.

Le catalogue `top250_multisource_coverage/index.json` indique pour Q **0 mois et 0 bougie originelle 1m vérifiée**. Les données horaires récentes ne remplacent pas ces archives 1m.

### B. Première observation Radar de ce jour — **fait historique**

Snapshot `data/crypto/radar-opportunities/2026-10-17.json`, Core généré à **10:35:04 UTC** : `quack-ai`, rang 134, prix CoinGecko **0,0711509725 USD**, variation 24 h **+32,11454 %**, 7 j **+132,1782 %**, volume agrégé 24 h **58 952 182 USD**. Le mouvement était **déjà commencé** à ce relevé. Il serait faux d'affirmer que le Radar a prédit le départ de la hausse.

### C. Qualification Spot — **instantané de carnet, pas simulation exécutée**

`data/crypto/radar-opportunities/qualification-latest.json` : qualification à **19:16:07 UTC**, marché QUSDT Bitget, 20 bougies horaires closes, bid/ask proches de **0,122437 USDT**, coût d'aller-retour **fictif 0,28830 % pour 100 USDT**, frais **hypothétiques 0,1 % chaque côté**. Cette mesure est datée, ne se réutilise **pas** comme spread actuel. La valeur négative de `book_age_seconds` (−0,27 s) signale un léger décalage des horloges et doit être traitée comme anomalie d'horodatage, pas « anticipation ».

Le snapshot public CoinGecko de **19:19:41 UTC** note Q à environ **0,122074 USD**, +120,64 % sur 24 h et +294,24 % sur 7 j. Ce sont les valeurs de ce snapshot, pas une cotation live.

## 3. Hypothèses à tester, sans réécriture après coup

- **Continuation après consolidation** : prix Spot franchit un plus haut de consolidation **sur bougie horaire close** avec volume supérieur à la médiane des dernières 20 bougies. Observer à +1 h / +4 h / +24 h / +7 j. Une impulsion dont les bougies sont déjà clôturées **avant** T0 ne compte pas comme prédiction.
- **Essoufflement / retournement** : clôture horaire sous la médiane mobile de 20 heures après une impulsion établie, avec volume notable. Ne pas confondre ce constat avec une recommandation de vendre.
- **Abstention** : carnet absent, latence, identité non vérifiée, bougies discontinues, faible profondeur ou incohérence USD/USDT ⇒ *observation incomplète*, sans décision simulée.

Le protocole ne choisit ni seuil de profit opportuniste ni « entrée » rétrospective au prix le plus bas. L'expérience démarre seulement lorsqu'un observateur prospectif obtient un premier relevé vérifiable.

## 4. Répartition des responsabilités

- **Radar** : découvre, classe et archive les candidats et les raisons de la sélection.
- **Interface Administrator** : moteur commun Market, Graphique, Bougies, Carnet et sélection unique ; priorité de correction ici.
- **Trader** : console de consultation, lectures multi-horizons, analyse PAPER, et page humaine dédiée **sans moteur graphique supplémentaire**.
- **Atlas-10** : calculs, contradictions, qualité des données ; **Aerith-10** : explications, hypothèses, limites ; **Seven** : coordination et mémoire des preuves.
- **Coffre** : historiques vérifiés et leurs références SHA-256. Les points de suivi prospectif PAPER restent dans `data/trader_flux/q_paper/` avec leur source et date UTC, pas réinjectés comme « bougies historiques certifiées ».

## 5. Stop point, preuves et suites

La page du Trader peut afficher le snapshot du marché, le dernier journal Q si disponible et ses manques. Aucun ordre, aucune clé privée et aucun lien de trading réel ne sont ajoutés. Si le workflow PAPER échoue, on garde le dernier journal daté, on n'invente pas un relevé.

Après validation de Q : réutiliser les mêmes contrôles sur le Top 24 h, Top 7 j, Top volume, nouveaux listings, rebonds et risques de retournement ; éviter un nouveau code de graphique pour chaque actif. Les sélections et les résultats doivent être datés et non extrapolés.

---

## 6. Réconciliation documentaire du 8 novembre 2026 — Q, Radar, Spot, Coffre

**Type :** contrôle ponctuel en lecture seule, fondé sur les archives GitHub existantes et sur les fiches publiques Bitget/CoinGecko.  
**Statut :** **IDENTITÉ DOCUMENTAIRE CONCORDANTE · MAPPING TECHNIQUE LIVE NON CERTIFIÉ · PAPER SANS ORDRE**.  
**Date de référence de la vérification :** 8 novembre 2026. Les prix et relevés ci-dessous sont historiques et **ne sont pas des cotations au moment de lire ce fichier**.

### A. L'identité de Q est bien celle de Quack AI, et non QNT

| Contrôle | Preuve retrouvée | Conclusion |
| --- | --- | --- |
| Actif de référence | CoinGecko **ID `quack-ai`**, symbole `Q`, projet *Quack AI* | Concordance explicite de l'identifiant et du nom |
| Publication officielle de cotation | Bitget annonce **Q/USDT Spot** le **02/09/2025 à 08:00 UTC** | Une paire Spot publique Q/USDT a bien été officiellement listée |
| Contrat publié par Bitget | BEP-20 **`0xc07e1300dc138601FA6B0b59f8D0FA477e690589`** | Référence contractuelle primaire de la cotation |
| Contrat publié par CoinGecko | `0xc07e1300dc138601fa6b0b59f8d0fa477e690589`, BNB Smart Chain | **Concordance de l'adresse intégrale, sans tenir compte de la casse** |
| Marché CoinGecko | Page Quack AI affichant la paire Bitget **Q/USDT** | Confirmation documentaire indépendante du libellé instrument/projet |
| Instrument technique collecteur | `Bitget Spot / QUSDT / USDT` enregistré dans les journaux | **Paire observée**, mais pas attestation cryptographique du jeton réellement tenu par la plateforme |
| Statut du registre IA | `identity_coin_gecko_exchange_token_verified: false` dans `asset-knowledge.json` | **Ne pas forcer un statut `certified` : le mapping live instrument ↔ contrat n'a pas été prouvé par l'API native** |

**Niveau de preuve :** *concordance documentaire inter-sources forte*, plus précise que la seule égalité du symbole `Q`. **L'identité technique de livraison/dépôt du marché exchange reste non certifiée au niveau des données automatiques.** `Q` désigne ici **Quack AI**, pas **Quant (`QNT`)**.

Sources externes : [Bitget — annonce officielle 02/09/2025](https://www.bitget.com/fr/support/articles/12560603836754) · [Bitget — marché Spot Q/USDT](https://www.bitget.com/fr/spot/QUSDT) · [CoinGecko — Quack AI (`quack-ai`)](https://www.coingecko.com/fr/coins/quack-ai).

### B. Radar dynamique — six détections rapprochées des suivis datés

Source existante unique : [`data/crypto/radar-opportunities/dynamic-followups.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/dynamic-followups.json). **Aucune copie des 459 enregistrements n'est créée ici.** Les six lignes `id = quack-ai` ont toutes une observation J+1 et une J+7, sur données **CoinGecko USD**.

| Détection UTC | Type Radar | Prix initial USD | J+1 affiché | J+7 affiché |
| --- | --- | ---: | ---: | ---: |
| 17/10/2026 10:35 | momentum 24 h + 7 j | 0,07115097 | **+57,79 %** | −1,45 % |
| 18/10/2026 11:41 | momentum 24 h + 7 j | 0,11226967 | +14,41 % | −30,42 % |
| 19/10/2026 11:13 | momentum 24 h + 7 j | 0,12845099 | −1,39 % | −58,29 % |
| 23/10/2026 01:53 | momentum 24 h + 7 j | 0,11985680 | −41,50 % | −61,41 % |
| 27/10/2026 13:09 | rebond 24 h / 7 j négatif | 0,07022585 | −24,02 % | −59,47 % |
| 30/10/2026 14:15 | rebond 24 h / 7 j négatif | 0,04625023 | −30,19 % | **−45,47 %** |

**Point essentiel :** les lignes J+1/J+7 sont des **suivis par date de calendrier**, non des fenêtres exactes de 24 h et 168 h. Exemple : pour le relevé Q du 30 octobre, le suivi du **6 novembre 00:59:25 UTC** est daté J+7 mais arrive après **154,73 h** environ, et non 168 h. Les six observations ne sont **pas indépendantes** puisqu'elles concernent un même actif à des dates proches. Aucun rendement de stratégie, aucun ordre, aucune position réellement exécutée ne peut être déduit de ces pourcentages.

**Lecture pédagogique :** la hausse détectée le 17/10 n'était pas une prédiction du départ du mouvement ; plusieurs variations positives immédiates sont suivies de fortes variations négatives aux observations hebdomadaires.

### C. Journal Bitget Spot Q — 103 observations publiques, indépendantes du Radar USD

Source existante : [`data/trader_flux/q_paper/state.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/trader_flux/q_paper/state.json), dont la [page humaine Trader](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/trader/quack-ai-case-study.html) effectue la lecture.

- **Première collecte du journal :** `2026-10-17T20:00:41Z` ; dernière observation archivée consultée : `2026-11-08T06:45:08Z`.
- **103 observations** dans `recent_observations`, chacune étiquetée `Bitget v3 public Spot`, `QUSDT`, `USDT`, `paper_only = true`, `executed_order = false`.
- **Premier cours de clôture horaire du journal :** 0,1253939 **USDT/Q** pour la bougie close du 17 octobre à 19:00 UTC.
- **Dernier cours horaire clos :** 0,0270182 **USDT/Q**, bougie de 05:00 UTC le 8 novembre ; dernier carnet public capturé vers 06:45 UTC, **bid 0,0271379 / ask 0,0271530 USDT**, spread calculé dans l'archive **5,56 points de base**.
- **Attention à la chronologie :** la clôture de bougie à 05:00 UTC et le carnet à 06:45 UTC ne sont pas simultanés. Il serait incorrect de leur appliquer directement une simulation d'exécution à la même heure.
- **Point manquant :** les 103 relevés ne constituent pas une série horaire exhaustive et continue sur toute la période. Ne pas remplir les intervalles absents par interpolation.

Source distincte : [`data/crypto/radar-opportunities/spot-paper-forward.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/spot-paper-forward.json) contient un **exemple de position fantôme de 100 USDT**, avec `HYPOTHETICAL_NO_FILL`, horodatage de référence `2026-10-19T21:38:48Z`, et **`paper_fills = 0`**. Ce fichier **n'atteste aucune exécution PAPER garantie**, ni gain ou perte réalisés, et doit rester distinct du journal d'observations `q_paper/state.json`.

### D. Historical Vault — deux couvertures à distinguer

| Source historique | Ce qui est effectivement catalogué | Limite |
| --- | --- | --- |
| [Catalogue multirésolution `top250_multiresolution_sources/index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multiresolution_sources/index.json) | **390 bougies natives 1 jour** Bitget Spot QUSDT ; intervalle des timestamps `2025-09-01T16:00Z` à `2026-09-29T16:00Z` ; **4 jours manquants dans la plage** | Le catalogue référence un **asset de release externe**, pas un flux horaire ni une série 1m permanente |
| [Catalogue natif minute `top250_multisource_coverage/index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) | **0 mois / 0 bougie native 1m** vérifiée pour `quack-ai` | Ne pas déduire l'absence de tout historique : les **390 bougies 1j** sont une source différente |

Archive native journalière référencée : [GitHub Release `crypto-bitget-spot-native-daily-2026-09-single-symbol-owners`](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-bitget-spot-native-daily-2026-09-single-symbol-owners), fichier **`quack-ai-QUSDT-1D.json.gz`**, **SHA-256 de catalogue** `a2fea11c66eb171c9e5f7162eae31e800ee813e308ed1e05102a76911c25cc5c`.

Le catalogue mentionne un **décalage de session de 16 h UTC** pour ces timestamps 1D ; aligner les périodes avant de comparer les bougies avec des journées CoinGecko UTC ou les suivis du Radar. L'existence du checksum catalogué n'est **pas** une nouvelle vérification de l'archive binaire dans cette édition ; son empreinte n'a pas été recalculée ici.

### E. État de preuve final et ce qui reste réellement à faire

| Élément | Statut après relecture | Action documentaire |
| --- | --- | --- |
| Identité CoinGecko `quack-ai` + symbole `Q` + contrat BSC officiel | **CONCORDANCE DOCUMENTAIRE FORTE** | Références Bitget/CoinGecko ci-dessus |
| Instrument Bitget `QUSDT` en Spot | **ANNONCE OFFICIELLE ET JOURNAL PUBLIC CONCORDANTS** | Ne pas confondre avec perpétuels `QUSDT` |
| Couplage cryptographique du carnet Spot live au contrat EVM | **NON CERTIFIÉ** | Exiger preuve native d'instrument, de dépôt ou de mapping contractualisé, pas simple symbole |
| Radar six détections / six J+1 / six J+7 | **OBSERVATIONS EXISTANTES ET DATÉES** | Consulter `dynamic-followups.json`, contrôler les heures réelles |
| Carnet et bougies Q historiques (Bitget) | **OBSERVÉS, MAIS PAS EXHAUSTIFS** | Consulter `q_paper/state.json` |
| Archive Q Spot 1D / archive native 1m | **390 1D avec 4 lacunes / 0 bougie 1m** | Consulter les deux catalogues, ne pas fusionner les couvertures |
| Signal de stratégie rémunérateur ou exécution PAPER vérifiée | **NON DÉMONTRÉ** | Pas d'ordre ni de remplissage attesté |
| Usage réel de Quack AI et valeur économique du jeton | **NON MESURÉS INDÉPENDAMMENT** | [Registre de connaissance](../data/crypto/research/asset-knowledge.json), [documentation Q402](https://q402.quackai.ai/docs) |

**Attention à un lien historique devenu dynamique :** le chapitre 2.C de ce dossier décrit **la valeur de `qualification-latest.json` telle qu'observée le 17 octobre à 19:16 UTC**. Le [fichier `qualification-latest.json` actuel](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/qualification-latest.json) a été **remplacé par des relevés ultérieurs** (édition consultée : `2026-11-07T23:51:40Z`) et **ne contient plus Q parmi les 20 candidats de cet instant**. Son absence dans cette sélection dynamique **ne prouve pas un délisting Bitget**. Ne pas attribuer son carnet actuel aux chiffres historiques du 17 octobre.

**Ce qui a été fait dans cette reprise :** lecture de l'ancien dossier, des observations, du catalogue historique et du registre de connaissance ; confrontation aux annonces Bitget et à CoinGecko ; insertion des références et de l'état de preuve ci-dessus. **Aucune recopie des données, aucune modification des fichiers JSON ni de l'interface ou du moteur ; aucun ordre.**

**Point d'arrêt : Q réconcilié sur le plan documentaire.** La même méthode pourra ensuite être appliquée à **ICNT**, puis **FLUID**, mais ces deux dossiers **ne sont pas présentés comme audités ici**.
