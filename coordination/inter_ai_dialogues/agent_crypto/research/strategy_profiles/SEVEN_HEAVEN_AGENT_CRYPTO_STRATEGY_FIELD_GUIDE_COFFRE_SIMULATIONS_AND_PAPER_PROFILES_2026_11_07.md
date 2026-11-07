# Seven Heaven — Encyclopédie des stratégies crypto et premier laboratoire historique
**Édition documentaire : 7 novembre 2026.** | **Aucun ordre réel. Aucun changement du programme. Aucun accès au compte OKX.**

## Pour commencer : ce qu’un trader organise vraiment

Un trader ne choisit pas un indicateur au hasard pour cliquer sur Acheter. Il précise l’actif et la période, formule une hypothèse sur le marché, fixe ses règles d’entrée/sortie, maîtrise le capital engagé, estime les frais, teste sa méthode puis tient un journal. Ces étapes sont représentatives des démarches de recherche quantitatives ; elles ne sont pas la promesse que la méthode fonctionnera.

**Les trois grandes familles :** suivre la tendance (EMA, MACD, SMA, SuperTrend, Breakout) ; rechercher un retour à la moyenne (RSI, Bollinger, grille Spot) ; investir ou gérer une allocation dans le temps (Buy & Hold, DCA, rééquilibrage). Une quatrième famille concerne l’**exécution** (TWAP, Iceberg) ; une cinquième les marchés complexes (arbitrage, dérivés).

## Quelle différence entre indicateur, stratégie, profil et bot ?

| Terme | Rôle |
|---|---|
| Indicateur | Mesure une caractéristique du marché (EMA, RSI, Bollinger, VWAP…). |
| Stratégie | Définit exactement quand entrer, sortir, rester en liquidités et comment gérer le risque. |
| Profil | Ensemble sauvegardé de paramètres et règles, avec version et limites. |
| Backtest | Test de règles sur des données historiques et des hypothèses de frais. |
| PAPER | Simulation sans transaction réelle, en historique ou dans le flux à venir. |
| Bot | Automatise l’application de règles ; il peut engager de vraies opérations si on l’autorise. |

## Nos profils de recherche : 19 fiches, une par méthode

**Statut :** P = testé avec le Coffre ; D = fiche documentaire non chiffrée. Ce JSON n’est pas un format d’import compatible avec les profils de l’Administrator ou de l’Operator. Il ne contient aucun ordre exécutable.

### P01 — Buy & Hold · TEST EXPÉRIMENTAL
**Famille :** Investissement / conservation. **Idée :** Acheter une fois et conserver jusqu’à une date fixée.
**Règles / lecture :** Aucun indicateur nécessaire : achat fictif au départ, liquidation théorique finale.
**Quand elle peut avoir un intérêt :** Tendance haussière longue; horizon compatible avec une forte volatilité.
**Risque essentiel :** Exposition continue; drawdown élevé; prix de départ déterminant.
**Ce que l’on retient :** Retient davantage de hausse dans les fortes années haussières, mais souffre pendant les grandes baisses.

### P02 — DCA mensuel · TEST EXPÉRIMENTAL
**Famille :** Investissement / accumulation. **Idée :** Découper un budget total fixe en achats espacés; ici 12 achats mensuels de 1/12 du capital initial.
**Règles / lecture :** Achat fictif chaque 22 du mois; reste du budget en liquidités jusqu’à l’achat suivant.
**Quand elle peut avoir un intérêt :** Étaler l’entrée quand on ne connaît pas le bon moment; gestion du timing.
**Risque essentiel :** Ne protège pas contre un effondrement durable; sous-exposition en forte hausse.
**Ce que l’on retient :** Dans cette simulation le budget était entièrement réservé au départ: aucun versement externe ajouté.

### P03 — EMA 5/13 · TEST EXPÉRIMENTAL
**Famille :** Tendance rapide. **Idée :** Suivre les croisements de deux moyennes exponentielles.
**Règles / lecture :** Croisement haussier à clôture → acheter à l’ouverture suivante; croisement baissier → sortir.
**Quand elle peut avoir un intérêt :** Tendance suffisamment marquée; réaction rapide.
**Risque essentiel :** Faux croisements en marché latéral; nombreuses opérations.
**Ce que l’on retient :** Notre premier profil de référence historique V5.

