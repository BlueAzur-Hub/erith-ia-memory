# Agent-Crypto — Handoff

Build **40.6.405** · rollback **40.6.404** · Market Core **38.15.11**.

Test principal : vérifier l'automatisation sans toucher à Simulation.

1. Ctrl+F5 et vérifier **Build 40.6.405**.
2. **Ne pas ouvrir Simulation** pendant le démarrage.
3. Utiliser normalement le cockpit.
4. Vérifier ensuite que Strategy A est déjà **AUTO A ACTIF** / en attente marché ou Cost Gate, sans clic DÉMARRER.
5. Vérifier que le workspace Strategy A est actif automatiquement.
6. Ouvrir Simulation seulement après cette vérification : les panneaux doivent alors apparaître sans démarrer le moteur.
7. Rapport de démarrage → Actualiser → Copier.

À comparer avec 40.6.404 :
- Strategy Core total et temps d'arrivée ;
- Auto A autostart marker ;
- POSTBOOT MODULE COST TRACE ;
- absence des gros coûts Replay au boot ;
- absence des gros coûts TRADUS avant premier événement ;
- Postboot runtime ready ;
- réactivité Firefox.

STOP opérateur : s'il a été utilisé explicitement dans la session, l'autostart le respecte.

Aucun ordre réel.
