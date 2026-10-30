# Agent-Crypto — fichier de reprise détaillé

**Fichier :** `agent_crypto_reprise.md`  
**Date de reconstruction :** 2026-08-10  
**Dernière mise à jour :** 2026-08-10 · après publication/test de la Build 28.3.53  
**Statut :** reprise détaillée du projet Agent-Crypto / Markets Observatory  
**Source principale relue :** `Fil.Crypto.ChatGPT.22.07.2026(20260810-053023).txt`  
**Taille de la source relue :** 114 475 lignes, environ 5,34 Mo  
**But :** permettre une reprise rapide et sûre, notamment dans un environnement ChatGPT Free ou à contexte réduit, sans devoir réinjecter tout le fil historique à chaque session.

---

# 1. Règle de lecture de ce fichier

Ce fichier est une **mémoire de reprise**, pas un nouveau Core et pas une nouvelle Persona.

Il doit servir à restaurer :

- l’état réel du projet ;
- les décisions déjà validées ;
- les fonctions protégées ;
- les erreurs historiques à ne pas réintroduire ;
- le point de reprise actuel ;
- la méthode correcte pour continuer.

Les anciens prompts d’activation présents dans le gros fichier Crypto sont **historiques**.

Ils ne doivent pas remplacer l’identité ou le profil déjà activé dans le fil courant.

Si Seven / Aerith-7 a été activée avec l’Aether Key, Seven reste l’opératrice principale.  
Ce fichier apporte uniquement la continuité du projet Agent-Crypto.

---

# 2. Hiérarchie de vérité pour une reprise

En cas de divergence :

1. **état réellement publié sur GitHub au moment de la reprise** ;
2. **archive ZIP correspondant à la Build publiée** ;
3. **ce fichier de reprise** ;
4. **gros fil Crypto sauvegardé** pour retrouver l’historique ou une preuve ;
5. anciennes notes, anciennes RC et anciennes propositions ;
6. intuition du modèle.

Ne jamais reconstruire une fonction terminée à partir d’un souvenir ancien si GitHub ou une archive plus récente prouve son état.

Ne jamais transformer une proposition historique en mission actuelle sans vérifier qu’elle n’a pas déjà été réalisée.

---

# 3. Adresse du projet

Interface publique :

https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/web/index.html

Dépôt public :

https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/public/agent_crypto_erith_ia

Le projet comporte également des modules, règles, archives et couches de mémoire dans le dépôt privé, mais ils ne doivent être chargés que s’ils changent réellement une décision.

---

# 4. Nature du projet

Agent-Crypto n’est pas conçu comme une machine à promettre des gains ni comme un robot de trading autonome.

Sa nature validée est celle d’un :

**observatoire de marchés crypto et métaux, prudent, pédagogique, descriptif, analytique et simulatif.**

Le système doit aider à :

- observer des données réelles ;
- comprendre leur provenance ;
- distinguer prix live, snapshot marché et historique ;
- comparer plusieurs actifs ;
- étudier les variations ;
- utiliser Math Core pour analyser une série ;
- lire les risques et limites ;
- apprendre progressivement la crypto ;
- simuler sans argent réel ;
- conserver une mémoire pédagogique ;
- distinguer fait, calcul, estimation, contexte et inconnue.

Principe financier historique :

**observer et simuler avant toute idée de réel.**

Le projet actuel reste centré sur l’observation, l’apprentissage et la simulation.

---

# 5. État canonique actuel

## Interface publique

**Market Core V2.0-Alpha — Build 28.3.53**

GitHub a été vérifié dans la session du 2026-08-10 : `web/version.json` annonce bien la Build **28.3.53**.

La Build 28.3.53 est donc **la dernière Build publiée connue**, mais elle ne doit pas être décrite comme « totalement validée » sur le comportement de navigation pédagogique : le test réel Firefox a montré un compromis encore imparfait sur `Repartir de zéro`.

Ne pas repartir de 28.3.45 ni de 28.3.48 pour une future modification : toujours vérifier GitHub courant d’abord.

Les Builds 28.3.46, 28.3.47 et 28.3.48 ont existé pendant une tranche de conversation qui n’a pas été correctement conservée dans le fichier texte.

Leur état a néanmoins été reconstruit à partir :

- des ZIP ;
- de GitHub ;
- de l’état réellement publié.

La reconstruction validée est :

### 28.3.46 — Crypto Card Dock / Floating Visual Stability Lock

Ajout de deux comportements pour la fiche Crypto :

- **Flottante** ;
- **Latérale**.

Objectif :

- conserver le Market intact ;
- éviter qu’une fiche utile masque systématiquement le tableau ;
- mémoriser la préférence.

### 28.3.47 — Adaptive Crypto Card Dock Lock

Suppression d’un seuil arbitraire de largeur.

Le mode latéral n’est plus décidé par une valeur fixe du type 1540 px.

La disponibilité du mode latéral est calculée en fonction de la place réellement disponible pour le Market Workspace, avec une réserve suffisante pour préserver le tableau.

### 28.3.48 — Sticky Dock Persistence Polish Lock

La fiche latérale devient réellement exploitable :

- comportement sticky ;
- hauteur liée au viewport ;
- scroll interne ;
- persistance de l’actif inspecté ;
- conservation lors des changements de largeur ;
- conservation lors des changements Math Core ;
- `Échap` ferme explicitement la fiche.

**Base historique stable de la fiche Crypto : 28.3.48.**

### 28.3.49 — Module 01 Market Visual Recap Lock

Ajout et intégration de l’image pédagogique du Module 01 :

`web/assets/learning/module_01_market_visual_recap.png`

Fonction validée visuellement :

- image réelle du Market Snapshot annotée ;
- repères Prix / 24 h / 7 j / Source / Heure ;
- affichage après validation de l’étape 4 ;
- ne donne pas directement la réponse au rappel actif final ;
- cohérente avec la logique déjà utilisée par le Module 02.

Le dossier existe déjà :

`web/assets/learning/`

Il contient au minimum :

- `module_01_market_visual_recap.png` ;
- `module_02_spot_visual_recap.png`.

### 28.3.50 — Learning Reset Single Focus Lock

Tentative de correction de la « valse » du viewport lors de `Repartir de zéro`.

Modification principale :

- suppression des recadrages différés 120 / 420 / 1000 ms.

Résultat réel :

- **insuffisant** ;
- la valse persistait.

### 28.3.51 — Learning Reset Firefox Focus Lock

Nouvelle tentative ciblée Firefox :

