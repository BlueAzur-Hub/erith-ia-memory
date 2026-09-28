# HANDOFF — Agent-Crypto 40.6.453

## Test Firefox minimal
1. Faire **Ctrl+F5** et vérifier **Build 40.6.453**.
2. Observer Aether puis ouvrir **Backend / API → Source Intelligence** si nécessaire.
3. Si Source Intelligence est **PARTIELLE**, **FRAÎCHEUR PARTIELLE**, STALE/UNKNOWN ou CEX incomplet, Aether doit afficher **SOURCES PARTIELLES**.
4. Aether ne peut afficher **TOUTES LES SOURCES PRÊTES** que lorsque Source Intelligence est READY, freshness gate READY et CEX complet.
5. Vérifier que Strategy / Oracle / Execution Cost restent inchangés.

## Hors périmètre
La dette suivante reste séparée : câblage de l'événement `agent-crypto:strategy-a-experiment-cycle`.

Aucun changement de seuil, aucun ordre, aucun Market Core, aucun Backend métier.
