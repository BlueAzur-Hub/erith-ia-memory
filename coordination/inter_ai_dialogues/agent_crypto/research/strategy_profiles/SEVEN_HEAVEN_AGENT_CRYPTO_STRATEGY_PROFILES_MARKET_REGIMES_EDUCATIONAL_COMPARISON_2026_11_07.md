# SEVEN HEAVEN · AGENT-CRYPTO — Comparaison pédagogique des profils selon l'état du marché

**Date :** 7 novembre 2026 · **Diffusion :** Christophe, Yoann et coordination Agent-Crypto · **Statut :** DOCUMENTAIRE / RESEARCH ONLY. Aucun ordre réel, aucune stratégie activée, aucun profil importable, aucune promesse de rendement.

> **Question centrale :** un trader observe-t-il un marché en hausse, en baisse, latéral ou instable avant de choisir *quelle hypothèse* tester ? Oui. Mais il doit définir ce diagnostic avec des informations disponibles au moment de la décision — jamais simplement parce qu'il connaît déjà le résultat de l'année.

## 1. Comment lire ce dossier

Sept **fiches approfondies** : **01 Spot Grid**, **02 DCA classique / Martingale**, **03 RSI / Bollinger**, **04 MACD / SuperTrend**, **05 Breakout et niveaux**, **06 Swing Trading**, **07 Gestion du risque**.

La [recherche historique transversale](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) examine 10 méthodes ou protocoles sur BTC/USDT. Attention : **sept fiches ≠ sept stratégies backtestées**. Certaines fiches réunissent plusieurs méthodes ; d'autres (Swing, Gestion du risque) décrivent une discipline ou un horizon sans rendement autonome.

**Trois couches à ne pas mélanger :**
1. **Observation** : à quoi ressemble le marché et que sait-on *maintenant* ?
2. **Hypothèse documentaire** : quelle famille de stratégies un trader pourrait-elle étudier dans cet environnement ?
3. **Résultat expérimental** : qu'ont produit nos règles définies sur l'archive historique, avec des coûts supposés ? Cela n'autorise pas à prédire demain.

## 2. Carte pédagogique des cinq environnements

| État observé | Signes à étudier — non suffisants à eux seuls | Familles à comprendre | Pièges principaux |
|---|---|---|---|
| **Hausse directionnelle prolongée** | Série de sommets/creux ascendants, ruptures conservées, momentum persistant | Buy & Hold, suivi de tendance EMA/MACD/SuperTrend, Breakout, swing de tendance | Vente prématurée d'une grande hausse, entrées tardives, retracements |
| **Baisse directionnelle prolongée** | Sommets/creux descendants, supports rompus, reprises faibles | Gestion de l'exposition et des liquidités ; sorties des stratégies de tendance ; DCA à budget plafonné si objectif long terme | Achats de rebond trop tôt, Martingale qui épuise le capital, stops non garantis |
| **Marché latéral / range** | Oscillations répétées entre zones, sans poursuite durable après cassure | Spot Grid *en théorie*, RSI, Bollinger, retour à la moyenne | Grille hors de sa fourchette, « survente » durable, faux croisements EMA |
| **Forte volatilité / changement de régime** | Grandes bougies, gaps, cassures vite annulées, incertitude sur le sens | Priorité à la mesure du risque ; étude des Breakouts *avec* faux signaux, prudence sur toutes les stratégies | Slippage, ordres non exécutés, séquencement intrajournalier inconnu |
| **Horizon d'accumulation long terme** | Objectif d'épargne/portefeuille, indépendamment du signal quotidien | DCA classique, Buy & Hold, rééquilibrage si plusieurs actifs fiables | Risque de perte prolongée, sous-performance du DCA en hausse, corrélations |

**Ce tableau n'est PAS un moteur de classification automatique**, ni une règle d'achat. Les états de marché peuvent coexister selon l'unité de temps : tendance hebdomadaire haussière, correction quotidienne et oscillation horaire.

## 3. Notre grille de lecture : profils d'étude, pas presets exécutables

| Profil pédagogique | Question à poser | Références du dossier | Données nécessaires | Statut |
|---|---|---|---|---|
| **A · Tendance** | La direction est-elle assez persistante pour compenser les faux signaux ? | Fiche 04 (MACD, SuperTrend), 05 (Breakout), archive EMA | Bougies clôturées, frais, signaux et sorties | EMA/MACD/ST/Breakout : tests exploratoires 1j |
| **B · Oscillation** | Les allers-retours sont-ils réellement exploitables après coûts ? | Fiches 01 (Grid), 03 (RSI, Bollinger) | Pour RSI/Bollinger : 1j possible ; pour Grid : séquence intrajournalière et remplissages | RSI/Bollinger testés ; Grid **non backtesté** |
| **C · Accumulation** | Que change l'étalement d'un budget total fixe ? | Fiche 02 (DCA régulier) et Buy & Hold | Dates, capital disponible, frais | DCA régulier et Buy & Hold : simulations 1j |
| **D · Swing** | Quel setup, quel déclencheur, quelle sortie et quelle durée ? | Fiches 05–06 | Règles explicites et gestion des gaps/stops | **Non backtesté comme stratégie autonome** |
| **R · Gestion du risque** | Quelle perte pourrait subir l'idée malgré un bon résultat final ? | Fiche 07, tous les résultats | Courbe du capital, coûts, exposition, liquidité | Revue transversale, **pas un signal d'achat** |

