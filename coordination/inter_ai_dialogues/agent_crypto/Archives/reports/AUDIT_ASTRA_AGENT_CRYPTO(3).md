# Audit Astra — Agent-Crypto : franchir les Gates avec des preuves

Audit du 16 septembre 2026. Périmètre : les archives 40.6.183, .184, .185, .187, .189 et les propriétaires de certification présents dans le dépôt 40.6.190. Lecture seule du projet ; aucun commit, déploiement, ordre ou changement de la session opérateur.

**Conclusion : les dernières versions améliorent effectivement la stabilité et la découverte des données. Elles ne terminent pas encore la chaîne de certification. Pour avancer, il faut fiabiliser les preuves, construire le jeu de données de replay, puis implémenter l’évaluation de ces preuves. Attendre ou cliquer davantage ne peut pas remplacer ce travail.**

## 1. État vérifié et limites

Le commit examiné est `d44eda810ba25cdcf3abb107e3a2699e1af7f1f2`. Son manifeste annonce **Administrator 40.6.190**, parent **40.6.189**, Market Core **38.15.11**. La .190 porte sur le placement de LOCAL AI, pas sur le franchissement des Gates. [Manifeste](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/build.json), [commit](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2).

Les trois contrôles GitHub consultés sur ce commit exact sont terminés avec succès : [Version Truth](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/35118517953), [Version Delivery](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/35118517752), [Pages](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/35118515132). Ce sont des preuves de livraison ; elles ne certifient ni les données de ton navigateur, ni la rentabilité, ni les neuf Gates métier.

Travail effectué :

- Indexation du Fil Interface Crypto fourni, puis relecture ciblée des corrections, contrats de preuve et derniers incidents pertinents. Le fichier compte 363 905 lignes ; je ne prétends pas avoir relu intégralement chacune de ces lignes.
- Comparaison de 52 fichiers locaux avec les empreintes des blobs du commit GitHub : 52 correspondances.
- Contrôle d’intégrité des cinq ZIP : aucune erreur CRC ; les 18 empreintes présentes dans les manifestes SHA des archives .183/.184/.185 concordent.
- Contrôle de syntaxe Node de 31 fichiers JavaScript : aucun échec.
- 21 cas de reproduction sur les sources non modifiées, en Node VM et DOM LinkeDOM, avec entrées contrôlées. Les résultats et le script sont joints au fichier de preuves.
- Relecture du Rulebook V1-3 déjà fourni pour distinguer tests logiciels, backtest, Paper et autorisation de réel.

Ce n’est pas un test dans ton Firefox, ni un accès à ton Bridge, à ton historique privé ou à ton compte d’exchange. Les anomalies ci-dessous sont des comportements reproductibles du code ; leur fréquence dans ta session n’a pas été mesurée.

## 2. Ce que les versions apportent réellement

| Version | Apport / constat | Conséquence pour la reprise |
|---|---|---|
| .183 | Archive de passation et de preuves, pas paquet complet de runtime. | Conserver la distinction entre résultat terrain daté et certification actuelle. |
| .184–.185 | Retouches des libellés de Gates et du rendu ; le fil rapporte ensuite une régression Firefox. | Ne pas réinstaller ces anciens index ou réactiver le correcteur de texte. La .186 a retiré son chargement. |
| .187 | Consolidation du cycle de rendu des preuves et retrait de surcharges de rendu. | À conserver : la survie des panneaux est reproduite dans mon test DOM. |
| .188–.189 | Lecture structurée des séries graphiques et découverte des propriétaires d’historique. | Bonne direction, mais la qualité de la série est surestimée dans certains cas et aucun backtest réel n’est produit. |
| .190 | Placement de LOCAL AI. | C’est le checkpoint GitHub de cet audit, pas une nouvelle preuve de Gate 3. |

Les deux modules JavaScript de l’archive .187 correspondent exactement au dépôt examiné. Les fichiers .189 fournis ne sont pas identiques octet pour octet aux fichiers actuels : le diff comporte notamment une réécriture de présentation/compaction du code. Je ne les présente donc pas comme un paquet strictement identique au HEAD. Les défauts signalés ont été reproduits sur les sources GitHub vérifiées.

