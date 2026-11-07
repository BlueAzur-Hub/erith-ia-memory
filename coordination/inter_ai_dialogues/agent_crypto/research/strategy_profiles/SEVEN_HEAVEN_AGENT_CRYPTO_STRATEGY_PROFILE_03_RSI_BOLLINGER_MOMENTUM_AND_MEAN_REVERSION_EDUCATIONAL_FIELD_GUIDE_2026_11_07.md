# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 03
## RSI ET BOLLINGER — Lire les excès sans prendre un « signal » pour une certitude

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann, Administrator / Operator · **Statut :** DOCUMENTAIRE — LECTURE SEULE · **Aucun ordre réel, aucune automatisation, aucun import exécutable.**

**Destination de coordination envisagée (non publiée) :** `BlueAzur-Hub/erith-ia-memory/coordination/inter_ai_dialogues/agent_crypto/`.

> **Question étudiée :** comment un trader peut-il étudier un mouvement de prix qui lui semble « trop rapide » ou « trop éloigné de sa moyenne » sans conclure que le prix va forcément se retourner ?

## 1. Deux instruments différents

### RSI — Relative Strength Index

Le **RSI** est un oscillateur de *dynamique* (*momentum*) généralement compris entre 0 et 100. Il compare les mouvements haussiers et baissiers récents. Les seuils **30** (souvent appelé *survente*) et **70** (*surachat*) sont des repères conventionnels, **pas** des consignes d'achat ou de vente. Sur une forte tendance baissière, un RSI faible peut rester faible longtemps ; sur une tendance haussière, un RSI élevé peut rester élevé. La version classique est le **RSI 14** avec lissage de Wilder.

### Bandes de Bollinger

Les **bandes de Bollinger** entourent une moyenne mobile centrale de deux courbes qui s'éloignent ou se rapprochent en fonction de l'écart-type récent. Le réglage **20 périodes × 2 écarts-types** est un point de départ courant, pas une règle obligatoire. Une bande haute atteinte n'implique pas nécessairement une vente ; un prix peut « coller » à la bande pendant une vraie tendance. Des bandes serrées signalent souvent une **contraction de volatilité**, mais n'annoncent pas le sens du mouvement suivant.

**Résumé :** le RSI mesure la force des variations ; Bollinger mesure la position relative du prix et la volatilité. **Aucun des deux ne prédit seul la prochaine bougie.**

## 2. Deux exemples fictifs

**Exemple RSI.** Le Bitcoin chute puis le RSI 14 passe sous 30. Un trader qui étudie le retour à la moyenne attendrait éventuellement un retour du RSI au-dessus d'un seuil défini avant toute décision. Si BTC continue à baisser, le signal initial était prématuré. **RSI < 30 n'est pas « BTC est bon marché »**.

**Exemple Bollinger.** Le prix clôture sous la bande basse 20/2. Une stratégie expérimentale peut attendre qu'il revienne vers la moyenne centrale. Cependant, le prix peut continuer à chuter et entraîner un drawdown bien plus important que le gain espéré au retour vers la moyenne.

Pour transformer l'indicateur en **stratégie**, il faut écrire précisément : quelles bougies sont utilisées, à quelle clôture un signal devient valide, à quel cours une exécution serait supposée possible, quelles règles de sortie et de risque s'appliquent, et combien coûtent les opérations.

## 3. Comment notre premier laboratoire a défini les règles

**Il ne s'agit PAS des seules règles possibles de RSI ou de Bollinger.** Voici les **variantes expérimentales** retenues dans l'étude précédente du Coffre, exclusivement à des fins de comparaison :

| Élément | RSI 14 (30 / 55) | Bollinger 20 / 2 |
|---|---|---|
| Indicateur | RSI classique 14 | SMA 20 et bandes ± 2 écarts-types |
| Entrée fictive | RSI < 30 à la clôture | Clôture sous la bande basse |
| Sortie fictive | RSI > 55 à la clôture | Clôture au-dessus de la moyenne centrale |
| Exécution | Ouverture de la bougie quotidienne suivante | Ouverture de la bougie quotidienne suivante |
| Position | Spot acheteur uniquement, sans levier | Spot acheteur uniquement, sans levier |
| À surveiller | Divergences, momentum persistant | Bandes qui s'élargissent, rupture de range |
| Attention | La survente peut se prolonger | Le prix peut rester sous la bande basse |

Ces deux stratégies sont évaluées **séparément**. Dessiner les deux indicateurs sur un même graphique ne dit pas si la logique doit être « RSI **ET** Bollinger », « RSI **OU** Bollinger » ou une condition suivie d'une confirmation ; cela exige une définition explicite avant tout backtest combiné.

