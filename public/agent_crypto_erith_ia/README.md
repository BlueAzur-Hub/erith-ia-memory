# Agent-Crypto @erith.IA

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.16  
**Mission du Build :** Historical Version Control Restoration Lock  
**Dépôt cible :** `BlueAzur-Hub/erith-ia-memory`  
**Répertoire :** `public/agent_crypto_erith_ia/`

## Build 28.3.16 — Restauration du contrôle de version historique

Correction chirurgicale du contrôleur de version à partir de la 28.3.14 publique, sans rollback fonctionnel :

- conservation intégrale du code fonctionnel de la 28.3.14 hors contrôleur de version ;
- suppression des deux branches `sameBuildTokenChanged` introduites en 28.3.14 ;
- restauration du comportement hérité et identique des Builds 28.3.12 et 28.3.13 : une mise à jour distante normale exige un numéro de Build strictement supérieur ;
- conservation du mode historique de réparation locale à Build identique quand les marqueurs runtime chargés sont incohérents ;
- nouvelle identité publique unique `28.3.16` dans `index.html`, `app.js`, `style.css` et `version.json` ;
- nouveau token d’asset `market-core-v2.0-alpha-build-28.3.16` ;
- aucune modification de la pédagogie 01–11, de la persistance IndexedDB, du Market, des Métaux, du Bridge, des collecteurs, de la simulation ou du layout.

## Build 28.3.14 — Identité de publication immuable et récupération du cache

Correction du protocole de version après la republication fautive de fichiers sous le même numéro et le même token 28.3.13 :

- nouvelle identité publique complète `28.3.14` dans `index.html`, `app.js`, `style.css` et `version.json` ;
- nouveau token d’asset `market-core-v2.0-alpha-build-28.3.14` ;
- détection défensive d’un changement futur de token même si un numéro de Build était réutilisé par erreur ;
- interdiction documentaire de republier des assets modifiés sous une identité déjà publiée ;
- aucune modification de la pédagogie 01–11, de la persistance IndexedDB, du Market, des Métaux, du Bridge, des collecteurs ou de la simulation.

## Build 28.3.13 — Persistance fermée, reset sérialisé et diagnostic vrai

Correction ciblée de la couche IndexedDB 28.3.12 :

- une erreur de lecture initiale place le carnet en lecture seule et interdit toute migration, réconciliation ou écriture ;
- les écritures utilisent une génération de stockage et refusent les sauvegardes obsolètes ;
- le reset annule le timer, attend la file canonique, change de génération et écrit dans cette même file ;
- la preuve IndexedDB est enregistrée en deux phases : tentative, relecture, puis métadonnées vérifiées ;
- le diagnostic calcule tout depuis le record relu, sans cache global ni DOM ;
- cohérence bidirectionnelle : archive complète ↔ statut Pratiqué ;
- sauvegarde différée déclenchée immédiatement lors de `visibilitychange` caché ou `pagehide` ;
- le manifeste n’affirme plus un test IndexedDB natif non exécuté ;
- aucun changement de Market, Métaux, Bridge, collecteurs, pédagogie ou simulation.

## Build 28.3.12 — Persistance navigateur, reprise et preuve

Consolidation technique du carnet pédagogique sans nouvelle leçon :

- écritures IndexedDB sérialisées pour éviter les courses entre sauvegardes ;
- fermeture de transaction, relecture réelle et comparaison d’empreinte avant confirmation ;
- schéma de carnet `indexeddb_v2` avec versions séparées du carnet, du cockpit, des archives, de la feuille de route et de la pédagogie par module ;
- codes explicites `LEARNING-IDB-*` et `LEARNING-STORAGE-QUOTA` ;
- diagnostic secondaire « Vérifier l’intégrité du parcours », strictement non destructif ;
- contrôle du brouillon actif, de l’ordre des étapes, des doublons d’archives, de la feuille de route, de la fin 11/11 et de la séparation des données de simulation ;
- export JSON du diagnostic ;
- aucune réparation automatique, aucun reset et aucun effacement ;
- aucun changement de Market, Métaux, Bridge, collecteurs, contenu pédagogique, simulation ou reset.

## Build 28.3.11 — Continuité, ordre et fin de parcours

Correction consolidée de la machine pédagogique, sans nouvelle leçon :

