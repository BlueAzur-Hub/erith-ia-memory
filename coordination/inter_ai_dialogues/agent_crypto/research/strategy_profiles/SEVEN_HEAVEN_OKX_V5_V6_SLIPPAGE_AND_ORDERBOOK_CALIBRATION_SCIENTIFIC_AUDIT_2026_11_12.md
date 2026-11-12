# Seven Heaven — OKX V5/V6 : audit du glissement PAPER face aux carnets historiques

**Date :** 12 novembre 2026. **Périmètre :** documentaire, inspection du code actuellement publié sur `main`, recalcul des CSV historiques OKX BTC-USDC et ETH-USDC. **Pas de trading réel, de modification du Trader, du Bridge ou d'API privée.**

## 1. Décision de reprise : mémoire à consulter avant toute nouvelle étude

**Source canonique des frais du compte :** [Notion AETHER · AGENT-INTERFACE → OKX MEMORY CORE → 01 · Trading Fees](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). Trois captures datées du **6, 9 et 12 novembre 2026** documentent le profil `Utilisateur régulier` : **Spot maker = 0,0800 %** et **Spot taker = 0,1000 %** par côté. Ne pas redemander ces chiffres. Leur validité pour la paire précise et à une date historique reste à qualifier si nécessaire.

Documents préexistants à **réutiliser, sans les rejouer inutilement** :

- [Rapport des 576 états L2, 288 comparaisons de spread et 2 880 lignes de coûts de carnet](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_MULTI_DATE_SCIENTIFIC_REPORT_2026_11_12.md).
- [Rapport des mesures à la minute et de persistance temporelle des spreads](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md).
- [Rapport des frais Spot du compte corrigés](../../SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md).
- [Passation inter-IA corrigée](../../SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_SESSION_HANDOFF_2026_11_12.md).

## 2. Audit statique du code V5 et V6, réalisé sur main

| Module vérifié | Chemin | Blob Git SHA-1 |
|---|---|---|
| V5 backtest historique PAPER | `public/agent_crypto_erith_ia/administrator/js/market-microscope-paper-backtest-v5.js` | `069162a40c4a65651ff1cd9ac98a837d64f41e9a` |
| V6 estimation PAPER sur carnet | `public/agent_crypto_erith_ia/administrator/js/market-microscope-orderbook-paper-v6.js` | `7ae813cd1268ddd657052cc1e2ca474e8b1aed3b` |

**V5** (lignes 6, 46 et 50–63) : paramètres par défaut `initialCapital=1000`, `feePercent=0.1`, `slippagePercent=0.05`. Les signaux EMA sur bougies OKX clôturées sont exécutés **fictivement à l'ouverture de la bougie contiguë suivante** :

- Achat : `fill = next.open * (1 + slippagePercent/100)`, puis quantité `cash / (fill*(1 + feePercent/100))`.
- Vente : `fill = next.open * (1 - slippagePercent/100)`, puis `proceeds = quantity * fill * (1 - feePercent/100)`.
- Long-only, pas d'ordre réel, rejet de l'historique OHLC troué et des bougies non clôturées ; les résultats peuvent dépendre des paramètres modifiables dans l'interface.

**V6** (lignes 23–75 et 179–180) : `feePercent=0.1` par défaut pour un **ordre taker fictif** ; lit un carnet public OKX de la paire exacte, état `FRESH`, horodaté depuis **15 secondes au plus** ; refuse un carnet croisé ou une profondeur insuffisante.

- Calcule le **VWAP** fictif en consommant les niveaux ask (achat) ou bid (vente), et les frais taker hypothétiques.
- Expose **deux métriques distinctes** : `impactBestBps` = écart VWAP au **meilleur ask/bid** du côté exécuté ; `deviationMidBps` = écart VWAP au **prix médian** du spread. La seconde inclut l'effet du **demi-spread** et de la profondeur ; **ne pas les additionner**, ni rajouter le spread.
- Pour BUY, `quoteBudget` **inclut** les frais modélisés ; pour SELL, c'est un notionnel de référence converti en quantité de base au mid. Les deux conventions ne décrivent pas un cycle d'ordres réalisé, et les tailles ne sont pas strictement les mêmes que les notionnels des CSV historiques.
- **V6 n'effectue pas un backtest historique et ne mesure pas une exécution réelle.** Son coût instantané ne peut pas être substitué à une exécution V5 à une autre date.

