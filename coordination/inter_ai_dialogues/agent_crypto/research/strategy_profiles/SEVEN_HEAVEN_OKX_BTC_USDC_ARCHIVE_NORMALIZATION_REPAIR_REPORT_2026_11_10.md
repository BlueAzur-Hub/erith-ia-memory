# Seven Heaven — Réparation vérifiée du traitement des archives historiques OKX BTC/USDC

**Date :** 10 novembre 2026 · **Usage :** recherche documentaire des IA Seven Heaven.  
**Statut :** moteur de normalisation **VALIDÉ sur huit fichiers officiels de test** ; séries 2022–2025 **non encore complètes**. Aucune opération réelle, aucun changement de l'Administrator, du Trader ou du Bridge.

## Ce qui fonctionnait déjà

Les tests des stratégies et les comparaisons historiques du Coffre ne sont **pas cassés**. Ce chantier distinct concerne uniquement **les ZIP de bougies à la minute téléchargés depuis les archives publiques OKX**. Les fichiers présentent des anomalies de qualité ou de métadonnées dont il faut tenir compte sans falsifier les résultats.

## Correctif exécuté, pas seulement proposé

- [Normaliseur strict, en lecture seule](./SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_UTC_NORMALIZER.py) : ouvre les ZIP officiels BTC-USDC, contrôle le CSV, les prix et les volumes, les 1 440 minutes attendues et les doublons.
- Il **supprime les doublons seulement si toutes leurs valeurs sont identiques**. Un doublon présentant des prix différents **bloque le traitement**.
- Il ne transforme jamais `confirm=0` en `confirm=1` : les fichiers complets mais non confirmés sont **mis à l'écart** jusqu'à vérification indépendante. Selon la [documentation API officielle OKX](https://www.okx.com/docs-v5/en/), `0` signifie non achevé et `1` terminé.
- Il **reconstitue des journées civiles UTC** à partir de deux ZIP adjacents découpés en UTC+8. Il refuse les journées incomplètes et ne remplit jamais les trous artificiellement.
- Il contient des tests intégrés : suppression des doublons, rejet des prix contradictoires, exclusion des bougies non confirmées et conversion exacte des frontières UTC.

## Résultat de l'essai sur fichiers OFFICIELS

Huit archives OKX BTC-USDC réellement téléchargées : les 15 et 16 juin 2022, les 15 et 16 octobre 2023, les 15 et 16 juin 2024, les 15 et 16 février 2025.

| Contrôle effectué | Résultat vérifié |
|---|---|
| Archives officielles ouvertes et contrôlées | **8 sur 8** |
| Doublons de minutes identiques supprimés | **2 880** (2022) |
| Journées UTC entièrement reconstituées et confirmées | **2** |
| Journées UTC complètes mais non confirmées | **2** (2023 et 2024) |
| Journées partielles, en bordure des échantillons | **8**, exclues normalement |

Les deux journées UTC **effectivement validées** sont :
- **15 juin 2022** : ouverture **22 107,1 USDC/BTC**, clôture **22 551,9 USDC/BTC**, plus haut **22 794,4**, plus bas **20 066,0**.
- **15 février 2025** : ouverture **97 514,0 USDC/BTC**, clôture **97 605,9 USDC/BTC**, plus haut **97 984,9**, plus bas **97 236,1**.

Ces chiffres **vérifient la reconstruction des données**, ils ne constituent ni une simulation de stratégie ni un conseil d'achat ou de vente. Les deux journées 2023/2024 restent hors de l'échantillon validé.

## Preuves que toute autre IA peut reproduire

- [Résultats conservés en JSON : origine, empreintes, contrôles et journées UTC](./SEVEN_HEAVEN_OKX_BTC_USDC_ARCHIVE_UTC_VERIFIED_SAMPLE_RESULTS_2026_11_10.json).
- [Test complet et téléchargement des ZIP dans GitHub Actions](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/42889836677).
- [Référence antérieure : diagnostic des archives](./SEVEN_HEAVEN_OKX_BTC_USDC_OFFICIAL_BULK_ARCHIVE_FINDINGS_2026_11_10.md).
- Le correctif est indépendant du [laboratoire de stratégies Swing](./SEVEN_HEAVEN_BTC_SWING_EVIDENCE_BASED_REASSESSMENT_2026_11_10.md). Aucune règle Swing ou paramètre de simulation n'a été modifié pour produire un meilleur rendement.

## Portée et conclusion

**La réparation est faite et testée sur des données réelles.** Le projet n'a pas été reconstruit ; nous avons ajouté une méthode vérifiée pour nettoyer et qualifier les archives OKX.

**Reste à faire pour un backtest OKX pluriannuel :** qualifier des mois ou des années **entiers**, résoudre la provenance des drapeaux `confirm=0` de 2023–2024 par recoupement officiel, puis appliquer les règles Swing **déjà écrites** sans les réajuster après observation des résultats. Ne pas prétendre que huit ZIP suffisent à prouver la couverture d'une année.

**Aucune clé, aucun ordre, aucune modification Trader, Administrator, Bridge ou portefeuille personnel.**
