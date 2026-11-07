# Seven Heaven · Agent-Crypto — Recherche 08B
## AKE / Akedo : cotation OKX, carnet Spot non synchronisé et évolution des historiques

**Date du constat :** samedi 7 novembre 2026  
**Projet :** Administrator Build 40.6.719 · Market Core 38.15.11  
**Périmètre :** lecture de trois captures utilisateur, recherche documentaire de cotation et conservation de preuves.  
**Statut :** OBSERVATION / RECHERCHE, AUCUN CHANGEMENT DE CODE, AUCUN ORDRE.

### 1. La question exacte

Christophe constate que le carnet OKX d'**AKE (Akedo)** ne montre aucune profondeur et demande si cela vient d'une **absence de paire Spot sur OKX**.

**Réponse étayée :** l'annonce officielle OKX concerne **AKE/USDT en contrat perpétuel à marge USDT**, disponible depuis le **16 septembre 2026**, et ne démontre pas de paire Spot. Aucune paire AKE Spot OKX n'a pu être confirmée parmi les sources consultées. Une matrice tierce datée du 6 novembre 2026 mentionne un dérivé OKX mais pas de paire Spot. L'état affiché par le logiciel est donc **compatible avec une absence de paire Spot**.

Il s'agit de l'explication **probable**, pas d'une démonstration causale du code : la résolution d'instrument et les règles de synchronisation du carnet n'ont pas été auditées, et l'API officielle des instruments n'a pas été récupérée directement. La disponibilité peut varier selon la région. **Ne jamais substituer le carnet d'un perpétuel à celui d'un Spot.**

