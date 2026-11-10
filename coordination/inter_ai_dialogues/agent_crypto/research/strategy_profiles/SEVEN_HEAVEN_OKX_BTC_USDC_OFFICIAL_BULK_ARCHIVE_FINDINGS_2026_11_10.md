# Seven Heaven — Archives OKX BTC/USDC retrouvées, contrôle qualité préalable au Swing Trading

**Date :** 10 novembre 2026. **Destination :** IA Seven Heaven / Coffre du projet Agent-Crypto.  
**Statut :** FICHIERS HISTORIQUES OFFICIELS TÉLÉCHARGÉS ET AUDITÉS — **UNE SÉRIE MULTIANNUELLE VALIDÉE N'EST PAS ENCORE CONSTITUÉE**.  
**Aucun ordre, aucune clé API, aucun accès au compte, aucune modification de Trader / Administrator / Bridge.**

## Résultat utile pour les IA

Le projet disposait de **446 journées récentes OKX BTC-USDC** via `GET /api/v5/market/history-candles` depuis août 2025, insuffisantes pour tester plusieurs cycles.

**Solution trouvée :** OKX exploite également l'API publique `GET /api/v5/public/market-data-history`, **module 2** (fichiers de bougies à la minute), donnant des liens vers les archives officielles hébergées sur `static.okx.com`.

Quatre fichiers **BTC-USDC** ont été **réellement téléchargés**, ouverts comme ZIP, et leurs CSV de bougies contrôlés : **juin 2022, octobre 2023, juin 2024, février 2025**. Il ne s'agit pas seulement d'entrées théoriques trouvées sur Internet.

Cette découverte dépasse les indications générales du portail OKX, qui présente les bougies comme disponibles « depuis juillet 2023 ». **Cela ne prouve pas pour autant une couverture complète depuis 2022 : seulement ces quatre dates contrôlées.**

## Vérification de données — faits, pas simulations

| Fichier officiel ouvert | Lignes CSV (sans entête) | Horaires uniques | Doublons identiques | Confirmations `confirm` | Conclusion limitée |
|---|---:|---:|---:|---|---|
| `BTC-USDC-candlesticks-2022-06-15.zip` | 2 880 | 1 440 | **1 440** | Toutes `1` | Dédupliquer avant toute analyse |
| `BTC-USDC-candlesticks-2023-10-15.zip` | 1 440 | 1 440 | 0 | Toutes `0` | Statut de confirmation à clarifier |
| `BTC-USDC-candlesticks-2024-06-15.zip` | 1 440 | 1 440 | 0 | Toutes `0` | Statut de confirmation à clarifier |
| `BTC-USDC-candlesticks-2025-02-15.zip` | 1 440 | 1 440 | 0 | Toutes `1` | Échantillon complet et marqué confirmé |

**Sur ces quatre fichiers :** aucune minute manquante dans la plage couverte après unicité des horodatages, **aucune anomalie OHLC élémentaire**. Pour 2022, les doublons ne présentent pas de prix contradictoires (1440 doublons de contenu identique). Les archives 2023 et 2024 sont des **fichiers anciens**, pourtant chaque ligne porte le marqueur `confirm=0`. **Ne pas les traiter silencieusement comme des bougies confirmées ; ce serait inventer une validation.**

Chaque fichier présente la plage horaire **16:00 UTC la veille → 15:59 UTC le jour indiqué**, car les journées d'archive sont définies en **UTC+8**. Les bougies 1D UTC utilisées par le Trader et dans les études précédentes sont définies de **00:00 UTC à 23:59 UTC**. Il faut donc dédupliquer les minutes, vérifier la provenance puis reconstruire les journées **UTC**, et **ne jamais comparer directement une journée UTC+8 à une journée UTC**.

## Preuves et reproduction

- [Exécution GitHub Actions validée : téléchargement ZIP, ouverture CSV et audit des horodatages](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/42887309443).
- [Preuve JSON durable : noms, dates, taille, empreintes SHA-256, doublons, marqueurs de confirmation et plage UTC](./SEVEN_HEAVEN_OKX_BTC_USDC_OFFICIAL_BULK_ARCHIVE_SAMPLE_EVIDENCE_2026_11_10.json).
- [Script de recherche public sans accès au compte](./SEVEN_HEAVEN_OKX_BTC_USDC_OFFICIAL_BULK_ARCHIVE_DISCOVERY_2026_11_10.mjs).
- [OKX — page officielle des archives](https://www.okx.com/fr-fr/historical-data), [API publique marché historique](https://www.okx.com/docs-v5/en/).
- Aucune archive de prix complète n'a été copiée dans le Coffre à ce stade : seuls le contrôle de présence, les empreintes des quatre fichiers et les diagnostics sont conservés. Le ZIP d'artefacts GitHub Actions a une durée de conservation limitée ; le **JSON permanent** conserve les conclusions du contrôle.

## Ce qu'il faut régler AVANT d'exécuter les stratégies IA

1. **Qualification de la source par année** : étudier si les fichiers sont disponibles sans interruption depuis 2022 et si les anomalies sont générales ou locales. Ne pas présenter une date testée comme une année complète.
2. **Règle de déduplication 2022** : pour un même `open_time`, supprimer les répétitions **identiques** ; toute valeur divergente est une alerte bloquante.
3. **Marqueur `confirm=0` en 2023–2024** : vérifier auprès d'une source primaire / par recoupement sur échantillon et déterminer si les archives historiques ont un défaut de drapeau ou des bougies réellement incomplètes. Aucune transformation artificielle `0→1` sans preuve.
4. **Reconstruction UTC** : utiliser des minutes horodatées et vérifiées pour former des bougies 00:00–23:59 UTC, sans jour incomplet ni décalage.
5. **Étude Swing** : reprendre ensuite les **trois règles pré-définies** du [laboratoire Swing](./SEVEN_HEAVEN_BTC_SWING_EVIDENCE_BASED_REASSESSMENT_2026_11_10.md), coûts et risques inchangés, sur les années OKX effectivement qualifiées. Toujours comparer au Buy & Hold sur les mêmes jours et devises, et réserver une période historique non employée pour choisir les règles.

## Conclusion et décision

**L'obstacle « historiques OKX introuvables » n'existe plus : des archives BTC-USDC ont été trouvées, téléchargées et ouvertes même en 2022.** L'obstacle restant est plus précis : **qualifier la continuité et les marqueurs de confirmation, puis consolider correctement les minutes UTC.**

**Statut Swing Trading :** les recherches réalisées sur Binance et la comparaison OKX récente demeurent des études expérimentales ; les données d'archives découvertes ne permettent pas **encore** d'afficher honnêtement de nouvelles performances 2022–2025 sur OKX. Les IA disposent désormais des preuves et de la méthode de qualification, sans reconstituer le travail depuis zéro.

**Scope :** travail documentaire et de recherche uniquement, aucune opération financière, aucun changement du Master, des profils ou des interfaces.
