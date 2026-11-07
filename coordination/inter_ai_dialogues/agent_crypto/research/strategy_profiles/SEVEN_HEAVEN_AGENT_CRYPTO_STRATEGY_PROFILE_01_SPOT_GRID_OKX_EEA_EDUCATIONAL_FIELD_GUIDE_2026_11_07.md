# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 01
## SPOT GRID — Comprendre les grilles de prix et leurs risques

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann, Administrator / Operator · **Statut :** DOCUMENTAIRE — LECTURE SEULE · **Aucun ordre réel, aucune automatisation, aucun import de profil exécutable.**

**Destination publiée :** `BlueAzur-Hub/erith-ia-memory/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`.

> **Question étudiée :** que fait un trader lorsqu'il estime qu'un actif risque d'osciller longtemps entre deux prix, plutôt que de monter ou descendre en ligne droite ?

## 1. Principe en une minute

La **Spot Grid** répartit des achats et des ventes sur plusieurs niveaux prédéfinis. Elle tente de tirer parti des va-et-vient *à l'intérieur* d'une fourchette. Elle n'a pas besoin de prédire chaque oscillation ; elle a en revanche besoin de règles sur la fourchette, les tailles d'ordre, les frais et l'arrêt.

La documentation OKX Europe décrit un bot de grille Spot avec bornes haute et basse, nombre de grilles, espacement arithmétique ou géométrique et paramètres optionnels de protection. La disponibilité exacte des produits et des réglages doit être vérifiée dans le compte concerné : une documentation internationale n'est pas la preuve d'un droit d'accès EEE.

**Analogie :** un marchand qui achète une petite quantité de marchandise quand son prix redescend à un palier et la revend au palier supérieur. Son risque majeur est de conserver trop de marchandise si le prix chute et ne remonte plus.

## 2. Simulation de pensée sur le Bitcoin (prix inventés)

Exemple de niveaux **fictifs**, choisis uniquement pour expliquer le mécanisme :

| Niveau BTC fictif | Usage possible de la grille |
|---:|---|
| 80 000 USDC | Limite supérieure : sortie de la zone étudiée |
| 78 000 USDC | Niveau de vente possible |
| 76 000 USDC | Niveau intermédiaire : vente d'un lot acheté en dessous |
| 74 000 USDC | Niveau intermédiaire : achat d'un lot |
| 72 000 USDC | Niveau d'achat possible |
| 70 000 USDC | Limite inférieure : sortie de la zone étudiée |

Si un achat fictif a été **effectivement exécuté** à 74 000 et sa vente fictive effectivement exécutée à 76 000, le lot réalise un bénéfice *avant* les autres coûts et limites du système. Mais si BTC descend sous 70 000 et ne remonte pas, ce lot reste exposé à une perte de valeur. Il n'existe aucune garantie qu'un ordre placé soit rempli, ni qu'une séquence de prix soit favorable.

### Un calcul concret : un lot de 100 USDC, **pas** un portefeuille entier

Hypothèses simplifiées : frais **0,10 %** de chaque côté, glissement **0,05 %** de chaque côté ; ordre d'achat fictif à 74 000 USDC/BTC ; achat entièrement rempli et passage à 76 000 puis vente entièrement remplie.

- Coût effectif d'achat par BTC : `74 000 × 1,0005 × 1,001` = **74 111,037 USDC**.
- Produit net de vente par BTC : `76 000 × 0,9995 × 0,999` = **75 886,038 USDC**.
- Le lot acheté pour **100 USDC** vaudrait après vente fictive **102,395 USDC**, soit **+2,395 USDC** (~**+2,40 %**).
- Si le lot devait au contraire être liquidé à **70 000 USDC/BTC** avec les mêmes frais/glissements, il ne restituerait qu'environ **94,31 USDC**, soit **−5,69 %**.

**Ne pas en déduire +2,40 % pour le bot ou le portefeuille.** Ce calcul illustre *un seul lot*, suppose des exécutions garanties, et ignore les autres positions, les ordres restés ouverts, les tailles minimales, les éventuels changements de frais, l'impôt, la latence et la valorisation de tous les BTC conservés.

## 3. Les paramètres qu'un trader doit comprendre avant de s'en servir

| Paramètre | Question que le trader se pose | Risque en cas de mauvais choix |
|---|---|---|
| Marché / paire | BTC/USDC, BTC/USDT : quelle liquidité et quelle devise de référence ? | Écarts entre actifs et cours de conversion |
| Borne basse / haute | Dans quelle fourchette estime-t-on que le prix peut osciller ? | Sortie de fourchette et bot devenu inadapté |
| Nombre de grilles | Espacement et taille des ordres ? | Trop serré : frais et exécutions ; trop large : peu de transactions |
| Arithmétique / géométrique | Même écart en unités ou même pourcentage entre niveaux ? | Mauvais espacement selon l'échelle des prix |
| Budget du bot | Combien de capital est réservé, dont BTC déjà détenu ? | Sur-exposition et fonds immobilisés |
| Frais, spread, glissement | Le gain d'un aller-retour couvre-t-il ses coûts ? | « Bénéfice par grille » trompeur |
| Inventaire et P&L total | Combien de BTC et combien de liquidités reste-t-il ? | Gain réalisé mais portefeuille global perdant |
| Sortie / suspension | Que fait-on si la fourchette casse ou si les données se dégradent ? | Accumulation de positions ou activité non maîtrisée |

### Point délicat : une grille n'est pas un indicateur

