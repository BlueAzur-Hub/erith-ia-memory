# SEVEN HEAVEN — Agent-Crypto Current State

**État documentaire figé au 13 novembre 2026, soirée (Europe/Paris).** Cette page est un **aiguillage**, non un substitut au registre des versions, à la source applicative ou aux preuves. Elle a été consolidée depuis les deux pages Notion fournies et les documents GitHub du répertoire partagé.

## 1. Conservation du fil — achevée

- **58/58** fichiers `VOL_001.md` → `VOL_058.md` sur `main`, 24 901 178 octets en tout ; empilement sans trou des lignes originales 1 à 577 201.
- **58/58 empreintes Git blob conformes** au découpage source. Source SHA-256 : `060adf4e492cb8e96276560213a34f5d88cfb00b70b14747ece4215ac7e6f8e7`.
- [INDEX.md](INDEX.md) — chronologie et 58 liens ; [TOPIC_INDEX.md](TOPIC_INDEX.md) — 20 rubriques, 860 renvois ancrés ; [MEMORY_ENTRY.md](MEMORY_ENTRY.md) — mode d'emploi et reprise.
- Les volumes sont des **archives brutes de conversations**, pas des spécifications validées : leur chronologie suit l'ordre des lignes ; les affirmations anciennes peuvent être contredites par les états actuels.

## 2. Seven Heaven Strategy Lab — état le plus récent connu

**Établi par [le registre de versions GitHub](../../research/strategy_lab/README.md), [le manifeste versionné](../../research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json), [la preuve V4.5 Firefox](../../research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_V4_5_OWNER_FIREFOX_ACCEPTANCE_AND_RESEARCH_HANDOFF_2026_11_13.md) et [le plan Notion](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72).**

- **V4.5.0 :** dernière version publiée dans le registre ; **interface Firefox confirmée par captures et texte fournis par le propriétaire**, non audit indépendant du contenu brut de la clé USB. Laboratoire local Windows/Python 3.13 et navigateur, répertoire de travail privé sur USB ; uniquement **PAPER**.
- V4.5 : 720 bougies OKX Spot BTC/USDC 1h, recherche sur 5 variantes de filtres et 2 fenêtres de validation selon l'interface. Sur une fenêtre, le filtre RSI inférieur à 45 rapporte **0 % avec 0 transaction**, c'est du maintien en liquidités, **pas un profit ni une stratégie gagnante**. Les résultats restent des simulations historiques.
- Les versions V1 à V4.5 et leurs ZIP/empreintes sont déjà [cataloguées ici](../../research/strategy_lab/README.md) ; ne pas recommencer leur publication ni modifier la clé USB depuis GitHub.
- **V4.6 : en développement exploratoire seulement.** [PR #767, brouillon](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/767) : validateur isolé des ZIP mensuels Binance Spot BTCUSDT en 1h, avec contrôles de somme, fuseaux/horodatages, cohérence et tests artificiels ; [CI #43493696195](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43493696195) indiquée comme réussie par le plan. **Pas de V4.6 publiée, installée ni de preuve de mois Binance réels validés pour cette étude** au dernier contrôle documentaire.
- **Direction scientifique unique identifiée :** vérifier un vrai mois historique Binance 1h et son fichier `.CHECKSUM` officiel **avant** d'étendre les périodes 2019–2021 / 2024–2025 ou les stratégies ; source, capital, frais, glissement et UTC doivent rester comparables. Garder BTC/USDT Binance distinct de BTC/USDC OKX.
- **V5 / robots :** horizon de recherche PAPER ; aucune exécution native Freqtrade/Hummingbot ou robot réel à déduire de la V4.5.

## 3. Interface MASTER, Trader, Operator et Bridge — autre chantier

- Les références de coordination placent Administrator / Operator et leurs Trader autour de **40.6.719** et Market Core **38.15.11**. Vérifier le dépôt concerné et son commit avant toute intervention, car un état documentaire n'est pas une preuve que chaque machine a chargé cette version.
- Le [rapport sur les frais PAPER et la comparaison FRESH](../../SEVEN_HEAVEN_AGENT_CRYPTO_OKX_SPOT_PAPER_FEES_AND_FRESH_COMPARE_MASTER_OPERATOR_RELEASE_HANDOFF_2026_11_13.md) décrit des correctifs fusionnés MASTER et Operator : **maker 0,08 % ; taker 0,10 %** affiché `0,10` en français ; contrôle FRESH du carnet OKX. Les validations utilisateur locales et certains contrôles CI généraux ne sont pas uniformément clos.
- **Bridge R31 / compte OKX** : séparé des expériences PAPER ; aucune modification, aucun ordre ni accès aux identifiants dans ce chantier de mémoire.
- L'Observatoire BTC public et les études Spot/liquidations/actualités sont distincts de l'application Strategy Lab et du Trader. Les liquidations suivies de façon échantillonnée ne représentent jamais un total mondial continu.
- Pour connaître l'état détaillé de ces branches, lire la [page Notion AETHER Agent-Interface](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099), ses sources et les PR/runs associés ; ne pas écraser l'historique complexe par une formule « tout fonctionne ».

## 4. Contraintes non négociables

- **Répertoire partagé :** `coordination/inter_ai_dialogues/agent_crypto/` ; documents du laboratoire sous `research/strategy_lab/`.
- **Recherche PAPER seulement**, zéro ordre réel ; rendre visibles les hypothèses de frais et de glissement.
- **USB** : conserver `E:\\seven_heaven_strategy_lab\\workspace\\`, sauvegarde indépendante avant mise à niveau, vérifier l'espace libre avant téléchargement. Aucun `workspace/` privé, compte, fichier sensible, profil Aerith privé ou clé API en GitHub public.
- **Preuve de livraison** : distinguer source fusionnée, recette CI, GitHub Release, navigateur utilisateur, contenu de stockage local et données natives marché.
- **Index automatique** : mots-clés = pistes, non décisions validées. Lire les lignes exactes et recouper avec le plus récent état documentaire.

## 5. Reprise au prochain fil

**Lire [MEMORY_ENTRY.md](MEMORY_ENTRY.md), puis cet état ;** pour le Strategy Lab ouvrir le [registre](../../research/strategy_lab/README.md) et la [spécification V4.6](../../research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_EXTENDED_HISTORICAL_RESEARCH_SOURCE_PLAN_2026_11_13.md). Pour une décision historique utiliser l'[index thématique](TOPIC_INDEX.md) et vérifier uniquement les volumes pertinents.

**Document de coordination, pas une nouvelle version du logiciel.** Mis à jour lors d'une décision ou d'une preuve réellement nouvelle, jamais par simple supposition.
