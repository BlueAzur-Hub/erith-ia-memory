# ERITH.IA — Radar 20 · test exploratoire et passation

**Date : 12 octobre 2026.** **Lecture seule** : aucun ordre OKX, aucune permission Trade, aucune modification du Trader, de l'Interface ou du Coffre.

## Résultat réellement calculé

Le premier test de la règle « hausse et augmentation du volume » a été exécuté sur **20 actifs**, à partir de **20 archives compressées `.json.gz`** du dépôt GitHub `main`. Chaque archive a été décompressée et analysée ; ses **720 bougies horaires de septembre 2026** ont été contrôlées (identité du jeton, cotation USDT, mois, nombre de points, suite des heures, OHLC, volumes et nombres de transactions non négatifs). Total : **14 400 bougies horaires de Binance Spot / USDT**.

La présence dans les catalogues de juillet et d'août est connue, mais **ces deux mois n'ont pas été calculés pendant ce pilote**.

### Règle exacte de l'expérience (figée avant l'exécution)

1. Construire les bougies **4 h UTC** à partir des bougies horaires ; pour chaque bougie 4 h, additionner le volume de cotation USDT.
2. Après chaque clôture 4 h, signal si le cours de clôture a progressé d'au moins **1,5 %** par rapport à la clôture des 4 h précédentes **ET** si le volume atteint **2 fois** la moyenne des **20 bougies 4 h antérieures**, sans inclure la bougie signal dans cette moyenne.
3. Achat fictif **à l'ouverture de la bougie 4 h suivante** ; vente fictive **à la clôture de la troisième bougie 4 h après le signal**, soit environ 12 h de détention.
4. Pour chaque actif, attendre la sortie avant d'ouvrir une autre position. Ne pas créer de signal en fin de mois si la sortie ne tient pas entièrement dans la fenêtre historique.
5. **Ticket fictif constant : 20 USDT par opération.** Coût forfaitaire *supposé* de **0,80 % aller-retour** ; profit net = `20 × (cours_vente / cours_achat × 0,992 − 1)`. Le 0,80 % est une hypothèse prudente de modèle (frais + spread + glissement), **pas un tarif mesuré sur OKX**.
6. Calculer aussi la variation de la crypto entre le premier prix d'ouverture horaire et le dernier prix de clôture horaire de septembre. Cette comparaison « conservation » n'a **pas** la même durée d'exposition que les opérations et **n'est pas une comparaison de portefeuilles à capitaux égaux**.

### Bilan du test SEPTEMBRE SEUL

- **115 opérations fictives** ; **55 positives après le coût supposé** et **60 non positives**.
- **47,83 % d'opérations gagnantes**.
- Somme des résultats nets : **+10,6559 USDT** pour les **115 tickets distincts de 20 USDT**.
- Moyenne par opération : **+0,0927 USDT** (environ 9 centimes USDT).

**IMPORTANT : +10,6559 USDT n'est ni un revenu réel, ni un taux de rendement, ni une preuve de rentabilité future.** Les tickets ne constituent pas un portefeuille à capital fixe ; les signaux de plusieurs cryptos peuvent se chevaucher. Le choix des 20 actifs est une sélection actuelle et non une reconstitution sans biais des actifs qui auraient été connus à l'époque. Le mois analysé n'est pas une validation hors-échantillon indépendante.

| Actif | Opérations | Positives | Résultat fictif net (USDT) | Variation du cours septembre (conservation brute) |
|---|---:|---:|---:|---:|
| ETH | 4 | 2 | -0.5139 | 8.85 % |
| SOL | 4 | 3 | 0.3161 | 14.61 % |
| XRP | 6 | 3 | -0.5817 | 7.99 % |
| ADA | 6 | 3 | -1.1378 | 24.67 % |
| LINK | 7 | 4 | -0.2424 | 26.85 % |
| AVAX | 8 | 3 | 0.4303 | 51.21 % |
| SUI | 5 | 3 | 2.2393 | 60.17 % |
| NEAR | 10 | 6 | 2.5485 | 178.03 % |
| UNI | 5 | 3 | 6.4971 | 69.76 % |
| AAVE | 7 | 2 | -2.1952 | 28.49 % |
| LTC | 5 | 5 | 3.0586 | 38.52 % |
| BCH | 5 | 2 | 0.9826 | 23.92 % |
| DOT | 6 | 1 | -0.5307 | 45.59 % |
| HBAR | 6 | 2 | 3.4202 | 42.28 % |
| XLM | 6 | 3 | -2.2449 | 27.64 % |
| DOGE | 6 | 2 | 0.2471 | 14.13 % |
| PEPE | 7 | 3 | -0.6535 | 20.23 % |
| SHIB | 4 | 2 | 1.2720 | 13.61 % |
| APT | 3 | 0 | -0.5934 | 43.79 % |
| ARB | 5 | 3 | -1.6622 | 85.47 % |

