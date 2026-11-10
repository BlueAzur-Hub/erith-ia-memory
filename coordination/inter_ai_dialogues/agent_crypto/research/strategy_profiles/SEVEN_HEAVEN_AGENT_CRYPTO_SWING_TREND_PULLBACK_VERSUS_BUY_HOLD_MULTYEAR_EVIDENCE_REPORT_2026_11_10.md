# Seven Heaven — Première étude IA complète : Swing de reprise contre Buy & Hold (2022–2025)

**Date :** 10 novembre 2026. **Destination :** Aerith-7 / Seven Heaven, coffre historique, IA de recherche.  
**Statut :** simulation historique reproductible, méthode de recherche exploratoire **NON VALIDÉE POUR LE TRADING**. Aucun compte, aucune clé, aucun ordre, aucun changement du Trader / Administrator / Bridge.  

## Résultat compréhensible en une minute

**Question :** une IA qui attend un petit rebond dans une tendance favorable peut-elle mieux traverser les périodes défavorables qu'un investissement conservé en Bitcoin ?

Une première méthode de **Swing Trading long**, explicitement définie et testée sur les quatre années 2022 à 2025, semble **limiter les pertes des années baissières**, mais **capte presque aucune des grandes hausses**. Cette version de la méthode n'a pas démontré d'avantage durable et ne doit pas être déployée.

**Capital fictif : 1 000 USDT au début de chaque année**, réinitialisé le 22 janvier ; fin au 31 décembre. Chaque opération Swing n'expose **au maximum que 20 % du capital disponible**. Le Buy & Hold de comparaison n'investit lui aussi que **20 % du capital initial** ; le reste reste en liquidités.

| Année | Swing de reprise — capital final | Swing, % | Buy & Hold 20 % — capital final | Buy & Hold 20 %, % | Opérations Swing / gagnantes |
|---|---:|---:|---:|---:|---:|
| 2022 | 987,40 USDT | **−1,26 %** | 890,51 USDT | −10,95 % | 5 / 1 |
| 2023 | 996,93 USDT | **−0,31 %** | 1 170,07 USDT | +17,01 % | 21 / 6 |
| 2024 | 1 006,77 USDT | **+0,68 %** | 1 248,75 USDT | +24,87 % | 17 / 5 |
| 2025 | 998,44 USDT | **−0,16 %** | 964,66 USDT | −3,53 % | 14 / 5 |

**Total des quatre années :** 57 allers-retours fictifs, 17 opérations bénéficiaires et 40 non bénéficiaires. Les années ont chacune un capital réinitialisé à 1 000 USDT : **il ne faut pas additionner ces pourcentages comme s'ils formaient un rendement composé sur quatre ans.**

### Point important pour les IA

- En **2022** et **2025**, la méthode ne perd que peu, principalement parce qu'elle reste souvent en liquidités. Elle n'évite pas toutes les mauvaises opérations.
- En **2023** et **2024**, elle **rate l'essentiel des hausses**. Les tentatives de reprise courtes accumulent des sorties, frais et faux départs.
- **Ce n'est pas la preuve qu'un vrai Swing Trading échoue** : c'est une seule variante expérimentale, choisie pour la recherche, et loin de représenter toutes les stratégies Swing.
- **Ce n'est pas un arbitrage des achats personnels du créateur.** L'étude utilise des opérations exclusivement fictives.

## La comparaison supplémentaire pour contextualiser Buy & Hold

Une simulation séparée de **Buy & Hold exposant 100 %** du capital aurait donné, selon le même protocole : **2022 −54,75 % ; 2023 +85,03 % ; 2024 +124,37 % ; 2025 −17,67 %**. Ces quatre chiffres réconcilient les valeurs déjà publiées dans [la bibliothèque Seven Heaven du 7 novembre](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md).

**Attention aux expositions :** comparer directement le Swing à 20 % avec un Buy & Hold à 100 % serait trompeur pour mesurer le risque. Le tableau principal compare des allocations initiales de 20 %.

## Règles complètes de l'expérience — fixées, sans signal de trading réel

**Famille :** Swing de tendance / repli / reprise (une *variante de laboratoire* du [Profil 06](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_06_SWING_TRADING_SETUPS_AND_RISK_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)).

