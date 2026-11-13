# Seven Heaven Strategy Lab — Station locale de recherche PAPER

**Statut : prototype initial autonome · aucune connexion à un compte ni possibilité d'envoyer un ordre.**

Seven Heaven Strategy Lab est un projet **indépendant** de l'Administrator, de l'Operator et du TRADUS de Yoann. Il utilise une interface Web locale, un moteur PAPER original et une archive historique publique vérifiée. Il peut être transporté sur un SSD USB.

## Premier démarrage Windows — sans Docker, avec ton Python 3.13

Sur le PC de Christophe, `py -0p` a confirmé Python **3.13** (par défaut) et Python **3.8** (ancien). **N'installe ni un autre Python ni Docker Desktop pour cette version.**

1. Télécharge le ZIP Seven Heaven Strategy Lab de notre Release et **extrais son contenu** dans un dossier sur ton PC ou sur un SSD externe. Ne lance pas le fichier `.cmd` directement depuis le ZIP compressé.
2. Ouvre le dossier `seven_heaven_strategy_lab`.
3. **Double-clique sur `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`** (pas sur le lanceur Docker). Il choisit explicitement `py -3.13`, crée `workspace/` et démarre le serveur en boucle locale.
4. Le navigateur par défaut s'ouvre automatiquement à `http://127.0.0.1:8777`. S'il ne s'ouvre pas, copie cette adresse dans Firefox.
5. Clique une fois sur **Charger l'archive vérifiée**. Le téléchargement utilise seulement notre archive publique BTC/USDT 1 minute de janvier 2026 ; elle est refusée si ses empreintes SHA-256 ne correspondent pas.
6. Choisis ta stratégie, modifie les paramètres et lance **PAPER**. Enregistre tes profils et résultats ; ils restent dans le dossier `workspace/` sur ton disque ou SSD.
7. Pour arrêter, ferme la fenêtre de commandes ouverte par le lanceur ou utilise **Ctrl+C** dans celle-ci. Attends l'arrêt avant d'éjecter le SSD.

**Important :** laisser la fenêtre de commande ouverte pendant l'utilisation. Aucun identifiant OKX, accès au Bridge ou connexion à un compte n'est nécessaire. Le lanceur n'installe aucune bibliothèque Python et ne modifie ni ComfyUI ni l'environnement Python 3.8 du Bridge.

### Démarrage Python manuel (solution de secours)

Depuis le dossier `seven_heaven_strategy_lab` :

```cmd
py -3.13 -m src.server
```

Ouvrir `http://127.0.0.1:8777` dans Firefox puis arrêter avec Ctrl+C. Les modules sont dans la bibliothèque standard de Python : aucun `pip install` n'est requis.

### Option Docker Desktop (facultative)

Docker Desktop est une autre manière de lancer exactement le même laboratoire, utile sur une machine différente. Il est **inutile** pour le premier test avec Python 3.13 sur le PC de Christophe. Ne pas double-cliquer sur `START_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd` sans Docker Desktop : ce fichier est réservé à cette option.

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
