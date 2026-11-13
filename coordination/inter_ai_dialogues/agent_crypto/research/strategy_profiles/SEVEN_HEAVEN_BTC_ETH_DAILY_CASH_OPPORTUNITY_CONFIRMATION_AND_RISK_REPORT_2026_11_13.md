# Seven Heaven — étude de synthèse BTC/ETH : liquidités, occasions manquées, confirmations et coûts (2024–2026)

**13 novembre 2026 · Rapport de clôture d’une étude comparative PAPER rétrospective**  
**Périmètre :** Bitstamp Spot **BTC/USD** et **ETH/USD** · **1 035 journées consécutives** du 1er janvier 2024 au 31 octobre 2026, préchauffage depuis le 1er avril 2023. **Zéro ordre réel, zéro modification du Trader, de l’Administrator, de l’Operator ou du Bridge.**

## 1. Question scientifique et décision

Objectif : comprendre si rester temporairement en liquidités évite davantage de pertes qu'il ne fait manquer de hausses, et si les confirmations (2 ou 3 clôtures) ou une double EMA rapide/lente améliorent le compromis rendement/risque **une fois les frais pris en compte**.

**Décision : aucune variante n'est validée pour le réel.** Sur cette période historique déjà connue, les règles simples constituent de meilleurs repères de recherche que l'ajout automatique d'une deuxième EMA ou d'un délai de confirmation. L'efficacité des sorties est très dépendante de quelques fortes baisses évitées ; les réentrées retardées coûtent cher. Une stratégie peut paraître gagnante en rendement final tout en subissant une baisse maximale de 30 à 55 %.

**À retenir immédiatement :** ne pas promouvoir un filtre complexe simplement parce qu'il réduit le nombre de jours investis ; comparer systématiquement rendement net, perte maximale, nombre de transactions, hausses manquées et scénario de frais doublés.

## 2. Provenance et contrat de calcul

Sources canoniques, lues directement depuis le GitHub partagé :
- [Bitstamp BTC/USD, 1 310 bougies journalières](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv), SHA-256 `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb`.
- [Bitstamp ETH/USD, 1 310 bougies journalières](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv), SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- Référence **déjà validée** avant cette analyse : [étude native BTC/ETH 50/50 sur Bitstamp et Binance](./SEVEN_HEAVEN_BTC_ETH_NATIVE_BITSTAMP_50_50_ROBUSTNESS_AND_DOWNSIDE_AUDIT_2026_11_12.md). Les valeurs de référence reproduites à l'arrondi sont **BTC EMA10/30 +65,781857 %**, **ETH EMA10/30 +89,548633 %** et **50/50 EMA10/30 +77,665245 %**, avec 68 / 54 opérations.
- [Reproducteur JavaScript/Node déterministe](./SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPLAY_2026_11_13.js) utilisant uniquement les CSV dans le dépôt (aucune collecte ni dépendance externe). Il refuse une empreinte SHA-256 incorrecte, les jours manquants, les erreurs OHLC, les discordances de bilan et les identités log de périodes cash.
- [Preuves JSON consolidées, positions et fenêtres cash](./SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_PROOFS_2026_11_13.json). Le fichier conserve les calculs et les dates des périodes cash, y compris les fenêtres ouvertes à la fin.
- [Vérification GitHub Actions en lecture seule](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-heaven-btc-eth-cash-opportunity-confirmation-replay.yml). La présence du workflow ne prouve **pas** qu'une exécution ait réussi ; consulter l'état du run avant toute revendication CI.

**Conventions inchangées :** 1 000 USD fictifs investis à 100 % dans un seul actif ou en liquidités USD ; aucune vente à découvert, aucun levier, aucun apport. Frais **0,10 %** et glissement forfaitaire **0,05 % par côté**, stress coûts ×2 (0,20 % + 0,10 % par côté). Décision à la clôture UTC de D, exécution fictive à l'**ouverture D+1** ; la valeur liquidable aux clôtures inclut le coût hypothétique d'une vente. Les moyennes mobiles sont calculées uniquement à partir des clôtures connues (alpha = 2/(N+1)), préchauffées depuis 2023-04-01.

