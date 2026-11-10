# ERITH.IA · Seven Heaven — BTC : ETF, liquidations, EMA et volumes

**Dossier de preuve et de transmission textuelle pour les IA du projet Agent-Crypto**  
**Date de la photographie documentaire :** 10 novembre 2026 (Europe/Paris, UTC+01:00)  
**Période étudiée :** 2–10 novembre 2026 ; événement particulier du dimanche 8 novembre  
**Actif / instrument du Trader :** Bitcoin, marché Spot `BTC-USDC` d'OKX  
**Statut :** étude rétrospective, pédagogique, en lecture seule. **Aucun ordre, aucune recommandation d'achat ou de vente, aucune causalité individuelle certifiée.**  
**Identité opératrice documentaire :** Aerith-7 / Seven Heaven ; modules utiles : Atlas-10 Crypto (Data Truth, multi-horizon, risque, Market Structure), Math Oracle (unités, calculs), Trader PAPER (simulations uniquement).  
**Source primaire du terrain utilisateur :** captures du Trader ERITH.IA du 10/11/2026 (version affichée `40.6.719`) ; elles ne constituent ni un export complet du journal d'ordres, ni une preuve de l'état courant du dépôt.

> **Résumé de reprise immédiate — à lire même sans accès aux images.** Le BTC a subi une correction début novembre 2026. La semaine du 2 au 6 novembre, les ETF Bitcoin Spot américains ont enregistré environ **−1 281,7 M$** de flux nets cumulés (sources Farside et The Block). Une forte baisse a aussi eu lieu **dimanche 8 novembre**, pendant la fermeture des marchés ETF américains, avec une vague de liquidations sur les produits dérivés : les flux ETF ne sont donc **pas** une explication directe suffisante de chaque bougie rouge. Les captures ERITH.IA montrent une dynamique BTC défavorable, des EMA 5/13/34 orientées à la baisse à droite du graphique, ainsi que des pics d'activité sur certaines baisses. **La coïncidence temporelle est documentable ; la causalité d'une bougie précise par un ETF particulier n'est PAS démontrée.**

---

## 1. Pourquoi ce document existe

La continuité du projet ne doit **pas dépendre de la capacité d'une IA à ouvrir ou comprendre une infographie**. L'image pédagogique « Comprendre les flux BTC — croiser graphique, ETF et actualité » permet la découverte visuelle ; **le présent fichier Markdown est l'explication durable, exploitable sans image**. Il indique les chiffres, les sources, les dates, les limites et une procédure de reprise reproductible.

**Destination pédagogique :** comprendre pourquoi le BTC peut tomber, ce que mesurent les barres de volume, ce que lisent les EMA, et comment un agent IA distingue *fait observé*, *donnée externe*, *mécanisme plausible* et *preuve causale*.  
**Destination opérationnelle :** permettre à une autre IA de refaire les recoupements et de documenter de nouveaux épisodes **sans relire tout le chat**. Ne pas interpréter les valeurs de novembre comme des cours en temps réel.

### Règles absolues

1. Un **flux ETF journalier** n'est pas une transaction Spot OKX horodatée à la minute.
2. Une **liquidation de contrats dérivés** n'est ni un ordre Spot identifié, ni un transfert financier du compte personnel.
3. Une **barre de volume rouge** signifie que la bougie de prix correspondante est baissière ; **elle ne compte pas exclusivement les ventes** (toute transaction implique un acheteur et un vendeur).
4. Une **EMA** décrit une moyenne de prix ; elle n'identifie pas la cause d'un événement et ne prédit pas seule l'avenir.
5. Séparer systématiquement `USD` (présentation), `USDC` (devise de la paire Spot), `BTC` (volume de base), `$` (unités des flux ETF et des liquidations) et `EUR` (compte personnel). Jamais de conversion implicite.
6. Source et horodatage obligatoires. Une donnée manquante se note **NON VÉRIFIÉ**, jamais « zéro ».
7. **Lecture seule** : aucun ordre OKX, aucune permission Trade, aucun changement Bridge, aucun secret, aucune donnée personnelle en dépôt public.

---

## 2. Les quatre flux à ne pas confondre

