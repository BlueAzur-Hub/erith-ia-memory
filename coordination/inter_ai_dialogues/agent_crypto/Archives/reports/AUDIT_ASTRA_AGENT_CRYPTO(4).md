**Audit Astra — Agent-Crypto, checkpoint 40.6.273 et nouveau Notion**

Relevé du 20 septembre 2026. Audit en lecture seule : aucune modification du dépôt, de Notion ou de la session opérateur.

**Avis principal.** La reprise sur .273 et la décision de mesurer avant d'optimiser sont justifiées. Le Notion constitue un index utile de continuité, mais certaines archives GitHub le contredisent encore. Deux défauts ont été reproduits dans le code actuel : un chargement partiel annoncé terminé et des certificats intermédiaires G3 trop permissifs. Les correctifs récents des horizons temporels sont réels ; ils ne corrigent pas toute la chaîne de validation des données.

**Base vérifiée et limites**

| Élément | État établi |
|---|---|
| Révision GitHub auditée | `486ad85182d673126fa96ec51a5f2a246d3fa8e5` |
| Build déclarée | 40.6.273, parent 40.6.272 |
| Market Core déclaré | 38.15.11 |
| Checkpoint .273 | `abb689e13c07013a149de17981566f736d0cdf1b` |
| .274 | Rejetée, runtime restauré vers .273 |
| Code récupéré | 31 fichiers, octets vérifiés par empreinte Git blob |
| Tests ciblés | 7 scénarios G3 et 2 scénarios du chargeur, sur code inchangé |
| Firefox Ryzen | PASS consigné dans Notion, non reproduit par cet audit |
| Transformer Book | NON TESTÉ dans la fiche Notion .273 |

Le diff net entre le checkpoint et la révision auditée ne contient plus de modification du runtime applicatif : il reste des données, le fil, des archives et les documents .274. C'est une preuve de restauration du code, pas une mesure de performance des deux machines. Le workflow Pages du HEAD consulté était annulé ; cet audit ne le présente pas comme un nouveau déploiement réussi.

J'ai relu les passages récents pertinents du dernier Fil Crypto, ses transitions .272/.273/.274 et la reprise Notion/instrumentation. Je ne prétends pas avoir relu intégralement ses 378 744 lignes. Le fichier se termine notamment par un verrou historique citant 40.4.286 : sa position en fin de fichier ne le rend pas actuel. Les captures du 17 septembre exploitées auparavant décrivent un état antérieur, pas une validation visuelle de .273.