**Règles préexistantes adaptées à un état quotidien (et non au V5 15 minutes) :**
- **HOLD** : acheter et garder.
- **FAST** : investi si `EMA5 > EMA13` et clôture > EMA13 ; sinon cash.
- **SLOW** : investi si `EMA10 > EMA30` et clôture > EMA30 ; sinon cash.
- **GATE** : investi si FAST et SLOW simultanément ; sinon cash (étude précédente complétée).
- **C2/C3** : attendre 2 ou 3 clôtures successives du même état brut EMA10/30 avant d'entrer et de sortir.
- **E1N2** : sortir après un seul état baissier et rentrer après deux états haussiers successifs.

La position confirmée est calculée sur toutes les journées du préchauffage avant la première journée de portefeuille. La comparaison C1/C2/C3 ici porte sur la série **Bitstamp continue 2024–2026**, et **non** les études antérieures Binance fév.–mars 2024/2025 ou fév.–oct. 2026 : ne pas interchanger leurs PnL ni les états de départ.

## 3. Les sept politiques sur la même période CONTINUE

### BTC et ETH traités séparément

| Règle | BTC rendement net | BTC drawdown max | BTC opérations | ETH rendement net | ETH drawdown max | ETH opérations |
|---|---:|---:|---:|---:|---:|---:|
| Buy & Hold | +82,68 % | −53,08 % | 1 | −1,62 % | −67,59 % | 1 |
| EMA rapide 5/13 | **+103,29 %** | **−26,00 %** | 98 | +62,86 % | −45,60 % | 100 |
| EMA lente 10/30 | +65,78 % | −34,48 % | 68 | **+89,55 %** | −54,10 % | 54 |
| FAST ET SLOW | +83,73 % | −28,36 % | 80 | +48,45 % | −49,64 % | 80 |
| SLOW confirmé 2 jours | +50,49 % | −36,05 % | 48 | +40,18 % | −55,75 % | 42 |
| SLOW confirmé 3 jours | +53,32 % | −33,25 % | 40 | +77,16 % | −52,12 % | 32 |
| Sortie 1j / entrée 2j | +59,06 % | −34,32 % | 58 | +79,88 % | −54,67 % | 52 |

Le fait qu'EMA rapide domine BTC mais non ETH montre que le même paramètre ne domine pas systématiquement deux actifs. Un nombre moindre d'opérations n'implique pas de meilleurs résultats : C2 ralentit SLOW mais détériore le rendement et la baisse maximale sur les deux actifs dans cet échantillon.

### Portefeuille 50/50 BTC/ETH — deux poches initiales de 500 USD, sans rééquilibrage

| Politique | Rendement net | Baisse maximale | Transactions (deux poches) | Coûts ×2, rendement |
|---|---:|---:|---:|---:|
| Buy & Hold 50/50 | +40,53 % | −58,58 % | 2 | +40,11 % |
| EMA rapide 5/13 50/50 | **+83,08 %** | **−33,83 %** | **198** | +57,81 % |
| EMA lente 10/30 50/50 | +77,67 % | −42,15 % | 122 | **+62,24 %** |
| FAST ET SLOW 50/50 | +66,09 % | −36,39 % | 160 | +47,29 % |
| SLOW confirmé 2j 50/50 | +45,33 % | −43,03 % | 90 | +35,82 % |
| SLOW confirmé 3j 50/50 | +65,24 % | −37,86 % | 72 | +56,62 % |
| Sortie 1j / entrée 2j 50/50 | +69,47 % | −41,52 % | 110 | +56,08 % |