| Flux | Ce qu'il représente | Unité courante | Horizon | Ce qu'il ne démontre pas |
|---|---|---|---|---|
| **Flux ETF** | Souscriptions et rachats nets de parts de fonds Bitcoin Spot aux États-Unis | M$ par séance | Journée américaine | Le nombre de BTC vendus sur OKX à telle minute |
| **Volume Spot BTC-USDC OKX** | Quantité réellement échangée sur cette paire pendant une bougie | BTC (base) ; parfois USDC (cotation) | 1 min, 15 min, 4 h, 1 jour… | La proportion exacte de vendeurs sans données détaillées |
| **Liquidations dérivés** | Clôtures forcées de positions à effet de levier sur futures/perpetuals | USD notionnels, toutes places ou certaines places | Minute, heure ou 24 h | Des ventes Spot BTC-USDC de même montant |
| **Flux macro / sentiment** | Actualités, indices actions, taux, appétit pour le risque, positions d'investisseurs | Plusieurs unités | Journée à plusieurs semaines | Une causalité mécanique sur chaque bougie |

### Mécanismes pédagogiques

- **Sorties ETF** : une séance avec davantage de rachats que de créations signale une demande nette plus faible pour ces produits. Le fonctionnement des fonds implique des intermédiaires et des opérations de couverture ; la correspondance minute par minute avec OKX n'est **pas immédiate**.
- **Liquidations de positions longues** : si le BTC baisse, les positions endettées qui pariaient sur la hausse peuvent être liquidées ; ces fermetures peuvent **amplifier** la baisse, surtout si les carnets sont peu profonds.
- **Volumes Spot** : une bougie rouge avec un volume particulièrement élevé indique que beaucoup de BTC ont changé de main **pendant une baisse du prix**. Elle ne révèle pas toute seule « qui » a vendu, ni pourquoi.
- **EMA 5/13/34** : aide à décrire la dynamique à plusieurs vitesses ; une EMA5 orange sous EMA13 rose est compatible avec une faiblesse à court terme, mais n'est pas une décision d'achat/vente.

---

## 3. Les flux ETF : série contrôlée du 2 au 6 novembre

**Source principale** : tableau Farside, colonnes ETF US Spot BTC, flux nets en **millions de dollars américains (M$)**.  
**Source de confrontation** : article The Block du 7 novembre annonçant une semaine à environ −1,28 milliard de dollars.  
**Ne pas confondre** les dates de séances ETF avec les horaires UTC des bougies OKX.

| Séance (USA) | Flux net ETF BTC (M$) | Nature | Statut |
|---|---:|---|---|
| 2026-11-02 | **−398,6** | sortie | Recoupé |
| 2026-11-03 | **−115,6** | sortie | Recoupé |
| 2026-11-04 | **+74,6** | entrée | Recoupé |
| 2026-11-05 | **−430,2** | sortie | Recoupé |
| 2026-11-06 | **−411,9** | sortie | Recoupé |
| **TOTAL 2–6 nov.** | **−1 281,7** | quatre jours négatifs, un jour positif | Somme arithmétique des cinq séances |

Calcul : `-398.6 -115.6 +74.6 -430.2 -411.9 = -1281.7 M$`.

**9 novembre — chiffre à réconcilier avant automatisation :** une compilation TFTC du 10/11 rapporte **−201,1 M$** (dont IBIT −213,2 M$, MSBT +22,1 M$, ARKB −9,9 M$). Certaines captures/indexations de Farside pour le 9/11 affichent des colonnes incomplètes ou un total différent. **Ne pas inscrire −201,1 M$ comme « valeur Farside définitivement confirmée »** sans recharger la table complète et préserver son horodatage de consultation. Conserver le drapeau `ETF_FLOW_REVISION_PENDING` tant que ces sources divergent.

Le **dimanche 8 novembre**, il n'y a pas de séance des ETF américains au comptant. Cela ne signifie pas que les investisseurs étaient inactifs sur les plateformes crypto, ouvertes 24 h/24.

Sources :
- Farside, tableau ETF BTC : https://farside.co.uk/btc/
- Farside, série exhaustive (autre vue) : https://farside.co.uk/bitcoin-etf-flow-all-data/
- The Block, bilan de la semaine du 2–6 novembre, publié le 07/11 : https://www.theblock.co/news/markets/2026-11-07-bitcoin-etfs-flip-negative-for-2026-after-1-28-billion-outflow-week-worst-since-june-435984
- TFTC, agrégation du 9 novembre, **pour recoupement non définitif** : https://www.tftc.io/bitcoin-etf-flows/november-2026

