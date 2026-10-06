# ERITH.IA Trading Desk — 40.6.587

## Objet
Restaurer la **Fiche Crypto native** au lieu de la carte Trader figée.

## Contrat restauré
Lignée Administrator :
- 28.3.46 — Flottante / Latérale ;
- 28.3.47 — disponibilité latérale adaptative ;
- 28.3.48 — persistance + sticky + scroll interne ;
- 40.1.2 — géométrie CSS du dock ;
- 40.6.547 — interaction pointeur restaurée.

## Correction
- suppression de `#traderMarketFiche` et de son CSS propriétaire ;
- utilisation de `#atlasHelpLayer` pour la fiche flottante ;
- utilisation de `#atlasMarketCardDockHost` pour la fiche latérale ;
- mode Flottante / Latérale mémorisé via la clé historique ;
- la fiche flottante suit la ligne Market survolée/focalisée au lieu d'être clouée au tableau ;
- `Escape` masque la fiche flottante ;
- le bouton Fiche active/désactive ce propriétaire natif ;
- les lignes Market exposent `data-market-help-id`.

## Inchangé
Market Core 38.15.11, Bougies, Profondeur, Lecture Technique 40.6.586, Math Core, READ ONLY.

Firefox : **PENDING CHRISTOPHE**.
