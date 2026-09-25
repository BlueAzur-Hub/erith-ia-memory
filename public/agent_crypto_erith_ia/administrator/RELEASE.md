# Agent-Crypto — Decision Board Continuity Recovery

Build **40.6.414** · parent **40.6.413** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Diagnostic terrain 40.6.413

Le split secondaire a innocenté les cinq suspects :
- `analysis-aux-demand-loader.js` ≈555 ms total ;
- `market-reading-depth.js` ≈277 ms ;
- `layout-repair.js` ≈155 ms ;
- `admin-theme-glass.js` ≈480 ms ;
- `market-stack.js` ≈273 ms.

Ils n'expliquent donc pas les freezes multi-secondes.

En revanche, le code a révélé une régression certaine : le coalescing Decision Board introduit en 40.6.412 était protégé par une condition **exactement égale à 40.6.412**. Dès 40.6.413, il se désactivait et retombait sur le rendu lourd historique.

Le rapport 40.6.413 le confirme : plusieurs `renderDecisionBoard()` d'environ 1,2–1,3 s chacun pendant le boot, alors que le snapshot du gate restait à zéro.

## Correction unique 40.6.414

Le gate Decision Board 40.6.412 devient **continu sur tous les builds 40.6.x >= 412**.

Aucune logique Atlas/CURRENT n'est modifiée.

Le comportement Atlas observé n'est pas une preuve d'un double démarrage du même CURRENT : le dump montre un CURRENT restauré puis, plus tard, un **NOUVEAU CURRENT FERMÉ** sur un snapshot canonique ultérieur. Le mécanisme N+1 est donc conservé.

## Invariants

- Market Core 38.15.11 inchangé ;
- Strategy métier inchangée ;
- Aether métier inchangé ;
- Atlas CURRENT métier inchangé ;
- Oracle / Math / Lecture Technique inchangés ;
- aucun nouveau fetch ;
- aucun stockage ajouté ;
- aucun timer récurrent ;
- aucun ordre réel.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.414 · Administrator**.
3. Utiliser l'interface normalement.
4. Attendre Consultation / Strategy / Postboot.
5. Rapport de démarrage → Actualiser → Copier.
6. Vérifier le bloc `DECISION BOARD CONTINUITY · 40.6.414` :
   - `active YES` ;
   - `deferred` augmente pendant le boot ;
   - un flush utile après ouverture du gate ;
   - `errors 0`.

## Stop

Si les gels cycliques disparaissent ou diminuent fortement, le propriétaire principal était bien la régression de continuité du gate.
Si les gels persistent, la prochaine analyse doit viser uniquement les propriétaires Atlas/CURRENT actifs pendant le cycle, pas les cinq secondaires désormais innocentés.
