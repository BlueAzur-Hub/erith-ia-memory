# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.47  
**Build :** 28.3.47  
**Mission :** Adaptive Crypto Card Dock Lock


## Build 28.3.47 — Adaptive Crypto Card Dock Lock

Cette Build part exactement de la 28.3.46 et corrige uniquement la règle qui rendait le bouton **Latérale** indisponible malgré un Math Core déjà Réduit ou Dessus.

### Correction

- Suppression du verrou arbitraire `window.innerWidth >= 1540`.
- La disponibilité de la fiche latérale est maintenant calculée à partir de la **largeur réelle de Market Workspace**.
- Le tableau Market conserve une réserve minimale de **980 px** avant que l'ancrage soit autorisé.
- La fiche latérale conserve une largeur de **320–360 px**.
- En Math Core **Latéral**, la fiche Crypto reste flottante pour éviter trois colonnes concurrentes.
- En Math Core **Réduit** ou **Dessus**, le bouton Latérale devient disponible dès que la zone Market dispose réellement de la place nécessaire.
- Le message d'aide ne parle plus de « grand écran » ou de plein écran.
- La préférence Flottante / Latérale reste mémorisée.

### Rendu protégé

- Score ATLAS compact inchangé (`37`, `50`, etc.), jamais `/100`.
- Aucune colonne Market existante n'est élargie.
- Math Core reste toujours actif.
- Graphique, Target Top 5, Market Flow, Modules 01–11, simulation, mémoire, Binance/CoinGecko et Métaux inchangés.
- `web/index.html` et `web/runtime_config.json` inchangés.
- Le CSS 28.3.46 est conservé ; la 28.3.47 ajoute seulement l'extension responsive nécessaire entre 1280 et 1539 px.
- Version Control Protected Core inchangé hors identité 28.3.47.


## Build 28.3.46 — Crypto Card Dock / Floating Visual Stability Lock

Cette Build part exactement de la 28.3.45. Sa mission est volontairement unique : permettre de juger la fiche Crypto **flottante ou latérale**, sans rouvrir la géométrie validée du Market Snapshot.

### Nouveau comportement

- La fiche `FICHE CRYPTO · MARKET SNAPSHOT` propose deux modes discrets : **Flottante** et **Latérale**.
- **Flottante** reste le comportement par défaut et conserve la fiche actuelle.
- **Latérale** ancre la fiche dans une colonne dédiée à droite afin qu'elle ne recouvre plus les lignes du tableau.
- Le choix est mémorisé localement dans Firefox.
- La fiche latérale reste visible pendant le défilement et continue de recevoir les mises à jour live de la crypto affichée.

### Compact UI Lock

- L'ancrage latéral n'est proposé qu'à partir de **1540 px** de largeur et lorsque Math Core est en mode **Réduit** ou **Dessus**.
- Sur Transformer Book / écran compact, le comportement reste automatiquement **Flottant** : aucune colonne supplémentaire n'est imposée.
- Si Math Core passe en mode **Latéral**, la fiche Crypto revient au comportement flottant pour ne pas créer trois colonnes concurrentes.
- Aucune largeur de colonne Market existante n'est modifiée.

### Rendu protégé

- Score ATLAS inchangé : entier compact (`37`, `50`, etc.), aucun `/100`.
- Math Core Réduit / Latéral / Dessus inchangé.
- Market Snapshot, Graphique, Target Top 5 et Market Flow inchangés hors emplacement facultatif de la fiche.
- Modules 01–11, simulation, mémoire, Binance/CoinGecko, Métaux et Bridge inchangés.
- `web/index.html` et `web/runtime_config.json` restent inchangés.
- Version Control Protected Core strictement inchangé hors identité 28.3.46.


## Build 28.3.45 — Market Truth Labels + Visual Stability Lock

Cette Build part exactement de la 28.3.44 et corrige uniquement les ambiguïtés de lecture relevées sur les captures Market / Math Core.

### Rendu strictement protégé

- Le score ATLAS reste un entier compact (`50`, `59`, etc.) : aucun `/100`.
- Aucun changement de `style.css`, aucune largeur de colonne modifiée, aucun badge visible ajouté au tableau.
- Math Core Réduit / Latéral / Dessus, fiche Crypto, Market Snapshot et graphique gardent leur géométrie.

### Corrections

- Capitalisation >= 10^12 EUR : affichage en milliards explicites (`1 130 Md €`) au lieu de `1,13 Bn €`.
- Tooltip terminal du graphique : `PRIX LIVE BINANCE · VARIATION <période>` afin de distinguer le prix spot live de la performance de la période graphique.
- Contexte Math Core : distinction explicite `Spot LIVE Binance` / `série historique 30j · 721 pts`.
- Décision : libellé compact inchangé ; sa justification est visible dans la fiche Crypto et au survol de la cellule.
- 24 h, 7 j, capitalisation et volume : provenance exposée au survol sans ajouter de texte permanent dans le tableau.

