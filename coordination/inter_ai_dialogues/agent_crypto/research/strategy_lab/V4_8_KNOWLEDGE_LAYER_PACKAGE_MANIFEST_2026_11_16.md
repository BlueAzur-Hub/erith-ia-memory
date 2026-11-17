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
| Step 5 — Références passives | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP5_PASSIVE_REFERENCES_DEV.zip` | `8871321dde43f22271740e6355cec11235aee0478ca86047e90de549cc0457ca` | DEV · DCA + Buy & Hold 50/100 + Conservation USDC |
| Audit + Historical Vault + Rebuild V1 | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_AUDIT_FIXED_HISTORICAL_VAULT_WORKSPACE_REBUILD_V1_DEV.zip` | `0fca6b38b9ef2a3f3577afb66652e1c5c92e194b9f4494396f89da64b4b94861` | DEV · audit code + Historical Vault V1 + rebuild canonique |
| Workspace Steward V2 | `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_WORKSPACE_STEWARD_V2_DEV.zip` | `57114a663ff9880a621b1f11eb46bedffe4951c10e63aef9157c59dc25a6dc4b` | DEV · workspace canonique protégé ; exploration non persistante |
| Workspace canonique V2 | `SEVEN_HEAVEN_STRATEGY_LAB_WORKSPACE_CANONICAL_V2_2026_11_17.zip` | `51548e425a3cb4045d9f6537061221978a3b579136e1fb1597915c0e5dd75220` | Workspace · 12 profils + 12 StrategySpecs + 12 résultats + 6 comparaisons |

## Documents de continuité associés

- `V4_8_KNOWLEDGE_LAYER_STEP1_EMA_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP2_BOLLINGER_UI_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP3_DONCHIAN_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP4_ACTION_HELP_2026_11_16.md`
- `V4_8_HELP_LAYER_V1_GLOBAL_DEV_2026_11_16.md`
- `V4_8_KNOWLEDGE_LAYER_STEP5_PASSIVE_REFERENCES_2026_11_16.md`
- `V4_8_THREAD_RECOVERY_AUDIT_2026_11_16.md`
- `V4_8_WORKSPACE_STEWARD_V2_2026_11_17.md`

## État technique courant

Knowledge Layer Step 5 — Références passives :

- parent direct : Help Layer V1 global validé visuellement ;
- DCA, Buy & Hold 50 %, Buy & Hold 100 % et Conservation USDC disposent d'une fiche professionnelle ;
- 137 tests locaux : PASS ;
- syntaxe JavaScript : PASS ;
- recette DOM Chromium réelle : clics et survols PASS, console propre ;
- `src/engine.py` inchangé ;
- aucune donnée privée `workspace/` incluse ;
- aucun cache Python distribué ;
- zéro ordre réel ;
- réception Firefox Windows du propriétaire : en attente.

## Publication GitHub

Le projet possède un mécanisme historique de publication de ZIP via GitHub Actions. Les paquets DEV de cette séquence ne sont pas transformés automatiquement en releases stables : le manifeste conserve leur identité et leur SHA-256, tandis que la réception Firefox du propriétaire reste un gate distinct.

## Gate UX actuel

Le premier Action Help Step 4 reste explicitement rejeté. La base d'aide est le Unified Help fix puis le Help Layer V1 global, validé visuellement par le propriétaire.

Le gate produit courant est désormais **Knowledge Layer Step 5 — références passives** : vérifier dans Firefox les fiches DCA / Buy & Hold 50 / Buy & Hold 100 / Conservation USDC sans modifier le moteur PAPER.

Après réception seulement, le prochain chantier prévu est **historiques longs + multi-actifs**.

## Règle de reprise

GitHub public conserve la continuité machine du projet ; Notion conserve la continuité humaine et éditoriale.

Une prochaine IA doit distinguer les paquets rejetés, les DEV corrigées et les versions stables avant toute nouvelle modification.


## Mise à jour 17 novembre 2026 — Workspace Steward V2

Le workspace canonique n'est plus alimenté par les clics de développement. Quand `CANONICAL_REBUILD_MANIFEST.json` existe, les simulations et comparaisons manuelles restent calculables mais **éphémères** ; elles ne modifient plus le Coffre. Les profils et StrategySpecs canoniques sont reconstruits par `tools/workspace_rebuild_v1.py --execute`.

Recette : **153 tests + 12 sous-tests PASS**, moteur `src/engine.py` inchangé, 43 fichiers source préservés, 12 profils, 12 StrategySpecs, 12 résultats, 6 comparaisons. La réception Firefox propriétaire de cette nouvelle couche reste le gate final.
