# Seven Heaven — Matrice commune de recherche : toutes les stratégies et toutes les sources

**Date de l'inventaire : 11 novembre 2026.** **Destination :** Coffre partagé Agent-Crypto, Administrator / Trader / Operator / IA Seven Heaven.
**Statut :** photographie de la couverture documentaire et des preuves déjà produites ; aucune nouvelle performance calculée dans cette matrice ; **recherche uniquement / ordres réels interdits**.

## Décision centrale

Le laboratoire doit étudier **toutes les familles pertinentes**, pas seulement Donchian 55. Il faut toutefois distinguer :
1. les méthodes disposant d'une règle testable sur des **bougies 1D** ;
2. les méthodes nécessitant des **données intrajournalières, transactions ou carnets** ;
3. les **indicateurs** ou techniques **d'exécution**, qui ne sont pas des stratégies d'entrée/sortie autonomes ;
4. les règles d'**allocation du capital** (Buy & Hold, DCA, rééquilibrage) qui demandent un protocole de comparaison différent.

Les résultats favorables et défavorables restent dans le Coffre. Aucun classement gagnant universel.

## Deux catalogues déjà étudiés — ne pas additionner naïvement les comptes

**Catalogue historique pédagogique P01–P10 (7 novembre).** Dix protocoles : Buy & Hold, DCA mensuel à budget initial fixe, EMA 5/13, EMA 10/20, SMA 50/200, MACD 12/26/9, RSI 14 (30/55), Bollinger 20/2, Breakout 20/10 et SuperTrend 10×3. **Source :** Binance Spot BTC/USDT 1D. **Fenêtres :** chaque année 2022–2025 du 22 janvier au 31 décembre. **Capital fictif réinitialisé chaque année.** Hypothèses 0,10 % de frais et 0,05 % de glissement de chaque côté. L'étude transversale fournit bénéfice, drawdown, nombre d'opérations et cas d'échec.

**Catalogue quantitatif (10–11 novembre).** Douze variantes de signaux, plus deux témoins CASH et Buy & Hold : EMA20/50, EMA50/200, clôture > EMA200, momentum 90 jours, momentum 180 jours, cassure Donchian 20/10, cassure Donchian 55/20, cassure 20 avec filtre de tendance, repli EMA filtré, rebond RSI35 filtré, rebond RSI35 sans filtre et retour à la moyenne par écart type. **Source :** Binance BTC/USDT 1D, du 1er janvier 2019 au 30 septembre 2026, 2 830 jours observés, capital fictif **non réinitialisé chaque année**. Versions 100 % et 25 % du capital disponible lors de chaque entrée, stress de coûts doublés. Leurs règles, coûts et périodes ne sont **pas automatiquement comparables** au catalogue pédagogique P01–P10.

**Pourquoi ce n'est pas 10 + 12 = 22 stratégies indépendantes :** plusieurs familles se recoupent (moyennes mobiles, cassures, RSI, Buy & Hold), mais les paramètres et l'horizon expérimental diffèrent. Un comptage par noms masquerait le recouvrement ; une fusion des rendements serait scientifiquement trompeuse.

**Mise à jour après vérification (11 novembre) :** les **douze** méthodes quantitatives ont désormais été rejouées sur les 183 jours appariés Binance/OKX et les 224 jours continus OKX, à allocation fictive de 25 %, avec stress des coûts et contrôles de cohérence. [Rapport transversal des douze stratégies](./SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.md) — [données structurées complètes](./SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.json). **La validation n'est pas prospective.** Les neuf profils D11–D19 conservent leur statut documentaire.

### Catalogue quantitatif : état précis des douze variantes

| Code canonique | Famille | Binance 2019–2026 | Allocation 25 % testée | OKX BTC/USDC déjà contrôlé pour cette variante |
|---|---|---|---|---|
| EMA20_50 | Tendance | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| EMA50_200 | Tendance | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| PRICE_EMA200 | Tendance | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| MOM90 | Momentum | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| MOM180 | Momentum | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| DON20 | Cassures | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| DON55 | Cassures | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| DON20_TREND | Cassures filtrées | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| PULLBACK_FILTERED | Repli / swing | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| REBOUND_FILTERED | RSI / rebond | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| REBOUND_UNFILTERED | RSI / rebond sans filtre | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |
| MEANREV_Z2 | Retour à la moyenne | Oui | Oui | Oui — 183 j OKX/Binance appariés ; 224 j OKX continus |