### Exemple : même journée, lectures différentes

Un BTC qui approche une résistance après plusieurs semaines de hausse peut faire l'objet de plusieurs *questions* :
- **Tendance / Breakout** : franchissement à la clôture, puis maintien ou retour sous le niveau ?
- **Oscillation / Grid** : avons-nous une vraie fourchette exploitable, ou le marché sort-il de sa zone ?
- **Accumulation** : faut-il acheter selon un calendrier déjà fixé, sans prétendre prévoir le sommet ?
- **Risque** : quelle exposition et quelle perte seraient envisageables si l'hypothèse était fausse ?

Ces hypothèses peuvent **se contredire légitimement**. Les fusionner sans règles explicites ne crée pas une stratégie intelligente ; cela crée un système impossible à auditer.

## 4. Ce que le Coffre a réellement montré : résultats par année

**Source et méthode :** [archive BTC réconciliée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json), **3 075** bougies Binance Spot **BTC/USDT** couvrant le 1er mai 2018 au 30 septembre 2026. Tests de **2022 à 2025**, même fenêtre annuelle **22 janvier → 31 décembre**, **1 000 USDT fictifs réinitialisés chaque année**, frais **0,10 %** par côté et glissement **0,05 %** par côté. Indicateurs préchauffés sur l'historique antérieur. Signal sur clôture ; exécution fictive à l'ouverture suivante ; Spot long uniquement, sans levier. Valorisation finale incluant une liquidation théorique lorsqu'une position reste ouverte.

Les trois colonnes « contexte » ci-dessous décrivent **la performance annuelle du Buy & Hold dans cette fenêtre**, *pas* une étiquette calculée jour par jour ni une vérité prospective.

| Méthode / protocole | 2022, détention en forte baisse | 2023, détention en hausse | 2024, détention en forte hausse | 2025, détention en baisse |
|---|---:|---:|---:|---:|
| Buy & Hold | −54,75 % | +85,03 % | +124,37 % | −17,67 % |
| DCA mensuel (budget déjà disponible) | −30,65 % | +48,02 % | +44,57 % | −12,33 % |
| EMA 5/13 | −35,97 % | +47,62 % | +79,20 % | −3,22 % |
| EMA 10/20 | −55,08 % | +51,04 % | +86,43 % | +7,56 % |
| SMA 50/200 | 0,00 % | +35,54 % | +33,35 % | −15,86 % |
| MACD 12/26/9 | −28,32 % | +25,59 % | +77,62 % | −17,02 % |
| RSI 14 : 30/55 | +7,96 % | +20,30 % | +26,50 % | −6,76 % |
| Bollinger 20/2 | −25,47 % | +44,43 % | +15,69 % | +16,12 % |
| Breakout 20/10 | −38,36 % | +26,59 % | +59,79 % | −15,62 % |
| SuperTrend 10×3 | −45,17 % | +59,19 % | +50,00 % | −14,40 % |

**Quelques contrastes significatifs, sans classement automatique :**

- **2022** : RSI 30/55 termine à **+7,96 %**, mais son **drawdown maximal atteint −40,35 %**. Un résultat final positif n'efface pas le risque subi.
- **2023 et 2024** : Buy & Hold réalise respectivement **+85,03 %** et **+124,37 %**, devant toutes les règles actives de cette simulation. En forte hausse, sortir temporairement du marché peut coûter une partie du mouvement.
- **2025** : Bollinger affiche **+16,12 %** et EMA 10/20 **+7,56 %**, pendant que Buy & Hold affiche **−17,67 %**. Ces différences ne suffisent **pas** à déclarer ces deux méthodes gagnantes pour un prochain marché.
- **SMA 50/200 en 2022** : **0,00 %** = **aucun ordre simulé**, capital resté en liquidités dans cette fenêtre ; ce n'est pas une protection assurée ou une preuve de supériorité.

### Autre indispensable : la baisse maximale temporaire (drawdown)

| Méthode | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|
| Buy & Hold | −66,73 % | −20,00 % | −26,15 % | −32,02 % |
| DCA mensuel | −37,10 % | −12,40 % | −15,18 % | −26,77 % |
| EMA 5/13 | −40,58 % | −17,66 % | −33,73 % | −22,99 % |
| EMA 10/20 | −55,94 % | −16,59 % | −24,53 % | −21,02 % |
| MACD 12/26/9 | −38,40 % | −16,43 % | −15,46 % | −22,25 % |
| RSI 14 : 30/55 | −40,35 % | −9,21 % | −11,20 % | −19,04 % |
| Bollinger 20/2 | −44,60 % | −9,71 % | −20,15 % | −20,07 % |
| Breakout 20/10 | −39,16 % | −11,98 % | −30,70 % | −29,27 % |
| SuperTrend 10×3 | −45,88 % | −20,03 % | −40,72 % | −16,91 % |

