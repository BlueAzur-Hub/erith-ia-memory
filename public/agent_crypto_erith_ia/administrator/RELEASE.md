# Agent-Crypto — Aether Phase / Visibility Truth

Build **40.6.423** · parent **40.6.422** · Market Core **38.15.11**.

## Terrain acquis

La 40.6.422 a déjà amélioré la diversité réelle du fil Aether : le terrain opérateur montre plusieurs News distinctes au lieu de l'ancienne boucle limitée à 3–4 titres.

Mais le terrain a aussi capturé une **ligne command-bar entièrement vide** entre Aether SYSTÈME et le retour du menu natif/date-heure.

## Audit croisé Seven + Astra

Trois défauts restaient ouverts.

### 1. Pause CSS incomplète
Les animations natives historiques ciblent par exemple :
`#livecheck.command-bar > #btnLivecheck`
avec `animation: ... !important`.

La pause 40.6.422 ciblait :
`#livecheck.command-bar > *`

À priorité `!important` égale, l'ancienne règle à deux IDs gagnait. Le menu natif pouvait donc continuer pendant qu'Aether était pausé.

### 2. Couture visible entre phases
INFO, VEILLE, SYSTÈME et menu étaient des animations séparées avec des frontières qui se touchaient sans chevauchement.

Une divergence d'une frame suffisait à produire :
`SYSTEM hidden → aucun propriétaire visible → MENU visible`.

### 3. Compteurs trop optimistes
40.6.422 comptait une histoire avant d'avoir prouvé sa visibilité et supprimait les doublons avant de les compter.

## Correction 40.6.423

- la pause commune cible explicitement les IDs natifs + Aether avec une spécificité suffisante ;
- les handoffs se chevauchent :
  - menu ↔ Aether ;
  - INFO ↔ VEILLE ;
  - VEILLE ↔ SYSTÈME ;
  - SYSTÈME ↔ menu au wrap ;
- le lot 12 reste figé ;
- preuve séparée :
  - `rendered` = contenu écrit dans le DOM ;
  - `visible` = créneau VEILLE réellement entré visible ;
  - `reading_complete` = créneau visible de 18 s terminé ;
- les doublons sont calculés sur le journal brut des passages visibles ;
- `complete=true` seulement quand les 12 identités figées ont toutes un créneau `reading_complete` ;
- la douzième News reste rendue jusqu'au pulse qui clôt son temps de lecture.

## Invariants

- aucun nouveau `setInterval` ;
- aucun nouveau `MutationObserver` ;
- aucun nouveau propriétaire fetch ;
- aucun nouveau stockage ;
- aucun ordre réel ;
- News collector / Taxonomy 40.6.421 inchangés ;
- Market Core 38.15.11 inchangé ;
- Oracle, Lecture Technique, Atlas CURRENT, Strategy/TRADUS, Storage inchangés.

## Terrain Firefox attendu

1. Ctrl+F5 → **Build 40.6.423**.
2. VEILLE : 1/12 → … → 12/12.
3. Quitter l'onglet vers 4/12, attendre, revenir : même créneau / même progression.
4. La 12e News reste lisible jusqu'à la fin de son créneau.
5. SYSTÈME apparaît en chevauchement propre.
6. Retour menu/date-heure **sans ligne vierge**.
7. Diagnostic attendu :
   - rendered >= 12 ;
   - visible = 12 ;
   - visible_unique = 12 ;
   - reading_complete = 12 ;
   - reading_complete_unique = 12 ;
   - duplicates = 0 ;
   - complete = true.

## Hors scope

Le comptage des preuves/sources dans le résumé de flux mixtes 40.6.420 reste un ticket séparé : il n'est pas modifié ici.

## Suite

Après PASS terrain 40.6.423 :
- **40.6.424 — Storyline Clustering / Diversity**
- **40.6.425 — Criticality vs Operator Relevance**
- **40.6.426 — Language / operator polish**
