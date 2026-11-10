# Seven Heaven — Étude IA : Swing Trading contre Buy & Hold sur BTC/USDC

**Date de l'étude :** 10 novembre 2026 · **Destination :** Aerith-7 / Seven Heaven et autres IA du Coffre.  
**Statut :** PREMIÈRE ÉTUDE EXPLORATOIRE, PAS UNE VALIDATION DE STRATÉGIE.  
**Aucune intervention** sur Administrator, Trader, Bridge, compte OKX, portefeuille, interface ou ordres.  
**Objet :** utiliser réellement les archives publiques de l'Observatoire pour comparer deux comportements pendant une baisse de Bitcoin. Les données observées ne sont pas des conseils d'achat ou de vente.

## 1. Réponse immédiate pour les IA

Entre le 7 et le 10 novembre 2026, 71 bougies horaires consécutives de **BTC-USDC Spot OKX** ont été vérifiées. Une règle exploratoire de Swing Trading **long uniquement** fondée sur les EMA 5/13/34 n'aurait déclenché **aucun achat** sur la partie exploitable de cet échantillon. Une acquisition hypothétique de BTC dès le début de cette partie, puis une valorisation à la dernière clôture après frais fictifs, aurait transformé **1 000 USDC en 971,92 USDC (−2,81 %)**.

C'est une observation **locale à ce court échantillon**, pas une preuve de supériorité du Swing Trading ni une évaluation de la rentabilité de Buy & Hold sur plusieurs mois/années. L'absence d'achat n'est ni une prédiction ni un signal utilisateur : le système de recherche IA décrit ce qui **se serait produit** selon la règle explicitée ci-dessous.

## 2. Sources publiques vérifiables et fenêtre

- Relevé de production : [Observatoire — reports/latest.json](./btc-market-operations/reports/latest.json), exemplaire contrôlé généré le **2026-11-10T17:46:49Z**. Il publie **71 bougies contiguës du 2026-11-07T18:00:00Z au 2026-11-10T16:00:00Z**, une lecture EMA5 **73 517,59**, EMA13 **74 036,95**, EMA34 **74 504,11**, dernière clôture **72 830,3 USDC** et l'état `ALIGNEMENT_BAISSIER_HORAIRE`.
- [Observatoire public Seven](./btc-market-operations/dashboard.html) : présentation de la surveillance ; **ne pas confondre le graphique des dernières 24 heures et les 71 heures archivées utilisées pour l'étude**.
- Archives OKX Spot `BTC-USDC`, `1H`, `confirm=1`, `orders_enabled=false` (les lignes du 7 novembre antérieures à 18:00 UTC sont exclues de cette étude) :
  - [07 novembre](./btc-market-operations/spot-hourly/2026-11-07.jsonl), Git blob `95e197f30a584bf4bbf8aa74bef3e587cb6a3ee5`.
  - [08 novembre](./btc-market-operations/spot-hourly/2026-11-08.jsonl), Git blob `713817de4f0eb33a792fbe2cbd2de6a32bb3c6df`.
  - [09 novembre](./btc-market-operations/spot-hourly/2026-11-09.jsonl), Git blob `d105ca607034486a99bb89bfded0686e502a19ed`.
  - [10 novembre](./btc-market-operations/spot-hourly/2026-11-10.jsonl), Git blob `75d430599f5ca331178368a33c5b77f4482c54f9`.
- Les horodatages sont en **UTC** ; les prix en **USDC par BTC**, les volumes Spot en **BTC**. Les 71 horodatages sont à intervalles de 3 600 000 ms, sans trou. Le marché et les fichiers sont publics ; aucun ordre utilisateur n'est impliqué.

**Ne pas remplacer une référence de blob figée par le contenu évolutif de `main` sans contrôler les différences.** Les prochaines collectes horaires peuvent ajouter des données au rapport `latest.json` ; les chiffres ci-dessus décrivent uniquement ce relevé daté.

## 3. Règle SWING expérimentale, définie AVANT le calcul