**Lecture** : en 2024, SuperTrend affiche **+50,00 %**, tout en ayant connu une baisse maximale temporaire de **−40,72 %**. Une seule performance ne décrit pas la trajectoire.

Le rapport historique transversal donne également SMA 50/200 et les nombres d'ordres. La baisse maximale est calculée sur les **clôtures quotidiennes**, net d'une liquidation hypothétique ; elle n'inclut **pas** toutes les pertes intrajournalières possibles.

## 5. Ce qu'on ne peut pas déduire de ces chiffres

1. **Pas de « meilleure stratégie selon le régime » prouvée.** Les années ont été choisies après leur réalisation ; les régimes n'ont pas été détectés en temps réel avec un algorithme défini à l'avance.
2. **Ni Spot Grid ni Martingale validées.** Les bougies quotidiennes ne renseignent pas l'ordre précis des contacts de prix dans une séance, ni la liquidité des ordres.
3. **Pas de scalping, arbitrage, Iceberg ou TWAP évalués.** Ces approches exigent d'autres sources (transactions, carnet synchronisé, profondeur, frais spécifiques).
4. **Pas de stratégie Swing autonome.** Le swing est un horizon ; aucun ensemble complet de règles avec stops, objectifs et durée maximale n'a été testé sous ce nom.
5. **Pas de levier, vente à découvert, position fractionnée par risque, fiscalité ou coût de financement** dans les chiffres. Les règles actives investissent tout le capital disponible lors du signal.
6. **Pas de validation hors échantillon** ; paramètres choisis pour apprendre, sans recherche exhaustive et sans preuve de robustesse.
7. Les 3 075 bougies 1j ont passé des contrôles basiques de dates et OHLC, **pas** un audit complet des sources ; elles ne reconstituent pas l'ordre exact des transactions.

### Risque de biais d'anticipation

Un trader ne peut pas savoir au 1er février que **toute l'année sera haussière**. Pour étudier réellement un changement de stratégie selon le régime, il faudrait **définir une classification calculable à la date du signal**, sans données futures, puis tester une procédure fixe sur d'autres périodes non utilisées pour l'inventer. Ce chantier n'est **pas** ouvert ici.

## 6. Trame commune des futurs profils — à lire, pas à importer

| Champ à documenter | Question |
|---|---|
| Nom / version / propriétaire | Qui est responsable de la description du profil ? |
| Instrument, source, devise | BTC/USDT Binance, BTC/USDC OKX ou autre ? Ne jamais mélanger ces séries. |
| Horizon | 1j, 4h, 1h, etc. — données correspondantes disponibles ? |
| Régime hypothétique | Quels signes observables *avant* la décision ? |
| Entrée / sortie exacte | Quelle clôture confirme, quelle ouverture simule, quand rester en liquidités ? |
| Risque | Stop théorique, exposition, pertes en série, drawdown, hypothèses de gaps |
| Coûts et limites | Frais, spread, glissement, disponibilité des liquidités |
| Résultats / méthode | Période commune, benchmark, nombre d'ordres, position finale |
| Validation | Réplication, sensibilités, période réellement hors échantillon |
| Statut | DOCUMENTAIRE, PAPER EXPÉRIMENTAL, LIVE INTERDIT |

## 7. Ordre de lecture conseillé

1. [07 — Gestion du risque](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_07_RISK_MANAGEMENT_POSITION_SIZING_STOPS_DRAWDOWN_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) : comprendre le budget de risque, les stops et le drawdown.
2. [02 — DCA classique versus Martingale](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_02_DCA_CLASSIC_VS_SPOT_DCA_MARTINGALE_OKX_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) : distinguer construire une position et renforcer une perte.
3. [04 — MACD / SuperTrend](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_04_MACD_SUPERTREND_TREND_FOLLOWING_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md), puis [05 — Breakout](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_05_BREAKOUT_SUPPORT_RESISTANCE_FALSE_BREAKOUT_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) : comprendre les tendances et les fausses cassures.
4. [03 — RSI / Bollinger](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_03_RSI_BOLLINGER_MOMENTUM_AND_MEAN_REVERSION_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md), puis [01 — Spot Grid](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_01_SPOT_GRID_OKX_EEA_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) : comprendre les oscillations et leurs pièges.
5. [06 — Swing Trading](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_06_SWING_TRADING_SETUPS_AND_RISK_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) : assembler contexte, signal, sortie et risque.

## Sources et autorité

- [Étude historique Seven, chiffres détaillés](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md).
- [Archive Binance BTC/USDT, index de provenance](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json).
- Fiches 01–07 : explications techniques et sources institutionnelles listées au bas de chaque document.
- Le rapport n'ouvre aucune modification du Trader, du Bridge, de l'Operator, de l'Administrator, de Notion ou du compte OKX.

**Point d'arrêt :** sept fiches classées et comparaison pédagogique publiée, sans automatisation ni exécution.
