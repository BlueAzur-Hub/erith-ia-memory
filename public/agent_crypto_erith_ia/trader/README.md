# ERITH.IA Trading Desk — 40.6.588

## Objet
Rendre le **Market Trader fidèle au Market Administrator** en restaurant la catégorie native **Nouveaux listings**.

## Transposition
- bouton **Nouveaux listings** ajouté à la même barre de filtres Market ;
- propriétaire public existant réutilisé : `administrator/js/new-listings-live-asset-406529.js` ;
- découverte Bitget SPOT ≤ 30 jours ;
- identités/logos GitHub existants réutilisés via `administrator/data/new-listings-identities.json` ;
- résultats injectés dans **le tableau Market existant**, sans second Market ;
- aucune injection dans le Market Core / ranking ;
- sélection d’un nouveau listing réutilise le Graphique/Bougies et Profondeur existants via le contexte externe public ;
- Fiche Crypto 40.6.587 continue d’utiliser sa surface Flottante / Latérale native.

## Protections
Market Core 38.15.11 inchangé. Pas de second Graphique, pas de seconde Fiche, pas de seconde Profondeur. READ ONLY, aucun ordre réel.

## Terrain
Firefox : **PENDING CHRISTOPHE**.

Après validation : passage séparé sur **BUY / SELL / REDIVIDER**.

## Livraison 40.6.588
- PR #153 fusionnée.
- Merge commit : `7d6afedd2303a5dc6f244a5ff2761eea282f1f91`.
- GitHub Pages : run `37460915497`.
- ZIP : `downloads/AGENT_CRYPTO_TRADER_40.6.588_MARKET_FIDELITY.zip`.
- Terrain Firefox : **PENDING CHRISTOPHE**.
