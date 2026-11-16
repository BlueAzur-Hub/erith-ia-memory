# SEVEN HEAVEN · Strategy Lab — Long History Certification Phase 2019–2021

**Date :** 2026-11-16  
**Statut :** phase de recherche active, séparée du runtime V4.6.2  
**Base canonique :** V4.6.2 — Source Context Reset, publiée et acceptée dans Firefox  
**Mode :** données publiques, lecture/certification, PAPER uniquement, zéro ordre réel

## 1. Décision de reprise

V4.6.2 est close et reste la base stable. Cette phase ne crée pas automatiquement une V4.7 et ne modifie pas le `workspace/` privé.

La prochaine recherche porte d'abord sur la **qualité et la profondeur des historiques**, avant toute nouvelle famille de stratégie ou robot PAPER.

Ordre :

1. 2019–2021 ;
2. 2024–2025 ;
3. régimes de marché ;
4. walk-forward plus profond et holdout réellement séparé ;
5. nouvelles stratégies ;
6. position sizing ;
7. moteurs externes PAPER facultatifs ;
8. V5 seulement si la recherche justifie ce chantier.

## 2. Ce que V4.6.2 possède déjà

Le moteur bas niveau `src/binance_monthly_v46.py` sait déjà valider un mois Binance Spot BTCUSDT 1h pour toute année 2019–2025 :

- ZIP + `.CHECKSUM` ;
- SHA-256 attendu / observé ;
- une seule entrée CSV sûre dans le ZIP ;
- limites de taille et ratio de compression ;
- schéma 12 colonnes Binance ;
- OHLC cohérents et volume non négatif ;
- alignement horaire UTC ;
- ordre strict des bougies ;
- détection des trous, doublons et lignes hors mois ;
- nombre exact de bougies selon le calendrier ;
- timestamps en **millisecondes avant 2025** ;
- timestamps en **microsecondes à partir de 2025** ;
- SHA-256 du CSV source et du CSV normalisé.

Conclusion : **ne pas réécrire ce validateur sans preuve d'un défaut**.

## 3. Limite volontaire actuelle

L'adaptateur `src/binance_monthly_source_v46.py` reste volontairement borné à :

- paire : BTC/USDT ;
- intervalle : 1h ;
- mois : janvier 2020 ;
- identifiant : `BINANCE_SPOT_BTCUSDT_1H_2020_01`.

Cette limite protège la release V4.6.2. Elle ne doit pas être supprimée directement pour transformer la release stable en téléchargeur massif.

La phase longue doit donc commencer par **un outil de recherche séparé**, qui certifie plusieurs archives sans les brancher au runtime utilisateur.

## 4. Source publique et contrat

Source officielle :

- dépôt : https://github.com/binance/binance-public-data
- archives : https://data.binance.vision/
- chemin mensuel : `data/spot/monthly/klines/BTCUSDT/1h/`
- fichier : `BTCUSDT-1h-YYYY-MM.zip`
- empreinte publiée : fichier frère `.zip.CHECKSUM`

Binance documente que les archives peuvent être remplacées ultérieurement lorsqu'une incohérence est découverte. Par conséquent, une certification Seven Heaven doit conserver :

- URL exacte ;
- nom du fichier ;
- contenu / digest publié dans `.CHECKSUM` ;
- SHA-256 du ZIP réellement lu ;
- SHA-256 du CSV source ;
- SHA-256 du normalisé ;
- date UTC de certification ;
- version du validateur ;
- bornes UTC ;
- nombre de lignes ;
- trous / doublons détectés.

Une ancienne certification ne doit jamais être présentée comme une preuve que l'archive distante n'a pas changé depuis.

## 5. Alerte historique 2019–2021

Un ancien signalement public Binance a recensé des anomalies sur plusieurs archives BTCUSDT 1h, notamment des trous ou clôtures incohérentes.

**Mois à considérer comme prioritaires pour contrôle renforcé**, sans supposer que les archives actuelles sont encore défectueuses :

- 2019 : 03, 05, 08, 11 ;
- 2020 : 02, 03, 04, 06, 11, 12 ;
- 2021 : 02, 03, 04, 08.

Binance a ensuite publié une mise à jour d'archives de klines en 2022. La seule règle acceptable est donc :

> ancien incident connu ≠ archive actuelle invalide ;  
> archive actuelle valide seulement si le checksum et la continuité passent aujourd'hui.

## 6. Premier pilote réel proposé

Avant tout téléchargement annuel :

### Lot A — trois mois témoins

- 2019-01 ;
- 2020-01 ;
- 2021-05.

Ces mois donnent trois années différentes et ne figurent pas dans la liste d'anomalies historiques ci-dessus.

Pour chaque mois :

1. télécharger ZIP + CHECKSUM depuis la source officielle ;
2. valider en mémoire ;
3. produire un rapport de certification ;
4. ne conserver aucun prix inventé ni bougie reconstruite ;
5. refuser le mois au premier trou ou incohérence ;
6. ne rien écrire dans le `workspace/` propriétaire.

### Lot B — mois historiquement signalés

Après Lot A, sélectionner au moins un mois signalé dans chaque année et vérifier si l'archive publique actuelle a effectivement été corrigée.

Exemple :

- 2019-03 ;
- 2020-03 ;
- 2021-04.

## 7. Limitation de la session IA actuelle

L'environnement d'exécution de cette session ne peut pas joindre directement `data.binance.vision` pour télécharger les ZIP binaires. Cette limitation ne vaut pas pour le Lab Windows du propriétaire, qui dispose déjà du collecteur public V4.6.2.

Conséquence :

- recherche documentaire : possible ici ;
- conception et tests déterministes : possibles ici ;
- certification réelle des nouveaux ZIP Binance : à effectuer via un environnement autorisé à joindre l'hôte public, puis à relire avec le même validateur.

Aucun résultat réel 2019–2021 n'est donc revendiqué dans ce document.

## 8. Prochaine brique technique

Créer un **harness de certification historique séparé** qui :

- reçoit des paires locales `ZIP + CHECKSUM` ;
- déduit année/mois du nom ;
- appelle le validateur V4.6 existant ;
- produit un inventaire JSON/Markdown ;
- ne télécharge rien ;
- n'écrit pas dans le `workspace/` ;
- refuse les doublons et mois non contigus lorsqu'un bloc continu est demandé ;
- conserve les marchés séparés ;
- ne lance aucune simulation automatiquement.

Ce harness sera testé avant toute intégration UI.

## 9. Stop Gate

Ne pas :

- modifier V4.6.2 pour simplement « débloquer tous les mois » ;
- télécharger plusieurs années en masse avant le pilote ;
- fusionner Binance BTC/USDT et OKX BTC/USDC ;
- remplir les trous ;
- interpoler des bougies ;
- transformer un mois rejeté en mois utilisable ;
- lancer une V4.7 cosmétique ;
- introduire Freqtrade/Hummingbot avant la qualité des données.

## 10. Critère de sortie de cette phase

La phase 2019–2021 peut passer à la comparaison de stratégies lorsque :

- chaque mois retenu possède une provenance et un checksum vérifiés ;
- les mois refusés sont explicitement listés ;
- les blocs continus sont prouvés, pas supposés ;
- un inventaire reproductible existe ;
- les données peuvent être rejouées sans modifier la logique PAPER V4.6.2 ;
- les coûts et hypothèses restent visibles ;
- aucune donnée utilisateur privée n'a été publiée.

**Règle : source d'abord, continuité ensuite, stratégie après.**