Quelques exemples d'opérations réellement issues des calculs (UTC) :
- ETH : achat simulé le 11/09 à 16:00, cours **2 559,43 USDT** ; vente le 12/09 après la bougie horaire de 03:00, cours **2 513,29 USDT** ; perte nette estimée **−2,588 %**.
- SOL : achat simulé le 18/09 à 16:00, cours **111,15 USDT** ; vente le 19/09 après la bougie horaire de 03:00, cours **113,25 USDT** ; gain net estimé **+1,074 %**.
- XRP : achat simulé le 14/09 à 20:00, cours **1,4640 USDT** ; vente le 15/09 après la bougie horaire de 07:00, cours **1,3940 USDT** ; perte nette estimée **−5,543 %**.

## Ce qu'on a prouvé / pas prouvé

**Prouvé dans ce contrôle :** 20 archives compressées lisibles ; continuité des **720 heures de septembre** pour chaque crypto ; simulation déterministe d'une unique stratégie à paramètres fixes sur ces 20 marchés Binance / USDT.

**Non prouvé :** ni les cours exécutables sur OKX Europe, ni les 20 paires autorisées sur le compte réel EEE, ni les frais ou spreads historiques réels, ni la rentabilité sur juillet–août, ni les risques d'un portefeuille multi-actifs, ni des bénéfices répétés après coûts réels.

**Aucune conclusion « l'IA sait gagner » ne peut être tirée de cette seule expérience.** Septembre a été un mois globalement haussier pour ces 20 actifs. Les résultats de conservation bruts sont souvent largement supérieurs aux gains ponctuels simulés, mais ces données ne sont pas comparables directement sans aligner le capital et l'exposition.

## Source des données

- [Archives mensuelles partagées](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/shared_monthly_views) — `<identité CoinGecko>.json.gz`, `series["1h"]` de septembre 2026.
- [Index historique de continuité](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json).
- [Audit des 20 candidats](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/TRADER_RADAR_20_AUDIT.md).

Les observations ont été calculées par lecture des archives côté outil, mais **les 115 lignes de transactions simulées n'ont pas été persistées dans un fichier machine lisible** dans ce pilote. Les règles et les résultats agrégés sont consignés ici ; le calcul doit être reproduit indépendamment avant d'accorder un statut de preuve complet.

## Ordre de reprise pour Aerith-10 / Atlas ou le prochain fil

**Étape 1 :** traiter **juillet–août 2026** comme ensemble d'élaboration sans modifier les seuils selon les résultats de septembre. Rejouer la règle exactement et générer un journal détaillé des transactions contrôlable.

**Étape 2 :** réaliser une vraie comparaison septembre hors-échantillon après avoir gelé toute évolution de règle sur juillet–août, en mesurant capital immobilisé, opérations simultanées, pertes maximales, frais et sensibilité aux coûts.

**Étape 3 :** vérifier sur l'API **OKX Europe du compte utilisateur, READ uniquement**, quelles paires Spot des 20 cryptos sont autorisées et les coûts effectivement observables. USDT Binance ne se transforme pas automatiquement en EUR / USD / USDC sur OKX EEE.

**Étape 4 :** seulement après preuves, intégrer une sortie descriptive d'Atlas/Aerith-10 au **runtime Trader canonique 40.6.625**, sans reconstruire Graphique/Market/Math Core, sans affecter le Coffre Top 250, avec paper trading uniquement.

**STOP** : aucun ordre réel, aucune prétendue stratégie validée, aucune nouvelle surface CSS et aucun automatisme planifié sans autorisation.
