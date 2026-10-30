# Trader dossier Paper — R2 / Preuve de marché + Strategy A
Date : 8 octobre 2026 · contrat 40.6.624 inchangé.

## Nouveau raccordement (lecture seule)
- Lit les snapshots préexistants Bougies (`AgentCryptoMarketMicroscope.snapshot()`) et Carnet (`AgentCryptoOkxMicrostructure.snapshot()`). Refuse toute autre crypto, autre paire ou carnet périmé ; conserve les cotations réelles BTC-USDC, BTC-EUR, etc., sans conversion.
- Lit les gates via `AgentCryptoStrategyAGateCanonicalTruth.snapshot()`, sinon via `AgentCryptoStrategyASafetyCertification.certification_matrix()` ou `AgentCryptoStrategyAEvidenceDossier.snapshot()` si les API sont effectivement montées. Module absent reste inconnu, jamais un faux zéro.
- Lit le gouverneur via `AgentCryptoStrategyASafetyCertification.snapshot()` ou le `safety_gate_snapshot()` du Paper Lifecycle, sans confondre NORMAL global et autorisation sur actif.
- Expose les preuves manquantes et les blocages documentaires ; aucun signal, ordre réel, entrée Paper ou modification des moteurs et garde-fous.
- Uniquement `trader-paper-preparation.js` et cache-bust de l'adaptateur `trader-runtime-mirror.js`. Runtime Administrator, Bougies, Profondeur, Bridge, Market Core 38.15.11, archives R9 et Build 40.6.624 protégés.
## Tests internes
Module JavaScript analysé ; 7 assertions : gate canonique, pas d'autorisation malgré NORMAL, données de marché concordantes, autre actif refusé, carnet périmé refusé, matrice de fallback, absence fail-closed.
Tests GitHub Actions, publication et validation Firefox à vérifier après commit.

Dest. D suivante : relier preuves de décision propres à l'instrument et horodatage T0 depuis Strategy A, en conservant les gates globaux séparés.