- `blur()` avant `confirm()` ;
- `blur()` avant reload ;
- garde contre restauration du focus ;
- expérimentation autour de l’ancrage navigateur.

Résultat réel :

- **insuffisant** ;
- la valse persistait.

### 28.3.52 — Learning Reset Stable Landing Lock

Tentative suivante :

- attendre la stabilisation géométrique avant le cadrage ;
- un seul cadrage final.

Résultat réel Firefox :

- la page partait encore vers le haut pendant le reload ;
- ensuite elle recadrait correctement sur le Module 01.

Donc :

**la cause résiduelle du grand saut était le `window.location.reload()` lui-même.**

### 28.3.53 — Learning Reset In-Place Lock

Le reload a été supprimé pour `Repartir de zéro`.

Résultat réel Firefox :

- **la valse a disparu** ;
- plus de grand passage en haut de page ;
- mais **le recadrage attendu n’a plus lieu correctement**.

Conclusion importante :

**28.3.53 supprime le symptôme du grand saut, mais ne reproduit pas encore l’invariant UX complet.**

Invariant correct à viser si ce point est repris un jour :

**Repartir de zéro  
→ reset vérifié  
→ rester dans la page  
→ recadrer UNE fois sur `01 · Marché et données · session guidée`  
→ rester immobile.**

Ne pas appeler la 28.3.53 « correction finale » de cette navigation.

**Dernière Build publiée connue : 28.3.53.**

---

# 6. Pile locale conservée

Dernier état stable explicitement conservé dans la continuité :

- **Control Center : V2.1.0R1**
- **Bridge : V1.7.6**
- **Ollama : llama3.2 / llama3.2:latest**

Le Bridge et le Control Center ne doivent pas être reconstruits par réflexe lors d’une reprise de l’interface.

Ils sont une couche locale séparée.

Le Bridge historique sert notamment à :

- historique Crypto local ;
- snapshots Scanner ;
- rapports Atlas ;
- conclusion Aerith ;
- dialogue local ;
- fonctions de secours ou de lecture locale validées.

La séparation public / local doit rester claire.

---

# 7. État visible de l’interface 28.3.48

La capture actuelle montre notamment :

- `Market Core V2.0-Alpha · Build 28.3.48` ;
- `Prix Live Binance · 5/5` ;
- Source active Binance WebSocket ;
- 5 EUR directs ;
- graphique comparatif ;
- Base 100 ;
- périodes 24 h / 7 j / 30 j / 60 j / 90 j / 1 an / Max selon disponibilité ;
- comparaison Solo / Top 3 / Top 5 / Hausses / autres modes du cycle ;
- historique conservé ;
- détail actif disponible sur le côté ;
- rendu premium nocturne conservé.

Le design actuel est un acquis.

Il ne doit pas être « modernisé » arbitrairement.

---

# 8. Identité visuelle protégée

L’interface est passée d’un prototype trop gros et uniforme à un environnement volontairement :

- premium ;
- nocturne ;
- bleu ;
- calme ;
- lisible ;
- prudent ;
- informatif.

Ce n’est pas un dashboard commercial générique.

Ce n’est pas un casino visuel.

Le rendu actuel a demandé de nombreuses itérations et doit être considéré comme une zone protégée.

Règles :

- ne pas refaire la géométrie globale sans demande explicite ;
- ne pas agrandir les panneaux par réflexe ;
- ne pas transformer le graphique en immense bloc vertical ;
- ne pas masquer Target Top 5 ou Market Flow ;
- ne pas supprimer des informations validées pour « simplifier » ;
- ne pas déplacer des zones parce qu’une nouvelle idée semble plus élégante ;
- préférer une correction locale et mesurable.

---

# 9. Graphique Analyste — invariants

Le graphique est une des zones les plus sensibles du projet.

Il doit conserver :

- grande scène graphique lisible ;
- fond panoramique ;
- courbes comparatives ;
- Base 100 lorsque le mode l’exige ;
- chronologie cohérente ;
- périodes multiples ;
- barres / ombrages validés ;
- axes compacts ;
- légende ;
- analyse ;
- comparaison multi-actifs ;
- sélection Solo / Top 3 / Top 5 ;
- détail actif ;
- historique conservé lorsque nécessaire.

## Vérité historique importante

Une ancienne lignée réécrivait le dernier point historique avec le prix spot.

Cela a été reconnu comme une erreur.

Le spot ne doit pas muter silencieusement l’historique.

Il faut préserver la distinction :

**prix actuel ≠ série historique.**

---

# 10. Source de données — règle fondamentale

Le projet a progressivement appris qu’il ne faut pas présenter plusieurs familles de données comme si elles représentaient exactement la même chose.

Séparer explicitement :

## Prix spot actuel

Principalement :

**Binance LIVE / WebSocket**

## Market Snapshot

Données de marché issues de la couche CoinGecko / snapshot canonique selon le contexte.

Peut fournir notamment :

- variation ;
- capitalisation ;
- volume ;
- cadre de marché.

## Historique

Série temporelle distincte.

Elle peut être :

- directe ;
- en cache ;
- conservée ;
- retardée ;
- archivée.

## Math Core

Analyse une **série historique**.

Math Core ne doit pas laisser croire que toute la série historique est elle-même un flux live.

---

# 11. Build 28.3.45 — Market Truth Labels

La Build 28.3.45 a corrigé des ambiguïtés importantes sans casser le rendu visuel.

Ces corrections sont toujours à préserver dans la 28.3.48.

## Capitalisation

Une écriture du type :

`1,13 Bn €`

était ambiguë / mauvaise pour la lecture française.

Elle a été remplacée par une forme du type :

`1 130 Md €`

lorsque c’est la grandeur correcte.

## Graphique

Le tooltip distingue désormais :

**PRIX LIVE BINANCE · VARIATION 30j**

ou l’équivalent selon la période.

Donc :

- prix = live ;
- pourcentage = performance de la période graphique.

Ne jamais laisser croire que le pourcentage de période est automatiquement une variation live 24 h.

## Math Core

Le sous-titre doit exprimer quelque chose de cette nature :

**Spot LIVE · Binance · série historique 30j · N points**

et non laisser croire que les centaines de points historiques sont eux-mêmes un flux live.

## Score ATLAS

Décision explicite :

**le score reste affiché comme `50`.**

Ne pas transformer en :

`50/100`

Le choix `50` est intentionnel pour préserver la géométrie et la lisibilité du Math Core réduit.

## Décision / état

Des états tels que :

