# Agent-Crypto 40.6.196 — G3 Decision Replay Verifier

Parent: 40.6.195

## Objectif
Faire consommer le dataset t0 + marché par une première logique de replay **sans fixture par défaut** et vérifier si la décision enregistrée (`NO_TRADE` ou `PAPER_CANDIDATE`) est reproductible sous la spec canonique compatible.

Ce lot vérifie la logique de décision. Il ne calcule pas encore les sorties, PnL, drawdown ou robustesse statistique : Gate 3 reste `PENDING`.

## Nouveau propriétaire
- `js/strategy-a-g3-decision-replay.js`
- API : `AgentCryptoStrategyAG3DecisionReplay`.
- Entrée principale : `AgentCryptoStrategyAG3ReplayDataset.snapshot()`.
- Politique : `AgentCryptoStrategyACanonicalSpec.spec.policy`.
- Le contrôle exige `AgentCryptoStrategyACanonicalSpec.audit().status === "OK"`.
- Aucun seuil Strategy A n'est dupliqué depuis un scénario : les seuils viennent de la spec canonique.
- `data_ready` doit être retrouvé explicitement dans la ligne brute du même cycle Experiment Ledger ; son absence interdit la vérification.
- La version de policy enregistrée dans la décision doit correspondre exactement au build de la spec canonique courante ; sinon la ligne reste `NOT_VERIFIED`.
- Le seuil Cost Gate enregistré doit correspondre au seuil canonique ; sinon la ligne est rejetée.

## États
- `NOT_VERIFIED` : dataset non prêt, `data_ready` absent, spec audit non OK, version de policy incompatible, seuil Cost Gate divergent, entrée non évaluable ou décision reproduite différente.
- `DECISION_REPLAY_VERIFIED` : toutes les décisions jointes sont reproduites sans fixture par défaut et sous la même version de policy canonique.

`DECISION_REPLAY_VERIFIED` prouve la reproductibilité de la décision t0, pas sa rentabilité et pas Gate 3 entière.

## Self-test local
- chemin complet => `PAPER_CANDIDATE` : PASS ;
- blocage DIRECTION => `NO_TRADE` : PASS ;
- `data_ready` absent => non évaluable ;
- entrée financière `null` => non évaluable ;
- zéro fixture par défaut ;
- zéro outcome futur en entrée.

## Intégration
- Le canonical Administrator charge explicitement le verifier après le dataset.
- Evidence Dossier Single-Owner passe à 6 panneaux structurés.

## Protégé
- Market Core 38.15.11 inchangé.
- Replay sandbox 40.6.192 et ses tests restent inchangés ; aucune preuve Foundation n'est invalidée par cette livraison.
- Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique, TRADUS et Paper ledger inchangés.
- Aucun ordre réel, wallet, credentials, fetch métier, WebSocket, timer récurrent, observer ou nouveau stockage.
- PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain Firefox
1. Recharger jusqu'à `Build 40.6.196 · Administrator`.
2. Dans Evidence Dossier, vérifier `6 / 6 PANNEAUX` si toutes les API sont disponibles.
3. Lire successivement `T0 DECISION PROOF`, `IMMUTABLE REPLAY DATASET`, puis `DECISION REPLAY VERIFIER`.
4. Un `NOT_VERIFIED` n'est pas une régression : lire le blocker exact. Les cycles historiques peuvent ne pas avoir enregistré `data_ready` ou la version de policy.
5. Si `DECISION_REPLAY_VERIFIED` apparaît, l'étape suivante reste le backtest économique : outcomes ajoutés après horizon, coûts/exécution, puis rapport net. Aucun outcome futur ne doit rétroagir sur le signal t0.
