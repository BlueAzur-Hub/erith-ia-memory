# ERITH.IA — PREUVE DE REPRISE ADMINISTRATOR (27 octobre 2026)

**État : validation de provenance, pas de fusion ni de correction.**

## 1. Archive du propriétaire

- `administrator(4).zip` : ZIP valide, 1 509 entrées, 179 130 388 octets décompressés.
- Build du HTML : Administrator 40.6.640 ; Market Core 38.15.11.
- 93 des 95 références locales directes du HTML sont présentes ; deux scripts sous `../trader/` restent hors du ZIP Administrator.

## 2. Identité EXACTE avec les précédentes Aerith

Le ZIP utilise des fins de ligne CRLF Windows, alors que GitHub utilise LF. Une fois CRLF converti en LF, **les trois fichiers sont identiques octet pour octet** aux fichiers originaux au commit `951f8906d0a13de183c226970a85970537ed1e6d` :

| Fichier | Git blob SHA après normalisation |
|---|---|
| `administrator/index.html` | `bc90daaeba7e6acc9b173a2db41301bec8a9b873` |
| `administrator/app.js` | `c363b03c42803a5d1e66de8a441090150c5ef45d` |
| `administrator/js/graph-native-usd-406520.js` | `964a16af27064ad748ac777657babb79ce50be76` |

**Ne surtout pas réappliquer le diff EUR/USD sur l'archive : elle le contient déjà.**

## 3. Contrôles effectués

- ZIP : intégrité PASS ; syntaxe des deux JS : PASS.
- Module original `test-graph-native-usd-tooltip.cjs` : 7/7 PASS.
- Test OKX séparé non exécutable sur cette archive seule : jeux de données dans `data/crypto/okx-hourly` hors périmètre (ce n'est pas un échec du moteur).
- Navigateur GitHub Actions réel [run #40429138191](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40429138191) : Chromium et Firefox ouvrent l'Administrator, Chart.js 4.4.9 est chargé et une instance Chart.js est créée. **Cela ne couvre pas la recette des 84 scénarios historiques réels.**
- L'archive correspond aux trois fichiers effectivement utilisés dans cet essai, sous réserve de la normalisation CRLF/LF.

## 4. Alerte résiduelle de provenance

Le test ciblé isolé `regression_chart_quote_test.cjs` donne **3 PASS / 5 FAIL** sur l'archive comme sur l'original GitHub : cas de restitution d'historique sans devise fiable, contradiction EUR/USD, confusion possible entre spot et historique, mode chargement. Ce test est postérieur au chantier des six étapes ; ses scénarios sont synthétiques, pas des cas réels validés dans Firefox.

Le code `atlasExternalChartDetail()` possède un repli sur la préférence de devise lorsque `result.currency` est absent, tout en nommant le prix historique `Dernier point (USD/EUR)`. **La provenance n'est donc pas encore prouvée pour ce chemin de détail.**

Aucune modification de code n'a été appliquée à la candidate pour cette alerte. Ne pas annoncer « EUR/USD corrigé partout » sans reproduire le chemin réel et contrôler l'affichage.

## 5. Protections

Ne toucher ni à `main`, ni à Pages, aux caches Firefox/IndexedDB, Market Core, Trader, Operator, Bridge ou à un portefeuille. Prochaine action unique : tester la restitution des historiques authentiques dans les six modes et sept périodes sous EUR/USD ; vérifier précisément le chemin externe avant toute correction localisée.

**Cette note est publiée seulement sur la branche test, sans déploiement ni fusion.**
