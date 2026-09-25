# Agent-Crypto — Handoff

Build **40.6.406** · rollback **40.6.405** · Market Core **38.15.11**.

## Contrat

**Moteur automatique tôt. Présentation légère. Evidence complet seulement sur demande explicite.**

40.6.405 a validé Auto A headless. Ne pas revenir au démarrage manuel.

## Test Firefox 40.6.406

1. Ctrl+F5.
2. Vérifier **Build 40.6.406 · Administrator**.
3. Sans ouvrir Simulation, vérifier le badge supérieur :
   - AUTO A ACTIF ;
   - WAIT ;
   - STOP ;
   - ou ATTENTE pendant la résidence.
4. Ouvrir **Simulation**.
5. Vérifier que l'ouverture seule **ne déclenche pas** le chargement Evidence 28/28.
6. Vérifier le résumé léger **STRATEGY A · 9 GATES**.
7. Vérifier les neuf états G1→G9 depuis la matrice Safety Certification.
8. Ouvrir **Rapport de démarrage → Actualiser → Copier** :
   - avant demande explicite, `Evidence wiring` doit rester non chargé ou à son état préalable ;
   - `reason` ne doit pas devenir `operator-evidence-demand` par simple consultation.
9. Cliquer **OUVRIR LES PREUVES**.
10. Vérifier qu'à ce moment seulement le loader Evidence passe vers **28/28**.
11. Vérifier que les surfaces Evidence complètes restent accessibles après chargement.

## Validation attendue

PASS si :
- Auto A continue sans Simulation ;
- Simulation s'ouvre sans Evidence complet ;
- le résumé des 9 Gates est immédiatement lisible ;
- la demande explicite charge toujours Evidence ;
- aucun moteur métier protégé ne régresse.

## STOP / rollback

Au moindre défaut sur Auto A, Cost Gate, Risk Governor, Paper, Market Core, Math, Aether, Oracle, LT ou REDIVIDER :
**rollback 40.6.405**.

Aucun ordre réel.
