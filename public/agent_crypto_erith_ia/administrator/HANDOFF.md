# HANDOFF — Agent-Crypto 40.6.454

## Test Firefox exact
**Ne pas déplier toute la page.**

1. Ctrl+F5.
2. Vérifier en haut : **Build 40.6.454 · Administrator**.
3. Ouvrir uniquement **Section 04 · Expérimentation & système**.
4. Dans Section 04, ouvrir uniquement **Simulation**.
5. Repérer **AUTO PAPER RUNNER V1 · STRATÉGIE A** et **STRATEGY A · EXPERIMENT LEDGER**.
6. Noter le nombre `cycles` / `Cycles tracés`.
7. Si Auto A est déjà actif, attendre son prochain cycle prévu. S'il est OFF, ne pas l'activer uniquement pour le test sans décision opérateur.
8. Après un vrai nouveau cycle : le nombre doit avancer d'une unité, sans double-cycle.
9. Dans la même sous-section Simulation, vérifier seulement la présence de :
   - STRATEGY A · COST-WAIT OUTCOME AUDIT ;
   - STRATEGY A · ORACLE / COST CALIBRATION TRUTH ;
   - STRATEGY A · EXECUTION COST TRUTH.

**Rien d'autre à ouvrir pour .454.**

Si Auto A reste OFF, la non-régression visuelle suffit côté terrain ; le dispatch est couvert par le harness automatisé jusqu'au prochain vrai cycle.
