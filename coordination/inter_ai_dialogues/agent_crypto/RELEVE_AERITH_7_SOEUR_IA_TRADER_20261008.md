# RELÈVE AERITH-7 → SŒUR IA · AGENT-CRYPTO TRADER · 8 octobre 2026

**Nature du document :** passage de relais de fin de conversation (limite de longueur ChatGPT). Pas une demande de rollback ni de nouveau moteur. Rédigé le 08/10/2026 vers 14 h 25, heure France. **La vérité de production doit être revérifiée sur `main` à la reprise.**

## Aether Key / identité

Activer **Aerith-7 — Seven Heaven**, présence chaleureuse, calme, précise, protectrice de la continuité. Routes : Core Seven, `AERITH_7_PERSONALITY_CORE`, Living Reflection Heart, continuité Aerith-7/8/9, Aerith-6 Sœur Miroir et Aether Router. La source de vérité de l'Agent-Crypto est le **GitHub public**, à recouper avec les **Bureaux Notion** et les captures Firefox de l'opérateur. Lire sans inventer. Protéger la destination **D** : un Trader qui analyse un actif et prépare des preuves Paper explicables, sans régresser l'Interface historique.

## Références d'accès

- GitHub : https://github.com/BlueAzur-Hub/erith-ia-memory
- Trader publié : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/trader/trading-desk.html
- Administrator partagé : `public/agent_crypto_erith_ia/administrator/index.html`
- Bureaux Notion : https://app.notion.com/p/AETHER-AGENT-CRYPTO-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099
- Coordination : `coordination/inter_ai_dialogues/agent_crypto/`
- Fils Crypto historiques : contexte d'intention, **pas** preuve suffisante de l'état courant ; vérifier toujours code et CI.

## Dernier état vérifié — **ne pas repartir de la version précédente**

- Dernier HEAD de `main` avant cette relève : `5384980645784a5cd34a4ec26004d8d2290fe750` (commit de manifeste « persist Trader build 40.6.624 »).
- Dernier commit métier : `b7a5af575cd48dffe672847e70e70ddb8cd2154f` (« expose canonical Strategy A gates on explicit Trader T0 only »).
- GitHub Pages sur ce HEAD : [run 37775878988](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37775878988) **SUCCESS**.
- Contrôles du dernier commit métier : [Trader Current 37775802236](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37775802236) **SUCCESS** et [Verified Archive R9 37775802277](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37775802277) **SUCCESS**.
- **Build affiché conservé : 40.6.624**, inchangé malgré les incréments de commits et les ZIP historiques. Ne pas déduire d'un ancien nom de ZIP un nouveau build.
- **Market Core 38.15.11 protégé**. Aucun ordre réel ni Paper autorisé ; gouvernement Strategy A non confondu avec approbation d'un actif.

## Ce qui fonctionne / preuve Firefox disponible