Le fichier du correcteur .185 existe encore dans l’arbre, mais sa présence ne signifie pas qu’il est chargé. Il faut examiner l’index et le registre des scripts, pas seulement rechercher le nom d’un ancien patch.

## 3. Les réparations acquises

Il serait erroné de dire que rien n’a été corrigé depuis l’audit précédent.

| Cas | Résultat observé |
|---|---|
| Module requis absent au lancement explicite des tests | `INCOMPLETE`, plus un PASS par défaut. |
| Échec explicite puis rechargement de la même session | L’échec reste conservé. |
| Trade après coûts sans `closed_at` valide | Rejet `CLOSED_AT_MISSING_OR_INVALID`. |
| Historique ne portant que `saved_at` | Non retenu comme fait de marché par la rétrospective stricte. |
| Série structurée absente | Ses nouvelles métriques restent `null`, pas zéro. |
| Actualisation du dossier dans le test DOM .187 | Dossier, audit et trois suppléments G3 survivent ; aucune tâche ne reste dans la file simulée. |
| Nouvelle ligne après coûts et événement de changement | Le compteur affiché passe de 0 à 1, comme l’API. |

Les quatre modules de fondation réussissent aussi leurs autotests dans un environnement contrôlé préparé. Cela démontre un socle fonctionnel, pas sa validité sur toutes les données et tous les états limites. Les cas suivants montrent précisément les limites à traiter.

## 4. Défauts à corriger avant d’utiliser les badges comme certification

### A. Un ancien PASS peut rester applicable alors que ses modules ont disparu

**Priorité haute — intégrité de la preuve.** Dans `strategy-a-foundation-applicability-truth.js`, le chemin « résultat explicite enregistré » utilise `latest.pass` sans imposer l’applicabilité actuelle. Reproduction : exécuter les vrais autotests publiés, obtenir PASS, puis réutiliser ce résultat de session dans un contexte où les quatre API sont absentes. La réponse annonce encore `pass: true` avec `applicability_complete: false`.

Autre divergence : l’API publique peut annoncer Gate 2 `INCOMPLETE`, alors que `export_json()` exporte `FOUNDATION_PASS`. Le wrapper conserve l’export de l’ancien objet ; cette fonction appelle ses anciennes fonctions internes, pas la matrice corrigée.

**Correction ciblée :** conserver le reçu historique, mais subordonner son application courante à la présence des dépendances et à une empreinte des modules, de la politique et de la suite de tests. Un PASS d’un autre contexte devient « preuve antérieure, à revalider ». Faire lire l’interface, l’API et l’export au même producteur de vérité. Ne pas ajouter un nouveau correcteur de badges après rendu. Tests indispensables : dépendance absente, code changé, échec persistant et égalité matrice/export.

[Propriétaire d’applicabilité](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-foundation-applicability-truth.js), [certification / export](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-safety-certification.js). Reproductions F00–F04.

### B. « Série 24 h complète » ne signifie pas encore 24 heures de données complètes

**Priorité haute — Gate 1 puis Gate 3.** Le lecteur .188 accepte la série de comparaison lorsque `period === 1 || activePeriod === 1`. Le choix de période de l’écran peut donc imposer « 24 h » à une série appartenant à une autre fenêtre.

| Entrée contrôlée | Ce que le code annonce |
|---|---|
| Deux points séparés de sept jours ; écran réglé sur 24 h | Fenêtre 24 h, complétude 100 %, `STRUCTURED_24H_OWNER_PROVEN`. |
| Deux points couvrant seulement cinq minutes | Même fenêtre et même 100 %. |
| Quatre points couvrant 24 h, avec un trou de 1 430 minutes | Pas médian 5 minutes, complétude 100 %. |
| 289 points régulièrement espacés de cinq minutes sur 24 h | Résultat cohérent : cas témoin. |

La « complétude » calcule essentiellement la proportion de points acceptés parmi ceux reçus. Ce n’est pas la couverture de la période attendue. Le pas médian ne suffit pas à détecter un grand trou. Gate 3 reste heureusement `PENDING` dans tous ces cas : le défaut est une preuve descriptive trop forte, pas un passage au réel.

