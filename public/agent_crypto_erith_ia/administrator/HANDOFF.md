# HANDOFF — Agent-Crypto 40.6.452

## Test Firefox minimal
1. Vérifier **Build 40.6.452**.
2. Ouvrir **Simulation**.
3. Vérifier que Cost-Wait, Oracle/Cost et Execution Cost montent toujours.
4. Facultatif dans la console :
   `AgentCryptoStrategyAAuditDemand.self_test()`
   doit renvoyer `pass: true`.

Ne pas provoquer volontairement une panne de script sur la session opérateur : le cas script chargé sans API est couvert par le harness local et par le workflow.

## Hors périmètre
Aucun changement de seuil Strategy, calcul, quote freshness, tableau, Backend, Oracle, Market Core ou Aether.
