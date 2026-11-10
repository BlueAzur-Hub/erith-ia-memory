# ERITH.IA · Seven Heaven — BTC : recoupement horaire OKX / ETF / liquidations

**Étude figée au 10 novembre 2026.** Période : 5 et 8 novembre 2026, UTC.  
**Statut :** audit historique documenté, en lecture seule ; *pas* de prédiction, pas d'ordre, pas d'accès au compte utilisateur.  
**Provenance des bougies :** API publique OKX Spot `BTC-USDC`, granularité `1H`, 24 bougies **clôturées et contiguës** pour chaque journée (48 au total), source publique non signée cryptographiquement par la plateforme.  
**Définition des données :** `vol` = BTC (devise de base) ; `volCcyQuote` = USDC (devise de cotation). Le volume Spot n'est pas un volume de liquidations de positions dérivées.

## Résultat vérifié : collecteur et données réelles

- [Workflow GitHub Actions](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/agent-crypto-seven-btc-okx-hourly-evidence.yml) : publication effective par `github-actions[bot]`, commit [`f191135d775694cbeee4ed374f82eb48ab3d73db`](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/f191135d775694cbeee4ed374f82eb48ab3d73db).
- [Index des deux journées](./okx-hourly-collector/evidence/index.json) : `total_candles=48`, `complete_days=2`, `orders_enabled=false` et références SHA-256 par fichier.
- [5 novembre : 24 bougies OKX](./okx-hourly-collector/evidence/btc-usdc-okx-1h-2026-11-05.json) et [8 novembre : 24 bougies OKX](./okx-hourly-collector/evidence/btc-usdc-okx-1h-2026-11-08.json).
- Deux appels à l'endpoint public `GET https://eea.okx.com/api/v5/market/history-candles`, avec instrument explicite `BTC-USDC`, `bar=1H` et pagination `after` vers le passé. Le collecteur interdit les bougies ouvertes, doublons, trous d'horaire et OHLC incohérents. **Les données sont originales de l'API publique, mais pas signées par l'exchange ni auditées transaction par transaction.**
- Empreintes des réponses API publiées dans les sources : 5 novembre `86f291b470bcff07dbdd0cb78c0dc449c4e11bbbd4d6e681c4442135bb619d01` ; 8 novembre `4c99496ccba123f7371ba8d3185b4b46ff7171804ec74c86988771a3828c66a6`.

## Les deux mouvements, chiffres originaux OKX

| Observation UTC | Jeudi 5 novembre | Dimanche 8 novembre |
|---|---:|---:|
| Ouverture du jour, USDC/BTC | 80 437,5 | 75 769,7 |
| Clôture du jour, USDC/BTC | 75 994,3 | 74 774,4 |
| Variation ouverture → clôture | −5,5238 % | −1,3136 % |
| Plus bas intrajournalier, USDC/BTC | 75 105 | 73 380 |
| Plus haut intrajournalier, USDC/BTC | 80 853,3 | 76 278,5 |
| Volume total Spot sur 24 h | 1 753,319 BTC | 993,847 BTC |
| Volume total en contre-valeur USDC | 135,763 M USDC | 74,508 M USDC |
| Heure du plus gros volume Spot | 15:00–16:00 UTC | 21:00–22:00 UTC |
| Volume Spot durant cette heure | 351,967 BTC | 258,135 BTC |
| Contre-valeur durant cette heure | 26,939 M USDC | 19,202 M USDC |
| Variation ouverture → clôture de l'heure | −2,8601 % | −2,1165 % |
| Proportion du volume BTC journalier | 20,07 % | 25,97 % |

Les pourcentages horaires mesurent la clôture de l'heure divisée par son ouverture ; le plus bas intrahoraire peut être inférieur à la clôture. Tous les chiffres du tableau viennent des deux snapshots publics OKX collectés, et non des captures privées du Trader.

### Jeudi 5 novembre : séquence de vente, 14 h → 17 h UTC

| Heure UTC | Ouverture / clôture USDC/BTC | Volume Spot BTC | Observation |
|---|---|---:|---|
| 14 h–15 h | 79 595,1 → 78 222,2 | 143,231 | Première forte heure baissière (−1,725 %) |
| 15 h–16 h | 78 181,5 → 75 945,4 | 351,967 | **Pic de volume, baisse horaire −2,860 %**, plus bas de l'heure 75 484 |
| 16 h–17 h | 75 948,2 → 76 308,4 | 247,093 | Rebond partiel (+0,474 %) avec un volume encore élevé |

Ces trois heures ont concentré **742,291 BTC**, soit **42,34 %** du volume quotidien observé sur cette paire OKX. Il ne faut pas considérer automatiquement chaque BTC échangé dans une bougie rouge comme « BTC vendu net » : toute transaction a un acheteur et un vendeur.

