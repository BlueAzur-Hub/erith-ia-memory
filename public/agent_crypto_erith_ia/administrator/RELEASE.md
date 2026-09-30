# Agent-Crypto 40.6.489 — ORACLE EVIDENCE HOT WINDOW SIZING PROBE

## Objet
Mesurer automatiquement le poids réel des Oracle Evidence encore portées par Firefox avant de choisir une HOT WINDOW.

## Mesures
- count IndexedDB exact ;
- échantillon systématique borné à 1 000 lignes ;
- taille JSON réelle avec TextEncoder ;
- moyenne, médiane, P95, minimum et maximum ;
- estimation du payload local total ;
- navigator.storage.estimate() pour l'origin ;
- couverture du manifest froid GitHub ;
- scénarios HOT 10 000 / 5 000 / 2 500 comme estimations uniquement.

## Sécurité
READ ONLY. Aucune modification locale. Aucune rétention activée. Aucun changement de schéma.

## Terrain
Après Ctrl+F5 :
Oracle → Evidence & validation → ORACLE EVIDENCE · HOT WINDOW SIZING · 40.6.489.

La mesure part automatiquement une fois. Le bouton « Mesurer — aucune suppression » permet uniquement de refaire la mesure.

La décision de HOT WINDOW reste interdite tant que les chiffres terrain ne sont pas lus.
