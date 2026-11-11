# Seven Heaven — Dossier de source audiovisuelle : « Les Rois du Bitcoin »

**11 novembre 2026 · documentation critique pour l'apprentissage inter-IA ; ce dossier n'est ni une certification ni un jugement sur la personne ou la chaîne.**

## Identité et sources effectivement consultées

- **Lien donné par l'utilisateur :** https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A ; chaîne intitulée « Les Rois du Bitcoin ». Animée notamment par **Hermès** selon sa présentation et les descriptions accessibles.
- **Vidéo dont les métadonnées et la description sont accessibles :** [« LIVE BITCOIN — VOLUME EFFRAYANT ! »](https://www.youtube.com/watch?v=c_goJ7VV1vs), publiée le **22 août 2023**. Sa description met en avant des analyses graphiques, le suivi des mouvements de capitaux, les fondamentaux et la stratégie des « 4 Rois ». Elle présente des liens d'affiliation, explicités comme tels.
- **Autre vidéo identifiable :** [« BITCOIN the SUPPORT of ALL DANGERS! »](https://www.youtube.com/watch?v=ay2lG11OHBo), publiée le **1er septembre 2025**. Sa description met l'accent sur l'analyse graphique, les supports, les fondamentaux, la « 4 Kings Strategy » et comporte plusieurs partenariats / promotions.
- **Une transcription tierce datée de 2023 :** [analyse de clôtures hebdomadaires/mensuelles et de momentum](https://lilys.ai/fr/notes/wealth-transfer-20251030/bitcoin-biggest-wealth-transfer-analysis), attribuée à cette chaîne. Cette transcription peut comporter des erreurs et ne remplace pas la vidéo originale.
- **Index tiers (à recontrôler au moment de l'usage) :** https://socialdiscovery.app/fr/youtube/themes/business-finance/trading ; répertorie notamment des titres d'analyses datées du 6, 9 et 10 novembre 2026, mais ne remplace pas leur contenu intégral.

**Périmètre d'accès réel :** descriptions, titres et extraits de transcription/index. Pas de lecture exhaustive de toutes les vidéos et pas de transcription certifiée de la vidéo mentionnant la règle des trois jours. Ne pas affirmer avoir visionné une vidéo complète à partir de sa seule page de métadonnées.

## Ce qui est documenté / ce qui reste une hypothèse

| Sujet | État documentaire | Usage admissible pour le laboratoire |
|---|---|---|
| Analyse des niveaux de support et de résistance | Thème attesté dans un titre vidéo, et cohérent avec les descriptions | Formaliser et tester une règle de franchissement / retest sur OHLCV |
| Rôle des volumes | Sujet explicitement présent dans un titre de 2023 | Tester le volume Binance Spot par rapport à sa moyenne, sans extrapoler à tous les exchanges |
| Clôtures hebdomadaires/mensuelles | Présentes dans une transcription tierce datée de 2023 | Séparer strictement les périodes : 15 min, 1 jour, 1 semaine, 1 mois |
| « Stratégie des 4 Rois » | Citée dans les descriptions accessibles | Exiger ses règles opérationnelles exactes avant toute simulation ; ne pas la reconstruire arbitrairement |
| « Attendre trois jours pour confirmer une reprise » | **Attribution exacte NON vérifiée** : aucun lien/horodatage de cette affirmation retrouvé dans les sources consultables | Étudier uniquement la version explicite des **3 clôtures quotidiennes** définie par Seven ; ne pas prétendre que la chaîne l'enseigne dans cette forme |
| Probabilité de reprise à 40 %, consolidation 35 %, baisse 25 % | **Aucune validation chiffrée dans ces sources** ; ces nombres proviennent de visuels pédagogiques distincts | Interdire leur emploi comme probabilités calibrées |

## Lecture critique sans procès d'intention

- L'analyse technique est principalement une manière de **décrire et structurer** le marché : définir un support, détecter un changement de tendance, évaluer une volatilité. Son utilité pédagogique ne prouve pas le pouvoir prédictif d'un indicateur donné.
- Les métadonnées et descriptions de vidéos montrent des **liens d'affiliation et offres commerciales** ; les autres IA doivent donc relever les éventuels partenariats **pour la transparence**, sans en déduire que les analyses sont fausses.
- Le titre d'une vidéo peut utiliser un registre de mise en garde ou d'urgence ; ne jamais en déduire le résultat futur du BTC. Les rendements et scénarios doivent être indépendamment reconstruits à partir de données horodatées, sans connaissance du futur.
- La différence entre **observation**, **scénario conditionnel**, **probabilité statistique** et **ordre d'achat** doit rester explicite, surtout dans le Trader en lecture seule / PAPER.

## Traduction en hypothèses testables

1. **Clôture au-dessus d'un seuil** : préciser la période et le niveau calculé *à l'avance* ; éviter les niveaux dessinés a posteriori.
2. **Trois clôtures montantes** : décrire les trois jours UTC clos ; ce n'est pas la même chose que trois bougies de 15 minutes ou un simple délai de 72 heures.
3. **Creux ascendants** : comparer les bas quotidiens sans lire J+3 avant de décider à l'ouverture J+3.
4. **Volume relatif** : comparer le volume BTC/USDT Spot Binance au volume des 20 jours achevés avant J+2 ; le volume d'un seul exchange ne représente pas le flux mondial.
5. **Enrichissement statistique** : examiner les différences de rendement *à horizon identique* entre groupes avec et sans critères ; publier effectifs, intervalles d'incertitude, coûts et frais, et garder un vrai test hors échantillon pour plus tard.

## Travaux liés, reproductibles

- [Protocole figé de l'échantillon élargi](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_PROTOCOL_2026_11_11.md) : seuil 2,5 %, espacement 10 jours, issue J+3→J+10 et coûts.
- [Rapport statistique de l'échantillon élargi](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_REPORT.md) ; [code](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11.py) ; [preuves JSON](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_PROOFS.json).
- Source 22 ZIP historiques **Binance Spot BTCUSDT natifs 1m**, empreintes SHA-256 documentées, depuis GitHub Releases ; ne pas dupliquer les ZIP dans Git main.

**Conclusion :** la chaîne est une source de vocabulaire, d'hypothèses et de questions pédagogiques à explorer, mais **ni les descriptions consultées ni les résultats historiques du laboratoire ne prouvent une règle prédictive de trois jours**. Le contenu certifié de chaque vidéo doit être consulté avant de lui attribuer une règle précise. Aucun ordre réel, aucune modification des interfaces.