---

## 4. Chronologie du marché et des événements (les horloges comptent)

**Toutes les heures de cette section, lorsqu'elles sont indiquées en UTC, doivent être converties en Paris par `UTC + 1 h` au 10 novembre 2026.** L'heure de séance « 5 novembre » d'un ETF américain n'identifie pas l'heure d'exécution d'une bougie OKX.

| Date / fenêtre | Fait disponible | Interprétation possible | Niveau de preuve |
|---|---|---|---|
| 2–3 nov. | Flux ETF négatifs : −398,6 M$ et −115,6 M$ | Faiblesse de demande institutionnelle | **Flux prouvés** ; effet sur une bougie précise non prouvé |
| 4 nov. | ETF +74,6 M$ ; selon Bitfinex, BTC monte vers 81 238 $ | Rebond technique et repositionnement | **Événements recoupés**, causalité unique non prouvée |
| 5 nov. | ETF −430,2 M$ ; forte correction du marché dans les analyses de la période | Réduction du risque, potentiellement renforcée par dérivés | **Journée ETF vérifiée**, détails d'ordres OKX non collectés |
| 6 nov. | ETF −411,9 M$ | Contexte défavorable persistant | **Flux vérifié**, pas une vente Spot exacte |
| 8 nov. (dimanche) | Chute BTC vers ~73,5 k$ selon Bitfinex / médias ; fortes liquidations sur dérivés | Débouclage de positions à levier peut accélérer la baisse | **Épisode attesté** ; volumes Spot OKX minute par minute non audités |
| 9 nov. | Publication The Block : >1,15 Md$ de liquidations crypto en 24 h, dont >1,04 Md$ de positions longues ; ~309 M$ concernent BTC selon CoinGlass | Épisode de désendettement, pas exclusivement BTC ni OKX | **Agrégat multi-plateformes/produits** ; ne pas le reporter comme volume Spot BTC-USDC |
| 10 nov. 13:xx Paris | Captures utilisateur Trader `40.6.719` : prix de référence proche de 74 k$, EMA 5/13/34, barres de volumes Spot | Tendance visuellement fragile | **Observation de capture**, pas extraction du carnet historique |

**Important :** les liquidations « >1 milliard » correspondent à une fenêtre glissante de 24 h sur *l'ensemble des crypto-actifs et plusieurs plateformes*, et non à « un milliard de BTC vendus sur OKX à 21:55 UTC ». Les montants varient selon le fournisseur et l'heure de prélèvement : conserver ces deux champs lors de la reprise.

Sources :
- Bitfinex Alpha, 09/11/2026 : https://blog.bitfinex.com/bitfinex-alpha/after-the-equity-rout-cpi-sets-direction/
- The Block, liquidations, 09/11/2026 : https://www.theblock.co/news/markets/2026-11-09-bitcoin-loses-50-week-moving-average-as-24-hour-crypto-long-liquidations-top-1-billion-436102
- Bitcoin.com, chute du 08/11 : https://news.bitcoin.com/fr/market-updates/le-bitcoin-sous-74-000-dollars-liquidations-superieures-a-1-milliard/

---

## 5. Transcription intégrale de la logique de l'infographie (sans image)

### Panneau 1 — « Les faits externes vérifiés »

- **02/11** : ETF Bitcoin US **−398,6 M$**.
- **03/11** : ETF Bitcoin US **−115,6 M$**.
- **04/11** : ETF Bitcoin US **+74,6 M$**.
- **05/11** : ETF Bitcoin US **−430,2 M$**.
- **06/11** : ETF Bitcoin US **−411,9 M$**.
- **08/11** : **dimanche, ETF américains fermés** ; les marchés crypto, eux, sont ouverts.
- **Ne jamais conclure** qu'un retrait ETF est l'auteur identifié d'une bougie rouge.

### Panneau 2 — « Ce que montre notre Trader »

Le graphique est un espace **candlesticks / bougies BTC-USDC**. Les trois courbes étudiées sont :

- **EMA 5, orange :** moyenne exponentielle rapide, suit de près les derniers cours.
- **EMA 13, rose :** moyenne exponentielle intermédiaire.
- **EMA 34, bleu cyan :** moyenne exponentielle plus lente, tendance plus large.

