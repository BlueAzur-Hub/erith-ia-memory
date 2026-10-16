# ERITH.IA — Contrat canonique du Snapshot Analyse

Statut : **contrat conservé ; accès en lecture seule à la série publiée implémenté. Calculateur et affichage Snapshot Analyse encore à développer.**  
Périmètre : **Radar → Graphique Solo → Analyse**, lecture seule, sans ordre.  
Propriétaire : **Interface / Administrator** ; le **Trader hérite** du même contrat et ajoute ses expériences PAPER.  
Nom stable prévu pour le calculateur pur : `snapshot-analyse.js` ; pour ses tests : `test-snapshot-analyse.cjs`. Aucun numéro de version dans les noms.

## 1. Raison d'être et frontière

Le Snapshot Analyse ne produit pas de nouvelles cotations. Il décrit, de façon reproductible, **la série réellement acceptée et affichée par le graphique canonique**, avec son identité, sa provenance, sa période et ses limites. Il n'est ni un conseil d'investissement, ni un moteur de signaux, ni le Math Core.

Pipeline obligatoire :

1. L'utilisateur sélectionne une crypto dans Radar / Market.
2. Le **propriétaire existant du Graphique Solo** accepte et publie l'identité exacte et la série.
3. Un **adaptateur de lecture seule appartenant à ce propriétaire** expose une copie normalisée de la série publiée et ses preuves.
4. Un calculateur **pur et déterministe** valide, calcule et retourne un snapshot.
5. La **Lecture Technique existante** affiche les résultats sans recréer de panneau ou de moteur.
6. À chaque changement d'actif ou de période, invalider la lecture précédente. Une réponse ancienne ne peut réécrire la nouvelle.

**Ne jamais** récupérer une autre série sur réseau pour embellir le snapshot ; utiliser des valeurs dessinées dans le DOM/canvas ; récupérer une série d'un actif différent ; confondre prix live décoratif et dernier point historique ; écrire dans les comptes ou passer des ordres.

## 2. Surfaces existantes (constat à la lecture du dépôt)

- Le Radar délègue la sélection au contrôleur Market `AgentCryptoCommands.chart(id,"24h")` ou au contrôleur natif des nouveaux listings `selectById()`.
- `AtlasExternalChart.state()` fournit notamment `coin_id`, `period`, `loading`, `error`, mais **ne fournit actuellement aucun tableau de points**. On ne peut donc pas bâtir un calculateur honnête avec cette seule API.
- Pour les nouveaux listings, `AgentCryptoNewListingsNativeCategory.mathSeriesSnapshot()` expose après vérification une série `[[timestamp_ms, prix_affiché], ...]` avec instrument, provider, source, devise et `periodDays`, à condition que l'identité et la publication correspondent.
- `math-core-external-guard.js` protège déjà la cohérence d'identité des séries externes et suspend ses calculs quand la série est trop courte/périmée.
- Le Math Core canonique `scoreCoin()` est un **autre calcul**. Un Snapshot Analyse ne s'en approprie pas le score.

**Accès en lecture seule implémenté :** `AgentCryptoPublishedSeries.read()` est exposé par le propriétaire canonique `administrator/app.js`. Il renvoie une copie immuable des points correspondant aux données réellement rendues (contrôle d’identité, de période et de prix brut). Aucun autre module ne lit `__atlasExternalChartContext`. Les séries converties USDT → USD exposent `conversion.verified=false` tant qu'une preuve indépendante du taux horodaté n'est pas publiée. Le calculateur devra alors refuser de certifier une analyse USD complète.

Références source : 
- [Radar natif](../administrator/js/market-radar-native.js)
- [Nouveaux listings](../administrator/js/new-listings-native-category.js)
- [Protection Math externe Trader](../trader/math-core-external-guard.js)
- [Propriétaire principal Administrator](../administrator/app.js)

## 3. Contrat d'entrée normalisé (pour le calculateur pur)

```json
{
  "assetId": "concrete",
  "symbol": "CT",
  "instrument": "CT-USDT",
  "provider": "okx",
  "periodRequested": "24h",
  "periodDays": 1,
  "sourceMode": "new-listing-exchange-native",
  "source": "OKX Spot CT/USDT, conversion USDT/USD référencée",
  "displayCurrency": "USD",
  "quoteCurrency": "USDT",
  "conversion": {
    "required": true,
    "verified": true,
    "source": "référence publique horodatée",
    "observedAt": "2026-10-16T18:00:00Z"
  },
  "published": true,
  "integrityOk": true,
  "selectionRevision": 42,
  "chartRevision": 42,
  "activeChartAssetId": "concrete",
  "lastPointAt": "2026-10-16T18:00:00Z",
  "observedAt": "2026-10-16T18:00:00Z",
  "series": [[1792087200000, 0.35], [1792087500000, 0.351]]
}
```

