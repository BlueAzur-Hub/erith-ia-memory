# Seven Heaven — BTC/ETH 50/50 EMA10/30 : résistance aux coûts d'exécution fictifs

**12 novembre 2026 — Étude scientifique PAPER, sans ordre, sans accès à un compte.**

## Résumé et conclusion

Les **1 035 journées** de l'historique natif **Bitstamp Spot BTC/USD et ETH/USD** (2024-01-01→2026-10-31) ont été rejouées avec les **EMA 10/30 et leurs 122 opérations fictives entièrement inchangées**, en augmentant les frais et le glissement dans une grille préétablie. Le modèle était connu ; les nouveaux calculs ont été effectués **après publication du protocole** [ci-dessous](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_FROZEN_PROTOCOL_2026_11_12.md), commit `a1fe8f5880be265f2bbb66d947f1f221ad31e69f`.

**Verdict :** le portefeuille EMA 50/50 garde un avantage sur Buy & Hold aux coûts fictifs de 0,15 % et 0,30 % par côté, mais cet avantage **s'annule vers 0,551 % par côté**, en conservant la même proportion frais/glissement. Au-delà, de nombreux allers-retours pèsent davantage sur l'EMA. Son rendement final devient nul vers **1,100 % de coûts par côté**, dans cette simulation rétrospective seulement. **Il ne s'agit ni de tarifs affichés par Bitstamp ou OKX ni de seuils opérationnels universels.**

## 1. Sources immuables et vérifications

- [BTC/USD Bitstamp natif : 1 310 jours 2023-04-01→2026-10-31](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv), Git blob `e770ca75bcdb4821e0c1e86a0b47e5478e5c8fba`, SHA-256 `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb`.
- [ETH/USD Bitstamp natif, mêmes 1 310 jours](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv), Git blob `49e8f3e8f89fdc2929d2e37d1cc5e4904813621e`, SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- [Étude native de référence et preuves originales](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_proofs.json), Git blob `ab15dc23da2e5b8adc5e72ea0eef893b79b79aeb`.
- **275 jours de chauffe EMA** depuis 2023-04-01 ; **1 035 jours de portefeuille** 2024-01-01→2026-10-31, deux poches initiales de 500 USD, aucune réallocation.
- [**Protocole figé avant les nouveaux calculs**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_FROZEN_PROTOCOL_2026_11_12.md) ; [**preuves initiales complètes des scénarios**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_EVIDENCE_2026_11_12.json).
- [**Programme Python vérifié indépendant du premier calcul JS**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_REPLAY_2026_11_12.py) réutilisant le moteur EMA canonique, mais relisant et vérifiant les archives et recomputant chaque scénario.
- [**Exécution GitHub Actions : SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43245735625), contrôle des empreintes, des calendriers, de l'intégrité OHLC, des 122 transactions fictives et de la reproduction à 0,000002 point près des résultats publiés.
- [**Preuve JSON de la reproduction Python réussie**](./transaction_cost_stress_evidence/SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_PYTHON_VERIFICATION.json) ; [**CSV exploitable des scénarios**](./transaction_cost_stress_evidence/SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_GRID.csv).

## 2. Politique et coûts simulés — aucune adaptation

Signal quotidien : `EMA10(t)>EMA30(t) ET close(t)>EMA30(t)`. La décision de la clôture UTC t n'est **exécutée fictivement qu'à l'ouverture du jour t+1**. Portefeuille 50/50 initial : deux poches autonomes, cash ou long spot, sans levier ni short. Chaque achat utilise `qty=cash*(1-fee)/(open*(1+slip))`, chaque vente `cash=qty*open*(1-slip)*(1-fee)`. Les quantités encore détenues sont valorisées en déduisant les hypothétiques coûts de liquidation.

La grille multiplie les deux composantes par le même facteur. Le point de base est 0,10 % de frais + 0,05 % de glissement **par côté**, soit **0,15 % par côté**. Il ne faut **pas** comprendre cette hypothèse comme le tarif effectif d'un ordre : les barèmes varient selon la plateforme, le niveau et la période ; les OHLC journalières ne donnent pas les spreads et profondeurs disponibles à l'instant de l'ordre. Documentation du fournisseur : https://www.bitstamp.net/api/ et https://www.bitstamp.net/fee-schedule .

## 3. Résultats des huit scénarios d'exécution fictive

