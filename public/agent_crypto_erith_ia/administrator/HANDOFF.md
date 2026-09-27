# Handoff Seven — 40.6.433 · Execution Cost Truth Mount Repair

## État courant

Build : **40.6.433**.  
Parent : **40.6.432**.  
Market Core : **38.15.11**.

## Preuve de la panne .432

Le dump terrain fourni par Christophe montrait .432 chargé, puis les panneaux .430 et .431 présents, mais aucun panneau **EXECUTION COST TRUTH**.

Diagnostic : **propriétaire chargé, surface non montée**.

## Réparation .433

Une seule responsabilité : rendre le panneau visible lorsque Strategy A devient réellement disponible.

Le module utilise désormais des ancres de repli Strategy A et remonte sur l'ouverture de Simulation et les événements Strategy A existants.

Aucune logique de mesure Kraken / OKX n'est changée.

## Geste opérateur

**Ctrl+F5 → vérifier 40.6.433 → ouvrir Strategy A.**

Le panneau doit être visible sans chercher dans toute la page.

Ensuite seulement :
**MESURER KRAKEN + OKX → EXPORTER**.

Si le panneau est absent, envoyer simplement le dump/capture : ne rien chercher.

## Protections

Market Core, Aether, CSS cockpit, Oracle, Risk, Paper, seuils et frais de référence sont gelés.

Règle : **une intention → un propriétaire → une modification → une preuve → STOP**.