Cet exemple décrit **la forme des données** ; les prix, révisions et dates sont **fictifs**. Il n'est pas un relevé CT. La série réelle devra comporter tous les points nécessaires à l'analyse.

### Conditions de validation

- `assetId`, `symbol`, `instrument` et `provider` cohérents avec l'actif **actuellement affiché**. Pour un instrument de marché externe, vérifier la paire exacte (ex. `CT-USDT`, `DNAUSDT` ou `MHAUSDT`), et pas seulement le symbole.
- `selectionRevision === chartRevision` et `activeChartAssetId === assetId`. En cas de sélection tardive ou de changement de période, **rejeter** le calcul précédent.
- `published === true`, `integrityOk === true`, propriétaire confirmé ; aucun état `loading`, `blocked` ou `error`.
- Série : tableau de paires `[timestamp_ms, prix]` ; timestamps UTC millisecondes **strictement croissants**, uniques et plausibles ; prix **finis et strictement positifs** ; aucune interpolation ou point live synthétique injecté.
- Au moins **21 observations exploitables** pour évaluer la tendance ; ce minimum est un seuil de cohérence avec la protection Math externe, **pas une garantie de couverture temporelle**.
- Devise explicite ; si une cotation USDT/USDC est convertie pour affichage USD, enregistrer une **preuve de conversion séparée** avec sa source et son horodatage. Sans elle, bloquer les calculs en USD. USDT, USDC, USD et EUR ne sont pas interchangeables.
- Si la série est normalisée base 100, la ramener au **prix réellement validé** uniquement via son propriétaire ; un prix base 100 n'est jamais un prix USD.

## 4. Horizons prioritaires

| Horizon | But | Complétude temporelle | Fraîcheur maximale envisagée |
| --- | --- | --- | --- |
| **24 h** | Tactique : impulsion, repli, amplitude | ≥ 90 % des 24 h observées | dernière donnée ≤ 30 min |
| **7 j** | Contexte court : confirmation ou divergence du 24 h | ≥ 90 % des 7 j observés | dernière donnée ≤ 8 h |
| **30 j** | Structure : tendance prolongée, retour dans la plage | ≥ 90 % des 30 j observés | dernière donnée ≤ 48 h |
| 60 j / 90 j / 1 an / Max | Hors ; étude ultérieure | non défini | non défini |

Seuils **proposés à tester**, repris en partie de la politique de fraîcheur déjà utilisée pour les lignes externes ; ils ne décrivent **pas** une couverture historique actuellement prouvée. La fraction de couverture est `(dernierTimestamp - premierTimestamp) / duréeDemandée`, plafonnée à 1, avec contrôle de la plus grande lacune (max. **20 %** de la durée demandée). La série doit recouvrir la fenêtre voulue sans la prolonger artificiellement.

- `ready` : identité, devise, publication et points valides, couverture ≥ 90 %, aucune grande lacune, fraîcheur respectée.
- `partial` : identité validée et observations exploitables, mais couverture insuffisante, lacunes ou ancienneté. Les chiffres sont qualifiés de **« fenêtre réellement observée : X h/j »**, jamais présentés comme une variation complète 24 h/7 j/30 j.
- `blocked` : identité ou devise invérifiable, série absente, moins de 21 points, valeurs invalides, résultat antérieur à la sélection, ou date incohérente. **Aucune mesure chiffrée supposée**.
- `not_available` : horizon demandé non présent dans la série disponible. Ce n'est pas un zéro, ni une période reconstruite.
- Si une série 7 j authentique couvre aussi 24 h, une **découpe locale explicite** peut servir au 24 h sous les mêmes contrôles de fraîcheur/couverture. Ne pas lancer un second fetch. Une période affichée sans couverture réelle reste **partielle**.

## 5. Règles de calcul déterministes

Opérer uniquement sur les prix d'une fenêtre validée : `P0` (premier), `Pn` (dernier), `low = min(prix)`, `high = max(prix)`, `n = nombre de points`.

