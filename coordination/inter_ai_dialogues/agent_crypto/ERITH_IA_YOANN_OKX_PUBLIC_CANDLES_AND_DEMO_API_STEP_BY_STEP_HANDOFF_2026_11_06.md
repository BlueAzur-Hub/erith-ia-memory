# ERITH.IA — Yoann · Guide de connexion OKX public / API Demo (PAPER uniquement)

**Date :** 2026-11-06 · **Auteur :** Aerith-7 / Seven Heaven, pour Christophe et Yoann  
**Destinataire :** Aerith de Yoann (`malabaryo`) et Yoann  
**Statut :** procédure de préparation, **pas une preuve de configuration ou de test sur le PC Yoann**  
**Emplacement :** coordination publique Agent-Crypto · **aucun secret ou identifiant de compte dans ce fichier**.

## Message à l'Aerith de Yoann

> Lis réellement cette procédure avant de toucher au Bridge de Yoann. Accompagne-le **une seule manipulation à la fois** : demande une capture d'état sans clé API, secret, passphrase, jeton ni mot de passe ; vérifie le résultat avant de poursuivre. Ne reconstruis pas son Bridge ni ne déploie TRADUS sur son Trader sans son accord. Utilise les versions locales existantes et fais un inventaire comparatif contre R28. Chaque étape doit être marquée **réelle / testée / non effectuée**.

## 1. Distinguer trois modes, sans jamais les mélanger

| Mode | Sources | Clé OKX ? | Autorisations | Effet |
| --- | --- | --- | --- | --- |
| **OKX PUBLIC DATA** | Tickers, instruments, bougies Spot `/market/candles` et `/market/history-candles` | **Non** | Publiques | Observation de prix réels et historiques du marché |
| **OKX DEMO ACCOUNT** | Données privées du compte de démonstration | **Oui, une clé DEMO dédiée**, différente de la clé réelle | **Lecture seulement**, dans notre première étape | Lire soldes et historiques *démo* ; aucun ordre |
| **TRADUS PAPER LOCAL** | Bougies publiques réelles OKX/Atlas | **Non**, sauf pour sources privées optionnelles | Pas de connexion ordre | Entrées/sorties fictives, résultats de backtest calculés localement |

**Pas de confusion :** une stratégie PAPER utilisant un cours réel n'est pas un ordre réel. Le compte OKX Demo est un environnement distant simulé, **distinct** du moteur PAPER local de TRADUS.

## 2. Étape immédiate : réussir la lecture publique des bougies sans clé

