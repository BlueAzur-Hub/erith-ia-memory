# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Package Manifest — 2026-11-16

## Rôle

Ce manifeste relie les paquets DEV produits dans le fil du 16 novembre 2026 aux documents canoniques du répertoire partagé.

Il ne transforme pas chaque étape en release stable. Il sert à préserver la continuité, les empreintes et le chemin de reprise sans multiplier artificiellement les versions.

## Paquets du fil

| Étape | Paquet | SHA-256 | Statut |
| --- | --- | --- | --- |
| Step 1 — EMA | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_EMA_KNOWLEDGE_LAYER_DEV.zip` | `33cfaa5c0e4ee90f7799c963de6b9c655678bc9dffd34cd33625dd17eaf1ba7e` | DEV · fiche EMA |
| Step 2 — Bollinger + UI | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP2_DEV.zip` | `969302db7f9bf059e2b6524f71afcf84951bee5ebaf821a0c80d570570ae41ba` | DEV · fiche Bollinger + corrections UI |
| Step 3 — Donchian | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_DEV.zip` | `50c0e5f21775c51f901fe97c1b519c2923d0113c876367e2a9f6a1359176639c` | DEV · fiche Donchian |
| Step 4 — Action Help initial | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_DEV.zip` | `3bfaf427a516038559f15dc3f68a43d4246d7aec5db66361ddec186d5e82b3e4` | **REJETÉ** · deux systèmes d'aide concurrents |
| Step 4 — Unified Help fix | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP4_UNIFIED_HELP_FIXED_DEV.zip` | `45637608b22e8767cb488f7cb293e03f9792e205c37c0d2708b6cc50c82ca047` | DEV · correctif validé visuellement |
| Help Layer V1 global | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_HELP_LAYER_V1_GLOBAL_DEV.zip` | `3ff751bba56b84ebd2efa202a4df4beff19829968a5037a44159f7841ef50399` | DEV · aide globale du Lab |

## Documents de continuité associés

- `V4_8_KNOWLEDGE_LAYER_STEP1_EMA_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP2_BOLLINGER_UI_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_2026_11_16.md`
- `V4_8_HELP_LAYER_V1_GLOBAL_DEV_2026_11_16.md`
- `V4_8_THREAD_RECOVERY_AUDIT_2026_11_16.md`

## État technique courant

Help Layer V1 global :

- 131 tests locaux : PASS ;
- syntaxe JavaScript : PASS ;
- `src/engine.py` inchangé ;
- `web/app.js` inchangé par rapport au Unified Help fix ;
- aucune donnée privée `workspace/` incluse ;
- aucun cache Python distribué ;
- zéro ordre réel.

## Publication GitHub

Le projet possède un mécanisme historique de publication de ZIP via GitHub Actions. Les paquets DEV de cette séquence ne sont pas transformés automatiquement en releases stables : le manifeste conserve leur identité et leur SHA-256, tandis que la réception Firefox du propriétaire reste un gate distinct.

## Gate UX actuel

Le premier Action Help Step 4 est explicitement rejeté. La base de reprise est le Unified Help fix, puis le Help Layer V1 global.

Objectif : un seul bouton `?` global et une seule surface d'explication couvrant progressivement tout le Lab, sans ajouter de systèmes d'aide concurrents.

## Règle de reprise

GitHub public conserve la continuité machine du projet ; Notion conserve la continuité humaine et éditoriale.

Une prochaine IA doit distinguer les paquets rejetés, les DEV corrigées et les versions stables avant toute nouvelle modification.
