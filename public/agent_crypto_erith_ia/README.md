# Agent-Crypto @erith.IA

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.2.91  
**Mission du Build :** Foundations Learning Path 01–03 & Beginner Guidance Lock  
**Dépôt cible :** `BlueAzur-Hub/erith-ia-memory`  
**Répertoire :** `public/agent_crypto_erith_ia/`

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

## Build 28.2.91 — Parcours débutants 01 à 03

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

Pour un brouillon actif créé avant le Build 28.2.91, le bouton **Recommencer les étapes 2 à 4** remet uniquement ces étapes et leurs preuves à zéro. Les notes, la conclusion et les archives restent conservées.

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
3. vérifier `Build 28.2.91` ;
4. ouvrir `Simulation` puis le Cockpit d’apprentissage ;
5. utiliser **Recommencer les étapes 2 à 4** si l’ancien brouillon du Module 03 est encore à 2/5 ou 3/5 ;
6. vérifier le parcours détaillé avant de reprendre l’exercice.

## Vérité et sécurité

```text
Pas de source réelle valide = pas de prix affirmé.
Pas de position fictive = pas de scénario calculé.
Une hypothèse de frais n’est pas un tarif réel.
Une simulation fictive n’est jamais une autorisation financière.
Aucun argent réel, aucune clé API, aucun wallet.
```
