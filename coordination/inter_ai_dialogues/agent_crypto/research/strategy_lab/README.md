# SEVEN HEAVEN · Strategy Lab — Central Release Registry

**Index canonique du répertoire partagé Agent-Crypto.** Mis en place le 13 novembre 2026, en consultant les GitHub Releases publiques et le manifeste de continuité existant.

**Version de développement publiée la plus récente : V4.9.0-DEV1.** Elle est validée par GitHub Actions sous Python 3.13 (160 tests + 12 sous-tests), mais sa réception visuelle Firefox Windows par le propriétaire reste à faire. **Dernière version explicitement enregistrée comme acceptée par le propriétaire dans le manifeste : V4.6.2 le 16/11/2026.** Les recettes automatiques ne remplacent jamais cette réception locale.

Ce document sert de **point d'entrée unique à toutes les IA de recherche, à Christophe et à Yoann**. Depuis V4.8, les livraisons importantes sont archivées à la fois dans la racine partagée `coordination/inter_ai_dialogues/agent_crypto/` avec leur `.sha256` et, lorsqu'une Release existe, dans GitHub Releases. Le code source actif reste dans son dossier dédié ; les preuves et décisions restent ici/Notion ; les données privées restent uniquement dans le `workspace/` local.

## 1. Versions du laboratoire — téléchargements vérifiés

| Version | Capacité apportée | État de réception | Télécharger et consulter |
|:--|:--|:--|:--|
| **V1.0** | Premier laboratoire PAPER autonome | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_PORTABLE_PAPER_RESEARCH_FOR_CHRISTOPHE.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13) |
| **V2.0** | Cockpit Aether et archives Binance | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON313_WINDOWS_PORTABLE_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13) |
| **V3.0** | Collecte publique OKX Spot et provenance SHA | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v3-public-okx-spot-research-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V3_OKX_SPOT_CONNECTED_OBSERVATORY_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v3-public-okx-spot-research-2026-11-13) |
| **V3.1.0** | Historique OKX étendu et dates UTC | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v3-1-extended-okx-history-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V3_1_EXTENDED_OKX_HISTORY_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v3-1-extended-okx-history-2026-11-13) |
| **V4.0** | Créateur autonome de stratégies personnelles | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-native-strategy-creator-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_NATIVE_STRATEGY_CREATOR_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-native-strategy-creator-2026-11-13) |
| **V4.1.0** | Analyse quantitative et anatomie du risque | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-1-professional-risk-desk-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_1_PROFESSIONAL_RISK_DESK_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-1-professional-risk-desk-2026-11-13) |
| **V4.2.0** | Microscope des bougies et fills fictifs | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-2-historical-market-microscope-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_2_HISTORICAL_MARKET_MICROSCOPE_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-2-historical-market-microscope-2026-11-13) |
| **V4.3.0** | Robustesse chronologique Aether Scientific | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-3-aether-scientific-walk-forward-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_3_AETHER_SCIENTIFIC_WALK_FORWARD_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-3-aether-scientific-walk-forward-2026-11-13) |
| **V4.4.0** | Forensics, causes et contrôle des transactions PAPER | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-4-paper-trade-forensics-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_4_PAPER_TRADE_FORENSICS_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-4-paper-trade-forensics-2026-11-13) |
| **V4.5.0** | Comparaison contrôlée de filtres RSI et volume | Publiée · Firefox utilisateur confirmé par captures/texte du 13/11 | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-5-controlled-filter-research-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_5_CONTROLLED_FILTER_RESEARCH_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-5-controlled-filter-research-2026-11-13) |
| **V4.5.1** | Correctif d'équivalence OWNER EMA et paramètres masqués | Publiée · Firefox utilisateur validé | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-5-1-ema-owner-equivalence-fix-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_5_1_EMA_OWNER_EQUIVALENCE_FIX_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-5-1-ema-owner-equivalence-fix-2026-11-15) |
| **V4.6.0** | Mois Binance certifié et préchauffage sans transaction | Publiée · chemin OKX observé · supplantée | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-certified-binance-monthly-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_CERTIFIED_BINANCE_MONTHLY_NO_TRADE_WARMUP_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-6-certified-binance-monthly-2026-11-15) |
| **V4.6.1** | Provenance supérieure alignée sur la source active | Publiée · Firefox/USB reçu · défaut Research découvert | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-1-active-source-provenance-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_1_ACTIVE_SOURCE_PROVENANCE_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-6-1-active-source-provenance-2026-11-15) |
| **V4.6.2** | Remise à zéro complète des analyses lors du changement de source | **Latest · 69 tests · Firefox propriétaire accepté le 16/11/2026** | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-2-source-context-reset-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_2_SOURCE_CONTEXT_RESET_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-6-2-source-context-reset-2026-11-15) |
| **V4.7.0-RC1** | Donchian 55/20 natif et 7e référence du Comparateur | Pré-release · CI validée · réception propriétaire non canonisée | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-7-0-rc1-native-donchian-2026-11-16/SEVEN_HEAVEN_STRATEGY_LAB_V4_7_0_RC1_NATIVE_DONCHIAN_PYTHON313_WINDOWS_PAPER.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-7-0-rc1-native-donchian-2026-11-16) |
| **V4.8 DEV** | Knowledge Layer, StrategySpec v1, Historical Vault V2, BTC/ETH 2024–2025, Workspace Steward V3 | 155 tests + 12 sous-tests · artefacts archivés directement · validation propriétaire distincte | [Rapport](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/V4_8_HISTORICAL_VAULT_V2_WORKSPACE_STEWARD_V3_2026_11_17.md) |
| **V4.9.0-DEV1** | Historical Vault V3 : BTC/ETH/BNB/XRP/SOL × 2024/2025, corpus 52/52/52/16 | **Latest DEV · 160 tests + 12 sous-tests · CI PASS · Firefox propriétaire à recevoir** | [ZIP complet](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-9-0-dev1-historical-v3-2026-11-17/SEVEN_HEAVEN_STRATEGY_LAB_V4_9_HISTORICAL_VAULT_V3_MULTI_ASSET_CORPUS_V1_DEV.zip) · [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-9-0-dev1-historical-v3-2026-11-17) |

