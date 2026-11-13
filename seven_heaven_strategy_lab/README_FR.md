# Seven Heaven Strategy Lab — V4.2 Market Microscope + Professional Risk Desk

**Version 4.2.0 · Windows Python 3.13 · Port 8777 en local · Internet public autorisé · PAPER uniquement.**

Seven Heaven Strategy Lab est un laboratoire autonome Python/Windows, en développement progressif : archives publiques authentifiées, stratégies composables, simulations PAPER et analyses professionnelles. La V4.2 étend le cockpit premium bleu nuit, or et cyan avec le **graphique historique directement lié à chaque rapport**, sans dépendre des interfaces Administrator ou Trader, sans clés privées ni ordre réel.

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

## Mise à niveau sur la clé USB depuis la V4.1 déjà validée

1. Fermer la fenêtre noire `Seven Heaven Strategy Lab` (Ctrl+C), puis garder la clé branchée.
2. Copier `E:\seven_heaven_strategy_lab\workspace\` vers **une sauvegarde distincte**, avant d'écraser les fichiers du programme.
3. Télécharger le **ZIP V4.2 complet**, décompresser, copier le contenu du dossier `seven_heaven_strategy_lab` **sur le contenu de `E:\seven_heaven_strategy_lab\`** en remplaçant ses fichiers, **sans supprimer `workspace\`**. Ne pas créer involontairement un dossier `seven_heaven_strategy_lab\seven_heaven_strategy_lab`.
4. Double-cliquer sur `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`. Python 3.13 existant suffit ; Docker reste facultatif.
5. Ouvrir `http://127.0.0.1:8777` : vérifier `BUILD 4.2.0` et l'ancienne archive Binance **AUTHENTIFIÉE**. Les rapports V1/V2 doivent rester disponibles dans le Coffre.
6. Dans **Atelier de configuration**, sélectionner **Ma stratégie personnalisée**, choisir les règles, lancer PAPER, puis vérifier **Microscope des bougies** : même source, horodatages UTC, overlays EMA/Bollinger, marqueurs PAPER et navigation temporelle ; comparer ensuite **7 méthodes**. Dans **Observatoire connecté**, choisir `BTC/USDC`, une durée et éventuellement une date UTC puis cliquer sur **Collecter la période OKX**. Vérifier la source sélectionnée et le décompte disponible, puis tester le comparateur en **1h**, sans aucune action de trading.
7. Si le programme affiche une erreur réseau, un échec de continuité ou un espace USB inférieur à la réserve, **conserver l'erreur** : les archives V1/V2 ne sont pas détruites, et aucun ordre n'est envoyé.

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