**Témoins :** CASH et BUY_HOLD existent au catalogue canonique et doivent figurer à chaque comparaison pertinente. À ce jour, le replay indépendant OKX exhaustif des 12 règles **n'a pas été publié**. Ne jamais remplacer un « Non » par une extrapolation depuis une famille voisine.

### Profils documentaires D11–D19 : état réel, besoins de données

| Profil | Méthode | Statut de preuve du Coffre | Données supplémentaires nécessaires pour étude crédible |
|---|---|---|---|
| D11 | Spot Grid | **54 configurations auditées** sur BTC/ETH Binance 2024–oct. 2026 : durée en fourchette et ambiguïtés des bougies ; **P&L du bot non backtesté** | Archives minute / transactions, chronologie des franchissements, ordres limites effectivement remplis, inventaire total |
| D12 | Spot DCA Martingale | Documentée, **non backtestée** | Séquence intrajournalière, budgets/plafonds, liquidité, risque de ruine |
| D13 | Rééquilibrage BTC/ETH/liquidités | **Backtest historique réalisé**, Binance Spot USDT 2024–octobre 2026 | Vérification prospective / autre plateforme, autres pondérations déclarées avant test |
| D14 | Arbitrage entre marchés | Documentée, **non backtestée** | Carnets simultanés sur plusieurs places, latence, coûts et transferts |
| D15 | TWAP | Exécution, **non backtestée** | Transactions et liquidité intrajournalière, taille/temps d'exécution |
| D16 | Iceberg | Exécution, **non backtestée** | Carnets/ordres et files d'attente, remplissages et impact |
| D17 | Scalping | Documentée, **non backtestée** | Transactions minute/seconde, spread, carnet, latence et frais réels |
| D18 | VWAP | **Quatre règles testées en continu** sur BTC/ETH Binance Spot 1h (2024–octobre 2026), coûts et EMA témoin vérifiés ; pertes documentées | Confirmer les conventions avec l'UI 15m, vérifier prospectivement et, si possible, sur autre exchange |
| D19 | SAR parabolique | **Backtest historique continu réalisé** : SAR classique, lent et rapide, spot long/flat, Binance BTC/USDT et OKX BTC/USDC | Vérifier la convention SAR face au graphique Administrator ; observation prospective sans réajustement |

Les **sept guides approfondis** 01–07 couvrent ces familles, la discipline Swing et le risque. Les guides ne sont ni sept simulations distinctes, ni des profils à charger automatiquement dans Trader.

## Carte des données : Coffre d'abord, Internet pour compléter ou contredire