### P04 — EMA 10/20 · TEST EXPÉRIMENTAL
**Famille :** Tendance intermédiaire. **Idée :** Même logique, avec des courbes un peu moins réactives.
**Règles / lecture :** Croisements des EMA 10 et 20 sur bougies clôturées; ouverture suivante.
**Quand elle peut avoir un intérêt :** Mouvements prolongés, bruit court terme moins dominant.
**Risque essentiel :** Retard des signaux; peut subir une grosse baisse avant de sortir.
**Ce que l’on retient :** Les chiffres dépendent de l’amorçage des EMA sur la préhistoire.

### P05 — SMA 50/200 · TEST EXPÉRIMENTAL
**Famille :** Tendance longue. **Idée :** Chercher les passages entre moyenne simple 50 jours et moyenne simple 200 jours.
**Règles / lecture :** Entrée au nouveau croisement 50 au-dessus 200, sortie au nouveau croisement inverse.
**Quand elle peut avoir un intérêt :** Études de cycles longs; pas de gestion de petites fluctuations.
**Risque essentiel :** Signaux très rares, retardés; rester en cash quand aucun croisement ne survient.
**Ce que l’on retient :** Le 0 % du test 2022 signifie absence de trade depuis le départ, pas succès absolu.

### P06 — MACD 12/26/9 · TEST EXPÉRIMENTAL
**Famille :** Momentum / tendance. **Idée :** Comparer l’écart entre EMA 12 et 26 à une ligne signal EMA 9.
**Règles / lecture :** Acheter sur croisement MACD au-dessus signal, sortir au-dessous.
**Quand elle peut avoir un intérêt :** Mouvements directionnels, changements de momentum.
**Risque essentiel :** Suractivité en range, nombreux faux signaux et frais.
**Ce que l’on retient :** Ce test utilise le croisement MACD/signal, pas l’histogramme seul.

### P07 — RSI 14 (30/55) · TEST EXPÉRIMENTAL
**Famille :** Retour à la moyenne. **Idée :** Étudier les excès de baisse et le rebond du momentum.
**Règles / lecture :** Acheter si RSI14 < 30 à la clôture; sortir si RSI14 > 55, exécuter au prochain open.
**Quand elle peut avoir un intérêt :** Rebond depuis une forte baisse; oscillations.
**Risque essentiel :** « Survente » peut empirer; pertes temporaires importantes possibles.
**Ce que l’on retient :** En 2022 résultat positif, mais drawdown > 40 %. Pas de stop dans ce modèle.

### P08 — Bollinger 20/2 · TEST EXPÉRIMENTAL
**Famille :** Retour à la moyenne. **Idée :** Mesurer les écarts du cours à SMA20 avec deux écarts types de volatilité.
**Règles / lecture :** Acheter si clôture sous bande basse; sortir quand clôture au-dessus de SMA20.
**Quand elle peut avoir un intérêt :** Rebond dans un marché qui oscille.
**Risque essentiel :** Une tendance baissière peut rester longtemps sous la bande; coût de maintien de position.
**Ce que l’on retient :** Une des nombreuses variantes possibles de Bollinger, pas une règle officielle unique.

### P09 — Breakout 20/10 · TEST EXPÉRIMENTAL
**Famille :** Cassure / momentum. **Idée :** Chercher la sortie d’un plus haut de 20 jours, puis gérer la sortie sur plus bas 10 jours.
**Règles / lecture :** Acheter sur clôture > plus haut des 20 séances précédentes; sortir sous plus bas des 10 précédentes.
**Quand elle peut avoir un intérêt :** Démarrage d’une tendance forte.
**Risque essentiel :** Fausses cassures, gaps, pertes en marché latéral.
**Ce que l’on retient :** Bornes calculées seulement avec les journées antérieures, sans futur connu.

### P10 — SuperTrend 10×3 · TEST EXPÉRIMENTAL
**Famille :** Tendance / volatilité. **Idée :** Associer ATR10 et multiplicateur 3 pour identifier un changement de régime de tendance.
**Règles / lecture :** Acheter lorsque direction passe rouge→verte, sortir au retour verte→rouge.
**Quand elle peut avoir un intérêt :** Phase tendance avec amplitudes soutenues.
**Risque essentiel :** Sensibilité aux conventions de calcul; retournements retardés.
**Ce que l’on retient :** Implémentation illustrative de SuperTrend; variantes d’indicateurs divergentes selon plateformes.

