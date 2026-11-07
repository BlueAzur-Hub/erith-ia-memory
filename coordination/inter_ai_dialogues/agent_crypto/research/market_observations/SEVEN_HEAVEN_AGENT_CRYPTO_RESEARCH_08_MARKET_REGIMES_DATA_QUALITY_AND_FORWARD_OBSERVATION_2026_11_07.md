# SEVEN HEAVEN · AGENT-CRYPTO — Recherche 08
## États du marché observables, qualité des historiques et étude descriptive à 20 jours

**Date :** 7 novembre 2026  
**Statut :** RECHERCHE / OBSERVATION / AUCUN ORDRE  
**Projet :** Administrator 40.6.719 · Market Core 38.15.11 · Crypto Strategy Laboratory  
**Précision :** ce document prolonge les sept fiches et l'Atlas déjà publiés. Il n'est pas un code de stratégie, un profil PAPER importable ni une analyse de marché en temps réel.

## 1. Ce qui est réellement connu

### 1.1 Capture Administrator du 7 novembre 2026

La capture utilisateur montre **Hausses 5**, fenêtre **24 h**, **base 100**, **USD**, univers **Base 100 / Top 100** ; cinq séries graphiques sur cinq sont visibles. Le panneau d'état annonce : **« HISTORIQUES MIXTES · 1 DIRECT · 4 CACHES · À JOUR »**, avec **289 pts/série** et dernier point affiché **07/11/2026 à 07:21:50**.

| Actif affiché | Prix USD affiché | Variation 24 h affichée |
|---|---:|---:|
| AKE · Alkedo | 0,00582745 $US | +17,65 % |
| GEOD · Geodnet | 0,275502 $US | +21,10 % |
| KNTQ · Kinetiq | 0,481352 $US | +11,57 % |
| BTW · Bitway | 1,1997 $US | +10,82 % |
| PEARL · Pearl | 1,7605 $US | +8,13 % |

**Cohérence arithmétique de l'UI :** GEOD +21,10 %, PEARL +8,13 %, soit **12,97 points** d'écart ; ce nombre correspond au bandeau affiché.

**Ce qu'on ne peut pas déduire de l'image :** quel actif dispose du seul historique « direct », les dates de chaque point, la date réelle de rafraîchissement des quatre caches, la synchronisation de leurs abscisses, les prix d'exchange indépendants, ni une mesure de qualité des données chiffrée. « Prix Live Binance 5/5 » est un autre indicateur de l'interface ; il ne démontre pas que les cinq **historiques** proviennent d'un flux direct.

Les 289 points pourraient correspondre à **24 h en pas de 5 minutes, bornes comprises** (24 × 12 + 1), mais le pas exact n'est **pas vérifié** depuis une capture seule. Les prix affichés sont des **observations d'écran**, pas des cotations certifiées en temps réel.

### 1.2 Archive BTC utilisée pour la recherche

Source : [Index de provenance BTC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json) ; [fichier de bougies \`bitcoin-Max.json.gz\`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz).

Le fichier du Coffre a été récupéré et décompressé en lecture seule pour ce calcul. Son contenu donne **3 075 bougies BTC/USDT Binance Spot à 1 jour**, du **1er mai 2018 au 30 septembre 2026**.

L'index recense **26 journées reconstruites depuis les archives natives 1j** ; **5 881 minutes manquantes** restent dans le matériau minute d'origine. Il n'y a pas de trou au niveau du calendrier de cette série quotidienne, mais **cela ne valide pas un backtest intrajournalier**, la profondeur du carnet, la séquence des ordres ni la qualité des exécutions.

**SHA Git blob de la source gzip récupérée :** \`8f2073bfefe41957bc2affc73b81402631c19f41\`.  
**SHA-256 de l'archive selon l'index :** \`812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd\`.

**Important :** BTC/USDT Binance historique ≠ BTC/USDC OKX ≠ les cinq tokens de la capture ≠ valeurs « USD » de CoinGecko. Aucun pont de cotation n'a été effectué ici.

## 2. Question de recherche

**Peut-on classer un marché à la date t, avec uniquement ce qui est connu à la clôture t, puis regarder ses variations futures sans anticipation cachée ?**

Oui, pour une *étude descriptive*. Ce n'est pas suffisant pour prouver la rentabilité d'une stratégie.

Les rapports précédents classaient des années après coup comme « en forte hausse » ou « en forte baisse ». Cette étape corrige la méthode : on calcule ici la catégorie **sur chaque journée t**, indépendamment de ce qui arrivera ensuite.

## 3. Protocole déterministe, version exploratoire R08

### 3.1 Tendance sur les clôtures quotidiennes

À la fin de la journée t, on calcule :

- \`SMA50(t)\` : moyenne des 50 clôtures jusqu'à t, comprise.
- \`SMA200(t)\` : moyenne des 200 clôtures jusqu'à t, comprise.
- \`M30(t) = C(t)/C(t−30) − 1\` : variation observée sur les 30 dernières journées.

Trois étiquettes exclusives :

| Étiquette | Définition observable à la clôture t |
|---|---|
| **Hausse** | \`C(t) > SMA50(t) > SMA200(t)\` et \`M30(t) ≥ +3 %\` |
| **Baisse** | \`C(t) < SMA50(t) < SMA200(t)\` et \`M30(t) ≤ −3 %\` |
| **Indécis** | Tous les autres cas ; **ne signifie pas automatiquement un range** |

**Les seuils 3 %, 50 et 200 périodes sont des hypothèses de recherche**, pas des paramètres optimisés ni validés.

### 3.2 Volatilité séparée de la tendance

\`V20(t) = écart-type échantillon des 20 derniers ln(C(t)/C(t−1)) × √365\`.

On compare \`V20(t)\` au **75e percentile des V20 disponibles sur t−180 à t−1**, sans inclure t dans le seuil historique. Volatilité élevée si \`V20(t)\` dépasse ce seuil ; sinon, ordinaire.

Ainsi, chaque journée reçoit **une étiquette de tendance et une étiquette de volatilité** : une journée de hausse peut aussi être une journée à forte volatilité. Les six couples sont un choix de classement exploratoire, pas six stratégies.

### 3.3 Fenêtres communes

Pour rester comparable à notre laboratoire précédent, les comptes concernent **le 22 janvier au 31 décembre de chaque année 2022, 2023, 2024 et 2025**. Les moyennes peuvent s'appuyer sur les bougies des années antérieures pour être calculables dès le début de la fenêtre.

## 4. Résultats reproductibles de la classification

| Année | Journées | Hausse | Baisse | Indécis | Volatilité élevée* |
|---|---:|---:|---:|---:|---:|
| 2022 | 344 | 0 | 190 | 154 | 100 |
| 2023 | 344 | 156 | 4 | 184 | 78 |
| 2024 | 345 | 152 | 20 | 173 | 95 |
| 2025 | 344 | 80 | 41 | 223 | 101 |
| **Total** | **1 377** | **388** | **255** | **734** | **374** |

*La volatilité est un **indicateur supplémentaire** qui chevauche les trois colonnes de tendance ; ne pas additionner cette colonne aux autres.*

**Lecture :** notre règle classe toutes les journées étudiées de 2022 en « baisse » ou « indécis », jamais en « hausse ». Elle reste beaucoup plus souvent « indécise » que « haussière » en 2025. Cela décrit **la règle et l'échantillon**, pas la vérité fondamentale sur le marché ni un diagnostic du 7 novembre 2026.

## 5. Test descriptif : le prix 20 journées plus tard

**Objectif :** vérifier si l'étiquette observée apporte une information simple sur la variation ultérieure.

**Échantillonnage sans chevauchement :** pour chaque année, on part du 22 janvier et on prend une observation tous les **20 jours** ; on ne conserve une observation que si la clôture t+20 appartient encore à la **même année**. Cela donne **17 observations par année, 68 au total**.

**Variation observée après le signal :** \`100 × (C(t+20)/C(t) − 1)\`.

**Ce n'est PAS un rendement de trading :** aucune entrée au prochain prix exécutable, aucun ordre ni frais, pas de financement, pas d'allocation, pas de stop, pas de portefeuille, et les groupes sont très petits. Il s'agit de variations « clôture-à-clôture » descriptives.

| Tendance et volatilité observées à t | Cas | Cas positifs | Médiane à t+20 | Moyenne à t+20 |
|---|---:|---:|---:|---:|
| Indécis · ordinaire | 27 | 13 | −0,33 % | +0,56 % |
| Hausse · ordinaire | 15 | 5 | −2,73 % | +1,61 % |
| Baisse · ordinaire | 8 | 4 | −0,16 % | +0,62 % |
| Indécis · élevée | 8 | 4 | +0,42 % | +2,95 % |
| Baisse · élevée | 5 | 2 | −2,50 % | +2,32 % |
| Hausse · élevée | 5 | 4 | +5,63 % | +5,70 % |

**Médiane toutes observations confondues : −0,42 %.**

### Ce que ces résultats disent — et ne disent pas

1. **L'étiquette « hausse » ne prédit pas automatiquement une hausse sur 20 jours.** Sur les 15 observations « hausse / volatilité ordinaire », seulement 5 variations futures sont positives ; la médiane est négative.
2. **Les échantillons de 5 à 8 sont insuffisants pour classer les configurations.** La médiane « hausse / forte volatilité » de +5,63 % n'établit rien sur la prochaine hausse.
3. **Une moyenne positive avec médiane négative suggère une distribution asymétrique**, mais aucune valeur extrême n'a été étudiée ici.
4. **Le protocole utilise toute l'archive pour lire les résultats**, même si la catégorie à t n'utilise que le passé. Il n'y a **pas de véritable essai prospectif enregistré avant les événements**.
5. Les seuils de classification ont été choisis pour apprendre. **Pas de test de robustesse aux seuils, autres actifs, devises, horaires, frais ou sources.**
6. Pour passer à un vrai backtest de stratégie, il faudrait définir un **ordre simulé à l'ouverture suivante**, un état de portefeuille et une règle complète de sortie, puis isoler les périodes d'évaluation.

**Conclusion scientifique :** il serait prématuré d'ajouter dans le programme un sélecteur automatique « meilleur profil selon le régime ». Nos premières données ne le justifient pas.

## 6. Checkpoint historique séparé : 30 septembre 2026

Dernier jour **réellement présent dans cette archive quotidienne**, et **non le 7 novembre 2026** :

| Mesure BTC/USDT Binance historique | Valeur |
|---|---:|
| Clôture du 30/09/2026 | 83 623,60 USDT |
| SMA 50 | 77 295,59 USDT |
| SMA 200 | 71 299,70 USDT |
| Variation observée 30 j | +6,42 % |
| Volatilité 20 j annualisée | 42,21 % |
| Seuil élevé calculé sur 180 j antérieurs | 43,62 % |
| Étiquette expérimentale | **Hausse / volatilité ordinaire** |

**Interdiction de confondre cette fiche historique de septembre avec un diagnostic de marché du 7 novembre :** l'archive s'arrête avant la date de la capture utilisateur, et le prix de celle-ci dépend d'autres sources et unités.

## 7. Dette scientifique utile : provenance du Top 5

Notre capture conserve un problème méthodologique précis, **pas une panne prouvée** : le visuel regroupe **1 historique direct** et **4 historiques en cache**. Sans âge par actif, le graphique ne permet pas de certifier une comparaison synchronisée des trajectoires.

### Critères d'une prochaine recette de données, non exécutée

Pour chaque série des cinq tokens : renseigner \`asset_id\`, \`symbol\`, \`quote_currency\`, \`source_provider\`, \`source_mode=direct|cache\`, \`fetched_at\`, \`first_timestamp\`, \`last_timestamp\`, \`point_count\`, \`gap_count\`, \`normalization_base\`, \`price_age_seconds\`.

Vérifier **avant** d'interpréter une comparaison :

- même paire, devise, convention de prix et méthode de conversion ;
- même borne de début/fin et pas temporel, ou marquage explicite des intervalles non communs ;
- valeur de base 100 calculée sur le premier point réellement partagé entre les séries ;
- cohérence du dernier prix affiché avec le dernier point de l'historique et son timestamp ;
- définition de l'état « à jour », seuil d'âge par source et marquage des données en cache ;
- si les sources sont hétérogènes, afficher les provenances et ne pas promettre une comparaison de précision identique.

**Aucune erreur de code n'est démontrée par la capture seule.** Cette rubrique décrit ce qu'il faut mesurer pour prouver la cohérence des données, et non un correctif aveugle à appliquer.

## 8. Respect du Math Core et frontières d'action

Cette étude reste alignée avec :

- [Atlas Signal Quality Math](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/modules/atlas_signal_quality_math.md) — source, fraîcheur, données favorables/défavorables et refus d'une conclusion insuffisamment sourcée.
- [Atlas Risk Math](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/modules/atlas_risk_math.md) — exposition, capital autorisé, limites, frais et pertes possibles.
- [Atlas Math Core](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/modules/atlas_10_crypto_math_core.md) — analyse publique en observation/simulation, sans exécution.
- [Bibliothèque des sept fiches et comparaison des profils](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles) ; [Atlas HTML autonome](https://blueazur-hub.github.io/erith-ia-memory/assets/strategy_library/seven-heaven-crypto-strategy-atlas.html).

**Actions réellement effectuées pour R08 :** lecture du fil déjà fourni, lecture des sources GitHub, extraction/décompression en mémoire de l'archive historique, calcul déterministe, validation des tableaux, conservation locale du présent rapport et d'un JSON de données structurées.

**Actions NON effectuées :** GitHub/Notion n'ont pas été modifiés ; aucun code Administrator/Operator/Trader n'a été édité ; aucun compte OKX n'a été consulté ; aucun ordre PAPER ou réel n'a été passé. Aucun score live actuel ou taux de réussite de stratégie n'est revendiqué.

## 9. Point d'arrêt et continuation logique

**Acquis durable :** nous avons maintenant une *classification explicite sans information future* et un protocole de provenance pour les graphiques mélangés (direct/cache). L'étude à 20 jours rappelle qu'un état apparent du marché ne constitue pas en lui-même une stratégie.

**Suite rationnelle distincte :** enregistrer d'abord des observations PAPER au fil de l'eau, puis auditer la fraîcheur et la synchronisation des séries. Réserver les gains/pertes d'un vrai backtest aux règles d'exécution préalablement définies.

**Règle Seven Heaven : une source, une date, une unité, une hypothèse, une preuve, un arrêt.**