Les **barres verticales tout en bas** forment l'histogramme de volume échangé sur l'intervalle de la bougie. Hauteur élevée = plus grand volume sur cette bougie, **pas** « preuve que les vendeurs étaient plus nombreux ». La couleur suit conventionnellement la direction de la bougie, pas la répartition nette des achats et ventes initiés.

**Lecture visuelle de novembre 2026 :** à droite de plusieurs captures, EMA5 orange sous EMA13 rose, et EMA34 au-dessus du prix. Cela est compatible avec une dynamique baissière. La capture ne donne pas les valeurs numériques complètes des EMA à chaque timestamp : **ne pas annoncer un croisement exact calculé si la série de clôtures n'a pas été chargée**.

### Panneau 3 — « Lecture des événements »

- **5 novembre :** sortie nette ETF importante, contexte général de marché défavorable.
- **8 novembre :** chute un dimanche, accompagnée de liquidations, alors que les ETF américains sont fermés.
- **Interprétation centrale :** plusieurs mécanismes peuvent se cumuler. Le contexte extérieur aide à expliquer, **mais n'attribue pas l'auteur de chaque transaction Spot**.

### Panneau 4 — « Workflow IA pour reprendre l'analyse »

1. Lire les bougies **de l'instrument exact** `BTC-USDC` sur OKX (pas BTC-USD agrégé et pas BTC-USDT substitué).
2. Calculer EMA5/13/34 et décrire les volumes pour les mêmes unités de temps.
3. Comparer avec les **flux ETF par jour de séance**, puis les événements macro et liquidations selon leurs heures réelles.
4. Séparer les faits, les hypothèses et la causalité **non démontrée**.
5. Conclure avec niveaux d'observation, invalidation et demande éventuelle de nouvelle preuve, **sans signal d'ordre réel**.

### Message final de l'image

> Les sorties ETF sont un élément de contexte. Les liquidations peuvent amplifier une chute. Une reprise convaincante doit être étudiée via prix, EMA et volumes, sans transformer ces indicateurs en certitude de hausse.

**Limite de l'infographie produite par IA :** le graphique qu'elle redessine est un **support pédagogique stylisé**, et non un export fidèle des chandeliers et EMA d'OKX. Ce Markdown et les données brutes horodatées priment sur toute coordonnée, graduation ou valeur représentée dans l'illustration.

---

## 6. Captures de terrain : ce qui peut réellement être transcrit

Les valeurs suivantes proviennent des **captures fournies dans la conversation**, et ne constituent pas un nouveau téléchargement des données brutes d'OKX.

### Capture de ~13:28 Paris, 10 novembre

- Trader affiché `40.6.719` ; graphique **BTC-USDC**, mode **Bougies**, affichage **USD**, bouton **EMA activé**, bouton **MA désactivé**, période **1j** affichée.
- Bougie sélectionnée : **09/11/2026 à 17:00** (libellé de la capture), ouverture **75 455,2 USDC**, plus haut **75 479,5**, plus bas **74 040,4**, clôture **74 278,3**, variation **−1,56 %**, volume **462,9339 BTC**.
- EMA5/13/34 sont visibles. Sur l'extrémité droite, la courbe EMA5 orange se trouve sous EMA13 rose ; orientation générale vers le bas.
- Plus bas graphique annoté : **73 380 USDC** ; ceci est un **minimum graphique constaté**, pas une garantie de support.
- La valeur de la carte de marché sous le graphique peut dater d'un autre instant que la bougie sélectionnée.

### Capture de ~13:38 Paris, 10 novembre

- Une sélection affiche **« 10 novembre à 09:00 · BTC-USDC · 4h »**, avec ouverture **74 754,7**, plus haut **74 811,4**, plus bas **74 040,4**, clôture **74 353,7**, variation **−0,54 %**, volume **109,6491 BTC**.
- **Avertissement d'intégrité :** en haut de cette même capture figure également un libellé de graphique « BTC-USDC · 1j · 300 bougies ». **Ne pas mélanger les 109,6491 BTC de la bougie sélectionnée 4h et les volumes journaliers** tant que l'état effectif de la sélection et les timestamps de bougies n'ont pas été exportés. Le décalage visible doit être décrit, pas effacé.
- Le dernier prix visible en barre de marché se situe aux environs de **74 181 $** : il ne s'agit **pas** du prix de clôture de la bougie sélectionnée.

