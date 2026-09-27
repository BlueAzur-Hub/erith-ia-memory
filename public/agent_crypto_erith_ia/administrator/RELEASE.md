# Agent-Crypto — 40.6.432 · STRATEGY A EXECUTION COST TRUTH

Parent : **40.6.431**.  
Market Core : **38.15.11**.

## Objet unique

Mesurer, sans ordre réel, les conditions d'exécution BTC/EUR sur **Kraken Pro** et **OKX Europe** afin de remplacer progressivement le coût pédagogique 0,60 % par une vérité économique vérifiable.

Nouveau propriétaire canonique :

js/strategy-a-execution-cost-truth.js

## Ce que mesure le panneau

Au clic sur **MESURER KRAKEN + OKX** :

- frais Maker / Taker de référence, sourcés et datés ;
- meilleur prix acheteur / vendeur ;
- spread réel du carnet public ;
- profondeur proche du prix à ±5, ±10 et ±25 points de base ;
- glissement simulé pour 10 €, 25 €, 50 € et 100 € ;
- coût estimé Market → Market, carnet + frais Taker de référence ;
- planchers de frais Post-only → Post-only et Post-only → Market.

## Références de frais

**Kraken Pro — niveau Spot 1 de référence :** Maker 0,40 %, Taker 0,80 %.  
Source : https://www.kraken.com/fr/features/fee-schedule

**OKX Europe — compte EEE Spot-only Regular, effet 25/09/2026 :** Maker 0,10 %, Taker 0,20 %.  
Source : https://www.okx.com/fr-fr/help/important-notice-upcoming-spot-fee-adjustment-eea

Ces taux sont des références : le taux réellement appliqué dépend du compte, du volume, des actifs et du type de compte.

## Réseau

La version n'ajoute **aucun flux permanent**.

Le clic opérateur lance uniquement deux lectures publiques de carnet :

- Kraken : BTC/EUR Depth ;
- OKX Europe : BTC-EUR Market Books.

Aucun compte, aucune clé API, aucun wallet et aucun ordre ne sont utilisés.

## Protections

- Cost Gate 0,80 % inchangé ;
- coût pédagogique 0,60 % inchangé dans le moteur existant ;
- Oracle et bullAmplitude inchangés ;
- Risk Governor inchangé ;
- Paper inchangé ;
- Market Core 38.15.11 inchangé ;
- Aether inchangé ;
- CSS cockpit inchangé ;
- aucun WebSocket ;
- aucun timer récurrent ;
- aucun stockage ;
- aucun choix automatique Kraken / OKX ;
- aucun ordre réel.

## Test terrain

1. Ctrl+F5.
2. Vérifier **Build 40.6.432**.
3. Ouvrir **Simulation / Strategy A**.
4. Repérer **STRATEGY A · EXECUTION COST TRUTH · 40.6.432** sous le panneau violet de calibration.
5. Cliquer **MESURER KRAKEN + OKX**.
6. Les deux cartes doivent afficher des chiffres, ou une erreur explicite si une plateforme bloque la requête.
7. Cliquer **EXPORTER** et transmettre le JSON.

Aucune console n'est nécessaire pour ce test.

Terrain : **PENDING FIREFOX**.
