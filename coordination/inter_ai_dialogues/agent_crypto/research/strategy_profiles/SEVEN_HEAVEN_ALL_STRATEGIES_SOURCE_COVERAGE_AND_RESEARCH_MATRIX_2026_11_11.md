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
| D11 | Spot Grid | Documentée, **non backtestée** | Bougies fines, chronologie des niveaux, exécutions et ordres limites |
| D12 | Spot DCA Martingale | Documentée, **non backtestée** | Séquence intrajournalière, budgets/plafonds, liquidité, risque de ruine |
| D13 | Rééquilibrage BTC/ETH/liquidités | Documentée, **non backtestée** | Plusieurs actifs alignés dans le temps, frais et allocation cible |
| D14 | Arbitrage entre marchés | Documentée, **non backtestée** | Carnets simultanés sur plusieurs places, latence, coûts et transferts |
| D15 | TWAP | Exécution, **non backtestée** | Transactions et liquidité intrajournalière, taille/temps d'exécution |
| D16 | Iceberg | Exécution, **non backtestée** | Carnets/ordres et files d'attente, remplissages et impact |
| D17 | Scalping | Documentée, **non backtestée** | Transactions minute/seconde, spread, carnet, latence et frais réels |
| D18 | VWAP | Indicateur/repère, **pas de règle autonome évaluée** | Volume et fenêtre définis ; convertir en stratégie seulement avec entrée/sortie spécifiées |
| D19 | SAR parabolique | Indicateur/repère, **pas de règle autonome évaluée** | Choix explicite des règles d'entrée/sortie ; données journalières possibles selon protocole |

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
