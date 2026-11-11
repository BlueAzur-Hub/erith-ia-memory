# Seven Heaven — Épisodes de rebond BTC élargis : creux ascendants et volumes

**11 novembre 2026 | recherche PAPER exploratoire, sans ordre et sans modification des interfaces.**

**Protocole préalable :** [version figée avant calcul](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_PROTOCOL_2026_11_11.md) · commit `79b89463`.

## Étude documentaire de la chaîne YouTube

- Chaîne identifiée : **Les Rois du Bitcoin**, analyses graphiques et pédagogie Bitcoin ; présentateur cité **Hermès** dans la présentation publique et des sources externes.
- Vidéos vérifiables par métadonnées : [volumes et analyse Bitcoin, 22 août 2023](https://www.youtube.com/watch?v=c_goJ7VV1vs) ; [supports et analyse Bitcoin, 1er septembre 2025](https://www.youtube.com/watch?v=ay2lG11OHBo). Dans les descriptions, présence de renvois commerciaux/affiliation : relever la date et séparer observation, interprétation et intérêts commerciaux.
- [Chaîne source](https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A). **L’origine exacte de la « règle des trois jours » n’a pas été retrouvée dans une vidéo identifiée.** Ne pas attribuer cette règle à cette chaîne sans horodatage/vidéo.
- Une vidéo de vulgarisation peut suggérer une hypothèse sur supports/creux/volumes, mais ne prouve ni performance de trading ni probabilité de reprise.

## Question, période et méthode

- **22 ZIP natifs Binance Spot BTC/USDT**, SHA-256 vérifiés : 960,480 bougies minute ; 667 journées UTC sur cinq fenêtres disjointes de 2022 à 2026.
- Nouveau seuil choisi AVANT calcul : une première clôture montante alors que la clôture précédente est ≥2,5 % sous son maximum des 30 jours précédents ; pas de nouvel épisode avant 11 jours. 30 premières journées de chaque séquence réservées à l’historique.
- Déclencheur C3 : trois clôtures montantes, toutes déjà achevées ; creux ascendants J−1 à J+2 ; volume base BTC à J+2 comparé à la moyenne des 20 jours clos précédents ; EMA10>EMA30 et clôture>EMA30 à J+2.
- Pour l’analyse statistique, toutes les issues sont prises de l’ouverture J+3 à la clôture J+10, **même si un filtre rejette l’épisode**, afin de comparer un horizon identique. Rendements nets de frais 0,10 % et glissement 0,05 % par côté, stress à coûts doublés.
- Les opérations C1 et C3 utilisent un horizon commun de vente J+10 mais C1 est exposée deux jours de plus. **Chaque épisode est isolé et remis fictivement à 1 000 USDT : les rendements ne constituent pas un portefeuille continu.**
- Les 22 mois ont déjà servi aux études précédentes : **aucun vrai test indépendant, aucune prédiction validée**.

## Résultats globaux

- Candidats = **43** ; évaluables à J+10 = **40** ; censurés = 3.
- **C3** confirmés = 10/40; sous-groupe C3+creux = 6; C3+volume = 5; C3+EMA = 5; C3+les trois filtres = 2.
- Sur les rejets C3 : 9 épisodes où C1 aurait gagné et 21 où C1 aurait été perdant/net nul.
- Déplacement médian du prix d’entrée C1→C3 sur les confirmés : 3.6833 % ; **ce n’est pas un gain ou une perte du portefeuille**.

| Groupe | N | Résultats J+3→J+10 positifs | Fréquence descriptive | Moy. nette par épisode | Moy. si coûts doublés |
|---|---:|---:|---:|---:|---:|
| ALL | 40 | 19 | 47.50 % | -0.522 % | -0.820 % |
| C3 | 10 | 5 | 50.00 % | -0.608 % | -0.906 % |
| C3_AND_LOWS | 6 | 2 | 33.33 % | -2.947 % | -3.238 % |
| C3_AND_VOLUME | 5 | 2 | 40.00 % | -0.547 % | -0.846 % |
| C3_AND_TREND | 5 | 3 | 60.00 % | +5.854 % | +5.537 % |
| C3_AND_ALL | 2 | 1 | 50.00 % | +5.482 % | +5.165 % |

## Est-ce que les creux ascendants et les volumes ajoutent de l’information *à l’intérieur* de C3 ?

| Critère après C3 | Oui, n | Non, n | Écart des taux de succès | Écart des moyennes nettes | Taille adéquate (≥5 de chaque côté) ? |
|---|---:|---:|---:|---:|---|
| higher_lows_3d | 6 | 4 | -41.67 points | -5.846 points | non |
| volume_ge_20day_mean | 5 | 5 | -20.00 points | +0.122 points | oui |
| ema_up | 5 | 5 | +20.00 points | +12.924 points | oui |

## Audit par période : contrôle de la dépendance au régime

| Fenêtre | Candidats | Évaluables | C3 | C3+volume | Rejets où C1 aurait gagné/perdu |
|---|---:|---:|---:|---:|---:|
| 2022 | 5 | 5 | 2 | 0 (filtre complet) | 0 / 3 |
| 2023 | 5 | 5 | 1 | 0 (filtre complet) | 1 / 3 |
| 2024 | 5 | 4 | 2 | 1 (filtre complet) | 2 / 0 |
| 2025 | 5 | 4 | 0 | 0 (filtre complet) | 1 / 3 |
| 2026 | 23 | 22 | 5 | 1 (filtre complet) | 5 / 12 |

## Contrôles et limites

- Vérifiés : **960,480 minutes / 667 jours**, **342 assertions** de causalité/événements/équations, reproduction exacte des candidats historiques du témoin **5 % / 21 jours**.
- C3 est une sous-population sélectionnée, pas un traitement aléatoire. Comparer le signe d’une association n’autorise pas une interprétation causale.
- Les intervalles de Wilson sont descriptifs ; la dépendance entre périodes de marché et la sélection de candidats peuvent les rendre optimistes.
- Les volumes sont ceux de Binance Spot BTC/USDT, pas de tout le marché ni ceux du carnet OKX BTC/USDC. Frais et ouvertures sont hypothétiques.
- Les seuils de cette étude ont été figés, mais les années 2022–2026 avaient déjà été étudiées ; **surajustement historique possible**, même sans optimisation automatique.

## Reprise pour les autres IA

- Code : `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11.py`, dépend du parseur validé `SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11.py` et de son manifeste amont SHA.
- JSON détaillé : `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_PROOFS.json` ; épisodes auditables : `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_EVENTS.csv` ; résumé : `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_GROUPS.csv`.
- Réexécution locale : `python SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11.py --zip-dir DOSSIER_22_ARCHIVES`. Les ZIP historiques restent sur GitHub Releases, non copiés dans Git main.
- Ne jamais afficher les fréquences historiques comme les probabilités des trois scénarios des infographies. Aucune modification Administrator, Operator, Trader, Bridge ; aucune transaction.

**Conclusion :** mesurer les creux ascendants, volumes et EMA sur les épisodes confirmés peut étayer une hypothèse, mais l’effectif et l’absence de nouveau jeu indépendant interdisent tout conseil de trading automatisé.
