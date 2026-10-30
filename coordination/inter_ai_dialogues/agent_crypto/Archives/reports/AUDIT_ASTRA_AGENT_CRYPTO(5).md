**Audit Astra — Agent-Crypto : progrès G3, chargement et intégrité du stockage**

Relevé du 20 septembre 2026, arrêté sur **40.6.290**, commit `e44ddfd385c73c25498dd583867544802c988b73` daté de 18:13:57 UTC. Lecture seule du projet : aucune modification de GitHub, de Notion, des données opérateur ou des paramètres de trading.

**Avis.** Les corrections récentes ont réellement renforcé les refus G3 et le chargement Evidence. La restauration de la fenêtre Aether traite aussi une dépendance précise. Mais le mécanisme de vérification du stockage comporte une course susceptible de remettre une ancienne valeur à la place d'une nouvelle. Le chargeur général peut, lui, annoncer sa disponibilité malgré un échec irrécupérable par son API. Ces deux points méritent une correction ciblée avant de poursuivre l'allègement du stockage ou de considérer le démarrage fiabilisé.

**Périmètre et valeur des preuves**

| Élément | Vérification |
|---|---|
| Référence du code | Commit .290 ci-dessus, parent déclaré .289 |
| Fichiers sélectionnés | 49 fichiers locaux comparés aux empreintes Git blob de cette révision : 49 identiques |
| Market Core déclaré | 38.15.11 |
| Gates déclarées | PAPER ONLY ; G3 PENDING ; G9 LOCKED |
| Sources de continuité | Conversation fournie ; passages récents ciblés du dernier Fil Crypto ; cockpit Notion et changements GitHub |
| Tests locaux | 7 scénarios G3 ; 6 scénarios chargement/stockage, dont témoins positifs |
| Nature des tests | JavaScript du dépôt inchangé, exécuté dans des contextes isolés avec données fictives et dépendances simulées |
| Firefox / Bridge | Aucune connexion à la session de Christophe ; aucune validation visuelle ou mesure sur ses machines effectuée ici |
| Publication | Code .290 vérifié dans le dépôt ; cet audit ne certifie pas le déploiement Pages ou le rendu Firefox |

Les sept sondes G3 ont été exécutées sur la copie .283 ; les fichiers qu'elles utilisent sont identiques à ceux vérifiés dans .290. Les six nouvelles sondes utilisent directement la copie .290. Les identifiants historiques de certains tests décrivent les défauts recherchés : le verdict vient de leurs résultats, pas de leur nom. La liste des empreintes, les sorties et le code des sondes sont inclus dans le fichier de preuves joint.

La relecture du Fil est ciblée, pas une affirmation de lecture intégrale de ses 381 184 lignes. Les anciens ZIP et captures restent des références historiques ; ils ne remplacent pas le code actuel. Les captures récentes référencées dans Notion n'ont pas été inspectées visuellement pendant cette passe.

Sources : [commit de référence](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/e44ddfd385c73c25498dd583867544802c988b73), [build.json](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/build.json), [cockpit Notion](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099).

**1. Ce qui a réellement progressé**

| Changement | Conclusion de l'audit |
|---|---|
| Refus G3 renforcés en .279 | Une décision T0 incomplète, deux seuls points sur 24 h, une cadence contractuelle absente ou un doublon temporel contradictoire ne passent plus jusqu'au reçu strict dans les scénarios testés. |
| Chargeur Evidence | Une panne donne 25/26 et `complete=false`. Une seconde demande récupère uniquement le module manquant : 26/26 et `complete=true`. Le défaut constaté dans l'ancien audit est corrigé dans ce propriétaire. |
| Consultation prioritaire .284–.286 | Le chargement des fonctions secondaires a été déplacé. Les marques Graphique/Market Flow exigent désormais la marque du marché. Notion rapporte une amélioration terrain ; ce n'est pas une mesure réalisée ici. |
| Storage .287–.289 | L'identification des propriétaires et de la divergence attendue entre IndexedDB primaire et sauvegarde localStorage est pertinente. Deux cibles précises sont sélectionnées ; pas de nettoyage générique automatique. |
| Aether .290 | Le conteneur léger est créé avant l'initialisation du Window Manager, tandis que le runtime lourd reste différé. La cause de la perte des contrôles natifs est ainsi traitée dans le code. |

