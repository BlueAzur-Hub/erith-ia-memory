# HANDOFF — Agent-Crypto 40.6.438 RESTORE

40.6.437 est rejetée terrain : interface déclarée morte par l'opérateur.

40.6.438 restaure le runtime actif depuis 40.6.425 par commit en avant, sans rembobiner les données ni l'historique Git.

Règle de reprise :
1. Firefox tranche.
2. Si l'interface 40.6.438 est complète et réactive : geler la restauration.
3. Ne réintroduire aucun module 40.6.429–40.6.437 avant PASS.
4. Après PASS seulement, reprendre les dettes Execution Cost Truth une par une.
5. VALIDÉ = IMMUTABLE.
