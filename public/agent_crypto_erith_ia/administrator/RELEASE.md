# Agent-Crypto — Boot Surgical Probe

Build **40.6.411** · parent **40.6.410** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Pourquoi

Le terrain 40.6.410 confirme que Strategy attend désormais Aether, mais le chemin critique reste avant Strategy :

- Livecheck ≈ 31,96 s ;
- Marché ≈ 56,41 s ;
- CURRENT restauré ≈ 64,34 s ;
- Graphique / Consultation / Aether ≈ 76,49 s.

Le rapport 40.6.410 mélangeait aussi `responseEnd → load event` sous l'étiquette `eval/event`, ce qui pouvait accuser à tort de petits scripts.

## Changement unique

**Instrumentation chirurgicale uniquement.**

40.6.411 ajoute :

- mesure des fonctions existantes du chemin Livecheck → Market → CURRENT → Graph ;
- mesure exacte du timer Aether-ready → postboot : scheduled / expected / fired / drift ;
- marques `eval-enter` / `eval-exit` dans :
  - `private-source-demand-loader.js`,
  - `strategy-a-canonical-spec.js`,
  - `atlas-family-demand-residency.js` ;
- calcul dans le Rapport :
  `responseEnd → eval-enter → eval-exit → load-event` ;
- trace des ressources externes précoces utiles au diagnostic.

## Invariants

- comportement Aether-first de 40.6.410 conservé ;
- Strategy métier inchangée ;
- Auto A inchangé ;
- Market Core 38.15.11 inchangé ;
- aucune nouvelle requête métier ;
- aucun stockage ajouté ;
- aucun ordre réel ;
- aucun scheduler récurrent ajouté.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.411 · Administrator**.
3. Ne pas ouvrir Evidence pendant le premier boot.
4. Utiliser souris / scroll normalement ; ne pas rester volontairement immobile.
5. Attendre stabilisation.
6. Rapport de démarrage → **Actualiser** → **Copier**.
7. Envoyer surtout :
   - `SURGICAL BOOT PROBE · 40.6.411`,
   - `FUNCTION TIMINGS`,
   - `SCRIPT RESPONSE / EVAL / LOAD SPLIT`,
   - `POSTBOOT TIMER`,
   - `EXTERNAL RESOURCE TRACE`,
   - `READINESS EVENT TRACE`,
   - `TOP MARK GAPS`.

## Stop

**Ne corriger aucun propriétaire avant lecture de cette preuve.**