Sources : [checkpoint](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/abb689e13c07013a149de17981566f736d0cdf1b), [comparaison avec la révision auditée](https://github.com/BlueAzur-Hub/erith-ia-memory/compare/abb689e13c07013a149de17981566f736d0cdf1b...486ad85182d673126fa96ec51a5f2a246d3fa8e5), [build](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/build.json).

**Le Notion est utile, dans le rôle qui lui est donné**

La page [AETHER · AGENT-CRYPTO INTERFACE](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) distingue correctement GitHub, runtime, fil historique et mémoire opérationnelle. Elle conserve une page centrale, des registres de builds/dettes/incidents, une cartographie du Core et un plan de mesure. Elle sépare également ce chantier du Memory Core personnel.

Je conserverais cette organisation. Il lui manque surtout des liens de preuve précis : commit de référence, empreinte des fichiers concernés, capture ou export daté, machine, scénario, verdict et condition de réouverture de la dette. La fiche .273 conserve un champ « cartographie encore nécessaire » alors que la page centrale la décrit désormais constituée ; il faut différencier cartographie initiale terminée et causalité des wrappers encore à examiner. Le champ SHA ZIP des deux fiches consultées est vide : rester explicite sur cette absence, sans inventer une empreinte.

Le Notion doit permettre de retrouver une décision et sa preuve ; il n'a pas à recopier tout le Fil Crypto. Pour chaque incident, un lien vers le passage source, le commit fautif et le rollback est plus utile qu'une nouvelle page de résumé.

**1. Incident .274 : cause comprise, documentation encore dangereuse pour la reprise**

Le Core `administrator/app.js` n'est pas vide : **3 343 435 octets**, blob `497f533dba427abeccdf939e202c561a617bc320`. `administrator/js/app.js` est un autre fichier, chargé de l'orchestration Administrator. Retirer le chargement du premier coupe une dépendance fondamentale. Il s'agit du retrait de son inclusion dans le shell, pas de la disparition physique du fichier du dépôt.

La fiche [Notion .274](https://app.notion.com/p/3e07754fe0848149bea6edbdef878984) porte bien REJECTED. Mais le [handoff GitHub .274](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/coordination/inter_ai_dialogues/agent_crypto/HANDOFF_40_6_274_BOOT_QUIETNESS.md) commence encore par « Current release: 40.6.274 » et qualifie ce transport de vide. Sa validation reste titrée PASS statique avec terrain en attente.

**Correction proposée :** conserver l'archive, ajouter en tête REJECTED, cause corrigée, commit fautif, rollback et checkpoint actuel. Ne pas laisser une future sœur suivre le handoff périmé. Le garde de release doit contrôler les dépendances réellement chargées et un scénario fonctionnel minimal : marché disponible, sélection valide, courbes réelles, Lecture Technique et Oracle alimentés. Syntaxe valide et numéro de build ne suffisent pas.

L'échec de .274 n'établit pas que toute idée de chargement à la demande est mauvaise : l'essai a été contaminé par la suppression du Core. Ces idées restent à évaluer séparément, après mesure.

**2. Défaut reproduit : le chargeur .273 termine même lorsqu'un module échoue**

Dans [strategy-a-evidence-demand-loader.js](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-demand-loader.js), les erreurs de chargement deviennent un avertissement console. La boucle continue, met `complete=true` et publie l'événement de disponibilité pour toute la liste.

| Scénario contrôlé | Modules chargés | `complete` | Reprise explicite |
|---|---:|---|---|
| 26 chargements réussis | 26/26 | true | Aucun nouveau chargement nécessaire |
| Premier script en erreur | 25/26 | **true** | **Aucune nouvelle tentative** |

Le script échoué reste dans le DOM. En plus, `present()` assimile la présence d'une balise à un chargement réussi. Le test simule les événements réseau/DOM ; il ne prétend pas reproduire une panne effectivement observée dans ton Firefox.

**Correction à préparer dans ce propriétaire :** états par module (`loading`, `loaded`, `failed`), contrôle de l'API attendue, résultat global partiel tant qu'une dépendance nécessaire manque, puis reprise explicite bornée des seuls échecs. Ne publier prêts que les modules réellement utilisables. Préserver l'ordre des dépendances. Un simple événement `load` ne garantit pas non plus qu'un script n'a pas levé une exception pendant son exécution.

Preuve de réception : même panne injectée, état partiel visible ; deuxième demande après rétablissement, dépendance récupérée une fois ; aucun doublon de listeners ou de fonctions.

**3. Mesurer le démarrage : oui, mais mesurer l'achèvement réel**

Le plan Notion de `performance.mark()` et `performance.measure()` est la bonne prochaine étape. Deux distinctions sont indispensables.

Dans le Core, `atlasColdBootNext()` démarre une tâche par frame et incrémente `executed` sans attendre la résolution des tâches asynchrones. Cela ne prouve pas un défaut du scheduler : c'est son contrat actuel. En revanche, « toutes les tâches lancées » n'est pas « tous les services prêts ». Ajouter un `await` pour faciliter la mesure changerait le comportement et fausserait le diagnostic.

Le chargeur Evidence démarre également après `window.load` puis un passage idle. Ce signal ne certifie pas que les données du graphique sont prêtes. Le téléchargement et l'évaluation d'un script injecté ne deviennent pas entièrement contenus dans le créneau idle qui a déclenché son insertion. Le timeout de `requestIdleCallback` peut déclencher du travail lorsque le navigateur reste occupé. Sources : [MDN, requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback), [MDN, load](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event).

| Mesure | Point de repère et condition à distinguer |
|---|---|
| Manifest / shell | Fetch, réception, remplacement du document : étapes distinctes de `index.html` |
| Core | Évaluation du Core ; ne pas confondre avec son téléchargement ou sa compilation |
| Cold Boot | `atlasColdBootStart`, lancement de chaque tâche, puis fin réelle de son travail |
| Auto Reader / Livecheck | `startAutoReader`, `atlasRunStartupLivecheck`, `runLivecheck` ; distinguer succès et échec |
| Graphique | État prêt avec séries réellement rendues ; pas seulement appel d'une fonction nommée « graph-ready » |
| Lecture / Oracle | Données correspondant à la sélection et au snapshot mesuré, pas simple présence des panneaux |
| CURRENT | Même identifiant de snapshot entre pending et fermeture ; une attente normale n'est pas un blocage UI |
| Window Manager | Fin de `manager.init` dans `js/app.js`, distincte du démarrage du Core |

Exemple concret : le Core appelle `atlasRuntimeDemandWakeAtlas("graph-ready-comparison")` après des branches qui peuvent conserver un état graphique bloqué. Cette étiquette seule n'est donc pas une preuve suffisante pour une marque « graphique utilisable ».

Réutiliser les diagnostics existants (`atlasRuntimeNavigationSnapshot`, `atlasRuntimeResourceSnapshot`). Donner aux mesures un identifiant de démarrage et, lorsque nécessaire, un snapshot. Ne pas convertir une marque manquante en durée zéro. Éviter qu'une erreur de mesure interrompe le métier ; `performance.measure()` doit recevoir des marques valides. [Documentation MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure).

Comparer ensuite Ryzen et Book avec la même build, en séparant démarrage avec cache disponible, cache réseau froid et rechargement forcé. Un rechargement Firefox ne garantit pas à lui seul un cache froid. Aucune valeur de durée n'est inventée ici : il reste à les mesurer sur les machines.

**4. G3 : les corrections récentes sont réelles, mais des refus se perdent encore**

Les couches .226/.228 ancrent bien les horizons sur `decision_at`. Test contrôlé : marché à 01:00, décision à 01:10 ; l'ancienne couche cherchait T+5 à 01:05, la couche stricte le cherche à 01:15. C'est une correction importante. Le stockage durable .272 sauvegarde également cycles, coûts et états Paper : il serait faux de continuer à qualifier tout le système d'éphémère.

En revanche, la couche stricte consomme encore le checkpoint .200, qui reconstitue sa propre certification. Trois cas invalides en amont passent ainsi dans le reçu strict .228 :

| Données du test | Refus initial | Résultat ultérieur constaté |
|---|---|---|
| T0 sans direction, confiance et plusieurs entrées de stratégie | 0 T0 certifié ; dataset non prêt | Champs numériques remplacés par 0, T0 et reçu strict certifiés |
| Cadence attendue absente | `CADENCE_CONTRACT_UNKNOWN` | Cadence déduite des points, reçu strict certifié |
| Deux prix contradictoires au même instant | Doublon détecté ; couverture refusée | Doublon éliminé, reçu strict certifié |

Le cas témoin complet est accepté. Un cas avec seulement deux points séparés de 24 h montre aussi un contrat temporel trop permissif dans le checkpoint, mais sans décision jointe le reçu strict reste refusé : ne pas extrapoler ce test en PASS global.

**Correction proposée :** faire consommer au checkpoint la validation canonique des séries/T0 au lieu de recréer des critères plus faibles ; conserver `null` pour une entrée inconnue ; différencier cadence attendue et cadence observée ; remonter les doublons conflictuels jusqu'au reçu final. La couche temporelle stricte doit contrôler sa provenance, pas seulement ses calculs de rendement.

Sources : [checkpoint .200](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-cascade-checkpoint.js), [vérité stricte .226](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-strict-decision-time-truth-406226.js), [revalidation .228](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-strict-outcome-revalidation-406228.js).

Ces tests démontrent des faux positifs de certificats intermédiaires. Ils ne démontrent ni une promotion automatique de G3 ni un ordre réel : G3 reste PENDING et G9 LOCKED dans les objets contrôlés.

**5. Passer les Gates exigera des preuves raccordées, pas seulement du temps**

Dans [.229](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/486ad85182d673126fa96ec51a5f2a246d3fa8e5/public/agent_crypto_erith_ia/administrator/js/strategy-a-g3-strict-execution-realism-rebind-406229.js), la preuve terrain d'exécution partielle vaut toujours `false`, et latence/liquidité valent `NOT_PROVEN`. Cette prudence est correcte. Mais aucun nombre supplémentaire de trades ne transforme seul ces constantes en preuve.

La suite utile est de définir un contrat de preuve d'exécution : ordres Paper, demandes/accusés/fills horodatés, quantité demandée/remplie, prix, coûts, règles de latence et de liquidité, provenance et type de scénario. Séparer tests de mécanisme, simulation déterministe et observation Paper. Raccorder leurs reçus au validateur existant, sans assouplir les seuils pour obtenir un trade ni présenter les fixtures comme du terrain.

Autre limite reproduite : en faisant tourner la fenêtre de prix d'un jour, le même T0 perd sa certification stricte. Le stockage durable inspecté conserve les décisions et états Paper, pas un dataset historique immuable complet. C'est un test de la chaîne de calcul, pas de toute la persistance navigateur. Prévoir un reçu d'outcome versionné avec identifiants des points utilisés et provenance ; une modification de politique doit invalider explicitement un reçu, pas réutiliser silencieusement un ancien PASS.

**Ordre de travail recommandé à la prochaine sœur**

1. Garder .273 ; corriger les mentions de statut .274 dans les archives et compléter les preuves du registre Notion existant.
2. Préparer une instrumentation passive isolée, sans modifier scheduler, dépendances, CSS ou métier. Mesurer les fins asynchrones et les états réellement utilisables.
3. Corriger séparément le chargeur Evidence, avec le scénario d'erreur/reprise fourni comme test de réception.
4. Réparer séparément la propagation des refus G3, en conservant les trois cas invalides et le témoin complet.
5. Après ces preuves, définir puis raccorder les modèles de réalisme d'exécution et la conservation des outcomes. Ne pas promettre un PASS global fondé sur l'attente de nouveaux trades.

Conserver les avancées validées, ne pas relancer une refonte Aether ou Lecture Technique. L'objectif immédiat est une interface qui démarre de façon mesurable et dont les indicateurs disent exactement ce qui est prêt, incomplet ou refusé.

Les résultats détaillés, empreintes, fixtures et scripts de reproduction sont joints dans `PREUVES_AUDIT_ASTRA_AGENT_CRYPTO.json`. Aucun correctif n'a été appliqué pendant cet audit.
