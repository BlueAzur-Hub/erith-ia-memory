# Seven Heaven — Confirmation des retournements, faux signaux et coût des liquidités

**Date de recherche : 11 novembre 2026.** Étude rétrospective PAPER, à usage inter-IA. Aucun compte, aucun ordre, aucun changement du Bridge, Trader ou Administrator.

## Objectif et question testée

Mesurer si un filtrage **par deux clôtures quotidiennes concordantes** réduit les faux allers-retours entre BTC et liquidités, et déterminer si le délai introduit fait manquer des hausses. Comparer aux signaux immédiats et au contrôle Buy & Hold. La comparaison couvre trois périodes disjointes, toutes déjà consultées dans des études antérieures ; **ce n’est donc PAS un test indépendant hors échantillon**.

## Sources authentifiées et périmètre

- **16 ZIP originaux** Binance Spot BTC/USDT 1 minute, empreintes SHA-256 contrôlées par les parseurs des études canoniques précédentes ; **698 400 minutes**. Aucune lacune temporelle à l’intérieur de chaque période.
- 2024 : janvier sert de chauffage des indicateurs ; portefeuille fictif du 1er février au 31 mars (**60 jours**).
- 2025 : janvier sert de chauffage ; portefeuille du 1er février au 31 mars (**59 jours**).
- 2026 : janvier sert de chauffage ; portefeuille du 1er février au 31 octobre (**273 jours**).
- Les indicateurs utilisent uniquement la clôture UTC D et les bougies antérieures. Une décision formulée après la clôture D peut être exécutée **fictivement à l’ouverture UTC D+1**, jamais au cours de clôture qui l’a déclenchée.
- Capital fictif de 1 000 USDT par période ; une position BTC entière ou du cash, aucun levier, aucun apport ; frais 0,10 %/côté + glissement 0,05 %/côté ; contrôle avec coûts doublés. Valeur finale BTC liquidable nette des frais estimés.

## Règles figées avant comparaison

- EMA brute : état long si EMA10>EMA30 **et** clôture>EMA30 ; état opposé = liquidités.
- SuperTrend brut : ATR Wilder 14 ×3, selon le moteur canonique antérieur.
- MACD brut : MACD 12/26 positif et histogramme MACD au-dessus du signal.
- Consensus : au moins deux états positifs parmi EMA, MACD et ADX14 (ADX≥20 et +DI>−DI).
- Confirmation symétrique : attendre **2 clôtures consécutives** du même état avant de passer de BTC au cash ou inversement. La position initiale est cash tant qu’un état positif n’est pas confirmé.
- Contrôle asymétrique : sortir après 1 signal baissier, rentrer seulement après 3 signaux haussiers consécutifs. Ces règles sont évaluées rétrospectivement ; leur comparaison n’autorise pas une sélection optimale.
- Buy & Hold : achat fictif au premier jour de portefeuille, sans sortie. Tous les signaux sont construits sans étiquettes futures.

## A. Rendement net sur trois périodes distinctes

| Politique PAPER | Fév–mars 2024 | Fév–mars 2025 | Fév–oct 2026 |
|---|---:|---:|---:|
| Buy & Hold 100 % BTC | +66.90 % | -19.65 % | -1.77 % |
| EMA 10/30 brute | +45.86 % | -5.78 % | +3.24 % |
| EMA 10/30 confirmée 2 jours | +56.92 % | -4.90 % | +3.03 % |
| SuperTrend brut | +31.02 % | -25.93 % | +15.80 % |
| SuperTrend confirmé 2 jours | +41.65 % | -17.22 % | +15.86 % |
| MACD brut | +36.33 % | +0.00 % | -4.45 % |
| Consensus EMA/MACD/ADX brut | +41.60 % | +0.00 % | +8.12 % |
| Consensus confirmé 2 jours | +51.65 % | +0.00 % | +8.85 % |
| Consensus sortie 1j / entrée 3j | +34.03 % | +0.00 % | -10.40 % |

## B. Baisse maximale, opérations et jours en liquidités

