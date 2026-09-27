# Agent-Crypto — 40.6.430 · STRATEGY A COST-WAIT AUDIT CANONICAL NAME

Parent : **40.6.429**.  
Market Core : **38.15.11**.

## Objet unique

Corriger la dette de nomenclature introduite par 40.6.429, sans toucher à la logique Strategy A.

Le propriétaire fonctionnel actif devient :

`js/strategy-a-cost-wait-outcome-audit.js`

L'ancien fichier versionné est retiré :

`js/strategy-a-cost-wait-outcome-audit-406429.js`

Règle appliquée : **Git porte les versions ; les noms de fichiers portent les responsabilités.**

## Nettoyage borné

Les query strings `?v=40.6.429` introduites par la livraison .429 sont retirées de :

- `style.css`
- `app.js`
- `js/post-boot-runtime-loader.js`
- le module Cost-Wait renommé

Ctrl+F5 reste le geste opérateur de rafraîchissement.

## Protections

- logique Cost-Wait .429 inchangée ;
- Cost Gate 0,80 % inchangé ;
- coût 0,60 % inchangé ;
- Direction / Confiance inchangées ;
- Oracle / Risk Governor / Paper inchangés ;
- Market Core 38.15.11 inchangé ;
- Aether inchangé ;
- CSS cockpit fonctionnel inchangé ;
- aucun nouveau fetch / WebSocket / timer / observer / stockage ;
- aucun ordre réel.

Les identifiants internes historiques `406429` ne sont pas renommés dans cette chirurgie, conformément au précédent `operator-dashboard.js` : le changement porte sur le **nom canonique du fichier actif**, pas sur une migration transversale.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.430**.
3. Ouvrir Simulation / Strategy A.
4. Vérifier le panneau **STRATEGY A · COST-WAIT OUTCOME AUDIT · 40.6.430**.
5. Console : `AgentCryptoStrategyACostWaitOutcomeAudit406429.self_test().pass === true`.
6. Vérifier qu'aucune requête n'est faite vers `strategy-a-cost-wait-outcome-audit-406429.js`.

Terrain : **PENDING FIREFOX**.
