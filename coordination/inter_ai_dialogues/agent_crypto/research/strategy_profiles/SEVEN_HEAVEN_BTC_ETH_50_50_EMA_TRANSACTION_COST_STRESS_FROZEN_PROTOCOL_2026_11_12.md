# Seven Heaven — Stress-test des coûts BTC/ETH EMA 10/30 : protocole figé

**Publication du protocole : 12 novembre 2026, avant calcul des nouveaux scénarios de coûts.**
Statut : recherche PAPER rétrospective, aucune exécution ni recommandation de marché.

## Question
L'avantage historique du portefeuille **BTC/ETH EMA10/30, deux poches initiales de 500 USD, sans rééquilibrage**, tient-il encore si les frais et le glissement par ordre augmentent ? Quelle majoration ferait disparaître cet avantage face au Buy & Hold 50/50, et à partir de quand la simulation EMA perd-elle son capital de départ ?

## Bases immuables, sans réoptimisation
- BTC/USD natif Bitstamp : `native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv`, SHA-256 `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb`.
- ETH/USD natif Bitstamp : `native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv`, SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- Historique journalier UTC complet **2023-04-01→2026-10-31** : **1 310 bougies** par actif, dont **275 jours de chauffe** EMA, puis **1 035 jours PAPER** du **2024-01-01 au 2026-10-31**.
- Comparateur fixe du Coffre : `native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_proofs.json` avec résultat EMA de base **+77,665245 %**, 122 opérations fictives, drawdown **−42,15057 %** ; double coûts **+62,238495 %**. Reproduire à tolérance d'arrondi **0,00001 point** avant toute affirmation nouvelle.

## Politique et coûts exactement inchangés
Signal de clôture UTC `EMA10(t)>EMA30(t) AND close(t)>EMA30(t)`. La position de la journée suivante t+1 est déterminée **seulement après la clôture t**, achat/vente fictifs à l'ouverture t+1. EMA démarrent à `close(2023-04-01)` ; aucune rotation, short, levier ou intérêt sur cash.

Deux poches initiales **500 USD par actif**, valorisation du portefeuille `(capital_BTC_1000+capital_ETH_1000)/2` à chaque date. Coûts par côté de l'ordre : frais d'achat `cash*(1-fee)` puis glissement `open*(1+slip)` ; vente `qty*open*(1-slip)*(1-fee)`. La valorisation des cryptos encore en portefeuille retire les frais et le glissement hypothétiques nécessaires à leur vente, exactement comme les études précédentes.

### Grille préétablie
Chaque facteur multiplie **les deux** composantes (frais et glissement), séparément :

| Facteur | Frais / côté | Glissement / côté | Somme indicative / côté |
|---|---:|---:|---:|
| 0 | 0,00 % | 0,00 % | 0,00 % |
| 1 (référence) | 0,10 % | 0,05 % | 0,15 % |
| 2 | 0,20 % | 0,10 % | 0,30 % |
| 3 | 0,30 % | 0,15 % | 0,45 % |
| 4 | 0,40 % | 0,20 % | 0,60 % |
| 6 | 0,60 % | 0,30 % | 0,90 % |
| 8 | 0,80 % | 0,40 % | 1,20 % |
| 10 | 1,00 % | 0,50 % | 1,50 % |

**Ce sont des hypothèses exploratoires**, non les frais réels d'un compte, ni le spread/impact historique par ordre. Les grilles de frais réelles varient selon statut, produits, région, volume et date ; la source de la documentation générale est https://www.bitstamp.net/fee-schedule et https://www.bitstamp.net/api/ . Les cours OHLC quotidiens **ne contiennent pas** les carnets au moment exact des ordres.

## Mesures figées
Pour chaque facteur 0,1,2,3,4,6,8,10 :
- Capital final et rendement **EMA50/50**, **Buy & Hold 50/50**, écart en points, drawdown maximal des deux courbes, nombre d'opérations et jours exposés ; tests d'intégrité calendriers et empreintes SHA.
- Tableau d'années **2024, 2025, 2026 janvier-octobre** pour la référence facteur 1, avec rendements annuels de portefeuille **continu et non réinitialisé**.
- Seuils descriptifs (non recommandés) via dichotomie **sur facteur entre 0 et 10** : (i) où `rendement EMA=0` (ii) où `rendement EMA=rendement Hold`. Ne rapporter un seuil que si un changement de signe est observé sur cette plage, à précision 0,001 facteur. Ne pas confondre seuil de coût total et tarif accessible.
- Vérifier **invariance stricte des 122 opérations et des journées exposées** quand seuls frais/glissements sont modifiés ; échec si paramètres du signal ou dates divergent.

## Interprétation
C'est une analyse **conditionnelle aux prix d'ouverture et clôture archivés**, pas une mesure de spread historique, de liquidité exécutable, de taxe, de prix réellement rempli ou de rentabilité future. Le modèle d'achat/vente ne tient pas compte du minimum par ordre, du carnet, de la latence ni des écarts devises USD/USDT. Ne pas conclure à la performance future d'un facteur « gagnant » ; aucune optimisation EMA.

## Livrables et arrêt
- Script Python reproductible **standard library, lecture seule**, preuves JSON + CSV des scénarios et rapport humain, GitHub Actions uniquement si nécessaire.
- Publier exclusivement dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`, inclure empreintes, contrôles et statut d'exécution réelle ; référencer dans la passation `SEVEN_HEAVEN_CRYPTO_STRATEGY_RESEARCH_HANDOFF_2026_11_11.md`.
- Aucun changement Administrator / Operator / Trader / Bridge, aucun ordre réel, aucune diffusion de secrets.
