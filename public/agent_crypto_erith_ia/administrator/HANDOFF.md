# HANDOFF — Agent-Crypto 40.6.451

## Test Firefox
1. Vérifier **Build 40.6.451**.
2. Ouvrir Simulation → Execution Cost Truth.
3. Vérifier les deux tableaux Kraken / OKX.
4. Les en-têtes doivent rester dans chaque carte : aucun texte Kraken ne doit traverser dans OKX et inversement.
5. Aucun scroll horizontal ne doit être nécessaire.
6. La ligne OKX `Fraîcheur : FRESH · âge … · limite … · quote …` de .450 doit rester inchangée.

PASS : séparation centrale propre et valeurs toujours lisibles.

La prochaine dette fonctionnelle reste le loader Strategy (reprise après script chargé sans API + self_test), volontairement hors .451.