| Période | Politique | Baisse maximale (daily close) | Opérations fictives | Jours en liquidités | Dont après une vente | Ventes/rachats ≤7j |
|---|---|---:|---:|---:|---:|---:|
| 2024 | Buy & Hold 100 % BTC | -15.24 % | 1 | 0/60 | 0 | 0 |
| 2024 | EMA 10/30 brute | -20.53 % | 3 | 8/60 | 1 | 1 |
| 2024 | EMA 10/30 confirmée 2 jours | -15.24 % | 1 | 8/60 | 0 | 0 |
| 2024 | SuperTrend brut | -15.24 % | 2 | 21/60 | 12 | 0 |
| 2024 | SuperTrend confirmé 2 jours | -15.24 % | 2 | 21/60 | 11 | 0 |
| 2024 | MACD brut | -10.64 % | 4 | 25/60 | 18 | 1 |
| 2024 | Consensus EMA/MACD/ADX brut | -15.99 % | 3 | 13/60 | 6 | 1 |
| 2024 | Consensus confirmé 2 jours | -15.24 % | 3 | 14/60 | 6 | 1 |
| 2024 | Consensus sortie 1j / entrée 3j | -15.36 % | 3 | 17/60 | 8 | 0 |
| 2025 | Buy & Hold 100 % BTC | -23.50 % | 1 | 0/59 | 0 | 0 |
| 2025 | EMA 10/30 brute | -5.78 % | 4 | 57/59 | 57 | 1 |
| 2025 | EMA 10/30 confirmée 2 jours | -4.90 % | 2 | 57/59 | 57 | 0 |
| 2025 | SuperTrend brut | -25.93 % | 4 | 27/59 | 27 | 1 |
| 2025 | SuperTrend confirmé 2 jours | -21.55 % | 4 | 26/59 | 26 | 1 |
| 2025 | MACD brut | 0.00 % | 0 | 59/59 | 0 | 0 |
| 2025 | Consensus EMA/MACD/ADX brut | 0.00 % | 0 | 59/59 | 0 | 0 |
| 2025 | Consensus confirmé 2 jours | 0.00 % | 0 | 59/59 | 0 | 0 |
| 2025 | Consensus sortie 1j / entrée 3j | 0.00 % | 0 | 59/59 | 0 | 0 |
| 2026 | Buy & Hold 100 % BTC | -28.69 % | 1 | 0/273 | 0 | 0 |
| 2026 | EMA 10/30 brute | -11.76 % | 24 | 163/273 | 120 | 8 |
| 2026 | EMA 10/30 confirmée 2 jours | -9.61 % | 12 | 161/273 | 117 | 1 |
| 2026 | SuperTrend brut | -14.78 % | 4 | 101/273 | 57 | 0 |
| 2026 | SuperTrend confirmé 2 jours | -15.16 % | 4 | 101/273 | 56 | 0 |
| 2026 | MACD brut | -14.37 % | 18 | 199/273 | 156 | 3 |
| 2026 | Consensus EMA/MACD/ADX brut | -14.37 % | 18 | 164/273 | 121 | 4 |
| 2026 | Consensus confirmé 2 jours | -9.65 % | 10 | 162/273 | 118 | 0 |
| 2026 | Consensus sortie 1j / entrée 3j | -12.78 % | 14 | 181/273 | 136 | 2 |

## C. Les allers-retours coûteux et les hausses manquées

- **Définition objective d’un aller-retour court** : après une vente fictive, un rachat fictif intervient dans les 7 journées UTC suivantes. On compte à part ceux où le prix BTC à l’ouverture de rachat est supérieur au prix BTC à l’ouverture de vente.
- Les journées en cash **avant tout premier achat** sont comptabilisées séparément de celles intervenant **après vente**. Il est trompeur d’appeler une première absence de position un « faux signal de sortie ».
- **Hausse manquée** : variation du prix BTC entre la vente à l’ouverture et le rachat à l’ouverture (ou dernière clôture pour une période non terminée). Cette variation **n’est pas un P&L en USDT**, ne représente pas un profit garanti, et ses pourcentages sur plusieurs fenêtres **ne s’additionnent pas** en rendement de portefeuille.
- **Protection contre les baisses** : une variation BTC négative pendant une fenêtre cash traduit une exposition évitée, mais ne garantit pas qu’une autre position aurait été rentable.
- Les données futures servant à qualifier les fenêtres de cash sont utilisées pour **évaluer** les décisions historiques, jamais pour les déclencher.

| 2026 | EMA brut | EMA 2 jours | Consensus brut | Consensus 2 jours |
|---|---:|---:|---:|---:|
| Opérations fictives | 24 | 12 | 18 | 10 |
| Rendement net % | 3.24 | 3.03 | 8.12 | 8.85 |
| Baisse maximale % | -11.76 | -9.61 | -14.37 | -9.65 |
| Jours en cash total | 163 | 161 | 164 | 162 |
| Jours en cash après vente | 120 | 117 | 121 | 118 |
| Allers-retours ≤7j | 8 | 1 | 4 | 0 |
| Allers-retours ≤7j avec hausse BTC | 8 | 1 | 4 | 0 |
| Fenêtres cash terminées sur hausse BTC | 10 | 4 | 7 | 3 |

### Exemples datés, sans transformation en signal

- **2026-07-25 → 2026-07-26** : EMA brute en cash un jour, BTC +0,37 % pendant cette fenêtre ; rachat rapide. Confirmation deux jours : pas de fenêtre équivalente. Différence évaluée après coup.
- **2026-08-12 → 2026-08-21** : EMA confirmée reste en cash neuf jours pendant que le BTC gagne environ +14,82 % entre ses points de sortie et de retour ; preuve que la confirmation peut aussi **faire manquer une forte reprise**.
- **2026-05-18 → 2026-07-19** : EMA confirmée conserve 62 jours de liquidités tandis que le BTC recule d’environ −16,30 % entre les points de sortie et de retour ; exemple d’exposition baissière évitée.
- Le consensus « sortir en 1 jour, rentrer en 3 jours » finit 2026 à −10,40 % malgré une sortie plus rapide. Sa reprise retardée peut être coûteuse ; le seuil asymétrique n’est pas une solution démontrée.

