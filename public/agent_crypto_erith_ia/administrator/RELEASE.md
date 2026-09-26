# Agent-Crypto — Aether 12/12 Batch Truth

Build **40.6.422** · parent **40.6.421** · Market Core **38.15.11**.

## Pourquoi cette version passe devant Storyline Clustering

Le terrain 40.6.421 montre un défaut plus bas niveau : Aether ne restitue pas son propre contrat de lecture.

Symptôme opérateur :
**3–4 News qui tournent, puis bande noire, puis retour du menu.**

Le problème n'est pas le stock News Sentinel : le dump terrain 40.6.421 contient **115 événements uniques**, et la sélection Aether actuelle sait constituer 12 événements distincts.

## Audit

Deux causes runtime ont été isolées dans le lecteur Aether.

### 1. Deux horloges pouvaient diverger
La phase Aether est pilotée par CSS (270 s), alors que la News suivante est avancée en JavaScript sur `animationiteration`.

Le handler rejetait explicitement un pulse quand `document.hidden === true`.

Donc un onglet masqué pouvait perdre des News pendant que la cadence CSS avançait vers SYSTEM / NORMAL.

### 2. Le curseur pointait une liste mouvante
`aetherVeilleAdvance()` rappelait `aetherVeilleEvents()` à chaque pulse.

Le classement dépend de la fraîcheur, de la preuve, du contexte marché/Oracle et des mises à jour News. L'index N n'était donc pas l'identité stable d'une histoire.

## Correction 40.6.422

- une fenêtre VEILLE fige **un lot de 12 identités** ;
- le curseur avance uniquement dans ce lot ;
- aucune boucle interne avant la fin du lot ;
- un refresh/reclassement News ne peut plus remplacer l'histoire N sous le curseur ;
- lorsque l'onglet est caché, **toute la cadence du command-bar est mise en pause** ;
- au retour, menu / INFO / VEILLE / SYSTEM / marquee reprennent au même point ;
- diagnostics exposés :
  - expected ;
  - total ;
  - displayed ;
  - unique ;
  - duplicates ;
  - complete ;
- une sortie de VEILLE incomplète sur un lot de 12 pose un flag de violation.

## Invariants

- `AETHER_VEILLE_TOP = 12`
- aucun nouveau `setInterval`
- aucun nouveau `MutationObserver`
- aucun nouveau propriétaire fetch
- aucun nouveau stockage
- aucun changement d'ordre/trading
- News Sentinel / Taxonomy 40.6.421 inchangés
- Market Core 38.15.11 inchangé
- Oracle / Lecture Technique / Atlas CURRENT / Strategy / Storage inchangés

## Terrain Firefox attendu

1. Ctrl+F5 → **Build 40.6.422**.
2. Observer VEILLE : **1/12 → 2/12 → … → 12/12**.
3. Après 12/12 : **SYSTEM**, puis retour du menu normal.
4. **Aucune bande noire** entre les phases.
5. Pendant un lot, passer sur un autre onglet puis revenir :
   - même phase reprise ;
   - aucune News consommée pendant l'absence ;
   - pas de retour arbitraire aux 3–4 mêmes titres.
6. Diagnostic attendu :
   - displayed = 12 ;
   - unique = 12 ;
   - duplicates = 0 ;
   - complete = true.

## Suite

Après preuve terrain 40.6.422 :
- **40.6.423 — Storyline Clustering / Diversity**
- **40.6.424 — Criticality vs Operator Relevance**
- **40.6.425 — Language / operator polish**
