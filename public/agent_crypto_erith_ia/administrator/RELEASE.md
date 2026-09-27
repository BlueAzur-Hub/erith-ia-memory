# Agent-Crypto 40.6.443 — STRATEGY A EXECUTION COST TRUTH ON-DEMAND RESTORE

## Objectif unique
Reprendre le chantier interrompu : restaurer Execution Cost Truth dans Simulation, à la demande uniquement.

## Comportement
Simulation ouverte →
Cost-Wait →
Oracle / Cost Calibration →
Execution Cost Truth.

Execution Cost Truth n'est pas ajouté au post-boot standard.

## Fiabilisation du même propriétaire
- null / chaîne vide ne deviennent plus 0 ;
- bid > ask est refusé pour Kraken et OKX ;
- demande Source Truth bornée à 7 s si le propriétaire Backend n'est pas encore disponible ;
- bouton MESURER revient à l'état normal après la mesure ;
- EXPORTER est répétable ;
- self-test ne se condamne plus lui-même avec une valeur false attendue.

## Protégé
Backend/API 40.6.441 : gelé.
Cadrage Graphique 40.6.442 : gelé.
Aucun changement Market Core, Aether, Oracle math, Risk, Paper ou seuil Strategy.
