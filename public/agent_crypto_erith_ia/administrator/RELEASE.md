# Agent-Crypto — Livecheck Cockpit / F11 Viewport Fit

Build **40.6.426** · parent **40.6.425** · Market Core **38.15.11**.

## Destination opérateur

Après clic sur le raccourci **Livecheck**, le viewport de travail doit être composé ainsi :

1. **Menu / Aether** en haut ;
2. **Graphique + Lecture technique** au centre ;
3. **Target Top 5** comme dernière bande visible en bas du viewport ;
4. **Market Flow** reste intact, immédiatement après Target Top 5 dans le document, mais entièrement sous le fold.

En **F11**, le même contrat s'étend pour utiliser l'espace vertical supplémentaire. En quittant F11, la géométrie se recalcule automatiquement.

## Correction 40.6.426

### Propriétaire CSS borné
`admin-livecheck-cockpit-406426.css` n'agit que lorsque `data-atlas-livecheck-cockpit="1"` est actif. Il redonne à `#market-zone / #analyste / chart-panel / chart-shell / Lecture technique` un budget vertical commun.

### Propriétaire runtime borné
`js/livecheck-cockpit-406426.js` :
- s'active uniquement au clic sur le raccourci Livecheck ;
- mesure le viewport réel, la hauteur Menu/Aether, les gaps naturels et Target Top 5 ;
- calcule seulement la hauteur de `#market-zone` ;
- aligne `#livecheck` en haut du viewport ;
- recalcule sur `resize` via un unique `requestAnimationFrame` pour F11 / sortie F11 ;
- se désactive lorsqu'un autre raccourci principal est choisi.

## Ce qui n'est pas touché

- Market Flow : **ni masqué, ni déplacé, ni redimensionné, ni sélectionné par le runtime** ;
- ordre DOM : inchangé ;
- Market Core 38.15.11 : inchangé ;
- Aether .425 : inchangé ;
- Oracle / Math / Strategy / Storage : inchangés ;
- Window Manager : aucune écriture ;
- aucun timer récurrent ;
- aucun MutationObserver ;
- aucun stockage nouveau ;
- aucune requête réseau nouvelle.

## Terrain Firefox attendu

### Fenêtre normale
1. Ctrl+F5 → vérifier **Build 40.6.426**.
2. Cliquer **Livecheck** dans la barre supérieure.
3. Vérifier : Menu/Aether haut, Graphique + Lecture technique centre, Target Top 5 entièrement visible en bas.
4. **Aucun morceau de Market Flow ne doit apparaître dans le viewport.**
5. Scroller vers le bas : Market Flow doit apparaître normalement et continuer à défiler.

### F11
1. Depuis la vue Livecheck, appuyer sur F11.
2. Graphique + Lecture technique doivent utiliser le nouvel espace.
3. Target Top 5 doit rester la dernière bande visible.
4. Market Flow doit rester sous le bord inférieur.
5. Sortir de F11 : la géométrie normale doit revenir sans manipulation manuelle.

## Suite

Après PASS terrain de cette géométrie :
- gel du cockpit Livecheck ;
- **40.6.427 — Storyline Clustering / Diversity**.