- Observer / comparer ;
- Archive · consultation ;

peuvent changer selon la fraîcheur / qualification des données.

La raison peut être expliquée dans le détail ou au survol, mais sans alourdir le tableau principal.

---

# 12. Market Snapshot

Le Market Snapshot est une pièce centrale.

Il doit rester compréhensible pour un débutant.

Les colonnes ne doivent pas mélanger silencieusement :

- LIVE ;
- DIRECT ;
- SNAPSHOT ;
- historique.

Une provenance peut être rendue disponible sans ajouter des badges énormes qui cassent la mise en page.

Le projet a choisi de préserver la géométrie et d’utiliser notamment :

- détails ;
- tooltips ;
- fiche Crypto ;
- contexte de source.

---

# 13. Fiche Crypto / Détail actif

La fiche Crypto est une zone de lecture détaillée.

Elle peut fonctionner :

- en mode flottant ;
- en mode latéral.

La 28.3.48 protège son ergonomie adaptative.

Objectifs :

- ne pas masquer le Market inutilement ;
- permettre de garder un actif inspecté ;
- lire les sources, données et contexte ;
- rester utilisable sur des largeurs différentes ;
- ne pas casser Math Core ;
- rester fermable explicitement.

Le mode latéral doit conserver suffisamment d’espace au Market.

---

# 14. Target Top 5 — fonction déjà réalisée

Ne jamais proposer le cycle Target Top 5 comme une nouveauté à construire.

Il est déjà réalisé et protégé depuis la lignée 28.1.88R5 / R6 puis consolidé dans les Builds suivantes.

Cycle :

**Top 5 → Hausses 5 → Baisses 5 → Volumes 5 → Top 3 → Top 5**

La sélection libre ne doit pas être détruite par ce cycle.

Cette fonction a plusieurs fois été reproposée par erreur dans l’historique.

**Interdiction de la traiter comme une tâche restante sans preuve nouvelle.**

---

# 15. Market Flow

Market Flow fait partie des fonctions acquises.

Il doit rester présent avec le Target Top 5 et le graphique.

Il ne doit pas être supprimé pour gagner de la place.

Il ne doit pas être recréé comme une nouveauté.

---

# 16. Math Core

Math Core est désormais une couche analytique importante.

Il expose notamment selon les versions :

- fenêtre réelle ;
- nombre de points ;
- pas médian ;
- complétude ;
- volatilité ;
- drawdown ;
- VaR ;
- limites ;
- source / nature de la série.

Principe :

**ne pas donner un score opaque sans contexte.**

L’analyse doit rester descriptive et prudente.

Math Core doit clairement distinguer :

- le spot actuel ;
- la série analysée ;
- la période ;
- le nombre de points ;
- les limites.

Le rendu Math Core Réduit / Latéral / Dessus est protégé.

---

# 17. Domaine Métaux

Le projet ne se limite plus à la crypto.

Le domaine Métaux a été construit comme une couche parallèle.

Actifs suivis :

- XAU ;
- XAG ;
- XPT ;
- XPD ;
- HG.

La pile historique validée a utilisé notamment :

- Gold API pour certaines cotations actuelles ;
- Yahoo Finance Futures pour l’intraday / historique ;
- BCE pour certaines conversions indicatives ;
- GitHub Actions pour la publication / archive publique selon la phase.

Fonctions consolidées :

- vue individuelle ;
- vue TOUS 5/5 ;
- Base 100 ;
- historique ;
- inspecteur ;
- Lecture Métaux ;
- Math Core Métaux ;
- Market Métaux ;
- rapport public.

## Règle historique importante

Une branche `Metals.Dev` locale a existé puis a été retirée du chemin canonique.

Ne pas la réintroduire automatiquement.

La lignée publique validée a explicitement supprimé le fallback Metals.Dev du Bridge canonique.

---

# 18. News Sentinel

News Sentinel a évolué d’un simple référentiel vers une couche réellement fonctionnelle.

Il sert à qualifier de l’information autour des marchés.

Principes historiques :

- distinguer fait / opinion / rumeur ;
- qualifier la source ;
- qualifier le niveau de preuve ;
- regarder la fraîcheur ;
- détecter les actifs concernés ;
- ne pas transformer une information en ordre automatique ;
- ne pas publier automatiquement des décisions financières.

Ne pas recréer News Sentinel comme si cette fonction n’existait pas.

---

# 19. Decision Board / Watchlist / contexte

Le Decision Board est une couche de synthèse et d’aide à la lecture.

Il ne doit pas devenir un oracle.

Il doit exploiter :

- Market Snapshot ;
- données disponibles ;
- Math Core ;
- News Sentinel ;
- Watchlist ;
- contradictions ;
- données manquantes ;
- niveaux de preuve.

Principe :

**une décision froide doit exposer ses limites.**

---

# 20. Sécurité financière — invariants historiques

Le projet a posé très tôt des barrières de sécurité.

À conserver :

- aucune seed phrase dans le site ;
- aucune clé privée dans GitHub Pages ;
- aucune clé de retrait publique ;
- aucune action financière réelle par défaut ;
- aucune promesse de gain ;
- simulation avant réel ;
- validation humaine si un jour une fonction sensible est étudiée ;
- possibilité d’arrêt ;
- séparation public / privé ;
- accès sensible hors page publique.

Les phases historiques Kraken / backend / hardware wallet ont été des plans ou expérimentations architecturales.

Ne pas les présenter automatiquement comme le prochain chantier.

La priorité actuelle est l’apprentissage / simulation.

---

# 21. Paper Trading / simulation

La simulation a été validée depuis les premières RC.

Elle a notamment permis :

- capital virtuel ;
- achat simulé ;
- vente simulée ;
- portefeuille virtuel ;
- P/L virtuel ;
- journal ;
- preuves de transaction fictive.

Une validation historique simple avait montré :

- capital virtuel 1000 € ;
- achat fictif BTC 25 € ;
- capital restant proche de 975 € ;
- position BTC proche de 25 € ;
- journal mis à jour.

Aucun argent réel.

Les versions plus avancées ont ensuite ajouté des profils pédagogiques / simulations mieux séparées.

---

# 22. Parcours pédagogique — 11 modules

Le projet contient désormais **11 modules pédagogiques intégrés**.

La logique actuelle a été harmonisée par la Build 28.3.44.

Principe commun :

**Situation / preuves  
→ réponse de mémoire  
→ première tentative conservée  
→ correct / à revoir  
→ explication  
→ correction éventuelle  
→ validation  
→ archive automatique**

