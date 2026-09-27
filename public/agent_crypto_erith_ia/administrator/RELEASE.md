# Agent-Crypto — 40.6.436 · STRATEGY A EXECUTION COST OWNER RECOVERY

Parent : 40.6.435.
Market Core : 38.15.11.

## Échec terrain .435
- Execution Cost Truth visible.
- Source Truth CEX séparé : CEX READY, OKX 5/5.
- clic Mesurer : Kraken indisponible, diagnostic `fetchJson is not defined` ; OKX indisponible dans le même panneau.
- audit du module publié : appels `fetchJson()` présents mais helper absent.

## Correction .436
1. restaure un helper `fetchJson()` borné pour le carnet public Kraken ;
2. OKX réutilise `ErithPrivateBackendSources.refresh()` et donc le propriétaire Source Truth CEX déjà prouvé ;
3. supprime la chaîne de fallback de montage ;
4. emplacement unique : directement après `strategyAOracleCostCalibrationAudit` ;
5. ajoute un self-test interne pour empêcher la régression du helper.

## Inchangé
Strategy A métier, Cost Gate, Oracle, Risk, Paper, Market Core 38.15.11, Aether et CSS cockpit.

## Test Firefox
Ctrl+F5 > Build 40.6.436 > Simulation / Strategy A.
Execution Cost Truth doit être directement sous Oracle / Cost Calibration Truth.
Cliquer MESURER KRAKEN + OKX.
Attendu : Kraken chiffré ; OKX `SOURCE TRUTH CEX · BACKEND LOCAL 8790` avec bid/ask/spread.
