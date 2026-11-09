# Seven Heaven — BTC, ETH, SOL, XRP : prix moyens et coûts théoriques sur carnets OKX Spot

**Étude réalisée le 9 novembre 2026 à partir des carnets OKX EEA publics archivés des 27–28 octobre 2026. Aucune donnée de carnet actuel ni transaction réelle.**

Ce rapport prolonge les [dossiers BTC/ETH](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_USDC_ETH_USDC_SPOT_FIELD_EVIDENCE_2026_11_09.md), [SOL](./SEVEN_HEAVEN_AGENT_CRYPTO_SOL_USDC_SPOT_RESEARCH_2026_11_09.md), [XRP](./SEVEN_HEAVEN_AGENT_CRYPTO_XRP_USDC_SPOT_RESEARCH_2026_11_09.md) et le [tableau Top 10](./SEVEN_HEAVEN_AGENT_CRYPTO_TOP10_OKX_EVIDENCE_RESEARCH_SCORECARD_2026_11_09.md). Les [240 scénarios horodatés et recalculables](../data/crypto/research/seven_heaven_btc_eth_sol_xrp_book5_size_cost_2026_11_09.json) sont enregistrés en JSON avec les empreintes sources.

## 1. Base et méthode

- **15 heures communes** conservées dans l'index qualifié (27 octobre 10:36 → 28 octobre 08:34 UTC), 4 carnets à cinq niveaux par heure, soit **60 carnets de paires distinctes** et **240 scénarios** : montants **10, 100, 500 et 1 000 USDC**.
- Sources immuables : `data/crypto/okx-hourly/2026-10-27.json` blob Git `9509de1c7d65d0e74b3a60f8cfcb550d95c83aef` ; `2026-10-28.json` blob `09c15414acf17d6f5154ed8475b54b45e116b209`.
- La source est le carnet OKX Spot `BOOK5` en **USDC** et son horodatage, et **non** l'historique Binance `USDT`, un cours global `USD` ou un ticker éventuellement asynchrone.
- Pour un **achat fictif taker**, répartir le budget (hors frais) sur les cinq offres vendeuses ascendantes ; calculer la quantité idéale, le prix moyen pondéré, l'écart au premier ask et au mid `(bid+ask)/2`. Enregistrer un reliquat si la profondeur est insuffisante.
- Le profil **Utilisateur régulier** confirmé par captures du compte les **6 et 9 novembre** affiche **Maker 0,08 % et Taker 0,10 %**. Ici le calcul de **frais taker 0,10 %** sert de coût indicatif à un achat qui consomme le carnet ; le taux Maker n'est **pas** appliqué artificiellement à ce scénario. C'est une application **contre-factuelle** du barème du 9 novembre aux carnets d'octobre. La devise effectivement prélevée et toute remise spécifique restent à vérifier pour une opération réelle.
- Les `minSz/lotSz/tickSz` sont ceux **archivés fin octobre**, pas des règles revalidées pour le 9 novembre. Le contrôle `minSz` est seulement fait sur une quantité théorique **avant arrondi aux lots** ; il ne certifie pas qu'un ordre serait accepté.

## 2. Liquidité affichée et spreads

| Paire | Spread médian sur 15 carnets (pb) | Profondeur vendeuse médiane top5 | Carnets couvrant 1 000 USDC | Au moins deux niveaux utilisés à 1 000 USDC |
|---|---:|---:|---:|---:|
| BTC/USDC | 0,012 | 19 325 USDC | 15/15 | 3/15 |
| ETH/USDC | 0,043 | 34 734 USDC | 15/15 | 5/15 |
| SOL/USDC | 1,981 | 35 475 USDC | 15/15 | 6/15 |
| XRP/USDC | 2,252 | 24 275 USDC | 15/15 | 3/15 |

**Résultat :** les quatre paires couvrent les quatre budgets dans tous les **15 relevés**. Cette couverture n'est qu'une propriété de quantité *affichée* dans le carnet ancien. À 1 000 USDC, certains carnets nécessitent plus que le premier niveau, surtout SOL et ETH.

## 3. Frais Spot et coût théorique de l'achat

Le coût est séparé en **spread**, **marche dans les niveaux** et **frais taker**. Une médiane d'impact nul *par rapport au meilleur ask* ne veut pas dire qu'un achat n'a pas de coût : le best ask est habituellement au-dessus du mid. La colonne « coût vs mid + frais » évalue la différence de valeur à quantité identique, à laquelle sont ajoutés les frais fictifs de 0,10 % pour un seul achat.

| Achat hypothétique de 1 000 USDC | Surcoût médian du prix moyen vs mid (pb) | Surcoût médian vs mid + frais Taker | P95 d'impact **au-delà du meilleur ask** (pb) |
|---|---:|---:|---:|
| BTC/USDC | 0,0062 | 1,0006 USDC | 0,0772 |
| ETH/USDC | 0,0215 | 1,0021 USDC | 0,3362 |
| SOL/USDC | 0,9920 | 1,0992 USDC | 0,8252 |
| XRP/USDC | 1,1258 | 1,1126 USDC | 0,4380 |

Pour les achats de 10, 100, 500 et 1 000 USDC, les **240 scénarios** et chacun des prix moyens théoriques sont dans le JSON. Le premier niveau suffit pour tous les scénarios à **10 USDC**. Ces petits montants restent soumis aux minimums de l'instrument et à la devise de prélèvement réelle, qui ne sont pas validés aujourd'hui.

## 4. Interprétation des résultats et limites

- Dans les 15 carnets d'octobre, la **hiérarchie descriptive des spreads** est BTC, ETH, SOL, XRP (du plus serré au moins serré). Ce n'est pas un classement d'achats recommandés ni une prévision du marché actuel.
- La profondeur totale sur cinq niveaux mesure une liquidité **affichée**. Une quantité visible peut être annulée ou changer avant qu'un ordre n'arrive ; le simulateur ne possède ni historique continu du carnet ni exécution certifiée.
- Les données sont des observations espacées et **non des relevés continus**. Les percentiles ne sont pas des probabilités de qualité d'exécution future.
- Aucun remboursement de vente, rendement, frais de sortie ou aller-retour n'a été modélisé ; le coût présent concerne **seulement un achat fictif**.
- **Pas de certification PAPER** : il manque encore le contrôle des instruments et droits EEE actuels, des règles de lot, de la facturation réelle en devise, des données historiques continues et du journal des simulations par stratégie.

**Décision de recherche :** BTC et ETH présentent les spreads les plus bas dans cet échantillon. Les quatre actifs constituent une base pour des scénarios PAPER sur *archives*, mais aucun n'est certifié, et rien ne justifie de retoucher Administrator, Trader ou Bridge R31.

## 5. Références et prochaine qualification

- [Barème Spot 0,08 % / 0,10 % déjà enregistré dans Notion « OKX MEMORY CORE — 01 Trading Fees »](https://app.notion.com/p/AETHER-AGENT-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099). Ne pas redemander ces captures sans motif de changement.
- [Sources OKX 27 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-27.json) et [28 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-28.json).
- **Prochaine action documentaire** : contrôler la continuité de données historiques sur une fenêtre bornée pour au moins BTC et ETH avant d'attribuer un statut de backtest comparatif ; pas de fusion des séries Binance USDT et des carnets OKX USDC.

**Statut : étude documentaire accomplie, programme et Bridge R31 inchangés.**