La .290 conserve explicitement `terrain_verified:false`. Il reste donc à observer ouverture, déplacement, fermeture/réouverture et restauration après rechargement ; le numéro publié n'est pas cette preuve.

Sources : [chargeur Evidence](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-demand-loader.js), [diff .283 → .290](https://github.com/BlueAzur-Hub/erith-ia-memory/compare/15f1ea46662d9106e5a60a90ff178288c7578ec4...e44ddfd385c73c25498dd583867544802c988b73).

**2. Priorité haute : une vérification de stockage peut écraser une valeur plus récente**

Propriétaire : `administrator/app.js`, fonction `atlasStorageReliefCopyTargets()`, ligne 5385 dans cette révision. La nouvelle interface .289 l'appelle dès **« Comprendre / vérifier »**, via `prepare()`.

En mode IndexedDB PRIMARY, la fonction lit le payload, attend son SHA-256, puis réécrit ce même payload avec `verified:true` et le remet dans le miroir mémoire. Pendant ces attentes asynchrones, le propriétaire normal peut enregistrer une valeur plus récente. La vérification ne compare aucune révision avant sa réécriture.

Scénario reproduit avec la fonction exacte, extraite sans modification :

1. La vérification lit la révision A.
2. Une écriture concurrente enregistre B pendant le calcul asynchrone du hash.
3. La vérification réécrit A dans la base et dans le miroir.
4. Elle renvoie pourtant `VÉRIFIÉ · IDB PRIMARY`.

Le témoin sans concurrence conserve correctement A. Le scénario concurrent finit également sur A : B est remplacée. **Cela démontre une possibilité de perte de mise à jour ; cela ne démontre pas qu'elle s'est produite sur le PC de Christophe.** La .289 n'a pas créé la fonction historique, mais la remet sur le parcours opérateur.

**Correction proposée :** rendre l'étape de vérification non réécrivante. Le reçu doit identifier exactement la clé, la révision et l'empreinte vérifiées. Si une métadonnée doit être attachée au record, la modification doit vérifier atomiquement que le payload/revision n'a pas changé ; sinon recommencer ou refuser. Réutiliser la sérialisation du propriétaire des écritures et tenir compte de `persistPending`/`persistScheduled`. Ne pas résoudre cela par un second stockage ou un verrou qui ne coordonnerait pas les autres onglets.

Au retrait, vérifier à nouveau que la preuve correspond à l'état courant. `atlasStorageReliefRetireVerified()` remet aussi le payload lu dans le miroir après une attente de hash : examiner ce même risque à cet endroit. Ne pas suspendre aveuglément les écritures métier et ne pas purger IndexedDB.

**Preuve de réception :** écriture B intercalée pendant la vérification, puis pendant le retrait ; B doit rester la dernière valeur persistée et lue. Une preuve A périmée doit être refusée ou recalculée. Aucun retrait local sans preuve actuelle.

Source : [Core — Storage Relief](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/app.js#L5385). Sonde P05.

**3. Le bilan Storage annonce « TERMINÉ » même si les deux retraits sont refusés**

Dans `storage-primary-truth-406289.js`, `retire()` calcule `local_absent` et `read_after_ok`, mais ne les utilise pas pour décider du statut général. Il fixe systématiquement `status:"TERMINÉ"` après l'appel canonique.

Test : plan initial admissible, puis retour `REFUSÉ · IDB PRIMARY NON VÉRIFIÉ` pour les deux clés. Résultat : les deux sauvegardes restent présentes, zéro octet libéré, mais le statut général est **TERMINÉ**. Les lignes détaillées conservent le refus : ce n'est pas un contournement de la protection, c'est un résumé ambigu de l'opération.

**Correction proposée :** dériver `RÉUSSI / PARTIEL / REFUSÉ / ÉCHEC` des résultats par clé et de la relecture. Séparer « traitement terminé » et « retrait réussi ». Conserver la confirmation et la sauvegarde ; ne pas transformer un refus en succès pour faire passer la gate.

Source : [Storage Primary Truth, lignes 85–107](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/storage-primary-truth-406289.js#L85). Sonde P06.

**4. Le chargeur général répète le défaut désormais corrigé dans Evidence**

`post-boot-runtime-loader-406281.js` contient actuellement 10 modules mémoire et 50 modules secondaires. Une erreur est bien enregistrée dans `failed`. Pourtant, la fin de boucle fixe `done=true`, marque `postboot-runtime-ready` et publie l'événement de disponibilité. La fonction retourne false, mais les consommateurs de l'événement ou de `done` peuvent poursuivre comme si la résidence était complète.

| Scénario | Chargés | `done` | Événement ready | Nouvelle tentative par `start()` |
|---|---:|---|---|---|
| Témoin complet | 60/60 | true | Oui | Inutile |
| Premier script en erreur | 59/60 | true | **Oui** | **Aucun chargement ; retourne false** |

Le verrou `if(state.started)return false` interdit la reprise. Une balise échouée reste par ailleurs présente avec `loaded=0`. Le chemin de réussite ne contrôle que l'événement `load`, pas l'API fonctionnelle attendue.

**Correction proposée :** reprendre le contrat déjà réussi dans Evidence : état par module, API attendue, distinction entre fin de tentative et disponibilité, reprise bornée des seuls échecs. Ne pas relancer les 59 modules réussis. Le groupe mémoire ne doit pas non plus annoncer prêt sans préciser ses éventuels échecs.

Source : [post-boot, lignes 100–131](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/post-boot-runtime-loader-406281.js#L100). Sondes P01/P02 ; comparaison positive P03 Evidence.

**5. La disponibilité des fonctions secondaires dépend trop d'Aether**

Le post-boot démarre maintenant après un événement Aether prêt ou échoué. Le chargeur Aether attend `load` ou `error` sans borne propre à cette requête. Si cette requête reste suspendue, le déclenchement automatique du reste peut attendre sans borne applicative. La borne de 120 sondes × 500 ms concerne l'attente des signaux de consultation avant le chargement d'Aether ; elle ne borne pas ce chargement lui-même.

Le clic explicite Strategy peut, à l'inverse, démarrer Evidence avant que ses prérequis, notamment Safety Certification, aient été chargés par le post-boot. Décaler un groupe améliore la réactivité initiale mais ne remplace pas une relation de dépendances vérifiable.

Les pauses codées totalisent **39,3 secondes après `start()`** : 10 × 180 ms + 2 500 ms + 50 × 700 ms. Sur le chemin normal, 1,5 seconde supplémentaire précède `start()`. Soit environ 40,8 secondes d'attentes programmées depuis le signal Aether, hors réseau, exécution et attente idle. **Ce calcul n'est pas une mesure du temps d'apparition du graphique.**

`yieldMain()` attend aussi `requestAnimationFrame()`. Les navigateurs suspendent habituellement ces callbacks dans les onglets masqués : ce n'est donc pas une garantie de progression pour les services résidents. [Documentation MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame). Le timeout de `requestIdleCallback` ne garantit pas non plus que le travail s'exécutera pendant une période libre. [Documentation MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).

**Correction proposée :** conserver la consultation prioritaire, mais dissocier disponibilité métier et réussite d'Aether. Le chargeur existant doit permettre à une demande utilisateur de promouvoir uniquement ses dépendances nécessaires, dans leur ordre. Ajouter des résultats explicites pour chargement suspendu/échoué et une reprise contrôlée. Réserver la synchronisation à la prochaine frame aux opérations de rendu ; ne pas recréer une dépendance à la visibilité pour les services résidents.

Source : [Consultation First](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/consultation-first-406286.js). Analyse statique ; la panne d'une session Firefox précise n'est pas imputée à cette cause sans trace runtime.

**6. Performance : « entrée → shell » ne mesure pas seulement le réseau**

Dans `index.html`, le manifeste et le shell sont attendus ensemble, puis le HTML est modifié et injecté par `document.write()`. La sonde `shell-ready` se trouve plus loin dans ce document, après son contenu principal et plusieurs scripts inclus avant elle.

L'intervalle mesuré peut donc contenir réception du manifeste, réception du shell, transformation, parsing et travail préalable du navigateur. L'attribuer entièrement à GitHub Pages ou au réseau serait une conclusion non établie. La correction causale Graphique/Market Flow .285 est utile mais ne découpe pas cette première phase.

**Correction proposée :** instrumenter dans l'entrée les débuts/fins de réception du manifeste et du shell, la transformation et le remplacement du document ; placer une marque au tout début du shell. Réutiliser Resource Timing pour les ressources. Comparer ensuite cache disponible, cache réseau froid et rechargement forcé sur Book/Ryzen, avec la même build. Les délais du scheduler doivent apparaître séparément des durées d'exécution.

Sources : [entrée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/index.html#L117), [sonde du shell](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/runtime-shell.html#L4579).

**7. Passer G3 : préserver une preuve reproductible, puis qualifier l'exécution**

Les refus d'amont sont mieux propagés. Le témoin complet valide ses résultats stricts ; l'horizon utilise bien `decision_at`. Exemple contrôlé : marché 01:00, décision 01:10, T+5 à 01:15. Cela ne constitue ni un backtest économique ni un déverrouillage live.

La sonde de changement de journée montre toutefois qu'une certification dépendant de la fenêtre courante peut ne plus être reconstruite quand cette fenêtre avance. Ce refus peut être correct pour le CURRENT ; il ne doit pas effacer la traçabilité de la preuve historique. Avant toute nouvelle couche, vérifier la conservation d'un paquet contenant décision T0, série exacte utilisée, provenance, contrat de cadence, versions de politique, horizons et empreinte. Distinguer ce reçu historique d'une réévaluation sur les données courantes. Ne pas figer un PASS si l'on découvre un défaut dans sa preuve.

Ensuite, pour l'exécution Paper, rattacher coûts, spread/slippage, latence, liquidité et éventuelles exécutions partielles à des observations et hypothèses explicites. Les sondes G3 de cet audit n'injectent pas le moteur Paper complet : leur absence de trades ne décrit donc pas le journal réel de Christophe. Les indicateurs historiques du manifeste ne sont pas davantage un compteur live.

**La gate passe lorsque les preuves requises sont réunies ; pas en renommant son statut, en forçant un trade ou en abaissant le seuil.** Une décision `NO_TRADE` correctement tracée reste une preuve utile de décision, sans être une preuve de rentabilité. Conserver G9 verrouillée.

Sources : [revalidation stricte](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-strict-outcome-revalidation-406228.js), [réalisme d'exécution](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/e44ddfd385c73c25498dd583867544802c988b73/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-strict-execution-realism-rebind-406229.js). Sondes N01–N07.

**8. Notion et ordre conseillé à la prochaine sœur IA**

Le cockpit Notion consulté, édité à 17:03 UTC, annonce .289 ; le commit .290 est postérieur. Ce décalage n'est pas une contradiction fonctionnelle. La page contient désormais des blocs d'images, mais leur présence ne signifie pas que cet audit a examiné leur contenu. Le cockpit doit être actualisé avec .290 et sa validation terrain encore en attente, puis avec les défauts reproduits ici. Éviter qu'une ancienne section « prochaine action » impose un parcours de stockage avant correction de sa vérification concurrente.

| Ordre | Action ciblée | Preuve suffisante pour clore |
|---|---|---|
| 1 | Corriger la concurrence de Storage Relief et son bilan opérateur | Une écriture plus récente survit ; refus/partiel restent visibles ; aucune suppression non prouvée |
| 2 | Réparer les états et la reprise du chargeur général | Panne injectée → partiel ; reprise → seul échec récupéré ; aucun faux ready |
| 3 | Vérifier Aether .290 et les demandes précoces | Fenêtre native après reload ; Strategy attend/promote ses prérequis ; Aether suspendue ne bloque pas tout |
| 4 | Achever la mesure du boot | Réseau, parsing, exécution, attente volontaire et disponibilité distingués sur Book/Ryzen |
| 5 | Consolider le dossier G3 | Relecture d'une preuve historique indépendante de la fenêtre courante, puis preuves d'exécution Paper suffisantes |

Préserver le graphique, Lecture Technique, Chronos, Oracle et les fonctions validées sans défaut démontré. Pour Storage Relief, l'intervention nécessaire se situe dans des fonctions précises du gros `app.js` : cela ne justifie aucune réécriture du Core. Les corrections proposées n'ont pas été appliquées par cet audit.
