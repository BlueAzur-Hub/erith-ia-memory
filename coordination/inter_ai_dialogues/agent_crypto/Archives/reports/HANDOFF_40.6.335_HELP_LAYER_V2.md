# HANDOFF — Agent-Crypto 40.6.335 · HELP LAYER V2

## Checkpoint
- Administrator: **40.6.335**
- Functional main commit: `9d5a2387003a09b8d5bccde96efbd1e3fbae6add`
- Market Core: **38.15.11 protégé**
- Parent Help Layer: **40.6.334 — PASS visuel opérateur le 21/09/2026**
- Aether: **40.6.322 TERRAIN PASS / FINAL — GELÉE**
- Strategy A / Gates / Storage métier / Shared Memory logique: **inchangés**
- Mode produit: **PAPER ONLY · G3 PENDING · G9 LOCKED**

## Pourquoi 40.6.335
Audit de consolidation de 40.6.334 avant extension de l'aide.

Corrections bornées:
1. Les cibles montées après activation de l'aide pouvaient afficher leur carte via délégation, mais ne recevaient pas toujours le marquage visuel de cible. `show()` ajoute maintenant le marquage au moment réel du survol/focus.
2. `allTargets()` ne retenait que le premier élément d'un sélecteur. Il utilise désormais `querySelectorAll` avec déduplication.
3. Le badge release caché de premier paint portait encore `40.4.168` avant synchronisation runtime. Il est aligné sur 40.6.335.
4. Un texte littéral `\n` résiduel entre les scripts Administrator a été retiré.
5. Une règle petite hauteur est ajoutée pour garder la carte lisible dans les viewports courts.

Aucun MutationObserver, aucun nouveau timer, aucun stockage, aucun réseau et aucune logique métier ajoutés.

## Help Layer V2 — sujets
Conservés:
- Menu
- LiveCheck
- Graphique Crypto
- Lecture Technique
- Target Top 5 / Market Flow
- Market Snapshot
- Atlas Math Core

Ajoutés:
- Sources & fraîcheur
- Evidence Dossier / Gates Strategy A
- Simulation / Strategy A PAPER
- Storage / IndexedDB
- Sécurité
- Sécurité physique
- Missions de vie / Projets

## Protections
- Market Core 38.15.11: **inchangé**
- Aether: **inchangée**
- Atlas / Oracle: **inchangés**
- seuils Strategy A: **inchangés**
- états et propriétaires des Gates: **inchangés**
- Storage business logic: **inchangée**
- Shared Memory logic: **inchangée**
- aucun ordre réel, aucune clé, aucun wallet

## Vérifications statiques effectuées
- syntaxe `help-layer.js`: PASS
- `build.json`: JSON valide
- diff limité à 4 fichiers fonctionnels:
  - `administrator/js/help-layer.js`
  - `administrator/help-layer.css`
  - `administrator/index.html`
  - `administrator/build.json`
- suppression du `\n` littéral: PASS
- Market Core: 38.15.11
- drapeaux manifest: Aether false / Strategy false / Gates false

## Validation Firefox demandée
1. Charger **Build 40.6.335 · Administrator**.
2. Activer `?`; vérifier que les 7 sujets 40.6.334 restent identiques.
3. Vérifier ensuite: Sources → Evidence/Gates → Simulation → Storage → Sécurité → Sécurité physique → Projets.
4. Ouvrir les sections lazy avant survol si nécessaire; elles doivent être marquées sans recharger l'aide.
5. Vérifier que les cartes restent dans le viewport et ne provoquent aucun reflow.
6. `Échap` et `?` ferment toujours.
7. Ouvrir Aether et changer Graphique/7j: aucune régression Aether.

Si PASS: **geler 40.6.335**.

## Parent reporté
Le test canonique Shared Memory 40.6.333 reste séparé:
import Transformer Book → réimport identique = 0 nouveau → reload Firefox → vérifier les deux identités `ryzen7-christophe` / `transformer-book`.

## Règle de reprise
Une demande → une zone → un propriétaire → une correction → une preuve → arrêt.