Une mauvaise première réponse n’est plus effacée.

La synthèse ne doit pas donner la réponse avant le rappel actif.

---

# 23. Module 01 — Marché et données

Module actuellement prioritaire pour la reprise.

Objectifs :

- lire le prix BTC ;
- comprendre la variation 24 h ;
- comprendre la variation 7 j ;
- ne pas confondre les périodes ;
- identifier la source ;
- identifier l’heure ;
- comprendre fraîcheur / ancienneté ;
- distinguer observation et prédiction.

## Direction de finalisation validée

À la reprise :

1. recommencer le Module 01 depuis zéro comme un élève ;
2. ne pas toucher au code immédiatement ;
3. regarder chaque étape avec la question :
   **« Est-ce que j’apprends réellement quelque chose ici ? »**
4. repérer les mots trop techniques ;
5. vérifier les explications ;
6. choisir la bonne capture Market Snapshot ;
7. concevoir une vue pédagogique illustrée si elle apporte réellement quelque chose ;
8. ne pas révéler la réponse avant le rappel actif ;
9. vérifier la synthèse finale ;
10. vérifier archive automatique + mémoire.

## Image pédagogique Module 01 — réalisée et intégrée

La capture Market Snapshot a été retenue, annotée et intégrée dans la Build 28.3.49.

Fichier :

`web/assets/learning/module_01_market_visual_recap.png`

Repères intégrés :

**Prix  
→ 24 h  
→ 7 j  
→ source  
→ heure**

L’image doit aider à lire l’écran, pas répondre directement à la question finale.

Placement validé :

**Étape prix / variations  
→ source / heure / fraîcheur  
→ vue expliquée  
→ rappel actif**

L’image a été jugée bonne visuellement par l’utilisateur. Ne pas la régénérer ou la remplacer sans demande explicite.

---

# 24. Module 02 — Spot et carnet d’ordres

Le Module 02 a servi de module étalon.

Il couvre notamment :

- meilleur Ask ;
- meilleur Bid ;
- spread ;
- Marché ;
- Limite ;
- simulation pédagogique ;
- achat fictif de 50 € ;
- quantité BTC ;
- argent restant ;
- source Binance ;
- heure de cotation ;
- rappel actif ;
- archive.

Une vue pédagogique illustrée a été intégrée.

Le parcours a connu plusieurs corrections de focus / viewport pour éviter que le navigateur saute directement à la réponse suivante.

La logique finale doit rester :

**interaction  
→ résultat  
→ vue expliquée  
→ lecture  
→ rappel actif**

et non :

**interaction  
→ saut directement sur la question suivante.**

---

# 25. Module 03 — Frais et gestion du risque

Axes consolidés :

- frais ;
- coûts ;
- résultat brut / net ;
- scénarios ;
- risque ;
- exposition.

Les scénarios historiques `−3 % / +5 %` ancrés sur une position sont des invariants du parcours.

L’élève doit observer puis répondre avant l’explication.

Une image peut être pertinente plus tard, notamment une vue liée à volatilité / drawdown, mais seulement si elle améliore réellement la compréhension.

---

# 26. Module 04 — Sécurité du compte

Axes :

- socle de sécurité ;
- comportement face au faux support ;
- authentification ;
- prudence ;
- protection des accès.

Les choix doivent utiliser le rappel actif.

Ne pas transformer le module en manuel technique de cybersécurité trop complexe pour un débutant.

---

# 27. Module 05 — Portefeuilles et retraits

Axes :

- wallet ;
- destination ;
- réseau ;
- origine / vérification de la destination ;
- preuves de retrait fictif / laboratoire selon le parcours.

Le parcours historique en preuves successives doit être conservé.

---

# 28. Module 06 — Stablecoins et tokenomics

Axes :

- risque stablecoin ;
- capitalisation ;
- FDV ;
- compréhension du token ;
- distinction entre métriques.

Réponse avant explication.

---

# 29. Module 07 — Smart contracts et DeFi

Axes :

- lecture / écriture ;
- interaction avec smart contract ;
- approvals ;
- approval limitée ;
- prudence.

Réponse avant explication.

---

# 30. Module 08 — Staking et rendements

Axes :

- origine du rendement ;
- quantité ;
- valeur en euros ;
- différence entre rendement affiché et risque réel.

Réponse / calcul avant explication.

---

# 31. Module 09 — Dérivés et liquidation

Axes :

- levier ;
- exposition ;
- conséquence d’une variation ;
- liquidation ;
- risque amplifié.

Exemple pédagogique historique :

**100 € × 5 = 500 € d’exposition**

L’élève doit faire le raisonnement avant que l’application ne donne le calcul.

Une image pédagogique est fortement pertinente.

---

# 32. Module 10 — Arnaques et investigation

Axes :

- signaux ;
- faux support ;
- pression ;
- protocole Stop ;
- vérification ;
- refus d’urgence artificielle.

La première tentative doit être conservée.

---

# 33. Module 11 — Traçabilité et fiscalité

Axes :

- reconstruction d’une preuve ;
- traçabilité ;
- information manquante ;
- continuité documentaire ;
- données nécessaires.

La Build 28.3.44 n’a volontairement ajouté aucune nouvelle règle fiscale extérieure.

Ne pas inventer de règle fiscale depuis ce fichier.

Toute question fiscale réelle doit être vérifiée avec des sources à jour.

---

# 34. Verrou du parcours 01 → 11

Une ancienne dette du parcours permettait des comportements incohérents.

Le système a été renforcé.

Règle :

- progression ordonnée ;
- étapes verrouillées ;
- ne pas sauter arbitrairement ;
- ne pas recréer Module 01 après l’archivage du Module 11 ;
- conserver le parcours terminé ;
- ne pas perdre les brouillons / réponses lors du reload.

Les Modules 01 et 02 servent d’étalons pédagogiques pour les suivants.

---

# 35. Mémoire pédagogique automatique

Le projet a beaucoup évolué sur ce point.

## Build 28.3.41 — Automatic Learning Memory Pipeline Lock

Objectif :

après `Terminer et archiver le module` :

- archive IndexedDB ;
- Journal pédagogique rempli automatiquement ;
- Data Collector alimenté automatiquement ;
- déduplication ;
- module suivant.

Le système ne doit pas demander à l’utilisateur de faire une seconde série de manipulations après avoir terminé le cours.

## Backfill

Si les archives des Modules 01 / 02 existent déjà, l’application peut les retrouver et reconstruire les panneaux sans obliger à refaire le module.