### Préservation

- Modules 01–11 inchangés.
- Simulation, données, graphiques, Métaux, Bridge, mémoire et workflow inchangés.
- `web/index.html`, `web/style.css`, `web/runtime_config.json` inchangés.
- Version Control Protected Core inchangé hors identité 28.3.45.


## Build 28.3.44 — 11 Modules Active Recall + Automatic Memory Parity Lock

Cette Build part exactement de la 28.3.43 et applique aux **11 modules** les principes pédagogiques validés pendant la reprise détaillée des Modules 01 et 02.

### Invariant pédagogique commun

Le parcours suit désormais partout la même logique lorsqu'une question sert réellement à vérifier la compréhension :

**preuve / situation → réponse de mémoire → première tentative conservée → validation ou correction → explication → archive**.

L'application ne doit plus donner la conclusion d'une question dans le texte placé juste avant cette même question.

### Corrections principales

- Module 01 conserve son rappel actif déjà validé : observation BTC, provenance, première réponse, correction et explication.
- Module 02 conserve Ask/Bid et Marché/Limite en rappel actif ; sa question finale ne reçoit plus sa réponse dans la synthèse affichée avant le choix.
- Module 03 conserve ses scénarios figés −3 % / +5 % ; la question finale sur l'effet des coûts est désormais posée avant l'explication.
- Modules 04 à 11 : les choix pédagogiques des étapes 2 et 3 enregistrent désormais la première tentative avant d'afficher l'explication.
- Modules 04 à 11 : les fiches d'étapes masquent également le repère « À retenir » lorsqu'il révélerait la réponse avant la première tentative.
- Modules 02 à 11 : la question finale est présentée sans conclusion pré-écrite ; l'explication complète apparaît après le premier choix.
- Une première erreur reste conservée comme trace d'apprentissage ; une correction ultérieure ne l'efface pas.
- Les anciens modules déjà validés sont conservés : aucune première tentative historique n'est inventée rétroactivement.

### Mémoire automatique 01 → 11

- Le Journal pédagogique et le Data Collector automatique ne s'arrêtent plus aux Modules 01 et 02.
- Les archives vérifiées des Modules 03 à 11 produisent elles aussi une trace pédagogique dérivée, dédupliquée, sans clic supplémentaire.
- Les résumés conservent uniquement les preuves réellement présentes dans l'archive ; une preuve absente n'est pas inventée.
- Le Journal automatique montre les trois séances les plus récentes, tandis que toutes les archives restent conservées dans IndexedDB.
- L'archive pédagogique canonique reste la source de vérité ; la mémoire Collector reste une copie structurée dérivée.

### Images pédagogiques

Aucune nouvelle image n'est générée dans cette Build. L'audit identifie seulement les modules où une future vue expliquée serait utile. Les captures de base seront validées avec l'utilisateur au moment de reprendre chaque module.

### Préservation

- Aucun ordre réel, wallet réel ou clé API.
- Aucun reset global.
- Simulation Binance, Market, graphiques, Métaux, Bridge et workflow marché inchangés.
- `web/style.css` et `web/runtime_config.json` inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les trois constantes d'identité passent à 28.3.44.


## Build 28.3.43 — Memory Provenance + Distinct Snapshot Audit Lock

Cette Build part exactement de la 28.3.42 et clôt un audit ciblé des Builds 28.3.33 à 28.3.42 ainsi que des décisions du fil Crypto.

### Corrections

- `publicMarketSnapshot()` utilisait `state.mainSource?.name` alors que `state.mainSource` est une chaîne : la provenance des snapshots manuels pouvait donc devenir `source live` ou `null`.
- Le même snapshot exportait `volume_24h_eur` depuis `c.volume` alors que la donnée normalisée est `c.volume24h`.
- Les observations manuelles ne portaient pas systématiquement l'identité canonique du snapshot marché ; plusieurs clics sur le même état pouvaient être comptés comme plusieurs observations distinctes.
- La déduplication lit maintenant aussi `snapshot.market_snapshot.snapshot_id` et `snapshot.market_snapshot.source_time`.
- Les doublons déjà présents en IndexedDB sont réécrits sous forme canonique si la normalisation réduit le nombre de traces.
- Le Module 01 pédagogique n'emploie plus le tag ambigu `market_observation` mais `market_learning`, afin de ne pas le confondre avec une observation marché comparable.
- Les mémoires pédagogiques dérivées sont désormais réconciliées / mises à jour depuis l'archive canonique, sans créer de nouvelle trace.
- Les anciens enregistrements affichant littéralement `source live` sont présentés comme `source historique non qualifiée · ancien format` : aucune provenance n'est inventée.
- Aucun changement du Module 01/02 pédagogique, Binance, graphique, simulation, CSS, HTML ou workflow.
- Version Control Protected Core : logique inchangée ; identité passée à 28.3.43.


