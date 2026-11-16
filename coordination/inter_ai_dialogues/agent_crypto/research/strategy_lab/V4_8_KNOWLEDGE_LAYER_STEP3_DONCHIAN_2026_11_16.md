# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Step 3 Donchian — 2026-11-16

## Objet

Troisième fiche professionnelle de la Knowledge Layer après EMA et Bandes de Bollinger.

## Fiche professionnelle Donchian

La fiche explique :

- ce qu'est un canal de Donchian ;
- canal haut = plus haut des N bougies précédentes ;
- canal bas = plus bas des N bougies précédentes ;
- lecture d'une cassure confirmée versus faux breakout ;
- pourquoi la règle Seven attend une clôture terminée ;
- signification de l'asymétrie 55/20 ;
- impact du timeframe sur les fenêtres réelles ;
- forces, limites, frais et séries de faux départs ;
- règles exactes du moteur PAPER Seven ;
- critères d'analyse après backtest ;
- références externes + preuves locales Seven.

## Preuves locales intégrées dans la fiche

La fiche ne présente pas Donchian comme une recette universelle. Elle reprend les études déjà archivées dans le Coffre partagé :

- BTC 2019–2021 : 3 blocs positifs sur 5 ;
- panel BTC/ETH/BNB/XRP/SOL 2024–2025 : 7 fenêtres annuelles positives sur 10 ;
- panel BTC/ETH/BNB/XRP/SOL janvier→octobre 2026 : 0 fenêtre positive sur 5 ;
- étude trade-level 2024–2025 : 136 round-trips, 54 gagnants et 82 perdants.

Lecture Seven : les bonnes fenêtres dépendent de quelques tendances longues ; la stratégie reste fortement dépendante du régime et n'est pas présentée comme robuste universellement.

Ces chiffres sont des observations historiques, pas des probabilités futures. Les échecs restent visibles.

## Contrat moteur Seven

Le moteur n'a pas été modifié.

SHA-256 `src/engine.py` :
`f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

Règle native :

- entrée : dernière clôture > plus haut des 55 bougies précédentes ;
- sortie : dernière clôture < plus bas des 20 bougies précédentes ;
- la bougie signal est exclue du canal causal ;
- fill PAPER à l'ouverture de la bougie suivante ;
- spot long-only, zéro levier, zéro short, zéro ordre réel.

## Validation

- 127 tests : OK ;
- `node --check web/app.js` : OK ;
- Knowledge Layer : EMA + Bollinger + Donchian ;
- ZIP réextrait et retesté : 127 tests OK ;
- aucun `workspace/`, `coordination/`, `__pycache__/` ou `.pyc` dans le paquet distribué.

## Paquet de test du fil

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_DEV.zip`

SHA-256 :
`50c0e5f21775c51f901fe97c1b519c2923d0113c876367e2a9f6a1359176639c`

## Sources documentaires externes

- TradingView Help Center — Donchian Channels (DC)
- Investopedia — Donchian Channels: Formula, Calculations, and Uses

## Sources internes Seven Heaven déjà présentes dans ce répertoire

- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_2019_2021_SEGMENTED_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_BNB_XRP_SOL_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_ETHUSDT_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_MULTI_ASSET_2026_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_MECHANISM_REGIME_RESULTS_2026_11_16.md`
- `SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_EQUAL_SLEEVE_MULTI_ASSET_PORTFOLIO_2026_RESULTS_2026_11_16.md`

## Continuité

Étape suivante seulement après contrôle Firefox propriétaire : conserver la profondeur Knowledge Layer et poursuivre stratégie par stratégie, sans modifier le moteur PAPER de référence.
