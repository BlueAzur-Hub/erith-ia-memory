# Seven Heaven — Étude de l'impact de taille sur les carnets ZEC/USDC et HYPE/USDC

**Date de l'étude : 9 novembre 2026. Données utilisées : carnets Spot publics OKX des 24–28 octobre 2026. Étude contrefactuelle, zéro ordre réel et zéro transaction PAPER exécutée.**

Suite du [rapport comparatif ZEC / HYPE](./SEVEN_HEAVEN_AGENT_CRYPTO_ZEC_HYPE_SPOT_BOOK_COMPARATIVE_RESEARCH_2026_11_09.md), fondée sur les [58 couples archivés](../data/crypto/research/seven_heaven_zec_hype_paired_spot_book_evidence_2026_11_09.json). Le [registre calculé des 348 scénarios](../data/crypto/research/seven_heaven_zec_hype_spot_book5_buy_size_impact_2026_11_09.json) comprend le résultat de chaque observation, la date UTC et la référence exacte de la source.

## 1. Périmètre et preuves

- **12 fichiers sources historiques**, sept jours ZEC et cinq jours HYPE, empreintes Git contrôlées une par une contre le registre d'origine.
- **85 carnets ZEC** et **59 carnets HYPE** chargés. **58 couples** du 24–28 octobre appariés à cinq minutes au plus ; les 58 couples ont été récupérés par horodatage de carnet exact.
- **348 scénarios** = 58 couples × 2 paires × 3 budgets (100, 500 et 1 000 USDC). Toutes les paires sont des carnets **Spot à cinq niveaux** et non des carnets en temps réel.
- Aucun prix actuel, statut de compte EEE, frais réels, règle d'instrument ou priorité de file d'ordres n'est inféré des archives.

## 2. Calculs — achat hypothétique sur les cinq meilleurs vendeurs

Le budget **hors frais** est consommé niveau par niveau du meilleur `ask` vers les suivants. À chaque niveau : `quote_i = min(quote_restant, prix_i × quantité_i)` et `base_i = quote_i / prix_i`. Le prix moyen théorique est `VWAP = somme(quote_i) / somme(base_i)`. L'impact supplémentaire par rapport au meilleur vendeur initial est `(VWAP / best_ask − 1) × 10 000` en points de base.

Un carnet est dit « couvrant » uniquement si ses cinq niveaux suffisent au budget ; sinon la quantité partielle et le reliquat sont consignés, mais **aucun prix moyen d'achat complet ni impact complet n'est annoncé**. Les statistiques de VWAP et de coût excluent ces cas incomplets.

Une hypothèse distincte de frais taker **0,10 % pour l'achat seulement**, payés **en plus** du budget de cotation, est présentée à titre pédagogique. Le coût supplémentaire contre le meilleur vendeur, à quantité de base identique, est `budget − best_ask × base_obtenue`; les frais fictifs s'y ajoutent. Il ne s'agit pas d'un aller-retour, les frais réels du compte étant inconnus.

## 3. Nombre d'achats entièrement couverts par cinq niveaux

| Budget | ZEC/USDC | HYPE/USDC |
|---|---:|---:|
| 100 USDC | 58/58 | 58/58 |
| 500 USDC | 57/58 | 56/58 |
| 1 000 USDC | 54/58 | 55/58 |

À 1 000 USDC, les cinq vendeurs archivés ne suffisent pas dans **4/58** observations ZEC et **3/58** HYPE. Les fonds disponibles sur un carnet ancien ne sont pas des exécutions prouvées.

## 4. Prix moyen et frais hypothétiques — cas couverts

| Budget | ZEC impact médian au-delà du meilleur ask | HYPE impact médian | ZEC coût médian impact + frais | HYPE coût médian impact + frais |
|---|---:|---:|---:|---:|
| 100 USDC | 0,0000 pb | 0,0000 pb | 0,1000 USDC | 0,1000 USDC |
| 500 USDC | 0,0422 pb | 0,0000 pb | 0,5021 USDC | 0,5000 USDC |
| 1 000 USDC | 0,1920 pb | 0,1964 pb | 1,0192 USDC | 1,0196 USDC |

**Attention :** la médiane à 500 et 1 000 USDC est calculée sur les seuls carnets couvrant le budget, avec des effectifs légèrement différents selon l'actif. Ce tableau **n'inclut pas le demi-spread payé à partir du mid**, puisqu'il mesure l'effet d'une marche dans le carnet *au-delà* du meilleur `ask` et ajoute seulement les frais fictifs d'achat.

| Budget | ZEC impact au 95e percentile (cas couverts) | HYPE impact au 95e percentile (cas couverts) |
|---|---:|---:|
| 100 USDC | 0,187 pb | 0,904 pb |
| 500 USDC | 1,099 pb | 1,140 pb |
| 1 000 USDC | 1,832 pb | 2,798 pb |

## 5. Comparaison heure par heure — uniquement quand les deux carnets couvrent le budget

| Budget | Heures comparables | ZEC impact inférieur | HYPE impact inférieur | Égalité à 0,000001 pb près |
|---|---:|---:|---:|---:|
| 100 USDC | 58 | 7 | 5 | 46 |
| 500 USDC | 55 | 19 | 24 | 12 |
| 1 000 USDC | 52 | 30 | 21 | 1 |

À 1 000 USDC, parmi **52** couples où les deux carnets couvrent le budget, ZEC a le plus faible impact dans **30** cas et HYPE dans **21** cas. Cela ne remet pas en cause le résultat précédent sur les spreads : un spread serré ne garantit pas la meilleure profondeur ni le prix moyen le plus favorable pour une taille donnée.

## 6. Limites et décision

1. **Archive d'octobre** et heures irrégulières, pas un relevé actuel du marché au 9 novembre.
2. Simulateur statique : les quantités affichées peuvent disparaître ; pas de délai, queue, ordre transmis, rejet, slippage temporel ou coût d'opportunité modélisé.
3. Les minimums `minSz`, `lotSz`, `tickSz`, l'éligibilité EEE et les frais réels du profil OKX ne sont pas revalidés : **aucune certification PAPER**.
4. Le budget représente des **USDC**, sans conversion implicite en USD ou USDT. Un prix initial absolu ZEC ne se compare pas au prix initial HYPE ; seuls les impacts normalisés le sont.
5. La couverture du budget par cinq niveaux est une **condition mathématique descriptive**, pas une garantie d'exécution.

**Conclusion :** l'étude de taille est achevée dans son périmètre documentaire. Pour une qualification PAPER future, il faut un carnet et des règles Spot datés et récents, un contrôle d'éligibilité du profil, des coûts de compte authentiques et un journal reproductible. **Administrator, Trader, MASTER et Bridge R31 restent inchangés.**
