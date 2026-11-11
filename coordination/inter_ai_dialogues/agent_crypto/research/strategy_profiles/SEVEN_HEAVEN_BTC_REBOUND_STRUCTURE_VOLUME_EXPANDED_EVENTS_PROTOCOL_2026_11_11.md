# Seven Heaven — protocole préalable : échantillon élargi des rebonds BTC, structures de prix et volumes

**11 novembre 2026 — étude exploratoire PAPER.** Ce protocole est figé et publié dans le répertoire inter-IA **avant l'exécution du nouveau décompte**. Les années disponibles ayant déjà été utilisées dans d'autres études, **ceci n'est pas un véritable nouvel échantillon indépendant**. Le changement de seuil vise à accroître le nombre d'épisodes descriptifs, non à optimiser les performances.

## Question

La présence de trois clôtures haussières successives, de creux ascendants, d'un volume BTC plus élevé et/ou d'une EMA10 > EMA30 apporte-t-elle une information additionnelle sur la poursuite d'un rebond Bitcoin ? On distingue fréquence, pouvoir discriminant et rentabilité après coûts. Ne pas convertir une fréquence historique en probabilité prédictive.

## Données

- 22 ZIP mensuels **Binance Spot BTCUSDT natifs 1m**, avril–juin 2022, avril–juin 2023, janvier–mars 2024, janvier–mars 2025, janvier–octobre 2026 ; **960 480 minutes**, soit 667 journées UTC, réparties en cinq séquences disjointes. SHA-256, continuité et agrégation OHLCV vérifiées par le parseur de l'étude précédente, avec manifeste JSON amont.
- L'étude ne contiendra aucun relevé de compte ni ordre OKX. Volumes : volume de base BTC Binance Spot, pas volume global interplateformes.

## Définition principale pré-enregistrée, sans ajustement post-résultat

1. **Candidat de rebond J0** : clôture J0 > clôture J−1, avec clôture J−1 située au moins **2,5 % sous le maximum des 30 clôtures précédentes**. Les 30 premiers jours de chaque séquence ne génèrent aucun candidat.
2. Prendre chronologiquement le premier candidat puis imposer un **espacement de 10 jours pleins** : le prochain candidat doit apparaître au moins 11 jours après le précédent ; ce verrou n'utilise aucun résultat à venir.
3. **C1** : première clôture montante J0, entrée fictive à l'ouverture J+1. **C3** : J0, J+1, J+2 doivent avoir chacun une clôture strictement supérieure à la veille ; entrée fictive J+3 seulement si cette condition est satisfaite.
4. **Creux ascendants (LOW3)** : plus bas strictement montants de J−1 à J0, J+1, J+2. **Volume fort (VOL)** : volume BTC de J+2 >= moyenne des 20 journées précédant J+2. **EMA (TREND)** : EMA10>EMA30 et clôture J+2>EMA30, fondées sur clôtures jusqu'à J+2.
5. **Issue ex post** : variation entre l'ouverture de J+3 et la clôture de J+10. Classe hausse >=+3 %, baisse <=−3 %, sinon neutre ; aussi résultat fictif de l'achat à J+3 jusqu'à J+10 net de frais 0,10 % + glissement 0,05 % de chaque côté. Même horizon J+10 pour C1 et C3, durées d'exposition différentes. **Épisodes indépendamment remis à 1 000 USDT** : leurs rendements ne sont pas additionnables et ne constituent pas un portefeuille continu.
6. Épisode à droite censuré si J+10 hors de la séquence. Ne pas utiliser les cours futurs pour sélectionner les candidats, décider C3, ou calculer LOW3/VOL/TREND.
7. **Témoin secondaire non optimisé** : reprendre *exactement* la définition héritée ≥5 % et blocage 21 jours ; vérifier la concordance du nombre de candidats et de la liste des événements avec l'étude précédente. Les différences entre seuils mesurent des définitions différentes, pas un gain de prédiction.

## Analyse pré-enregistrée

- Nombre d'épisodes, par année et au total ; taux de succès C1, C3 parmi candidats, C3+LOW3, C3+VOL, C3+TREND, C3+LOW3+VOL+TREND ; comparer chaque sous-ensemble à son complément au **même horizon J+3→J+10**. Afficher effectifs, pourcentages descriptifs et intervalles de Wilson (référence non ajustée, sensible au chevauchement).
- **Information incrémentale** : à l'intérieur du groupe C3, comparer LOW3 oui/non, VOL oui/non, TREND oui/non : taux de rendement net positif et rendement moyen en points ; signaler `non-estimable` si échantillon insuffisant (<5 par groupe). Éviter les interprétations causales.
- Quantifier le prix du retard C1→C3 pour les seuls événements confirmés, les rebonds gagnants écartés et les épisodes perdants évités. Vérifier coûts doublés.
- Indiquer les épisodes qui se chevauchent dans leurs fenêtres J+10 malgré le blocage ; analyse groupée par année, aucune revendication d'indépendance statistique.
- Contraintes bloquantes : empreintes ZIP amont, 960 480 minutes, 667 jours, échantillonnage chronologique, tests invariance des préfixes, cohérence comptable, reproduction du témoin 5 %.

## Audit de la chaîne YouTube « Les Rois du Bitcoin »

Source principale : https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A . Vidéos identifiées : analyse des volumes https://www.youtube.com/watch?v=c_goJ7VV1vs (22 août 2023) ; analyse de support https://www.youtube.com/watch?v=ay2lG11OHBo (1er septembre 2025). Pages externes de contextualisation fournissent titre, description et liens promotionnels. **Aucune vidéo démontrant l'origine exacte de la « règle des trois jours » n'a encore été localisée** : ne pas lui attribuer cette règle. Traiter la pédagogie et les hypothèses comme matière à protocoliser, non comme source de rendements vérifiés.

## Livrables

Publier sous `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : script Python, rapports Markdown, événements CSV, métriques agrégées CSV/JSON, preuves SHA et contrôles, mise à jour de l'index et de la passation inter-IA. Relire le contenu après commit. Ne pas modifier Administrator, Operator, Trader ni Bridge. Aucun ordre réel.
