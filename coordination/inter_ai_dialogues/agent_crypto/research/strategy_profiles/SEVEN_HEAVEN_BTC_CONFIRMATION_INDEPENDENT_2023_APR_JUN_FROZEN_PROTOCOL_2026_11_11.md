# Seven Heaven — Protocole figé avant lecture des données : validation historique 2023 Q2

**Protocole publié le 11 novembre 2026, AVANT réception des ZIP 2023 sélectionnés.**

## Objectif et sélection du jeu test

Tester les conclusions du laboratoire sur une période **non encore exploitée par Seven Heaven**. La période retenue est le **premier bloc de trois mois consécutifs disponible après mars 2023**, absent comme archive Bitcoin dans la Release correspondante : avril, mai et juin 2023. La sélection n'utilise aucune performance future observée dans cette session.

- Avril 2023 : source de chauffage indicateurs, **aucune opération**.
- Du **1er mai 2023 00:00 UTC** au **30 juin 2023 23:59 UTC** : portefeuille PAPER pendant 61 jours, capital initial fictif de 1 000 USDT, sans redémarrage mensuel.
- Les fichiers ZIP restent dans GitHub Releases ; ne pas copier les archives binaires dans Git main.

| Archive d'origine | SHA-256 obligatoire | Nombre de minutes |
|---|---|---:|
| [BTCUSDT-1m-2023-04.zip](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/crypto-spot-bulk-2023-04-1m/BTCUSDT-1m-2023-04.zip) | `c71baedea84f9fc1a0ad297b383505b1cb84c0a7fc111caa149aa6fb2defa5da` | 43 200 |
| [BTCUSDT-1m-2023-05.zip](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/crypto-spot-bulk-2023-05-1m/BTCUSDT-1m-2023-05.zip) | `c83bd079dc67b9e542d07fe9491f8b1bf513185d6d7cc4ce17710f21c8d0037b` | 44 640 |
| [BTCUSDT-1m-2023-06.zip](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/crypto-spot-bulk-2023-06-1m/BTCUSDT-1m-2023-06.zip) | `d8cf5d1817fa1d8cba8eaf4d189614cf05b15d7233e9e29a0156d2dee2cfaad1` | 43 200 |

## Politiques bloquées avant le test

Conserver **sans changement** le calcul des états défini par les scripts antérieurs : EMA 10/30 et cours > EMA30 ; SuperTrend ATR14×3 ; consensus haussier si au moins 2/3 des états EMA, MACD 12/26/9 (histogramme et MACD strictement positifs), ADX14 ≥20 et DI+ > DI−. Comparer **1/2/3 clôtures UTC consécutives** avant changement d'exposition, symétriquement pour acheter et vendre. Ajouter Buy & Hold 100 % BTC témoin. Aucune modification de seuil, horizon ou filtre après observation des cours 2023.

- Position initiale : **1 000 USDT en liquidités** au début du 1er mai, avec premier achat hypothétique à l'ouverture du 1er mai si l'état à la clôture du 30 avril autorise l'achat. Le Buy & Hold achète à cette première ouverture.
- Préparation : séries EMA/MACD/ATR/RSI/ADX initialisées exclusivement avec les **30 journées closes d'avril** avant May 1 ; le changement de longueur de mois par rapport à l'étude précédente (janvier = 31 jours) est explicitement appliqué. Aucune transaction pendant avril.
- Capital constant par expérience, pas d'apport, frais **0,10 %** par côté, glissement **0,05 %** par côté ; scénario de résistance avec ces coûts multipliés par deux. Valorisation nette de liquidation à chaque clôture UTC.
- Signal au jour D clôturé → transaction fictive à l'ouverture de D+1. Un seul état BTC ou liquidités, pas d'effet de levier ni grille Spot.
- Évaluation : rendement net final, drawdown quotidien maximum, nombre de transactions, jours sans BTC, intervalles de liquidités, ventes suivies d'un rachat ≤7 jours. Étiquetage a posteriori de chaque sortie avec BTC à J+7 (hausse ≥+3 %, baisse ≤−3 %, neutre, ou censuré), jamais utilisé comme information préalable.
- **Tests bloquants** : SHA-256 exact pour les trois ZIP, aucune bougie manquante/dupliquée, agrégation UTC 1m→1d, égalité préfixe/série complète des états, ledger comptable cohérent. En cas d'échec, arrêter l'étude et signaler le manque, ne pas synthétiser les prix.

## Interprétation attendue et décision

Ne proclamer aucune stratégie gagnante après ce seul échantillon de 61 jours. Chercher si les confirmations C2 réduisent les allers-retours sans coûter trop de reprise, comparer C3 pour mesurer le prix du retard, et vérifier si les résultats changent avec coûts doublés. Les épisodes 2024–2026 ont **déjà** servi à l'exploration et ne comptent pas comme test indépendant.

**Statut actuel : PROTOCOLE FIGÉ, DONNÉES 2023 NON ENCORE FOURNIES À LA SESSION ; AUCUN RÉSULTAT 2023 CALCULÉ.** Recherche PAPER uniquement. Pas de compte OKX, pas d'ordre, aucun changement Administrator/Operator/Trader/Bridge.