**Correction ciblée :** prendre la période de la source, contrôler les bornes temporelles, la fraîcheur, l’instrument, la devise et la provenance. Séparer `valid_point_pct`, couverture temporelle, nombre de trous et intervalle maximal. Comparer à une cadence attendue définie par le contrat de la source ; ne pas la deviner uniquement dans une série trouée. Une cadence inconnue doit rester inconnue. Conserver la série candidate brute et les motifs de rejet.

[Lecteur de séries](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-structured-data-truth.js), [découverte](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-history-owner-discovery.js). Reproductions S01–S05.

### C. Deux anciennes incohérences subsistent autour du nouveau lecteur structuré

L’ancien dossier peut encore reconstruire des informations depuis du texte affiché. Sur un texte portant seulement un nombre de points, son lecteur rend cadence et complétude égales à zéro. Le nouveau module évite cela, mais le chemin ancien reste consommable : « aucun scraping » n’est pas encore vrai pour l’ensemble du dossier et de son contrat G3.

L’adaptateur d’historique canonique accepte par ailleurs des prix BTC égaux à zéro ou négatifs, tant qu’ils sont numériques et finis. Deux lignes à 0 et −1 produisent `historical_input_ready: true`. Les lignes restent candidates et le backtest non prêt, mais elles ne devraient pas être qualifiées utilisables.

Enfin, la rétrospective stricte expose `time_truth`, tandis qu’un lecteur G3 attend `strict_time_semantics === true` : les dates sont filtrées correctement, mais le raccord de schéma annonce à tort que cette garantie est absente.

**Correction ciblée :** raccorder dossier, contrat et export au même objet structuré ; retirer leurs chemins de lecture du texte. Exiger un prix strictement positif et documenter l’unité. Aligner le schéma temporel et tester réellement les garanties qu’il expose. Ce sont des réparations de propriétaires existants, pas trois nouveaux panneaux.

[Dossier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-dossier.js), [adaptateur historique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-historical-evidence-adapter.js), [vérité structurée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-structured-data-truth.js). Reproductions S06–S07 et T03.

### D. L’autotest de replay peut contaminer son propre historique

**Priorité haute — Gate 2 et fiabilité des reçus.** Le replay conserve au maximum 64 résultats. Son autotest sauvegarde la longueur, ajoute sept scénarios, puis tronque à l’ancienne longueur. Si le tampon était plein, les insertions ont déjà supprimé sept anciennes entrées : la troncature ne restaure rien. Résultat reproduit : autotest PASS, sept résultats antérieurs remplacés par les fixtures de test.

Le contrôle d’acceptation constate `replay_result_store_unchanged: false`, mais annonce malgré tout PASS 7/7 : il n’intègre pas cet invariant dans son verdict global. Les identifiants construits avec la longueur du tampon se répètent aussi après saturation. Enfin, injecter `null` pour mouvement attendu et seuil de coûts aboutit à 0 ≥ 0 et `PAPER_SIMULATED` dans ce replay de scénarios.

**Portée :** ces tests concernent le moteur de scénarios et son historique local. Ils ne démontrent aucun ordre réel ni une corruption du portefeuille Paper opérateur.

**Correction ciblée :** évaluer les fixtures sans insertion dans l’historique, ou restaurer son contenu exact dans un `finally`. Découpler l’identité d’un résultat de la taille du tampon. Refuser null/vide/booléen comme nombres financiers. Faire dépendre PASS de tous les invariants de non-modification et de compatibilité de politique. Tester notamment 0, 63, 64 et plus de 64 entrées.

[Replay](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-replay.js), [acceptation](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/d44eda810ba25cdcf3abb107e3a2699e1af7f1f2/public/agent_crypto_erith_ia/administrator/js/strategy-a-replay-acceptance.js). Reproductions R01–R04.

## 5. Pourquoi les Gates ne passent pas en attendant

La matrice actuelle contient littéralement : Gate 1 `EVIDENCE_REQUIRED` ; Gates 3, 4, 5, 6 `PENDING` ; Gate 9 `LOCKED`. Gates 2 et 7 dépendent de la fondation ; Gate 8 reprend l’état d’échantillon des métriques après coûts. Les modules de découverte portent encore `certified_replay_rows: 0` et `backtest_ready: false`.