## Build 28.3.42 — Unified IndexedDB Memory + Panel Coherence Lock

Cette Build part exactement de la 28.3.41.

### Mission unique

Faire raconter la même vérité au Data Collector, à l’Explorateur, au Plan de collecte et à l’Assistant de reprise, tout en supprimant la dépendance lourde du Data Collector à `localStorage`.

- Le Data Collector utilise désormais une base **IndexedDB dédiée** (`agent_crypto_local_memory`) comme stockage canonique de ses traces.
- L’ancien `localStorage` Collector est lu une dernière fois, fusionné et dédupliqué, écrit puis relu dans IndexedDB ; il n’est supprimé qu’après vérification de la copie.
- Les archives pédagogiques des Modules 01 et 02 restent canoniques dans leur IndexedDB pédagogique ; leurs copies dérivées sont resynchronisées automatiquement vers la mémoire Collector.
- Tous les panneaux utilisent désormais le même cache Collector vérifié.
- Les **sessions pédagogiques** et les **observations marché** sont distinguées : une session d’apprentissage ne compte plus artificiellement comme un snapshot marché comparable.
- Le Plan de collecte considère **2 observations marché distinctes** comme seuil de comparaison ; une troisième observation enrichit la lecture mais n’est plus une obligation.
- L’Explorateur se remplit automatiquement et ne demande plus de cliquer « Lire mémoire » pour donner du sens au panneau.
- L’Assistant de reprise abandonne les anciens textes figés (« 3e snapshot », « V1.2-local-plan ») et se construit depuis l’état réel du parcours et de la mémoire.
- Les snapshots marché manuels, comparaisons ciblées et exports restent disponibles sous des outils facultatifs.
- Le message `quota has been exceeded` du Collector LocalStorage ne doit plus bloquer la mémoire pédagogique automatique.
- Modules 01 et 02 pédagogiques, Binance, CoinGecko, simulation et workflow marché : inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.42.


## Build 28.3.41 — Automatic Learning Memory Pipeline Lock — Modules 01 + 02

Cette Build part exactement de la 28.3.40.

### Mission unique

Supprimer les actions supplémentaires après l’apprentissage : les archives vérifiées des Modules 01 et 02 alimentent désormais automatiquement le Journal pédagogique et le Data Collector local.

- Au démarrage, les archives Module 01 / Module 02 déjà présentes dans IndexedDB sont relues et rétro-synchronisées automatiquement.
- À chaque archivage futur d’un Module 01 ou 02, une trace locale structurée est créée automatiquement après confirmation de l’archive IndexedDB.
- Déduplication par `session_id` : rechargement, réouverture ou nouvelle synchronisation ne crée pas plusieurs copies de la même séance.
- Le Journal pédagogique affiche automatiquement les apprentissages, provenance, réponses/corrections et simulation fictive du dernier Module 01 / 02.
- Le Data Collector affiche automatiquement le nombre de traces, la dernière origine, les tags pédagogiques et l’exposition fictive lorsqu’elle existe.
- Les boutons manuels sont conservés sous « actions facultatives » pour les exports et les snapshots supplémentaires ; ils ne font plus partie du parcours normal.
- Aucun prix ou fait manquant n’est inventé : une donnée absente reste explicitement indisponible.
- L’archive IndexedDB reste la preuve canonique ; le Data Collector reçoit une copie locale dérivée.
- Modules 03 à 11 inchangés dans cette Build.
- `web/runtime_config.json` et le workflow marché sont inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.41.


## Build 28.3.40 — Module 02 Visual Recap Focus Lock

Cette Build part exactement de la 28.3.39 réparée.

### Mission unique

Après la simulation fictive de 50 € BTC, cadrer directement la **Vue expliquée** ajoutée en 28.3.39 au lieu de sauter à l’étape 5.

- La simulation Binance et les preuves restent strictement inchangées.
- Le grand `PAPER TRADING SANDBOX` reste un moteur secondaire, pas une destination pédagogique.
- En cas de succès, le viewport vise `spotFoundationVisualRecap`.
- L’étape 5 reste immédiatement sous la vue expliquée et n’exige aucun bouton supplémentaire.
- En cas d’échec, le comportement de retour à l’étape 4 reste inchangé.
- `web/style.css`, l’image pédagogique, `web/index.html` et `web/runtime_config.json` restent inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.40.


