# Seven Heaven — Raccordement sûr du validateur historique EUR/USD

**État : 26 octobre 2026. Travail de recherche et tests, AUCUN correctif déployé dans Administrator.**
**Source canonique examinée :** [`administrator/app.js`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/app.js), blob `c7a8905d956462c3944933558a110ca2742ac1eb`, 68 106 lignes. Les numéros ci-dessous ne valent que pour ce blob. **Important :** ce rapport est une carte de migration, pas une autorisation pour remplacer automatiquement les 11 appels.

## Résultat expérimental réellement exécuté

- Avec les points BTC USD 24h exportés depuis Firefox (`bitcoin:USD:coingecko:1`, dernier prix `80 159.306935`), la **vraie** fonction inchangée `atlasValidateChartSeries` extraite d'`app.js` en VM calcule un avertissement **> 12 %** si `c.price=71 366.61` (EUR). Le résultat reste `ok: true` avec warning.
- Sur les MÊMES points, le contrat isolé `historicalSpotParity` compare `priceUsd=80 159.31` à l'historique USD avec fournisseur CoinGecko et timestamps compatibles : écart **< 0,01 %**, aucun avertissement.
- Le prototype rejette les cas source incompatible, timestamp trop éloigné, devise indéterminée, confusion USD vs USDT/USDC.
- **Tests réellement lancés avec Node v22.16.0 : 17/17 PASS, zéro échec**, dont 9 tests du contrat, 4 tests de reproduction du défaut dans la fonction réelle, et 4 tests d'une candidate isolée du validateur (même source, modification en VM seulement). Les fichiers sont [`tools/historical-quote-contract.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-quote-contract.cjs), [`tools/historical-quote-contract.test.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-quote-contract.test.cjs), [`tools/historical-validator-wiring.test.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-validator-wiring.test.cjs) et [`tools/historical-validator-candidate.test.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/historical-validator-candidate.test.cjs). Le test de raccordement relève **11 appels + 1 déclaration**, et échouera volontairement si un appel change avant une nouvelle revue.
- **Ce sont des tests isolés**, avec instantané de marché simulé à partir des prix Firefox. Ils ne valident pas le rendu de Firefox, les 84 combinaisons ni la provenance native auprès des exchanges.

## Carte des 11 appels à réviser

| Ligne | Propriétaire | Devise déductible ou à prouver | Précaution |
|---|---|---|---|
| 5796 | `atlasGetStoredChartResult` | **inconnue sans métadonnées de `candidate`** | Valider l'identité du cache et l'instrument ; ne pas lire une série ancienne sans devise comme EUR par défaut |
| 10737 | `atlasOracleValidateCachedCandidate` | **inconnue sans métadonnées de `candidate`** | Oracle doit conserver la même monnaie et même source que l'historique validé |
| 15765 | `atlasScannerNativeUsdStored` | **USD revendiqué par une condition `currency || quoteCurrency`** | Exiger la provenance complète, non le libellé ni seulement un des deux champs |
| 15879 | Reprise scanner / archive | **EUR ou USD selon série et cache** | Ne pas accepter un historique d'autre devise quand la période change |
| 50202 | Binance natif direct | **EUR (paire `*EUR`)** | Propager la paire réelle et ses timestamps |
| 50228 | Binance dérivé | **EUR (paire USDT ÷ EURUSDT)** | Marquer explicitement la méthode de conversion, non USD |
| 50259 | Top5 Binance direct 24h | **EUR (paire `*EUR`)** | Ne jamais afficher `rawPrice` de cette série comme USD |
| 50330 | Scanner Binance direct | **EUR (`baseSymbolEUR`)** | Garder identité base/symbole exacte |
| 50370 | Scanner Binance dérivé | **EUR (USDT ÷ EURUSDT)** | Documenter source dérivée |
| 50401 | CoinGecko direct historique | **EUR (`vs_currency=eur`)** dans ce chemin original | Le module externe USD peut contourner cette fonction : vérifier le propriétaire effectif |
| 54006 | Bridge historique | **NON CERTIFIÉ sans `payload` / instrument** | Ne pas inférer EUR depuis un label « historique EUR » ; contrôler la réponse Bridge |

**Déclaration** : `atlasValidateChartSeries` L5663–5727. Aujourd'hui, L5700–5702 compare le dernier point à `c.price` **sans paramètre de devise** ; `atlasCoinPriceIsComparable` L19213–19221 vérifie uniquement fournisseur CoinGecko et proximité d'horodatage, et `atlasMergeSpotBookIntoCoins` L17188–17190 conserve `c.price = priceEur`, `c.priceUsd` séparé.

## Intégration à faire, dans cet ordre

1. **Contrat de vérité** : ajouter la devise d'acquisition explicite en amont (`quoteCurrency`), le fournisseur/instrument, et la provenance par série ; refuser le conflit. Le symbole `EUR` d'une paire et un libellé DOM ne sont pas interchangeables avec une valeur historique native `USD`.
2. **Validateur commun** : garder sans changement les règles de longueur, couverture, horodatage, fraicheur, intégrité du payload. Modifier UNIQUEMENT le test de parité avec spot : comparer à `priceEur` pour EUR / `priceUsd` pour USD seulement si source et heure sont compatibles ; pour USDC/USDT/indéterminé, **ignorer le test de parité**, sans masquer les autres défauts ni déclarer les prix certifiés.
3. **Relier les 11 propriétaires** en s'appuyant sur les informations connues avant le stockage ; pour le cache et le Bridge, si la devise est inconnue, **conserver la donnée comme non qualifiée** sans l'étiqueter USD ou effacer l'archive. Vérifier le chemin USD `graph-native-usd-406520.js` séparément.
4. **Corriger l'identité des caches**, qui omet encore la devise dans l'ancien `atlasChartStorageKey`, par lecture rétrocompatible et écriture nouvelle qualifiée ; ne jamais supprimer les 80 entrées existantes dans l'opération.
5. **Réparer la restitution des points** après qualification : `rawPrice` d'une courbe EUR ≠ prix USD ; séparer le vrai prix historique du spot Market. Pas de substitution par `—` généralisée, ni re-étiquetage de séries EUR.
6. **Recette** : d'abord 13 tests du contrat + tous tests existants directement concernés, puis matrice 84 cas (6 modes × 7 périodes × 2 devises), bascules, caches froid/chaud, Oracle, scanner, Bridge, et preuve Firefox. **Aucun passage en production avant cette validation.**

## Responsabilité et prochain acte

**Candidat isolé réalisé et testé :** le test `historical-validator-candidate.test.cjs` reconstruit en mémoire la vraie fonction `atlasValidateChartSeries` (sans modifier `app.js`) et remplace seulement sa comparaison spot : devise EUR→`priceEur`, USD→`priceUsd`, spot et source horodatés, inconnue/USDT/USDC→parité omise. Les vérifications de couverture, chronologie et vrais avertissements de prix restent actives. Tests 17/17 passés, mais AUCUN des 11 appelants n'est encore modifié. **Prochaine opération unique :** préparer une intégration en branche de test couvrant les 11 appels et les caches, puis exécuter les tests complets avant toute publication de production. **Ne pas toucher au `main` du moteur ni aux caches tant que le contrat n'est pas connecté et vérifié**.

**Protocole de reprise :** lire [`SEVEN_HEAVEN_MEMOIRE_ACTIVE.md`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_MEMOIRE_ACTIVE.md), puis ce document. Ne pas redemander `app.js` ou le JSON Firefox : ces preuves ont déjà été fournies et copiées au dépôt partagé.