- version pédagogique propre à chaque module ;
- conservation des brouillons des modules inchangés entre les Builds ;
- verrou UI et JavaScript de l’ordre 1 → 2 → 3 → 4 → 5 pour les Modules 04 à 11 ;
- fin explicite `Parcours pédagogique terminé · 11/11` après archivage du Module 11 ;
- aucune création automatique d’une nouvelle session Module 01 ;
- aucun changement de Market, Métaux, Bridge, collecteurs, simulation ou reset.



## Build 28.3.10 — Maîtrise guidée 09 à 11

Extension finale des onze modules avec la même machine d’état pédagogique, sans rouvrir les Modules 01 à 08.

### Module 09 — Dérivés et liquidation

- exemple figé : 100 € de marge ×5 = 500 € d’exposition ;
- mouvement défavorable de 5 % = environ 25 € de perte brute, soit 25 % de la marge avant frais et funding ;
- checklist mark price, liquidation, marge isolée/croisée, funding, frais et protections applicables ;
- aucun produit dérivé, aucune marge et aucun levier réel.

### Module 10 — Arnaques et investigation

- reconnaissance des garanties, urgences, faux supports, accès distant, demandes de secrets, adresses imposées et frais de récupération ;
- protocole Stop : ne rien envoyer, signer ou communiquer, puis ouvrir soi-même le canal officiel ;
- dossier de preuve fictif : domaine, messages, dates, captures, adresses publiques, TXID et justificatifs ;
- conclusion : une liste noire utile n’est jamais exhaustive et son absence ne prouve pas une autorisation.

### Module 11 — Traçabilité et fiscalité

- fiche d’opération complète et reconstructible ;
- valeur manquante conservée comme incomplète, jamais inventée ;
- repères France 2026 : annexe 2086 et déclaration 3916-3916 bis, à revérifier selon l’année et la situation ;
- aucun calcul d’impôt, aucune qualification automatique et aucun conseil fiscal personnalisé.

### Sources officielles de cadrage

- ESMA, 24 février 2026 : les perpétuels à effet de levier pouvant relever des mesures CFD impliquent notamment limites de levier, avertissement de risque, clôture sur marge et protection contre solde négatif ;
- AMF / ACPR, 9 juillet 2026 : mises en garde contre les acteurs non autorisés proposant des dérivés sur crypto-actifs ;
- AMF, 8 juillet 2026 : listes noires non exhaustives et vérification de la liste blanche PSCA ;
- Cybermalveillance.gouv.fr, mise à jour 8 juin 2026 : faux employés, faux services anti-fraude et demandes de seeds, codes, accès ou validation d’opérations ;
- impots.gouv.fr / BOFiP : annexe 2086 pour les plus ou moins-values de cessions et 3916-3916 bis pour certains comptes d’actifs numériques à l’étranger.

### Verrous

- progression et archives 01–08 préservées ;
- ancien brouillon 09–11 : étape 1 conservée, étapes 2–5 reconstruites sur les nouvelles preuves ;
- notes personnelles facultatives ;
- archivage distinct du passage au module suivant ;
- aucun changement de Market, Métaux, Bridge, collecteurs, reset ou simulation.


## Build 28.3.09 — Analyse guidée 06 à 08

Extension substantielle de la même machine d’état pédagogique, sans rouvrir les Modules 01 à 05 :

### Module 06 — Stablecoins et tokenomics

- stablecoin présenté comme cible de stabilité, jamais comme absence de risque ;
- contrôles guidés : mécanisme, émetteur ou protocole, réserves, remboursement, liquidité et depeg ;
- exemple figé capitalisation / FDV : 1 € × 100 M = 100 M€ ; 1 € × 1 Md = 1 Md€ ;
- checklist unlocks, émissions, inflation, burn, concentration et sources officielles datées ;
- conclusion guidée : un faible prix unitaire ne prouve pas qu’un projet est bon marché.

### Module 07 — Smart contracts et DeFi

- distinction explicite entre lecture d’état et transaction d’écriture ;
- approval ERC-20 limitée selon le principe du moindre privilège ;
- checklist domaine, réseau, contrat, fonction, destinataire, montant, gas, oracle, liquidité et bridge ;
- conclusion guidée : une signature peut accorder une permission ou exécuter une fonction sans révéler la seed ;
- aucun wallet, contrat, approval ou signature réelle.

