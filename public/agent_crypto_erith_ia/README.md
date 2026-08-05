# Agent-Crypto @erith.IA

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.2.99  
**Mission du Build :** Livecheck Step 2 Direct Validation Lock
**Dépôt cible :** `BlueAzur-Hub/erith-ia-memory`  
**Répertoire :** `public/agent_crypto_erith_ia/`


## Build 28.2.99 — Validation directe de l’étape 2 après Livecheck

Correctif strictement limité au Module 01, étape 2 :

- un seul gestionnaire lance le Livecheck manuel et attend son résultat réel ;
- la progression ne passe à 2/5 qu’après confirmation de la source, de l’heure, des données de marché et de la ligne Bitcoin ;
- l’écriture du carnet IndexedDB est relue avant d’afficher la réussite ;
- après succès, l’interface revient au parcours guidé et active l’étape 3 ;
- en cas d’échec réseau ou IndexedDB, le parcours reste à 1/5 avec un message explicite ;
- le reset complet validé en 28.2.98, Market, Métaux, Bridge, collecteurs et simulation restent inchangés.

## Build 28.2.98 — Repartir de zéro dans Agent-Crypto uniquement

Cette version remplace les trois commandes de reprise par un seul bouton visible :

> **Repartir de zéro**

Après une confirmation unique, l’application efface exclusivement :

- le carnet pédagogique Agent-Crypto ;
- la progression, les étapes, notes, conclusions et archives ;
- les états de récupération pédagogiques ;
- les deux profils de simulation fictive, leurs positions et journaux ;
- les frais pédagogiques et le scénario temporaire.

Elle conserve Market, Métaux, Bridge, collecteurs, réglages généraux, comptes, mots de passe, cookies et autres interfaces BlueAzur. Aucun menu Firefox, aucun `Ctrl + F5`, aucune phrase à recopier et aucun téléchargement automatique ne sont nécessaires.

La lecture et l’écriture IndexedDB installent les gestionnaires de transaction avant les requêtes. Le carnet est relu avant validation. En cas d’échec, l’ancien état est restauré et un code explicite est affiché.

## Build 28.2.96 — Action directe et libellés neutres

Correctif borné construit depuis la 28.2.95 :

- remplace **Continuer sans chercher où cliquer** par **Prochaine étape** ;
- remplace **Apprendre sans deviner quoi taper** par **Tests guidés du simulateur** ;
- le bouton du Module 03, étape 3, exécute directement **Créer la position BTC fictive de 50 €** ;
- l’étape 2 du Module 03 charge directement l’exemple de frais ;
- l’étape 4 ouvre exactement les scénarios −3 % et +5 % et les met en évidence ;
- le Module 02 peut créer directement la position BTC fictive au moment de sa vérification ;
- le Module 01 lance Livecheck et valide ses actions depuis le bouton principal ;
- aucune modification du Market, des Métaux, du Bridge, des collecteurs ou des formats de stockage.

## Mission

Agent-Crypto est une interface pédagogique destinée à apprendre progressivement les cryptomonnaies avec des données publiques et un portefeuille entièrement fictif.

L’interface permet notamment de :

- lire les prix, variations, volumes, sources et heures de collecte ;
- comprendre le Spot, les ordres, l’exécution et les positions ;
- simuler des opérations fictives ;
- étudier les frais, les écarts d’exécution, l’exposition et le seuil de rentabilité ;
- conserver localement les notes, conclusions, sessions et preuves pédagogiques.

Elle ne permet pas de :

- déclencher un ordre réel ;
- connecter un wallet ou une clé privée ;
- connecter une clé API d’exchange ;
- activer le levier, la marge, les futures ou le short ;
- transformer une observation en recommandation financière.


## Build 28.2.95 — Correctif de récupération du Cockpit

Correctif strictement limité au Cockpit d’apprentissage :

- les **Options de session** s’ouvrent maintenant en pleine largeur sous le titre ;
- la grande zone vide observée sous Firefox est supprimée ;
- chaque étape affiche son bouton d’action exact ;
- seule l’étape actuelle est actionnable, les suivantes indiquent clairement leur dépendance ;
- le guide de retour reste visible après l’ouverture de Livecheck, Market Snapshot, Coûts pédagogiques, Mode École ou Scénarios ;
- un bouton **Réinitialiser la simulation fictive** est visible dans les options ;
- ce bouton remet uniquement le profil fictif actif à son capital de départ et conserve le parcours pédagogique ;
- les deux commandes pédagogiques restent séparées : recommencer le module actuel ou recommencer tout l’apprentissage depuis le Module 01.

Market, Métaux, Bridge, collecteurs et autres espaces ne sont pas modifiés.


## Build 28.2.94 — Recommencer un module depuis l’étape 1

La reprise partielle « étapes 2 à 4 » est supprimée. Les deux accès de reprise du module utilisent désormais la même règle :

- **Recommencer ce module depuis l’étape 1** ;
- effacement de la leçon lue, des cinq étapes, des notes, de la conclusion et des preuves du brouillon actif ;
- conservation des sessions archivées, des autres modules, du Market, des Métaux, du Bridge, du simulateur et des collecteurs ;
- confirmation explicite avant toute perte de contenu ;
- retour automatique à la leçon intégrée, étape 1 sur 5.

La commande distincte **Recommencer tout depuis le Module 01** reste disponible pour effacer tout le carnet pédagogique après sauvegarde JSON.


## Build 28.2.92 — Parcours débutants 01 à 03

Le Build remplace les consignes génériques des trois premiers modules par des parcours détaillés.

Chaque étape indique désormais :

