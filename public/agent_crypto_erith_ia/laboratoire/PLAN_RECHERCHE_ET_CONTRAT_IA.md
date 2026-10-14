# Laboratoire IA · Plan de recherche, contrat de données et ergonomie

**Mise à jour :** 14 octobre 2026. **Propriétaire :** Seven Heaven (passation à la prochaine IA).  
**Livraison actuelle :** Trader / Administrator 40.6.633, Laboratoire BTC–CT–Q présent sur `main`, validation visuelle Firefox encore à confirmer.  
**Extension présente sur branche :** `seven/laboratoire-ai-preuves-protocole` ; aucune modification du Market Core, des ZIP du Coffre ou des comptes privés.

## 1. Destination : un laboratoire de recherche, pas un robot d'achat

La même information doit pouvoir être **comprise par un humain** et **consommée par une IA** :
- Vue humaine : réponse courte, graphique, source, date, devise, conclusion provisoire et avertissement en français.
- Vue IA : objet structuré, identifiants et horodatages non ambigus, provenance vérifiable, données manquantes explicites.
- Aucun modèle ne réécrit une observation certifiée ; une nouvelle analyse produit un nouvel objet relié à l'original.
- Aucune décision de trading automatisée, aucune transmission de clé ni sauvegarde d'un solde privé sur GitHub.
- Chaque cas peut exister **hors Top 250**, mais son historique externe n'est pas renommé « Coffre vérifié ».

## 2. Six familles de données nécessaires

| Famille | Ce que l'IA doit recevoir | Ce que l'humain doit lire | Vérité propriétaire |
| --- | --- | --- | --- |
| Identité | `coin_id`, symbole, nom, contrat/réseau si prouvé | « De quel actif s'agit-il ? » | Catalogue d'identité |
| Marché | Exchange, instrument Spot exact, base, quote, spread, volume, profondeur, latence | Prix coté en **USDT/USDC/EUR**, frais et distance au meilleur ordre | OKX / Binance / Bitget publics |
| Historique | intervalle, grille UTC, OHLCV, bougie clôturée ou non, couverture et trous, SHA-256 | Période réellement observée ; qualité et interruptions | Coffre certifié ou historique externe identifié |
| Fondamentaux | liens officiels datés, utilité, offre, déblocages, risques de concentration | Synthèse neutre et « inconnu » si données absentes | Sources officielles + vérification indépendante |
| Expérience | hypothèse **avant** résultat, horizon, règle de décision, benchmark, frais, glissement | Ce qu'on a prévu et réellement observé ensuite | Journal local / protocole d'expérience |
| Compte privé | **jamais dans le registre public** | Position, frais et prix d'acquisition uniquement dans Bridge/Trader local | OKX privé via Bridge en lecture seule |

**Interdit :** fusionner implicitement CT-USDT avec CT-USDC, ou convertir des prix sans enregistrer la source et l'heure du taux ; assimiler la TVL d'un protocole à la capitalisation de son jeton ; remplir des bougies absentes par interpolation silencieuse.

## 3. Exemple minimal de contrat IA (schéma proposé, non encore branché au marché)

```json
{
  "schema": "aerith.lab.market-observation.v1",
  "asset_id": "concrete",
  "symbol": "CT",
  "exchange": "OKX",
  "instrument": "CT-USDT",
  "market_type": "spot",
  "base": "CT",
  "quote": "USDT",
  "observed_at": null,
  "received_at": null,
  "source_url": "https://www.okx.com/docs-v5/en/",
  "source_kind": "official_api_documentation",
  "data_kind": "orderbook_snapshot",
  "value": null,
  "unit": "USDT/CT",
  "timeframe": null,
  "bar_finalized": null,
  "archive_sha256": null,
  "data_gaps": "not_assessed",
  "conversion_method": "none",
  "quality": "documentation_only",
  "execution_allowed": false
}
```

Il ne contient **aucun cours inventé**. Une mesure réellement collectée sera stockée avec son heure **UTC**, sa devise native et le statut du fournisseur. `null` ne signifie jamais zéro.

## 4. Protocole d'acquisition : sources d'origine et limites

1. **OKX, public :** `GET /api/v5/public/instruments` pour confirmer instrument et règles Spot, `/market/candles` et `/market/history-candles` pour les bougies, `/market/books` pour le carnet. Respecter le champ `confirm` (bougie en cours / achevée) et l'horodatage source ; la limite de la requête de bougies courantes est 300. Ne jamais confondre données publiques et `trade/order`.
   Référence : https://www.okx.com/docs-v5/en/
2. **Binance public :** archives ZIP Spot 1m/1h/journalières, avec fichier `.CHECKSUM` et vérification SHA-256. Attention : depuis janvier 2025, les timestamps **Spot** téléchargés peuvent être en **microsecondes**, pas toujours en millisecondes.
   Référence : https://github.com/binance/binance-public-data/blob/master/README.md
3. **CoinGecko :** identité par **coin-id**, agrégats en USD et périodes `/coins/{id}/market_chart`. La granularité, les limites historiques et le niveau de service dépendent du plan ; ne pas étiqueter ces points comme bougies Spot natives. Il y a eu un alignement des timestamps de données historiques en août 2026 : dater la collecte et signaler les révisions.
   Références : https://coingecko-api-v3.readme.io/reference/coins-id-market-chart et https://status.coingecko.com/info_notices/387371