**Règle de lecture des statuts :** « Firefox utilisateur validé » est issu du [manifeste de continuité](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json) et des comptes rendus du propriétaire. Cela ne signifie ni audit indépendant du matériel local par GitHub, ni validation d'une stratégie profitable. **V4.6.2 a été réceptionnée et acceptée localement dans Firefox le 16/11/2026.** Toutes ces archives sont des versions de recherche **PAPER uniquement**, sans passage d'ordres réels.

## 2. Empreintes SHA-256 des ZIP complets

Les empreintes ci-dessous sont celles des **ZIP de publication**, vérifiées auprès des métadonnées GitHub Release ; la colonne « fichier » pointe vers les fichiers de contrôle publiés séparément. Ce tableau ne représente pas les empreintes des données privées de la clé USB.

| Version | SHA-256 du ZIP | Taille (octets) | Fichier de vérification |
|:--|:--|--:|:--|
| V1.0 | `66deb6ecd6c5156d6335c782e5ac6d7c1c5334ebb725befe7ec7f78a35a019aa` | 29 072 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_PORTABLE_ARCHIVE_SHA256.txt) |
| V2.0.0 | `39d9a7ef89c2f89ec519f11d1f206400e54f169b8a0799fa751ff00ee9240c13` | 45 104 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V2_PREMIUM_ARCHIVE_SHA256.txt) |
| V3.0.0 | `6c7560ff22e3e9db27d2cb15f6c360173b68e81efd0155f41a2dea1ac9993fdb` | 55 987 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v3-public-okx-spot-research-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V3_PUBLIC_SPOT_ARCHIVE_SHA256.txt) |
| V3.1.0 | `d766a57632c07c489f1b6f958249af340cdfe6046fcea116a8a5d80dbd967d7b` | 46 040 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v3-1-extended-okx-history-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V3_1_PUBLIC_SPOT_ARCHIVE_SHA256.txt) |
| V4.0.0 | `01f52290fb0af507e3d845416a2861da6df63c2f6dd8d14baf20791ef7ecd294` | 49 029 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-native-strategy-creator-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_NATIVE_STRATEGY_CREATOR_SHA256.txt) |
| V4.1.0 | `1686537f089d4fdab75d652023f17384b4219c5d3aa8bc9e65035bc3b5434a19` | 52 984 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-1-professional-risk-desk-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_1_PROFESSIONAL_RISK_DESK_SHA256.txt) |
| V4.2.0 | `2dbde7f87145f6ed7a4dff06347e5c24d3ba3d20f731060cc06f3328e3ca5b63` | 63 568 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-2-historical-market-microscope-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_2_HISTORICAL_MARKET_MICROSCOPE_SHA256.txt) |
| V4.3.0 | `b1a4256da9b15ab2126dbc71592e0f80400cb5ad40989a385ebf2adb2bef2df6` | 72 844 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-3-aether-scientific-walk-forward-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_3_AETHER_SCIENTIFIC_WALK_FORWARD_SHA256.txt) |
| V4.4.0 | `6517435ca8ad21f26980caf501ed161341b5869aa3e4cdddde512812bfce341a` | 85 621 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-4-paper-trade-forensics-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_4_PAPER_TRADE_FORENSICS_SHA256.txt) |
| V4.5.0 | `3393b13d8a3ce252ca0d2d7c6bce02c6d7eb9fae803009be4f008ef81cf33b5c` | 97 445 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-5-controlled-filter-research-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V4_5_CONTROLLED_FILTER_RESEARCH_SHA256.txt) |
| V4.5.1 | `7df0396258c3e6f708f559fec8be32a6c005e13bf891281911505eb0df4e925c` | 97 229 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-5-1-ema-owner-equivalence-fix-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_5_1_EMA_OWNER_EQUIVALENCE_FIX_SHA256.txt) |
| V4.6.0 | `586dd98fbf65179eab5e3cbb75528afd330bf8c839b5b21b043082a87d339302` | 108 404 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-certified-binance-monthly-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_CERTIFIED_BINANCE_MONTHLY_SHA256.txt) |
| V4.6.1 | `7a1f447beb22fe91879db2cbfbea11990673e88152912de02ce560bdb7cbe879` | 108 444 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-1-active-source-provenance-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_1_ACTIVE_SOURCE_PROVENANCE_SHA256.txt) |
| V4.6.2 | `7137ec9b940f726f60fd8ba04a0f9cb21c51c9b09e680909e64a31155ced378d` | 112 322 | [SHA-256.txt](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v4-6-2-source-context-reset-2026-11-15/SEVEN_HEAVEN_STRATEGY_LAB_V4_6_2_SOURCE_CONTEXT_RESET_SHA256.txt) |
| V4.7.0-RC1 | `cacd60991c62328cb8db108e9cd907a78d2839c801b88326322f07d7966a9289` | 142 109 | [Release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-7-0-rc1-native-donchian-2026-11-16) |
| V4.8 DEV | `f21c8b1660d6139ac5987a4eaa979926065c1540c4447118335ed78844745893` | 1 821 960 | [SHA direct](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_V4_8_HISTORICAL_VAULT_V2_WORKSPACE_STEWARD_V3_DEV.zip.sha256) |
| V4.9.0-DEV1 | `d7e7aee85c44c583d6eb0de55256dee443bbb603853dd29cbc853b393d8cfd16` | 4 392 425 | [SHA direct](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_V4_9_HISTORICAL_VAULT_V3_MULTI_ASSET_CORPUS_V1_DEV.zip.sha256) |

