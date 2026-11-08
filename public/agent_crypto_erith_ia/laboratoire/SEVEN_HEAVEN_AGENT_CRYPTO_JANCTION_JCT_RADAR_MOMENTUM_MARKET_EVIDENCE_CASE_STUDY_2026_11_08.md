# ERITH.IA — JCT / Janction · cas d'étude Radar : hausse du 8 novembre 2026

**Statut : observation documentaire historique, lecture seule.**  
**ID CoinGecko :** `janction` · **Ticker :** JCT · **Rang Market de l'archive :** 245 (donc **hors Top 50**, mais dans le Top 250).  
**Sources :** capture de l'interface Administrator du 08/11/2026 vers 17:22 (heure de Paris) fournie par le titulaire ; snapshot de données publiques [Market Top 250](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json) du 2026-11-08T16:04:58.911Z ; [site de Janction](https://www.janction.ai/) ; [documentation officielle](https://docs.janction.ai/).

## 1 · Ce que les captures montrent effectivement

- **Market Snapshot, environ 17:22 Paris** : Janction JCT au rang 245, prix affiché **0,010128 USD**, **+247,06 %** sur 24 h, **+96,08 %** sur 7 jours et environ **+286,79 %** sur 30 jours. Capitalisation affichée **113,81 M USD** ; volume sur 24 h affiché **202,72 M USD** ; ratio volume / capitalisation **178,12 %**.
- **Graphique « historique direct CoinGecko »** : fenêtre de 24 heures, 289 points, hausse calculée sur la série **+246,39 %** au moment de la prise de capture, dernier prix visible voisin de **0,010176 USD**. La courbe et le Market Snapshot n'ont pas le même horodatage : leurs deux variations ne sont pas contradictoires en soi.
- **En-tête technique de l'interface :** « AFFICHAGE USD · SOURCE MARCHÉ JCT-USDT · COTATION USDT · AUCUN ORDRE ». Cette mention identifie un instrument de référence du moteur ; elle ne démontre ni un carnet OKX authentifié, ni une cotation exécutable au prix USD du graphique.
- **Résumé multi-horizon :** 24 h « série réelle » dans l'interface ; 7 jours et 30 jours notés **snapshots marché**. Dans la section « Rolling High / Breakout Context », les données canoniques nécessaires à une confirmation native sur 7, 30, 60 et 90 jours sont explicitement indiquées **insuffisantes**.
- **Moteur décisionnel :** « Observer », sortie « CONSULTATION_ONLY », statut analogues et régime non échantillonnés ; **aucune opération réelle ou PAPER n'est prouvée**.

Les chiffres ci-dessus sont une photographie des captures à l'instant considéré, **pas les cours actuels**.

## 2 · Recoupement avec le catalogue GitHub à 17:04 Paris