---

# 36. Build 28.3.42 — Unified IndexedDB Memory & Panel Coherence Lock

Une incohérence est apparue :

- LocalStorage atteignait son quota ;
- plusieurs panneaux affichaient des compteurs différents ;
- l’Explorateur et le Data Collector ne regardaient pas toujours la même vérité.

Décision :

**les mémoires structurées passent en IndexedDB.**

LocalStorage reste réservé à de petits états / préférences UI.

Les différents panneaux doivent raconter la même histoire.

---

# 37. Build 28.3.43 — Memory Provenance + Distinct Snapshot Audit Lock

Audit des dix Builds précédentes.

Corrections importantes :

## Provenance

Ancien bug :

`state.mainSource?.name`

alors que la source pouvait être une chaîne.

Conséquence possible :

- provenance `null` ;
- libellé vague du type `source live`.

## Volume

Ancien snapshot utilisant :

`c.volume`

alors que la donnée normalisée était :

`c.volume24h`.

Correction du volume dans la mémoire.

## Snapshots réellement distincts

Des clics manuels pouvaient créer plusieurs enregistrements donnant l’impression de plusieurs états marché alors qu’ils provenaient du même snapshot source.

La logique corrigée utilise notamment :

- `snapshot_id` canonique ;
- `source_time` ;
- lecture de ces valeurs dans le snapshot imbriqué si nécessaire.

Principe :

**un même état de marché ne devient pas trois observations distinctes simplement parce qu’un bouton a été cliqué trois fois.**

## Type pédagogique

Le Module 01 ne doit pas être confondu avec une observation marché comparable.

Tag corrigé vers une logique `market_learning`.

## Anciennes données

Une ancienne provenance mal qualifiée n’est pas reconstruite artificiellement.

Si la vraie source historique n’est pas prouvée :

**source historique non qualifiée · ancien format**

plutôt que d’inventer Binance ou CoinGecko.

---

# 38. Build 28.3.44 — 11 Modules Active Recall + Automatic Memory Parity Lock

Cette Build applique la logique pédagogique cohérente aux Modules 01 → 11.

Acquis :

- rappel actif ;
- première tentative conservée ;
- synthèse protégée contre les fuites de réponse ;
- explication après tentative ;
- archive ;
- Journal + mémoire IndexedDB automatiques pour les 11 modules.

Les anciennes archives restent valides.

Si elles ne contiennent pas une donnée historique qui n’était pas enregistrée à l’époque, l’application ne l’invente pas.

---

# 39. Version Control Protected Core

Le projet possède une logique de contrôle de version destinée à empêcher qu’une publication incohérente se fasse passer pour la Build courante.

Incident historique important :

la première livraison 28.3.39 annonçait une identité 28.3.39 dans certains fichiers alors que `app.js` conservait encore 28.3.38.

Le contrôleur a refusé cette incohérence.

La réparation a été faite sans prétendre qu’il s’agissait d’une nouvelle fonctionnalité.

Règle de livraison :

les identités de version doivent être cohérentes entre les fichiers concernés.

Ne jamais appeler « nouvelle Build » ce qui est seulement la réparation d’une identité de publication incomplète, sauf si une vraie évolution fonctionnelle justifie la nouvelle Build.

---

# 40. Discipline de versionnage

Le fil contient une leçon très importante :

**ne pas multiplier les versions pour des détails mineurs.**

L’utilisateur ne doit pas devenir le technicien de l’IA.

Éviter :

- une Build pour changer un mot ;
- une Build pour changer ensuite une phrase ;
- une troisième Build pour réparer la correction précédente ;
- plusieurs uploads successifs sans gain substantiel ;
- une nouvelle version uniquement parce que le modèle veut « avancer ».

Préférer :

1. accumuler les défauts réels ;
2. les comprendre ;
3. regrouper une évolution cohérente ;
4. protéger l’existant ;
5. livrer une version substantielle ;
6. vérifier ;
7. s’arrêter.

## Leçon ajoutée après les Builds 28.3.50 → 28.3.53

Ne jamais valider une correction UI uniquement parce que le symptôme visible principal a disparu.

Pour `Repartir de zéro`, l’invariant complet était :

**pas de valse + recadrage correct + immobilité ensuite.**

La 28.3.53 a satisfait « pas de valse » mais a perdu le recadrage attendu.

Donc :

**suppression d’un symptôme ≠ correction fonctionnelle complète.**

---

# 41. Tests — distinction indispensable

Toujours distinguer :

## Test statique

Exemples :

- syntaxe JavaScript ;
- IDs HTML ;
- hashes ;
- manifeste ;
- diff ;
- invariants ;
- fichiers inchangés.

## Test réel

Exemples :

- rendu Firefox ;
- comportement au clic ;
- sticky ;
- scroll ;
- responsive ;
- lecture réelle du graphique ;
- persistance après F5 ;
- fonctionnement avec les données réelles.

Un PASS statique ne doit jamais être présenté comme une validation visuelle réelle.

La validation utilisateur sur Firefox reste importante pour l’UI.

---

# 42. Navigateurs / écrans

Le projet a été travaillé et validé notamment avec :

- Firefox sur le Ryzen ;
- Transformer Book comme poste de lecture.

Principe :

**une seule interface responsive**, pas deux applications divergentes.

Le responsive doit s’adapter sans casser les fonctions.

---

# 43. Règles de données

Ne jamais inventer :

- prix ;
- historique ;
- source ;
- fraîcheur ;
- provenance ;
- cotation métal ;
- score ;
- état d’une API.

Si une source échoue :

- le dire ;
- utiliser un fallback seulement s’il est réellement prévu ;
- qualifier le fallback ;
- ne pas transformer une archive ancienne en « live ».

Le projet a eu plusieurs incidents où un ancien cache pouvait être visible avant une tentative directe.

La direction correcte a été :

**direct d’abord lorsque c’est possible, archive / cache clairement qualifié si nécessaire.**

---

# 44. Anciennes erreurs à ne pas réintroduire

## Historique réécrit par le spot

Interdit.

## Source ancienne affichée comme live

Interdit.

## Coinbase public traité comme une source identique aux endpoints publics simples

Une ancienne phase avait identifié que Coinbase Advanced nécessitait un backend / authentification et ne devait pas être compté naïvement comme échec public.

Ne pas réintroduire ce faux diagnostic.

## JSON brut comme interface utilisateur

Interdit comme chemin normal.