1. la notion étudiée ;
2. sa définition en français débutant ;
3. le nom exact du panneau ;
4. le nom exact du bouton ou du contrôle ;
5. l’action à effectuer ;
6. la raison de l’action ;
7. le résultat attendu ;
8. l’endroit où lire ce résultat ;
9. la manière de l’interpréter ;
10. ce qu’il faut retenir avant de continuer.

### Module 01 — Marché et données

- Livecheck nommé précisément ;
- lecture guidée de la ligne Bitcoin dans `MARKET SNAPSHOT` ;
- distinction Prix / 24 h / 7 j ;
- contrôle de la source et de l’heure ;
- distinction entre observation et prédiction.

### Module 02 — Spot et carnet d’ordres

- distinction ordre / exécution / position ;
- carnet d’ordres pédagogique Bid / Ask / Spread ;
- exercice ordre au marché / ordre limite ;
- achat fictif BTC 50 € avec le bouton réel du Mode École ;
- lecture de la quantité et du prix d’entrée.

### Module 03 — Frais et gestion du risque

- distinction capital / montant engagé / exposition ;
- chargement explicite de l’exemple dans `Coûts pédagogiques` ;
- création explicite de la position fictive BTC 50 € ;
- scénarios −3 % puis +5 % ;
- traduction de `P/L` en gain ou perte ;
- distinction résultat avant frais / résultat après frais.

## Compatibilité et conservation

Le Build conserve :

- les clés et le schéma IndexedDB ;
- les clés `localStorage` ;
- les sessions déjà archivées ;
- les notes et conclusions existantes ;
- les profils fictifs 100 € et 1 000 € ;
- les marchés Crypto ;
- les Métaux ;
- le Decision Board ;
- le Bridge ;
- les collecteurs et workflows.

Une session déjà archivée n’est pas réécrite. Le nouveau parcours peut être relu sans falsifier l’ancienne preuve.

Pour un brouillon actif créé avant le parcours actuel, le bouton **Recommencer ce module depuis l’étape 1** remet à zéro la leçon lue, les cinq étapes, les notes, la conclusion et les preuves pédagogiques du brouillon actif. Les sessions archivées, les autres modules et les données hors apprentissage restent conservés.

## Publication

Christophe reste la seule personne qui publie les fichiers dans GitHub.

Fichiers à remplacer :

```text
public/agent_crypto_erith_ia/README.md
public/agent_crypto_erith_ia/web/app.js
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/version.json
```

Après publication :

1. attendre GitHub Pages ;
2. effectuer `Ctrl + F5` dans Firefox ;
3. vérifier `Build 28.2.98` ;
4. ouvrir `Simulation` puis le Cockpit d’apprentissage ;
5. ouvrir **Options de session** ;
6. utiliser **Repartir entièrement depuis le Module 01** uniquement pour remettre à zéro l’apprentissage et la simulation fictive active ;
7. confirmer puis saisir exactement `REPARTIR MODULE 01` ;
8. vérifier : Module 01 · 0/5, progression 0 %, capital initial, aucune position.

## Vérité et sécurité

```text
Pas de source réelle valide = pas de prix affirmé.
Pas de position fictive = pas de scénario calculé.
Une hypothèse de frais n’est pas un tarif réel.
Une simulation fictive n’est jamais une autorisation financière.
Aucun argent réel, aucune clé API, aucun wallet.
```


## Build 28.2.92 — Recommencer tout depuis le Module 01

Le Cockpit ajoute une commande distincte de « Recommencer ce module » :

**Recommencer tout depuis le Module 01**

Cette commande applique deux confirmations successives, dont la saisie exacte `RECOMMENCER MODULE 01`. Avant la première écriture d’effacement, elle crée une sauvegarde JSON téléchargeable et en conserve une copie exacte dans le carnet IndexedDB.

Elle remet uniquement à zéro :

- le brouillon pédagogique courant ;
- les sessions pédagogiques archivées ;
- les notes et conclusions ;
- les états de progression des 11 modules.

Elle ouvre ensuite `01 · Marché et données` à `0/5 étapes` avec une progression de `0 %`.

Elle ne touche pas au Market, aux Métaux, au Bridge, au portefeuille fictif, aux preuves de simulation, aux collecteurs ni aux réglages généraux. Le marqueur de reset empêche également l’ancienne récupération automatique de recréer les sessions volontairement effacées.


## Build 28.2.94 — Validation par preuves, sans coches manuelles

Les cinq cases des Modules 01, 02 et 03 deviennent des **indicateurs en lecture seule**. Elles ne servent plus de boutons et ne peuvent plus fabriquer une progression par erreur.

Chaque étape devient verte uniquement grâce à la preuve correspondante :

- lecture de la leçon intégrée ;
- Livecheck réellement prêt ;
- lecture BTC ou réponses du carnet pédagogique ;
- opération fictive BTC 50 € ;
- scénarios −3 % et +5 % ;
- conclusion enregistrée après les quatre étapes précédentes.

La conclusion est sauvegardée dès la frappe, même si elle est écrite trop tôt. Pour les Modules 01 à 03, elle valide l’étape 5 seulement lorsque :

1. les étapes 1 à 4 sont terminées ;
2. le texte contient au moins 20 caractères utiles.

Le compteur explique désormais clairement si le texte est sauvegardé, encore verrouillé par les étapes précédentes, trop court, ou validé.

La commande **Recommencer tout depuis le Module 01** du Build 28.2.92 reste intégralement disponible. Aucune donnée Market, Métaux, Bridge, simulation, preuve ou collecteur n’est touchée par ce durcissement pédagogique.
