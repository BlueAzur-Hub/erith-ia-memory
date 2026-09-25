# Agent-Crypto — Handoff

Build **40.6.402** · rollback **40.6.401** · Market Core **38.15.11**.

Objectif : vérifier que la contention Cold Boot baisse sans perdre de fonction.

Test Firefox :
1. Ctrl+F5 et vérifier **Build 40.6.402**.
2. Utiliser immédiatement souris / scroll / panneaux.
3. Vérifier que **Auto Reader** devient actif plus tôt.
4. Vérifier Marché, Graphique, Oracle, Aether et Strategy A.
5. Ne pas ouvrir GitHub Memory au début : il ne doit plus se charger automatiquement.
6. Ensuite ouvrir GitHub Memory et utiliser son bouton manuel : la fonction doit rester disponible.
7. Ouvrir **Rapport de démarrage** → **Actualiser** → **Copier**.

Attendu :
- owner GitHub Memory absent de la liste Cold Boot ;
- Auto Reader start vers **7/19** ;
- instrumentation SYNC / SETTLE toujours présente ;
- Strategy Evidence reste explicit-demand-only ;
- aucune régression Market Core / Strategy / Math / Aether / LT / REDIVIDER.