**Recoupement externe :** [Liqwall — Bitcoin, 5 novembre](https://liqwall.com/liquidations/btc/2026-11-05) situe la plus forte heure de liquidations BTC multi-plateformes sur **15 h–16 h UTC**, environ **142 M$** de positions BTC liquidées selon son périmètre. [Hunter Killer — 15:22–15:27 UTC](https://hunterkiller.io/autopsy/2026-11-05T1522-BTC) documente un épisode plus court de liquidations à prédominance *long* ; ces chiffres sont **de nature et de couverture différentes**, ils ne doivent pas être additionnés.

**Flux ETF :** [Farside](https://farside.co.uk/btc/) affiche **−430,2 M$** nets pour **toute la séance du 5 novembre**, et non des transactions de 15 h à 16 h. On peut constater des conditions simultanées défavorables ; on ne peut pas attribuer ces 351,967 BTC Spot aux rachats de parts d'un ETF précis.

**Interprétation :** le créneau 15 h UTC est une coïncidence temporelle forte entre accélération des échanges Spot et liquidations dérivées observées. Les liquidations ont pu amplifier un mouvement en cours ; elles ne prouvent pas le déclencheur initial.

### Dimanche 8 novembre : chute puis rebond, 21 h → minuit UTC

| Heure UTC | Ouverture / clôture USDC/BTC | Volume Spot BTC | Observation |
|---|---|---:|---|
| 21 h–22 h | 75 675,7 → 74 074,0 | 258,135 | **Pic de vente observée, −2,1165 % ; plus bas 73 380** |
| 22 h–23 h | 74 060,0 → 74 403,4 | 220,939 | Rebond partiel (+0,464 %), encore très échangé |
| 23 h–00 h | 74 403,3 → 74 774,4 | 174,917 | Prolongation du rebond (+0,499 %) |

Sur ces trois heures, **653,991 BTC**, soit **65,80 % du volume Spot journalier** de la paire, sont échangés. C'est une très forte concentration autour d'un épisode de rupture puis reprise.

**Recoupement externe :** [MarketTrace — 21 h 51 à 21 h 59 UTC](https://markettrace.ai/liquidations/events/btc-2026-11-08-2151) observe au moins **131 M$ de liquidations sur des positions BTC** sur Binance, Bybit et OKX durant huit minutes, majoritairement des positions *long* selon son relevé partiel. [MarginPad, bilan du 8 novembre](https://marginpad.io/liquidations/recap/2026-11-08/) considère **21 h–22 h UTC** comme l'heure principale de liquidations crypto *toutes monnaies*, selon un autre périmètre. Les chiffres ne sont ni identiques ni additionnables.

**Flux ETF :** le dimanche, les ETF Bitcoin cotés aux États-Unis sont **fermés**. La chute horaire observée ne correspond donc pas à une négociation d'actions ETF à cette même heure. Des positions antérieures, les marchés de dérivés et d'autres sources de liquidité peuvent influer sur les prix, mais une causalité spécifique reste non démontrée.

**Interprétation :** dans ce cas, la séquence temporelle est particulièrement compatible avec une **cascade de liquidations dérivées amplifiant une baisse Spot**, suivie d'un rebond rapide. Ce n'est ni la preuve que tous les vendeurs Spot étaient des comptes liquidés, ni la preuve d'un retournement durable du marché.

## Ce que l'IA est autorisée à conclure

1. **Fait** : les deux plus grosses heures de baisse observées ont aussi été les heures de plus gros volume BTC sur la paire Spot OKX `BTC-USDC`, aux dates étudiées.
2. **Fait recoupé par sources indépendantes, avec périmètre distinct** : des liquidations de positions dérivées se sont produites aux mêmes horaires. Les données de liquidation proviennent d'agrégateurs et flux d'exchanges tiers ; ce ne sont pas des exécutions Spot OKX.
3. **Fait** : les sorties ETF du 5 novembre sont **journalières** ; le 8 novembre est **un dimanche sans séance ETF**.
4. **Interprétation plausible, pas une causalité prouvée** : la pression baissière et les ventes forcées ont pu se renforcer mutuellement.
5. **Non démontré** : la source de chaque ordre Spot, les créations/rachats ETF intrahoraires et l'impact exact de chaque liquidation sur la variation de prix.

## Contrat de reprise pour Seven, Atlas et les autres IA

- Ouvrir d'abord les deux JSON d'évidence, vérifier `venue=OKX`, `instrument=BTC-USDC`, `bar=1H`, 24 heures UTC closes par jour, `orders_enabled=false`, manifestes SHA-256 et champs de provenance.
- Conserver les unités : BTC de base et USDC de cotation pour la paire Spot, USD notionnel pour liquidations multi-plateformes, USD nets journaliers pour ETF ; ne pas ajouter les volumes.
- Distinguer les fenêtres 14 h/15 h/16 h du 5 novembre et 21 h/22 h/23 h du 8 novembre des heures de publication des articles ; un article paru plus tard ne prouve pas qu'il a causé le mouvement précédent.
- Garder le journal de nouvelles de l'Interface dans son propriétaire `data/news/latest.json` ; ne pas afficher d'actualités dans le Trader.
- Ne pas reconstituer une minute (ni identifier la direction des transactions) à partir d'une bougie horaire. Pour l'attribution fine, exiger des relevés d'ordres ou liquidations réellement horodatés par fournisseur.
- Ne pas transformer les coïncidences en conseils d'achat/vente, probabilités ou gains PAPER fictifs. Aucun ordre réel et aucune donnée privée.

## Limites et suite

**Fait accompli :** récupération publique OKX horaire sur GitHub Actions, deux journées validées, recoupement documentaire indépendant sur les événements ETF et dérivés.  
**Reste à effectuer :** raccordement de ce cas à l'analyseur commun automatique, validation Firefox et éventuel contrôle minute-par-minute des transactions **Spot** si la granularité horaire est insuffisante.  
**Aucune modification du Trader, Administrator ou Bridge R31 dans cette livraison.**

---

*Seven Heaven · étude de marché figée, provenances explicites, corrélation distincte de causalité.*