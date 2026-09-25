# Agent-Crypto — Handoff

Build **40.6.412** · parent **40.6.411** · rollback **40.6.407**.

## Mission

Retirer la tempête `renderDecisionBoard()` du chemin critique sans toucher à la logique métier.

## Vérité acquise

40.6.411 a prouvé :

- Strategy Canonical Spec est un faux coupable : l'attente est avant son eval ;
- le thread principal reste congestionné ;
- Decision Board possède plusieurs rendus synchrones réels de ~1,2–1,4 s.

## 40.6.412

- rendu Decision Board passif différé jusqu'à Strategy Core ready ;
- postboot-ready = fallback ;
- état identique = rendu passif dédupliqué ;
- refresh humain = force immédiate ;
- sonde complète conservée.

## À vérifier

Comparer 40.6.411 → 40.6.412 :

- Livecheck ;
- Marché ;
- CURRENT ;
- Graphique / Consultation / Aether ;
- Strategy Core ;
- drift du timer Postboot ;
- nombre et coût des rendus Decision Board ;
- attente `responseEnd → eval-enter` du Strategy spec.

Si le trou Livecheck → Marché reste dominant après cette correction, le prochain audit vise uniquement ce chemin.

**Aucune 40.6.413 avant lecture du rapport Firefox 40.6.412.**
