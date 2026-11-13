# Seven Heaven Strategy Lab — Station locale de recherche PAPER

**Statut : prototype initial autonome · aucune connexion à un compte ni possibilité d'envoyer un ordre.**

Seven Heaven Strategy Lab est un projet **indépendant** de l'Administrator, de l'Operator et du TRADUS de Yoann. Il utilise une interface Web locale, un moteur PAPER original et une archive historique publique vérifiée. Il peut être transporté sur un SSD USB.

## Premier démarrage sur Windows

1. Installer et démarrer **Docker Desktop** sur le PC. Docker reste installé sur ce PC ; la clé ou le SSD transporte seulement le projet et les données.
2. Copier ou extraire ce dossier **entier** sur un dossier du SSD USB, sans mélanger les fichiers avec l'Administrator.
3. Double-cliquer sur `START_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd`. Au premier démarrage, Docker télécharge l'image officielle Python et construit notre petite application locale.
4. Le navigateur ouvre **http://127.0.0.1:8777**. Cliquer sur **Charger l'archive vérifiée**. C'est le seul téléchargement du laboratoire : l'archive Binance Spot BTCUSDT de janvier 2026, déjà publiée dans notre propre GitHub.
5. Choisir EMA, Bollinger, DCA, Buy & Hold ou conservation USDT. Modifier paramètres et budget, puis lancer **PAPER**.
6. Donner un nom et enregistrer son profil. Les rapports JSON et le CSV historique sont conservés dans `workspace/` sur ton SSD.
7. Avant de débrancher le SSD, double-cliquer sur `STOP_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd` puis éjecter proprement le disque.

Le dossier `workspace/` n'est pas publié dans GitHub et ne doit contenir aucune clé de compte. Un **SSD externe** est préférable à une clé USB classique pour les usages répétés.

### Démarrage sans Docker, avec Python 3.11+

Depuis le dossier `seven_heaven_strategy_lab` :

```bash
python -m src.server
```

Ouvrir `http://127.0.0.1:8777`. Arrêter par Ctrl+C.

### Avec Docker manuellement

```bash
docker compose up --build -d
# Ouvrir http://127.0.0.1:8777
docker compose down
```

La publication réseau est limitée à `127.0.0.1` côté hôte ; aucune API de trading réel n'existe dans cette application. Le téléchargement initial du dossier historique nécessite une connexion Internet et ne demande **aucune clé OKX**.

## Stratégies de la première version

| Modèle | Règle utilisée | Hypothèse |
|---|---|---|
| EMA_CROSS | Croisement haussier/baisser des EMA sur la **dernière bougie clôturée**, achat/vente à l'**ouverture suivante** | Long-only, portefeuille sans levier |
| BOLLINGER | Acheter sous la bande basse, vendre au-dessus de la bande haute, sur clôture passée | Pas de vente à découvert |
| DCA | Acheter une somme USDT fixe à intervalle défini tant que le portefeuille le permet | Positions conservées |
| HOLD_50 | 50% du budget fictif investi en BTC à l'ouverture initiale | Référence passive |
| HOLD_100 | 100% du budget fictif investissable en BTC | Référence passive |
| CASH | Conserver uniquement les USDT | Référence sans transaction |

**Par défaut** : capital 1 000 USDT, frais **Taker 0,10 % par côté** affichés en français (`0.1% = 0.001` dans le calcul), glissement supposé **0,05 % par côté**. Les frais **Maker observés 0,08 %** sont mentionnés dans l'interface mais **ne sont pas appliqués** à ces ordres fictifs immédiats.

Le simulateur suit les USDT disponibles, les BTC détenus, les commissions, la valeur mark-to-market de l'inventaire et le drawdown. Les signaux n'utilisent pas de bougies futures. Les opérations fictives sont supposées exécutées au prochain cours d'ouverture après le signal : **il n'y a pas de carnet, de vraie liquidité, ni de garantie d'exécution**.

**Règles de quantité 1e-8 BTC et min notionnel 5 USDT** : hypothèses de laboratoire **NON validées** comme contraintes Binance historiques / OKX EEA. Les résultats ne sont donc pas des profits observés ni un système autorisé à trader.

## Source historique immuable

Archive officielle de notre propre Coffre :
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-bulk-2026-01-1m

- Archive `BTCUSDT-1m-2026-01.zip` : SHA-256 `d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9` ;
- CSV minute normalisé : SHA-256 `38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4` ;
- 44 640 minutes continues BTCUSDT Binance Spot, janvier 2026 ;
- L'archive est récupérée **uniquement après clic** et rejetée si elle ne correspond pas aux empreintes ; les prix ne sont pas des cours actuels ;
- Les rapports JSON locaux conservent les paramètres, opérations simulées, références HOLD/CASH et limites explicites.

Cette version importe **uniquement** le jeu historique précité. L'import de fichiers libres et les flux de marchés actuels nécessitent validation et conception supplémentaires.

## Freqtrade et Hummingbot : périmètre exact

Ce premier prototype utilise un moteur **Python original autonome**, **pas** le moteur Freqtrade ni Hummingbot. Aucun logiciel externe n'est installé par ce Dockerfile. Le dépôt partagé conserve déjà les sources originales vérifiées de ces deux frameworks :
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-external-bot-source-archives-2026-11-13

La prochaine phase pourra ajouter un **connecteur Freqtrade distinct** pour vérifier EMA/Bollinger hors échantillon ; ensuite Hummingbot pour Grid / Market Making, uniquement quand l'inventaire, le portefeuille et la précision des contraintes Spot sont contrôlés. Les résultats externes devront être explicitement étiquetés et jamais confondus avec ceux de notre moteur.

## Tests

```bash
python -m unittest discover -v -s tests -p 'test_*.py'
node --check web/app.js
```

Le workflow GitHub Actions de cette livraison est tenu de vérifier le code, le dataset réel, le lancement du serveur et un appel API PAPER. Aucune simulation ne valide des performances futures. Des tests additionnels de Firefox Windows restent nécessaires.

**Architecture :** ce dossier n'écrase ni MASTER (40.6.719), ni Operator Yoann, ni le Bridge, ni TRADUS. Aucun identifiant d'exchange, script de trading live, levier, ou stratégie d'exécution réelle n'y est contenu.
