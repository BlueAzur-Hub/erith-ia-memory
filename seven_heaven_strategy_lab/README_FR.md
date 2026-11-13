# Seven Heaven Strategy Lab — V2 Aether Observatory · PAPER local

**Version 2.0.0 · Windows Python 3.13 · Sans Docker obligatoire · Sans ordre réel.**

Notre deuxième version est un **cockpit de recherche premium**, inspiré du langage visuel bleu nuit, or et cyan de l'Interface ERITH.IA, mais autonome. Elle fonctionne depuis le dossier sur une clé USB de 8 Go. Elle ne contient aucun code ni accès à l'Administrator, à l'Operator, au Bridge ou au TRADUS privé.

## Passer de V1 à V2 sur la clé USB E:

1. **Arrête le laboratoire V1** : ferme la fenêtre du serveur Python (ou utilise Ctrl+C).
2. **Sauvegarde le dossier `workspace/`** de ta clé ailleurs. Il conserve tes données authentifiées, tes profils et tes résultats V1.
3. Décompresse le **nouveau ZIP V2**, puis copie son contenu de dossier `seven_heaven_strategy_lab/` **dans le dossier existant**, en remplaçant les fichiers du programme **mais sans effacer `workspace/`**. Ne déplace pas le dossier USB pendant qu'il fonctionne.
4. Double-clique sur `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd` (Python 3.13). Il ouvre Firefox si c'est ton navigateur par défaut, sinon ouvre `http://127.0.0.1:8777` toi-même.
5. Le bandeau doit afficher **BUILD 2.0.0**. L'archive déjà chargée doit être toujours **AUTHENTIFIÉE** ; les anciens profils et rapports continuent à être lisibles.

Si tu préfères installer la V2 dans un autre dossier, **copie également le dossier `workspace/`** de la V1 vers la V2. Un ZIP de programme ne contient **pas** ce dossier personnel. La sauvegarde est importante : une clé USB peut tomber en panne.

## Nouveaux modules V2

- **Aether Observatory** : cockpit responsive bleu nuit / or / cyan, lecture stratégique active, indicateurs de l'archive et état local PAPER.
- **Choix de bougies** : 1m, 5m, 15m, 1h, 4h. Les bougies sont **agrégées à partir de l'historique authentifié 1m**. Chaque échelle est distincte ; le moteur ne télécharge ni ne fabrique d'historique 4h indépendant.
- **Atelier de scénarios** : EMA, Bollinger, DCA, Buy & Hold 50 %, Buy & Hold 100 %, conservation USDT ; montant, commissions, glissement et paramètres configurables.
- **Comparateur six méthodes** : un bouton exécute six calculs PAPER sur le même mois, au même timeframe, avec le même capital, les mêmes frais et la même hypothèse de glissement.
- **Coûts visibles** : pour chaque calcul individuel, diagnostic supplémentaire **sans frais ni glissement** étiqueté comme contrefactuel. Il ne représente pas une transaction réalisable.
- **Coffre local** : sauvegardes distinctes de `workspace/results/`, `workspace/profiles/` (anciens et nouveaux) et `workspace/comparisons/`. Les rapports V1 restent compatibles et affichés en 1m.
- **DCA temporel corrigé pour les échelles V2** : sa fréquence est renseignée en **minutes**, puis arrondie vers le haut au nombre entier de bougies. Exemple : tous les 1 440 minutes = toutes les 24 bougies 1h, **pas** 1 440 bougies 1h.

### État exact du développement

Le moteur est le **moteur Python PAPER interne**, et non Freqtrade ou Hummingbot. Les frameworks externes sont préservés séparément dans une Release commune, mais ne sont pas intégrés à ce prototype. Les périodes disponibles sont dérivées du **seul mois de janvier 2026 BTC/USDT Binance Spot** ; le sélecteur multi-actifs, l'import d'autres mois et la connexion OKX live restent à développer dans des étapes ultérieures.

Internet est **autorisé** : l'application télécharge sur demande une archive publique précise, avec vérification SHA-256. L'accès au marché en temps réel n'est pas encore implémenté. **PAPER uniquement** : pas d'API d'ordre, ni de clé de compte, ni de levier.

Les frais OKX personnels observés sont **0,10 % Taker** (fraction 0.001 dans le calcul) et **0,08 % Maker** (information affichée, pas appliquée à ces fills à ouverture suivante). Ce sont des **hypothèses** lorsqu'on les applique aux anciens cours Binance, pas les frais Binance effectivement encourus.

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

## Stratégies de la version initiale

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