Ce verrouillage est prudent tant que les preuves manquent. Mais il manque aussi un évaluateur qui consomme ces preuves et puisse produire un verdict motivé. Modifier seulement ces chaînes en PASS serait une fausse certification.

Le replay existant teste sept scénarios prédéfinis. Il ne rejoue pas encore une série historique complète avec signaux connus à chaque instant, exécution, sorties et coûts. Il faut distinguer :

1. « Le logiciel répond correctement à des cas préparés » : fondation.
2. « La stratégie a été rejouée sans utiliser le futur » : backtest.
3. « Le résultat net est robuste sur des données non utilisées pour régler la stratégie » : validation statistique.
4. « Le système fonctionne durablement en conditions Paper » : exploitation simulée.

Les filtres DATA, REGIME, COST, RISK d’une proposition individuelle ne sont pas les neuf Gates de certification du projet.

## 6. La preuve nécessaire pour chacune des neuf Gates

| Gate | Ce qu’il faut réellement établir | Travail / preuve à produire |
|---|---|---|
| **1 — Qualité des données** | Les données sont identifiées, datées, utilisables et suffisamment couvertes pour l’usage déclaré. | Validateur de dataset : instrument/devise/source, dates de marché et de disponibilité, prix valides, doublons, trous, fraîcheur, rejets motivés et empreinte du jeu de données. Distinguer la qualité des données de marché de celle du journal d’exécution après coûts. |
| **2 — Cohérence logique** | La décision, le risque et le cycle d’exécution respectent leur contrat. | Réparer reçus/export et isolation des autotests ; figer stratégie et politique ; tester cas limites et invariants. Faire partager la même logique canonique au replay et au runtime, ou prouver leur équivalence. |
| **3 — Backtest réaliste** | Le replay prend ses décisions avec les seules informations disponibles à cet instant et simule des exécutions plausibles. | Dataset immuable, politique versionnée, sorties/horizon déclarés, frais/spread/slippage/latence/liquidité et fills partiels selon le modèle applicable ; rapport de décisions, refus, trades et résultats nets. |
| **4 — Hors échantillon** | Les résultats ne reposent pas uniquement sur les données ayant servi aux réglages. | Période de test chronologique non utilisée pour sélectionner les paramètres ; règles figées avant son ouverture ; rapport séparé. |
| **5 — Walk-forward** | Le comportement résiste à plusieurs séquences temporelles et régimes. | Fenêtres successives entraînement/calibration puis test ; gestion des chevauchements de positions et horizons ; résultats par fenêtre et agrégés. |
| **6 — Monte Carlo / stress** | Le risque reste acceptable sous perturbations pertinentes. | Stress de coûts, exécution, liquidité et chemins de résultats ; hypothèses et graines reproductibles ; préserver la dépendance temporelle lorsque nécessaire ; mesurer pertes extrêmes et drawdown. |
| **7 — Chaos** | Une panne ne produit ni action incohérente ni reprise aveugle. | Déconnexion/auth expirée, timeout ambigu, doublon, données désordonnées, erreur de stockage et redémarrage ; nouvelles entrées bloquées si état inconnu, suivi/réconciliation des positions préservés. Un `FOUNDATION_PASS` ne clôt pas ces essais intégrés. |
| **8 — Paper** | La stratégie et la chaîne complète fonctionnent avec des données arrivant réellement au fil du temps. | Journal durable, rapproché et après coûts ; version/politique/source de chaque décision ; refus également conservés ; taille et diversité d’échantillon définies pour la stratégie. |
| **9 — Micro-live** | Toutes les preuves requises ont été revues et le périmètre réel autorisé. | Reste verrouillée ici. Une future autorisation opérateur explicite, avec limites et exécution privée contrôlée, ne doit jamais être déduite d’un compteur ou d’un clic de reset. |