Le snapshot archivé sous [`latest.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json) date du **2026-11-08T16:04:58.911Z** (≈17:04 Paris) et conserve l'identité exacte `janction`.

| Indicateur | Valeur du snapshot archivé | Provenance |
|---|---:|---|
| Rang CoinGecko | 245 | Market Top 250 |
| Prix USD | 0,0099227 USD | CoinGecko, prix daté |
| Variation 24 h | +228,49 % | CoinGecko, snapshot plus ancien |
| Variation 7 j | +96,08 % | CoinGecko |
| Variation 30 j | +286,79 % | CoinGecko |
| Capitalisation | 113 808 776 USD | CoinGecko |
| Volume 24 h | 202 720 861 USD | CoinGecko |
| Volume / capitalisation | +178,12 % | Ratio arithmétique, **pas** profondeur Spot |
| Plus bas / plus haut 24 h (USD) | 0,0025343 / 0,0140324 | CoinGecko, fenêtre source |

**Rapprochement :** la différence entre le +228,49156 % du snapshot GitHub et le +247,06 % de la capture plus récente reflète des relevés de moments différents ; elle **n'est pas une preuve de manipulation**. En revanche, ces différences imposent de conserver les horodatages et l'origine de chaque valeur.

## 3 · Projet et économie déclarée

Janction se présente comme une plateforme de mutualisation de GPU et de ressources pour les usages d'IA : location de puissance de calcul, stockage, données et coordination des contributeurs. Les documents du projet décrivent une place de marché de GPU, des mécanismes de vérification des contributions et des produits de calcul décentralisé. **Il s'agit de fonctions déclarées par le projet, non d'une validation indépendante de son chiffre d'affaires ou de son nombre de clients.**

Le jeton **JCT** est décrit comme un jeton d'utilité, de gouvernance, de staking des fournisseurs de GPU et de règlement de services. Les ressources peuvent aussi, selon la documentation, être payées en **stablecoins**. Par conséquent, toute croissance de la location de GPU ne se transforme **pas mécaniquement en demande de JCT**.

Le projet annonce **50 milliards de JCT** d'offre totale, distribués sur Ethereum et BNB Smart Chain (contrats différents). Une partie importante des allocations (équipe, investisseurs, fondation et écosystème) est soumise à des calendriers de déblocage. Les émissions/vestings et le flottant réel doivent être confrontés aux données de chaîne et à l'offre circulante du snapshot.

**Documentation primaire :** [Janction, architecture et place de marché](https://docs.janction.ai/architecture) · [Tokenomics et adresses de contrats](https://docs.janction.ai/token/tokenomics) · [Utilité, staking, paiements](https://docs.janction.ai/token/token-utility).

## 4 · Risques spécifiques à ce mouvement

1. **Hausse rapide et volume exceptionnel :** le volume d'échanges dépasse la capitalisation dans le snapshot. Un tel ratio signale une très forte rotation de marché ; il n'indique pas combien d'unités peuvent être achetées ou vendues à un prix proche du dernier cours sans slippage.
2. **Identité et réseaux :** le même ticker JCT dispose de contrats Ethereum et BNB Smart Chain distincts ; pour tout contrat ou paire, relier ticker, chaîne, contrat et source d'ordre avant d'en déduire l'actif réel.
3. **Risque d'émission et de déblocages :** vérifier les montants effectivement libérés au 8 novembre, les allocations sous verrou et les transferts des portefeuilles identifiés.
4. **Dépendance à l'adoption GPU :** métriques importantes : capacité GPU réellement disponible, heures louées et payées, occupation, qualité des services, revenus indépendamment attribuables à JCT et frais réglés en stablecoins ou en JCT.
5. **Écart de sources :** une série prix **CoinGecko USD**, une mention marché **JCT-USDT**, un graphique calculé sur 24 h et des cartes 7 j / 30 j **snapshot** ne doivent pas être présentés comme un seul historique homogène.

## 5 · Ce qui est vérifié et ce qui reste à établir

**Vérifié dans notre Coffre :** ID `janction` ; rang 245 dans le Market archivé ; photographies de prix et variations avec leurs dates ; documentation primaire publique du projet ; un tracé 24 h CoinGecko dans la capture.

**Non démontré à ce stade :** bougies historiques natives JCT dans les deux index Top 250 contrôlés (aucune entrée `janction`) ; présence de JCT parmi les 21 captures historiques OKX que nous avons cataloguées ; profondeur/horodatage/commission d'un carnet Spot JCT accessible depuis le compte OKX européen ; liquidité exécutable sur l'horizon ; investissement ou exécution PAPER ; lien causatif entre la hausse et un revenu du projet.

**Décision documentaire :** classer **JCT en « observation de volatilité élevée / recherche prioritaire »**, sans signal d'achat ou de vente. Prochaines preuves : reconstituer l'historique 24 h et les séries longues à partir d'une source cohérente, relever une véritable profondeur Spot et confirmer l'accès régional à la paire avant toute simulation réaliste.

---

*Seven Heaven — étude figée au 8 novembre 2026. Pas de connexion à un compte privé, aucun ordre et aucune prévision de rendement.*