**Contrôle de méthode :** comparer un glissement V5 « depuis l'ouverture OHLC suivante » à un écart V6 « depuis le meilleur prix du carnet » ou « depuis son mid » n'est **pas une comparaison métrologiquement identique**. L'ouverture OHLC n'est pas nécessairement le mid du carnet. Il reste une incertitude sur la latence, les changements de profondeur, le type d'ordre et une éventuelle composante déjà incorporée dans le premier trade de la bougie.

**Statut des vérifications :** inspection statique des deux fichiers et recalcul hors exécution à partir des preuves CSV ; les recettes Firefox antérieures, tests V5/V6 et workflows publiés dans Notion sont des preuves **antérieures**, pas des tests utilisateur ou un nouveau CI relancés par cet audit.

## 3. Recalcul des archives L2 : l'hypothèse V5 fixe de 0,05 % par côté

- Le glissement V5 de **0,05 % par côté équivaut à 5,00 bp**.
- Archives OKX : **15 août, 15 septembre et 15 octobre 2026** uniquement, BTC-USDC et ETH-USDC.
- 96 snapshots fixes de 15 minutes par journée et instrument : **288 snapshots par actif**, **576 mesures par actif si l'on compte séparément achats et ventes**, par taille. Les deux actifs ne sont pas toujours rigoureusement synchronisés à la milliseconde.
- **Source recalculée :** `SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv` (2 880 lignes ; blob Git `4cc4d6e6cfda04da29a36ea23fb490ccd03e9238`) ; spread : `...PAIRED_SPREADS_288_ROWS_2026_11_12.csv` (288 lignes ; blob `1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659`).
- Mesure : **écart du VWAP fictif au prix médian**, du côté de l'opération, **hors commission**, donc **demi-spread + impact supplémentaire de profondeur** ; ce n'est **pas** un slippage exécuté ni le `impactBestBps` de V6.

### Distribution empirique sur les 576 côtés par actif et par taille (en bp)

| Notionnel USDC par côté | BTC moyenne | BTC p90 | BTC max | ETH moyenne | ETH p90 | ETH max |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 0,0764 | 0,2355 | 1,7888 | 0,3948 | 0,7788 | 1,3829 |
| 100 | 0,0848 | 0,2501 | 1,7888 | 0,4092 | 0,7876 | 1,3829 |
| 1 000 | **0,1375** | 0,3768 | 1,7888 | **0,5532** | 1,0808 | 2,1301 |
| 10 000 | 0,4383 | 1,1145 | 2,3771 | 1,0581 | 1,8459 | 4,1053 |
| 100 000 | 1,7435 | 3,2149 | **11,2467** | 5,0636 | 7,7576 | **17,8860** |

**Comptage de dépassements du seuil de 5 bp sur les 576 côtés étudiés (par actif et notionnel) :**

| Notionnel USDC | BTC : côtés > 5 bp | ETH : côtés > 5 bp |
|---:|---:|---:|
| 10 | 0 / 576 | 0 / 576 |
| 100 | 0 / 576 | 0 / 576 |
| 1 000 | **0 / 576** | **0 / 576** |
| 10 000 | **0 / 576** | **0 / 576** |
| 100 000 | **10 / 576 (1,74 %)** | **237 / 576 (41,15 %)** |

**Interprétation bornée :** une friction équivalente à 5 bp par côté est supérieure à toutes les estimations mid→VWAP enregistrées pour **10 à 10 000 USDC** sur ces trois journées. À **100 000 USDC**, elle ne les couvre plus de façon générale, spécialement sur ETH. Cela **n'établit pas** que le V5 réel exagère le glissement, car son prix de référence et son horizon temporel diffèrent.

### Comparaison économique au montant fictif de 1 000 USDC

- **V5, paramètres par défaut :** 0,10 % frais + 0,05 % glissement à chaque côté, soit environ **30 bp** de friction cumulée achat + vente, sous l'hypothèse d'un aller-retour à notionnel constant.
- **Carnets historiques, friction moyenne à l'instant et tarif du compte observé en novembre appliqué à titre de scénario :**
  - BTC : **20 bp de commissions + 0,2750 bp de carnet = 20,2750 bp**, soit environ **2,0275 USDC** pour un aller-retour de notionnel constant de 1 000 USDC.
  - ETH : **20 bp de commissions + 1,1064 bp de carnet = 21,1064 bp**, soit environ **2,1106 USDC**.
- **Écart purement illustratif par rapport aux 30 bp V5 :** **9,7250 bp BTC** et **8,8936 bp ETH**. **Ne pas le qualifier de « surestimation prouvée »** : il compare deux méthodes qui n'utilisent ni le même prix d'entrée, ni exactement la même taille, ni nécessairement le même temps d'exécution.

