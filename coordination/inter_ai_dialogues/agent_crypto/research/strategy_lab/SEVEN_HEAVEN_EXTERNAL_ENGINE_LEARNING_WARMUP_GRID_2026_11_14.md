# Seven Heaven — Apprentissage inter-moteurs : préchauffage et granularité Grid
14 novembre 2026 · Recherche PAPER · complément aux audits des dix versions · Aucun changement du code applicatif

## Périmètre et preuves
Étude ciblée des archives fournies, non lecture exhaustive de Freqtrade/Hummingbot et non exécution de ces moteurs externes :
- Lab V4.5 ZIP SHA-256 `3393b13d8a3ce252ca0d2d7c6bce02c6d7eb9fae803009be4f008ef81cf33b5c`.
- Freqtrade develop ZIP SHA-256 `6143b75fa418362c5de00388faaaff008900a2f778e77a73b31361423e25a453`.
- Hummingbot master ZIP SHA-256 `6ceef7884b54ac7b3e2f156411249f58f78a079e2f9b6b6717aabc81f4ea6cfd`.
Les expériences suivantes ont été exécutées localement sur données synthétiques, sans réseau ni clé. Les résultats ne sont pas des performances historiques.

## 1. Freqtrade — distinguer absence de biais futur et stabilité des indicateurs
Dans `freqtrade/optimize/analysis/recursive.py`, lignes 29–89 et 176–218 : recalculer les indicateurs avec différentes quantités de bougies d'initialisation et comparer leur valeur au même instant ; valeurs par défaut 199, 399, 499, 999, 1999. Lignes 91–123 : comparaison d'une série tronquée avec la série complète au même instant pour détecter une influence de données futures. Ces protocoles ne sont pas synonymes de validation du rendement.

Application au Lab : `src/robustness.py` et `src/filter_research.py` réinitialisent volontairement les indicateurs par fenêtre. `src/engine.py` exige i >= ema_slow. Sur 720 bougies, chaque fenêtre de vérification V4.5 a 180 bougies ; une EMA lente >= 180 ne peut donc effectuer aucune transaction dans cette fenêtre. Il s'agit d'une conséquence du protocole annoncé, non d'une preuve que le filtre est prudent.

### Test exécuté avec le vrai module V4.5 (720 bougies horaires artificielles)
Entrée PRICE_ABOVE_EMA, sortie PRICE_BELOW_EMA, filtre NONE, EMA rapide 12, capital 10000, frais 0.001, glissement 0.0005.
| EMA lente | Fills sur série complète | Fills profil original fenêtre 1 / 2 | Rendement profil original fenêtre 1 / 2 |
|---:|---:|---:|---:|
| 32 | 18 | 5 / 4 | 13.78105% / 14.00229% |
| 100 | 18 | 3 / 2 | 1.79739% / -0.51730% |
| 180 | 16 | 0 / 0 | 0% / 0% |
| 400 | 9 | 0 / 0 | 0% / 0% |

Reproduction (depuis une copie extraite du ZIP V4.5) :
```python
import math
from src.engine import simulate
from src.filter_research import study
bars=[]
for i in range(720):
    o=100+0.02*(i-1)+10*math.sin((i-1)/12)
    c=100+0.02*i+10*math.sin(i/12)
    bars.append((1767225600+3600*i,o,max(o,c)+1,min(o,c)-1,c,100+i%5))
source={'id':'SYNTHETIC_WARMUP_FIXTURE','sha256':'a'*64,
        'base':'BTC','quote':'USDC','pair':'BTC/USDC',
        'exchange':'SYNTHETIC','source_timeframe':'1h',
        'available_timeframes':['1h','4h']}
# Empreinte factice pour ce test en mémoire : pas une archive historique certifiée.
for slow in [32,100,180,400]:
    p={'kind':'CUSTOM_RULES','entry_rule':'PRICE_ABOVE_EMA',
       'exit_rule':'PRICE_BELOW_EMA','filter_rule':'NONE',
       'capital':10000,'timeframe':'1h','ema_fast':12,
       'ema_slow':slow,'fee':.001,'slippage':.0005}
    r=study(bars,p,source)
    print(slow,simulate(bars,p)['results']['hypothetical_fills'],
          [(f['verification']['bars'],
            f['benchmarks']['owner_original']['hypothetical_fills'],
            f['benchmarks']['owner_original']['return_pct']) for f in r['folds']])
```