### D11 — Spot Grid · DOCUMENTATION
**Famille :** Grille / oscillation. **Idée :** Définir une fourchette de prix et plusieurs niveaux d’achat et de vente.
**Règles / lecture :** Ordres limites sur chaque échelon, reconstitution des niveaux après exécution.
**Quand elle peut avoir un intérêt :** Range suffisamment stable; liquidité et spreads adaptés.
**Risque essentiel :** Sortie de fourchette, immobilisation du BTC, grille exécutée à coût non réaliste.
**Ce que l’on retient :** Données quotidiennes insuffisantes pour connaître l’ordre intrajournalier des touches; pas de rendement inventé.

### D12 — Spot DCA Martingale · DOCUMENTATION
**Famille :** Renforcement à la baisse. **Idée :** Ajouter des achats, souvent de taille croissante, si le prix baisse, puis chercher une sortie globale.
**Règles / lecture :** Seuils de déclenchement + multiplicateur + budget plafond + sortie explicite.
**Quand elle peut avoir un intérêt :** Oscillations avec rebond — hypothèse qui peut échouer.
**Risque essentiel :** Consommation exponentielle du capital; longue baisse sans rebond; risque élevé.
**Ce que l’on retient :** Ne pas confondre avec le DCA régulier; non backtesté sans modèle fiable des ordres intrajournaliers.

### D13 — Rééquilibrage · DOCUMENTATION
**Famille :** Portefeuille multi-actifs. **Idée :** Rétablir des proportions cibles entre BTC, ETH et liquidités.
**Règles / lecture :** Revue à date fixe ou sur écart aux pondérations; achat et vente des composantes.
**Quand elle peut avoir un intérêt :** Portefeuille diversifié avec allocation cible documentée.
**Risque essentiel :** Frais, corrélations et baisse simultanée des actifs; besoin de cours alignés.
**Ce que l’on retient :** Ne se teste pas sérieusement avec la seule série BTC.

### D14 — Arbitrage · DOCUMENTATION
**Famille :** Prix relatifs / multi-places. **Idée :** Chercher des écarts de prix entre deux marchés ou instruments.
**Règles / lecture :** Ordres coordonnés, prise en compte du spread, transferts, funding et latence.
**Quand elle peut avoir un intérêt :** Écarts nets exécutables supérieurs aux coûts.
**Risque essentiel :** Écart disparaît avant exécution; contrepartie, liquidation et frictions.
**Ce que l’on retient :** Aucun taux de succès inventé sans carnets synchronisés et frais réels.

### D15 — TWAP · DOCUMENTATION
**Famille :** Exécution. **Idée :** Découper un gros ordre sur une période pour réduire l’impact de marché.
**Règles / lecture :** Quantité et durée fixées; séquencer des petites exécutions.
**Quand elle peut avoir un intérêt :** Ordre important relativement à la liquidité.
**Risque essentiel :** Impact, volatilité, exécution incomplète, frais.
**Ce que l’on retient :** Ce n’est pas un signal de hausse/baisse; besoin de données de microstructure.

### D16 — Iceberg · DOCUMENTATION
**Famille :** Exécution. **Idée :** Afficher seulement une fraction d’un gros ordre limite à la fois.
**Règles / lecture :** Quantité totale, part visible, règles de rechargement.
**Quand elle peut avoir un intérêt :** Limiter l’affichage d’un ordre important.
**Risque essentiel :** Risque de non-exécution et d’évolution adverse du marché.
**Ce que l’on retient :** Ce n’est pas un indicateur ni une prédiction.

### D17 — Scalping · DOCUMENTATION
**Famille :** Intraday. **Idée :** Chercher de petits mouvements à très court terme avec de nombreuses opérations.
**Règles / lecture :** Règles microstructure, carnet, limites de latence, taille et sorties.
**Quand elle peut avoir un intérêt :** Liquidité élevée, coûts très faibles et discipline stricte.
**Risque essentiel :** Frais, spread, stress, données rapides, exécution réelle différente.
**Ce que l’on retient :** Bougies quotidiennes incompatibles avec une simulation crédible du scalping.

### D18 — VWAP · DOCUMENTATION
**Famille :** Indicateur / exécution. **Idée :** Comparer un prix au prix moyen pondéré par les volumes et aux exécutions.
**Règles / lecture :** Contextualiser un prix, ou évaluer le coût de réalisation d’ordres.
**Quand elle peut avoir un intérêt :** Marché liquide et volume mesuré de façon homogène.
**Risque essentiel :** Ne produit pas seul de décision; unités et fenêtres à spécifier.
**Ce que l’on retient :** VWAP est d’abord un repère, pas une stratégie universelle.