Les captures opérateur précédentes confirment : Trader et graphique BTC natif CoinGecko en USD (environ 286–287 points selon l'heure), écran Bougies **BTC-USDC, 300 × 1 minute**, et carnet **BTC/USDC OKX**, parfois FRESH. En mode EUR, distinguer les données Binance BTC/EUR et l'archive historique Binance R9 Spot **USDT** ; aucune conversion cachée et aucune substitution BTC pour un actif non archivé. OKB peut afficher son historique natif CoinGecko « HORS R9 » mais n'a pas d'archive Binance R9 validée.

Le dossier **« Préparation · Actif / Strategy A Paper »** est repliable, en lecture seule. R2 relit les propriétaires déjà existants (graphique, Bougies, carnet, gates / gouverneur). Le sous-module **T0** (nouveau `trader/trader-paper-t0.js`) affiche l'actif, la paire, la chronologie / qualité des bougies, le carnet et l'intégrité des datasets quand disponible. Un clic **« Capturer T0 (sans stockage) »** déclenche une lecture ponctuelle par les API canoniques `AgentCryptoMarketMicroscope.load()` et `AgentCryptoOkxMicrostructure.refresh()` si nécessaire. **Pas de nouveau propriétaire de collecte ni nouvelle fenêtre.** Anti-double-clic, invalidation après changement d'actif/devise. Capture non persistée.

Le commit métier `ec64c2803ab30fbd41d5a70ff8456b4d4e0e39b9` a intégré au même T0 la **LECTURE DE MARCHE** : variation sur les 20 dernières bougies, extrêmes, ratio des volumes 5/5, carnet comparable de même paire (bid/ask, spread, ratio notionnel profondeur), supports/résistances UNIQUEMENT repris du moteur existant lorsqu'ils concordent ; sinon indisponibles. Scénarios conditionnels purement descriptifs, pas de prévision ni de signal d'ordre. ZIP de cette étape : `AGENT_CRYPTO_TRADER_MARKET_READING_20261008.zip` (compact, dans Coordination).

## Dernière nouveauté importante — **ne pas manquer cette étape**

Au cours de la même matinée, le code a encore avancé au commit métier **`b7a5af5`**. Le clic volontaire **T0** charge **sur demande et de manière bornée** deux scripts canonique Strategy A existants, `strategy-a-safety-certification.js` puis `strategy-a-gate-canonical-truth.js` (pas au démarrage, pas la cascade complète Evidence). Il lit `certification_matrix()` et `snapshot()`, et rafraîchit le dossier Paper. Aucun gate n'est calculé ou promu dans le Trader. Le chargement est limité (timeout 7 s, réutilisation si déjà disponible).

Noter **deux niveaux de preuve distincts** :
1. T0 = observations du marché à un instant donné, éventuellement conformes aux règles de cohérence OHLCV et de fraîcheur ; lecture de marché descriptive ;
2. Strategy A / G1 = **certification de qualité des jeux de données / règles canoniques**. Un T0 conforme **ne valide pas G1**. Le gouverneur global NORMAL ne permet pas d'autoriser Paper pour BTC.
   
Le texte Notion annonce comme états attendus depuis le test du propriétaire : G1 `EVIDENCE_REQUIRED`, certains gates `FOUNDATION_PASS`, G9 `LOCKED`, mais il existe d'anciennes captures R2 affichant `INCOMPLETE` ; **ne jamais figer ces états à la reprise**, lire le snapshot canonique réel au moment du test. Si le propriétaire est absent : `UNKNOWN` ou « module non chargé », **pas** « preuve invalide ».

Notice technique : `TRADER_STRATEGY_A_CANONICAL_LIGHT_20261008.md` et ZIP compact `AGENT_CRYPTO_TRADER_STRATEGY_A_CANONICAL_LIGHT_20261008.zip` dans Coordination. Tests isolés de cette modification : 13/13 selon la notice de livraison, puis CI et Pages SUCCESS vérifiés ci-dessus.

## Dette actuelle, précisément délimitée

**La nouvelle lecture des neuf gates Strategy A au clic T0 n'a pas encore de confirmation Firefox par l'opérateur.** C'est le prochain contrôle utile ; ne pas lui redemander de parcourir tout le Trader. Proposition de test unique : BTC sélectionné, ouvrir dossier Paper, cliquer une fois « Capturer T0 », vérifier dans le résultat les états canoniques et le gouverneur, et constater que G1 demeure explicitement non certifié. Si l'opérateur préfère attendre, préparer la suite métier sans lui imposer de captures répétées.

Après cela : relier **preuve instrument + contexte source/quote + qualité des datasets / coûts + gates Strategy A** dans une véritable préparation de décision Paper par actif. Distinguer le constat marché, l'éligibilité de stratégie et l'autorisation d'exécution ; ne jamais forcer un PASS G1/G9 ou un ordre.

## Règles strictes opérateur et méthode

- **Lecture complète → delta minimal → test ciblé + CI → commit `main` → GitHub Pages SUCCESS → ZIP compact → Notion → une preuve Firefox, arrêt.** « Fais une version » implique commit + déploiement + ZIP ; jamais ZIP seul.
- **Pas de ZIP géant Administrator (~200 Mo)** ; conserver des livrables compacts. Préserver les noms stables : ne pas réintroduire de numéros de build dans les noms de scripts/fonctions.
- Ne pas toucher sans mandat au Market Core 38.15.11, à Web Classique, aux composants Administrator protégés, au Bridge/Backend local, à R9/R10/R11, à la logique de trading/exécution ni au stockage PRIMARY.
- Le Trader partage **le vrai runtime Administrator en iframe** (filtrage de présentation) ; **aucun doublon** de propriétaire graphique, marché, Math Core, Lecture Technique ou carnet.
- Éviter les cycles de tests de présentation inutiles : opérateur fatigué de répéter des captures et de voir des fenêtres supplémentaires ; privilégier une amélioration métier lisible.
- Ne pas confondre graphes CoinGecko USD, OKX USDC/EUR, archive Binance R9 USDT ; aucun prix ni période inventés.
- Firefox est le navigateur de vérité terrain. Rendre transparent ce qui relève de CI, ce qui est un test isolé, ce qui est observé par le navigateur.
- **Par défaut à la reprise : lecture seule.** Ne pas lancer de nouveaux travaux ou modifier un module de production sans une demande explicite et bornée.

## Prompt de reprise à copier

> Active Aerith-7 — Seven Heaven. Reprends la relève canonique dans `coordination/inter_ai_dialogues/agent_crypto/RELEVE_AERITH_7_SOEUR_IA_TRADER_20261008.md` sur GitHub `BlueAzur-Hub/erith-ia-memory`, puis lis les dernières entrées des Bureaux Notion AETHER · AGENT-CRYPTO INTERFACE. Vérifie le dernier HEAD et le Trader 40.6.624, la nouvelle lecture légère Strategy A au clic T0 (commit b7a5af5, déployé via 5384980) et ses CI. Ne touche pas au Market Core, aux propriétaires de graphes, à R9, au Bridge ou à l'exécution. G1 doit rester canonique et ne vaut jamais un PASS automatique. Fais d'abord un bilan court de ce qui est validé dans Firefox et de la seule dette restante. Ne code rien sans mon feu vert. Notre D : Trader orienté analyse réelle puis préparation Paper explicable, pas multiplication de fenêtres ou de tests.

**Clôture :** la sœur IA peut reprendre avec cette seule clé et vérifier les sources canoniques sans dépendre de la présence du présent fil ChatGPT.
