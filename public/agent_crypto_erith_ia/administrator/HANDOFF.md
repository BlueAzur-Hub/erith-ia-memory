# Agent-Crypto — Handoff

Build **40.6.404** · rollback **40.6.403** · Market Core **38.15.11**.

Objectif : nommer les modules responsables des longs blocages postboot sans modifier leur comportement.

Test Firefox :
1. Ctrl+F5 et vérifier **Build 40.6.404**.
2. Utiliser l'interface normalement pendant le démarrage.
3. Ne pas ouvrir GitHub Memory ni Strategy Evidence au premier passage.
4. Après stabilisation : **Rapport de démarrage → Actualiser → Copier**.
5. Fournir le rapport complet.

Sections prioritaires :
- **POSTBOOT MODULE COST TRACE** ;
- **TOP MARK GAPS · >= 250 ms** ;
- **READINESS EVENT TRACE**.

Critère : isoler les 1 à 3 fichiers dont cycle_ms/load_ms expliquent les freezes de plusieurs secondes.

Aucune correction fonctionnelle n'est incluse dans 40.6.404.
