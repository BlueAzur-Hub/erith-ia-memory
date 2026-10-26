# SEVEN HEAVEN — MÉMOIRE ACTIVE PARTAGÉE

**FICHIER D'ENTRÉE UNIQUE pour la reprise inter-IA d'Agent-Crypto.**
**Dernier état consigné : 26 octobre 2026, après audit EUR/USD et premier contrat de validation monétaire isolé.**
**Adresse canonique stable :** `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_MEMOIRE_ACTIVE.md`
**Responsabilité :** Aerith-7 / Seven Heaven et continuité Aerith-8, Aerith-9, autres sœurs habilitées.
**Fonction :** index de reprise et journal de décision, non substitut aux sources ni mémoire automatique native du modèle.

> **À LA REPRISE :** lire ce fichier EN ENTIER, puis vérifier le code courant, le Notion et les pièces citées avant toute action. **À LA FIN :** mettre à jour CE MÊME FICHIER (pas un nouvel « état final » dispersé) avec ce qui a été fait, les preuves et ce qui reste. Si la lecture ou l'écriture du dépôt est impossible, le dire — ne jamais prétendre que la passation a été faite.

## 1 — Ordre de vérité et protocole

1. **Demande présente de l'utilisateur** et instruction STOP explicite (arrêt si saturation).
2. **GitHub réellement lu sur `main` :** fichier source, commit, CI et Pages à vérifier séparément.
3. **Derniers éléments datés du Fil Crypto** et dernières observations Firefox (ne pas assimiler « lu l'index » à « lu 508 205 lignes »).
4. **Notion maître** et rapports GitHub partagés ; confronter les dates et signaler les contradictions.
5. **Core Seven / Persona / Aether Key** et archives ciblées, sans tout charger.
6. **Hypothèses IA :** toujours annoncées comme telles.

Protocole : **source → lecture réelle ciblée → diagnostic → modification maîtrisée → test → preuve → dépôt partagé → actualisation de ce fichier → passation.** Ne pas demander au créateur des liens, ZIP ou exports déjà disponibles. Un document créé dans /mnt/data n'est PAS publié au partage tant que GitHub n'en confirme pas l'existence. Ne pas multiplier les correctifs `replaceAll("EUR","USD")`, les « pansements », les modules de surcouche, ni les versions dans les noms de fichiers/fonctions. Limiter les messages et les opérations pour éviter la saturation du fil. Si l'utilisateur stoppe, arrêter.

Ce fichier est **un protocole documentaire** : aucune autre instance ne peut être supposée l'avoir lu automatiquement. La reprise doit effectivement OUVRIR ce lien.

## 2 — Où sont les sources (liens stables)

- **Dépôt public** : https://github.com/BlueAzur-Hub/erith-ia-memory
- **Répertoire dialogue entre IA** : https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto
- **Notion maître** : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
- **Administrator** : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/index.html
- **app.js canonique** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/app.js
- **Relais historique (daté ; ne PAS traiter comme état le plus récent)** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_RELAY_CURRENT.md
- **Manifeste des preuves EUR/USD** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/MANIFEST_AUDITS_EUR_USD_20261026.md
- **Audit détaillé du trajet de prix** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/AUDIT_TRAJET_PRIX_EUR_USD_20261026.md
- **JSON Firefox des prix** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/PREUVE_FIREFOX_PRIX_HISTORIQUES_5_ACTIFS_20261026.json
- **Audit du Fil Crypto** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/RAPPORT_AUDIT_INTEGRAL_FIL_CRYPTO_20261026.md
- **Matrice EUR/USD 84 cas (NON exécutés)** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/Matrice_validation_graphique_EUR_USD_84_cas.csv
- **Statistiques du Fil** : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/Statistiques_integrales_fil_crypto_20261026.json
- **Aether Key portable** : utiliser le fichier `Seven_Heaven_Aether_Key.md` fourni par le créateur ; autorité Core `SEVEN_GATE.md` selon les règles de la clé. Les chemins privés ne doivent pas être copiés en clair avec leurs contenus dans le dépôt public.

**Fil Crypto long** : `Fil.Inteface.Crypto.GPT(20261026-040101).md` fourni dans la conversation le 26/10 (env. 21,6 Mo, 508 205 lignes). **Ce gros fichier n'est pas automatiquement inclus dans chaque fil ni dans ce dossier GitHub**. La fin contient un verrou ancien avec des versions `40.4.*` ; les pages chronologiquement plus récentes peuvent décrire `40.6.640` : ne PAS prendre la dernière ligne comme le code le plus récent. Si le fichier n'est plus accessible, consulter ses rapports partagés puis les sources de dépôt, et demander l'archive uniquement si l'extrait indispensable manque encore.

## 3 — État technique vérifié, protections, limites

- **Projet :** Agent-Crypto ERITH.IA. Administrator affiché **40.6.640**, Market Core **38.15.11** protégé. Source vérifiée du fichier `administrator/app.js` reçu : **68 106 lignes / 3 419 459 octets**, Git blob `c7a8905d956462c3944933558a110ca2742ac1eb`. **Ne PAS assimiler ce blob à une garantie du HEAD futur** : revérifier avant modification.
- **Exigence utilisateur :** USD **par défaut** avec sélection EUR ; les prix USD et EUR doivent être correctement présentés partout (Market, Graphique, Lecture Technique, Oracle, etc.), sans confondre **spot**, **historique natif**, **conversion FX**, **instrument d'exécution** ou **stablecoin USDC/USDT**. L'Interface est propriétaire originel du Market ; Trader et Operator doivent en hériter plutôt que maintenir des doubles contradictoires.
- **Six modes graphiques :** Solo, Top 3, Top 5, Hausses 5, Baisses 5, Volumes 5. **Sept périodes** : 24 h / 7 j / 30 j / 60 j / 90 j / 1 an / Max. Matrice élémentaire = **84 cas**, NON exécutée. Base100 est un indice sans unité ; le point doit aussi conserver un **prix historique brut** ET sa devise certifiée. Top5 doit conserver les identités du Market même si l'historique est indisponible ; ne jamais substituer des actifs.
- **Ce qui fonctionne partiellement :** captures Firefox BTC Solo 24h EUR Binance, USD CoinGecko ; Top3 et Top5 USD 24h visibles. Ce n'est pas une validation universelle.
- **État des caches Firefox, relevé utilisateur 26/10 :** 80 séries, 36 actifs, 27 720 points, dont 53 clés USD et 27 clés sans devise. Le magasin historique original limite à **80 entrées** ; une ancienne clé sans devise peut pourtant contenir `currency=USD`. `verified=false` concerne le cache global, ne prouve pas que tous les points sont faux.
- **Export preuve réel** : 23 séries couvrant BTC/ETH/BNB/XRP/SOL ; **14 clés USD / 9 sans devise** ; aucun conflit dans les champs déclarés. Par exemple BTC Binance EUR 24 h dernier échantillon **71 366,61 EUR** le 26/10 05:35Z et CoinGecko USD 24 h **80 159,31 USD** le 26/10 05:50Z. Les autres observations n'ont pas nécessairement des horodatages synchronisés ; sources et prix exigent vérification avant usage.
- **Rapport défectueux, NON réparé :** `atlasBuildAlignedComparisonEntries` conserve `rawPrice` dans les points normalisés Base100, `atlasComparisonTooltipRows` le récupère, mais `atlasExternalChartTooltip` substitue dans plusieurs comparaisons USD 24h le **spot Market USD** ou `—`. Test isolé Node VM sur vraie fonction : `rawPrice=71366.61`, spot simulé `80000` → `80000`; sans spot → `—`. **Le test ne certifie PAS tout Firefox.**
- **Validation invalide interdevises :** `atlasValidateChartSeries` peut comparer une série USD à `c.price` du Market, qui représente l'EUR ; cela est compatible avec les avertissements ~12 %, sans démontrer que les séries historiques sont corrompues. `integrityOk=true` peut coexister avec avertissements.
- **Dettes de conception :** clés de cache original `coin:period:source` **sans devise** ; métadonnées Chart.js défaut EUR ; `graph-native-usd-406520.js` déroge au chemin USD pour certains Top5 canoniques 24 h ; `global-quote-router-406514.js` peut convertir un historique EUR avec un **taux FX fixe** (pas un historique natif USD) ; surcouches multiples. **Aucune refonte ni correctif du moteur déployé au moment de cette passation**.
- **Travaux précédents P1/P2 :** PR #686–#688 sur Top5/Hausses5 24h, avec tests partiels. Ne pas traiter leur existence comme la certification de 6×7×2.
- **Autres parties à ne pas casser :** Market Core, Trader, Operator Yoann, Bridge, IndexedDB, OKX/Radar, mode F11, historique, compte réel utilisateur. Pas de transaction, pas de reset IndexedDB, pas de rollback automatique.

## 4 — Travail courant : remise en cohérence du cœur graphique

**Priorité P0 en cours au 26/10 :** rétablir un contrat UNIQUE des séries et de leur devise avant de corriger le tableau de prix.

**Déjà fait et publié :** audits source, inventaire Firefox, export ciblé 5 actifs, reproduction isolée du tooltip, liens dans le manifeste et Notion. Ne pas redemander ces informations. Aucune correction de production encore effectuée.

**Suite ordonnée :**

1. Établir la **vérité monétaire avant rendu** pour toute série : `coinId` exact, `quoteCurrency` prouvée, `source`, `instrument` éventuel, `periodDays`, `timestamps`, `points`, `fetchedAt`, garantie de couverture. `currency` dans la clé seule = déclaration, pas preuve ; ancienne clé sans devise = indéterminée tant qu'elle n'est pas qualifiée par la source/métadonnées réelles.
2. Unifier identités de cache et de contexte EUR/USD **sans effacer ni réétiqueter les caches existants** ; migration compatible uniquement après preuve, sauvegarde et tests.
3. Distinguer **prix historique du point** et **spot Market actuel** : jamais l'un à la place de l'autre. Si une courbe est EUR, ne pas présenter son `rawPrice` comme USD ; acquisition USD native ou conversion FX historique justifiée, source/date affichées ; Base100 reste sans unité.
4. Étendre le même propriétaire aux modes Solo/Top3/Top5/Hausses/Baisses/Volumes et 7 périodes ; validation 84 cas + transitions/cache/erreur réseau ; Market/Lecture Technique.
5. Protéger le checkpoint avant chaque livraison. Réaliser tests automatisés ciblés puis validation Firefox ; **publication `main`, Pages, ZIP et digest uniquement quand une version est effectivement demandée/validée et l'état de CI vérifié**. Ne pas créer des patches permanents indépendants pour chaque actif.

**Étape IMMEDIATE après ce fichier :** construire et tester en isolation un **contrat/validateur de séries historiques conscient de la devise**, dérivé des comportements réels d'`app.js` et des 23 preuves Firefox. **Ne pas retoucher les pages UI d'abord.** Relier les points `rawPrice` à la série autoritative avant de supprimer les substitutions du tooltip. Documenter précisément les tests et leur résultat ; ne pas déclarer l'écran corrigé tant qu'il ne l'est pas.

## 5 — Discipline du dialogue entre IA et de passation

- **À chaque reprise** : lire **ce fichier** ; constater les nouveautés du `main` avant toute action ; confronter les dernières preuves aux anciennes PR/rapports. N'utiliser que les documents nécessaires à l'action en cours.
- **À chaque étape achevée** : mettre à jour en tête du présent document la date, le *dernier état réellement vérifié*, les fichiers modifiés, commits et SHA, tests (distinguant statique / simulé / CI / Firefox), limites restantes et **UNE prochaine action concrète**. Corriger les informations devenues périmées ; maintenir le document lisible et éviter de le transformer en un second Fil Crypto.
- **Rapports volumineux** : les placer dans le **répertoire partagé GitHub**, puis les référencer ici. **Notion** = miroir/registre ; GitHub = preuves source et échanges entre IA. Un artefact seulement local à ChatGPT n'est PAS partagé.
- **Contradiction ou lien 404** : vérifier les chemins actuels, consigner le conflit, ne rien inventer et ne jamais inventer une validation Firefox ou une publication. **Dernier mot sur l'application : utilisateur, sur ses tests Firefox.**
- **Consignes d'usage** : présence Aerith claire, calme, précise ; respecter le STOP ; ne pas faire attendre sans retour ; produire plutôt que répéter l'inventaire. Éviter l'abus de fichiers versionnés et de notes dispersées.

## 6 — Journal court de passation

- **26/10/2026 — SUITE TECHNIQUE :** prototype de validation de séries, **hors runtime Administrator**, créé dans [tools/historical-quote-contract.cjs](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-quote-contract.cjs) (commit `a7311c4b192e153e5a63372e87bed7eb1659caf4`), avec [7 tests Node](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-quote-contract.test.cjs) (commit `1350daff040cf030cba30f27c5a9ddc0b1bfeef8`). **Contrôles directs en JS réalisés :** 23 séries échantillons classées 15 USD et 8 EUR sur la base des *déclarations de devise et de provenance* ; clé ancienne BTC CoinGecko déclarée USD correctement interprétée ; rejet d'une contradiction de métadonnées, d'une devise inconnue ; comparaison spot avec `priceUsd` en USD ou `priceEur` en EUR, **jamais `c.price` pour USD**, refus d'assimiler USDT/USDC à USD, nouvelle clé incluant la devise. **Attention : les 7 tests Node ont été écrits mais NON encore exécutés dans un environnement Node depuis le dépôt.** La devise est **qualifiée par indices**, pas vérifiée par interrogation réseau point par point. **Aucun fichier de production n'importe le prototype.** Prochaine action : exécuter les tests Node puis préparer un raccordement unique à `atlasValidateChartSeries` après contrôle de compatibilité et du chemin exact des données.


- **26/10/2026 — Aerith-7, point de départ partagé :** création de la présente **mémoire active unique** à partir de l'Aether Key utilisateur, des passages pertinents du Fil Crypto, du relais courant GitHub daté 24/10, du Notion du 26/10 et des audits du trajet EUR/USD / JSON de 23 séries. **Action faite : documentation seulement, pas de correctif UI.** Suite : validateur historique monétaire isolé.

---
