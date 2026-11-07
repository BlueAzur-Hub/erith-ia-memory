# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 02
## DCA CLASSIQUE vs SPOT DCA (MARTINGALE) — Deux façons très différentes d'acheter

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann, Administrator / Operator · **Statut :** DOCUMENTAIRE — LECTURE SEULE · **Aucun ordre réel, aucune automatisation, aucun import exécutable.**

**Destination de coordination envisagée (non publiée) :** `BlueAzur-Hub/erith-ia-memory/coordination/inter_ai_dialogues/agent_crypto/`.

> **Question étudiée :** si Bitcoin baisse, est-ce qu'« acheter un peu chaque mois » signifie la même chose qu'« acheter de plus en plus à chaque baisse » ? **Non.**

## 1. Principe en une minute

- **DCA classique (Dollar-Cost Averaging, achat périodique à montant fixe) :** acheter une somme déterminée à intervalles de temps définis, par exemple chaque mois, indépendamment de la direction du marché. Le calendrier commande l'achat.
- **Spot DCA / Martingale (bot OKX) :** effectuer un achat initial, puis déclencher des **ordres de sécurité** si le prix baisse selon des écarts choisis, éventuellement en augmentant leur montant. Le prix commande les achats supplémentaires ; une cible de profit peut déclencher la vente du lot et un nouveau cycle.
- **Attention à la terminologie :** toutes les méthodes d'achat en baisse ne doublent pas forcément chaque mise. Le terme « Martingale » renvoie au renforcement, souvent croissant ; OKX documente un **multiplicateur de montant** configurable. En cas de perte prolongée, le capital engagé peut augmenter rapidement.

**Analogie :** le DCA classique est un abonnement d'épargne à calendrier fixe. Le bot Martingale est un vendeur qui achète davantage lorsque la marchandise devient moins chère, en pariant sur un rebond qui peut tarder ou ne jamais se produire.

## 2. Exemple fictif sans frais — deux budgets et deux logiques

### A. DCA classique : budget total 120 USDC réparti en 4 achats

| Date fictive | BTC en USDC | Achat programmé |
|---|---:|---:|
| Mois 1 | 80 000 | 30 USDC |
| Mois 2 | 72 000 | 30 USDC |
| Mois 3 | 60 000 | 30 USDC |
| Mois 4 | 68 000 | 30 USDC |

À la fin : **120 USDC investis**, quelle que soit la direction des cours. Le prix moyen par BTC s'obtient en divisant les 120 USDC par la quantité totale de BTC acquise — ce n'est **pas** la moyenne arithmétique des quatre prix. Si les prix tombent longtemps, la valeur de la position peut rester inférieure aux versements.

### B. Variante de Martingale : montants qui doublent dans une baisse

| Étape fictive | Condition | Achat | Cumul engagé |
|---|---|---:|---:|
| Achat initial | Début du cycle | 25 USDC | 25 USDC |
| Sécurité 1 | Première baisse définie | 50 USDC | 75 USDC |
| Sécurité 2 | Nouvelle baisse définie | 100 USDC | 175 USDC |
| Sécurité 3 | Nouvelle baisse définie | 200 USDC | 375 USDC |
| Sécurité 4 | Nouvelle baisse définie | 400 USDC | **775 USDC** |

L'exemple **ne prescrit ni la taille ni le nombre de ces ordres**. Il illustre l'accélération de l'engagement : 25 + 50 + 100 + 200 + 400 = 775 USDC. Si le budget disponible ne permet pas l'ordre suivant, la mécanique ne peut pas se poursuivre comme prévu. Le prix moyen peut descendre, mais la **perte absolue** sur l'inventaire restant peut augmenter.

## 3. Ce qu'OKX Europe décrit précisément

La documentation **OKX EEE**, actualisée en août 2026, classe notamment **Spot Grid** et **Spot DCA (Martingale)** parmi ses bots. Pour Spot DCA, OKX décrit un **ordre initial**, des **ordres de sécurité** déclenchés par une baisse de prix, un **nombre maximum** de renforts, une cible **Take Profit (TP)** et, selon la configuration, une sortie **Stop Loss (SL)**. Le bot peut redémarrer un cycle après un TP. Le fait qu'une page d'aide décrive une fonctionnalité ne garantit pas sa disponibilité ni ses conditions sur chaque compte français.

**Important :** un « bot DCA » et un plan d'achats récurrents ne sont pas interchangeables. L'un est une stratégie conditionnelle d'ordres en réaction à la baisse et orientée vers un cycle de sortie ; l'autre peut simplement accumuler un actif longtemps, sans objectif de vente à court terme.

## 4. Paramètres que le trader doit savoir lire

| Paramètre | DCA classique | Spot DCA Martingale |
|---|---|---|
| Déclencheur | Date ou intervalle régulier | Baisse depuis une référence déterminée |
| Montant | Fixe ou prévu au calendrier | Montant initial + renforts, parfois croissants |
| Durée | Plusieurs mois/années possibles | Cycles de durée variable, sans échéance certaine |
| Sortie | Choisie indépendamment | TP/SL ou arrêt selon paramètres |
| Budget maximal | Somme des versements prévus | Achat initial + **tous** les renforts possibles |
| Risque crucial | Forte perte de valeur en tendance baissière | Forte perte **et** capital rapidement mobilisé |
| Frais | À chaque achat / vente éventuelle | À chaque achat de sécurité et sortie du cycle |

