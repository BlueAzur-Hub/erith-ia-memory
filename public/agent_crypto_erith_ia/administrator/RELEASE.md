# Agent-Crypto — Aether Single Phase Owner

Build **40.6.424** · parent **40.6.423** · Market Core **38.15.11**.

## Terrain

40.6.423 confirme deux progrès : Aether affiche davantage de News distinctes et la preuve 12/12 est plus honnête.

Mais le terrain capture encore une **ligne command-bar physiquement vide** entre des phases, puis une autre avant le retour automatique du menu natif.

## Audit complet du bandeau

La cause n'est plus le stock News. Le bandeau possède encore plusieurs propriétaires temporels indépendants :

- `atlasStatusNativePhase`
- `atlasAetherBandPhase`
- `atlasAetherInfoPhase`
- `atlasAetherVeillePhase`
- `atlasAetherSystemPhase`
- `atlasAetherFeedPulse40112`

Le conteneur `#livecheck.command-bar` conserve sa hauteur même lorsqu'aucun enfant de phase n'est visible : le défaut se manifeste donc comme une vraie ligne vide.

En parallèle, `aether-operator-bridge.js` historique pouvait encore écrire en inline `animation / opacity / visibility` et forcer un `offsetWidth` pour redémarrer les animations CSS.

## Correction 40.6.424

### Un seul propriétaire
`aether.js` possède désormais une seule machine d'état :

`INFO 15 s → NEWS 1…12 (18 s chacune) → SYSTEM 9 s → INFO`

Total automatique : **240 s**.

### Plus de menu automatique
Après exposition Aether, le menu natif ne revient plus automatiquement pendant 30 s.

Le menu reste disponible **à la demande** via l'échappement VEILLE. Cette pause manuelle conserve la phase et son temps restant ; Aether ATTENTION reprend exactement où le flux s'était arrêté.

### CSS sans horloge de phase
Les keyframes de phase sont retirées. CSS n'a plus qu'un rôle de présentation :

`#livecheck[data-aether-phase="info|veille|system|native"]`

Une transition est donc un changement d'état unique, pas une convergence de plusieurs animations.

### Firefox / onglet masqué
Une seule échéance `setTimeout` est active au maximum. Quand l'onglet est masqué, son temps restant est mémorisé puis repris.

## Vérité propriétaire

Cette version ajoute volontairement **un seul timeout auto-réarmé** comme propriétaire temporel de la phase.

- nouveau `setInterval` : non
- nouveau `MutationObserver` : non
- nouveau fetch métier : non
- nouveau stockage : non
- ordre réel : non
- pending phase timeouts max : 1

## Protections

News collector / Taxonomy 40.6.421, Market Core 38.15.11, Oracle, Lecture Technique, Atlas CURRENT, Strategy/TRADUS et Storage sont inchangés.

## Terrain Firefox attendu

1. Ctrl+F5 → Build 40.6.424.
2. Avant readiness News : menu natif normal.
3. Après 12 News qualifiées disponibles :
   - INFO 15 s ;
   - 12 News × 18 s ;
   - SYSTEM 9 s ;
   - retour direct INFO.
4. **Aucune ligne vide.**
5. **Aucun menu natif automatique qui coupe le flux.**
6. Changer d'onglet vers 4/12 puis revenir : même News et temps restant.
7. Cliquer ♥ VEILLE : menu natif manuel.
8. Cliquer Aether ATTENTION : reprise exacte du flux.

## Suite

Après PASS terrain 40.6.424 :
- **40.6.425 — Storyline Clustering / Diversity**
- **40.6.426 — Criticality vs Operator Relevance**
- **40.6.427 — Language / operator polish**