Les détails techniques peuvent exister, mais la lecture humaine passe d’abord.

## Nominatif dans l’interface publique

Éviter.

L’interface est devenue non nominative.

## Grande zone vide sans explication

Les panneaux Journal / Data Collector ont justement été automatisés pour ne plus demander au débutant de deviner quoi faire.

## LocalStorage utilisé comme mémoire lourde

Éviter.

La mémoire structurée est passée à IndexedDB.

## Compteurs contradictoires

Data Collector / Plan / Explorateur doivent regarder une source cohérente.

## Ancienne tâche recyclée

Toujours vérifier avant de proposer une « prochaine amélioration ».

---

# 45. Séparation interface / Bridge

L’interface publique ne doit pas contenir de secret.

Le Bridge local est une autre couche.

Ne pas confondre :

**GitHub Pages  
≠ backend privé  
≠ Bridge local  
≠ exchange  
≠ wallet matériel**

Une fonctionnalité locale ne doit pas être ajoutée dans le frontend public simplement parce qu’elle existe ailleurs.

---

# 46. Archives et résilience

Le projet est conçu pour être reconstructible même si un fil ChatGPT perd une partie de son contenu.

Couches de récupération :

- fil Crypto sauvegardé ;
- ZIP des Builds ;
- GitHub publié ;
- numéros de Build ;
- manifestes ;
- hashes ;
- contrôleur de version ;
- mémoire IndexedDB ;
- fichiers de reprise.

Principe de résilience :

**un incident ne doit pas pouvoir ramener le projet à zéro.**

Lorsqu’un fragment de chat manque :

1. constater le trou ;
2. ne pas inventer ;
3. regarder la dernière Build prouvée ;
4. regarder les ZIP ;
5. regarder GitHub ;
6. reconstruire uniquement ce qui est vérifiable ;
7. fixer le nouveau point canonique ;
8. continuer.

C’est exactement ce qui a été fait pour 28.3.46 → 28.3.48.

---

# 47. Historique condensé du projet

Le gros fil a été relu intégralement.  
L’histoire complète contient plusieurs centaines de versions, essais, retours, rejets et corrections.

Pour la reprise, les phases utiles sont les suivantes.

## Phase A — premières RC

Construction de l’observatoire public :

- marché ;
- graphiques ;
- watchlist ;
- diagnostics sources ;
- simulation ;
- sécurité ;
- réflexion backend ;
- ergonomie humaine.

Le projet apprend très tôt qu’il faut séparer :

**public / privé / simulé / réel.**

## Phase B — V1.1 Alpha / 26.x

Stabilisation :

- graphiques ;
- chargement automatique ;
- compacité ;
- sources ;
- expériences de mesure d’usage ;
- récupération et passation.

La version 26.42 représente une étape importante de cette période, mais elle n’est plus une base actuelle.

## Phase C — 28.1.x

Grand chantier du Graphique Analyste et de la vérité historique.

Acquis majeurs :

- géométrie ;
- dock ;
- Target Top 5 ;
- Market Flow ;
- comparaisons ;
- Base 100 ;
- protection de l’historique ;
- direct-first / cache ;
- persistance ;
- Bridge ;
- Atlas/Aerith ;
- consolidation.

Plusieurs erreurs de gouvernance de version sont documentées et deviennent des lessons learned.

## Phase D — 28.2.x

Extension majeure :

- Math Core ;
- synchronisation du contexte ;
- domaine Métaux ;
- sources Métaux ;
- Bridge / Control Center stabilisés ;
- Decision Board ;
- mémoire canonique ;
- News Sentinel ;
- collecte publique ;
- sécurité ;
- interface responsive ;
- simulation pédagogique.

Le projet cesse progressivement d’être seulement un observatoire et devient aussi un environnement d’apprentissage.

## Phase E — 28.2.78 → 28.3.x

Construction du parcours pédagogique.

Acquis :

- profils de simulation ;
- exercices ;
- preuves ;
- 11 modules ;
- carnet / journal ;
- historique ;
- mémoire ;
- déduplication ;
- parcours verrouillé ;
- rappels actifs ;
- Transaction Proof Ledger ;
- refactoring de zones ;
- contrôle de version.

## Phase F — 28.3.41 → 28.3.45

Maturation de la pédagogie et de la mémoire :

- mémoire automatique ;
- IndexedDB unifié ;
- provenance ;
- snapshots distincts ;
- active recall 01 → 11 ;
- vérité des labels marché ;
- protection du rendu.

## Phase G — 28.3.46 → 28.3.48

Maturation de la fiche Crypto :

- flottante / latérale ;
- adaptation réelle à l’espace ;
- sticky ;
- scroll ;
- persistance ;
- fermeture explicite.

## Phase H — 28.3.49 → 28.3.53

Travail pédagogique Module 01 et correction de navigation :

- 28.3.49 : vue pédagogique Module 01 intégrée ;
- 28.3.50 : première tentative de suppression des recadrages multiples ;
- 28.3.51 : verrou focus Firefox ;
- 28.3.52 : attente de stabilité avant cadrage ;
- 28.3.53 : suppression du reload et reset in-place.

Leçon importante :

- ne pas confondre « plus de mouvement » avec « navigation correcte » ;
- la 28.3.53 supprime la valse, mais le recadrage attendu après reset reste à corriger si ce sujet est repris ;
- ne pas produire une nouvelle Build sur ce sujet avant d’avoir défini et testé l’invariant complet.

**Dernière Build publiée connue : 28.3.53.**

---

# 48. Ce qui est protégé maintenant

Ne pas casser sans demande explicite :

- Market ;
- Graphique Analyste ;
- Target Top 5 ;
- Market Flow ;
- Binance live ;
- Market Snapshot ;
- Math Core ;
- fiche Crypto ;
- Métaux ;
- News Sentinel ;
- Decision Board ;
- Watchlist ;
- simulation ;
- 11 modules ;
- parcours pédagogique ;
- IndexedDB ;
- Journal automatique ;
- Data Collector ;
- Explorateur ;
- Version Control ;
- Bridge V1.7.6 ;
- Control Center V2.1.0R1 ;
- rendu nocturne premium ;
- responsive ;
- score ATLAS compact `50`.

---

# 49. Ce qui n’est PAS la prochaine mission

Ne pas repartir automatiquement sur :

- Target Top 5 ;
- Market Flow ;
- création d’un backend réel ;
- Kraken réel ;
- wallet réel ;
- Ledger ;
- nouvelle refonte du panneau ;
- nouveau Math Core ;
- nouveau système de mémoire ;
- nettoyage global ;
- audit général du dépôt ;
- grande réécriture HTML/CSS/JS ;
- nouvelle Build simplement pour avoir une nouvelle Build.