## 4. Mesures déjà obtenues sur le Coffre (reprise du rapport antérieur)

Marché **Binance BTC/USDT** ; bougies 1 jour ; 1 000 USDT fictifs réinitialisés chaque année ; période **22 janvier–31 décembre** ; frais **0,10 %/côté** et glissement **0,05 %/côté** ; valorisation finale hypothétique après coûts de liquidation. Les chiffres ci-dessous sont issus du laboratoire documentaire déjà réalisé, non d'un moteur OKX réel.

| Année | RSI 30/55 | Bollinger 20/2 | Acheter et conserver |
|---|---:|---:|---:|
| 2022 | **+7,96 %** | −25,47 % | −54,75 % |
| 2023 | +20,30 % | **+44,43 %** | +85,03 % |
| 2024 | +26,50 % | +15,69 % | +124,37 % |
| 2025 | −6,76 % | **+16,12 %** | −17,67 % |

| Année | Perte maximale temporaire RSI | Perte maximale temporaire Bollinger |
|---|---:|---:|
| 2022 | **−40,35 %** | −44,60 % |
| 2023 | −9,21 % | −9,71 % |
| 2024 | −11,20 % | −20,15 % |
| 2025 | −19,04 % | −20,07 % |

**Le point décisif :** en 2022, RSI affiche un résultat final positif dans notre modèle, mais une perte intermédiaire d'environ **40 %**. Une stratégie peut *finir gagnante* et être extrêmement pénible à supporter. L'échantillon reste restreint et les critères ont été fixés pour cette étude pédagogique : aucun taux de réussite futur n'est déduit de ces chiffres.

## 5. Les conditions de marché et les pièges

| Marché | RSI — question utile | Bollinger — question utile | Piège commun |
|---|---|---|---|
| Oscillations latérales | Un excès de momentum finit-il par se calmer ? | Le prix revient-il vers la moyenne ? | Frais, faux rebonds, entrées répétées |
| Forte baisse durable | RSI est-il bas **depuis longtemps** ? | Le prix longe-t-il la bande inférieure ? | Multiplier les achats trop tôt |
| Forte hausse durable | RSI reste-t-il élevé ? | Le prix « marche »-t-il sur la bande supérieure ? | Sortir beaucoup trop tôt |
| Forte volatilité | Un seuil fixe garde-t-il un sens ? | Les bandes s'élargissent-elles fortement ? | Confondre volatilité et inversion prochaine |

## 6. Profil pédagogique — à lire, pas à importer

**Nom :** `Seven Research 03 — RSI and Bollinger Mean-Reversion Study`

**Deux variantes indépendantes :** `03A RSI 14 / 30-55` et `03B Bollinger 20 × 2`. **Timeframe étudié :** 1 jour. **Source :** archive Binance BTC/USDT. **Capital d'illustration :** 1 000 USDT fictifs. **Indicateurs de contrôle :** cours de clôture, volatilité, régime du marché ; éventuellement volumes, mais une combinaison doit être définie avant un test. **Résultats à suivre :** rendement net, drawdown, nombre d'opérations, temps exposé, durée des pertes, comparaison à Buy & Hold. **État :** `RESEARCH_ONLY — NO IMPORT — NO ORDERS`.

**Questions de compréhension :**

1. Pourquoi « RSI sous 30 » n'est-il pas automatiquement un achat ?
2. Pourquoi toucher la bande basse n'est-il pas une garantie de rebond ?
3. Que signifie « une stratégie RSI + Bollinger » si ses conditions ET/OU ne sont pas précisées ?
4. Comment la stratégie RSI peut-elle afficher +7,96 % tout en ayant connu un drawdown de −40,35 % ?

## 7. Point d'arrêt

Les deux indicateurs sont des **outils de lecture** ; les règles ci-dessus sont des *exemples de stratégies* que nous pouvons analyser après les avoir précisément définies. Aucun réglage n'est recommandé sur un compte réel. **Aucun changement du programme Trader, de Notion ou d'OKX.**

## Sources et provenance

- [Fidelity — RSI, sens des seuils et risque de maintien en zone extrême](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI).
- [Fidelity — Bollinger Bands, principe et limites](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/bollinger-bands).
- [Seven Heaven — Encyclopédie des stratégies et étude 2022–2025](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) — guide de référence archivé dans le même dossier partagé.
- [Coffre BTC — archive réconciliée, index de référence](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json).