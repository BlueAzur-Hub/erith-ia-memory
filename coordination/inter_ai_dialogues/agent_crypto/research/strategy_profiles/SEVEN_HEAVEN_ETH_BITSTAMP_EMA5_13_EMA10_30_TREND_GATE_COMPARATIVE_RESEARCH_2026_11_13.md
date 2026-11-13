# Seven Heaven — ETH/USD : le filtre EMA 10/30 améliore-t-il une méthode rapide EMA 5/13 ?

**Étude du 13 novembre 2026 · Recherche PAPER rétrospective, aucune opération réelle.**  
**Question décidée avant le recalcul :** un filtre de tendance lente réduit-il les mauvaises prises de position d'une stratégie EMA rapide, sans trop pénaliser son rendement ? Le résultat doit être confronté à chacune des stratégies seules, et pas seulement au Buy & Hold.

## Résultat principal

**Sur cette même série de 1 035 jours continus, la combinaison EMA 5/13 + EMA 10/30 ne surpasse aucune des deux EMA seules en rendement total.** Elle limite un peu la baisse maximale comparée à EMA 10/30, mais augmente la fréquence de transactions, et son rendement final baisse fortement. La règle plus complexe n'apporte donc pas ici un progrès robuste.

| Portefeuille PAPER | Capital final USD | Rendement net | Baisse maximale depuis sommet | Transactions achat + vente | Journées exposées |
|---|---:|---:|---:|---:|---:|
| EMA rapide 5/13 | 1 628,64 | +62,86 % | −45,60 % | 100 | 419/1035 |
| **EMA lente 10/30** | **1 895,49** | **+89,55 %** | −54,10 % | 54 | 442/1035 |
| **EMA 5/13 ET EMA 10/30** | 1 484,45 | +48,45 % | −49,64 % | 80 | 353/1035 |
| Buy & Hold ETH | 983,81 | −1,62 % | −67,59 % | 1 | 1035/1035 |

**Coûts fictifs doublés** (commission 0,20 % + glissement 0,10 % par côté) : EMA rapide **+40,16 %** ; EMA lente **+74,79 %** ; combinaison **+31,64 %** ; Buy & Hold **−1,91 %**.

**Bilan temporel de la combinaison :** sur 1 035 jours de décisions prises à la clôture précédente, 353 jours avec les deux règles haussières, 89 jours où la lente était seule haussière, 66 jours où la rapide était seule haussière, et 527 jours où aucune ne l'était. Le filtre retire donc **89 journées d'exposition** à la stratégie lente, sans démontrer que ce retrait était opportun.

## Trajectoire annuelle DU MÊME portefeuille continu

Les chiffres ci-dessous sont les variations du capital d'une fin d'année à la suivante. **Pas de remise à 1 000 USD chaque année** ; ne pas les confondre avec les expériences annuelles indépendantes des rapports antérieurs.

| Intervalle | EMA rapide | EMA lente | Combinaison | Buy & Hold |
|---|---:|---:|---:|---:|
| 2024 | +46,73 % | −10,07 % | +20,92 % | +45,54 % |
| 2025 | +3,73 % | +94,63 % | +39,72 % | −10,95 % |
| Janvier–octobre 2026 | +7,00 % | +8,29 % | **−12,13 %** | −24,09 % |

La combinaison aide **relativement** la méthode lente sur 2024, mais abandonne une grande partie de son résultat 2025 et devient négative sur janvier–octobre 2026. Il serait abusif de retenir le seul millésime 2024 pour affirmer que le filtre fonctionne.

## Données, protocole et reproduction