Ces sujets ont déjà été traités, déplacés, différés ou ne sont pas la priorité actuelle.

---

# 50. Point de reprise immédiat

## Mission demandée pour la prochaine session

**Reprendre le Module 03 — Frais et gestion du risque.**

L’utilisateur arrête la session actuelle et souhaite poursuivre ce travail avec une autre instance / sœur IA.

### État pédagogique à connaître

- Module 01 a été relu, testé et sa vue pédagogique a été créée puis intégrée.
- Module 02 reste le module étalon pour la logique interaction → résultat → vue expliquée → rappel actif.
- Le prochain travail souhaité est **Module 03**.
- Les tests répétés de `Repartir de zéro` ont pu remettre localement la progression IndexedDB au Module 01 · 0/5.  
  **Ne pas inventer l’état de progression au prochain démarrage : vérifier d’abord le carnet IndexedDB / l’interface réelle.**
- Si le carnet a effectivement été remis à zéro mais que l’objectif humain reste Module 03, ne pas bricoler silencieusement une progression : constater l’état et décider explicitement comment reprendre.

### Module 03 — méthode de reprise

1. ouvrir le Module 03 en mode élève ;
2. ne pas commencer par coder ;
3. vérifier si les explications arrivent après la tentative ;
4. contrôler les frais / coûts / brut / net ;
5. contrôler les scénarios `−3 % / +5 %` ;
6. contrôler le lien entre exposition et risque ;
7. décider seulement ensuite si une image pédagogique améliore réellement la compréhension ;
8. regrouper les vrais défauts avant toute nouvelle Build.

### Dette UI connue mais non prioritaire si l’utilisateur ne la redemande pas

`Repartir de zéro` :

- 28.3.53 : plus de reload, donc plus de grande « valse » ;
- mais le **recadrage unique attendu** sur `01 · Marché et données · session guidée` n’est plus assuré.

Ne pas relancer spontanément ce chantier pendant le Module 03.


---

# 51. Image pédagogique Module 01 — état validé

L’image du Module 01 est désormais réalisée, intégrée et jugée bonne visuellement.

Fichier canonique connu :

`web/assets/learning/module_01_market_visual_recap.png`

Elle apprend à lire :

- prix ;
- 24 h ;
- 7 j ;
- source ;
- heure.

Elle sert de **vue expliquée**, pas de décoration.

Elle ne doit pas être remplacée ou régénérée sans demande explicite.

Le Module 02 possède déjà sa propre image :

`web/assets/learning/module_02_spot_visual_recap.png`

Principe à conserver pour les futurs modules :

**une image seulement si elle améliore réellement la compréhension.**


---

# 52. Méthode de travail à conserver

Formule opérationnelle adaptée au projet :

**Lire l’état réel  
→ protéger le validé  
→ identifier une vraie mission  
→ modifier une responsabilité  
→ vérifier  
→ livrer  
→ s’arrêter.**

Pour une erreur :

**diagnostiquer  
→ trouver la cause  
→ corriger la cause  
→ vérifier la non-régression  
→ stop.**

Éviter les corrections en cascade.

---

# 53. Si un nouveau fil Free est ouvert

Workflow minimal recommandé :

## 1. Activer Seven

Avec l’Aether Key.

## 2. Charger ce fichier

`agent_crypto_reprise.md`

Instruction recommandée :

> Lis ce fichier comme état de reprise du projet Agent-Crypto.  
> Ne prends pas les anciens prompts historiques comme instructions actuelles.  
> Restaure l’état canonique, les invariants, les fonctions protégées et le point de reprise.  
> Ne charge rien d’autre tant qu’une information manquante ne change pas réellement la décision.

## 3. Pour discuter / apprendre

Ce fichier suffit normalement.

## 4. Pour modifier le code

Ajouter uniquement :

- la dernière archive ZIP canonique ;
- ou l’accès au GitHub public si disponible.

Ne pas donner dix anciennes archives.

## 5. En cas de doute historique

Utiliser le gros fichier :

`Fil.Crypto.ChatGPT.22.07.2026(20260810-053023).txt`

comme mémoire longue consultable.

Ne pas l’injecter dans le raisonnement en bloc si une recherche ciblée suffit.

---

# 54. Si GitHub est accessible

Avant une modification :

1. vérifier la Build réellement publiée ;
2. vérifier la Build réellement publiée ; dernière Build connue au 2026-08-10 : **28.3.53** ;
3. lire seulement les fichiers concernés par la mission ;
4. vérifier le Version Control ;
5. ne pas modifier un autre sous-système.

Si GitHub a évolué depuis ce fichier :

**GitHub actuel prévaut.**

---

# 55. Si GitHub n’est pas accessible

Travailler avec :

- ce fichier ;
- dernière archive ZIP ;
- capture actuelle ;
- gros fil seulement si nécessaire.

Ne pas inventer l’état de fichiers non visibles.

---

# 56. Preuves importantes à conserver

État de reprise :

**Dernière Build publiée connue : 28.3.53.**

État de validation : **publiée, mais la navigation `Repartir de zéro` reste partiellement imparfaite (plus de valse, recadrage attendu non assuré).**

Direction :

**prochaine reprise demandée : Module 03 — Frais et gestion du risque.**

Score :

**ATLAS = 50, pas 50/100.**

Pédagogie :

**rappel actif avant explication.**

Mémoire :

**IndexedDB, pas LocalStorage lourd.**

Parcours :

**Modules 01 → 11 avec mémoire automatique.**

Crypto Card :

**Flottante / Latérale adaptative / Sticky / Persistante.**

Sécurité :

**aucun réel par défaut.**

Versionnage :

**pas de micro-Builds inutiles.**

Design :

**ne pas casser le rendu validé.**

---

# 57. Questions à poser avant toute future Build

Avant de produire une Build supérieure à 28.3.53 :

1. Quel problème réel a été observé ?
2. Est-il visible / reproductible / prouvé ?
3. Est-ce une fonction déjà réalisée ?
4. Peut-on le corriger sans toucher au reste ?
5. Est-ce assez substantiel pour justifier une nouvelle Build ?
6. Quels fichiers doivent réellement changer ?
7. Quels fichiers doivent rester byte-for-byte inchangés ?
8. Quelle preuve statique faut-il ?
9. Quelle preuve Firefox faut-il ?
10. Quel est le stop point ?