4. **Concrete :** présentation du protocole `concrete.xyz`, annonce OKX Spot CT-USDT du 30/09/2026 ; CoinGecko affiche une offre maximale de 1 Md CT et une offre circulante non renseignée. DeFiLlama concerne la **TVL du protocole**, distincte d'un profit du trader ou du volume effectivement exécutable du jeton.
   Références : https://concrete.xyz/ ; https://www.okx.com/en-us/help/okx-to-list-ct-usdt-concrete-for-spot-trading ; https://www.coingecko.com/en/coins/concrete ; https://defillama.com/protocol/concrete
5. **Quack AI :** documents du protocole et jeton Q (offre max annoncée : 10 Md Q ; 79 % communauté/écosystème). Résoudre séparément le **marché Spot exact**, vérifier le calendrier de distribution effectif et l'offre circulante avant toute étude d'impact sur le cours.
   Références : https://quackai.ai/blog/introducing-q-powering-the-future-of-ai-governance ; https://quackai.gitbook.io/docs

L'inventaire initial public se trouve dans **`catalogue-preuves.json`**. Les captures historiques des 13–14 octobre y sont des **observations datées**, non du live.

## 5. Règles de vérification automatique

- **Identité :** une clé stable `coin-id` et un instrument Spot exact ; jamais le rang mouvant du Top 250 comme identité.
- **Temporalité :** UTC dans les mesures, timezone affichée clairement au lecteur. Séparer l'heure du marché, de la réception et de la capture.
- **OHLCV :** aucune seconde/bougie fabriquée, pas de doublons, pas d'inversion chronologique ; contrôle des jours/mesures absents, des timestamps et de la devise.
- **Prix :** conserver `quote`, `unit`, conversion éventuelle, provenance du taux et frais appliqués.
- **Ordres :** minimum de quantité ou notionnel, bid/ask, profondeur, taille réaliste, slippage et frais ; si non disponibles, simulation qualifiée `hypothétique`.
- **Qualité :** `authentifié`, `public horodaté`, `image terrain`, `hypothèse`, `inconnu`. Ne pas transformer un échec HTTP en cours = 0.
- **Vie privée :** aucune quantité ou coût d'acquisition personnel dans le registre et les exports publics ; le journal local est séparé du dépôt.

## 6. Interface humaine : réduire la surcharge

**Vue condensée en tête :** « Actif · Marché exact · Dernière preuve · État de couverture · Limites ». Puis rubriques : Synthèse / Marché / Coffre / **Preuves IA** / Simulation / Journal IA.

- Navigation **horizontalement par dossier**, lecture verticale, cartes **en deux colonnes** sur grand écran et une sur petit.
- Éviter l’empilement de 250 pages HTML : modèle commun et fiches de données déclaratives.
- Le laboratoire est **épinglé par défaut**. « Suivre le graphique » ne doit pas changer de crypto dans Top 3/5, Hausses ou Volumes.
- Garder les avis de risque visibles mais sobres. Aucune courbe ou panneau supplémentaire n'apparaît sans action explicite.
- Ne pas recentrer la page par `scrollIntoView`, ne pas forcer le plein écran, ne pas effacer la mémoire V7 ni le contenu du coffre.
- Le bandeau de données signale **« documentation / observation datée / live confirmé / inconnu »** ; jamais « FRESH » pour un rapport statique.

## 7. Expérimenter rigoureusement

Pour chaque hypothèse, consigner au départ : `coin-id`, instrument, heure, période, scénario et invalidation, taille fictive, frais, glissement, benchmark BTC, horizon, version de l'algorithme et sources. Ensuite mesurer à horizon fixe : succès, gain/perte **après coûts**, perte maximale, erreurs de prédiction, volatilité, biais et couverture des données. Ne pas optimiser après coup sur la même période.

Une **expérience en argent réel**, si elle est décidée humainement, doit rester hors exécution automatique du laboratoire ; elle n'est pas une preuve de robustesse. Les opérations fictives et réelles doivent être séparées dans toutes les statistiques.

## 8. Étapes après cette passation

1. **Vérifier sous Firefox la livraison 40.6.633** : ouverture, rapport BTC unique, CT/Q, simulation, journal, mémoire A/B/C, mode épinglé/suivre et aucune régression F11.
2. **Valider l'onglet Preuves IA** proposé sur la branche dédiée, ses tests et le registre JSON, puis préparer une version de publication suivant le protocole de livraison (pas de version dans le nom du fichier).
3. Brancher les inventaires du Coffre en **lecture seule** : distinguer disponibilités réelles des périodes et archives externes.
4. Étendre les sélections **Hausse 5/10 et Volume 5/10** avec filtres de liquidité, unité du volume USD, origine et heure de calcul ; afficher cinq courbes par défaut et dix seulement à la demande.
5. Développer un **évaluateur hors-échantillon** : hypothèses verrouillées avant résultat, comparaison aux mêmes périodes BTC, coût réaliste, aucune prédiction certaine.
6. Étendre au Top 20 puis par crypto à la carte ; une seule architecture, fiches déclaratives, ni duplication du marché ni pollution des caches authentifiés.

## 9. Arrêt et règle de continuité

Aucune tâche de fond n'est créée par cette passation. Si les tests ou la reprise de contexte saturent, appliquer le protocole STOP et reprendre en texte. Toute nouvelle IA devra **vérifier les états GitHub / Notion réels** avant d'annoncer une action accomplie.