### D19 — SAR parabolique · DOCUMENTATION
**Famille :** Indicateur / suivi. **Idée :** Points de suivi de tendance pouvant suggérer des changements de direction.
**Règles / lecture :** Définir une règle d’entrée et de sortie explicite si on veut en faire une stratégie.
**Quand elle peut avoir un intérêt :** Marché directionnel.
**Risque essentiel :** Whipsaw en range; nombreux retournements artificiels.
**Ce que l’on retient :** Affiché dans le Trader, mais aucun backtest autonome dans cette étude.

## Backtests expérimentaux du Coffre — protocole

Les 3 075 bougies quotidiennes **Binance BTC/USDT** de l’archive du 1er mai 2018 au 30 septembre 2026 ont été consultées et décompressées. Contrôles simples du fichier utilisé : 0 jour UTC manquant, 0 incohérence élémentaire O/H/L/C. Cela ne répare pas les lacunes des anciennes données minute ni ne constitue un audit complet des prix.

**Fenêtre commune :** chaque année 2022, 2023, 2024 et 2025 du 22 janvier au 31 décembre inclus, capital fictif réinitialisé à **1 000 USDT** au début de chaque année. Les indicateurs sont préchauffés sur les données antérieures (continuité des séries), mais le capital et la position recommencent à zéro à chaque fenêtre. La V5 du Trader repose sur **OKX BTC/USDC** : cette étude est indépendante, sans revendication de parité exacte.

**Exécution modélisée :** lecture des indicateurs à la **clôture quotidienne**, achat ou vente à **l’ouverture du lendemain** (pour éviter d’utiliser le futur), 0,10 % de frais + 0,05 % de glissement **par côté**. Spot acheteur seulement, jamais de vente à découvert, aucun levier. Entrées all-in pour les règles de signal (ce choix est volontairement agressif et ne doit pas servir de recommandation de taille de position). Le capital final et la courbe sont valorisés au cours de clôture, net d’une sortie théorique si le BTC est encore détenu.

**DCA :** 1 000 USDT sont réservés dès le premier jour, puis un douzième est acheté à la même date du mois (le 22). L’argent non encore investi reste en réserve, sans rendement. Ce protocole n’ajoute pas de nouveaux dépôts, contrairement à un DCA d’épargne classique. La comparaison mesure un étalement du même budget, pas des versements supplémentaires.

**SuperTrend :** version de recherche utilisant ATR de Wilder sur 10 jours et multiplicateur 3. Les plateformes peuvent employer des règles légèrement différentes. **Drawdown :** calculé aux clôtures sur la valeur liquidable, jamais à partir des creux intrajournaliers. Les tarifs Maker ne sont pas supposés ; les frais fictifs restent ceux de type Taker 0,10 % sur chaque côté.

### Performance annuelle fictive (%), même capital initial

| Méthode | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|
| Buy & Hold | -54.75 | +85.03 | +124.37 | -17.67 |
| DCA mensuel | -30.65 | +48.02 | +44.57 | -12.33 |
| EMA 5/13 | -35.97 | +47.62 | +79.20 | -3.22 |
| EMA 10/20 | -55.08 | +51.04 | +86.43 | +7.56 |
| SMA 50/200 | 0.00 | +35.54 | +33.35 | -15.86 |
| MACD 12/26/9 | -28.32 | +25.59 | +77.62 | -17.02 |
| RSI 14, entrée 30 / sortie 55 | +7.96 | +20.30 | +26.50 | -6.76 |
| Bollinger 20/2 | -25.47 | +44.43 | +15.69 | +16.12 |
| Breakout 20/10 | -38.36 | +26.59 | +59.79 | -15.62 |
| SuperTrend 10×3 | -45.17 | +59.19 | +50.00 | -14.40 |

### Drawdown maximal sur la valeur liquidable à la clôture (%)