Une empreinte SHA-256 de fichier ZIP doit être comparée à **l'archive téléchargée elle-même** avant toute extraction, et non à un fichier source extrait. Ne jamais remplacer silencieusement une archive publiée ; publier une nouvelle version identifiée en cas de modification.

## 3. Carte des emplacements — aucune redondance

| Emplacement | Rôle officiel | Politique |
|:--|:--|:--|
| **Ce dossier partagé** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/` | **Présent README**, [manifeste de continuité](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json), preuves et notes transversales de recherche | Point de consultation durable des versions et rapports |
| [Racine de coordination Agent-Crypto](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto) | Routage entre Administrator, Trader, Operator, Yoann et Strategy Lab + archive directe des livraisons récentes | Depuis V4.8 : ZIP importants + `.sha256` conservés ici pour continuité inter-LLM |
| [GitHub Releases — archives officielles](https://github.com/BlueAzur-Hub/erith-ia-memory/releases) | **Un ZIP intégral de programme par version**, sommes SHA-256, éventuelles captures ou preuves annexes | Historique des versions téléchargeables, non intégré au `workspace/` |
| [Code source actif](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/seven_heaven_strategy_lab) | `src/`, `web/`, `tests/`, lanceurs Windows, README de développement | Dossier de **développement**, non répertoire privé utilisateur |
| [Plan directeur Notion](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72) | Feuille de route, validations Firefox, décisions de recherche avec Yoann | Document de pilotage, pointant vers cet index plutôt que recopiant les ZIP |
| `E:\seven_heaven_strategy_lab\workspace\` | Archives téléchargées sur la clé, expériences, profils, journaux et rapports locaux | **Privé, non suivi dans Git ; ne pas supprimer ni écraser** |

## 4. Continuité et protocole de livraison

1. **Avant tout développement :** lire ce README, puis le [manifeste versionné](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json), puis le [README du programme](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/seven_heaven_strategy_lab/README_FR.md) et les décisions Notion. Ne pas repartir de V1 ni dupliquer la recherche déjà faite.
2. **Une version = une publication complète.** Les scripts temporaires de correctif, les fichiers `INSTALL_Vx_to_Vy` et les doublons de README ne doivent pas être ajoutés à la clé de l'utilisateur. Les développeurs travaillent sur GitHub et dans ses dossiers de code/test.
3. **Séparer trois preuves :** (a) commit/source, (b) recette GitHub Python/Windows/Chromium/OKX, (c) **réception par le propriétaire dans Firefox**. Une recette CI verte n'est pas une réception locale.
4. **Avant installation sur la clé :** stopper le serveur Python, effectuer une **sauvegarde indépendante de `workspace/`** sur un autre support, vérifier la place libre, extraire **le seul ZIP de la version cible** sur les fichiers du programme, **sans effacer ni écraser `workspace/`**, puis relancer le lanceur Windows déjà présent.
5. **Protection des frontières :** Strategy Lab = étude hors ligne / données publiques + PAPER. Administrator / Trader / Operator / Bridge restent des composants distincts. Aucun échange de données de comptes privées avec ce dépôt public, aucune clé API, aucun ordre réel, aucune exécution de bot sans demande et audit séparés.
6. **Pour toute prochaine version :** mettre à jour le manifeste avec SHA, lien ZIP, statut CI et statut Firefox ; actualiser la ligne de ce README **sans créer un deuxième catalogue** ; relier les notes au plan directeur Notion.

## 5. Prochain relais de recherche

- **V4.4 validée dans Firefox :** BTC/USDC OKX Spot, 90 jours, 540 bougies 4h, trois positions clôturées, six fills vérifiés par Aether Forensics ; résultat PAPER `-851,03 USDC`. Preuve fournie par les captures du propriétaire, pas par lecture directe de sa clé.
- **V4.5 confirmée dans Firefox par le propriétaire le 13/11/2026 :** BTC/USDC OKX Spot, 720 bougies 1h ; cinq variantes de filtres, deux fenêtres de vérification. RSI<60 : -3,28 % contre -3,40 % pour le profil original (fenêtre 1) ; RSI<45 : 0 % et zéro fill contre -9,36 % pour le profil original (fenêtre 2). La deuxième variante est restée en liquidités, ce n'est PAS un profit ni un holdout aveugle. [Rapport de réception détaillé](./SEVEN_HEAVEN_STRATEGY_LAB_V4_5_OWNER_FIREFOX_ACCEPTANCE_AND_RESEARCH_HANDOFF_2026_11_13.md).
- **État courant : V4.6.2 publiée comme Latest et acceptée dans Firefox par le propriétaire le 16/11/2026.** La preuve de réception montre BUILD 4.6.2, OKX Spot ETH/USDC, 2 160 bougies 1h clôturées, SHA-256 vérifié, 70 positions clôturées / 140 fills PAPER et les modules Simulation, Comparaison, Scientific, Research, Microscope et Forensics sur la même source active. Ce constat valide la réception fonctionnelle et la cohérence visible ; il ne constitue ni un audit d'exécution réelle ni une preuve de rentabilité. [Passation finale V4.6.2](./SEVEN_HEAVEN_STRATEGY_LAB_V4_5_1_TO_V4_6_2_RELEASE_AND_OWNER_ACCEPTANCE_HANDOFF_2026_11_15.md). La suite de recherche a été ouverte explicitement le 16/11/2026 : [phase de certification historique longue 2019–2021](./SEVEN_HEAVEN_STRATEGY_LAB_LONG_HISTORY_CERTIFICATION_PHASE_2019_2021_2026_11_16.md), puis 2024–2025. Cette ouverture ne crée pas automatiquement une V4.7 : V4.6.2 reste la base stable. Freqtrade/Hummingbot restent facultatifs et aucun ordre réel n'est autorisé. Le protocole de comparaison est pré-enregistré dans [l'étude 2019–2021](./SEVEN_HEAVEN_STRATEGY_LAB_2019_2021_PREREGISTERED_EXPERIMENT_PROTOCOL_2026_11_16.md) avant lecture des performances longues. Le balayage réel a ensuite établi 19/36 mois strictement certifiés sur 2019–2021, contre 24/24 sur 2024–2025 ; voir [l'inventaire 2019–2021](./SEVEN_HEAVEN_STRATEGY_LAB_BINANCE_2019_2021_REAL_MONTHLY_INVENTORY_2026_11_16.md) et [les baselines 2024–2025](./SEVEN_HEAVEN_STRATEGY_LAB_2024_2025_CERTIFIED_BASELINES_AND_FRICTION_RESULTS_2026_11_16.md).

### Recherche active — Donchian 55/20 4h

Le candidat actuel n'est pas intégré au runtime V4.6.2 : il reste en **recherche PAPER isolée**.

- [Résultats Donchian BTC 2024–2025](./SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_RESULTS_2026_11_16.md)
- [Contre-épreuve BTC segmentée 2019–2021](./SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_2019_2021_SEGMENTED_RESULTS_2026_11_16.md)
- [Validation multi-actif ETH/USDT 2024–2025](./SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_ETHUSDT_RESULTS_2026_11_16.md)

État scientifique : BTC ancien **3/5 blocs positifs**, BTC 2024–2025 **2/2**, ETH 2024–2025 **2/2**. Les deux blocs BTC anciens négatifs sont conservés. Cela justifie une falsification supplémentaire, pas une revendication de robustesse future.

**Prochaine étape gelée :** conserver Donchian 55/20 en 4h inchangé et tester BNB/USDT, XRP/USDT et SOL/USDT après certification stricte des sources. Aucun tuning, aucune V4.7 automatique.

### Falsification Top 5 — Donchian 55/20 4h

Le panier BNB/USDT, XRP/USDT et SOL/USDT a été fixé avant résultat puis certifié sur **72/72 mois 2024–2025**. La règle 55/20 4h est restée inchangée.

- [Protocole BNB/XRP/SOL](./SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_BNB_XRP_SOL_PREREGISTRATION_2026_11_16.md)
- [Résultats BNB/XRP/SOL](./SEVEN_HEAVEN_STRATEGY_LAB_DONCHIAN_55_20_4H_BNB_XRP_SOL_RESULTS_2026_11_16.md)

Résultat : BNB **−1,03 % / +14,92 %**, XRP **+142,62 % / −21,40 %**, SOL **+33,72 % / −17,72 %** pour 2024 / 2025. Avec BTC et ETH, cela donne 7 fenêtres annuelles positives et 3 négatives sur 10, chiffre descriptif uniquement.

**Décision :** ne pas tuner Donchian. Passer à une analyse descriptive des régimes et de l'anatomie des positions avant toute nouvelle règle.

### Point de reprise produit — V4.8 Knowledge Layer · 16/11/2026

Le propriétaire teste le **BUILD 4.7.0-RC1** comme base locale tandis que V4.8 progresse par gates ciblés. La base stable publiée reste **V4.6.2**.

La Knowledge Layer comprend désormais les fiches professionnelles **EMA**, **Bandes de Bollinger**, **Donchian 55/20**, puis les quatre références passives **DCA programmé**, **Buy & Hold 50 % BTC**, **Buy & Hold 100 % BTC** et **Conservation USDC**.

Le **Help Layer V1 global** a remplacé les systèmes d'aide concurrents : un seul bouton `?` dans l'en-tête global, une seule carte contextuelle, et une couverture du Lab entier. Le propriétaire l'a validé visuellement dans Firefox le 16/11/2026 par captures et retour explicite positif.

Le paquet **Step 5 — Passive References DEV** a ensuite été construit sur ce parent accepté :

- `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP5_PASSIVE_REFERENCES_DEV.zip`
- SHA-256 : `8871321dde43f22271740e6355cec11235aee0478ca86047e90de549cc0457ca`
- **137 / 137 tests PASS** ;
- syntaxe JavaScript PASS ;
- recette UI Chromium automatisée : clic Help, ouverture des quatre fiches, préparation DCA et console propre ;
- `src/engine.py` inchangé ;
- réception Firefox Windows du Step 5 : **en attente**.

Le DCA est documenté selon le contrat réel : l'intervalle saisi en minutes est converti en nombre entier de bougies selon le timeframe avant l'appel au moteur. Les variantes Buy & Hold sont traitées comme baselines d'exposition, et Conservation USDC comme baseline cash nominale ; aucune de ces fiches n'est une recommandation.

[Document Step 5](./V4_8_KNOWLEDGE_LAYER_STEP5_PASSIVE_REFERENCES_2026_11_16.md) · [Manifeste des paquets V4.8](./V4_8_KNOWLEDGE_LAYER_PACKAGE_MANIFEST_2026_11_16.md)

**Gate suivant :** réception Firefox du Step 5 par le propriétaire. Après acceptation, ouvrir le chantier **historiques longs + multi-actifs** avant d'ajouter automatiquement MACD ou SuperTrend.

### Liens de continuité

- [Passation finale V4.6.2 — réception propriétaire et reprise hors Work](./SEVEN_HEAVEN_STRATEGY_LAB_V4_5_1_TO_V4_6_2_RELEASE_AND_OWNER_ACCEPTANCE_HANDOFF_2026_11_15.md)
- [Manifeste JSON canonique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json)
- [Répertoire de développement Strategy Lab](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/seven_heaven_strategy_lab)
- [Documentation de l'application](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/seven_heaven_strategy_lab/README_FR.md)
- [Plan directeur Notion](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72)
- [Point d'entrée du répertoire partagé Agent-Crypto](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/README.md)

> **Principe durable :** une référence vérifiable pour chaque version ; zéro duplication des archives de programmes, zéro fichier de développement sur la clé USB, et continuité explicite des règles et décisions.

