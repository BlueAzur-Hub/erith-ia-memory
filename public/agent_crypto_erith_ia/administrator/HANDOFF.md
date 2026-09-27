# Handoff Seven — 40.6.434 · OKX One-Shot Recovery + Readability

## État courant

Build : **40.6.434**.  
Parent : **40.6.433**.  
Market Core : **38.15.11**.

## Terrain .433

- montage Execution Cost Truth : **PASS** ;
- Kraken BTC/EUR : **PASS** ;
- OKX REST EEA direct : **FAIL · NetworkError** ;
- panneau : trop petit à lire confortablement ;
- ralentissement Firefox global observé, chantier séparé.

## .434

Une seule fonction produit est corrigée : **mesurer OKX sans dépendre du REST EEA qui a échoué dans Firefox**.

Le module tente :
1. WebSocket public EEA `books / BTC-EUR` en **one-shot** ;
2. REST public OKX en fallback.

Le WebSocket n'existe que pendant le clic de mesure et se ferme au premier snapshot.

Le même panneau reçoit une augmentation de typographie locale. Aucun style global n'est rouvert.

## Geste opérateur

Ctrl+F5 → vérifier **40.6.434** → Simulation / Strategy A → Execution Cost Truth → **MESURER KRAKEN + OKX**.

Attendu :
- carte Kraken chiffrée ;
- carte OKX chiffrée ;
- transport OKX affiché ;
- export `STRATEGY_A_EXECUTION_COST_TRUTH_40_6_434.json`.

Si échec : capture/dump, pas de recherche, pas de console.

## Protections

Strategy A métier, seuils, Oracle, Risk, Paper, Market Core, Aether et CSS cockpit sont gelés.

Règle : **une intention → un propriétaire → une modification → une preuve → STOP**.