**Résultat-clé :** le portefeuille **FAST** dépasse **SLOW** de +5,41 points en rendement avec les hypothèses standards, mais passe **sous SLOW** lorsque frais et glissement sont doublés : **+57,81 % vs +62,24 %**. Cette inversion révèle une fragilité de la comparaison au coût de rotation, et non une preuve que FAST ou SLOW est la « bonne stratégie ».

La combinaison FAST ET SLOW n'améliore pas le meilleur compromis sur cette fenêtre, avec 160 transactions contre 122 pour SLOW. Plus de filtres n'assure ni moins d'ordres ni plus de protection.

## 4. Quand les liquidités protègent — et quand elles coûtent

### EMA lente 10/30 : fenêtres complètes vente → réentrée

| Mesure | BTC/USD | ETH/USD |
|---|---:|---:|
| Journées en cash | **548/1035** | **593/1035** |
| Fenêtres complètes après une vente | 33 | 26 |
| Retour à un cours **plus haut** (rebond manqué) | 26 | 20 |
| Retour à un cours **plus bas** (baisse évitée) | 7 | 6 |
| Parmi les reprises, hausse ≥3 % | 12 | 13 |
| Parmi les baisses, baisse ≤−3 % | 5 | 5 |
| Retours en cash ≤7 jours | 18 | 13 |
| Plus grande hausse entre sortie et réentrée | **+9,57 %** en 1 jour (20→21/03/2024) | **+15,27 %** en 7 jours (01→08/11/2024) |
| Plus grande baisse entre sortie et réentrée | **−18,35 %** en 61 jours (17/05→17/07/2026) | **−46,80 %** en 112 jours (08/01→30/04/2025) |

Une fenêtre cash encore ouverte au 31 octobre 2026 est **censurée à la clôture de cette date** ; elle n'est pas comptée comme un aller-retour complet. Les journées de cash initiales avant tout premier achat ne sont pas appelées « ventes ». Les seuils ±3 % servent exclusivement à décrire ce qu'a fait le cours **après** une vente ; ils ne déclenchent jamais une opération.

### Attribution mathématique des fenêtres sans frais

Nous isolons d'abord le rendement théorique à **zéro commission et zéro glissement** (purement analytique). Tant que les deux modèles détiennent l'actif, ils partagent ses mouvements ; la différence de leurs facteurs de croissance provient exactement du produit des variations de cours **pendant les fenêtres cash**, initiales et censurées comprises.

Formellement :
`(capital final stratégie sans frais / capital final HOLD sans frais) = produit_fenêtres_cash(prix_début/prix_fin)`.

Le reproducteur vérifie numériquement cette identité pour chaque règle et actif.

| Résultat 2024–2026 | BTC Buy & Hold | BTC EMA lente | ETH Buy & Hold | ETH EMA lente |
|---|---:|---:|---:|---:|
| Rendement à coûts nuls | +83,23 % | +83,59 % | −1,32 % | **+105,55 %** |
| Rendement avec coûts de référence | +82,68 % | +65,78 % | −1,62 % | **+89,55 %** |

**BTC :** les hausses manquées pendant les fenêtres cash compensent presque les baisses évitées ; avant coûts, **+83,59 %** pour SLOW contre **+83,23 %** en Buy & Hold. Les 68 opérations du filtre réduisent le rendement net à **+65,78 %**. La baisse maximale reste toutefois moins sévère, **−34,48 % vs −53,08 %** : le choix rendement/risque est réel.

**ETH :** les baisses évitées dominent beaucoup plus les occasions manquées. Une seule fenêtre (08/01→30/04/2025, **−46,80 %**) contribue énormément à l'avantage du filtre. Ce succès historique repose en partie sur un épisode exceptionnel et ne doit pas être projeté mécaniquement dans le futur. Même à +89,55 % final, le drawdown maximal EMA reste **−54,10 %**.

Le nombre de fenêtres gagnantes/perdantes pris isolément ne suffit pas : l'**amplitude** et la **durée** des mouvements évités ou manqués changent radicalement la valeur de rester en cash.

