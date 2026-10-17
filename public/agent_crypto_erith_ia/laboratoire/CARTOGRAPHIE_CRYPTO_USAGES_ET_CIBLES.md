# ERITH.IA — Cartographie Crypto : usage réel, Top et qualification des cibles

**Seven Heaven · 17 octobre 2026 · rapport documentaire de recherche, lecture seule.**
**Aucun ordre réel, aucun signal de profit garanti, aucune extrapolation d'un prix de marché vers une utilisation réelle.**

[Référentiel lisible](crypto-knowledge.html) · [Données IA structurées](../data/crypto/research/asset-knowledge.json) · [Qualification Spot datée](../data/crypto/radar-opportunities/qualification-latest.json) · [Radar méthodologie](PROTOCOLE_RADAR_CIBLAGE.md).

## 1. Décision structurante : trois axes non interchangeables

**A. Les plus utilisées / les plus productives économiquement.** Pour les L1/L2 : adresses émettrices distinctes, transactions excluant autant que possible bots et opérations techniques, paiements corrigés, frais, stablecoins transférés et immobilisés, applications, développeurs. Pour les protocoles DeFi : prêts actifs, emprunteurs, frais nets, collatéral, revenus du protocole et incidents. Pour un service commercial : vrais clients, API facturées, usage récurrent et revenus indépendamment auditables. **Une adresse n'est pas une personne** et le volume de transfert brut n'est pas un volume économique net.

**B. Les plus négociées.** Volume Spot agrégé CoinGecko, volume d'une paire sur son échange exact, profondeur et spread instantanés, qualité de provenance, exécution fictive avec frais explicitement hypothétiques. Un grand volume agrégé ne garantit pas un carnet Spot exploitable chez OKX, Binance ou Bitget.

**C. Les plus mouvantes.** Hausse 24h, hausse 7j, baisse 24h, anomalie 30j, nouveau listing, ratio volume/capitalisation et stabilité des périodes. La surchauffe déclenche une revue de qualité et de liquidité, **pas** un bonus de certitude.

