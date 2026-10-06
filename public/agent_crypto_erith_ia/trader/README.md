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