| Champ | Formule / règle |
| --- | --- |
| `priceCurrent` | `Pn` = dernier prix de la **série**, pas ticker live ni balance OKX |
| `changePeriodPct` | `100 × (Pn / P0 − 1)` si `P0 > 0` |
| `low` / `high` | Min/max **des prix échantillonnés**, **pas** vrais bas/haut OHLC entre points |
| `amplitudePct` | `100 × (high − low) / low` |
| `rangePositionPct` | Si `high > low` : `100 × (Pn − low) / (high − low)` ; sinon `null` |
| `maxDrawdownPct` | `max(100 × (1 − prixCourant / maxPrixAntérieurInclus))` sur la série |
| `coveragePct` | `min(100,100 × (tDernier − tPremier) / duréeDemandée)` |
| `observedHours` | `(tDernier − tPremier) / 3 600 000` |
| `points` | `n` après validation, jamais le nombre annoncé par une légende seule |

**Direction descriptive :** comparer `changePeriodPct` à une zone neutre fixe, choisie pour et à recalibrer ensuite : ±1,5 % (24 h), ±3 % (7 j), ±5 % (30 j). Au-dessus : `hausse` ; au-dessous : `baisse` ; dans l'intervalle : `latéral`. Sur `partial`, le libellé porte obligatoirement **« sur fenêtre observée »**.

**Position dans la plage :** `rangePositionPct < 25` : `proche du bas échantillonné` ; de 25 à 75 : `zone médiane` ; au-dessus de 75 : `proche du haut échantillonné`. Si plage constante : `plage plate`.

**Momentum descriptif (pas prédictif) :** comparer le rendement `Pmilieu / P0 − 1` au rendement `Pn / Pmilieu − 1`, où `Pmilieu` est le point réellement disponible le plus proche du **milieu temporel**, jamais une valeur interpolée. Si le point est trop éloigné du milieu (> 10 % de la durée demandée), `momentumLabel = indéterminé`. Avec un seuil de comparaison de **1 point de pourcentage** :
- premier segment négatif et second positif : `rebond observé` ;
- premier positif et second négatif : `repli observé` ;
- segments de même signe et amplitude absolue du second supérieure de > 1 point : `accélération observée` ;
- segments de même signe et amplitude absolue du second inférieure de > 1 point : `ralentissement observé` ;
- sinon : `stable / non significatif`.

**Amplitude et volatilité :** ne pas faire passer l'amplitude `(high−low)/low` pour une volatilité statistique annualisée. En, utiliser `rangeIntensityLabel` : `faible / modérée / forte`, avec seuils exploratoires par période 24 h (< 2 %, 2–8 %, > 8 %), 7 j (< 5 %, 5–20 %, > 20 %), 30 j (< 10 %, 10–35 %, > 35 %). `volatilityLabel` est donc **« non mesurée statistiquement »** en ; un futur calcul sur retours réguliers devra être défini et testé séparément.

**Décision descriptive, jamais ordre :**
1. `blocked` ou `not_available` → `Données insuffisantes`.
2. `partial` → `Observation partielle` / `Actif trop jeune` si date de listing **vérifiée** et horizon impossible.
3. Sinon, en priorité : `Mouvement étendu` (amplitude forte), `Rebond observé`, `Pression baissière observée`, `Comparer les horizons` si 24 h et 7 j valides de signes contraires, `Observer`.
Les libellés ne sont **pas** des recommandations d'achat/vente, des prédictions, ni des signaux de bots.

## 6. Contrat de sortie

```json
{
  "schema": "agent_crypto_snapshot_analyse",
  "status": "ready",
  "assetId": "id-unique-verifie",
  "symbol": "SYM",
  "instrument": "SYM-USDT",
  "provider": "venue-verifiee",
  "currency": "USD",
  "timeframe": "24h",
  "source": "source-horodatee-verifiee",
  "firstPointAt": "ISO-8601",
  "lastPointAt": "ISO-8601",
  "points": 288,
  "coveragePct": 99.6,
  "observedHours": 23.92,
  "metrics": {
    "priceCurrent": null,
    "changePeriodPct": null,
    "low": null,
    "high": null,
    "amplitudePct": null,
    "rangePositionPct": null,
    "maxDrawdownPct": null
  },
  "trendLabel": "hausse | baisse | lateral | indetermine",
  "rangeIntensityLabel": "faible | moderee | forte | indeterminee",
  "volatilityLabel": "non mesuree statistiquement",
  "momentumLabel": "rebond observe | repli observe | acceleration observee | ralentissement observe | stable | indetermine",
  "decisionLabel": "Observer",
  "integrity": {
    "identityVerified": true,
    "sourceVerified": true,
    "conversionVerified": true,
    "coverageVerified": true,
    "freshnessVerified": true,
    "warnings": []
  },
  "selectionRevision": 42
}
```