Le Rulebook fourni ne décrète pas qu’un nombre universel de 30 trades certifie une stratégie. Le seuil d’échantillon logiciel n’est pas une preuve de rentabilité. Les critères doivent être fixés avant d’observer les résultats ; un échec économique reste un résultat utile, pas une raison d’assouplir après coup le test.

Pour Gate 3, un historique BTC ne recrée pas à lui seul l’état Oracle, Atlas, du risque ou du portefeuille qui existait à chaque décision. Il faut soit des snapshots historiques réellement archivés, soit une reconstruction reproductible n’utilisant que le passé. À défaut, commencer une capture prospective des décisions et refus, même sans ouvrir de trade. Ne jamais appliquer l’Oracle actuel à toute une histoire de prix. Le contrôle de fuite d’information doit comparer ce qui est calculé sur l’historique complet et ce qui était calculable à chaque date. [Documentation officielle Freqtrade : lookahead analysis](https://www.freqtrade.io/en/stable/lookahead-analysis/).

Les séparations de validation doivent respecter le temps. Un intervalle d’exclusion peut être nécessaire entre apprentissage et test lorsque les horizons se chevauchent. La documentation de `TimeSeriesSplit` illustre ce découpage et son paramètre `gap` ; cet outil suppose notamment des observations également espacées pour comparer directement les durées de ses plis. Il ne dispense donc pas de contrôler la cadence de ce projet. [Documentation scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html).

## 7. Suite recommandée, bornée et vérifiable

**Lot A — Rendre la preuve fiable.** Corriger dans leurs propriétaires les défauts A à D ; ajouter les cas de régression joints ; publier un état cohérent entre API, écran et export. Conserver .187 et les garanties temporelles qui passent déjà. Ne pas réouvrir Atlas, Oracle, Aether, les graphiques ou la Lecture Technique pour réparer la certification.

**Lot B — Produire la première vraie ligne de replay traçable.** Raccorder les sources existantes à un enregistrement comprenant au minimum : identifiant stable, actif/paire/devise, date de marché, date de disponibilité, décision et motif, versions de stratégie/politique, entrées marché/Oracle/risque effectivement connues à t0, hypothèses de coûts/exécution et références de provenance. Les résultats futurs sont ajoutés séparément après l’horizon prévu et ne doivent jamais entrer dans le signal t0. Un refus `NO_TRADE` constitue une décision à conserver. Une première ligne prouve le raccord, pas Gate 3 entière.

**Lot C — Faire consommer le dataset par un vrai replay.** Exécuter la logique canonique, rapporter les pertes comme les gains et les refus, vérifier le modèle d’exécution et les coûts, puis brancher l’évaluateur de Gates sur des artefacts versionnés. Passer ensuite aux essais hors échantillon, walk-forward, stress et Paper sans réutiliser les fixtures comme observations de marché.

L’interface devrait montrer, pour chaque Gate : **état / preuve disponible / ce qui manque / prochaine action utile**. Exemple : « Gate 3 : historique repéré ; aucune ligne de replay certifiée ; prochaine action : construire et valider le dataset ». Cela évite de demander à Christophe d’attendre un compteur que le code ne sait pas encore faire progresser.

## 8. Consigne de reprise pour l’IA qui code

> Repars du HEAD vérifié ou vérifie son successeur avant toute écriture. Lis d’abord les propriétaires de la certification, de l’applicabilité, du replay et des sources G3. Ne réintroduis pas les retouches de libellés .184/.185. Préserve le cycle de rendu .187. Reproduis les cas F03/F04, S01–S03/S07 et R01–R04 fournis. Corrige une responsabilité à la fois, dans son propriétaire, puis prouve la non-régression. Aucun PASS ne doit venir d’un ancien reçu non applicable, d’un texte de l’écran, de données incomplètes ou de fixtures qui contaminent le journal. Après cette consolidation, construis un dataset t0 traçable et un replay réaliste. L’absence de trades n’autorise ni baisse des seuils ni opérations forcées. Gate 9 reste verrouillée. Les tests Node et GitHub ne remplacent pas la validation Firefox de l’opérateur.

Les fichiers de preuves permettent de refaire les cas sans toucher au navigateur de Christophe. Aucun correctif du projet n’est publié par cet audit.