## Build 28.3.39 — Module 02 Visual Recap + Pedagogical Isolation Lock

Cette Build part exactement de la 28.3.38.

### Mission unique

Transformer le résultat de la simulation fictive du **Module 02** en une **vue pédagogique lisible** sans renvoyer visuellement l’utilisateur dans le grand `PAPER TRADING SANDBOX`.

- Une **vue expliquée** est ajoutée juste après l’étape 4, dans le cockpit du Module 02.
- Cette vue affiche l’image pédagogique annotée et un bloc explicatif court : avant / après, argent disponible, montant placé, exposition et source de la cotation.
- L’image sert de repère visuel pour comprendre immédiatement les zones importantes : **950 € disponibles**, **50 € placés**, **exposition 50 € / 300 €**.
- Le titre de l’étape 5 devient plus clair : **« À toi de répondre »**.
- Le chemin de vérification du Module 02 reste maintenant ancré sur `learningFoundationPanel` ; il ne doit plus cibler `schoolPanel` comme destination pédagogique.
- Le moteur de simulation, Binance, CoinGecko, le contrôleur de version canonisé et les autres modules restent inchangés.
- Fichiers fonctionnels modifiés : `web/app.js`, `web/style.css`.
- Nouvel asset pédagogique : `web/assets/learning/module_02_spot_visual_recap.png`.
- `web/index.html` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.39.


## Build 28.3.38 — Resilient Binance Execution Quote Router + Public Snapshot Publication Lock

Cette Build part exactement de la 28.3.37.

### Mission unique

Séparer définitivement **prix d’exécution fictive** et **snapshot large de marché**.

- Les actifs couverts BTC / ETH / BNB / XRP / SOL utilisent d’abord le WebSocket Binance existant.
- Si le WebSocket ne fournit pas une cotation fraîche au moment exact de l’action, le navigateur demande une cotation publique Binance REST ponctuelle.
- Une simulation ne peut plus utiliser silencieusement un snapshot CoinGecko de plusieurs heures comme prix d’exécution.
- Le Module 02 demande directement une cotation Binance fraîche puis exécute son achat fictif de 50 € en un seul clic.
- La preuve pédagogique conserve maintenant la source et l’heure de la cotation utilisée.
- La valorisation d’une position virtuelle privilégie le WebSocket Binance frais, puis le dernier prix d’exécution enregistré ; CoinGecko n’est plus prioritaire pour cette fonction.
- Le snapshot public CoinGecko reste la source de largeur de marché (univers, capitalisation, volumes, rangs, historique) et peut rester affiché comme archive, mais il cesse d’être considéré comme analyse active après 45 minutes.
- Le workflow public CoinGecko passe à une cible de 30 minutes (minutes 17 et 47) et publie avec resynchronisation non destructive en cas de commit concurrent, sans `force push`.
- GitHub Actions reste un cache/snapshot : aucune promesse de temps réel n’est attachée à ce workflow.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.38.


## Build 28.3.37 — Module 02 Spot Single Click + Silent Simulation Focus Lock

Cette Build part exactement de la 28.3.36.

### Mission unique

Supprimer la « valse » encore visible après le clic de l’étape 4 du Module 02 en séparant enfin le **moteur de simulation** de son **grand panneau d’affichage** pendant cette action pédagogique.

- **Un clic suffit** sur « Simuler 50 € de BTC (fictif) ». Un verrou empêche tout second déclenchement pendant l’opération.
- Le bouton affiche immédiatement « Simulation en cours… » et la carte indique ce que fait le cockpit ; il n’est plus nécessaire de recliquer pour savoir si l’action travaille.
- La simulation de 50 € utilise le moteur existant, mais avec `render:false` : l’état du portefeuille virtuel et le journal sont bien écrits sans reconstruire le grand panneau Paper Trading placé plus haut dans la page.
- Cette séparation élimine les changements de hauteur successifs provoqués auparavant par `resetSimulation()` puis `simulateOrder()` ; c’était la source résiduelle de la « valse » même quand les rerendus du cockpit étaient regroupés.
- Après réussite, une seule reconstruction pédagogique est effectuée et un seul cadrage final vise l’étape 5.
- En cas d’indisponibilité réelle des données, l’étape 4 reste visible et le même bouton devient « Réessayer la simulation fictive » ; aucune progression n’est fabriquée.
- Le texte de l’étape 4 est raccourci : la définition de « position » passe dans une bulle d’aide et la consigne insiste sur le clic unique.
- Le moteur de simulation reste rétrocompatible : son rendu reste actif partout ailleurs par défaut.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.37.