Diagnostic séparé de convergence EMA : avec 2400 valeurs x[i]=100+0.05*i+12*sin(i/9)+7*sin(i/37), EMA initialisée au premier prix, alpha=2/(p+1), la valeur de référence EMA400 à la fin est 211.22834086. En ne gardant que les 300 dernières bougies, écart relatif +2.33150474%; 720 : +0.066911%; 1440 : +0.00512118%. Effet dépendant de la série, pas un seuil universel.

**Proposition de protocole (non implémentée)** : différencier bougies de préchauffage, entraînement, validation ; autoriser l'initialisation avec données strictement antérieures à la validation sans transaction ni PnL sur ces données. Nouveau mode explicitement versionné afin de ne pas réinterpréter les anciens rapports V4.3–V4.5. Mesurer les bougies éligibles, les entrées bloquées par warm-up et l'absence effective de signaux. Test causal sur préfixes et stabilité selon plusieurs tailles de préchauffage. Conserver les résultats historiques originaux. Le prochain jalon V4.6 du registre demeure la vérification d'un mois Binance 1h avec checksum.

## 2. Hummingbot — Spot Grid et chronologie intra-bougie
`hummingbot/strategy_v2/backtesting/executors_simulator/grid_executor_simulator.py`, lignes 120–129, 162–199, 231–257 : niveaux, positions ouvertes, take-profits et recyclage ; TP examiné avant réentrée pendant la même bougie. Frais d'un aller-retour approchés à 2 * trade_cost * amount_quote. `controllers/generic/grid_strike.py`, lignes 39–51, 79–105 : limites d'ordres, cadence, barrières, création conditionnelle d'un exécuteur lorsque prix à l'intérieur des bornes et aucun exécuteur actif.

Expérience indépendante, pas résultat natif Hummingbot : niveau d'achat déjà actif à 100 (1 unité), TP 101, frais 0.1% par côté, liquidités initiales restantes = 0. Une bougie O=100.5 H=102 L=99 C=100.5.
- chemin O→L→H→C : vente 101, aucune réentrée, PnL réalisé du round-trip +0.799, inventaire 0, valeur finale 100.899.
- chemin O→H→L→C : vente 101 puis nouvel achat 100, même PnL réalisé +0.799, inventaire 1, valeur finale 101.299.
Même OHLC, état final différent. Le simple fait qu'une mèche touche un ordre ne prouve ni le remplissage ni l'ordre temporel des événements. Pour le futur Grid PAPER : niveaux persistants, séparation cash réservé/inventaire/PnL réalisé/latent, scénario intra-bougie déclaré et tests pessimistes, aucune promesse de liquidité.

## 3. Stratégies existantes identifiées avec règles exactes
- `controllers/directional_trading/macd_bb_v1.py` lignes 26–45, 64–92 : 3m, Bollinger 100 / 2 écarts-types, MACD 21/42/9. Long si %B < 0 ET histogramme MACD > 0 ET MACD < 0. Le signal short inverse est présent ; pour une adaptation Spot long-only, établir une règle de sortie indépendante, ne jamais ouvrir de short implicite. Ce n'est pas encore un backtest du Lab.
- `controllers/directional_trading/supertrend_v1.py` lignes 26–37, 55–80 : 3m, SuperTrend 20, multiplicateur 4, distance relative au SuperTrend < 1% et direction haussière pour long. Signal short à part. Pas de preuve de performance ; le timeframe 3m n'est pas disponible dans le Lab V4.5. Toute adaptation sur 1h/4h doit être identifiée comme une autre expérience. `max_records=length+10` ne garantit pas à lui seul la convergence.

## Suite scientifique
1. Terminer certification source V4.6 selon le plan existant ; ajouter des tests de préchauffage et de non-régression avant d'élargir les stratégies.
2. Éprouver MACD/Bollinger et SuperTrend dans des expériences Spot long-only comparables, contre HOLD50, HOLD100 et CASH, coûts explicites et fenêtres inconnues lors du choix.
3. Garder Grid et robotique V5 isolés du moteur directionnel ; valider séparément la comptabilité, les sorties et l'ambiguïté intra-bougie.
4. Aucun moteur externe installé/exécuté dans ce lot ; aucune modification Lab/Trader/Administrator/Operator/Bridge, aucun ordre réel, aucun accès workspace privé.

Références du projet : [registre](README.md), [plan directeur Notion](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72), [V4.6 plan](SEVEN_HEAVEN_STRATEGY_LAB_V4_6_EXTENDED_HISTORICAL_RESEARCH_SOURCE_PLAN_2026_11_13.md).
