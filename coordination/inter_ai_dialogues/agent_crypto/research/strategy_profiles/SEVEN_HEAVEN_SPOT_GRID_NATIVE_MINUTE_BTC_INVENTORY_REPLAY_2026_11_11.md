# Seven Heaven — Spot Grid sur 4 archives natives BTC/USDT a la minute

**Date : 11 novembre 2026.** Experience fictive sur bougies historiques 1 minute.

## Provenance et controles

- Quatre ZIP originaux de publications GitHub du Coffre, janvier 2024, janvier 2025, janvier 2026, octobre 2026.
- SHA-256 du ZIP verifie contre les empreintes des archives horaires canoniques, soit 44 640 minutes par mois.
- OHLCV, volume de cotation et nombre de transactions agreges heure par heure et compares aux archives horaires deja publiees.
- Timestamps normalises en millisecondes (microsecondes Binance a partir de 2025), aucune bougie synthetique.

## Hypotheses identiques, declarees avant le test

- Chaque mois est une experience separee avec capital fictif initial de 1 000 USDT.
- Prix initial de grille : premier open du mois. Bande fixe +/-10 %, dix intervalles arithmetiques (ecart de 2 % du prix initial).
- Cinq lots de 100 USDT de BTC achetes initialement et cinq lots de 100 USDT de liquidites pour niveaux inferieurs.
- Chaque lot alterne entre un achat a son niveau bas et une vente au niveau haut adjacent; les profits et pertes restent dans le lot.
- Cout de chaque achat/vente : frais 0,10 % et glissement 0,05 %; tous les portefeuilles sont valorises en valeur nette liquidable a chaque cloture quotidienne.
- Mode TOUCH : si le high/low minute atteint la limite, remplissage fictif suppose. Ce n'est PAS un remplissage observe.
- Mode CLOSE : remplir fictivement seulement si une cloture minute depasse le niveau; ce n'est PAS une garantie de remplissage.
- Au plus une transaction par lot et par minute : le passage inverse dans la meme minute est interdit car sa chronologie est inconnue.
- Les seuils atteints sont distincts d'ordres et de fills reels; carnet, files d'attente et spread manquent. Aucun mode n'est une borne certaine.

## Comparaison : valorisation totale (realise + non realise + frais) 

| Mois | Cloture sous bande (% minutes) | Bougies 1m multi-paliers | 1h multi-paliers | Grille TOUCH | Grille CLOSE | Conserver 50 % BTC | Conserver 100 % BTC |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2024-01 | 0.0% | 4/44640 | 10/744 | +5.69% | +4.28% | +0.20% | +0.40% |
| 2025-01 | 0.0% | 0/44640 | 6/744 | +5.63% | +5.63% | +4.57% | +9.13% |
| 2026-01 | 0.791% | 0/44640 | 4/744 | -5.58% | -5.72% | -5.22% | -10.43% |
| 2026-10 | 0.0% | 0/44640 | 2/744 | -3.29% | -3.46% | -3.75% | -7.50% |

## Transparence sur les chiffres

Ce sont deux scenarios de remplissage THEORIQUES. Ni le mode TOUCH ni le mode CLOSE ne certifient un ordre execute par OKX ou Binance.
Il n'est pas legitime d'interpreter la difference entre les deux comme intervalle statistique de profits,
ni comme une borne inferieure/superieure stricte du P&L possible; la queue des ordres et les gaps peuvent changer les signes.

Le capital initial est repar­ti entre plusieurs lots; les BTC en fin de mois sont comptes au prix de cloture,
apres estimation des couts de liquidation. Les gains clotures sont distingues des positions encore ouvertes.

## Amelioration par rapport au controle horaire

La minute reduit les cas ou plusieurs niveaux sont traverses dans une meme bougie, mais n'indique toujours pas
l'ordre exact des hauts et des bas a l'interieur de la minute. Les ordres limites ne sont pas des garanties de fill.
La source publiee est Binance Spot BTC/USDT et non OKX BTC/USDC.

## Suite technique

1. Si necessaire, etendre a des mois contigus sans modifier les bornes apres observation (ou dater chaque reset).
2. Verifier un moteur de remplissage pessimiste sur carnets synchronises ou transactions reelles, avec latence et prix limites.
3. Documenter les minima OKX et frais maker/taker avant toute interpretation d'executabilite de ces montants.

## Reproduction dans le Coffre

- Code : SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11.py
- Donnees JSON : SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11.json
- Les ZIP restent les sources IMMUTABLES des Releases; ils ne sont pas dupliques en Git.
