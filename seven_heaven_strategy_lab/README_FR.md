# Seven Heaven Strategy Lab — V4.5 Aether Research + Forensics

**Version 4.5.0 · Windows Python 3.13 · Port 8777 en local · Internet public autorisé · PAPER uniquement.**

Seven Heaven Strategy Lab est un laboratoire autonome Python/Windows, en développement progressif : archives publiques authentifiées, stratégies composables, simulations PAPER et analyses professionnelles. La V4.2 étend le cockpit premium bleu nuit, or et cyan avec le **graphique historique directement lié à chaque rapport**, sans dépendre des interfaces Administrator ou Trader, sans clés privées ni ordre réel.

## V4.5 — Aether Research : comparer les filtres d'entrée sur le même historique

**But :** la V4.4 explique pourquoi une transaction PAPER a eu lieu ; la V4.5 compare **des variantes prédéfinies** de la stratégie sur des **fenêtres chronologiques identiques**, sans attribuer rétrospectivement un pouvoir prédictif à un filtre.

- Dans **Atelier de configuration**, sélectionner **Ma stratégie personnalisée** (ou **Croisement EMA**). Cliquer sur **Comparer 5 variantes de filtres · Aether Research V4.5**. Les autres familles ne sont pas prises en charge par ce comparateur de filtres EMA.
- Les variantes préétablies sont : **configuration d'origine**, **sans filtre**, **RSI sous 60**, **RSI sous 45**, **volume au moins 1,2 fois sa moyenne**. Une variante identique au profil d'origine est fusionnée pour éviter les essais redondants (5 variantes maximum).
- L'entrée, la sortie, les EMA, les périodes RSI/volume, les stops/targets fictifs, le même actif, le timeframe, le capital PAPER, les frais et le glissement sont **maintenus identiques** : **seul le filtre d'entrée change**. La stratégie EMA classique est reproduite par son équivalent déclaratif d'entrée/sortie EMA dans le moteur autonome, sans changement de transactions financières.
- Sur les **anciennes bougies d'entraînement uniquement**, le moteur compare les variantes avec le score préétabli **rendement net + 0,35 × drawdown négatif**. Les variantes qui n'ont aucune position clôturée sur l'entraînement ne sont pas éligibles au titre de « meilleure stratégie ». Si aucune variante n'est éligible, le programme **conserve le profil d'origine**, sans annoncer de gagnant.
- La variante retenue est ensuite simulée sur **des périodes strictement ultérieures** (une fenêtre avec 150–299 bougies dans le timeframe étudié, deux fenêtres dès 300). Toutes les autres variantes sont également évaluées sur ces **mêmes périodes**, mais leurs résultats sont affichés **pour transparence, pas pour changer le choix du passé**. Les références Buy & Hold 50 % et conservation de la devise de cotation sont calculées sur ces mêmes périodes.
- Le nouveau **Studio des stratégies comparées** affiche les choix et scores des deux périodes, les tableaux détaillés de chaque variante, les écarts en points de pourcentage face au profil d'origine, l'impact de frais et glissement ×2, et les cas de simulation sans transaction.
- **Limites explicites :** il ne s'agit **pas** d'un test aveugle si les dates ont été précédemment vues ; le capital et les indicateurs redémarrent à chaque fenêtre. Les seconds entraînements peuvent réutiliser les anciennes dates de validation. Les figures sur les fenêtres ultérieures ne prouvent pas qu'un filtre évitera à l'avenir une perte observée. Aucun ordre réel ou simulation de carnet historique.
- **Indépendance et économie USB :** calcul local en mémoire, **aucun nouveau fichier dans workspace/**, aucune dépendance Freqtrade/Hummingbot, aucun téléchargement additionnel pour l'étude. Le nouveau module s'appuie sur le moteur V4 et conserve V4.1 Quant, V4.2 Microscope, V4.3 Scientific et V4.4 Forensics.
- **Étape suivante** : après réception locale V4.5, comparer des profils choisis avec Yoann, étendre à d'autres règles et gérer un budget de risque plus réaliste sans fabriquer de performances.

## V4.4 — Aether Forensics : pourquoi chaque transaction PAPER a-t-elle eu lieu ?

- Dans **Lecture de la simulation**, une nouvelle section **« Anatomie des décisions PAPER »** présente les positions clôturées et ouvertes, les gains/pertes nets, les frais, la durée, les points d'entrée/sortie fictifs et **la véritable condition du moteur qui les a déclenchés**.
- **Audit causal exact** : une relecture en mémoire sur les **mêmes bougies SHA-256 vérifiées** recalcule la simulation à partir de ses paramètres sauvegardés, contrôle les UTC et les fills originaux (sens, quantité, prix, frais, cash après chaque opération) et le capital final. **Si un seul écart dépasse les tolérances d'arrondi, l'analyse refuse d'attribuer un motif**. Les rapports antérieurs V1→V4.3 sans trace explicite des raisons sont compatibles grâce au rejeu, sans migration de leurs JSON.
- **Origine du déclenchement** : croisement EMA, sortie/entrée Bollinger, règle personnalisée EMA/RSI/volume, stop ou objectif vérifié après la dernière clôture, DCA programmé ou Buy & Hold initial. Le filtre présent est explicité. Plusieurs raisons simultanément vraies sont conservées, sans en inventer un unique motif.
- Chaque fiche contient le résultat **net** des frais des deux côtés et des prix supposés après glissement ; les dates de signal sont les **ouvertures UTC des bougies closes** (et non une garantie d'exécution instantanée). Les positions encore ouvertes sont distinguées et ne sont jamais comptées comme des opérations gagnées/perdues.
- **MFE / MAE** : meilleure/pire excursion de cours constatée **après l'entrée** sur les mèches OHLC pendant la détention. La bougie de sortie est exclue, car la vente fictive se produit à son ouverture. Ces excursions sont descriptives **a posteriori**, sans ordre chronologique intra-bougie ni garantie de prix exécutable. Pour les achats multiples (DCA), elles restent non calculables plutôt que d'imaginer un point d'entrée unique.
- **Ergonomie professionnelle** : fiches repliables, filtrage « Toutes / Pertes / Gains / Ouvertes », couleurs différenciées, source et intégrité visibles. Le diagnostic est calculé localement sur demande par l'interface : **aucun JSON de développement ni journal supplémentaire** dans la clé USB.
- **Aucune promesse de performance** : conclure qu'un filtre aurait évité une perte exige un **autre backtest contrôlé** et non une déduction à partir des transactions passées. Cette version ne prétend pas faire cela.
- **Indépendance** : Python natif + HTML/CSS/JS/SVG local ; aucun Freqtrade, Hummingbot, TradingView ou compte/exécution réelle nécessaires. Fills fictifs, sans carnet historique ni file Maker.
- Références méthodologiques indépendantes : [Backtrader Trade Analyzer](https://www.backtrader.com/docu/analyzers-reference/), [Backtrader Trade](https://www.backtrader.com/docu/trade/), [MFE/MAE dans les tests historiques](https://www.strateda.com/docs/backtesting/mae-vs-mfe-analysis).
- Les versions déjà validées V4.2 (microscope) et V4.3 (robustesse) restent disponibles, avec leurs données et méthodes inchangées ; le module V4.4 ne touche pas au fonctionnement des ordres hypothétiques, il ne fait qu'enrichir la traçabilité.

## V4.3 — Aether Scientific : robustesse chronologique et hypothèses de coûts

- **Nouvelle fonctionnalité** : bouton **« Éprouver cette stratégie dans le temps »** dans l'Atelier ; résultats dans **Laboratoire de robustesse**. Travaille sur la même archive Binance/OKX dont l'identifiant et le SHA-256 sont validés avant lecture. Toutes les études restent locales, **PAPER uniquement**.
- **Séparation chronologique stricte** : sur au moins 150 bougies de la résolution de simulation, le code utilise une partie antérieure pour choisir la configuration puis une partie ultérieure pour la tester. Sur 150–299 bougies : un découpage 60 % / 40 %. Dès 300 bougies : deux expériences à entraînement croissant, première vérification sur le troisième quart de l'historique et seconde sur le dernier quart (non superposées).
- Pour **EMA ou stratégie personnalisée**, comparer au maximum cinq couples EMA (celui de l'utilisateur + 8/21, 10/30, 12/32 et 20/50) sur l'**entraînement uniquement** et retenir le meilleur score `rendement net + 0,35 × drawdown maximal négatif`. Les conditions RSI/volume, stop/objectif et frais restent inchangés. Pour **Bollinger, DCA, Buy & Hold et Cash**, garder les paramètres sélectionnés, sans optimisation EMA inutile.
- **Vérification ultérieure** : rejouer la stratégie sélectionnée sur des bougies chronologiquement postérieures, sans voir les résultats de test au moment du choix. Comparer avec **Buy & Hold 50 %** et **conservation de la devise de cotation** sur la même fenêtre. Afficher rendement, drawdown, frais, nombre de fills, dates UTC et moyennes des fenêtres, **sans les cumuler fictivement**.
- **Sensibilité aux coûts** : mêmes bougies et paramètres, mais frais ×2, glissement ×2, puis les deux ×2 ; bornes maximales 1 % et 2 % par côté respectivement, conformes au moteur actuel.
- **Limites scientifiques affichées** : les paramètres ont pu être ajustés auparavant en voyant ces dates ; ce n'est donc pas automatiquement un test hors échantillon vierge. Les portefeuilles démarrent avec un capital neuf sur chaque fenêtre, sans reprise de positions ; les indicateurs doivent passer leur warm-up normal dans chaque fenêtre. Le second entraînement inclut des observations de la première validation. Les prix d'exécution sont toujours hypothétiques à l'ouverture suivante, sans carnet de liquidité.
- **Aucune multiplication de fichiers sur la clé** : l'étude V4.3 est calculée **en mémoire et renvoyée à l'écran**, sans créer des journaux JSON supplémentaires. Les anciens résultats, profils, comparaisons et `workspace/` ne changent pas.
- **Ergonomie corrigée** : dans le tableau « Dernières transactions hypothétiques », l'unité de quantité devient **BTC ou ETH selon la paire**, et non « BTC » pour toutes les opérations. Le reste du moteur V4.2 et le microscope sont conservés intacts.
- Références de méthode externes (étudiées, **pas** de dépendances installées) :
  - [QuantConnect — Walk Forward Optimization](https://www.quantconnect.com/docs/v2/writing-algorithms/optimization/walk-forward-optimization)
  - [Freqtrade — Lookahead Analysis](https://www.freqtrade.io/en/stable/lookahead-analysis/)
  - [Freqtrade — Recursive Analysis](https://docs.freqtrade.io/en/stable/recursive-analysis/)
- Ces validations ne promettent aucun rendement, ne reproduisent pas un carnet d'ordres et ne permettent **aucun ordre réel**, aucun compte ni aucune clé d'exchange.

## V4.2 — Microscope professionnel des bougies historiques

- Dans **Lecture de la simulation**, le nouveau **Microscope des bougies** affiche les bougies **OHLCV** et leurs volumes, uniquement sur la paire, la fenêtre et l'échelle de la **simulation enregistrée**.
- L'historique est vérifié avec l'identifiant de source et son SHA-256 avant chaque fenêtre graphique. Les bougies 4h proviennent de l'agrégation stricte de quatre bougies 1h closes (ou du 1m de la source Binance) ; **aucune donnée live Administrator ou carnet actuel n'est mélangé**.
- Le graphique est réalisé en **SVG local**, sans TradingView, Freqtrade, Hummingbot, CDN, nouveaux paquets Python, scripts d'upgrade ni accès au compte. Le programme reste exploitable hors ligne pour les données déjà archivées.
- Zoom par fenêtres de **60/90/120/180 bougies**, boutons précédent/suivant et curseur temporel. Survol des bougies : UTC, ouverture, maximum, minimum, clôture et volume.
- Superpositions facultatives : **EMA rapide/lente**, **SMA20**, **Bollinger** avec les paramètres enregistrés et **VWAP quotidien approximatif** calculé sur le prix typique OHLCV pondéré par le volume. Cette VWAP n'est pas une vraie VWAP calculée sur chaque transaction.
- Marqueurs **▲ BUY / ▼ SELL PAPER** au prix d'exécution supposé à l'**ouverture suivante**. Ce sont les remplissages fictifs du rapport conservé, **pas** les signaux de l'indicateur, ni des ordres réels.
- **Protection contre la confusion de mode** : si un paramètre de l'Atelier change après une simulation, un encadré indique clairement que la zone de résultats affiche encore le dernier rapport. Aucune simulation n'est lancée automatiquement.
- Les six stratégies de référence, le créateur V4, l'analyse des risques V4.1, les historiques vérifiés, les profils et le dossier personnel `workspace/` sont **conservés sans migration**. Les anciens rapports dépourvus de provenance fiable ne reçoivent pas de faux graphique.
- La recette GitHub (Python 3.13, Windows, Chromium, API locale, données OKX publiques, tests du moteur et marqueurs PAPER) est distincte de la validation à faire sur le Firefox du propriétaire.

## V4.1 — analyse professionnelle intégrée (conservée)

- Sous le graphique du portefeuille, le **Desk Aether Quant** présente les positions **entièrement clôturées**, le **taux de réussite des sorties**, le **profit factor**, le **temps en position**, le **résultat réalisé** et le **résultat latent**. Un graphique distinct affiche le **drawdown historique**.
- Les positions encore ouvertes ne sont **pas** comptées comme gagnantes ou perdantes. Les six stratégies existantes, les stratégies personnelles et leurs prix d'exécution fictifs ne changent pas.
- Le calcul des résultats réalisés prend en compte les entrées multiples (DCA), leurs frais, les frais de sortie et les prix simulés qui incluent le glissement. Le latent valorise l'inventaire encore détenu à la dernière clôture.
- Lorsque aucune sortie n'existe, le taux de réussite et le profit factor sont **non calculables**. Un profit factor sans aucune perte clôturée est signalé sans annoncer de score artificiellement infini.
- Le drawdown maximal est calculé sur **toutes** les bougies historiques, tandis que le graphique est échantillonné pour la lisibilité. L'écart au scénario sans frais ni glissement ne se réduit pas à une soustraction des commissions.
- Les rapports V1–V4 enregistrés sans ces nouvelles données restent lisibles ; les nouvelles cartes restent masquées pour ces anciens rapports au lieu d'inventer des statistiques.
- Recherche inspirée des pratiques documentées de TradingView Strategy Tester, Freqtrade lookahead-analysis et NautilusTrader (granularité de données). Nous n'installons aucune de ces dépendances dans le programme.

## V4 — créateur de stratégies indépendant, sans bot externe obligatoire

- Dans **Atelier de configuration → Ma stratégie personnalisée**, combiner une règle d'entrée (**croisement EMA haussier** ou **prix au-dessus de l'EMA lente**), un filtre optionnel (**RSI** ou **volume**) et une règle de sortie (**croisement EMA baissier**, **prix sous l'EMA lente**, **RSI**).
- Ajuster EMA 10/30, RSI, volume, stop-loss fictif et objectif fictif. **0 % désactive** stop/objectif. Ces seuils sont vérifiés sur la **dernière bougie clôturée** puis supposés exécutés à l'ouverture suivante : pas de stop exchange natif ni de garantie de prix.
- Le moteur est **notre code Python indépendant**. Il valide une liste fermée de règles, sans exécuter de code Python, JavaScript ni expressions utilisateur. Pas de dépendance Freqtrade/Hummingbot, aucun ordre réel.
- Le bouton **Comparer ma stratégie aux six références** produit sept lignes sur les mêmes données, mêmes frais et même capital. Les six méthodes V3.1 sont conservées **inchangées**.
- Utiliser **Bibliothèque de tes profils** pour nommer, enregistrer et recharger une stratégie. Les profils et expériences V1/V2/V3/V3.1 restent lisibles dans le même `workspace/`, sans migration.
- Ce premier créateur est une **composition de règles prédéfinies**, pas encore un langage libre ou un automate temps réel. Le futur PAPER autonome est une étape distincte, avec validation des risques avant tout connecteur d'ordres.

## V3.1 — historiques étendus, conservés dans le programme

- La durée OKX est sélectionnable : **10, 30, 60 ou 90 jours** (240, 720, 1 440 ou 2 160 bougies horaires clôturées). Une **date de fin UTC facultative** permet de choisir une autre période historique.
- Date vide : le comportement V3 reste inchangé, avec collecte récente et alignement sur la dernière clôture complète 4h UTC. Date sélectionnée : période se terminant à 00:00 UTC (borne exclue).
- Chaque série historique a son identifiant et son SHA-256. Les archives V3 de 240 bougies restent compatibles avec la V3.1, sans migration. Les trous ou erreurs OKX entraînent un refus.
- La disponibilité des archives anciennes dépend d'OKX et n'est pas garantie ; le laboratoire ne fabrique jamais de bougies ni d'exécutions.
- **Livraison complète** : copier les fichiers de l'application dans le dossier existant (après arrêt de Python et sauvegarde de workspace/). Aucun script de correctif à exécuter. Le ZIP ne contient aucun dossier workspace, aucun fichier de tests et aucun outillage de développement.

## Fonctionnalités conservées de la V3.0

- L'archive Binance Spot **BTC/USDT de janvier 2026**, ses 44 640 bougies 1m, ses profils et résultats V1/V2 restent inchangés dans `workspace/`.
- Un nouvel encadré **Observatoire connecté OKX Spot** propose **BTC/USDC, ETH/USDC, BTC/USDT et ETH/USDT**. Ce sont des paires Spot explicites ; ce n'est pas un contrat de dérivés.
- Un clic sur **Collecter la période OKX** (libellé historique V3) interroge directement **les deux API publiques officielles** :
  - `GET https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId=BTC-USDC` (règles courantes, `state`, `tickSz`, `lotSz`, `minSz` ; exemple de paire).
  - `GET https://www.okx.com/api/v5/market/history-candles?instId=BTC-USDC&bar=1H&limit=100`, puis pagination bornée `after` pour récupérer les bougies plus anciennes.
- Le module conserve **240 à 2 160 bougies de 1 heure strictement clôturées et continues** selon la durée choisie ; la collecte récente se termine à la dernière frontière 4h UTC. Les bougies en formation `confirm=0`, trous/duplicates, réponses non conformes ou marchés suspendus font échouer l'import. **Aucun prix n'est inventé pour compléter un trou.**
- Les prix sont conservés dans `workspace/okx_sources/` avec manifeste indépendant : paire, source, intervalle, UTC, règles au moment de la collecte, empreinte SHA-256, date de capture et date de fin. Nouvelle collecte seulement sur demande ; un cache vérifié identique est réutilisé.
- Le sélecteur **Source pour les prochaines simulations** permet de revenir à la référence Binance V1/V2 ou de choisir une archive OKX déjà conservée. Pour OKX 1h, les simulations autorisées sont **1h ou 4h** (60 bougies 4h à partir des 240 bougies horaires). Aucun lissage artificiel en 1m/5m/15m.
- Les six méthodes internes (EMA, Bollinger, DCA, Hold 50/100 %, Cash), frais et glissement sont calculées sur **la même paire, la même source et le même intervalle** ; les rapports JSON portent l'identifiant exact et le SHA de la source. Le cockpit affiche correctement **BTC ou ETH** pour l'inventaire et **USDC ou USDT** pour le capital/frais.
- Le moteur reste **notre simulateur PAPER interne**. Les règles actuelles OKX `tickSz/lotSz/minSz` sont **observées et conservées comme métadonnées**, mais NE SONT PAS ENCORE APPLIQUÉES aux fills fictifs de cette version. Les frais `0,10 %` Taker sont l'hypothèse observée par le propriétaire à sa date de capture, **pas** une facture historique OKX prouvée. Les positions fictives sont remplies entièrement à l'ouverture de la bougie suivante ; elles ne représentent pas un historique réel du carnet.
- Aucun moteur natif Freqtrade/Hummingbot n'est encore intégré à la V3. Les travaux indépendants de ce type resteront distincts jusqu'à preuve d'exécution et de comparaison des règles.
- L'import d'une nouvelle archive est **refusé si la clé a moins de 2,5 Go libres**, pour protéger l'espace réservé aux fichiers Markdown et archives privées du propriétaire. Un cache déjà validé peut toujours être relu lorsque le disque descend sous cette réserve ; le programme ne supprime rien. Pour des importations plus lourdes, utiliser la clé 32 Go disponible après sauvegarde.

### Important sur la distinction « local / Internet / ordres »

Le serveur du cockpit écoute seulement `http://127.0.0.1:8777`, les requêtes des pages passent par ce serveur local, et ce serveur Python peut **sortir vers les API publiques OKX** lors d'un clic. Aucune clé API OKX, compte, portefeuille, mot de passe ni ordre réel ne sont nécessaires. Les résultats ne deviennent jamais de vrais achats/ventes.

## Mise à niveau sur la clé USB depuis la V4.3 déjà validée

1. Fermer la fenêtre noire `Seven Heaven Strategy Lab` (Ctrl+C), puis garder la clé branchée.
2. Copier `E:\seven_heaven_strategy_lab\workspace\` vers **une sauvegarde distincte**, avant d'écraser les fichiers du programme.
3. Télécharger le **ZIP V4.5 complet**, décompresser, copier le contenu du dossier `seven_heaven_strategy_lab` **sur le contenu de `E:\seven_heaven_strategy_lab\`** en remplaçant ses fichiers, **sans supprimer `workspace\`**. Ne pas créer involontairement un dossier `seven_heaven_strategy_lab\seven_heaven_strategy_lab`.
4. Double-cliquer sur `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`. Python 3.13 existant suffit ; Docker reste facultatif.
5. Ouvrir `http://127.0.0.1:8777` : vérifier `BUILD 4.5.0` et l'ancienne archive Binance **AUTHENTIFIÉE**. Les rapports V1/V2 doivent rester disponibles dans le Coffre.
6. Dans **Atelier de configuration**, sélectionner **Ma stratégie personnalisée**, choisir les règles, lancer PAPER, puis vérifier **Microscope des bougies** : même source, horodatages UTC, overlays EMA/Bollinger, marqueurs PAPER et navigation temporelle ; comparer ensuite **7 méthodes**. Dans **Observatoire connecté**, choisir `BTC/USDC`, une durée et éventuellement une date UTC puis cliquer sur **Collecter la période OKX**. Vérifier la source sélectionnée et le décompte disponible, puis tester le comparateur en **1h**, sans aucune action de trading.
7. Depuis **Lecture de la simulation**, ouvrir **Anatomie des décisions PAPER** : vérifier le nom de la source, l'empreinte SHA et une fiche de position ; sélectionner « Pertes clôturées » pour étudier les transactions qui ont coûté de l'argent. Vérifier que le résultat net et les frais concordent avec le rapport d'origine. Aucun nouveau fichier n'est créé sur la clé.
8. Cliquer sur **Éprouver cette stratégie dans le temps** ; ouvrir le **Laboratoire de robustesse** en bas, lire entraînement, validation ultérieure et frais/glissement ×2. Avec moins de 150 bougies sur le timeframe choisi, le programme refuse proprement au lieu de produire un faux résultat. Ne touche pas au dossier `workspace/`.
9. Dans **Atelier**, avec une stratégie EMA ou personnelle et un historique OKX 1h/4h suffisamment long, cliquer **Comparer 5 variantes de filtres · Aether Research V4.5**. Ouvrir le **Studio des stratégies comparées**, lire la variante choisie sur le passé, le résultat sur une ou deux fenêtres de vérification, puis le tableau repliable de **toutes** les variantes. Les dates et le SHA doivent correspondre. Ne pas interpréter une absence de fills comme une victoire. Aucun fichier additionnel dans `workspace/`.
10. Si le programme affiche une erreur réseau, un échec de continuité ou un espace USB inférieur à la réserve, **conserver l'erreur** : les archives V1/V2 ne sont pas détruites, et aucun ordre n'est envoyé.

## Provenance, contrôles et limitations

- Documentation API publique officielle : https://www.okx.com/docs-v5/en/ .
- Seuls les endpoints `public/instruments` et `market/history-candles` sont accessibles par le collecteur. Les noms des paires sont dans une liste fixe et les liens ne sont pas fournis par l'utilisateur.
- Pagination maximale : **30 pages × 100 bougies**, taille maximale par réponse **850 ko**, délai d'une requête **16 secondes** ; collecte contrôlée au clic uniquement, sans boucle permanente.
- Les archives OKX sont vérifiées à chaque utilisation (SHA, 240 à 2 160 bougies, horodatage strictement horaire, continuité, intervalle UTC, actif et devise).
- La V3.1 sélectionne une date de fin UTC et jusqu'à 90 jours historiques ; elle ne contient pas de carnet actualisé en continu ni d'archives historiques illimitées. Ce sont des versions suivantes, après tests en vrai navigateur.
- L'API OKX peut être indisponible temporairement ou selon la région ; le laboratoire n'invente pas un prix pour masquer une erreur.
- Windows Firefox sur la clé du propriétaire doit faire l'objet d'une validation distincte après publication. Les tests GitHub et Chromium sont des preuves techniques, **pas** un test déjà effectué sur son PC.
- Aucune garantie de gain, pas de conseil d'investissement, pas de trading réel.

## Historique V1/V2 et architecture détaillée

Les détails historiques V2, les paramètres de la simulation de référence, la recette et la feuille de route sont conservés ici :
https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON_WINDOWS_USB_RELEASE_AND_NEXT_PHASES_2026_11_13.md

Le plan professionnel complet et les intentions V4/V5 Hummingbot/Freqtrade demeurent dans :
https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_MASTER_ARCHITECTURE_PROFESSIONAL_BOTS_USB_STORAGE_VERSIONED_ROADMAP_2026_11_13.md

### Anciennes livraisons maintenues

- V1 : https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13
- V2 : https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13

**Les dossiers `workspace/` ne sont inclus dans aucune de ces archives de programme. Ce sont les données et résultats personnels de l'utilisateur.**