Sources de méthode :
- [Visa Onchain Analytics](https://www.visaonchainanalytics.com/transactions) : volumes stablecoin ajustés et limites des flux bruts.
- [Artemis — définitions de DAU, transactions, frais, revenus](https://app.artemis.xyz/docs/artemis-sheets/usage/supported-metrics).
- [CoinGecko — méthodologie des catégories](https://support.coingecko.com/articles/4724540263-categories-tags-methodology) : certaines catégories sont demandées par les projets ; elles ne valent pas certification indépendante.
- [CoinGecko — catégories de marché](https://www.coingecko.com/en/categories) : L1/L2, DeFi, IA, infrastructure, paiement, Gaming, RWA, Meme, stablecoins, etc.

## 2. Le socle d'utilisation réelle : étudier les infrastructures

| Actif / réseau | Catégorie | Fonction attestable | Preuves d'usage à archiver, sans les inventer |
|---|---|---|---|
| Bitcoin / BTC | Paiement/règlement et réserve numérique | Transactions et sécurisation PoW | Transactions pertinentes, frais, valeur économique transférée, liquidité Spot |
| Ethereum / ETH | L1 et smart contracts | Gaz/staking, contrats et DeFi | Transactions L1, frais, applications, stablecoins, L2; [documentation Ethereum](https://ethereum.org/fr/what-is-ethereum/) |
| Solana / SOL | L1 / paiements et applications | Stablecoins, applications et frais | Adresses, transactions hors vote, stablecoins, usages x402 ; [bilan septembre 2026 par Solana](https://solana.com/news/solana-ecosystem-roundup-september-2026), à recouper |
| TRON / TRX | L1 / transferts de stablecoins | Flux USDT et règlement | Transferts corrigés, frais, adresses, USDT ; [étude CoinDesk Research Q2 2026](https://www.coindesk.com/research/tron-network-q2-2026) |
| BNB Chain / BNB | L1 / applications et DeFi | Gaz, DEX et contrats | Frais, DEX, adresses, TVL ; étudier le réseau plutôt que le seul prix BNB |
| USDT et USDC | Stablecoins / paiement | Paiements, règlements et liquidité | Transferts corrigés par réseau, stablecoins en circulation, dépendance aux émetteurs |

**Constat de recherche (pas un palmarès actuel exhaustif) :** CoinDesk Research rapporte pour TRON environ 3,5 millions d'utilisateurs actifs quotidiens en moyenne sur Q2 2026, contre environ 3,8 millions pour Solana dans son panel, et une forte activité P2P stablecoin sur TRON. Ces chiffres décrivent une étude précise, pas « les utilisateurs uniques de toute l'industrie » ; ne pas les comparer naïvement avec le nombre de comptes Spot. [Source, juillet 2026](https://www.coindesk.com/research/tron-network-q2-2026). Solana publie des chiffres d'activités et de paiements pour septembre mais ce sont des **déclarations de sa fondation**, à auditer séparément.

## 3. Les candidats — qu'est-ce que le projet fait vraiment ?

La [qualification publique Spot du 17 octobre à 19:16:07 UTC](../data/crypto/radar-opportunities/qualification-latest.json) contient **20 actifs**, **14 marchés techniquement documentés**, et une liste de **10 dossiers de recherche**. Les 20 **n'ont pas** automatiquement d'identité token↔paire certifiée ni de preuve d'utilisateurs du service. Dans ce tableau, la colonne « fonction » décrit le projet selon ses propres sources, pas une adoption indépendante.

| Projet | Nature / activité présentée | Ce que l'IA doit vérifier avant de croire à l'adoption |
|---|---|---|
| **Q / Quack AI** | IA, agentic wallets, relais et paiements stablecoins [Q402](https://q402.quackai.ai/docs) | Usage mesuré de l'API, transactions et frais réellement facturés, dilution, identité exact contrat ; [cas Q](cas-ecole-quack-ai.md) |
| **ICNT / Impossible Cloud Network** | Infrastructure cloud, stockage et calcul décentralisés, [rôle annoncé du token](https://docs.icn.global/icn-economics/tokenomics/token-utility) | Capacité payée, revenus réels, contrats clients, collateral, identité échange |
| **SAND / The Sandbox** | Jeux/metaverse, places et créateurs ; [historique et vision du projet](https://www.sandbox.game/en/blog/An-Update-on-Our-Vision-and-the-Road-Ahead/3499/) | Joueurs actifs, transactions, royalties et rétention indépendantes |
| **KMNO / Kamino** | Prêt, emprunt, liquidité sur Solana [site officiel](https://kamino.com/) | TVL, dette active, liquidation, revenus plutôt que prix KMNO |
| **RSR / Reserve Rights** | Gouvernance et réserve de risque des DTF [docs Reserve](https://docs.reserve.org/core-components) | DTF actifs, frais, RSR staké et slashing |
| **NMR / Numerai** | Compétitions de modèles, mise du token à risque [docs NMR](https://docs.numer.ai/nmr) | Stakers, modèles et résultats hors échantillon ; NMR ne représente **pas** une part du fonds |
| **AXL / Axelar** | Communication interchaînes [docs](https://docs.axelar.dev/learn/) | Messages réellement relayés, validateurs et défaillances |
| **MINA / Mina** | Blockchain légère / preuves ZK [docs](https://minaprotocol.com/lightweight-blockchain) | Transactions, applications et sécurité réellement mesurée |
| **LIT / Lighter** | Marché d'échanges de produits dérivés, détails token à confirmer | Identité LIT, transactions vérifiées, wash trading, Spot ≠ dérivé |
| **A / Vaulta** | Réseau infrastructure blockchain, documentation actuelle requise | Identité du projet, continuité d'actif, utilisateurs |
| **BR / Bedrock** | Attribution précise du token BR à vérifier | **Ne pas inventer** que BR correspond à un autre protocole par simple collision de symbole |
| **METIS / Metis** | Infrastructure L2 | TVL, transactions, séquenceur, preuve de sécurité |
| **FLUID / Fluid** | DeFi / liquidité et crédit | Encours, utilisation, incidents de liquidation |
| **CPOOL / Clearpool** | Crédit numérique | Emprunts réels, défauts, risque de contrepartie |
| **META / MetaDAO**, **ORBIO**, **FOLKS**, **HBD**, **TRUTH**, **APEX** | Fonctions et/ou identités à documenter | **Pas de paire Spot observée par le collecteur sur le périmètre contrôlé**. Cela ne veut pas dire que l'actif n'existe pas ailleurs. |

La [base machine](../data/crypto/research/asset-knowledge.json) conserve les 20 IDs CoinGecko, les fournisseurs Spot observés, les coûts hypothétiques du snapshot et les **champs de preuve d'usage inconnue** explicitement vides. Les sources primaires sont à recouper par des métriques indépendantes, le développement ou la comptabilité du protocole.

## 4. Les hausses inhabituelles de la capture : GRX, Q, BTW, ANVL, SAND

- **GRX +2 428 % sur 24h dans le snapshot utilisateur** : variation extrême ; priorité au contrôle de la qualité du prix, de la liquidité, de l'origine des paires, du nombre de négociations et des écarts entre places. [Site déclaré par le projet](https://grxchain.io/) ; cette page seule ne prouve ni revenus ni activité réelle. La capture affiche un indicateur « données insuffisantes », qui doit limiter toute conclusion.
- **Q** : déjà objet d'une étude PAPER prospective ; ne pas reclasser un ancien listing de 2025 comme nouveau listing d'octobre 2026.
- **BTW / Bitway** : [documentation officielle du BTW](https://docs.bitway.com/resources/btw-bitway-token) : projet de financement et rendement autour de Bitcoin, jeton présenté comme gouvernance, incitations, accès et sécurité ; vérifier que des services sont effectivement utilisés et séparément valoriser les risques.
- **ANVL / Anvil** : identité projet, fonctions et liquidité à auditer avant tout discours d'adoption.
- **SAND** : rebond 24h possible alors que la semaine est négative ; l'usage du monde virtuel se mesure autrement que le cours SAND.

Ces cinq séries sont une **comparaison graphique du marché**, et non une observation homogène en profondeur, âge des prix et sources. L'unique axe « Base 100 » peut faire paraître toutes les petites variations plates en présence d'une anomalie GRX : afficher aussi les variations numériques et une échelle adaptée.

## 5. Le Coffre historique existe déjà ; ne pas le dupliquer

| Base canonique existante | Ce qu'elle prouve | Limites |
|---|---|---|
| `data/history/YYYY-MM-DD.jsonl` | Captures **Top 50** archivées, premières dates observées juillet 2026 (au moins) | Journal quotidien, pas bougies minute ; EUR et USD parfois mélangés dans champs dérivés, respecter métadonnées |
| `data/crypto/radar-opportunities/historical-top50-forward.json` | Étude **rétrospective** Top50, 60 jours consultés et retours observés à 7j | Biais rétrospectifs / survie, coûts ignorés ; pas ordre PAPER exécuté |
| `data/historical_archive_prototype/top250_multisource_coverage/index.json` | **144/250** actifs avec au moins une archive native Binance/Bitget, **37/50 Top 50**, **8/10 Top 10** | Ne prouve pas couverture complète à chaque période ; native USDT ≠ USD |
| `data/crypto/latest.json` + `extended.json` | Snapshot ponctuel Top 1 000 (250+750) | Écrasé par le snapshot futur : ne constitue pas un historique |
| `data/crypto/radar-opportunities/YYYY-MM-DD.json` | Journaux de sélection candidats (16 et 17 oct. visibles) | Concerne les candidats de recherche, pas toutes les cryptos |
| `data/trader_flux/q_paper/` | Relevés futurs réellement archivés Q Spot avec leur carnet | Démarre seulement après lancement, pas d'historique 1m certifié rétroactif |

**Règle de reconstruction :** on compare des snapshots datés par **ID CoinGecko** identique ; les rangs Top 5, 10 ou 50 sont ceux **du jour observé**, pas ceux d'aujourd'hui projetés dans le passé (sinon *survivorship bias*). On ne transforme jamais une série de snapshots quotidiens en bougies intra-journalières, ni un carnet Spot USDT en prix USD sans conversion.

## 6. Comment ajouter de la visibilité sans alourdir le site

1. **Catalogue IA** : statique léger, profil de chaque candidat, liens officiels, catégories, faits, hypothèses, date et métriques manquantes ; source canonique JSON sous `data/crypto/research/`, consultée par la page `laboratoire/crypto-knowledge.html` via **GitHub RAW** (Pages exclut `/data/`).
2. **Radar/Market** : un simple lien documentaire placé dans l'espace existant, sans nouveau graphique, volet, popup ni régression.
3. **Top 5 / 10 / 50** : analyser les vraies archives `data/history/`, retracer changements de rang, variations et volumes horodatés, puis mesurer les suivis 24h/7j/30j dans leur fenêtre réellement disponible ; respecter les dates et les absences.
4. **Top 250 / 1 000** : les snapshots courants fournissent la découverte, les historiques natifs le contexte selon la couverture effective. Étendre le journal prospectif **sans faire un export massif quotidien sur Pages**.
5. **Accès IA** : `coin_id`, `category`, `claim`, `independent_usage_metrics` (nullable), `source_urls`, `retrieved_at`, `coverage`, `quality_gate`, `observation`, `paper_decision`. Des champs inconnus restent inconnus.

**Point d'arrêt :** cette cartographie est une première qualification documentaire datée ; elle ne constitue pas un classement prouvé des utilisations mondiales, une revue financière du projet, ni une certification de chaque identifiant token↔exchange. Les métriques indépendantes et la validation Firefox restent les prochaines preuves à produire.