| Méthode | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|
| Buy & Hold | -66.73 | -20.00 | -26.15 | -32.02 |
| DCA mensuel | -37.10 | -12.40 | -15.18 | -26.77 |
| EMA 5/13 | -40.58 | -17.66 | -33.73 | -22.99 |
| EMA 10/20 | -55.94 | -16.59 | -24.53 | -21.02 |
| SMA 50/200 | 0.00 | -20.00 | -12.57 | -24.38 |
| MACD 12/26/9 | -38.40 | -16.43 | -15.46 | -22.25 |
| RSI 14, entrée 30 / sortie 55 | -40.35 | -9.21 | -11.20 | -19.04 |
| Bollinger 20/2 | -44.60 | -9.71 | -20.15 | -20.07 |
| Breakout 20/10 | -39.16 | -11.98 | -30.70 | -29.27 |
| SuperTrend 10×3 | -45.88 | -20.03 | -40.72 | -16.91 |

### Nombre d’opérations simulées (achats + ventes)

| Méthode | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|
| Buy & Hold | 1 | 1 | 1 | 1 |
| DCA mensuel | 12 | 12 | 12 | 12 |
| EMA 5/13 | 22 | 24 | 18 | 20 |
| EMA 10/20 | 16 | 13 | 14 | 14 |
| SMA 50/200 | 0 | 3 | 1 | 2 |
| MACD 12/26/9 | 26 | 22 | 24 | 29 |
| RSI 14, entrée 30 / sortie 55 | 8 | 4 | 4 | 3 |
| Bollinger 20/2 | 12 | 12 | 10 | 18 |
| Breakout 20/10 | 10 | 9 | 11 | 10 |
| SuperTrend 10×3 | 10 | 5 | 10 | 8 |

### Leçons de ces résultats — et pourquoi il ne faut pas classer les stratégies

1. **2022 :** dans cet exemple, RSI 30/55 termine à +7,96 % tandis que Buy & Hold perd 54,75 %. Pourtant RSI subit temporairement −40,35 % : résultat final positif ne signifie pas faible risque.
2. **2023 et 2024 :** Acheter et conserver surpasse la plupart de nos stratégies actives parce que le BTC progresse longtemps ; sortir périodiquement coûte une partie de la tendance.
3. **2025 :** Bollinger 20/2 affiche +16,12 %, mais il ne faut pas choisir Bollinger **parce que** cette seule année lui convient. Ce serait sélectionner a posteriori.
4. **SMA50/200 en 2022 :** 0 % signifie **aucun croisement déclencheur dans la fenêtre**, donc liquidités conservées, sans profit réalisé. Ce n’est pas un rendement assuré.
5. **EMA10/20 en 2023 :** +51,04 % ici, contre +64,84 % dans l’ancien rapport à amorçage annuel. Le changement s’explique par le préchauffage continu et les signaux d’entrée; il ne faut pas mélanger les deux protocoles.
6. Les règles ont été choisies à titre pédagogique et leur comparaison a été calculée sur des années déjà connues. **Il n’existe pas de validation hors échantillon indépendante** : aucune estimation de performance future, aucune stratégie déclarée optimale.

## Pourquoi certaines stratégies ne sont pas chiffrées

| Méthode | Données réellement nécessaires | Pourquoi nos bougies 1j ne suffisent pas |
|---|---|---|
| Grille Spot | Ordre intrajournalier des touches de niveaux, exécutions, limites et tailles | Une bougie 1j ne dit pas si le haut ou le bas est arrivé en premier. |
| Martingale Spot | Séquence précise des achats, plafonds, remplissages et liquidité | La baisse continue et les ordres de sécurité changent radicalement le risque. |
| Scalping | Carnet, spreads, latence, transactions à la seconde/minute | L’OHLC quotidien masque l’essentiel des coûts. |
| Arbitrage | Deux marchés synchronisés, frais, transferts, financement et exécution | Une seule paire ne révèle pas d’écart exécutable. |
| Rééquilibrage | Série datée et fiable de tous les actifs du panier | On n’a chargé que BTC pour ces tests. |
| TWAP / Iceberg | Historique de carnets et exécutions par tranche | Ce sont principalement des outils d’exécution, pas des signaux directionnels. |

## Trois profils d’étude PAPER — non destinés au compte réel

**Profil A — Tendance claire.** Graphique 1j, EMA 5/13 ou 10/20, confirmation à la clôture, simulation au lendemain, mesure des frais et des jours exposés. Question : « La tendance est-elle assez durable pour compenser les faux croisements ? » **Ne pas utiliser tel quel pour engager le capital réel.**

**Profil B — Marché qui oscille.** Graphique 1j, RSI 14 (seuils pédagogiques 30/55) et Bollinger 20/2 étudiés séparément. Question : « Combien de fois un signal de survente précède-t-il encore une forte baisse ? » Les deux stratégies ne doivent pas être fusionnées sans définition précise de la logique ET/OU.

