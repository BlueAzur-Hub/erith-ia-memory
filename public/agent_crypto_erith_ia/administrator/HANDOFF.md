# Agent-Crypto — Handoff

Build **40.6.403** · rollback **40.6.402** · Market Core **38.15.11**.

Objectif : tracer la chaîne readiness sans modifier son comportement.

Test Firefox :
1. **Ctrl+F5** et vérifier **Build 40.6.403**.
2. Utiliser l'interface normalement pendant le démarrage ; ne pas rester immobile.
3. Attendre la stabilisation raisonnable du cockpit.
4. Ouvrir **Rapport de démarrage** → **Actualiser** → **Copier**.
5. Fournir le rapport complet.

Le rapport doit maintenant contenir :
- **Consultation signals** ;
- **Consultation missing** ;
- **Consultation checks** ;
- **READINESS EVENT TRACE** ;
- **TOP MARK GAPS · >= 250 ms** ;
- les mesures Cold Boot .401/.402 déjà conservées.

Critère : déterminer quel événement ou quelle condition retarde Marché / Graphique / Consultation / Aether runtime / Postboot.

Aucune correction fonctionnelle n'est incluse dans 40.6.403.
