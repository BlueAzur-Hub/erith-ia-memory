# Agent-Crypto @erith.IA

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.2.87  
**Statut :** observatoire de marchés, simulateur fictif et cockpit d’apprentissage  
**Dépôt cible :** `BlueAzur-Hub/erith-ia-memory`  
**Répertoire :** `public/agent_crypto_erith_ia/`

## Mission

Agent-Crypto est une interface pédagogique et prudente destinée à apprendre progressivement le fonctionnement des cryptomonnaies sans utiliser d’argent réel.

Elle permet de :

- observer des données de marché publiques ;
- distinguer source, fraîcheur, archive, calcul et hypothèse ;
- étudier les prix, variations, volumes, liquidité et capitalisation ;
- simuler des opérations Spot fictives ;
- comprendre les frais, le spread, le slippage et le seuil de rentabilité ;
- suivre un parcours expert sur vingt-quatre mois ;
- conserver des notes, conclusions et preuves dans le navigateur ;
- étudier la sécurité, les retraits, les arnaques et la traçabilité.

Elle ne permet pas de :

- déclencher un ordre réel ;
- connecter un wallet réel ;
- utiliser une clé privée ou une phrase de récupération ;
- utiliser une clé API d’exchange ;
- activer le levier, la marge, les futures ou le short ;
- fournir une promesse de gain ou une recommandation financière personnelle.

## Build 28.2.87 — Cockpit guidé

Le Build 28.2.87 corrige le parcours utilisateur du cockpit.

Une seule action principale est désormais affichée à chaque étape :

1. Lire la leçon.
2. Ouvrir la bonne zone.
3. Faire l’exercice fictif.
4. Vérifier le résultat.
5. Écrire la conclusion.
6. Terminer et archiver.
7. Passer au module suivant.

Les cases du parcours sont des preuves automatiques. Elles ne sont plus des commandes à cocher manuellement.

Après archivage, une carte de fin affiche immédiatement :

- le module terminé ;
- les cinq étapes validées ;
- le nombre de caractères des notes ;
- le nombre de caractères de la conclusion ;
- la progression globale ;
- le prochain module ;
- le bouton de continuation.

Le Build répare également l’ancien cas où le bouton `Continuer mon parcours` pouvait rouvrir une séance déjà archivée. La séance est reconnue par son identifiant, restaurée comme terminée et n’est jamais dupliquée.

## Parcours expert

Le cursus comprend onze modules :

1. Marché et données.
2. Spot et carnet d’ordres.
3. Frais et gestion du risque.
4. Sécurité du compte.
5. Portefeuilles et retraits.
6. Stablecoins et tokenomics.
7. Smart contracts et DeFi.
8. Staking et rendements.
9. Dérivés et liquidation.
10. Arnaques et investigation.
11. Traçabilité et fiscalité.

La progression est personnelle, locale et non compétitive.

## Simulation fictive

Deux profils séparés sont conservés.

### Solo Progression 1 000 €

- capital fictif : 1 000 € ;
- ticket conseillé : 50 € ;
- maximum par opération : 100 € ;
- exposition maximale : 300 € ;
- réserve minimale : 700 € ;
- actifs autorisés : BTC, ETH et SOL.

### École 100 €

- capital fictif : 100 € ;
- ticket conseillé : 5 € ;
- maximum par opération : 10 € ;
- exposition maximale : 30 € ;
- réserve minimale : 70 € ;
- actifs autorisés : BTC, ETH et SOL.

Chaque profil possède son portefeuille, ses positions et son journal local. Changer de profil ne détruit pas l’autre simulation.

## Stockage pédagogique

Le carnet d’apprentissage utilise IndexedDB :

- base : `agent_crypto_learning_notebook` ;
- magasin : `notebook` ;
- enregistrement principal : `learning_notebook_primary`.

IndexedDB conserve :

- la séance active ;
- les sessions archivées ;
- les notes libres ;
- les conclusions personnelles ;
- la progression des onze modules ;
- la preuve de récupération des anciennes données.

Les anciennes sources de récupération restent conservées en lecture seule :

- `agent_crypto_learning_journey_cockpit_28_2_81` ;
- `agent_crypto_expert_roadmap_28_2_79`.

Le stockage des profils de simulation reste séparé et n’est pas migré par le cockpit.

## Architecture publique

```text
public/agent_crypto_erith_ia/
├── README.md
├── data/
│   ├── crypto/
│   ├── metals/
│   ├── news/
│   ├── charts/
│   └── history/
└── web/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── version.json
    ├── market_asset_registry.json
    ├── market_source_registry.json
    ├── market_data_contract.json
    ├── bridge_market_adapter_contract.json
    ├── metals_structural_registry.json
    └── metals_quote_adapter_contract.json
```

Le Build 28.2.87 remplace uniquement :

```text
public/agent_crypto_erith_ia/README.md
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/app.js
public/agent_crypto_erith_ia/web/version.json
```

## Données et vérité

Règles permanentes :

```text
Pas de source réelle ou d’archive publique valide = pas de prix affirmé.
Pas de données récupérées = pas de tableau chiffré inventé.
Une simulation fictive n’est jamais une autorisation financière.
Une hypothèse de frais n’est jamais présentée comme un tarif contractuel.
Spot et Futures restent distingués.
Les données Crypto ne remplacent jamais les données Métaux.
```

Les collecteurs publics, les workflows GitHub Actions, les registres de sources, le Decision Board, l’espace Métaux et le Bridge ne sont pas modifiés par le Build 28.2.87.

## Interface publique

Après publication par Christophe :

```text
https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/web/index.html
```

## Publication

L’assistante prépare les fichiers localement. Christophe reste la seule personne qui publie dans GitHub.

Après remplacement des cinq fichiers :

1. attendre la publication GitHub Pages ;
2. ouvrir l’interface dans le même profil Firefox ;
3. effectuer un rechargement forcé ;
4. vérifier `Build 28.2.87` ;
5. ouvrir le cockpit ;
6. vérifier que la séance Spot archivée affiche une carte de fin ;
7. cliquer `Passer au module 03 — Frais et gestion du risque` ;
8. confirmer que les anciennes notes et la progression restent intactes.

## Limites de validation

La livraison fournit des contrôles statiques et un test comportemental ciblé dans Chromium par injection de l’interface et d’un contrat IndexedDB en mémoire.

La validation publique définitive reste le test effectué par Christophe dans son profil Firefox/Ryzen après publication.

## Principe directeur

> Comprendre avant d’exécuter, simuler avant de risquer, vérifier avant de confirmer.