## 4. Audit des limites et des risques de calibration

1. **Sélection temporelle :** trois journées isolées et 96 snapshots par journée, pas une distribution exhaustive du marché de l'année, ni une mesure des coûts à tous les moments où V5 aurait ouvert une position.
2. **Prix de référence :** le `next.open` de V5 peut déjà contenir des effets liés aux transactions ; le `mid` des archives est calculé depuis best bid/ask. Un transfert direct des 0,1375/0,5532 bp au champ V5 serait faux, et pourrait double-compter ou oublier des coûts.
3. **V6 :** le calcul `impactBestBps` omet le demi-spread, contrairement à `deviationMidBps`. Toujours employer des définitions comparables.
4. **Réalité d'exécution :** aucune annulation entre snapshot et exécution, file d'attente, délai réseau, profondeur changeante, volumes qui disparaissent, ordre partiel, vol extrême ou frais effectivement débités n'est mesuré par le replay historique.
5. **Tarifs :** les taux Spot maker/taker du compte sont documentés dans Notion, mais restent à qualifier pour la paire exacte et pour les dates historiques. Ne pas utiliser le générique EEE 0,20 % taker par côté comme tarif personnel.
6. **Couverture :** BTC-USDC / ETH-USDC, **pas BTC-USD Bitstamp, BTC-USDT, ni paire EUR**. Aucune correction rétroactive des autres études de stratégies.
7. **Absence de calibration simultanée :** les journaux V5 de novembre (300 bougies, EMA 5/13, scénarios 5m/15m/4h) ne sont pas appariés à ces carnets des trois journées. Aucune baisse de paramètre ne peut être certifiée par ces seules données.

## 5. Conclusion opératoire, sans modification de code

**Constat 1 :** le défaut actuel `feePercent=0.1` de V5 et V6 coïncide déjà avec le **taker Spot 0,10 %** vu sur le compte. **Le préserver**, ne pas substituer 0,08 % maker en simulation d'un ordre preneur.

**Constat 2 :** la valeur **0,05 % de glissement V5 est un forfait pédagogique**, ni calibré sur les exécutions ni universel. Elle peut être **prudente dans les snapshots étudiés pour de petits montants**, et **insuffisante pour certaines grosses tailles ETH**.

**Constat 3 :** V6 fournit un **coût estimé de carnet au même instant**, séparant meilleur prix, mid, profondeur et commissions ; son vocabulaire « impact réel » dans l'interface ne doit pas faire croire à une exécution réelle. La méthode reste une simulation.

**Décision :** **ne pas changer automatiquement le défaut V5 ni le moteur V6**. Faire des comparaisons PAPER **à paramètres explicitement fixés**, avec scénarios de sensibilité de glissement V5 **0 %, 0,02 %, 0,05 % et 0,10 % par côté**, tarif taker constant **0,10 % par côté**. Ces valeurs sont un éventail de tests, **pas** des taux historiquement validés.

**Unique prochaine étape scientifique utile :** construire, lorsqu'une couverture d'archives suffisante est démontrée, un contrôle **apparié** par **paire, devise, moment de la bougie d'ouverture suivante, côté de l'ordre et montant** ; associer snapshot de carnet **précédant l'ordre simulé** et OHLC au moment correspondant, distinguer demi-spread et consommation des niveaux, fixer un protocole avant de lire les résultats. Si l'archive n'est pas disponible, afficher **« couverture insuffisante / frais estimés »**, ne pas fabriquer une précision.

### Vérification de cette livraison

- **Travail de cette session :** inspection du code GitHub main, validation du référentiel Notion existant et recalcul des 2 880 lignes de comparaison de coûts (576 côtés par actif par montant).
- **Non accompli :** test d'exécution réel, campagne Firefox ou GitHub Actions V5/V6, modification du code du Trader, nouvelle publication de backtest EMA, ordres réels.
- Le rapport et la référence persistante doivent rester dans le répertoire partagé, avec lien ajouté à la **fiche canonique Notion 05 · PAPER / Backtest V5** et à la **passation inter-IA existante**.

**Règle de reprise :** lire d'abord `OKX MEMORY CORE → 01 Trading Fees`, puis le présent audit, puis les moteurs et les CSV épinglés. Ne pas redemander les frais, ne pas refaire les replays déjà reproduits, ne pas prétendre avoir validé une exécution qui est encore fictive.
