# Agent-Crypto 40.6.195 — G3 Immutable Replay Dataset

Parent: 40.6.194

## Objectif
Assembler sans fuite du futur une entrée de replay reproductible à partir de deux preuves déjà séparées :
1. série marché 24 h dont la couverture temporelle est certifiée par 40.6.193 ;
2. décisions Strategy A certifiées à t0 par 40.6.194.

Ce dataset ne constitue pas un backtest économique et ne passe pas Gate 3. Il rend seulement possible l'étape suivante sans fabriquer les champs manquants.

## Nouveau propriétaire
- `js/strategy-a-g3-replay-dataset.js`
- API : `AgentCryptoStrategyAG3ReplayDataset`.
- Sources : `AgentCryptoMarketSeriesTruth.snapshot()` + `AgentCryptoStrategyAG3T0DecisionProof.snapshot()`.
- Jointure par actif et temps marché ; le point de marché doit être antérieur ou égal au t0 et suffisamment proche selon la cadence source.
- La série doit porter `temporal_coverage_certified === true` et une cadence explicite.
- Seules les lignes `CERTIFIED_T0_ROW` peuvent entrer dans le dataset.
- Aucun outcome, PnL, prix de sortie ou autre information future n'entre dans les entrées de décision.

## États
- `NOT_READY` : série non certifiée, aucune ligne t0 certifiée, mismatch actif, t0 hors fenêtre ou jointure temporelle non bornée.
- `REPLAY_INPUT_READY` : au moins une décision t0 certifiée est jointe à une série certifiée.

`REPLAY_INPUT_READY` signifie **entrée de replay prête**, jamais `GATE 3 PASS`.

## Identité du dataset
- Un `dataset_id` déterministe est calculé sur le snapshot marché + décisions t0 jointes.
- L'empreinte FNV-1a 32 est explicitement marquée comme identifiant de contenu non cryptographique ; elle ne prétend pas être une preuve anti-altération.

## Self-test local
- série certifiée + ligne t0 certifiée => `REPLAY_INPUT_READY` : PASS ;
- aucune ligne t0 => NOT READY ;
- couverture temporelle non certifiée => NOT READY ;
- t0 hors fenêtre => rejet ;
- actif différent de la série => rejet ;
- outcome futur jamais utilisé en entrée ;
- Gate 3 reste PENDING dans tous les cas.

## Intégration
- Le canonical Administrator charge explicitement le dataset.
- Evidence Dossier Single-Owner passe à 5 panneaux structurés : Structured Truth, History Owner, Historical Adapter, T0 Decision Proof, Immutable Replay Dataset.

## Protégé
- Market Core 38.15.11 inchangé.
- Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique et TRADUS inchangés.
- Replay déterministe 40.6.192 et ses tests de fondation inchangés.
- Aucun seuil Strategy A modifié.
- Aucun fetch métier, WebSocket, timer récurrent, observer, stockage, wallet, credential ou ordre réel ajouté.
- PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain Firefox
1. Recharger jusqu'à `Build 40.6.195 · Administrator`.
2. Dans Evidence Dossier, vérifier `5 / 5 PANNEAUX` si toutes les API sont présentes.
3. Vérifier `G3 · IMMUTABLE REPLAY DATASET`.
4. Si l'état est `NOT_READY`, lire les blockers sans les contourner ; les anciennes lignes peuvent manquer de temps marché, versions ou entrées t0.
5. Si l'état devient `REPLAY_INPUT_READY`, cela prouve seulement le raccord dataset. Étape suivante : rejouer la logique canonique sur ces entrées et comparer la décision reproduite à la décision enregistrée, toujours sans utiliser le futur.