## Build 28.3.36 — Module 02 Spot Livecheck Handoff + Local Result Focus Lock

Cette Build part exactement de la 28.3.35.

### Mission unique

Rendre l’étape 4 du Module 02 cohérente pour un débutant : le Livecheck reste un mécanisme technique en arrière-plan, l’achat de 50 € reste dans le cockpit pédagogique, et l’action ne doit plus envoyer l’utilisateur dans le haut du simulateur.

- Le verrou de viewport commence **avant** la vérification Livecheck.
- Si le Livecheck automatique de démarrage est déjà en cours, le clic pédagogique **rejoint cette lecture** au lieu de la considérer comme une panne.
- Si aucune donnée exploitable n’est disponible après l’attente, une seule lecture explicite est tentée ; en cas d’échec réel, le cockpit revient sur l’étape 4.
- Après succès, le simulateur reste un moteur technique secondaire : un seul cadrage final ouvre l’étape 5.
- « Position » est maintenant définie directement dans l’étape 4 comme la quantité de BTC détenue virtuellement après l’achat.
- Le bouton devient « Simuler l’achat fictif de 50 € de BTC ».
- Le résultat local affiche quantité détenue, prix d’entrée et argent virtuel disponible.
- Ask/Bid, Marché/Limite, IndexedDB, sécurité, Module 03 et moteur de simulation restent inchangés.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.36.


## Build 28.3.35 — Module 02 Spot Position Single Final Focus Lock

Cette Build part exactement de la 28.3.34.

### Mission unique

Supprimer la « valse » encore constatée dans Firefox après `Créer la position BTC fictive de 50 €` sans toucher à la simulation ni à la pédagogie.

- Le clic pédagogique retire maintenant explicitement le focus du bouton avant que le laboratoire soit reconstruit.
- Après la création de position, aucun pré-cadrage ni série de recadrages n’est exécuté : **un seul positionnement final** vise l’étape 5 après stabilisation du DOM.
- Les contrôles de stabilisation 80/180/420 ms de la 28.3.34 sont supprimés pour ce parcours : ils pouvaient eux-mêmes rendre plusieurs déplacements visibles.
- Si la position n’est réellement pas créée, l’interface reste sur la zone courante au lieu de remonter au début du laboratoire.
- La transaction de rendu unique et la neutralisation temporaire de `overflow-anchor` introduites en 28.3.34 sont conservées.
- Simulation, preuves, IndexedDB, Ask/Bid, Marché/Limite, bulles et Module 03 inchangés.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.35.


## Build 28.3.34 — Module 02 Spot Position Single Render Viewport Lock

Cette Build part exactement de la 28.3.33.

### Mission unique

Supprimer la « valse » encore visible après `Créer la position BTC fictive de 50 €` en traitant la cause réelle : plusieurs reconstructions successives du cockpit pendant une seule action.

- `resetSimulation()` et `simulateOrder()` continuent de mettre à jour la simulation exactement comme avant.
- Pendant cette action du Module 02 uniquement, les rerendus du cockpit pédagogique sont regroupés : trois reconstructions successives deviennent une seule reconstruction finale.
- Le scroll préparatoire de la 28.3.33 est retiré : aucun déplacement vers l’étape 5 n’est demandé avant la fin de la simulation.
- L’ancrage automatique du navigateur est neutralisé uniquement pendant cette transaction afin que Firefox ne compense pas les changements de hauteur.
- Après la reconstruction finale, l’étape 5 est positionnée directement puis contrôlée trois fois sur une courte fenêtre de stabilisation.
- Le verrou d’ancrage est ensuite restauré.
- Aucune modification de la logique de simulation, des preuves, d’IndexedDB, des bulles d’aide, d’Ask/Bid ou de Marché/Limite.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.34.

## Build 28.3.33 — Module 02 Spot Position Direct Focus Lock

Cette Build part exactement de la 28.3.32.

### Mission unique

Supprimer le détour visuel observé après le clic `Créer la position BTC fictive de 50 €`.

- Le bouton conserve exactement la même simulation fictive, les mêmes preuves et la même validation de l’étape 4.
- Avant que la simulation ne reconstruise ses panneaux, le cockpit cadre directement la destination pédagogique attendue : l’étape 5.
- Le moteur de cadrage existant est réutilisé : aucun second système de scroll n’est créé.
- Le cadrage préparatoire est immédiat, sans animation ni flash, afin d’éviter l’effet de « valse ».
- Après la simulation, le ciblage existant de l’étape 5 reste en place comme vérification finale.
- La correction est limitée au chemin Module 02 `spot` ; le Module 03 n’est pas modifié.
- Les bulles d’aide, le rappel actif Ask/Bid et Marché/Limite restent inchangés.
- Modification fonctionnelle : `web/app.js`, bloc pédagogique / navigation uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.33.