**Profil C — Accumulation de long terme.** Comparer un achat unique à douze achats mensuels sur budget prédéfini. Question : « Quel écart de rendement et de drawdown apparaît si les achats sont étalés ? » Ne pas confondre DCA classique et Martingale.

## Comment un trader sérieux construit une stratégie — méthode reproductible

1. **But :** investir, spéculer, réduire l’exposition ou exécuter un ordre ? Fixer la monnaie de référence et l’horizon.
2. **Conditions de marché :** tendance haussière, baissière, range, volatilité élevée, volume et qualité de source.
3. **Règles testables :** préciser les paramètres, à quelle clôture le signal devient valide, le prochain prix d’exécution, les entrées et les sorties.
4. **Risque :** perte maximale tolérable, exposition maximale, taille des positions, position non clôturée, arrêt si les données deviennent incohérentes.
5. **Coûts :** frais, spread, glissement, slippage variable, coût de financement éventuel et taux de change. Ne pas supposer la meilleure exécution.
6. **Rétrotest :** différentes phases de marché, drawdown, fréquence des opérations, rendement net, benchmark passif, périodes sans position.
7. **Validation :** périodes jamais utilisées pour calibrer les paramètres, puis PAPER prospectif avec un journal des décisions et des écarts au modèle.
8. **Discipline :** pas d’activation de trading réel sans décision spécifique, sécurité, limites et contrôles humains. Un bot est seulement une automatisation des règles.

### Notre fiche de profil idéale

Nom et version | instrument et marché | source et devise | famille | hypothèse | horizon | indicateurs et paramètres | règles d’entrée et de sortie | signaux confirmés uniquement | taille maximale et risques | frais et glissement | période testée | rendement et drawdown | validation indépendante | propriétaire (Administrator/Operator/Yoann) | état (documentaire/PAPER/live interdit).

### Attention aux chiffres des slides d’illustration précédentes

Les slides néon réalisées dans notre fil sont des **supports pédagogiques illustrés**, pas des exports chiffrés du Trader. En particulier, la diapositive « Ce que veut probablement Yoann » comportait des exemples graphiques de performance / drawdown / nombre de trades qui **ne doivent pas être présentés comme des mesures vérifiées**. Pour les chiffres authentifiés du Trader du 7 novembre, la capture montrait EMA 5/13 **+12,15 %** et Buy & Hold **−14,36 %** sur BTC/USDC du 25 janvier au 5 novembre 2026 ; cela ne constitue pas une preuve de rentabilité future et ne se compare pas directement aux simulations BTC/USDT de cette étude.

## Notes de provenance et limites

- [Coffre BTC réconcilié, index public](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json).
- [Dossier de coordination Agent-Crypto](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto).
- [OKX Europe — Bots, périmètre EEE (27 août 2026)](https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them) : documentation mentionnant surtout Spot Grid et Spot DCA Martingale. Vérifier les fonctionnalités réellement disponibles par compte.
- [OKX Europe — Grille Spot](https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it).
- [OKX Europe — DCA Spot Martingale](https://www.okx.com/fr-fr/help/whats-spot-dca-martingale-bot-and-how-to-use-it).
- [OKX Europe — TWAP](https://www.okx.com/fr-fr/help/how-do-i-use-the-twap-trading-bot).
- [CFA Institute — Backtesting & Simulation 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/backtesting-and-simulation) : analyse de scénarios, validation et pièges méthodologiques.
- [SEC Investor.gov — Performance Claims](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-47) : une performance backtestée est hypothétique, le passé ne prédit pas les rendements futurs.

**Ne pas confondre les instruments :** l’étude utilise BTC/USDT Binance, alors que le Trader affiche BTC/USDC OKX. L’archive testée s’arrête en septembre 2026 et ne remplace pas les données live de novembre. Les rendements sont des variations de capital fictif, sans fiscalité ni coûts de transferts, ni recalibrage des paramètres. Les comparaisons restent exploratoires et n’autorisent aucune décision automatique.

**Statut final :** dossier de recherche publié dans le répertoire GitHub partagé, sans modification Notion et sans modification de l’Administrator, de l’Operator, des profils réels ni des clés OKX. Prochaine étude éventuelle : vérifier la stabilité des règles sur d’autres points d’entrée et des périodes gelées sans optimiser les paramètres, avant toute utilisation PAPER prospective.