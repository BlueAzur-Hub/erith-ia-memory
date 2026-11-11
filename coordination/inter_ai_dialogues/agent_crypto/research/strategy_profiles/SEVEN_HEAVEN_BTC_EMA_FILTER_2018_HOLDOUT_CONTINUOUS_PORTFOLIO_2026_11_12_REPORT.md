# Seven Heaven — EMA 10/30 BTC : contrôle 2018 et portefeuilles continus 2018–2021

**12 novembre 2026 · Recherche rétrospective PAPER · Aucun ordre réel · Paramètres non ajustés après publication du protocole.**

## 1. Question et source vérifiée

La consolidation d'épisodes de rebond 2019–2026 laissait entrevoir un avantage descriptif lorsque les EMA étaient haussières. Cette étude demande (a) si l'année **2018, non utilisée dans cette sélection**, apporte une confirmation événementielle ; et (b) ce que donne **une politique différente**, exposée à 100 % au BTC seulement quand EMA10 > EMA30 et clôture > EMA30, sur un portefeuille qui passe de BTC à USDT sans rechargement mensuel.

Le protocole a été figé et publié avant l'analyse des performances (commit GitHub `3f831c1fabecb7fd9b5c0c57a2fddfc50d22cdff`).

- Série source : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz`, Binance Spot **BTCUSDT**, 3 075 journées du 1er mai 2018 au 30 septembre 2026, empreinte SHA-256 vérifiée `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`.
- Série quotidienne : certains jours sont récupérés auprès des archives officielles natives 1d et **5 881 minutes d'origine restent manquantes**. Ce n'est pas un historique minute complet.
- Calcul EMA initialisé le 1er mai 2018. Premier placement fictif possible le 31 mai ; signal observé après clôture t, achat ou vente fictif à l'ouverture t+1, jamais avant.
- Portefeuille initial fictif 1 000 USDT ; commission 0,10 % et glissement 0,05 % par opération (doublement en stress). Valeurs finales **liquidables**, après coût de liquidation hypothétique des BTC restants.
- Références : Buy & Hold BTC 100 %, Buy & Hold 50 % BTC + 50 % USDT, et 100 % USDT.

## 2. Résultats du contrôle historique 2018 (mai–décembre)

| Politique | Capital final liquidable | Rendement net | Baisse maximale de la valeur liquidable | Transactions fictives |
|---|---:|---:|---:|---:|
| EMA10/30 + filtre de clôture | **804,69 USDT** | **−19,53 %** | **−29,05 %** | **10** |
| Buy & Hold 100 % BTC | 500,10 USDT | −49,99 % | −61,75 % | 1 achat |
| Buy & Hold 50 % BTC | 750,05 USDT | −24,99 % | −32,82 % | 1 achat |
| 100 % USDT | 1 000 USDT | 0,00 % | 0 % | 0 |

La politique EMA a été exposée au BTC seulement **14,88 %** des 215 journées du test 2018. Elle a limité les pertes par rapport au Buy & Hold, mais **n'a pas dégagé de bénéfice** et a été moins favorable qu'une position intégralement en USDT pendant cette baisse. L'exposition limitée explique une part essentielle de la protection : comparer avec le témoin cash est indispensable.

Avec des coûts d'opération doublés, le rendement EMA de 2018 devient **−20,73 %**, sans renversement du bilan.

## 3. Le test événementiel 2018 NE valide PAS « C3 + EMA »

Définition conservée : après un recul d'au moins 2,5 % depuis le sommet des 30 clôtures précédentes, première clôture haussière J0 ; confirmation si J0/J+1/J+2 montent strictement ; la tendance EMA est vérifiée à la clôture de J+2. Les rendements fictifs (s'il y a entrée) se mesurent de l'ouverture de J+3 à la clôture de J+10.

- 18 reprises candidates en 2018, dont certaines peuvent être censurées par la fin de l'année.
- **3 reprises C3** évaluables, **0** parmi elles avec EMA haussière au moment de la décision.

Ce contrôle ne peut donc **ni confirmer ni infirmer un bénéfice additionnel de l'EMA parmi les rebonds C3 de 2018**. Un tableau sans cette précision serait trompeur. En particulier, les meilleurs résultats du portefeuille EMA d'une année baissière ne prouvent pas que l'EMA aide à distinguer les bons rebonds après trois clôtures.

## 4. Expériences annuelles distinctes (descriptives, capital réinitialisé par expérience)

| Période | EMA 10/30 | Buy & Hold 100 % BTC | Buy & Hold 50 % BTC |
|---|---:|---:|---:|
| 2018 mai–décembre | −19,53 % | −49,99 % | −24,99 % |
| 2019 | +84,27 % | +93,82 % | +46,91 % |
| 2020 | +267,57 % | +300,78 % | +150,39 % |
| 2021 | +78,83 % | +59,31 % | +29,66 % |

2019, 2020 et 2021 **ne sont pas de nouveaux holdouts** : ces années ont déjà servi à l'apprentissage de l'EMA dans des recherches précédentes. Ces expériences permettent uniquement de comprendre sa sensibilité aux régimes de marché. Les valeurs de ce tableau ne doivent **pas** être additionnées pour calculer le portefeuille continu.

## 5. Portefeuille continu du 31 mai 2018 au 31 décembre 2021

Capital fictif initial : **1 000 USDT**, jamais remis à zéro. Les courbes quotidiennes détaillées sont publiées en CSV.

| Politique | Capital final | Rendement total | Pire baisse liquidable |
|---|---:|---:|---:|
| EMA10/30 + clôture | **9 775,87 USDT** | **+877,59 %** | **−44,35 %** |
| Buy & Hold 100 % BTC | 6 241,94 USDT | +524,19 % | −63,34 % |
| Buy & Hold 50 % BTC | 3 620,97 USDT | +262,10 % | −47,60 % |
| 100 % USDT | 1 000 USDT | 0 % | 0 % |

La politique EMA réalise **70 opérations fictives** sur cette séquence complète et détient du BTC pendant environ **48,36 %** des journées. Avec doublement des coûts, son rendement est **+780,05 %**, contre +877,59 % en coûts standards. La surperformance face au Buy & Hold sur **ce seul chemin historique** ne démontre pas une stratégie gagnante future : 2018–2021 combine un fort marché baissier initial et une hausse massive ultérieure. Le risque de sélection de période est majeur.

La perte de capital maximale de **44,35 %** reste considérable et ne doit pas être minimisée par le rendement final. Les risques de stablecoin, de plateforme et de disponibilité d'exécution ne sont pas modélisés.

## 6. Lecture scientifique de la divergence

- **2018 :** l'EMA réduit l'exposition à une forte baisse, mais elle reste perdante et est inférieure à 100 % cash.
- **2019 et 2020 :** le Buy & Hold capte davantage la hausse que l'EMA, qui peut manquer des reprises.
- **2021 :** l'EMA obtient un meilleur résultat sur cet intervalle annuel.
- **2018–2021 continus :** le chemin particulier du marché et l'ordre des pertes et des gains favorisent le filtre EMA. Cela ne valide pas automatiquement le filtrage des rebonds C3 par EMA : le test événementiel 2018 contient **zéro épisode C3+EMA**.

**Décision de recherche :** ne pas transférer ce filtre en trading automatique. Son comportement mérite un test sur un autre actif ou une nouvelle période indépendante, avec règles inchangées, qualité source confirmée, et analyses de coût d'opportunité pendant les journées en liquidités.

## 7. Reproduction et limites

- `SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12.py` : programme autonome Python lisant la source gzip canonique et vérifiant son empreinte, sans réseau ou identifiants de compte.
- `*_PROOFS.json` : résultats, période et paramètres, transactions et calculs de portefeuille.
- `*_EQUITY_DAILY.csv` : valeurs liquidables quotidiennes des quatre politiques sur la période continue, coûts standards et doublés.
- `*_TRADES.csv` : transactions fictives réalisées dans la simulation continue.
- `*_2018_REBOUND_EVENTS.csv` : reprises candidates du contrôle 2018, cas censurés et filtres EMA.
- Contrôles effectués dans l'environnement de calcul JavaScript : empreinte gzip, 3 075 journées consécutives, fenêtres et 10 contrôles de calcul indicateur sur préfixes. Le programme Python a été **compilé syntaxiquement et exécuté sur un jeu synthétique** ; sa reproduction intégrale avec le gzip canonique dans cet environnement Python reste à effectuer, faute d'accès binaire du conteneur. Une autre IA peut l'exécuter à partir de l'archive canonique du dépôt.

**Statut : PAPER / recherche reproductible / pas de conseil financier / aucun ordre réel / Administrator, Trader, Operator et Bridge inchangés.**