### Ce que les captures ne prouvent pas

- Aucun **sens `buy` ou `sell` du taker** pour chaque trade Spot, ni registre des ordres historiques agrégés à la minute ;
- aucune **identité** d'acheteur, de vendeur, de teneur de marché ou de fonds ETF ;
- aucun **niveau exact calculé** de chaque EMA à la dernière clôture validée ;
- aucune relation mathématique déterministe entre une somme de dollars d'ETF et des BTC échangés sur OKX.

---

## 7. Procédure de reprise de l'analyse par une autre IA

### Entrées minimales

```text
instrument             = BTC-USDC
venue                   = OKX SPOT
timezone_source         = UTC
timezone_reporting      = Europe/Paris
analysis_window_utc     = 2026-11-02T00:00:00Z ... 2026-11-10T23:59:59Z
focus_sunday_utc        = 2026-11-08T21:40:00Z ... 2026-11-08T22:10:00Z
candle_intervals        = [1m, 15m, 4H, 1Dutc]
ema_periods             = [5, 13, 34]
external_reference      = ETF BTC US spot flows (daily session, USD millions)
derivatives_reference   = liquidations by exchange/asset/product/timestamp (USD)
execution_permission    = READ_ONLY
```

**La fenêtre dimanche est une zone de recherche**, pas un ordre de vente et pas la preuve que la chute était exactement sur OKX BTC-USDC à une minute déjà déterminée.

### Étapes reproductibles

1. **Récupérer les bougies OKX** de `BTC-USDC` avec `GET /api/v5/market/history-candles?instId=BTC-USDC&bar=...` et/ou données historiques téléchargeables ; contrôler le champ `confirm=1` avant de tirer une conclusion d'une clôture. Conserver `ts`, `o`, `h`, `l`, `c`, `vol`, `volCcy`, `volCcyQuote`, `confirm` ainsi que la requête utilisée.
2. **Récupérer la granularité minute** autour des événements, sans convertir une bougie 4h en 1j, et sans inférer les bougies manquantes. Si les captures et la série brute divergent, enregistrer les deux comme observations de provenance distincte.
3. **Calculer les EMA sur les clôtures de la même série** : pour une fenêtre N, `alpha = 2/(N+1)` puis `EMA_t = alpha*C_t + (1-alpha)*EMA_(t-1)` ; conserver la convention d'initialisation (par exemple SMA sur N premières clôtures) et une période d'échauffement suffisante. N = nombre de **bougies**, pas forcément de jours.
4. **Identifier les pics de volume** en BTC relativement à une médiane ou moyenne mobile des volumes de la *même granularité*. Ne pas comparer directement 462,93 BTC/1j et 109,65 BTC/4h.
5. **Récupérer si possible les transactions publiques historiques** de `BTC-USDC`, horodatées, avec `side` du preneur (`buy`/`sell`), `px`, `sz`. Mesurer alors la part notionnelle des trades initiés à l'achat/vente, et non compter les barres rouges comme ventes. Documenter couverture, paginations, manques et échantillonnage.
6. **Rapprocher** les bougies et volumes (UTC) des publications de liquidations (UTC), mais **ne pas attribuer** les liquidations de futures à des trades Spot identifiés sans source explicite.
7. **Ajouter les flux ETF** par **jour de cotation aux États-Unis**, avec horodatage de publication du chiffre et statut de révision. Une somme journalière ne devient pas un tick d'exécution.
8. **Comparer les hypothèses concurrentes** : baisse liée à l'appétit pour le risque, ventes Spot, liquidations, faible liquidité dominicale, prises de profits après le rebond du 4 novembre. Chercher activement ce qui contredit chaque récit.
9. **Délivrer une conclusion bornée** : faits datés, compatibilités, contradictions, données absentes, niveaux/conditions à surveiller, et **aucune action automatique**.

### API et documents utiles

- Documentation OKX V5 : https://www.okx.com/docs-v5/en/
- Données historiques OKX Europe : https://www.okx.com/fr-fr/historical-data
- Endpoint bougies publiques OKX (exemple d'URL, pas une preuve d'appel effectué) : `https://www.okx.com/api/v5/market/history-candles?instId=BTC-USDC&bar=1H`
- Recherche de trades : `GET /api/v5/market/history-trades`, en contrôlant la disponibilité, les limites de pagination et la période historique réellement retournée ; à défaut, utiliser les exports historiques officiels.