### Module 08 — Staking et rendements

- identification obligatoire de la source du rendement ;
- calcul figé : 100 jetons à 10 € deviennent 108 jetons à 7 € = 756 €, soit −24,4 % malgré +8 % de jetons ;
- checklist blocage, délai de retrait, slashing, inflation, coûts, liquidité, smart contract et prestataire ;
- conclusion guidée : un taux nominal ne garantit pas un gain en euros ;
- aucun dépôt ni staking réel.

### Verrous

- archives et progression des Modules 01 à 05 préservées ;
- ancien brouillon 06–08 : étape 1 conservée, étapes 2–5 reconstruites sur les nouvelles preuves ;
- notes personnelles facultatives ;
- archivage et passage au module suivant séparés ;
- aucune modification de Market, Métaux, Bridge, collecteurs, reset ou moteur de simulation.

### Base documentaire de la pédagogie

- EBA / MiCA : distinction et encadrement des jetons se référant à des actifs et des jetons de monnaie électronique ;
- Circle Transparency : exemple d’informations de réserves, d’émission, de remboursement et d’attestations propres à un émetteur — non généralisables à tous les stablecoins ;
- Ethereum.org : smart contracts, lecture/écriture, gas, composabilité et interactions irréversibles ;
- standard ERC-20 : approval, allowance et transferFrom ;
- Ethereum.org Staking : options différentes selon risques, récompenses et hypothèses de confiance, avec pénalités et slashing possibles.


## Build 28.3.08 — Sécurité guidée 04 à 05

Extension substantielle de la machine pédagogique validée, sans rouvrir les Fondations 01 à 03 :

### Module 04 — Sécurité du compte

- socle fictif : mot de passe unique, passkey ou 2FA indépendante et email sécurisé ;
- scénario de faux support avec refus obligatoire des codes, secrets et accès distant ;
- plan ordonné : sécuriser, préparer la récupération, révoquer les sessions inconnues, puis activer les verrous disponibles ;
- synthèse guidée et preuve figée ;
- aucune donnée de compte réelle demandée.

### Module 05 — Portefeuilles et retraits

- correspondance guidée entre actif et réseau ;
- destination obtenue et contrôlée indépendamment, sans adresse réelle ;
- contrôle du minimum, des frais et du memo/tag éventuel ;
- petit test fictif puis suivi TXID, statut et confirmations ;
- synthèse guidée sur la différence entre adresse et réseau.

### Verrous

- les Modules 01 à 03 et leurs archives restent inchangés ;
- les notes personnelles restent facultatives ;
- l’archivage et le passage au module suivant restent séparés ;
- aucun mot de passe, code 2FA, seed, adresse ou transfert réel ;
- aucune modification de Market, Métaux, Bridge, collecteurs, reset ou moteur de simulation.

### Base documentaire de la pédagogie

- recommandations ANSSI sur les mots de passe et l’authentification multifacteur ;
- listes blanches et mises en garde crypto de l’AMF ;
- documentation Kraken sur passkeys/2FA, GSL, faux support, réseaux de retrait, adresses confirmées et confirmations blockchain.

## Build 28.3.07 — Consolidation des preuves pédagogiques 01 à 03

Version de consolidation sans changement de Destination :

- Module 01 : Prix, 24 h, 7 j, source et heure sont figés lors de leur validation ; les variations live suivantes ne réécrivent plus la session ni son archive ;
- Module 02 : synthèse de position déjà fondée sur la preuve enregistrée, comportement préservé ;
- Module 03 : scénarios −3 % et +5 % ancrés sur le prix d’entrée et le montant fictif, puis figés avec le coût aller-retour pédagogique ; un brouillon 28.3.06 ayant déjà exécuté les anciens scénarios revient uniquement à l’étape 4, sans reset du module ;
- suppression du seuil de caractères devenu obsolète ;
- correction des marqueurs internes et du harness de contrat ;
- aucune modification de Market, Métaux, Bridge, collecteurs, reset ou sécurité de simulation.

## Build 28.3.06 — Fondations guidées 01 à 03

Version consolidée du parcours pédagogique :

### Module 01 — Marché et données