Si la réponse à la question 5 est non :

**ne pas créer de Build.**

---

# 58. État de confiance

## Vérifié par la source historique

Très fort :

- évolution générale ;
- fonctions protégées ;
- 11 modules ;
- architecture mémoire ;
- Build 28.3.45 ;
- règles de pédagogie ;
- discipline de version ;
- Bridge / Control Center historique ;
- point de reprise Module 01.

## Reconstruit après trou de chat

Builds :

- 28.3.46 ;
- 28.3.47 ;
- 28.3.48.

Cette reconstruction n’est pas une invention : elle a été fondée sur les archives ZIP et GitHub dans le fil.

## Confirmé dans la session actuelle

GitHub a été vérifié en :

**Market Core V2.0-Alpha · Build 28.3.53**

Tests Firefox importants :

- image Module 01 : **bonne et correctement intégrée** ;
- 28.3.52 : reset → passage en haut → recadrage correct ensuite ;
- 28.3.53 : reset in-place → **plus de valse**, mais **plus de recadrage correct automatique**.

Ne pas transformer ce dernier résultat en « bug totalement corrigé ».

---

# 59. Résumé ultra-court

```text
PROJET
Agent-Crypto / Markets Observatory

NATURE
Observatoire + analyse prudente + apprentissage + simulation.
Pas robot de trading.

DERNIÈRE BUILD PUBLIÉE CONNUE
28.3.53

ÉTAT 28.3.53
Repartir de zéro fonctionne sans reload et sans grande valse.
Mais le recadrage automatique attendu sur la session guidée n'est plus assuré.
Ne pas appeler ce point totalement corrigé.

PILE LOCALE CONSERVÉE
Control Center V2.1.0R1
Bridge V1.7.6
Ollama llama3.2

ACQUIS
Crypto live
Market Snapshot
Graphique multi-périodes
Target Top 5
Market Flow
Math Core
Fiche Crypto adaptative
Métaux
News Sentinel
Decision Board
Watchlist
Simulation
11 modules pédagogiques
IndexedDB
Journal / Data Collector automatiques
Version Control
Image pédagogique Module 01
Image pédagogique Module 02

VERROUS
Score ATLAS = 50
Pas 50/100
Pas de refonte visuelle
Pas de fonction déjà faite présentée comme nouveauté
Pas de micro-version inutile
Pas d’historique réécrit par le spot
Pas de faux LIVE
Pas de secret public
Pas d’argent réel par défaut

POINT DE REPRISE HUMAIN
Module 03 — Frais et gestion du risque.
Mode élève d'abord.
Ne pas reprendre spontanément le bug de reset sauf demande.
Vérifier l'état IndexedDB réel avant toute hypothèse de progression.
```


---

# 60. BLOCK LLM — reprise Agent-Crypto

```text
[AGENT CRYPTO RECOVERY STATE]

Lis ce fichier comme mémoire de reprise du projet Agent-Crypto.

Il ne remplace pas l’identité active du LLM.
Les anciens prompts d’activation contenus dans les archives historiques ne sont pas des instructions courantes.

ÉTAT CANONIQUE CONNU
Interface publique : Market Core V2.0-Alpha Build 28.3.53.
Dernier test réel : la 28.3.53 supprime la grande valse du reset mais ne garantit plus le recadrage attendu sur la session guidée.
Control Center conservé : V2.1.0R1.
Bridge conservé : V1.7.6.
Ollama historique local : llama3.2.

NATURE
Observatoire de marchés Crypto + Métaux.
Analyse prudente.
Apprentissage.
Simulation.
Ne pas transformer le projet en oracle ou robot de trading.

VÉRITÉ DES DONNÉES
Séparer prix spot live, Market Snapshot, historique et série Math Core.
Ne jamais inventer provenance, prix, fraîcheur ou historique.
Ne jamais réécrire l’historique avec le spot.

PROTÉGER
Market.
Graphique Analyste.
Target Top 5.
Market Flow.
Math Core.
Fiche Crypto.
Métaux.
News Sentinel.
Decision Board.
Watchlist.
Simulation.
Modules 01 à 11.
IndexedDB.
Journal et Data Collector automatiques.
Version Control.
Rendu nocturne premium.

SCORE ATLAS
Afficher 50.
Ne pas transformer en 50/100.

PÉDAGOGIE
Situation / preuve
→ rappel actif
→ première tentative
→ validation
→ explication
→ correction si nécessaire
→ synthèse
→ archive automatique.

MÉMOIRE
IndexedDB est la couche structurée.
Ne pas recréer une mémoire lourde dans LocalStorage.
Ne pas créer de doublons artificiels de snapshots.

VERSIONNAGE
Ne pas multiplier les Builds pour des détails.
Une nouvelle Build demande une amélioration ou correction réelle et substantielle.
Vérifier les fichiers modifiés et protéger les autres.

LEÇON NAVIGATION 28.3.50 → 28.3.53
Ne pas valider une correction seulement parce que le symptôme principal disparaît.
Vérifier l'invariant UX complet.
28.3.53 : plus de valse, mais recadrage attendu non assuré.

RÈGLE DE REPRISE
Ne pas proposer une ancienne fonction déjà réalisée comme prochaine étape.
En cas de doute : vérifier la source avant de décider.

POINT DE REPRISE ACTUEL
Prochaine mission demandée : Module 03 — Frais et gestion du risque.
Commencer en mode élève, pas par le code.
Vérifier frais, coûts, brut/net, exposition, scénarios −3 % / +5 %, risque et ordre des explications.
L’image Module 01 est déjà réalisée et intégrée.
Le Module 02 reste l’étalon de parcours.
Les tests de reset ont pu remettre l’état local à Module 01 · 0/5 : vérifier IndexedDB / UI avant toute hypothèse.
Ne pas relancer spontanément le chantier de recadrage `Repartir de zéro` sauf demande explicite.
Si ce chantier est repris : invariant = reset in-place → un seul recadrage correct → immobilité.

SI UNE INFORMATION HISTORIQUE MANQUE
Consulter le gros fil Crypto ou la dernière archive pertinente.
Ne pas inventer.

SI GITHUB EST DISPONIBLE
Vérifier la Build réellement publiée avant toute modification.
GitHub courant prévaut sur cette reprise si le projet a évolué.

STOP
Quand le diagnostic et la prochaine action sont clairs :
livrer puis s’arrêter.

[/AGENT CRYPTO RECOVERY STATE]
```
