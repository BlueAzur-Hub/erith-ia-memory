# HANDOFF — Agent-Crypto 40.6.336 · MARKETS OBSERVATORY · LAZY CYCLE GUARD

## Checkpoint
- Administrator: **40.6.336**
- Functional main commit: `c976e155822100fc8ca063b95b305a2592ecd8dd`
- Market Core: **38.15.11 protégé**
- Parent: **40.6.335 — PASS Firefox / Help Layer V2 / 24h persistence**
- Aether: **40.6.322 TERRAIN PASS / FINAL — GELÉE**
- Mode produit: **PAPER ONLY · G3 PENDING · G9 LOCKED**

## Terrain ayant déclenché la correction
Le Markets Observatory est bien présent :
- Crypto
- Métaux
- Indices / Bourse
- Énergie / matières premières
- Cross-Market
- retour Crypto

Indices, Énergie et Cross sont des domaines secondaires Lazy. Avant résidence de `market-stack.js`, le sélecteur natif historique sait uniquement faire Crypto ↔ Métaux. Un opérateur très rapide pouvait donc voir Métaux puis retomber sur Crypto avant que le routeur complet soit résident.

## Correction 40.6.336
Le Lazy est **conservé**.

`post-boot-runtime-loader-406281.js` reçoit un préchauffage à la demande :
- premier clic Crypto → Métaux : préchauffe les modules Markets sans bloquer le clic natif ;
- si le clic suivant arrive sur Métaux avant résidence complète : l'ancien fallback Métaux → Crypto est intercepté ;
- les modules Markets sont chargés immédiatement sur intention explicite opérateur ;
- le routeur moderne reprend ensuite sur **Indices** ;
- cycle attendu : **Crypto → Métaux → Indices → Énergie → Cross → Crypto**.

Modules préchauffés :
- `markets-domain-contract.js`
- `market-stack.js`
- `parallel-markets.js`
- `cross-market-owner-map.js`
- `market-reading-depth.js`

## Consolidation loader
`loadOne()` attend désormais proprement un script déjà présent mais encore en cours de chargement, au lieu de le considérer immédiatement comme échoué.

## Protections
- aucun nouveau timer récurrent ;
- aucun MutationObserver ;
- aucun stockage ;
- aucune nouvelle requête métier ;
- aucun prix / série / calcul graphique modifié ;
- Market Core 38.15.11 inchangé ;
- Aether inchangée ;
- Strategy / Gates inchangés ;
- Storage métier / Shared Memory inchangés.

## Validation statique
- syntaxe loader JS : PASS ;
- build.json : PASS ;
- diff fonctionnel limité au loader post-boot, à l'entrée Administrator, au manifeste et à l'entrée immutable 40.6.336.

## Validation Firefox — PASS
**PASS opérateur confirmé le 21/09/2026.** Le premier cycle est nettement amélioré et la boucle Lazy complète se comporte comme attendu.

Depuis un **reload frais**, le test validé était :
1. cliquer Marché immédiatement ;
2. Crypto → Métaux peut utiliser le premier pas natif ;
3. recliquer rapidement Métaux : **ne doit plus revenir à Crypto** ;
4. attendre si besoin quelques instants : la destination doit être **Indices** ;
5. poursuivre **Énergie → Cross → Crypto** ;
6. vérifier qu'aucun domaine ne se superpose ;
7. de retour Crypto, vérifier que la période mémorisée **24 h** reste conservée.

**Résultat : PASS → 40.6.336 GELÉE.**

## Suite graphique
Une fois ce routage validé :
1. identités visuelles des actifs ;
2. Help Layer multi-marchés ;
3. Market Reading Depth / Historical Math Core ;
4. persistance par domaine.

Une demande → un propriétaire → une correction → une preuve → arrêt.