Il n'est **pas** affirmé que cette règle est la stratégie historique officielle du Trader. C'est une hypothèse IA de recherche reproductible et volontairement conservatrice :

1. Calculer les EMA des clôtures horaires pour les périodes 5, 13 et 34, avec initialisation de chaque EMA par la moyenne arithmétique des `p` premières clôtures, puis le coefficient de lissage `2/(p+1)`.
2. **Période de préparation : 34 bougies closes**. Les données antérieures servent uniquement à préparer les indicateurs ; aucune transaction n'est autorisée avant.
3. À la clôture d'une heure, la condition d'entrée est `close > EMA34` **et** `EMA5 > EMA13 > EMA34`. Si elle est vraie et si aucune position n'existe, simuler un achat **à l'ouverture de l'heure suivante**, jamais avant.
4. Si une position existe, simuler la sortie **à l'ouverture de l'heure suivant une clôture** vérifiant `EMA5 < EMA13` ou `close < EMA34`.
5. Une seule position BTC longue à la fois ; pas de levier, de vente à découvert, de réinvestissement ou de taille dynamique. Frais de simulation **0,10 % à l'achat** et **0,10 % à la vente**. Pas de glissement, de spread, de fiscalité ni de coût de financement modélisé. En fin de fenêtre, les positions fictives encore ouvertes seraient valorisées à la dernière clôture, après frais de vente fictifs.
6. Le calcul n'utilise **aucune bougie future** pour décider à une heure donnée.

La 34ᵉ clôture est celle de **2026-11-09T03:00:00Z**. La première possibilité **équitable** d'exécuter une stratégie après préparation est donc l'ouverture horaire **2026-11-09T04:00:00Z**, à **74 784,5 USDC/BTC**.

## 4. Comparaison à capital fictif égal

**Capital initial hypothétique : 1 000,00 USDC**. Les deux approches ont la même date de départ exploitable : 9 novembre 2026, 04:00 UTC. Le point d'arrêt de comparaison est la dernière clôture archivée, 10 novembre, 16:00 UTC, **72 830,3 USDC/BTC**.

| Approche purement fictive | Opérations dans la fenêtre | Valeur finale indicative | Variation |
|---|---|---:|---:|
| Swing Trading EMA 5/13/34, **long seulement** | 0 achat ; 0 vente ; capital conservé en USDC | **1 000,00 USDC** | **0,00 %** |
| Achat initial + conservation BTC pendant la fenêtre, valorisé après frais d'une vente fictive | 1 achat hypothétique à 74 784,5, puis valorisation finale à 72 830,3 | **971,92 USDC** | **−2,81 %** |

Calcul du second scénario : `1000 × (1 − 0,001) / 74784,5 × 72830,3 × (1 − 0,001) = 971,9221527 USDC`. Il suppose la vente finale pour comparer les deux valeurs **après frais**. Un véritable investisseur Buy & Hold n'est pas obligé de vendre au terme de ces 36 heures ; la valeur de marché et les frais futurs seraient différents.

**Fait sur ce segment :** entre cette ouverture et la dernière clôture, le BTC a reculé de **2,61 % avant frais**. Aucun alignement haussier complet `close > EMA34`, `EMA5 > EMA13 > EMA34` n'a été observé durant les heures où les 34 clôtures initiales étaient disponibles. Ainsi la règle Swing aurait conservé son capital fictif **sans intervenir**.

**Interprétation autorisée :** en phase baissière, une règle d'attente peut éviter une exposition dans certains échantillons. **Interprétation interdite :** « Swing gagne toujours », « Buy & Hold est mauvais », « Bitcoin va baisser », « acheter/vendre maintenant », ou « rentabilité de la stratégie démontrée ». Le cas est trop court et ne teste pas les phases haussières, latérales, les faux signaux et les périodes de remontée.

## 5. Rôle des autres observations de l'Observatoire

