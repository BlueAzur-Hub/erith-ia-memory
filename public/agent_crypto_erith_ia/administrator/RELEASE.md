# Agent-Crypto — Aether Menu Escape / Continuity Recovery

Build **40.6.425** · parent **40.6.424** · Market Core **38.15.11**.

## Terrain 40.6.424
La boucle INFO → NEWS → SYSTEM → INFO et la disparition de la ligne vide sont bonnes.
Le défaut restant est le contrat manuel de `♥ VEILLE` : .424 le traite comme un HOLD persistant qui peut tuer la cadence jusqu'à reprise explicite ou reload.

## Correction 40.6.425
- `♥ VEILLE` affiche immédiatement le menu natif.
- Aucun `manualPaused=true`.
- Le timeout canonique n'est pas détruit.
- Aucun second timer n'est créé.
- À la prochaine échéance canonique, Aether reprend automatiquement.
- Si `remaining <= 0`, `nextAction` est exécuté immédiatement.
- `Aether · ATTENTION` reste une reprise immédiate optionnelle.

## Protections
Market Core 38.15.11 · News collector · Oracle · Math · Lecture Technique · Atlas CURRENT · Strategy/TRADUS · Storage · Window Manager : inchangés.

## Terrain Firefox attendu
**NEWS → ♥ VEILLE → MENU → attendre sans cliquer → reprise automatique Aether.**
Répéter depuis INFO et SYSTEM. Aucun Ctrl+F5 ne doit être nécessaire pour réveiller le fil.

## Suite
Après PASS : **40.6.426 — Storyline Clustering / Diversity**.