| Facteur | Frais / côté | Glissement / côté | Total indicatif / côté | EMA 50/50 | Buy & Hold 50/50 | Avantage EMA |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 0,00 % | 0,00 % | 0,00 % | +94,57 % | +40,95 % | +53,61 pts |
| 1 | 0,10 % | 0,05 % | **0,15 %** | **+77,67 %** | +40,53 % | +37,13 pts |
| 2 | 0,20 % | 0,10 % | 0,30 % | +62,24 % | +40,11 % | +22,13 pts |
| 3 | 0,30 % | 0,15 % | 0,45 % | +48,16 % | +39,69 % | +8,47 pts |
| 4 | 0,40 % | 0,20 % | 0,60 % | +35,31 % | +39,27 % | **−3,96 pts** |
| 6 | 0,60 % | 0,30 % | 0,90 % | +12,87 % | +38,43 % | −25,57 pts |
| 8 | 0,80 % | 0,40 % | 1,20 % | **−5,83 %** | +37,60 % | −43,43 pts |
| 10 | 1,00 % | 0,50 % | 1,50 % | −21,42 % | +36,77 % | −58,19 pts |

La courbe EMA devient moins performante plus vite que Buy & Hold : elle réalise **122 opérations fictives** contre **2 achats initiaux** en Buy & Hold, pour deux poches distinctes.

### Deux seuils diagnostiques obtenus par dichotomie

- **Facteur 3,670861** : EMA et Buy & Hold sont à égalité sur le rendement final historique. Cela correspond à **0,367086 % de frais + 0,183543 % de glissement par côté**, soit **0,550629 % par côté**.
- **Facteur 7,336403** : rendement EMA final nul sur l'historique. Cela correspond à **0,733640 % de frais + 0,366820 % de glissement**, soit **1,100460 % par côté**.

Les seuils sont **des solutions arithmétiques du modèle**, pas une estimation économétrique de coûts exécutable, et encore moins un paramètre de stratégie à optimiser.

## 4. Rendements par année : le risque du régime de marché reste présent

Rendement du portefeuille EMA **continu, non réinitialisé**, coût de référence 0,15 % / côté :

| Année | EMA 50/50 |
|---|---:|
| 2024 | +26,84 % |
| 2025 | +36,59 % |
| Janv.–oct. 2026 | +2,55 % |

Ces résultats proviennent du **même historique déjà examiné**. Le rendement annuel 2026 est relativement faible, et **le drawdown maximal du modèle EMA au coût de base reste −42,15 %**. Augmenter la pénalité à 0,60 % / côté abaisse le rendement final à +35,31 % et aggrave le drawdown maximal à **−46,12 %**. À 1,50 % / côté, le drawdown maximal atteint **−55,00 %**.

Un rendement final historiquement positif n'est donc pas une preuve de capital protégé, particulièrement lorsque BTC et ETH chutent ensemble.

## 5. Limites importantes

**Faits démontrés :** le calcul est déterministe sur des prix Bitstamp natifs préarchivés et épinglés ; le programme Python a reproduit les huit scénarios et contrôlé leurs écarts à la référence, sans modifier aucun signal EMA. Les opérations fictives sont constantes quel que soit le facteur.

**Ce qui reste inconnu :** taux effectif de frais d'un compte ou d'une période, spread acheteur/vendeur au moment des ouvertures quotidiennes, taille absorbable au carnet, glissement réalisé, fiscalité, liquidité en crise, pauses de négociation et risque de garde. **Ces variables peuvent invalider les rendements simulés** même au facteur de base.

**Biais d'échantillon :** ni cette grille ni le test Binance/Bitstamp ne prouvent des gains futurs. C'est la même série **2024–octobre 2026 déjà étudiée** ; les coûts sont un facteur de stress, pas une validation temporelle hors échantillon. Ne pas choisir un facteur « gagnant » a posteriori.

## 6. Conclusion et suite scientifique

Le portefeuille EMA 10/30 s'avère historiquement **très sensible à l'ensemble frais + glissement**. Son avantage sur Buy & Hold persiste sous la grille de référence et à 0,45 % / côté, mais disparaît vers 0,55 % / côté dans cette série. Un modèle de coût fixe ne suffit pas pour décider d'opérer en conditions réelles.

**Suite recommandée dans le cadre de recherche :** figer une évaluation temporelle **strictement postérieure au 12 novembre 2026**, recueillir des cours et, si possible, des **observations réelles horodatées de spreads, profondeurs et frais applicables**, sans modifier EMA 10/30 ni utiliser les données futures pour choisir les règles. Aucune automatisation d'ordres, aucune modification de l'Administrator, de l'Operator, du Trader ou du Bridge.