### Sortie structurée recommandée pour le robot documentaire

```yaml
study_id: BTC_FLOW_CROSSCHECK_2026_11_02_2026_11_10
status: HISTORICAL_EDUCATIONAL
asset: BTC
spot_instrument: BTC-USDC
venue: OKX
raw_spot_candles_downloaded: false
raw_spot_trades_downloaded: false
etf_daily_series_2026_11_02_to_06: VERIFIED
etf_2026_11_09: REVISION_PENDING
liquidations_2026_11_08: MULTI_VENUE_DERIVATIVES_PUBLIC_REPORT
spot_causality_identified: false
ema_numeric_recomputed_from_raw: false
analysis_permission: READ_ONLY
real_orders_allowed: false
current_market_price_claimed: false
```

**Le bloc ci-dessus décrit l'état réel du dossier au moment de sa rédaction**. Une future IA devra changer les drapeaux uniquement après avoir effectivement téléchargé, vérifié et conservé les nouvelles données.

---

## 8. Grille d'évaluation : observer → interpréter → vérifier

| Question | Preuve minimale | Ce que l'IA peut écrire | Ce qu'elle ne doit pas écrire |
|---|---|---|---|
| Le prix baisse-t-il ? | Bougies Spot datées, instrument, périodes | « Les clôtures sur la fenêtre X baissent » | « Ce fonds ETF vend sur OKX maintenant » |
| Le volume augmente-t-il ? | Volumes de bougies comparables, même timeframe | « Activité élevée sur une bougie baissière » | « 90 % de vendeurs », faute de sens des trades |
| Les EMA indiquent-elles une reprise ? | Clôtures confirmées + EMA calculées et valeurs | « EMA5 croise EMA13 à tel timestamp » | « Hausse garantie » |
| Les ETF sortent-ils ? | Série ETF journalière et statut de révision | « Flux net négatif de X M$ pour cette séance » | « X M$ ont été vendus sur OKX à 15 h » |
| Les liquidations amplifient-elles le mouvement ? | Publications horodatées par produit/plateforme | « Hypothèse compatible avec l'épisode » | « La totalité des liquidations a vendu du Spot BTC-USDC » |
| Y a-t-il une causalité exacte ? | Chaîne de preuves directe et circonstanciée | « Preuve directe disponible / non disponible » | Attribution d'un acteur ou d'une cause unique sans trace |

### Scénarios purement pédagogiques

- **Poursuite baissière :** nouveaux plus bas sur clôtures confirmées, EMA5 inférieure à EMA13, activité accrue sur les descentes ; surveiller les ruptures de zone mais ne pas prédire la date d'un point bas.
- **Stabilisation :** cours oscillant dans une zone, EMA qui s'aplatissent, volumes sans accélération directionnelle nette ; ce n'est pas un signal d'achat automatique.
- **Reprise plausible :** creux et sommets ascendants, EMA5 croisant EMA13 vers le haut, et volumes sur bougies haussières supérieurs à leur référence ; une confirmation plus large est nécessaire. Les nouvelles ETF peuvent compléter le contexte sans le remplacer.

Les niveaux graphiques historiques `73 380` et `~79 590,9` USDC mentionnés dans plusieurs captures sont **des repères datés**, pas des prix d'exécution, ni des barrières garanties, ni des objectifs conseillés.

---

## 9. Confidentialité, sécurité et discipline de publication

- Ce dossier repose sur **des cours et flux publics et sur des captures du graphique**. Il ne requiert **aucune donnée privée du compte OKX**, ni soldes, ni identifiants, ni frais personnels, ni transactions personnelles.
- **Ne publier dans un dépôt public aucune capture de l'espace authentifié OKX** sans un accord séparé et une vérification de la confidentialité. L'image pédagogique peut faire l'objet d'un asset distinct si sa publication est autorisée ; la lecture du Markdown doit rester complète sans cet asset.
- Ne pas confondre l'analyse et un bot de trading : un bot d'observation/PAPER peut suivre ces règles, mais **l'exécution réelle requiert une autorisation et une architecture de sécurité séparées**. Le Bridge actuel du projet est prévu **en lecture seule**.
- Ce fichier est une **photographie historique** du 10 novembre. Pour une reprise future, revalider la tête `main`, le build du Trader, l'état des sources et les séries horodatées plutôt que considérer ce rapport comme « live ».
- En cas de divergence de données, publier une note de conflit traçable avec sources et horodatages ; ne pas effacer silencieusement les anciennes valeurs.