## D. Résistance au doublement des coûts

| Politique PAPER | 2024 normal → ×2 | 2025 normal → ×2 | 2026 normal → ×2 |
|---|---:|---:|---:|
| Buy & Hold 100 % BTC | +66.90 % → +66.40 % | -19.65 % → -19.89 % | -1.77 % → -2.06 % |
| EMA 10/30 brute | +45.86 % → +44.99 % | -5.78 % → -6.34 % | +3.24 % → -0.42 % |
| EMA 10/30 confirmée 2 jours | +56.92 % → +56.45 % | -4.90 % → -5.19 % | +3.03 % → +1.19 % |
| SuperTrend brut | +31.02 % → +30.62 % | -25.93 % → -26.37 % | +15.80 % → +15.11 % |
| SuperTrend confirmé 2 jours | +41.65 % → +41.22 % | -17.22 % → -17.72 % | +15.86 % → +15.17 % |
| MACD brut | +36.33 % → +35.52 % | +0.00 % → +0.00 % | -4.45 % → -7.00 % |
| Consensus EMA/MACD/ADX brut | +41.60 % → +40.75 % | +0.00 % → +0.00 % | +8.12 % → +5.24 % |
| Consensus confirmé 2 jours | +51.65 % → +50.74 % | +0.00 % → +0.00 % | +8.85 % → +7.22 % |
| Consensus sortie 1j / entrée 3j | +34.03 % → +33.22 % | +0.00 % → +0.00 % | -10.40 % → -12.27 % |

## E. Tests et limites

- **267 assertions de causalité** ont été exécutées, incluant les tests de confirmation sur petits jeux de données. Chaque état choisi sur un préfixe de la série est identique à l’état obtenu sur la série complète.
- Les 16 fichiers sources sont reconnus à leurs SHA-256 par les parseurs publiés : pas de reconstruction synthétique de prix.
- Le portefeuille BTC/liquidités ne comporte **aucune grille Spot** : cette séparation est volontaire pour isoler les faux signaux de régime.
- L’algorithme travaille sur Binance BTC/USDT, non OKX BTC/USDC ; il suppose une exécution à l’ouverture suivante, sans contraintes de carnet, frais spécifiques, limites d’ordre ou fiscalité.
- Trois fenêtres déjà exploitées par des études antérieures : **pas de holdout indépendant**, pas d’optimisation légitime ni de conclusion probabiliste. Les variantes n’établissent pas de supériorité robuste.
- Le max drawdown est mesuré **sur valorisations à clôture quotidienne**, et non à l’intérieur des bougies. Les titres « faux signal » et « hausse manquée » sont des classifications **ex post**, pas des faits disponibles en temps réel.
- La sensibilité aux coûts est un scénario, pas une prévision de frais réels ; les décisions restent fictives et aucune opération n’est envoyée à un exchange.

## F. Passation et reproduction inter-IA

- Ce rapport, le script Python, le JSON de preuves, les deux CSV et le journal de tests sont classés ensemble dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`.
- Dépendance 1 : `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py` (indicateurs et moteur de portefeuille).
- Dépendance 2 : `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py` (validations et lecture d’archives).
- Dépendance 3 : `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py` et `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py`.
- Exécution après téléchargement des ZIP originaux nommés `BTCUSDT-1m-YYYY-MM.zip` : `python SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py` (nécessite `numpy`).
- `*_PROOFS.json` : périodes, sources, paramètres, résultats par stratégie, transactions et statistiques de cash.
- `*_CASH_WINDOWS.csv` : inventaire chronologique des intervalles de cash avec durée, variations BTC et censure des fenêtres non terminées.
- `*_EQUITY_DAILY.csv` : valeur liquidable fictive quotidienne et position BTC/cash pour chaque stratégie et chaque période.
- `*_RUN_LOG.txt` : terminal des assertions et des résultats ; ne pas le confondre avec une preuve d’exécution d’ordres.

## Conclusion et piste suivante

**Deux clôtures concordantes** diminuent le bruit et le nombre de transactions sur ce sous-ensemble. La meilleure qualité apparente du consensus 2 jours en 2026 (**+8,85 %, −9,65 % de drawdown**) ne suffit pas à proclamer un modèle supérieur : il passe **162 jours sur 273 en liquidités**. Le prix peut remonter fortement pendant ces attentes. L’étude suivante doit mesurer cette stratégie sur un segment totalement inédit, avec seuils figés et sans les modifier après lecture.

**Décision : conserver en LAB/PAPER, ne pas activer de trading automatique.**
