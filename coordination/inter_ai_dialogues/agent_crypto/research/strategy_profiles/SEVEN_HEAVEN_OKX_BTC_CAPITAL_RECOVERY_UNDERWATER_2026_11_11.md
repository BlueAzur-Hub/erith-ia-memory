# Seven Heaven — Rester sous son sommet : étude des délais de récupération du capital

**Date de recherche : 11 novembre 2026.** Source : OKX Spot BTC-USDC, bougies quotidiennes UTC **confirmées**, du 1er avril au 10 novembre 2026.
**Usage : recherche sur portefeuille fictif. Aucun ordre et aucun calcul sur les véritables actifs de l'utilisateur.**

## Question

Quand un investisseur conserve ses BTC, combien de journées son portefeuille fictif reste-t-il sous son sommet précédent,
et en quoi la situation diffère-t-elle de Donchian 55 ?

Un jour **sous son sommet** signifie que la valeur estimée à la clôture du portefeuille est inférieure au maximum historique observé depuis le démarrage du test.
Ce n'est **pas** la même chose que « être sous le prix de mon achat » ou « être en perte par rapport à ma mise initiale ».

## Hypothèses communes

- Capital initial : 1 000 **USDC** fictifs, aucune marge, pas de vente à découvert.
- Buy & Hold 25 % : 250 USDC de BTC achetés fictivement le 1er avril ; 750 USDC conservés en liquidités jusqu'au 10 novembre.
- Donchian 55 25 % : investissement de 25 % des liquidités aux signaux de cassure 55 jours, sortie 20 jours, stop 3×ATR14, durée maximum 120 jours.
- Buy & Hold 100 % est un **scénario de stress distinct**, pas une comparaison à risque égal avec les deux modèles 25 %.
- Frais fictifs 0,10 % par côté et glissement 0,05 % par côté. Les BTC sont valorisés chaque jour au produit de liquidation hypothétique, sans prétendre que des ventes ont eu lieu.
- Les 447 bougies OKX ont déjà été conservées dans l'étude précédente ; les 224 clôtures de la fenêtre commune sont utilisées ici.
- Le résultat Donchian est rejoué avec le même programme et vérifié champ par champ contre le JSON source, y compris son évolution quotidienne.

## Résultats contrôlés

| Hypothèse | Variation finale | Pire baisse depuis le sommet | Jours sous un sommet | Plus longue séquence sous sommet | Séquence en cours au 10 novembre |
|---|---:|---:|---:|---:|---:|
| Donchian 55 · 25 % | -0.261 % | -3.919 % | 194 / 224 | 102 jours | 68 jours |
| Buy & Hold · 25 % | 1.974 % | -8.23 % | 207 / 224 | 133 jours | 50 jours |
| Buy & Hold · 100 % (stress) | 7.897 % | -28.752 % | 207 / 224 | 133 jours | 50 jours |

## Lecture des épisodes de baisse

### Donchian 55 · 25 %
- Épisodes récupérés depuis un sommet : **9** ; épisodes encore ouverts : **1**.
- Fin sous le capital initial de 1 000 USDC : **oui**.
- Début sous sommet 2026-08-25 ; pire baisse -0.1551 % le 2026-08-25 ; retour au sommet 2026-08-26 ; durée 1 jours.
- Début sous sommet 2026-08-28 ; pire baisse -1.0152 % le 2026-09-02 ; retour au sommet 2026-09-03 ; durée 6 jours.
- Début sous sommet 2026-09-04 ; pire baisse -3.9193 % le 2026-11-10 ; retour au sommet non observé avant la fin de la fenêtre ; durée 68 jours.

### Buy & Hold · 25 %
- Épisodes récupérés depuis un sommet : **11** ; épisodes encore ouverts : **1**.
- Fin sous le capital initial de 1 000 USDC : **non**.
- Début sous sommet 2026-05-07 ; pire baisse -0.4956 % le 2026-05-07 ; retour au sommet 2026-05-10 ; durée 3 jours.
- Début sous sommet 2026-05-11 ; pire baisse -8.2304 % le 2026-06-30 ; retour au sommet 2026-09-21 ; durée 133 jours.
- Début sous sommet 2026-09-22 ; pire baisse -4.4226 % le 2026-11-10 ; retour au sommet non observé avant la fin de la fenêtre ; durée 50 jours.

### Buy & Hold · 100 % (stress)
- Épisodes récupérés depuis un sommet : **11** ; épisodes encore ouverts : **1**.
- Fin sous le capital initial de 1 000 USDC : **non**.
- Début sous sommet 2026-05-07 ; pire baisse -1.7429 % le 2026-05-07 ; retour au sommet 2026-05-10 ; durée 3 jours.
- Début sous sommet 2026-05-11 ; pire baisse -28.752 % le 2026-06-30 ; retour au sommet 2026-09-21 ; durée 133 jours.
- Début sous sommet 2026-09-22 ; pire baisse -14.8886 % le 2026-11-10 ; retour au sommet non observé avant la fin de la fenêtre ; durée 50 jours.

## Ce que cette étude ne permet pas de conclure

- Attendre une remontée n'assure pas un retour au prix d'achat ; aucune durée future de récupération ne peut être promise.
- Le calendrier de son achat personnel, les quantités effectivement détenues et les frais réels du compte n'ont pas été utilisés.
- Les maxima et minima du portefeuille sont calculés en FIN DE JOURNÉE seulement ; des creux intrajournaliers peuvent être plus graves.
- Les USDC sont supposés rester à valeur stable dans ce modèle : il ne mesure pas le risque propre au stablecoin.
- La stratégie Donchian a été évaluée sur des prix passés déjà connus, sans validation prospective ; les stops théoriques peuvent glisser.
- Le scénario Buy & Hold n'implique aucun achat, vente ou recommandation pour les BTC personnels.
- La source 2022–2025 sur OKX reste limitée pour cette API : ce test documente uniquement avril–novembre 2026.

## Provenance et reproduction

- Calcul : SEVEN_HEAVEN_OKX_BTC_CAPITAL_RECOVERY_UNDERWATER_2026_11_11.py
- Données, trajectoires et épisodes : SEVEN_HEAVEN_OKX_BTC_CAPITAL_RECOVERY_UNDERWATER_2026_11_11.json
- Série OKX 447 jours et Donchian validé : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json
