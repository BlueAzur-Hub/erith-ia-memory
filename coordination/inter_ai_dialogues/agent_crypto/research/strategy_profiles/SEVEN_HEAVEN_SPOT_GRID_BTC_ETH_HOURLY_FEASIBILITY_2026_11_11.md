# Seven Heaven - Spot Grid : faisabilite historique avec les archives BTC et ETH

11 novembre 2026. Ce rapport NE constitue PAS un backtest du profit d'un bot de grille.

## Principe

Une grille Spot vise a acheter sous le cours courant et revendre aux niveaux superieurs dans une fourchette fixe.
Le resultat total d'un bot inclut aussi la valeur des BTC encore detenus, le capital immobilise et les frais.
Source OKX Europe : https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it

## Preuves de donnees

- Les six archives Binance BTC/USDT et ETH/USDT sont controlees SHA-256 par le lecteur du Coffre.
- 24 840 bougies horaires continues par actif, du 1er janvier 2024 au 31 octobre 2026.
- Trois etudes independantes : 2024, 2025, janvier-octobre 2026.
- Bornes fixees au prix d'ouverture du premier jour de chaque periode : +/-5 %, +/-10 %, +/-20 %.
- Pour chaque bande, 5, 10 ou 20 intervalles arithmetiques : 54 scenarios declares avant calcul.
- Un niveau entre le plus haut et le plus bas d'une bougie est seulement un seuil potentiellement touche.
- Plusieurs niveaux dans la meme bougie = chronologie inconnue; on NE fabrique pas l'ordre favorable des passages.
- Frais 0,10 % de chaque cote et glissement 0,05 % de chaque cote : calcul conditionnel d'un seul lot seulement.

## Cas pedagogique +/-10 % et 10 intervalles

| Marche | Annee | Prix initial | Bande basse | Bande haute | Heures dedans | Heures dessous | Heures avec plusieurs niveaux | Plus longue serie sous bande |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BITCOIN | 2024 | 42,283.58 | 38,055.22 | 46,511.94 | 10.33 % | 0.0 % | 10/8784 | 0 h |
| BITCOIN | 2025 | 93,576.00 | 84,218.40 | 102,933.60 | 40.51 % | 7.51 % | 31/8760 | 187 h |
| BITCOIN | 2026 | 87,648.21 | 78,883.39 | 96,413.03 | 30.4 % | 69.28 % | 7/7296 | 2330 h |
| ETHEREUM | 2024 | 2,281.87 | 2,053.68 | 2,510.06 | 20.95 % | 0.0 % | 55/8784 | 0 h |
| ETHEREUM | 2025 | 3,337.78 | 3,004.00 | 3,671.56 | 21.46 % | 51.16 % | 58/8760 | 3804 h |
| ETHEREUM | 2026 | 2,971.65 | 2,674.49 | 3,268.82 | 12.76 % | 85.5 % | 7/7296 | 5584 h |

## Espacement et couts d'un seul lot fictif

| Bande | Intervalles | Distance initiale entre paliers | Lot ACHETE puis VENDU sur paliers adjacents, frais inclus |
|---|---:|---:|---:|
| +/-5% | 20 | 0.50% | +0.18% a +0.23% |
| +/-10% | 10 | 2.00% | +1.55% a +1.92% |
| +/-20% | 5 | 8.00% | +6.82% a +9.67% |

Ces valeurs par lot supposent deux executions effectives a des prix adjacents.
Elles ne constituent PAS un profit de la grille ni une estimation du resultat global.

## Pourquoi ne pas afficher de profit global

Une bougie horaire donne ouverture, haut, bas, cloture et volumes, sans l'ordre exact des passages.
Des ordres limites peuvent ne pas etre executes bien que le seuil apparaisse dans la plage haut/bas.
Le moteur exact des ordres et l'inventaire des BTC doivent etre connus pour calculer le P&L total.
Une simulation qui presume toujours des achats puis des ventes favorables serait injustifiee.

## Prochaine validation utile

- Retrouver les archives natives une minute referencees par l'index et verifier leur integrite.
- Rejouer la chronologie minute sans considerer un prix touche comme un remplissage certain.
- Simuler l'inventaire complet, les frais maker et taker, les ordres manques, les limites OKX.
- Produire des bornes prudentes de resultat, comparer avec Buy & Hold aux memes dates.
- Obtenir des donnees de transactions/carnet si une precision d'execution est necessaire.

## Frontieres

Etude Binance BTC/USDT et ETH/USDT, pas OKX BTC/USDC 15 min.
Aucune optimisation de bornes a posteriori. Les niveaux fictifs ne sont pas des recommandations.
Pas de modification des cinq profils graphiques de l'Administrator.

Code : SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.py
Preuves et 54 configurations : SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.json