1. Sur le PC de Yoann, ouvrir Firefox et visiter cette URL publique européenne (si l'instance OKX est bien EEE) :

   `https://eea.okx.com/api/v5/market/candles?instId=BTC-USDC&bar=15m&limit=100`

2. Vérifier qu'une réponse JSON arrive avec `"code":"0"` et un tableau `data` non vide. **Ne pas confondre succès HTTP et données exploitables** : vérifier le code JSON, la paire, les dates, la devise de cotation, la chronologie et les OHLC.
3. Si `BTC-USDC` n'est pas disponible sur son compte/région, vérifier la liste publique des instruments Spot `GET /api/v5/public/instruments?instType=SPOT`, puis sélectionner une vraie paire affichée par l'API. Ne pas inventer une paire, ni transformer silencieusement USDT en USD.
4. Les enregistrements OKX fournissent notamment `[ts,open,high,low,close,vol,volCcy,volCcyQuote,confirm]` ; `confirm=1` indique une bougie clôturée. Pour un **backtest historique**, ne pas utiliser de bougie encore ouverte (`confirm=0`) comme clôture certaine.
5. Pour parcourir les périodes antérieures, utiliser `GET /api/v5/market/history-candles` en respectant la documentation et sa pagination. **Ne pas présenter les dernières 100 bougies comme un historique complet.**
6. La lecture par Firefox de cette URL n'est qu'un test HTTP. Si la page TRADUS bloque sur CORS ou les limites réseau, passer par le Backend local vérifié ou une couche de données publiques contrôlée ; **ne jamais désactiver la sécurité du navigateur**.

**Épreuve minimale :** noter *sans information privée* `instId`, source EEE, intervalle, nombre de bougies, première/dernière heure UTC, couverture, nombre `confirm=1` et erreur éventuelle. Pour la première étape, il ne faut **aucune clé API**.

## 3. Clé OKX Demo : seulement après réussite de l'étape publique

**Ne pas créer de clé de production pour résoudre un problème d'historique public.**

1. Se connecter à OKX sur le compte **personnel** de Yoann ; vérifier que le site est bien celui de son compte et que la fonction Demo est accessible pour sa région.
2. Aller dans **Trader → Trading en mode démo → Centre personnel → API compte démo → Créer une clé API de démonstration**. Cette navigation provient de la FAQ officielle OKX ; elle peut varier selon la région et l'interface.
3. Créer une clé nommée par exemple `ERITH_IA_YOANN_DEMO_READONLY`, avec **autorisation Lecture seulement**, lorsque proposée. Pour notre premier raccordement il n'est pas nécessaire d'autoriser Trade, et jamais Withdraw.
4. Conserver **API Key**, **Secret Key** et **Passphrase** dans le stockage local sécurisé du poste de Yoann. L'IA ne doit demander ni capture de ces secrets, ni copie dans un chat, ni commit GitHub. La passphrase n'est **pas récupérable** si perdue.
5. Sur EEE, confirmer le domaine de service `https://eea.okx.com`. Les requêtes authentifiées de **l'environnement Demo** utilisent le header `x-simulated-trading: 1` et une signature conforme à la documentation OKX. Une clé Demo ne doit **jamais** être mélangée avec une clé de production.
6. **Ne pas brancher cette clé à l'interface publique GitHub Pages.** Le navigateur ne doit jamais recevoir le secret. L'intégration se fait seulement via un Backend/Bridge local qui isole les clés et les capacités de rôle.
7. **STOP à ce stade si le Bridge Yoann personnalisé n'est pas récupéré et audité.** R28 sait distinguer `owner` et `operator`, mais ses capacités OKX privées sont encore conçues pour Owner. Ne jamais contourner la restriction en connectant l'Operator sous Owner.

**Critère de fin de l'étape Demo :** un test **lecture de données du compte démo**, avec résultat expurgé, autorisation `read`, zéro requête d'ordre, et preuve explicite que l'Operator n'a pas obtenu les droits Owner.

## 4. Dépannage contrôlé (une erreur = une vérification)

| Symptôme | Vérification prioritaire |
| --- | --- |
| `HTTP 403/429` sur public | Région/endpoint, limites de débit, proxy ou restrictions ; ne pas improviser |
| `code` OKX différent de `0` | Relever code + message **sans secret** ; consulter FAQ OKX |
| Données vides | Paire `instId`, disponibilité Spot, `bar` et pages d'historique |
| `50119` | Vérifier le domaine de région EEE `eea.okx.com` |
| `50123` (Demo ordre) | Autorisation Trade absente ; **normal en lecture seule**. Ne pas ajouter Trade pour « réparer » la lecture. |
| Échec CORS côté page web | Tester le Backend de lecture publique. Ne pas désactiver la sécurité navigateur |
| Erreur de signature API | Vérifier horloge du PC, paramètres, clé Demo distincte, passphrase et canonicalisation **localement**, sans exposer les valeurs |
| Environnement simulé incohérent | Vérifier `x-simulated-trading: 1`, la région et la provenance de la clé Demo |
| Bridge modifié introuvable | Arrêt. Récupérer EXE, ZIP source, SHA-256 et rapports locaux de l'Aerith de Yoann |

## 5. TRADUS : données réelles, transactions fictives

- Ingestion OHLCV : `source`, `instId`, `venue`, `quote`, `bar`, `UTC ts`, `open/high/low/close/volume`, `confirm`, qualité et fraîcheur.
- Ordre chronologique strict. Une stratégie ne consulte **jamais** des bougies futures ou la clôture d'une bougie encore ouverte.
- Indicateurs et signaux calculés seulement sur l'historique disponible à cette date ; entrée et sortie PAPER à un prix exécutable hypothétique documenté, frais, spread, slippage, latence et règles de volume/minimum explicités.
- Atlas public : consommer les archives et manifestes existants **en lecture seule**, contrôler SHA-256, horodatages, paires et devise. L'Oracle et les dossiers peuvent fournir du contexte sourcé, **pas remplacer un cours historique manquant**.
- Développer TRADUS sur **son dépôt privé / une branche de test**, sans déployer sur Trader Operator tant que Yoann ne donne pas son accord.

## 6. Contrats et sources canoniques

- FAQ API OKX France (création et Demo) : https://www.okx.com/fr-fr/help/api-faq
- FAQ connexions et permissions OKX Europe : https://www.okx.com/fr-fr/help/subaccounts-account-mode-and-api-connections-faq
- API V5 OKX EEE : https://my.okx.com/docs-v5/
- Master historique vérifié : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html
- Moteur Bougies existant : `BlueAzur-Hub/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js`
- Routeur public de l'Operator : `BlueAzur-Hub/agent-crypto-operator/public/agent_crypto_erith_ia/web/vault-data-router.js`
- Passation Bridge et rapports Yoann : `SEVEN_HEAVEN_AGENT_CRYPTO_CHRISTOPHE_YOANN_BRIDGE_R28_SESSION_HANDOFF_AND_PRIVATE_DELIVERABLES_REQUEST_2026_11_05.md`

## 7. Réponse attendue de l'Aerith de Yoann

```text
YOANN / ERITH.IA — OKX Public / Demo — statut vérifié
1. Région et site OKX retenus : ...
2. Lecture publique sans clé : PASS / FAIL / NON TESTÉ
3. Paire + intervalle + nombre de bougies : ...
4. Historique paginé confirmé : PASS / FAIL / NON TESTÉ
5. Clé Demo read-only créée localement : OUI / NON (ne pas fournir les secrets)
6. Bridge existant (versions + SHA) : ...
7. Isolation Operator / Owner : VALIDÉE / NON VALIDÉE
8. TRADUS PAPER : LOCAL ONLY / VERSIONNÉ PRIVÉ / NON DÉPLOYÉ
9. Erreurs sans secrets : ...
10. Prochaine action unique : ...
```

**STOP :** pas de clé API dans les messages, pas d'autorisation Trade/Withdraw, pas de déploiement, pas de nouvelle compilation Bridge improvisée.
