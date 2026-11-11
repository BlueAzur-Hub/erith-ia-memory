# SEVEN HEAVEN — Donchian 55 : protection du capital par allocation

**Date du calcul : 11 novembre 2026**  
**Période source : 1er janvier 2019 – 30 septembre 2026 (2026 partiel)**  
**Statut : reconstruction analytique par année, lecture seule, sans ordres réels.**

## 1. Données et règles inchangées

- [Archive vérifiée des 12 stratégies et 2 témoins](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json) : méthode `DON55`.
- Série d'origine : Binance Spot BTC/USDT, bougies journalières ; 2 830 jours étudiés, 3 075 jours source.
- Donchian : clôture au-dessus du plus haut des 55 jours précédents ; sortie sous le plus bas des 20 jours précédents ; stop ATR14 × 3, période maximale 120 jours.
- Simulation source : achat/vente fictifs, signal à la clôture, exécution à l'ouverture suivante ; 0,10 % de frais et 0,05 % de glissement par côté, sans levier.
- Rendement historique net source : +387,115 % ; maximum drawdown journalier estimé source : −33,530 % ; 29 opérations (16 gagnantes, 13 perdantes) ; temps exposé au BTC : 29,19 %.
- Capital initial fictif : 1 000 USDT ; les pourcentages d'allocation représentent la fraction **allouée à la stratégie**, et non le pourcentage de jours effectivement exposés au Bitcoin.

## 2. Méthode de ce calcul (et limite)

Au début de chaque année civile, le portefeuille est **rééquilibré théoriquement** entre une poche `DON55` et des liquidités qui ne rapportent rien. À la fin de l'année, on applique le rendement net annuel source à la seule poche DON55.

`Capital_fin_année = Capital_début_année × [1 + (allocation × rendement_annuel_source / 100)]`

Les rendements annuels source sont arrondis à 0,001 point. Le modèle ne facture aucun coût additionnel pour les rééquilibrages annuels : c'est optimiste. Les frais et glissements de la stratégie source sont déjà pris en compte, mais les rééquilibrages n'ont PAS été rejoués opération par opération.

**Ce n'est pas un vrai backtest à exposition constante par opération.** Il permet une comparaison contrôlée à fréquence annuelle, mais ne permet pas de calculer le drawdown intrajournalier exact des portefeuilles à 50 % et 25 %, leurs risques de gap, les prix réels d'exécution ou les effets d'un rééquilibrage quotidien. Les mesures de drawdown à fin d'année ci-dessous sont des **bornes inférieures en amplitude** du drawdown maximal réel simulé à fréquence quotidienne.

## 3. Résultat annuel des trois allocations

| Période | Rendement DON55 source | Capital 100 % | Capital 50 % | Capital 25 % |
|---|---:|---:|---:|---:|
| Départ | — | 1 000,00 | 1 000,00 | 1 000,00 |
| 2019 | +67.413 % | 1 674,13 | 1 337,07 | 1 168,53 |
| 2020 | +56.394 % | 2 618,24 | 1 714,08 | 1 333,28 |
| 2021 | +19.757 % | 3 135,52 | 1 883,40 | 1 399,13 |
| 2022 | -10.695 % | 2 800,18 | 1 782,69 | 1 361,72 |
| 2023 | +27.382 % | 3 566,93 | 2 026,76 | 1 454,94 |
| 2024 | +48.174 % | 5 285,26 | 2 514,94 | 1 630,17 |
| 2025 | -4.033 % | 5 072,10 | 2 464,23 | 1 613,73 |
| 2026 (janv.–sept.) | -3.962 % | 4 871,14 | 2 415,41 | 1 597,74 |

## 4. Synthèse

| Allocation annuelle | Capital final | Gain total fictif | Pire baisse **constatée aux fins d'année** |
|---|---:|---:|---:|
| 100 % | 4 871,14 USDT | +387.11 % | -10.70 % |
| 50 % | 2 415,41 USDT | +141.54 % | -5.35 % |
| 25 % | 1 597,74 USDT | +59.77 % | -2.67 % |

Les baisses mesurées aux fins d'année ne remplacent pas le drawdown **quotidien** source de −33,53 % pour l'allocation 100 %. Ne pas assimiler une perte de fin d'année de −10,70 % en 2022 à la pire baisse survenue pendant cette année.

Sur l'année 2022 seulement, le rendement DON55 source était −10,695 %, soit environ −10,70 % / −5,35 % / −2,67 % selon l'allocation annuelle ; le témoin Buy & Hold à 100 % affichait −64,207 % la même année.

## 5. Sensibilité : ne PAS rééquilibrer après le départ

Une question distincte consiste à immobiliser dès le début une poche fixe de 100 %, 50 % ou 25 % pour la même stratégie et à laisser le reste en liquidités pendant toute la période, sans jamais déplacer de capital entre les deux poches. L'exposition relative peut alors dériver fortement avec les années : ce n'est pas une exposition de 50 % / 25 % constamment maintenue.

| Poche initiale Donchian | Capital final, sans rééquilibrage |
|---|---:|
| 100 % | 4 871,15 USDT |
| 50 % | 2 935,57 USDT |
| 25 % | 1 967,79 USDT |

La différence avec le tableau principal montre que **le calendrier des rééquilibrages fait partie de la stratégie**. On ne peut pas présenter ces scénarios comme interchangeables.

## 6. Conclusions et limites

- Cette comparaison établit mathématiquement la conséquence de réduire l'allocation **sur les rendements annuels historiques déjà calculés** : volatilité et pertes annuelles amorties, mais gains également réduits.
- Elle ne prouve PAS qu'une allocation de 25 % assure une protection sûre en cas de liquidation, décrochage brusque, panne de plateforme ou faillite d'une stablecoin.
- Le prix, la liquidité, les frais réels, les gaps et la tenue d'un stop ne sont pas certifiés par des bougies journalières.
- Cette étude est rétrospective et ne valide pas prospectivement DON55.
- Pour comparer **précisément** la taille de position à chaque entrée, le prochain calcul exige le fichier OHLC quotidien source, afin de rejouer les 29 opérations avec un capital disponible différent à chaque achat, et calculer le drawdown quotidien de chaque portefeuille.
- Aucun changement de paramètre, aucun ordre, aucun accès à un compte, aucune modification du Trader, de l'Administrator ou du Bridge.

## 7. Source canonique et contrôle

- Résultats vérifiés : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json
- Algorithme de référence : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py
- Jeu de bougies déclaré : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz` (Binance BTC/USDT, archive SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`).
- Contrôle de cohérence : la composition de huit rendements annuels source reproduit +387,115 % à quelques millièmes près (arrondi), cohérent avec le rapport vérifié.

**Arrêt :** résultat limité à la reconstruction annuelle et à la sensibilité statique, sans substituer un calcul annuel à un backtest de 29 transactions.