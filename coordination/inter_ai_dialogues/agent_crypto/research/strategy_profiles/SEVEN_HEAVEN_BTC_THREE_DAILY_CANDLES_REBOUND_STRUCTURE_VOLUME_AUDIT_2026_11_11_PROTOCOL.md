# Seven Heaven — Protocole d'audit de la « règle des trois jours » sur BTC

**11 novembre 2026 — protocole pré-écrit avant l'exécution de cette étude.** Recherche rétrospective **exploratoire** : les 22 mois disponibles ont déjà servi aux autres recherches Seven ; ceci n'est **pas** une validation hors échantillon ni un prédicteur.

## Question

Les trois bougies **quotidiennes UTC clôturées** (ni trois bougies de 15 minutes, ni trois photographies d'un graphique) permettent-elles de mieux distinguer une reprise après une baisse d'un simple rebond ? Quels rebonds sont manqués pendant l'attente ? L'ajout de creux ascendants, de volume et d'EMA est-il descriptivement utile ?

## Matériaux et contrôles

- 22 ZIP mensuels originaux Binance Spot **BTCUSDT 1m** : avril–juin 2022, avril–juin 2023, janvier–mars 2024, janvier–mars 2025, janvier–octobre 2026 ; source SHA-256 et longueur certifiées par le registre/proof JSON du Coffre.
- Agrégation OHLC et volumes en quote USDT / base BTC par jour UTC ; aucune lacune ni bougie synthétique ; pas d'accès compte OKX. Série discontinue entre périodes, jamais concaténée à travers les années.
- Les 30 premiers jours de chaque période forment une fenêtre d'historique ; **aucun événement de cette étude ne commence avant le jour 31**.

## Définitions arrêtées avant calcul

1. **Reprise candidate à J0 :** clôture J0 > clôture J−1, **et** clôture J−1 située au moins 5 % sous le **maximum des clôtures des 30 jours achevés J−30 à J−1**. Aucun critère de volume, EMA ni bas de bougie pour la candidature.
2. **Une journée de confirmation (C1) :** la hausse de J0 est connue à la clôture J0 ; achat PAPER théorique à l'**ouverture de J+1**.
3. **Trois clôtures ascendantes (C3) :** J0, J+1 et J+2 ont chacun une clôture supérieure à la clôture du jour précédent ; si vrai, achat PAPER théorique à l'**ouverture de J+3**. Sinon, rester en liquidités sur cet épisode. Un signal refusé n'est pas une preuve de faux rebond.
4. **Creux ascendants :** les plus bas des trois journées J0, J+1 et J+2 sont chacun plus hauts que la veille. **Volume confirmé :** volume BTC de J+2 ≥ moyenne des 20 journées terminées avant J+2. **EMA confirmé :** EMA10 > EMA30 et clôture > EMA30 après clôture J+2. Rapport des étages C3 ; C3+creux ; C3+volume ; C3+creux+volume+EMA, sans optimisation de seuil.
5. **Fenêtre d'évaluation commune :** vente fictive à la clôture de J+10. Ainsi C1 et C3 sont comparées sur **le même événement et le même prix final**, mais C1 est exposée deux jours de plus. Capital fictif de 1 000 USDT par événement, frais 0,10 % et glissement 0,05 % **par côté**, liquidation nette ; coûts doublés en sensibilité. Chaque épisode est évalué isolément : **pas** un backtest de portefeuille continu ni un rendement cumulable.
6. **Anti-chevauchement :** prendre la première candidature chronologique puis ignorer toute candidature dans les **21 jours suivants**, sans anticiper les cours. Signaler les événements J+10 censurés, jamais leur attribuer un rendement.
7. **Contrôle symétrique baissier :** après une hausse d'au moins 5 % depuis le **minimum des clôtures des 30 jours achevés J−30 à J−1**, première journée de clôture en baisse à J0 ; observer trois baisses consécutives puis la variation du BTC à J+10. Ce contrôle est descriptif, sans simulation d'une vente à découvert.
8. **Étiquettes ex post :** variation BTC entre ouverture de J+3 et clôture de J+10 : reprise ≥ +3 %, poursuite baisse ≤ −3 %, sinon consolidation (-3 %, +3 %). Ce sont des fréquences historiques **non calibrées en probabilités futures**. Les panneaux graphiques fournis par l'utilisateur datés du 7 novembre ont des probabilités illustratives 40/35/25 **non justifiées par une mesure dans ces données**.

## Résultats et sécurité

Publier le code Python, le manifeste SHA, chaque épisode CSV, le tableau récapitulatif JSON et un rapport Markdown dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` puis relire les fichiers sur GitHub `main`. Contrôler causalité par reconstruction sur des préfixes, inventaire des épisodes, SHA, agrégation jour, prix d'achat à J+1/J+3 et fin commune J+10. Aucune exécution réelle, aucun changement des interfaces, ni de Trader, ni de Bridge. Les images de novembre 2026 et leurs niveaux/supports sont **hors du jeu de données** et ne prouvent aucun signal quotidien actuel.
