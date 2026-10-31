# Administrator 40.6.713 — contrôle de cohérence 24h EUR/USD et historiques

Date : 31 octobre 2026. Fondement : six captures Firefox fournies par l’opérateur (Top5 EUR, Top5 USD, Hausses5, Baisses5, Volumes5 et état de chargement Hausses5), code `administrator/app.js` de l'archive publiée 40.6.713, snapshot public `data/crypto/latest.json` du 31/10/2026 01:04:52Z.

## Observé, non extrapolé

- Top5 : BTC, ETH, BNB, XRP, SOL — cinq courbes ; chargement subjectivement plus rapide.
- Hausses5 : BEAM, OP, HASH, ZRO, ONDO — 5/5 courbes observées.
- Baisses5 : AKE, BTW, Q, TRX, M — 5/5 courbes observées.
- Volumes5 : BTC, XAUT, USDT, ETH, USDC — 5/5 courbes observées. La présence de stablecoins ici correspond au classement de **volume** ; leur exclusion du **Top5 canonique** reste obligatoire.
- Pendant un changement de scanner, la capture montre « 3/5 compatibles » avec l'ancien graphe toujours présent. Le code `atlasScannerProgress()` décrit expressément ce comportement et `atlasScannerCommit()` exige 5/5 au commit ; ne pas qualifier ce seul état transitoire de bug.
- Écart des pourcentages affichés Top5 en 24h, captures séparées : BTC EUR −1,36 % / USD +0,72 % ; ETH EUR −0,45 % / USD +1,57 % ; BNB EUR +1,37 % / USD +1,15 % ; XRP EUR +1,36 % / USD +3,59 % ; SOL EUR +1,47 % / USD +2,85 %. Ces pourcentages ne prouvent pas un change erroné sans réconcilier les sources et bornes temporelles exactes.

## Constat de code confirmé — métriques de marché et historiques distincts

1. Le snapshot Market `data/crypto/latest.json` contient pour BTC `priceUsd=77466.518573898`, `priceEur=69339.88415135877`, `change24h=0.70878`, `changeQuoteCurrency=USD`, avec conversion USD/EUR BCE 0.8950948800572861 (source FX du 30 octobre). Ainsi **le prix EUR affiché dans Market est converti, mais sa variation 24h reste d'origine USD**. `atlasNormalizePublicCryptoSnapshot()` et `atlasConvertUsdMarketToEur()` l'indiquent dans leur sourceReason. Cette origine doit rester visible dans la comparaison ; ne jamais appeler cette variation « EUR historique ».
2. `atlasScannerMarketBasis()` classe Hausses/Baisses selon `atlasMarketObservedChange24h()` (spot/marché 24h), tandis que `atlasComparisonCurveChange()` retourne le dernier `y` Base100 moins 100 pour le graphe : variation **historique de deux points**. Le code fait expressément cette distinction. Il est donc possible d'avoir un panier correctement classé sur Market USD mais des variations de courbes EUR différentes, sans que les barres de classement soient elles-mêmes historiques.
3. `atlasExternalChartTooltip()` étiquette « PRIX HISTORIQUES EUR/USD » et lit les points **survolés** du graphique ; ce ne sont pas forcément les prix spot du bandeau ou de la fiche technique. Une divergence visuelle avec la « Fiche active » n'est pas démonstration d'erreur tant que l'heure du point survolé n'est pas confrontée au snapshot de marché.
4. `atlasComparisonHistoryComposition()` calcule « 5 directs · à jour » depuis la provenance directe/cache et la fraîcheur de la dernière observation. C'est un **statut d'acquisition et d'horodatage**, non un certificat externe de justesse de chaque valeur ni une comparaison EUR/USD.
5. `atlasValidateChartSeries()` contrôle le nombre minimal de points, 23h30, continuité temporelle 24h et pics excessifs ; il calcule aussi une distance prix spot/historique si source, devise et horodatage sont comparables. Mais lorsque `priceGapPct` dépasse le seuil d'avertissement, la fonction ajoute un **warning** et renvoie toujours `ok:true`. Une preuve de prix incohérent doit donc être traitée explicitement en audit, sans masquer le warning sous l'unique formule « 5 directs à jour ».
6. Le snapshot public GitHub du 31/10/2026 01:04:52Z contient `volume24h` EUR XAUT ~144,294,586,516 ; la capture « Volumes5 » reproduit ce chiffre (~144,29 Md EUR). C'est **la valeur publiée par le fournisseur** dans le snapshot public, non sa vérification économique indépendante. Une valeur atypique exige confirmation de source/convention, pas une correction inventée.

## Conclusion

L'affichage 5/5 par sélecteur, l'identité canonique du Top5 et le temps de chargement sont en progrès réel. Aucune preuve complète de l'alignement EUR/USD, des variations live/historique ou du prix survolé ne découle des captures. Ne pas affirmer « 5/5 certifiés financièrement » avant la preuve par actif.

## Travail à effectuer, sans modifier l'interface aujourd'hui

1. **Audit de vérité par série et actif** : `coin_id`, symbole, source, instrument, source currency, marché de référence USD/EUR/USDT/USDC, `marketSnapshotAt`, premier point, dernier point, ancre Base100, temps réel du dernier spot, points, taux BCE + date, variation historique et variation marché. Ne pas assimiler le même texte % à deux définitions.
2. **Rapprochement temporel et de devise** : comparer un marché et un graphique seulement au même temps et à la même devise; déterminer explicitement si l'écart vient d'une conversion, d'un endpoint différent, d'une fenêtre glissante ou d'une anomalie réelle. Séparer affichage survolé et « cours maintenant ».
3. **Gate de cohérence visible** : garder le panier 5/5 original en l'état, mais signaler « COMPARAISON NON ÉTABLIE » pour les pourcentages de marché et d'historique qui ne peuvent être rapprochés. Ne jamais remplacer une bougie manquante ni tromper l'opérateur par « certifié ».
4. **Audit volumes** : confirmer la source, les horaires, le sens de « volume24h » (EUR converti, volume marché multi-exchanges, pas capitalisation), l'identité de XAUT et d'éventuels chiffres anormaux.
5. **Recette sous Firefox**, 24h USD puis EUR, Top5→Hausses5→Baisses5→Volumes5 ; reproduire exactement les cinq identités et vérifier les horodatages. Toute version ultérieure devra être livrée avec tests et SHA-256, puis essayée dans le navigateur local.

État actuel : **audit documenté, pas de correction graphique exécutée**. Ne pas déployer une prétendue 40.6.714 sans preuve d'un correctif de code et recette.
