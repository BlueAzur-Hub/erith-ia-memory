# Agent-Crypto 40.6.481 — ORACLE EVIDENCE CURSOR READ RECOVERY

## Objet unique

Réparer la lecture du store Oracle Evidence devenu trop volumineux pour un `IndexedDB.getAll()` monolithique dans Firefox.

## Cause

Le propriétaire commun `atlasOracleEvidenceAll()` matérialisait le store entier via `getAll()`. Avec plus de 35 000 Evidence, Firefox peut refuser le payload structuré global (`serialized value is too large`).

## Correction

- lecture complète par `openCursor()`, une observation à la fois ;
- API `atlasOracleEvidenceAll()` conservée pour ses consommateurs ;
- warm mirror existant conservé ;
- `put/delete` existants inchangés ;
- pruning : `count()` avant toute lecture complète ; sous 50 000 lignes, aucune matérialisation n'est déclenchée pour le pruning ;
- aucune suppression, migration ou réécriture historique ajoutée ;
- télémétrie de lecture cursor exposée.

## Invariants

Aucune modification de :
- schéma IndexedDB ;
- rétention 50 000 ;
- Oracle Math / modèles ;
- Strategy A / profil Crypto ;
- Atlas CURRENT ;
- Market Core 38.15.11 ;
- ordres réels.

## Terrain attendu

Firefox → Oracle → Evidence & validation :
- plus de `serialized value is too large` ;
- Explorer/Lab/Integrity capables de reconstruire leurs vues ;
- compteur Evidence conservé et continuant à progresser.

La mémoire chaude complète reste volontairement conservée en 40.6.481. Le stockage froid GitHub est un chantier séparé.
