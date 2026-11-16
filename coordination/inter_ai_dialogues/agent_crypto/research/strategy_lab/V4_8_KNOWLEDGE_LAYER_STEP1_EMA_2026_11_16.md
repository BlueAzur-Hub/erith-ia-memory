# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Step 1 EMA — 2026-11-16

## Objet

Première fiche professionnelle de la Knowledge Layer : EMA / Moyenne Mobile Exponentielle.

## Contenu

- définition et différence EMA/SMA ;
- formule `alpha = 2 / (N + 1)` ;
- lecture graphique et croisements ;
- impact du timeframe ;
- forces, limites et faux croisements ;
- règles exactes du moteur PAPER Seven ;
- lecture du résultat après backtest ;
- références documentaires TradingView/Fidelity + vérité locale `src/engine.py` ;
- actions : graphique, Atelier, comparaison, résultats.

## Contrat moteur

`src/engine.py` inchangé.

SHA-256 moteur : `f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

## Validation

- 118 tests : OK ;
- `node --check web/app.js` : OK ;
- recette visuelle propriétaire : Firefox Windows.

## Paquet de test du fil

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_EMA_KNOWLEDGE_LAYER_DEV.zip`

SHA-256 : `33cfaa5c0e4ee90f7799c963de6b9c655678bc9dffd34cd33625dd17eaf1ba7e`

## Retour propriétaire

La profondeur EMA est validée comme nouvelle référence qualitative, mais la version présente encore des incohérences visuelles : boutons d'historiques coupés, densité/tailles de texte hétérogènes et besoin d'étendre la Knowledge Layer aux autres stratégies.
