# Seven Heaven — Replay Spot Grid trimestriel continu, 2024 et 2025

## Méthode et preuve

- Six ZIP originaux Binance Spot BTC/USDT à la minute fournis par l’utilisateur.
- SHA-256 vérifiés contre le registre canonique du Coffre (détails JSON).
- Janvier–mars 2024 : 91 jours ; janvier–mars 2025 : 90 jours ; 260 640 bougies, sans lacune ni doublon.
- Deux expériences indépendantes de 1 000 USDT chacune ; **aucune remise à zéro interne en février ou mars**.
- Dix intervalles arithmétiques, 50 % BTC initial / 50 % cash. Grilles fixes ±5/10/20/30 % ; variante de recentrage mensuel explicitement distincte.
- Coût par côté : 0,10 % frais + 0,05 % glissement ; stress : coût doublé.
- TOUCH = extrêmes haut/bas ; CLOSE = clôture franchissant niveau. Chaque modèle suppose des remplissages fictifs au niveau de grille (pas une preuve exécutable).
- Valorisation à la clôture quotidienne après coûts estimés de vente des BTC ; drawdown calculé sur la série quotidienne.

## Résultats — grille fixe (TOUCH, coûts normaux)

| Configuration | 2024 T1 | 2025 T1 | Drawdown 2024 | Drawdown 2025 |
|---|---:|---:|---:|---:|
| ±5% | +6.81% | -2.87% | -5.47% | -14.05% |
| ±10% | +8.75% | -0.61% | -5.58% | -12.38% |
| ±20% | +9.35% | +1.21% | -6.72% | -10.20% |
| ±30% | +11.89% | -0.19% | -6.84% | -10.62% |
| Buy & Hold 50% BTC | +34.04% | -6.02% | -9.64% | -13.77% |
| Buy & Hold 100% BTC | +68.07% | -12.05% | -15.72% | -25.95% |

## Grille mensuellement re-centrée (TOUCH, coûts normaux)

| Grille | 2024 T1 | 2025 T1 |
|---|---:|---:|
| ±5% | +12.20% | -5.37% |
| ±10% | +17.99% | -2.49% |
| ±20% | +21.19% | -2.18% |
| ±30% | +23.75% | -4.26% |

## Contrôles et limites

La grille fixe est paramétrée une seule fois à l’ouverture de janvier. Le recentrage mensuel n’apporte pas de capital supplémentaire, mais vend/rachète l’inventaire à coût fictif.
TOUCH et CLOSE sont deux **hypothèses de remplissage non vérifiées**. Une limite touchée ou dépassée ne garantit pas un ordre rempli ; les gaps rendent les résultats potentiellement trop optimistes.
Aucun carnet, ordre réel, spread exact, contrainte de taille, impôt ni changement de frais OKX n’est testé. Une simulation rétrospective, même hors période de sélection, ne certifie pas des gains futurs.

Documents : JSON preuves, CSV capital quotidien et script Python. Aucun changement de l’Administrator, Trader ou Bridge.

## Sensibilité aux coûts (TOUCH, frais et glissement doublés)

| Grille fixe | 2024 T1 : coûts standard → ×2 | 2025 T1 : coûts standard → ×2 |
|---|---:|---:|
| ±5% | +6.81% → +4.22% | -2.87% → -6.63% |
| ±10% | +8.75% → +7.45% | -0.61% → -2.47% |
| ±20% | +9.35% → +8.87% | +1.21% → +0.25% |
| ±30% | +11.89% → +11.53% | -0.19% → -0.75% |

## Lecture des inventaires et des cycles (grille fixe ±20% ; TOUCH)

| Mesure | 2024 T1 | 2025 T1 |
|---|---:|---:|
| Cycles achevés | +14.000 | +23.000 |
| Profit des cycles fermés | +93.505 USDT | +117.673 USDT |
| P&L de l’inventaire encore détenu | +0.000 USDT | -105.582 USDT |
| Liquidités finales | +1093.505 USDT | +209.094 USDT |
| Baisse maximale quotidienne | -6.716 % | -10.197 % |

**Contrôle de non-régression :** les 32 variantes de janvier 2024 et janvier 2025 (4 largeurs × TOUCH/CLOSE × coûts standard/doublés × 2 années) ont été comparées aux résultats archivés de la première étude : 32 reproductions concordantes.

**Interprétation :** en 2024, la forte hausse BTC favorise nettement le Buy & Hold, alors que les grilles prennent leurs bénéfices et peuvent terminer en liquidités. En 2025, les cycles de grille amortissent en partie la baisse, mais les inventaires ouverts peuvent encore peser lourd.

**Limite supplémentaire :** les quatre largeurs ont été sélectionnées à la lumière d’études antérieures. Les comparer à 2024–2025 reste une vérification historique rétrospective, pas un essai prospectif. Un résultat de +1,21 % peut disparaître dès que les hypothèses d’exécution ou de frais changent.
