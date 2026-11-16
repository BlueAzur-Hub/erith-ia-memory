# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Step 4 Action Help — 2026-11-16

## Objet

Quatrième étape de la Knowledge Layer après EMA, Bollinger et Donchian.

Le but n'est pas d'ajouter une stratégie : il est de rendre les actions existantes compréhensibles avant le clic, sans modifier le moteur PAPER.

## Base exacte

Paquet parent :
`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_DEV.zip`

SHA-256 parent :
`50c0e5f21775c51f901fe97c1b519c2923d0113c876367e2a9f6a1359176639c`

## Step 4 — Action Help Layer

Ajouts :
- bouton compact `? Aide actions` dans le Navigateur ;
- carte flottante `SEVEN EXPLIQUE · ACTION` ;
- aide au survol et au focus clavier ;
- fermeture par le bouton, Échap ou `?` hors champ de saisie ;
- aucun agrandissement permanent de la page ;
- aide dynamique liée à la source, stratégie, timeframe, capital et coûts quand ces informations sont disponibles.

La carte répond systématiquement à :
1. À quoi ça sert ?
2. Avec quoi ?
3. Ce qui va se passer.
4. Ce que ça ne fera pas.
5. Attention, uniquement si une limite importante existe.

## Actions couvertes

- Comprendre / Préparer / Comparer / Atelier complet ;
- Robot PAPER futur ;
- Utiliser un historique ;
- Préparer une méthode dans l'Atelier ;
- Lancer la simulation PAPER ;
- Comparer les méthodes ;
- Éprouver dans le temps / Aether Scientific ;
- Comparer les filtres / Aether Research ;
- Sauvegarder / rejouer StrategySpec ;
- Voir sur le graphique ;
- Voir mes résultats ;
- Examiner une ligne de la Matrice PAPER ;
- import/vérification Binance et collecte publique OKX.

## Vérité fonctionnelle découverte — bouton Examiner

Le code actuel du Comparateur montre que `Examiner` n'est pas une simple navigation.

Il :
1. recharge les paramètres de la ligne choisie dans l'Atelier ;
2. relance une simulation PAPER ;
3. enregistre le nouveau rapport ;
4. ouvre la Lecture de la simulation.

La couche d'aide l'indique explicitement. Le comportement lui-même n'a pas été modifié dans Step 4.

## Lexique enrichi

Ajouts :
- Rendement PAPER ;
- Fills ;
- Glissement ;
- Frais Taker ;
- Profit factor ;
- Inventaire ;
- Résultat latent.

## Modifications techniques

Par rapport au Step 3, seuls les fichiers suivants changent :
- `README_FR.md`
- `web/index.html`
- `web/app.js`
- `web/styles.css`

Nouveaux fichiers :
- `docs/ACTION_HELP_LAYER.md`
- `tests/test_action_help_layer_v48.py`

Aucun fichier supprimé.

## Moteur

`src/engine.py` reste byte-identique.

SHA-256 :
`f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

Aucun nouvel endpoint, aucune règle financière, aucun ordre réel.

## Validation

- Step 3 avant modification : 127 / 127 tests PASS ;
- Step 4 : 133 / 133 tests PASS ;
- `node --check web/app.js` : PASS ;
- paquet final réextrait dans un dossier vierge : 133 / 133 PASS ;
- contrôle Chromium hors ligne du Help Layer : PASS, sans exception JavaScript ;
- Chromium vers localhost reste bloqué par la politique administrateur du conteneur ; cela ne vaut donc pas réception Firefox propriétaire.

## Paquet DEV

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_DEV.zip`

SHA-256 :
`3bfaf427a516038559f15dc3f68a43d4246d7aec5db66361ddec186d5e82b3e4`

Le ZIP ne contient ni `workspace/`, ni `__pycache__/`, ni `.pyc` / `.pyo`.

## Gate suivant

Contrôle propriétaire dans Firefox Windows.

Ne pas ajouter MACD, SuperTrend ou une autre stratégie avant cette réception.