- message IndexedDB cohérent après archivage ;
- distinction explicite entre le Market Snapshot pédagogique et le prix spot Binance ;
- cycle validé : 0/5 → 5/5 → archive → 1/11 pratiqué → Module 02.

### Module 02 — Spot et carnet d’ordres

- meilleur Ask, meilleur Bid et Spread dans une carte guidée ;
- exercice Marché / Limite avec refus pédagogique des réponses incorrectes ;
- création autonome d’une position BTC fictive de 50 €, avec Livecheck automatique si nécessaire ;
- synthèse réelle de l’exécution : montant, prix d’entrée, quantité reçue et capital restant ;
- question guidée sur l’absence de garantie d’exécution immédiate d’un ordre limite ;
- aucune rédaction libre obligatoire.

### Module 03 — Frais et gestion du risque

- exemple école de coûts à 0,60 % aller-retour ;
- position BTC fictive de 50 € ;
- scénarios −3 % et +5 % sans modification de la position ;
- comparaison résultat brut / résultat net ;
- question guidée sur l’effet des frais ;
- aucune rédaction libre obligatoire.

### Verrous communs

- les notes personnelles restent facultatives et ne fabriquent aucune progression ;
- archivage et passage au module suivant restent deux actions séparées ;
- les Modules 01, 02 et 03 restent visibles et comptabilisés après archivage ;
- aucune opération réelle, aucune clé API et aucun wallet ;
- Market, Métaux, Bridge, collecteurs et reset 28.2.98 préservés.

## Build 28.3.03 — Archivage autonome et cohérence visible du parcours

- L’étape 5 archive automatiquement la session dès que la conclusion personnelle est valide.
- La feuille de route est mise à jour immédiatement : le Module 01 ne reste plus à 0 % après un affichage 5/5.
- Les libellés publics de version sont synchronisés sur le Build 28.3.03, y compris le pied de page et Situation du projet.
- « Lecture réelle de Bitcoin » devient « Lecture du snapshot Bitcoin » afin de distinguer clairement CoinGecko du prix spot Binance.
- L’étape 4 décrit désormais exactement son fonctionnement automatique : source + heure + conclusion prudente, sans champ à chercher.

- supprime la boucle « Lire la leçon » puis « J’ai lu cette leçon » ;
- la leçon reste visible et le bouton unique « J’ai lu la leçon — passer à Livecheck » valide directement l’étape 1 ;
- masque l’ancien second bouton de confirmation ;
- l’étape 4 devient « Vérifier automatiquement source + heure » et ne demande plus de chercher un champ ;
- conserve les sessions actives 28.3.02 sans imposer de reset ;
- ne modifie ni Market, ni Métaux, ni Bridge, ni collecteurs, ni simulation.

## Build 28.3.01 — Conclusion autonome et validation immédiate 5/5

Correctif strictement limité à la dernière étape du Module 01 :

- après l’étape 4, l’interface cible directement le champ exact « Ce que je retiens — conclusion personnelle » ;
- un repère autonome intégré indique les trois éléments à formuler, sans dépendre d’une IA externe ;
- après 20 caractères utiles et les étapes 1 à 4 validées, la saisie met immédiatement le parcours à 5/5 ;
- le cockpit complet, la case témoin, le compteur et le bouton principal se mettent à jour sans rechargement ni clic supplémentaire ;
- le bouton devient « Terminer et archiver » ;
- l’état 28.3.00 reste compatible et aucun reset n’est requis ;
- reset, Market, Métaux, Bridge, collecteurs et simulation restent inchangés.


## Build 28.3.00 — Navigation directe vers Bitcoin après Livecheck

Correctif strictement limité au déplacement qui suit la validation de l’étape 2 :

- le Livecheck conserve sa validation directe et son écriture IndexedDB de la 28.2.99 ;
- après réussite, l’interface ne revient plus au début du parcours détaillé ;
- elle se place directement sur la ligne Bitcoin du MARKET SNAPSHOT ;
- la ligne Bitcoin reçoit le repère visuel de l’étape 3 ;
- le message indique uniquement de lire Prix, 24 h et 7 j ;
- l’état pédagogique 28.2.99 reste compatible : aucun nouveau reset n’est requis ;
- reset, Market, Métaux, Bridge, collecteurs et simulation restent inchangés.


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