- **Source consultée :** `native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv` (même répertoire), bougies Spot **Bitstamp ETH/USD quotidiennes** ; Git blob SHA-1 `49e8f3e8f89fdc2929d2e37d1cc5e4904813621e`. **1 310 jours** sans trou, **1er avril 2023–31 octobre 2026** ; 275 jours de préchauffage, puis 1 035 jours d'essai du 1er janvier 2024 au 31 octobre 2026.
- **Règles d'exposition (état, pas événement de croisement) :** rapide si `EMA5 > EMA13` ET `close > EMA13` ; lente si `EMA10 > EMA30` ET `close > EMA30` ; filtrée si **les deux états sont vrais**. Les quatre EMA utilisent leur clôture journalière UTC et la récurrence `alpha=2/(N+1)`, initialisées à la première clôture 2023.
- Signal connu uniquement après clôture de D ; achat ou vente simulé à l'**ouverture D+1**, jamais à la clôture créant le signal. Portefeuille long-only 100 % ETH ou 100 % liquidités USD, 1 000 USD initiaux, sans apports ni levier. Valeur liquidable quotidienne nette d'une sortie théorique. Frais **0,10 % + glissement 0,05 % par côté** : hypothèses fictives constantes, non attestées comme frais Bitstamp réellement prélevés.
- **Contrôle d'identité obtenu :** le calcul reproduit exactement à l'arrondi la référence déjà publiée EMA 10/30 Bitstamp **+89,548633 %**, baisse max. **−54,100527 %**, **54** transactions et **442** journées ETH. Voir [l'audit antérieur Bitstamp/Binance](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_VS_BINANCE_EMA10_30_COMPARATIVE_AUDIT_2026_11_12.md).
- **Reproducteur Node.js sans dépendances externes**, utilisant strictement le CSV archivé, contrôlant son Git blob SHA-1, la continuité des dates et les résultats de référence : [`SEVEN_HEAVEN_ETH_BITSTAMP_DAILY_EMA_FAST_SLOW_TREND_GATE_REPLAY_2026_11_13.js`](./SEVEN_HEAVEN_ETH_BITSTAMP_DAILY_EMA_FAST_SLOW_TREND_GATE_REPLAY_2026_11_13.js). Exécution depuis la racine du dépôt : `node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_BITSTAMP_DAILY_EMA_FAST_SLOW_TREND_GATE_REPLAY_2026_11_13.js`. Les chiffres de cette étude ont été calculés sur le texte du CSV lu via le connecteur GitHub, avec la même logique ; **la commande Node du fichier publié n'a pas été exécutée dans GitHub Actions lors de cette publication**, et sa reproduction indépendante demeure une vérification distincte.

## Interprétation, sans survente

1. **Rapide n'est pas automatiquement mieux :** EMA5/13 accumule 100 transactions contre 54 pour EMA10/30. Les signaux rapides capturent aussi davantage de retournements brefs.
2. **Ajouter un filtre ne garantit pas moins d'opérations :** la combinaison limite l'exposition à 353 jours, mais effectue 80 transactions, soit 26 de plus que la stratégie lente seule. La multiplication des frontières d'entrée/sortie peut provoquer des va-et-vient.
3. **Moins de pertes maximales ne signifie pas faible risque :** la baisse max. combinée atteint encore près de 50 %.
4. **Ce n'est pas le V5 du Trader :** les stratégies ici sont des **états journaliers ETH/USD Bitstamp**. Les études antérieures du Trader utilisent des **croisements 15 minutes OKX ETH/USDC** et un autre protocole d'exécution. Ne jamais assimiler leurs résultats.
5. **Limite majeure :** les dates 2024–2026 sont déjà connues des recherches antérieures. Cette variante est une comparaison exploratoire sur un historique réutilisé, **pas une validation hors échantillon**. Elle ne justifie pas d'installer ou d'activer une nouvelle stratégie, ni d'optimiser des paramètres sur ces résultats.

## Décision et arrêt

**Ne pas promouvoir le double filtre EMA5/13 + EMA10/30.** Conserver EMA10/30 comme **référence de recherche**, pas comme une stratégie validée pour l'argent réel. Le nouveau test montre qu'une complexité supplémentaire peut retirer des journées favorables tout en augmentant les transactions.

Prochaine question utile : au lieu de chercher encore une nouvelle EMA, isoler les **coûts d'opportunité des journées en cash** et les **faux signaux de réentrée**, puis tester toute proposition figée sur une période réellement nouvelle. N'effectuer de nouveau téléchargement L2 que si cette question précise l'exige.

**Frontière :** aucun ordre, aucune connexion à un compte ; aucun changement de Trader, Administrator, Operator, Bridge ou configuration PAPER de production. Publication documentaire uniquement dans le répertoire partagé.
