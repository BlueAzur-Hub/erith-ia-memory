# Agent-Crypto — 40.6.429 · STRATEGY A COST-WAIT OUTCOME AUDIT

Parent : **40.6.428**.  
Market Core : **38.15.11**.  
CSS cockpit 40.6.428 : **inchangé / protégé**.  
Aether .425 : **inchangé / protégé**.

## Destination

Mesurer au lieu de modifier.

40.6.429 ajoute un audit passif des cycles **Strategy A · COST_GATE_WAIT** pour répondre à une question précise :

> les refus du Cost Gate protègent-ils réellement Strategy A, ou le seuil bloque-t-il aussi des mouvements qui dépassent ensuite les coûts / le seuil existant ?

## Instrumentation

Une seule instrumentation dans le ledger Auto A :

- après l'écriture réelle d'un cycle, émission locale de `agent-crypto:strategy-a-experiment-cycle` ;
- aucune modification de la décision du cycle ;
- aucun changement de cadence Auto A.

Nouveau module :

`js/strategy-a-cost-wait-outcome-audit-406429.js`

Il lit uniquement les lignes existantes du **Strategy A Experiment Ledger / Durable Evidence**.

Pour chaque vrai `COST_GATE_WAIT`, il cherche les prix des cycles Auto A suivants :

- T+5 min ;
- T+15 min ;
- T+60 min.

Tolérance de raccord temporel : **±2,5 min**.

Il calcule aussi sur la fenêtre T0 → T+60 :

- MFE observée, échantillonnée aux cycles Auto A ;
- MAE observée ;
- pic net théorique après le coût déjà porté par le cycle ;
- écart MFE − expected_move.

## Classification descriptive

- `REFUS_PROTECTEUR_OBSERVE` : le pic observé reste sous les coûts modélisés ;
- `COUVRE_COUTS_SANS_MARGE` : le pic couvre les coûts mais pas le seuil complet ;
- `SEUIL_DEPASSE_APRES_REFUS` : le pic observé dépasse le seuil Strategy A existant ;
- `INCONNU` : T+60 ou échantillonnage insuffisant.

Ces classes ne sont **pas** des P/L exécutés et ne constituent aucune preuve de rentabilité.

## Interdits respectés

- aucun seuil Strategy A modifié ;
- Cost Gate 0,80 % inchangé ;
- modèle de coût 0,60 % inchangé ;
- Direction / Confiance inchangées ;
- Oracle inchangé ;
- Risk Governor inchangé ;
- Paper inchangé ;
- Market Core 38.15.11 inchangé ;
- Aether inchangé ;
- CSS cockpit inchangé ;
- aucun fetch ;
- aucun WebSocket ;
- aucun timer récurrent ;
- aucun MutationObserver ;
- aucun nouveau stockage ;
- aucun ordre réel.

## Charge runtime

Le module est ajouté aux runtimes secondaires, pas au Strategy Core critique.

Il se recalcule sur :

- le nouvel événement de cycle Auto A ;
- Durable Evidence ready ;
- ouverture de Simulation ;
- pageshow.

Il n'écoute pas le flux marché chaud.

## Test local

Self-test JavaScript : **PASS 5/5**.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.429**.
3. Ouvrir **Simulation / Strategy A**.
4. Vérifier la présence du panneau **STRATEGY A · COST-WAIT OUTCOME AUDIT · 40.6.429**.
5. Dans la console, vérifier :
   `AgentCryptoStrategyACostWaitOutcomeAudit406429.self_test().pass === true`
6. Laisser Auto A actif ; les T+60 ne doivent se résoudre qu'après des cycles futurs réels.
7. Exporter l'audit après accumulation pour analyser la calibration.

Aucune modification de seuil ne doit être faite à partir d'un échantillon incomplet.
