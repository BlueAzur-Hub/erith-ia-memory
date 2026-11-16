# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Package Manifest — 2026-11-16

## Rôle

Ce manifeste relie les paquets DEV produits dans le fil du 16 novembre 2026 aux documents canoniques du répertoire partagé.

Il ne transforme pas chaque étape en release stable. Il sert à préserver la continuité, les empreintes et le chemin de reprise sans multiplier artificiellement les versions.

## Paquets du fil

| Étape | Paquet | SHA-256 | Statut |
| --- | --- | --- | --- |
| Step 1 — EMA | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_EMA_KNOWLEDGE_LAYER_DEV.zip` | `33cfaa5c0e4ee90f7799c963de6b9c655678bc9dffd34cd33625dd17eaf1ba7e` | DEV · fiche EMA |
| Step 2 — Bollinger + UI | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP2_DEV.zip` | `969302db7f9bf059e2b6524f71afcf84951bee5ebaf821a0c80d570570ae41ba` | DEV · fiche Bollinger + corrections UI |
| Step 3 — Donchian | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_DEV.zip` | `50c0e5f21775c51f901fe97c1b519c2923d0113c876367e2a9f6a1359176639c` | DEV · fiche Donchian |\n| Step 4 — Action Help | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_DEV.zip` | `3bfaf427a516038559f15dc3f68a43d4246d7aec5db66361ddec186d5e82b3e4` | DEV · aide actions + lexique |

## Documents de continuité associés

- `V4_8_KNOWLEDGE_LAYER_STEP1_EMA_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP2_BOLLINGER_UI_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_2026_11_16.md`\n- `V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_2026_11_16.md`
- `V4_8_THREAD_RECOVERY_AUDIT_2026_11_16.md`

## État technique Step 3

- 127 tests locaux : PASS ;
- syntaxe JavaScript : PASS ;
- moteur PAPER de référence : inchangé ;
- aucune donnée privée `workspace/` incluse dans le paquet ;
- zéro ordre réel.

## Publication GitHub — correction de continuité

Le projet possède déjà un mécanisme historique fonctionnel de publication de paquets ZIP via GitHub Actions.

Preuve historique : commit `4fe8996b05814f590168bc90931bfb8fa1048bb0`.

Le workflow utilisait notamment :

- `permissions: contents: write` ;
- `GH_TOKEN: ${{ github.token }}` ;
- `gh release create` ;
- `gh release edit` ;
- `gh release upload --clobber`.

Conclusion : l'absence actuelle de release DEV Step 1/2/3 n'est **pas** une impossibilité technique. C'est uniquement un choix de ne pas transformer chaque petit incrément de travail en release officielle.

## Step 4 — Gate UX réalisé en DEV\n\nLe paquet Step 4 ajoute le mode `? Aide actions`, une carte flottante contextuelle et un lexique opérationnel enrichi. 133 tests passent, `src/engine.py` reste byte-identique et la réception Firefox propriétaire reste le gate suivant.\n\nPoint de vérité documenté : dans le Comparateur, `Examiner` recharge la méthode et relance réellement une simulation PAPER avant d'ouvrir le rapport détaillé.\n\n## Gate UX prioritaire

Avant d'ajouter une nouvelle méthode, le parcours guidé doit expliquer les actions avant le clic.

Chaque bouton majeur doit indiquer clairement :

1. ce qu'il fait ;
2. ce qu'il va modifier ou sélectionner ;
3. ce qu'il ne fait pas ;
4. quelles données/règles seront utilisées ;
5. si une simulation est lancée ou non.

Exemples prioritaires :

- `Utiliser` une source ;
- `Préparer cette méthode dans l'Atelier` ;
- `Lancer la simulation PAPER` ;
- `Comparer les méthodes` ;
- `Éprouver cette stratégie dans le temps` ;
- `Sauvegarder la stratégie / StrategySpec` ;
- `Voir sur le graphique` ;
- `Voir mes résultats`.

## Règle de reprise

GitHub public conserve la continuité machine du projet ; Notion conserve la continuité humaine et éditoriale.

Une prochaine IA doit commencer par comprendre l'état présent et l'effet réel des actions avant de produire une nouvelle version.