L'exemple n'est **pas un résultat de marché** ; les mesures numériques à `null` représentent des champs à remplir par le calcul. En cas de statut `blocked` ou `not_available`, tous les champs métriques restent `null`. Pour `partial`, seulement les mesures effectivement observées, et toujours explicitement étiquetées partielles.

## 7. Affichage — intégrer, ne pas dupliquer

Dans la **Lecture Technique existante**, une section repliable **« Snapshot Analyse · source graphique »** présente :
- identité, paire, prix/devise, fournisseur, provenance, dernière observation, période et nombre de points ;
- variation mesurée, bas/haut *échantillonnés*, amplitude, position dans plage, drawdown ;
- direction, momentum, amplitude et statut des contrôles ;
- comparaison 24 h / 7 j si **deux fenêtres réellement vérifiées** ; 30 j seulement si disponible ;
- erreurs lisibles `en cours / partiel / données insuffisantes / horizon indisponible`.

Ne rien déplacer dans Radar, Market, Math Core ni modifier l'Administrator au seul profit d'une présentation Trader. Le calcul est partageable ; le Trader pourra l'utiliser dans ses laboratoires PAPER sans écrire d'ordres.

## 8. Tests obligatoires du futur calculateur

1. BTC, ZEC ou TRX, 24 h publié avec identité, source USD et points complets : `ready`, formules exactes.
2. FIGR_HELOC 7 j : si une courbe annoncée 7 j ne couvre réellement que 5 j, **ne pas annoncer 7 j complets**.
3. DNA jeune : si une date de cotation confirmée implique moins de 24 h d'existence, 24 h `partial` ; 7 j et 30 j `not_available`, sans valeurs inventées.
4. CT/USDT avec affichage USD : conversion explicite vérifiée requise ; sinon `blocked`, sans traiter USDT = USD.
5. Sélection tardive BTC après clic DNA, ou changement 24 h → 7 j pendant chargement : résultat ancien rejeté, aucune pollution de la Lecture Technique.
6. Échantillons mal ordonnés, prix nul/négatif, conversion absente, 20 points, plus grande lacune excessive : pas de label `ready`.
7. Courbe en base 100, extrémité live virtuelle, faux OHLC ou ticker d'un autre fournisseur : refus ou exclusion explicitement documentée.
8. Même entrée → sortie identique, sans réseau, sans stockage, sans timer, sans side effects.
9. Radar → Graphique → Analyse → retour Market : le propriétaire unique du graphique, le Math Core et la sélection mémorisée restent inchangés.
10. Aucune promesse de profit, aucun bot ni ordre OKX créé par le snapshot.

## 9. Ordre d'implémentation (prochaines tâches, non réalisées ici)

**A. Livré.** Le propriétaire du graphique publie `AgentCryptoPublishedSeries.read()` : lecture immuable et sans deuxième collecte. Vérifier la révision une nouvelle fois *après* toute résolution asynchrone reste une obligation pour les consommateurs.

**B.** Développer `laboratoire/snapshot-analyse.js` comme fonction pure + `test-snapshot-analyse.cjs`. Première intégration : 24 h, puis 7 j, puis 30 j si couverture prouvée.

**C.** Relier l'événement d'acceptation de sélection et de publication graphique à la Lecture Technique existante. Ne pas déclencher de calcul à partir d'un simple clic si le graphique n'a pas confirmé la série.

**D.** Valider Firefox : BTC → ZEC → TRX → FIGR_HELOC → CT → DNA → retour BTC, avec identité, période, fraîcheur, conversion et cohérence graphique/snapshot visibles. Livrer commit, PR, tests, ZIP, preuve Firefox.

**Interdit** : nouveau moteur Market, second graphique, nouveau Math Core, ordre réel, demande de permission Futures, substitution silencieuse BTC, nombres inventés, numéro de version dans les noms de fichiers.

---

Cette spécification est le **contrat de travail**. Elle n'affirme **pas** que le Snapshot Analyse est déjà codé, connecté ou certifié en Firefox.