La **Spot Grid** est une *stratégie d'ordres*. EMA, RSI et Bollinger sont des *indicateurs*. Un trader peut utiliser un indicateur pour **choisir d'étudier** un marché en range, mais les ordres de grille et la preuve d'une bonne exécution sont des questions distinctes.

## 4. Trois scénarios à distinguer

| Scénario | Comportement possible | Ce qu'il faut observer |
|---|---|---|
| **Range** : le BTC va et vient | Plusieurs achats et ventes peuvent se succéder | Gain net de chaque lot **et** valeur totale du portefeuille |
| **Hausse durable** : le BTC dépasse la borne haute | Les ventes successives peuvent réduire la quantité de BTC | Écart de performance avec Acheter et conserver |
| **Baisse durable** : le BTC passe sous la borne basse | Les achats précédents peuvent laisser une position BTC en forte moins-value | Drawdown, exposition maximale, traitement de l'arrêt |

Une grille qui affiche de nombreux « profits réalisés » peut simultanément présenter une **perte latente** plus élevée sur les BTC encore détenus. La mesure pertinente est la *valeur nette globale* du capital, pas la seule somme des petits bénéfices fermés.

## 5. Pourquoi le Coffre actuel ne suffit pas pour un backtest Spot Grid fidèle

Le Coffre possède une série BTC/USDT Binance Spot de **3 075 bougies quotidiennes** du **1er mai 2018** au **30 septembre 2026**, contrôlée lors des études précédentes. Pour une journée donnée, une bougie OHLC fournit l'ouverture, le plus haut, le plus bas et la clôture, mais **ne donne pas l'ordre temporel de ces événements**.

Exemple : si le BTC a touché 74 000 et 76 000 le même jour, la bougie ne dit pas si le bot pouvait d'abord acheter à 74 000 **puis** vendre à 76 000, ou si le plus haut est arrivé **avant** le plus bas. Une simulation qui choisirait systématiquement l'ordre favorable créerait une performance fictive.

**Données souhaitables avant de chiffrer honnêtement :** historique intrajournalier assez fin pour tester l'ordre des franchissements ; paramètres complets de la grille ; règles de traitement des « touchés » sans remplissage ; volumes, tailles minimales, frais maker/taker, spread et glissement ; valorisation de l'inventaire à chaque instant ; comparaison à une détention passive sur les mêmes dates.

Les blocs historiques horaires présents dans certaines sections du Coffre pourront éventuellement enrichir une étude **approximative**. Ils ne constituent pas une preuve d'exécution aux niveaux touchés, ni une garantie de séquencement intrahoraire correct. **Aucun rendement historique Spot Grid n'est affirmé ici.**

## 6. Profil pédagogique de référence — non exécutable

| Champ | Valeur documentaire |
|---|---|
| Nom de profil | `Seven Research 01 — Spot Grid Range Observation` |
| Catégorie | Oscillation / grille Spot |
| Marché étudié | BTC Spot, paire à confirmer selon source et devise |
| Timeframe pour l'analyse | Quotidien pour contexte ; intrajournalier requis pour les ordres |
| Paramètres | Bornes haute/basse, espacement, nombre de niveaux : **à étudier**, aucun réglage conseillé |
| Capital | 1 000 unités fictives **uniquement dans les exemples**, aucune autorisation de compte |
| Frais | Hypothèse pédagogique 0,10 %/côté ; glissement 0,05 %/côté |
| Risque à suivre | Drawdown total, BTC immobilisé, sortie de fourchette, frais cumulés |
| Étalon de comparaison | Acheter et conserver sur les mêmes dates |
| État | `DOCUMENTAIRE — NO LIVE TRADING — NO IMPORT` |

**Questions d'évaluation :**

1. Quelle différence entre profit d'une opération de grille et résultat total d'un portefeuille ?
2. Pourquoi un marché en forte baisse peut-il transformer une grille « active » en position à risque ?
3. Pourquoi des bougies quotidiennes ne permettent-elles pas d'affirmer que deux ordres ont été remplis dans le bon ordre ?
4. Quelle différence entre Spot Grid et DCA classique, même si les deux peuvent acheter pendant une baisse ?

## 7. Ce que nous avons appris — et suite proposée

**Acquis documentaire :** la grille Spot cherche à profiter de la répétition des oscillations. Elle ne prédit pas la direction ; elle transforme une hypothèse de *fourchette* en règles d'ordres. Son risque central n'est pas seulement une perte sur un trade isolé, mais l'inventaire total qui reste exposé lors d'une sortie de fourchette.

**Étude suivante, séparée :** `Profile 02 — DCA classique vs Spot DCA Martingale`. Il faut expliquer ce qui distingue douze achats programmés d'une suite d'achats conditionnels à la baisse, et comparer leurs risques sans recommander de renforcement automatique.

**Publication documentaire :** fiche archivée dans le répertoire partagé avec validation humaine. Aucune modification du code, d'OKX ou de Notion.

## Sources

- OKX Europe, « Que sont les bots de trading crypto d’OKX ? » : https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them
- OKX Europe, « What's the Spot Grid bot and how do I use it? », mise à jour août 2026 : https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it
- OKX Europe, « Comment régler manuellement les bots de trading en grille spot ? », mise à jour août 2026 : https://www.okx.com/fr-fr/help/how-do-i-manually-set-up-spot-grid-trading-bots-eea
- Coffre public, index des bougies BTC réconciliées : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json
- État de coordination partagé : https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto
