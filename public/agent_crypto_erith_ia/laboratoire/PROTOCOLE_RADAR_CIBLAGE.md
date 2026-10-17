# ERITH.IA — Protocole de ciblage et de surveillance du Radar

**17 octobre 2026 · Seven Heaven · document de méthode du laboratoire · lecture seule · aucune exécution réelle**

## Objet et périmètre

Détecter parmi les 1 000 actifs publics des **dossiers de recherche** qui méritent une observation, documenter les raisons du choix et évaluer ensuite le devenir des signaux. Une hausse n'est jamais un ordre, une prévision certifiée ni une garantie de gain.

Ce protocole complète — sans les remplacer — `laboratoire/radar.js`, `administrator/js/market-radar-native.js` et `tools/qualify_radar_targets.py`. Les données de l'Interface font autorité ; le Trader reprend ces fonctions et y ajoute ses capacités spécialisées. Un seul graphique possède la sélection visible.

**Ne pas confondre deux expériences :**
- **Radar 20 historique** : univers fixe ETH, SOL, XRP, ADA, LINK, AVAX, SUI, NEAR, UNI, AAVE, LTC, BCH, DOT, HBAR, XLM, DOGE, PEPE, SHIB, APT, ARB. Son protocole prospectif est gelé dans `data/trader_flux/radar20_forward/experiment.json`. Aucun changement de stratégie, de capital, d'horizon ou de sélection ici.
- **Radar Top 1 000 → 20 candidats dynamiques → 10 dossiers prioritaires** : surveillance exploratoire indépendante ; son état varie avec le snapshot et la qualité réelle des sources. Ces deux séries de « vingt » ne sont pas interchangeables.

## A — Détection publique : état effectivement programmé

Source : snapshots CoinGecko `data/crypto/latest.json` (Top 250) et `data/crypto/extended.json` (251–1 000). Avant de sélectionner, contrôler la présence de 1 000 rangs distincts, les identifiants uniques, la cohérence des snapshots (écart maximal de six heures) et les valeurs numériques.

Filtres de base effectivement codés dans `laboratoire/radar.js` :

| Contrôle | Règle |
|---|---|
| Capitalisation | au moins 25 millions USD |
| Volume agrégé 24 h | au moins 1 million USD |
| Rotation (volume 24 h / capitalisation) | de 1,5 % à 200 % |
| Prix, variation 24 h, variation 7 j | obligatoirement numériques et valides |
| Stablecoins, actifs enveloppés / dérivés | exclusions explicites par symboles dans le lecteur |
| Momentum | hausse 24 h ≥ 4 % et hausse 7 j positive |
| Rebond | hausse 24 h ≥ 4 % et évolution 7 j négative |

Le lecteur propose au plus **douze** candidats par catégorie, triés initialement par hausse 24 h. La liste destinée à l'étude Spot reprend **vingt** candidats selon le classement du volume agrégé au moment du relevé. Les variations 30 jours sont un contexte, pas un critère d'exécution.

Une hausse de 25 %, 100 % ou davantage doit produire un **avertissement de risque de retournement**, pas un bonus de « bonne affaire ».

## B — Qualification Spot : état effectivement programmé

Source : `tools/qualify_radar_targets.py`, publication `data/crypto/radar-opportunities/qualification-latest.json`.

1. Identifier le **CoinGecko ID**, le symbole et le nom ; refuser les collisions de symboles. Rechercher les paires **Spot USDT** sur Binance, OKX et Bitget. La présence de `QUSDT` ne prouve **pas à elle seule** que le jeton est le Q du CoinGecko ID `quack-ai` : il faut encore certifier l'identité du projet et son contrat.
2. Confirmer la continuité d'au moins **vingt bougies horaires closes** ; données trop anciennes, trouées ou incohérentes = dossier incomplet.
3. Lire le carnet **public de la même paire** ; contrôler bid, ask, spread, profondeur et fraîcheur. Un carnet Binance REST sans horodatage d'exchange est déclaré tel quel et non présenté comme horodaté par Binance.
4. Étudier un **aller-retour fictif de 100 USDT** en traversant les meilleurs niveaux disponibles. Hypothèse pédagogique de frais : **0,1 % par côté**, sans accès aux tarifs authentifiés ni garantie sur une future exécution.
5. Refuser la priorité automatique si le spread observé dépasse **150 points de base**, si le coût théorique aller-retour dépasse **2 %**, si les bougies et le carnet divergent de plus de **15 %**, ou si les données obligatoires manquent. Ces seuils sont des **garde-fous exploratoires à étalonner**, et non des seuils de rentabilité démontrés.
6. Trier les dossiers techniquement documentés d'abord par coût fictif croissant, puis par volume agrégé décroissant, et retenir **au plus dix** candidats. Ne jamais remplir dix places artificiellement. **Aucune paire ni identité CoinGecko n'est encore certifiée uniquement par ce collecteur**.

Une mesure est un **instantané** ; elle ne remplace pas un historique de carnets ni la preuve du prix auquel une transaction aurait été exécutée.

## C — Trois statuts lisibles dans le Radar

- **Priorité d'étude (données techniques observées)** : paire Spot et bougies/carnet admissibles ; contrat exact et fiabilité de la source à confirmer avant toute interprétation avancée.
- **À vérifier** : marché candidat connu mais pièce essentielle manquante (identité, frais, carnet, latence, bougies, source, etc.) ; afficher la cause.
- **Observation seulement** : actif du noyau projet (ex. BTC, CT, DNA, MHA), contrôle de marché, étude PAPER, ou candidat écarté ; ne pas le transformer artificiellement en opportunité.

Une « priorité d'étude » n'est **jamais** une recommandation d'achat ou de vente. Les dix dossiers en tête ne constituent pas un portefeuille. Les actifs absents du Top 1 000 et les nouveaux listings conservent leur contexte propre.

## D — Score Radar / 100 : proposition, **non encore implémentée ni validée**

**Ne jamais afficher de note /100 comme une vérité opérationnelle tant que la formule, les contrôles et sa calibration prospective ne sont pas développés et testés.**

Pondération **candidate à expérimenter** :

| Axe | Maximum | Preuves exigées |
|---|---:|---|
| Identité, source, fraîcheur | 20 | ID, contrat/pair vérifiés, dates, provenance |
| Liquidité / activité | 20 | carnet, profondeur, volume, rotation |
| Mouvement multi-horizons | 20 | 15 min / 1 h / 24 h / 7 j / 30 j, horodatages |
| Coûts et risque d'exécution | 20 | spread, traversée du carnet, frais estimés et limites |
| Structure du graphique | 10 | bougies closes, support/résistance, invalidation |
| Pertinence du laboratoire | 10 | scénario PAPER utile et traçable |

Les absences de preuves rendent la note **non calculable**, et ne donnent pas zéro arbitraire. Toute pénalité de surchauffe, de fraîcheur ou de concentration doit être publiée avec sa règle et vérifiée sur plusieurs périodes hors échantillon ; ne pas « ajuster » les paramètres après avoir vu les résultats.

## E — Surveillance dynamique à construire après validation du protocole

Le Radar doit fournir un **journal append-only**, daté UTC, sans effacer l'observation précédente. Chaque observation stockera au minimum :

`observed_at_utc`, `coingecko_id`, `symbol`, `contract_or_verified_identity` (ou inconnu), `venue`, `instrument_type`, `base`, `quote`, `pair`, `period`, `provider`, `price`, `volume`, `spread_bps`, `depth_budget`, `modelled_cost`, `data_age`, `signals`, `missing_evidence`, `decision_paper`.

- **À chaque relevé horaire autorisé** : comparer les bougies closes, les volumes, les écarts de prix et la structure, sans extrapoler.
- **Quand l'utilisateur ouvre une vue active** : lire le carnet actuel, dater l'observation et éviter tout carnet d'un autre instrument.
- **À +1 h, +4 h, +24 h, +7 j** : comparer le résultat futur à la prédiction **déjà enregistrée**, sans utiliser les données futures pour modifier le signal passé.
- Distinguer : `OBSERVE`, `WAIT`, `INVALIDATED`, `INCOMPLETE`, et `PAPER_CASE`. Aucune commande réelle, aucun accès privé OKX et aucun enrichissement silencieux d'une source manquante.

Un système ne peut pas revendiquer « détecté avant la hausse » si le premier relevé est postérieur à l'accélération.

## F — Cas pilote Q · Quack AI

**Date vérifiée de première cotation : 2 septembre 2025.** Ce n'est pas un nouveau listing d'octobre 2026.

- Binance Alpha : 2 septembre 2025, **07:00 UTC** (Alpha ne prouve pas un listing Binance Spot classique).
- Bitget Spot **Q/USDT** : 2 septembre 2025, **08:00 UTC**.
- KuCoin Spot **Q/USDT** : 2 septembre 2025, **08:00 UTC**.
- Référence de contrat BNB Smart Chain (BEP-20), annoncée par Bitget : `0xc07e1300dc138601FA6B0b59f8D0FA477e690589`. À comparer à la chaîne et aux métadonnées exactes avant toute certification d'identité.

Sources externes officielles :
- https://www.binance.com/en/support/announcement/detail/e1826e566e5b454ba7b439082bfbbc4f
- https://www.bitget.com/support/articles/12560603836754
- https://www.kucoin.com/announcement/en-quack-ai-q-gets-listed-on-kucoin-world-premiere

Q illustre une **accélération tardive sur actif coté depuis 2025**, et non un nouvel actif. Dans l'Interface, consigner la capture datée du 17 octobre 2026, la provenance des bougies CoinGecko et, séparément, le carnet Spot Bitget `Q/USDT`. Pour une étude PAPER, fixer d'abord les critères de confirmation et d'invalidation, puis relever les observations futures **sans réécrire les seuils a posteriori**.

## G — Critères de livraison / arrêt

1. Toute priorité doit être reproductible à partir d'un snapshot publié et horodaté ; toutes les paires doivent indiquer `SPOT` et leur devise exacte.
2. Aucune fiche Q, DNA, CT, MHA ni autre actif ne reprend le carnet BTC par défaut. Si la paire ne correspond pas, laisser le carnet inactif avec explication.
3. Le Radar reste dans l'espace existant, en **lecture seule**, avec navigation vers une fiche Market native ; il ne crée pas de deuxième graphique.
4. Les statuts « inconnu », « incomplet », « périmé » et « non certifié » doivent demeurer visibles.
5. Tester le changement d'actif, le F5, les réponses réseau tardives, les périodes et l'état après fermeture.
6. Tout développement suivant requiert une preuve CI, un commit `main` et la validation visuelle Firefox de l'utilisateur. L'absence d'un test ne vaut pas succès.

**Stop point :** ce document décrit le comportement souhaité et les contrats existants. Il ne déclenche aucune collecte nouvelle, aucun achat et aucune décision automatique de trading.