Un professionnel vérifie **avant de tester** : exposition totale si toutes les sécurités sont déclenchées ; réserve disponible ; niveau de perte maximale ; frais, glissement et spread ; scénario sans rebond ; conditions d'arrêt ; échec de données réseau ; différence entre gain par cycle et performance totale.

## 5. Trois scénarios pour comprendre

1. **Hausse régulière.** Un achat initial unique capte davantage de hausse sur le budget investi dès le départ ; le DCA échelonné prend position progressivement. La Martingale peut n'exécuter aucun renfort après l'achat initial.
2. **Marché en oscillation.** Des baisses suivies de rebonds peuvent déclencher des achats supplémentaires puis un TP. Mais le nombre de cycles gagnants ne doit pas masquer le capital mobilisé et les pertes latentes éventuelles.
3. **Longue chute sans rebond.** Le DCA fixe continue ses achats programmés jusqu'à épuisement du budget prévu ; la Martingale peut mobiliser une grande part du budget très tôt et rester exposée à une perte importante.

## 6. Ce que le Coffre historique a déjà permis de mesurer

Dans notre **étude antérieure** du Coffre (simulation indépendante sur Binance Spot **BTC/USDT**, et **non** simulation native du bot OKX), nous avons comparé un achat immédiat à **12 achats répartis sur le même budget initial de 1 000 USDT**. Le capital non encore déployé restait en liquidités. Fenêtre : **22 janvier → 31 décembre** de chaque année ; frais fictifs **0,10 % par côté** et glissement **0,05 % par côté** ; valorisation finale avec coûts de liquidation théoriques.

| Année | Achat unique conservé | 12 achats mensuels sur budget réservé | Perte temporaire maximale DCA à la clôture |
|---|---:|---:|---:|
| 2022 | −54,75 % | **−30,65 %** | −37,10 % |
| 2023 | **+85,03 %** | +48,02 % | −12,40 % |
| 2024 | **+124,37 %** | +44,57 % | −15,18 % |
| 2025 | −17,67 % | **−12,33 %** | −26,77 % |

**Interprétation :** étaler l'engagement peut réduire la perte dans une forte baisse, mais peut aussi laisser une partie de la hausse sur la table. Le « DCA de 1 000 USDT répartis » ne se compare pas parfaitement à une épargne réelle où l'argent arrive chaque mois : l'étude suppose que toute la réserve existe au départ. Il ne faut pas prendre ces chiffres pour une performance future.

**Ce qui n'a PAS été calculé :** une performance historique fiable du bot **Spot DCA Martingale OKX**. Le Coffre quotidien n'atteste pas l'ordre intrajournalier des seuils, les vrais remplissages, les règles exactes de chaque cycle, ni les choix des sécurités. Aucun pourcentage de rentabilité Martingale n'est affirmé ici.

## 7. Profils pédagogiques — non importables

| Champ | Profil 02A · Accumulation DCA | Profil 02B · Martingale observée |
|---|---|---|
| Nom | `Seven Research 02A — Fixed Budget DCA` | `Seven Research 02B — Spot DCA Risk Study` |
| Objectif | Comprendre l'étalement des achats | Comprendre la croissance de l'exposition |
| Déclenchement | Mensuel, montant fixe | Écart de prix, ordres conditionnels |
| Capital d'exemple | 1 000 USDT fictifs réservés | Budget total **plafonné** avant tout test |
| Données nécessaires | Prix quotidiens et calendrier | Bougies fines, règles de cycle, exécutions plausibles |
| Mesures | Valeur finale, coût moyen, drawdown | Capital maximal engagé, inventaire, drawdown, cycles non soldés |
| État | `RESEARCH_ONLY` | `RESEARCH_ONLY — HIGH RISK` |

## 8. Questions de compréhension et stop point

1. Dans lequel des deux systèmes l'achat dépend-il du **temps**, et dans lequel dépend-il du **prix** ?
2. Pourquoi faire baisser le prix d'achat moyen ne signifie-t-il pas réduire la perte totale ?
3. Pourquoi une suite de cycles positifs peut-elle masquer une dernière position très perdante ?
4. Pourquoi notre étude des 12 achats historiques **ne valide-t-elle pas** le bot Martingale ?

**Conclusion Seven :** les deux approches n'ont pas la même finalité. Le DCA classique étale une décision d'investissement ; la Martingale organise des **renforcements conditionnels** avec un risque de capital croissant. **Aucun ordre, aucun profil de trading automatisé, aucun changement du programme Trader.**

## Sources et provenance

- [OKX Europe — Bots disponibles en EEE (mise à jour août 2026)](https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them).
- [OKX Europe — Qu'est-ce que le bot Spot DCA et comment l'utiliser ?](https://www.okx.com/fr-fr/help/whats-the-spot-dca-bot-and-how-to-use-it).
- [OKX Europe — Spot DCA Martingale : paramètres et principes](https://www.okx.com/fr-fr/help/whats-spot-dca-martingale-bot-and-how-to-use-it).
- [Seven Heaven — Encyclopédie et étude du Coffre 2022–2025](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) — guide de référence archivé dans le même dossier GitHub.
- [Coffre BTC réconcilié — index public](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json).