## 5. Confirmation, sensibilité et risques d'interprétation

- Sur le **BTC** de cette série, confirmer SLOW en deux clôtures donne +50,49 %, en trois +53,32 %, contre +65,78 % sans délai ; les deux variantes échouent à améliorer le résultat.
- Sur **ETH**, C2 +40,18 %, C3 +77,16 %, contre +89,55 % sans délai. L'attente permet moins de transactions mais peut faire manquer des reprises cruciales.
- Le comparatif précédent sur **2026 partiel** (Binance, février–octobre) montrait EMA C2 presque égal à C1 avec moitié moins d'ordres. Ce contraste rappelle la dépendance à l'actif, aux dates et à la place de cotation.
- Ce réexamen est **exploratoire et sur un passé réutilisé** ; les sept politiques ne sont pas sept essais indépendants et aucune supériorité prospective n'est établie.
- Le « cash » en USD fictifs ne porte aucun risque bancaire ni rendement. Une simulation en USDT/USDC ajouterait des risques d'émetteur/exchange et une autre unité de compte ; ne pas transférer les résultats sans test.
- Les prix d'ouverture sont historiques, mais **leur remplissage au tarif supposé n'est pas démontré**. Il manque l'impact des ordres, les niveaux minima, les files d'attente et la fiscalité. Les cours Bitstamp USD et OKX USDC ne sont pas identiques.
- Les baisses maximales sont mesurées sur la valeur **liquidable à la clôture quotidienne**, pas sur les excursions intrajournalières ; les pertes intra-bougie peuvent être plus importantes.
- Les périodes 2024–2026 ont déjà été utilisées lors de nombreuses explorations du projet. Il serait abusif de sélectionner ici un gagnant, de régler les seuils sur ces données puis d'appeler sa performance « hors échantillon ».

## 6. Verdict opérationnel de recherche, pas de trading

**Retenir comme références comparatives :**
1. **Buy & Hold et cash** : témoins indispensables ; Buy & Hold peut gagner davantage lors de longues hausses, mais expose à des pertes profondes.
2. **EMA lente 10/30** : référence de régime simple déjà reproduite sur deux places, avec prudence sur ses drawdowns et le coût des sorties.
3. **EMA rapide 5/13** : référence de sensibilité plus active, observée avantageuse sur BTC dans cette fenêtre mais fortement sensible aux frais dans un portefeuille mixte.
4. **Une règle de réduction d'exposition / plafond de capital** doit faire partie d'un futur protocole de risque avant de chercher un rendement maximal : aucune règle ici ne constitue une protection garantie.

**Écarter comme propositions d'amélioration démontrées sur cet échantillon :** double condition FAST+SLOW, confirmations C2/C3 systématiques et réentrée retardée asymétrique E1N2. Elles peuvent servir de témoins expérimentaux mais **n'ont pas prouvé** de supériorité générale.

**Clôture de cette phase rétrospective :** les résultats comparatifs et les fenêtres cash sont documentés ; répéter la même période avec d'autres réglages augmente surtout le risque de surajustement. Le seul test crédible suivant serait une observation PAPER **prospective** avec règles, dates et coûts gelés avant réception des nouvelles bougies, puis vérification de la qualité d'exécution avant une éventuelle décision humaine. Aucun ordre réel ni modification de la configuration actuelle.

**Références inter-IA :** conserver ce rapport, le reproducteur et le JSON dans le même répertoire partagé ; ne pas repartir de zéro. L'archive du 11 novembre sur **dix stratégies BTC** demeure une comparaison de méthodes distincte, en particulier parce qu'elle utilisait des événements de croisement plutôt qu'un état d'exposition quotidien : [dix stratégies BTC continues](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.md).

**Arrêt net :** pas de modification de production, pas de création de nouvelle stratégie de trading réelle, pas d'accès privé, pas de conseil d'achat/vente.