---

## 10. Sources et fiabilité — registre à conserver avec le dossier

| ID | Source | Élément appuyé | Périmètre et précautions |
|---|---|---|---|
| S1 | https://farside.co.uk/btc/ | Flux quotidiens ETF, 2–6 nov. 2026 | Vue publique susceptible de mises à jour, notamment le 9 nov. |
| S2 | https://farside.co.uk/bitcoin-etf-flow-all-data/ | Vérification détaillée par fonds | Horodatage de consultation à enregistrer lors d'une reprise |
| S3 | https://www.theblock.co/news/markets/2026-11-07-bitcoin-etfs-flip-negative-for-2026-after-1-28-billion-outflow-week-worst-since-june-435984 | −1,28 Md$ pour la semaine du 2–6 nov. | Article publié le 7 novembre 2026 |
| S4 | https://www.tftc.io/bitcoin-etf-flows/november-2026 | −201,1 M$ du 9 nov., à rapprocher de Farside | **PROVISOIRE / divergence possible** |
| S5 | https://www.theblock.co/news/markets/2026-11-09-bitcoin-loses-50-week-moving-average-as-24-hour-crypto-long-liquidations-top-1-billion-436102 | Agrégat liquidations crypto 24 h, 9 nov. | Dérivés multi-places/multi-actifs, **pas** Spot OKX |
| S6 | https://blog.bitfinex.com/bitfinex-alpha/after-the-equity-rout-cpi-sets-direction/ | Interprétation hebdomadaire, niveaux et bas du 8 nov. | Analyse éditoriale, niveaux non garanties |
| S7 | https://news.bitcoin.com/fr/market-updates/le-bitcoin-sous-74-000-dollars-liquidations-superieures-a-1-milliard/ | Chute dominicale en minutes | Prix/plateformes agrégés, précision variable |
| S8 | https://www.okx.com/fr-fr/historical-data | Existence d'exports de données historiques | Disponibilité exacte de l'instrument et du millésime à vérifier |
| S9 | https://www.okx.com/docs-v5/en/ | Endpoints bougies et transactions, conventions d'unités | Documentation d'API ; vérifier schéma/version lors de l'implémentation |
| T1 | Captures du Trader ERITH.IA, 10/11/2026 13:28 et 13:38 Paris | Libellés, OHLC, volumes, EMA visibles | **Source conversation utilisateur, non versée dans ce dépôt** |
| V1 | Image pédagogique produite dans le chat « Comprendre les flux BTC » | Schéma pour apprendre | **Illustration**, ne pas utiliser ses tracés comme données financières brutes |

### Journal de validation à reprendre

```text
[2026-11-10] Textualisation du graphique et de l'infographie : OUI.
[2026-11-10] Valeurs ETF des 2, 3, 4, 5 et 6 novembre : RECOUPÉES.
[2026-11-10] Valeur ETF du 9 novembre : CONFLIT / RÉVISION À CONTRÔLER.
[2026-11-10] Épisode de liquidations dérivés du 8–9 novembre : DOCUMENTÉ PAR SOURCES SECONDAIRES.
[2026-11-10] Extraction brute des transactions Spot OKX à la minute : NON EFFECTUÉE.
[2026-11-10] Calcul indépendant des EMA depuis bougies téléchargées : NON EFFECTUÉ.
[2026-11-10] Attribution d'une bougie à un ETF ou à un acteur donné : NON DÉMONTRÉE.
[2026-11-10] Signal d'ordre réel ou performance financière : AUCUN.
```

**Critère de clôture** : une prochaine IA peut expliquer la situation, retrouver les sources, comparer les unités, signaler les incertitudes et relancer la méthode sans image, sans intervention sur le compte et sans inventer de causalité.

---

*Seven Heaven · ERITH.IA Agent-Crypto — Document pédagogique transmissible, mais données de marché datées. Lecture seule, preuve d'abord, arrêt net.*