Sources :
- [Annonce OKX Europe : contrats perpétuels AKE/USDT (16/09/2026)](https://www.okx.com/fr-fr/help/okx-to-list-perpetual-futures-for-ake-crypto)
- [Page de prix OKX Akedo AKE — n'atteste pas une paire Spot](https://www.okx.com/fr/price/akedo-ake)
- [Matrice tierce des marchés AKE (observation datée du 06/11/2026)](https://pattern.plus/token/ake-akedo?hold=7&lev=3&side=short)
- [Akedo — projet officiel](https://akedo.fun/#/)

### 2. Capture 1 — Hausses 5 · environ 07:27:10

**Vue observée :** Hausses 5 · 24 h · base 100 · normale · 5/5 séries · 289 points/série · historiques mixtes **1 direct / 4 caches**, mention « données différées ».

| Actif | Prix USD affiché | Variation 24 h affichée | Écart en points vs capture précédente (~07:21:50) |
|---|---:|---:|---:|
| AKE | 0,00579005 | +23,29 % | **+5,64** |
| GEOD | 0,275062 | +20,86 % | −0,24 |
| KNTQ | 0,481348 | +11,71 % | +0,14 |
| BTW | 1,1973 | +10,66 % | −0,16 |
| PEARL | 1,7557 | +7,08 % | −1,05 |

**Évolution avérée de l'écran :** AKE devient le leader à **+23,29 %**, GEOD passe deuxième à **+20,86 %**. L'écart entre AKE et PEARL est **16,21 points**, concordant avec le bandeau.

**Prudence :** les variations successives de « % 24 h » ne sont pas des rendements obtenus en six minutes ; les fenêtres glissantes 24 h évoluent et les quatre historiques en cache peuvent avoir des âges distincts. Le statut de provenance demeure mixte : **pas de preuve de synchronisation complète**.

**Détail à capitaliser :** le leader peut changer sans que l'interface soit défaillante ; il faut vérifier l'identité de l'actif, les prix sources et surtout les timestamps avant de comparer deux observations.

### 3. Capture 2 — Oracle AKE, 15 minutes, carnet non synchronisé

Le panneau central présente une **continuation haussière hypothétique** :
- AKE affiché à **0,00582521 $US**.
- **Confiance données : 83/100** en en-tête ; **confiance 42/100** dans un autre indicateur en bas. Ces métriques portent des intitulés différents : **ne pas les fusionner**.
- Force « hausse » **61/100**, « baisse » **39/100** ; enveloppes **+3,20 %** et **−2,96 %**. Elles sont des **scénarios de l'interface, pas des probabilités vérifiées ou des objectifs de prix fiables**.
- La mention générale **« source marché non confirmée »** est visible malgré certains sous-indicateurs de transport « LIVE ».
- La rubrique de droite indique **« AKE/? · carnet non synchronisé »**, **« UNKNOWN »**, puis :
  « La paire du carnet ne correspond pas au graphique. Aucune profondeur affichée avant une lecture publique concordante. »

**Diagnostic documentaire :** la vue Oracle peut continuer à représenter un scénario théorique sur des prix historiques et une estimation de volatilité alors que le module de **carnet Spot** refuse une paire non concordante. C'est une séparation souhaitable entre **prix analysable** et **liquidité certifiée**. L'absence de profondeur **ne prouve pas** qu'il n'existe aucun marché AKE sur toutes les plateformes ; elle signifie que cette lecture du carnet n'a **pas de paire Spot concordante validée**.

**Le site Akedo ouvert dans la troisième capture** confirme le contexte du projet AI / jeux, mais **ne démontre pas** sa cotation Spot sur OKX.

### 4. Trois niveaux de certitude

| Proposition | État | Appui |
|---|---|---|
| L'interface masque la profondeur d'AKE lorsqu'elle n'identifie pas une paire concordante | **Constat direct** | Capture Oracle |
| OKX a annoncé un contrat perpétuel AKE/USDT le 16/09/2026 | **Fait documenté** | Communiqué OKX |
| AKE est négociable au comptant sur OKX Europe | **Non confirmé** | Aucune paire officielle Spot validée |
| L'absence de paire Spot explique exactement la branche logicielle exécutée | **Hypothèse probable** | Capture + comparaison produits ; code non audité |
| On peut utiliser les données du perpétuel comme carnet Spot | **Non** | Produits/risques différents |

### 5. Dette scientifique à suivre sans toucher au code

À la reprise des audits, documenter en **lecture seule** :
- \`exchange=OKX\`, \`instrument_type=SPOT\`, \`requested_pair=AKE-USDT\` ou \`AKE-USDC\`, résultat de l'inventaire des instruments et disponibilité en Europe ;
- symbole brut, **identifiant d'actif unique** et source de prix (CoinGecko / Binance / autres), pour exclure toute collision du ticker AKE ;
- paire effectivement sélectionnée pour le carnet et paire affichée dans le graphe, **avec leurs timestamps** ;
- motif exact de refus et séparation explicite du Spot et des dérivés ;
- pour « Hausses 5 », âge de chacune des cinq courbes, dernière observation par courbe, bornes de base 100 et disponibilité du cache.

**Point d'arrêt :** observations et sources conservées, aucun patch appliqué. Les captures ne suffisent pas à déclarer un bug, et un éventuel portage d'un carnet dérivé ne doit pas être ouvert implicitement.

### 6. Relations avec les recherches précédentes

- [Research 08](SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_08_MARKET_REGIMES_DATA_QUALITY_AND_FORWARD_OBSERVATION_2026_11_07.md) : régimes de marché sur BTC/USDT Binance et première capture Hausses 5, sans prétendre surveiller le marché en temps réel.
- [Bibliothèque Seven Heaven des sept stratégies](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles).
- Recherche 08B : **AKE et carnet Spot**, problème distinct des classifications BTC et de la performance des stratégies.

**Fichiers de preuve :** trois PNG joints à l'archive ZIP du présent document, accompagnés d'un JSON reprenant les chiffres visibles et les limites de vérification.

**Aucun changement du code Administrator / Operator / Trader, de GitHub, de Notion ou d'OKX.**