## Build 28.3.32 — Module 02 Market / Limit Active Recall Lock

Cette Build part exactement de la 28.3.31.

### Mission unique

Transformer l’étape 3 du Module 02 en rappel actif compréhensible : répondre d’abord, puis lire l’explication du type d’ordre.

- Situation A : l’utilisateur choisit d’abord entre `Ordre au marché` et `Ordre limite` pour un achat immédiat.
- Situation B : même logique pour un prix maximum d’achat fixé à 59 500 €.
- La première tentative de chaque situation est conservée séparément.
- Une erreur révèle l’explication correspondante, ne valide pas la situation et permet une correction.
- Une bonne réponse désactive uniquement la situation déjà validée ; l’autre reste active.
- Après la première tentative, le cockpit explique en langage humain : `ordre = instruction`, `marché = priorité à l’exécution`, `limite = priorité au prix choisi`.
- Des bulles `ⓘ` fournissent des indices facultatifs sans imposer leur lecture.
- L’étape 3 ne devient complète qu’après les deux réponses correctes ; le moteur de cadrage existant cible alors l’étape 4.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.32.


## Build 28.3.31 — Module 02 Ask / Bid Active Recall Lock

Cette Build part exactement de la 28.3.30.

### Mission unique

Transformer l’étape 2 du Module 02 en véritable rappel actif, sans toucher au carnet d’ordres réel, au Market, à la simulation ou au Version Control.

- La règle « meilleur Ask / meilleur Bid » n’est plus donnée avant le premier choix.
- Ask : l’utilisateur choisit d’abord entre les deux vendeurs ; la première tentative est mémorisée, puis l’explication apparaît.
- Bid : même logique côté acheteurs.
- Une première erreur ne valide pas l’étape ; elle est conservée comme trace d’apprentissage et l’utilisateur peut corriger.
- Une réponse correcte désactive uniquement le côté déjà validé afin de guider vers l’autre colonne.
- Le Spread pédagogique n’est révélé qu’une fois Ask et Bid correctement identifiés.
- Des bulles `ⓘ` donnent un indice sémantique sur Ask et Bid sans révéler le prix correct avant la tentative.
- Quand les deux côtés sont validés, le viewport reste dans le moteur pédagogique existant et cible directement l’étape 3.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.31.


## Build 28.3.30 — Livecheck Direct Market Focus Lock

Cette Build part exactement de la 28.3.29.

### Mission unique

Supprimer le détour visuel observé au clic sur `Lancer Livecheck` pendant le Module 01 : le parcours doit aller directement au Market, sans passage bref par l’ancienne position ou le haut de page.

- Avant de lancer le rafraîchissement réseau, le cockpit cadre immédiatement `market-workspace`.
- La couche de continuité du Market mémorise donc le bon viewport avant la reconstruction de la table.
- Le Livecheck, le Market Snapshot, la ligne Bitcoin, les preuves pédagogiques et IndexedDB ne changent pas.
- Le ciblage final de la ligne Bitcoin après validation de l’étape 2 reste en place.
- En cas d’échec Livecheck, le retour vers la zone pédagogique reste inchangé.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.30.



## Build 28.3.29 — Learning Viewport Settle & Reset Hover Lock

Cette Build part exactement de la 28.3.28 testée visuellement.

### Mission unique

Corriger le cadrage encore trop bas après certains rerenders, en particulier après `Repartir de zéro`, sans toucher aux données du parcours ni au Version Control Protected Core.