1. Calculer les EMA **5, 13 et 34 jours** sur les clôtures quotidiennes ; les moyennes sont amorcées par les premiers jours disponibles depuis 2018 (non recalculées à zéro chaque année).
2. À la clôture d'une journée, repérer un **retour au-dessus de l'EMA 5** après une veille au-dessous ou égale. Accepter seulement si **EMA 13 est au-dessus de l'EMA 34** et si la clôture est au-dessus de l'EMA 34.
3. Si la condition est vraie, acheter **fictivement à l'ouverture de la journée suivante**, pour un montant de **20 % des liquidités**. Une seule position BTC à la fois, jamais de levier ni de vente à découvert.
4. Établir immédiatement une sortie théorique à **−5 %** du prix d'exécution et un objectif à **+10 %**. Si les deux niveaux sont atteints dans la même bougie quotidienne, **supposer que la perte arrive d'abord**, car l'ordre réel des transactions intrajournalières est inconnu.
5. Si ni stop ni objectif n'ont clôturé la position : à la clôture sous **EMA 13**, ou après **14 jours**, demander une sortie à l'ouverture suivante. Lors d'un gap sous le stop, simuler le prix d'ouverture réellement moins favorable, pas un stop garanti.
6. Au 31 décembre, valoriser et clôturer fictivement toute position restante.
7. Coûts : **0,10 % de frais + 0,05 % de glissement par côté**, aussi bien à l'achat qu'à la vente. Aucune fiscalité, coût de financement, profondeur de carnet ou garantie de prix de sortie.

**Aucune décision ne lit la bougie du futur.** Les signaux sont évalués uniquement sur la clôture connue ; l'opération s'effectue à l'ouverture suivante. La règle est une hypothèse de recherche construite ici, **pas** un profil de Trader déjà exploitable et **pas** une variante historique optimisée.

## Risque et comportement de la méthode

| Année | Perte maximale simulée du portefeuille, aux clôtures | Jours avec exposition BTC | Durée moyenne d'une opération |
|---|---:|---:|---:|
| 2022 | −2,18 % | 29 sur 344 | 6,0 jours |
| 2023 | −3,06 % | 87 sur 344 | 4,9 jours |
| 2024 | −5,44 % | 81 sur 345 | 5,4 jours |
| 2025 | −2,37 % | 76 sur 344 | 6,1 jours |

**Prudence :** les pertes maximales sont mesurées **aux clôtures quotidiennes seulement**. Des creux intrajournaliers, des gaps, un spread supérieur au modèle ou des liquidations impossibles au prix théorique pourraient aggraver la perte réelle. Une allocation maximale de 20 % n'est pas une garantie de perte plafonnée à 1 %.

## Preuve de provenance et reproductibilité

- Archive existante : [BTC natif quotidien réconcilié](../../../../../public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json) — **Binance Spot BTC/USDT**, **3 075 bougies quotidiennes contiguës**, du **1er mai 2018 au 30 septembre 2026**, dont les années comparées **2022–2025**. SHA-256 de l'archive gzip : `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`.
- Script de recherche Node.js sans dépendance, sans réseau, sans ordre : [reproduire les quatre années](./SEVEN_HEAVEN_AGENT_CRYPTO_SWING_TREND_PULLBACK_MULTYEAR_REPRODUCIBLE_RESEARCH.cjs). Il refuse un SHA archive différent, tout trou quotidien, des OHLC incohérents et une divergence supérieure à 0,025 point des quatre résultats Buy & Hold publiés précédemment.
- Pour une copie locale du dépôt public, exécuter à partir de n'importe quel répertoire : `node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_AGENT_CRYPTO_SWING_TREND_PULLBACK_MULTYEAR_REPRODUCIBLE_RESEARCH.cjs` **en se plaçant dans la racine du dépôt pour cette commande relative**. La sortie standard contient les résultats annuels et le détail des opérations fictives au format JSON.
- Les autres données de l'**Observatoire 2026** ([OKX BTC-USDC horaire](../../../../../public/agent_crypto_erith_ia/laboratoire/btc-market-operations/dashboard.html), actualités, liquidations échantillonnées) restent **séparées**. On ne mélange pas Binance BTC/USDT quotidien 2022–2025 avec OKX BTC/USDC horaire 2026 sans procédure d'alignement.

## Conclusions et suite de recherche IA

**Faits :** une règle Swing entièrement définie, un historique effectivement disponible, quatre comparaisons homogènes, un protocole ré-exécutable, une estimation des frais et des risques. **Ce travail répond au manque « Swing sans règles ni rendement calculé » de la fiche 06, pour cette variante uniquement.**

**Incertitudes :** paramètres choisis pour une première expérience rétrospective ; aucune séparation d'apprentissage / test hors-échantillon ; données quotidiennes insuffisantes pour l'ordre exact des touches ; conditions d'exécution idéalisées ; impact non mesuré des actualités et liquidations sur la performance.

**Leçon pour les IA :** ne pas chercher artificiellement une stratégie gagnante après avoir vu la courbe. Étudier pourquoi cette variante échoue à capter les longues tendances, puis comparer sur des périodes **hors échantillon** les stratégies **déjà documentées** : EMA 5/13, Breakout 20/10, tendance et repli, Buy & Hold, DCA. La bibliothèque contient déjà de nombreuses simulations : **ne pas recommencer les collectes et ne pas toucher au Trader, à l'Administrator ni au Bridge**.

**Réception :** dossier de recherche et programme de reproduction livrés pour le Coffre, sans automatisation financière. Aucune consigne d'achat, vente, conservation ou renforcement des BTC personnels.