| Source | Couverture actuellement démontrée | Statut et bon usage |
|---|---|---|
| **Coffre public Binance Spot BTC/USDT** : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz` | **3 075** bougies 1D, du **1er mai 2018** au **30 septembre 2026** (selon le catalogue vérifié) | **Source primaire du laboratoire actuel.** Empreinte SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd` : ne pas refaire inutilement la collecte. |
| **Coffre public OKX Spot BTC/USDC** : `SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json` | **447** bougies quotidiennes UTC clôturées et consécutives, du **21 août 2025** au **10 novembre 2026** | Source indépendante exploitable sur sa fenêtre. **API /history-candles bloquée en pratique à cette profondeur pour le contrôle du 11 novembre** : ne pas prétendre disposer de 2022–2025 complets. |
| **Coffre : ZIP officiels OKX minute** | **8 archives inspectées**, échantillons juin 2022 / octobre 2023 / juin 2024 / février 2025 ; **2 journées UTC confirmées** reconstruites | Échantillonnage, **pas** une série pluriannuelle. Les drapeaux `confirm=0` 2023–2024 restent en quarantaine ; les journées UTC+8 doivent être réassemblées en UTC. |
| **Internet — Binance Data Vision** [source officielle](https://github.com/binance/binance-public-data) | Archives spot téléchargeables **quotidiennes / mensuelles**, différentes granularités | Priorité pour **prolonger** l'archive vérifiée et récupérer des séries intrajournalières authentiques. Attention : les timestamps Spot sont en **microsecondes à partir du 1er janvier 2025** ; normaliser explicitement. Chaque fichier téléchargé doit avoir URL, taille, empreinte et vérification de continuité. |
| **Internet — Kraken historique** [source officielle](https://support.kraken.com/articles/360047124832-downloadable-historical-ohlcvt-open-high-low-close-volume-trades-data) | CSV/ZIP OHLCVT historiques depuis le début de chaque marché pour les paires concernées, y compris les intervalles 1/5/15/60/240/720/1440 min indiqués par Kraken | **Candidat à une troisième source indépendante**, à qualifier paire par paire (BTC/USD, BTC/EUR, etc.) avant de promettre une continuité ou comparer les résultats. Devises de cotation différentes : ne pas fusionner les prix. |
| **Internet — OKX historique officiel** [portail](https://www.okx.com/historical-data) | Le portail présente les archives de bougies depuis juillet 2023 ; des fichiers ponctuels BTC/USDC plus anciens ont été retrouvés dans le Coffre | Vérifier **par fichier et par paire**, recouper volumes/confirm et reconstruire des journées UTC. Aucune hypothèse de couverture continue 2022–2025 sur la seule base du portail. |
| **Internet — CryptoDataDownload** [catalogue](https://www.cryptodatadownload.com/data/) | Agrégateur historique tiers ; couverture variable selon marché et instrument | **Recoupement secondaire uniquement** ; contrôler provenance, dates, devises, conditions d'utilisation. Ne pas remplacer sans trace les bougies primaires. |

**Ne pas supprimer les résultats défavorables. Ne pas fabriquer un prix manquant. Ne pas concaténer BTC/USDT, BTC/USDC, BTC/USD ou BTC/EUR comme une seule série.**

## Nouveau contrôle D13 et D18 : archives horaires BTC/ETH vérifiées

**11 novembre 2026 :** six archives Binance Spot (BTCUSDT et ETHUSDT, 2024–octobre 2026) ont été vérifiées SHA-256, 24 840 bougies horaires par actif, mêmes timestamps, aucun trou. Le backtest **D13 rééquilibrage** compare allocation passive 50/25/25, rééquilibrage mensuel et trimestriel, plus trois témoins à 1 000 USDT fictifs. La source D18 **VWAP journalier de session** est désormais qualifiée via somme des volumes de base et de cotation des bougies horaires, mais aucune stratégie VWAP n'a été simulée. D19 SAR et D11/D12/D14–D17 demeurent à auditer selon leurs spécifications.

- [Rapport D13/D18 vérifié](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.md)
- [Preuves structurées, empreintes sources, courbes et ratio VWAP](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.json)
- [Programme Python de reproduction](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.py)

**Aucun résultat n'est un rendement garanti** et le statut documentaire des autres profils est conservé. Les performances du panier BTC/ETH sont indépendantes du portefeuille BTC personnel.

## D11 — Spot Grid : audit de faisabilité sur les archives horaires vérifié

**11 novembre 2026.** Les six fichiers Binance Spot BTCUSDT/ETHUSDT ont été contrôlés (SHA-256 et 24 840 heures continues par actif). Pour chaque actif, une grille arithmétique construite sur le cours d'ouverture du 1er janvier de 2024, 2025 et 2026 a été étudiée sur neuf configurations **définies avant les résultats** : bandes fixes de ±5, ±10 et ±20 %, avec 5, 10 ou 20 intervalles. Total **54 contrôles**.

Ce travail mesure la proportion d'heures à l'intérieur / au-dessus / au-dessous de la grille, les longues sorties de fourchette, les paliers théoriquement touchés et les bougies englobant plusieurs paliers. Il **ne calcule pas de résultat de bot**, parce que les OHLC horaires ne prouvent ni l'ordre intrahoraire des passages ni un remplissage d'ordre. La limite est explicite, non un manque à combler par des données inventées.

- [Rapport : conditions où une grille fixe devient inadaptée](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.md)
- [Preuves : toutes les 54 configurations, continuité et empreintes](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.json)
- [Script reproductible](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.py)

**Suite recevable :** archives natives minute, reconstruire les passages et les deux sens possibles lorsqu'il manque l'ordre des événements, documenter frais, tailles minimales et inventaire BTC + liquidités, puis comparer la valeur totale avec Buy & Hold sur les mêmes dates. À ce stade, **D11 reste non backtestée en rentabilité**.

## D18 — VWAP : étude de signaux terminée sur BTC et ETH

Le 11 novembre 2026, les **six archives Binance Spot BTCUSDT/ETHUSDT** (2024, 2025, janvier–octobre 2026) ont été réutilisées après contrôle SHA-256 et continuité : **24 840 heures par actif**, dont février 2024–octobre 2026 testées après préchauffage.

Les **quatre règles déclarées avant les résultats** sont VWAP 300 heures glissantes HLC3 × volume, VWAP de séance UTC HLC3, VWAP quote/base 24 heures, et VWAP quote/base 24 heures filtré par EMA24/72, seuil 0,5 % et confirmation deux heures. Témoins : EMA5/13 horaire, Buy & Hold, liquidités. Allocation 100 % et 25 % des liquidités, frais/glissement, stress de frais doublés, bilan par année sans confondre avec la trajectoire continue. Toutes les pertes historiques sont conservées.

**Conclusion du contrôle :** les croisements VWAP bruts ont déclenché beaucoup de transactions et donné des résultats défavorables ; un VWAP de fenêtre n'est **pas** une stratégie autonome éprouvée. La fonction réelle de l'Administrator est un **cumul HLC3×volume sur les bougies chargées**, et non un VWAP session UTC. Notre variante glissante 300×1h est un **proxy expérimental**, pas une reproduction du graphique OKX 15m.

- [Rapport comparatif D18 — VWAP, stratégies et limites](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.md)
- [Données structurées : transactions, drawdowns, coûts et sources](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.json)
- [Script reproductible Python](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.py)

**Portée :** Binance BTC/ETH seulement, pas validation indépendante OKX, aucune garantie prospective ; les profils graphiques existants ne sont pas modifiés.

## D19 — SAR parabolique : backtest continu désormais vérifié

**Contrôle terminé le 11 novembre 2026.** Trois sensibilités **déclarées avant le test**, SAR standard 0,02/0,02/0,20, lent 0,01/0,01/0,10 et rapide 0,04/0,04/0,20, ont été testées sans vente à découvert sur Binance BTC/USDT Spot (2 830 jours 2019–sept. 2026), puis sur les 183 jours appariés Binance/OKX et les 224 jours continus OKX BTC/USDC.

L'étude **réutilise le moteur continu P01–P10** pour assurer l'égalité des frais, du capital, des dates et du témoin Buy & Hold (contrôle bit-à-bit des mesures essentielles). SAR est calculé à la clôture sur OHLC quotidien ; une opération ne peut être simulée qu'à l'ouverture suivante, **jamais au prix SAR supposé exécuté**. Les résultats des trois sensibilités, y compris les nombreux faux signaux et les stress de frais, sont conservés. **Aucune prétention de correspondance exacte au graphique Administrator en 1h.** Aucune validation prospective.

- [Rapport D19 — SAR, paramètres et comparaisons](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.md)
- [Résultats structurés, journaux d'achats et pertes, dates de retournement](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.json)
- [Script reproductible avec tests des invariants de calcul](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.py)

## Nouveau backtest continu P01–P10 : statut du 11 novembre

**Travail réalisé et vérifié :** les **dix protocoles P01–P10** ont désormais également été étudiés avec un portefeuille continu du **1er janvier 2019 au 30 septembre 2026 (2 830 jours)** sur la même archive Binance Spot BTC/USDT. Hypothèses : 1 000 USDT fictifs au départ, allocations 100 % ou 25 %, frais 0,10 % et glissement 0,05 % par côté, stress avec coûts doublés, valorisation quotidienne et stops uniquement si leur règle l'impose. **Aucun versement externe.**

**Contrôle inter-plateformes :** 183 jours appariés Binance/OKX (avril–septembre 2026) après préchauffage identique, et 224 jours OKX continu (avril–10 novembre 2026). **DCA12 n'est déployé que partiellement sur la fenêtre de 224 jours** : il reste en liquidités sur les mensualités futures.

**Règles / limitations essentielles :** les signaux P01–P10 sont **réimplémentés** selon la documentation pédagogique ; le programme source de la comparaison annuelle 2022–2025 n'était pas disponible comme exécutable dans le répertoire. Ce test continu n'est **pas une réplication exacte des anciens résultats annuels**, en particulier pour SuperTrend dont les conventions varient. Tous les résultats sont des simulations rétrospectives ; pas de preuve prospective.

- [Rapport du backtest continu P01–P10](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.md)
- [Données et journal JSON](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.json)
- [Courbes quotidiennes CSV](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.csv)
- [Moteur Python reproductible](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py)

**L'ordre du chantier restant** devient : (1) confronter précisément les conventions du nouveau moteur aux anciens profils et aux sources originales si elles sont retrouvées ; (2) vérifier la robustesse des méthodes sur d'autres périodes et sources ; (3) étudier séparément les profils D11–D19 qui exigent des données particulières. **Ne pas recommencer les tests déjà archivés à l'identique.**

## Cahier de tests commun, réutilisable par toutes les IA

Pour chaque méthode, imposer un dossier comportant :

1. **Hypothèse / stratégie précise** : règles d'entrée, sortie, horizon et calendrier, paramètres **figés** avant les contrôles.
2. **Données prouvées** : plateforme, paire, devise, fuseau, granularité, période, source, empreinte, trous et anomalies.
3. **Baselines adaptées** : Buy & Hold, liquidités, DCA régulier quand pertinent ; **même fenêtre et même capital**.
4. **Protection du capital** : allocations 100/50/25 % si pertinent, pertes maximales **journalières**, temps sous sommet, séries de pertes, performance des années difficiles ; taille de position ne doit pas être confondue avec un stop garanti.
5. **Exécution fictive réaliste** : frais / spread / glissement, gaps, délais, impossibilité de remplir un stop au cours théorique ; jamais de levier par défaut.
6. **Sensibilité / stress** : coûts doublés, fenêtres séparées, sous-périodes et changement de plateforme, avec indicateurs de qualité des données.
7. **Absence d'anticipation** : décisions sur données clôturées disponibles au moment de la décision ; distinguer apprentissage, choix de règles, contrôle rétrospectif et **véritable futur prospectif**. Ne pas baptiser « hors-échantillon » une période déjà connue et utilisée pour choisir les règles.
8. **Preuves durables** : script, rapport humain et résultats structurés dans ce répertoire partagé, avec tests GitHub. Aucun ordre réel ni modification implicite du Trader.

## Ordre opérationnel proposé — ne pas refaire l'existant

**A. Étudier horizontalement toutes les stratégies déjà chiffrées (P01–P10 et variantes quantifiées)** ; classer les protocoles, détecter les recoupements et les contradictions, conserver même les stratégies perdantes ; jamais calculer un classement global mélangeant réinitialisation annuelle et portefeuille continu.

**B. Élargir les contrôles indépendants sans bloquer le travail** : commencer par réutiliser les **447 journées OKX déjà qualifiées** pour appliquer les règles exactes **réellement transférables**, puis télécharger une **troisième source officielle** (par exemple Kraken) sur des fenêtres communes vérifiées. Les archives Binance du Coffre restent la base pluriannuelle disponible.

**C. Étudier les neuf profils documentaires dans l'ordre des données requises** : examiner d'abord les variantes journalières exprimables par des règles complètes (par exemple SAR avec entrées/sorties explicites, rééquilibrage si multi-actifs complets), puis les méthodes intrajournalières seulement si minutes et exécutions sont qualifiées. **Ne pas assigner un rendement à TWAP, Iceberg, Grid, Martingale ou scalping sur de simples bougies 1D.**

**D. Consigner les échecs, les frais et le temps de récupération**, pas seulement les gains. Réserver la mise en observation PAPER prospective à des hypothèses figées et documentées.

## Point d'entrée vers les preuves existantes

- [Encyclopédie des 19 profils, avec 10 tests historiques et 9 documentations](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md)
- [Comparaison des familles selon les régimes de marché](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILES_MARKET_REGIMES_EDUCATIONAL_COMPARISON_2026_11_07.md)
- [Étude quantitative des 12 variantes + 2 baselines, 2019–2026](./SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json)
- [Étude des 12 variantes à allocation 25 %, résultats et limites](./SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.md)
- [Validation EMA sur OKX, source indépendante](./SEVEN_HEAVEN_EMA2050_OKX_CROSSVENUE_VALIDATED_RESULTS_2026_11_10.json)
- [Validation Donchian 55 sur OKX, 447 journées validées](./SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.md)
- [Contrôle des **12** stratégies sur OKX et Binance, dates appariées et stress coûts](./SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.md)
- [Contrôle OKX multicycle : résultats non inventés, couverture insuffisante](./SEVEN_HEAVEN_OKX_BTC_USDC_MULTICYCLE_DONCHIAN55_2026_11_11.md)
- [Réparation des archives minute OKX, source limitée mais exploitable](./SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_NORMALIZATION_REPAIR_REPORT_2026_11_10.md)

## Limites et garde-fous

Cette matrice est un **inventaire documentaire fondé sur les dossiers réellement présents**, enrichi par les références officielles externes mentionnées ; ce n'est **pas une campagne de backtests nouvellement exécutée**. Les historiques et leurs interfaces peuvent évoluer après ce contrôle. L'accès aux données publiques ne donne aucun accès à un compte exchange. Les travaux restent en lecture seule pour les actifs et sans exécution réelle. Les BTC détenus personnellement en Swing / Buy & Hold restent totalement distincts des portefeuilles fictifs de recherche.