- Le moteur de focus pédagogique garde une cible unique, mais vérifie maintenant sa position après les petits changements de mise en page qui suivent un clic.
- Le premier cadrage reste immédiat ; deux contrôles courts corrigent uniquement une dérive réelle supérieure à 4 px.
- Après un reset/rechargement, trois contrôles dédiés à 120 ms, 420 ms et 1000 ms ramènent `learningSessionPlan` à 18 px du haut si Firefox l'a décalé pendant la stabilisation de la page.
- Aucun scroll supplémentaire n'est effectué si la cible est déjà correctement placée.
- Le bouton `Repartir de zéro` reçoit une bulle native au survol qui précise exactement ce qui est effacé et ce qui est conservé.
- Fichiers fonctionnels modifiés : `web/app.js` et la seule balise du bouton reset dans `web/index.html`.
- `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d'identité passent à 28.3.29.


## Build 28.3.28 — Learning Viewport Focus & Reset Lock

Cette Build part exactement de la 28.3.27 validée sur le Transformer Book et le Ryzen.

### Mission unique

Stabiliser le cadrage du parcours pédagogique après les clics, et garantir qu’un « Repartir de zéro » revient bien sur `01 · Marché et données · session guidée` à `0/5 étapes`.

- Le reset conserve son effacement limité à Agent-Crypto, puis recharge proprement l’application.
- Après rechargement, Firefox ne doit plus restaurer l’ancienne position verticale : le cockpit revient sur `learningSessionPlan`.
- Le gestionnaire de focus pédagogique résout désormais la cible **après** le rerender du cockpit (double `requestAnimationFrame`), puis la place en haut avec un décalage constant.
- Le scroll pédagogique est immédiat par défaut : plus de long déplacement fluide à travers la page (« envoyé valser »).
- Toutes les actions existantes qui utilisent `scrollToLearningTarget()` bénéficient de ce cadrage sans réécriture de leurs blocs fonctionnels.
- Aucun changement de contenu pédagogique, Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema, HTML, CSS ou `runtime_config.json`.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.28.


## Build 28.3.27 — Active Recall & Learning Guidance Lock

Cette Build part exactement de la 28.3.26 validée après rechargement forcé sur le Transformer Book.

### Mission unique

Renforcer l’apprentissage du Module 01 sans modifier son contenu de marché ni le Version Control Protected Core.

- Étape 5 : les preuves sont affichées avant la question, mais la conclusion n’est plus donnée avant la réponse.
- Ordre pédagogique : **question → réponse → validation → explication**.
- La première réponse est conservée comme trace d’apprentissage ; une erreur ne détruit aucune progression.
- La réponse correcte `Non` valide l’étape et révèle l’explication complète avant l’archivage.
- `Synthèse automatique` et `Notes personnelles` sont désormais deux zones visuellement distinctes ; le stockage historique reste compatible.
- Les anciennes auto-synthèses Modules 01/02/03 sont séparées à l’affichage sans migration destructive des archives.
- Ajout de bulles `ⓘ` accessibles au survol et au clavier sur Prix/24 h/7 j, provenance et rappel actif.
- Aucun changement Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema ou logique Version Control.


## Build 28.3.26 — Current Build Reverify Stability Lock

Cette Build part exactement de la 28.3.25 publiée.

### Mission unique

Corriger le faux état « Publication Build courant incomplète » observé sur le Transformer Book lors d’une revérification manuelle du Build déjà chargé.

- Si `version.json` annonce le même Build et le même token que `app.js`, le contrôleur confirme désormais l’identité courante sans retélécharger ni re-hasher HTML/CSS/runtime_config.
- Une incohérence même-Build / token différent reste refusée.
- Toute Build supérieure continue d’être vérifiée avec l’intégrité SHA-256 complète avant proposition d’installation.
- Le préchargement fort avant installation d’une nouvelle Build reste inchangé.
- Modules 01, 02, 03, Market, Graphique, Métaux, Simulation, HTML, CSS et runtime_config restent inchangés.



## Build 28.3.25 — Module 03 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.24 validée.

### Mission unique

Mettre `03 · Frais et gestion du risque` au même standard de navigation et de mémoire que les Modules 01 et 02 avant la reprise pédagogique de Christophe.

- Parcours fonctionnel conservé : coûts école, position BTC fictive de 50 €, scénarios −3 % / +5 %, brut / net et conclusion guidée.
- Étapes 1 → 2 → 3 → 4 → 5 : cadrage unique sur la carte canonique après rerender.
- Suppression des doubles scrolls concurrents propres au Module 03 ; une mauvaise réponse ne déplace pas la page.
- À 5/5, `Mes notes libres` reçoit `[AUTO-SYNTHÈSE MODULE 03]` sans écraser les notes personnelles.
- `risk_archive_prefill` conserve modèle de coûts école, position figée, scénarios figés, conclusion et verrous de sécurité.
- Les frais réels, le spread réel et le slippage réel restent explicitement non vérifiés ; aucune valeur réelle n’est inventée.
- `risk_learning_journal` conserve la synthèse pédagogique dérivée.
- Modules 01/02, HTML, CSS, runtime_config et logique du Version Control Protected Core restent inchangés.

## Build 28.3.24 — Module 01 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.23 validée avec le Module 02 archivé.

### Mission unique

Mettre `01 · Marché et données` au même niveau d’ergonomie et de mémoire pédagogique que le Module 02 avant la relecture complète de Christophe.

- Parcours fonctionnel Module 01 conservé : Livecheck, Prix / 24 h / 7 j, source + heure, conclusion guidée.
- Navigation des étapes 3 → 4 → 5 stabilisée : un rerender, un seul cadrage, aucun feedback concurrent.
- Les mauvaises réponses ne déplacent plus la page.
- À 5/5, `Mes notes libres` reçoit un bloc `[AUTO-SYNTHÈSE MODULE 01]` construit uniquement à partir des preuves figées de la session.
- Les notes personnelles existantes sont conservées.
- `market_archive_prefill` conserve observation BTC, variations 24 h / 7 j, source, heure, conclusion et verrous de sécurité.
- `market_learning_journal` conserve la synthèse pédagogique dérivée.
- Aucune recommandation, prédiction ou donnée manquante n’est inventée.
- Module 02 et Version Control Protected Core restent inchangés.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.

## Build 28.3.23 — Module 02 Auto-Synthesis & Archive Prefill Lock

Cette Build part exactement de la 28.3.22 validée dans le parcours Module 02.

### Mission unique

À la validation 5/5 de `02 · Spot et carnet d’ordres`, le cockpit transforme automatiquement les preuves déjà produites en mémoire pédagogique exploitable.

- Préremplissage automatique de `Mes notes libres` avec une auto-synthèse clairement balisée.
- Les éventuelles notes personnelles existantes sont conservées intégralement.
- Création d’un objet `spot_archive_prefill` dans les preuves pédagogiques : Ask, Bid, spread, types d’ordre, position fictive, capital restant, conclusion et sécurité.
- Création d’un journal pédagogique dérivé de ces mêmes preuves.
- Les frais réels, spreads réels de plateforme et slippage réel restent explicitement `non vérifiés` ; aucune valeur n’est inventée.
- Une session Module 02 déjà à 5/5 en 28.3.22 reçoit automatiquement le préremplissage lors du premier rendu 28.3.23.
- L’archive IndexedDB conserve automatiquement ces données lorsque l’utilisateur clique sur `Terminer et archiver le module`.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Le noyau de versionnage reste inchangé ; seules les constantes d’identité Build/token passent à 28.3.23.

## Build 28.3.22 — Guided Step Focus & Pedagogy Lock

Cette Build part exactement de la 28.3.21 validée sous Firefox.

### Mission unique

Corriger l’ergonomie du Module 02 — Spot et carnet d’ordres : un clic, un rerender, un seul cadrage sur l’étape suivante.

- Étape 1 validée → cadrage Étape 2.
- Bid / Ask terminés → cadrage Étape 3.
- Marché / Limite terminés → cadrage Étape 4.
- Position BTC fictive créée → cadrage Étape 5.
- Le feedback n’effectue plus de scroll concurrent.
- Ask / Bid et la Situation B sont reformulés pour réduire l’ambiguïté pédagogique.
- Aucun changement HTML/CSS/runtime_config.
- Noyau de versionnage 28.3.21 conservé ; seules les constantes d’identité Build/token évoluent.

## Build 28.3.21 — Two-File Version Control Final Lock

Cette Build part exactement de la 28.3.20 validée sous Firefox.

### Mission unique

Terminer la séparation du versionnage.

Le noyau actif est désormais :

- `web/app.js` → identité locale exécutée + contrôleur de mise à jour ;
- `web/version.json` → identité distante publiée + empreintes d’intégrité.

### `index.html` libéré

`index.html` ne contient plus :

- `meta[name="atlas-build"]` ;
- `meta[name="atlas-asset-token"]` ;
- numéro de Build dans les URLs de `style.css` et `app.js`.

Les libellés visibles de version sont remplis dynamiquement par `app.js`.

### `style.css` libéré

`style.css` ne contient plus :

- `ATLAS_ASSET_BUILD` ;
- `ATLAS_ASSET_TOKEN` ;
- `--atlas-asset-build` ;
- `--atlas-asset-token`.

La feuille de style ne porte plus le numéro de Build.

### Intégrité de publication

`version.json` conserve les empreintes SHA-256 de :

- `app.js` ;
- `index.html` ;
- `style.css` ;
- `runtime_config.json`.

Cela ne versionne pas HTML/CSS : cela permet seulement au contrôleur de vérifier qu’une publication distante est complète avant de proposer ou d’installer la mise à jour.

### Conséquence pour les prochaines Builds

Si une future Build ne modifie ni HTML, ni CSS, ni configuration runtime :

- `index.html` reste inchangé ;
- `style.css` reste inchangé ;
- `runtime_config.json` reste inchangé ;
- le versionnage peut évoluer uniquement avec `app.js` + `version.json`.

`build_history.md` et `README.md` restent documentaires et peuvent être mis à jour sans être lus par le runtime.