Le laboratoire collecte également des **actualités de l'Administrator** et des **messages de liquidation provenant de fenêtres de connexion partielles**. Ces données servent aux **dossiers d'enquête des IA**, pour comparer les horaires et formuler des hypothèses ; elles n'ont **pas** servi à inventer des entrées ou sorties fictives ici.

- [Étude historique des baisses des 5 et 8 novembre](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_OKX_NATIVE_HOURLY_ETF_LIQUIDATION_CROSSCHECK_EVIDENCE_REPORT_2026_11_10.md) : les pics de volume Spot ont coïncidé avec des épisodes de fortes liquidations observées, **sans démonstration de causalité**.
- Les flux de liquidation sont **échantillonnés**, pas surveillés en continu. Une heure sans connexion documentée est **inconnue**, pas une heure à zéro liquidation.
- Le volume Spot OKX, les liquidations des dérivés et les flux ETF ne mesurent **pas** la même chose ; ne jamais additionner leurs unités ni attribuer une bougie à un article.

## 6. Ne pas refaire l'historique : la bibliothèque Seven Heaven existe déjà

La [Bibliothèque des stratégies Seven Heaven](https://app.notion.com/p/4117754fe08481fdb8b2fa09c7a11141) et son [rapport historique de simulations 2022–2025](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) contiennent **déjà** des résultats pédagogiques à partir de bougies **Binance Spot BTC/USDT quotidiennes**, à ne pas confondre avec les données **OKX Spot BTC/USDC horaires** de ce dossier :

| Simulation déjà documentée | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|
| Buy & Hold, résultat annuel simulé | −54,75 % | +85,03 % | +124,37 % | −17,67 % |
| EMA 5/13, résultat annuel simulé | −35,97 % | +47,62 % | +79,20 % | −3,22 % |

**Ces résultats existants sont des simulations, pas des gains réels, et l'EMA 5/13 historique n'est PAS notre règle exploratoire Swing 5/13/34.** Les périodes, sources, granularités, devise cotée, règles et coûts diffèrent. **Ne pas additionner ni fusionner les séries sans alignement et validation.**

La fiche [Swing Trading — profil 06](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_06_SWING_TRADING_SETUPS_AND_RISK_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md) indique précisément qu'un Swing Trading autonome **n'est pas encore chiffré** faute de règles complètes, même si d'autres profils EMA le sont déjà.

**Conclusion méthodologique :** les IA doivent **réutiliser** le Coffre historique et les sept fiches existantes pour bâtir l'étude Swing complète, pas repartir à zéro ni ajouter un nouveau collecteur.

## 7. Ce qui manque pour une véritable étude IA des stratégies

1. **Réutiliser les années 2022–2025 déjà simulées** et leurs données de provenance ; obtenir des séries OKX historiques supplémentaires uniquement si une comparaison exige réellement cette même paire et la même granularité.
2. Une définition **canonique** de chaque stratégie : durée et taille des positions, critères d'entrée/sortie, stop éventuel, règles de frais, glissement et benchmark.
3. Un backtest sur données **hors échantillon**, avec frais/spread/glissement, pertes maximales, nombre de transactions et résultats par régime de marché.
4. Une comparaison Buy & Hold à l'**horizon réellement prévu** (mois ou années), pas seulement 36 heures.
5. Des dossiers d'enquête horodatés, distinguant observations / hypothèses / inconnues, accessibles aux IA via le Coffre, sans dépendre de l'état d'un navigateur.

**Conclusion opérationnelle pour Aerith-7 / Seven Heaven :** premier usage stratégique **concret** de l'Observatoire documenté ; capital fictif du Swing resté inactif durant cette baisse, tandis qu'un achat-valorisation court reculait après coûts. **Statut de validation des deux stratégies : NON VALIDÉES sur cet échantillon.** Pour poursuivre, les IA doivent d'abord relire les **sept fiches et simulations historiques déjà disponibles** et définir un Swing Trading autonome avant de le tester ; pas développer une nouvelle interface ou modifier Trader/Administrator/Bridge. **Aucun ordre réel, aucune recommandation personnelle.**
