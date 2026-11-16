# Seven Heaven Strategy Lab — V4.8 Gate 2 DEV

**Fondation produit : Source Catalog v1 + Strategy Atlas → Strategy Composer**  
**Moteur conservé : V4.7.0-RC1 · PAPER ONLY · zéro ordre réel**

## Ce que ce paquet ajoute

- `StrategySpec v1` : format Seven propriétaire, portable et lisible, avec empreinte SHA-256.
- `Source Catalog v1` : métadonnées normalisées (actif, paire, exchange, timeframe, couverture, intégrité, certification).
- `workspace/catalog_sources/` : namespace générique en lecture seule pour ajouter une source certifiée sans ajouter l'actif à une allowlist Python.
- `Strategy Atlas v1` : huit modèles actuellement exécutables par le moteur Seven (EMA, Donchian, Bollinger, DCA, Hold 50/100, Cash, règles personnalisées).
- Mode guidé : filtres Source Catalog, sélection d'une source, lecture d'un modèle Atlas et application au Strategy Composer.
- Création / rechargement / replay d'un StrategySpec via le moteur PAPER interne.

## Ce que ce paquet ne prétend pas faire

- Le collecteur public OKX existant reste limité aux paires et fenêtres historiques de V4.7. Cette Gate 2 découple **la consommation des sources** de cette allowlist ; elle ne remplace pas encore le collecteur.
- Grid, PMM/market making, SuperTrend, MACD et VWAP restent des familles de recherche/Atlas tant que leur modèle d'exécution n'est pas explicitement implémenté dans Seven.
- Freqtrade, Hummingbot et FreqAI restent facultatifs et ne sont pas requis.
- Aucun bot temps réel V5 n'est activé.
- Aucun connecteur d'ordre réel n'est présent.

## Contrat d'une source générique

Voir `docs/SOURCE_CATALOG_V1.md`.

## Vérifications exécutées dans l'environnement de développement

- Suite Python complète : **107/107 tests OK**.
- Test HTTP Gate 2 : health → Source Catalog → Strategy Atlas → création StrategySpec → replay PAPER : **OK**.
- Manifests du ZIP USB fourni : **18/18** sources OKX/Binance normalisées par Source Catalog v1.
- Preuve multi-actif : source synthétique certifiée **SOL/USDT 1h** chargée et routée sans modification d'allowlist d'actifs : **OK**.
- `node --check web/app.js` : **OK**.

### Recette navigateur

Non revendiquée dans cet environnement : Chromium est bloqué sur `localhost` par une politique administrateur (`ERR_BLOCKED_BY_ADMINISTRATOR`). La recette visuelle **Firefox Windows propriétaire reste donc à effectuer**.

## Installation prudente sur la clé USB

Ce ZIP de développement **ne contient aucun `workspace/`**. Avant essai :

1. conserver une sauvegarde indépendante de `E:\seven_heaven_strategy_lab\workspace\` ;
2. extraire le paquet dans un dossier de test séparé, ou superposer uniquement les fichiers programme après sauvegarde ;
3. pointer le nouveau programme vers le workspace existant ;
4. vérifier d'abord le panneau V4.8 Gate 2 dans Firefox ;
5. ne supprimer aucun ancien ZIP/release avant validation.
