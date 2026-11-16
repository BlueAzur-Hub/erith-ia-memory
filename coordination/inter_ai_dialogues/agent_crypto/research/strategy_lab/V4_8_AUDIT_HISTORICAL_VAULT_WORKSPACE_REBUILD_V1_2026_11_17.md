# Seven Heaven Strategy Lab — V4.8 Audit + Historical Vault V1 + Workspace Rebuild V1

Date: 2026-11-17  
Statut: DEV, PAPER ONLY, aucune fusion dans la release stable.

## Base et verrou moteur

Base: Knowledge Layer Step 5 + Help Layer V1 global validés visuellement sous Firefox par le propriétaire.

Le moteur financier canonique reste byte-for-byte identique:

`f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

## Audit de code

Corrections prouvées, sans modification des formules:
- libellés Cash liés à la vraie devise de cotation (USDC/USDT) dans la couche serveur/UI;
- messages publics de validation rendus quote-agnostic;
- warnings liés à la source réellement résolue;
- contrôle loopback lié au port réellement écouté;
- `pytest.ini` pour une recette portable;
- préparation multi-actifs via Source Catalog générique.

Recette finale: **151 tests PASS + 12 sous-tests**, `pytest -q` et `python -m pytest -q`.

## Historical Vault V1

Le Lab expose la profondeur historique déjà indexée par Seven sans confondre INDEXÉ et LOCAL/UTILISABLE.

Snapshot canonique source: `public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json`.

V1 autorise explicitement les années complètes 2024/2025 pour BTC, ETH, BNB, XRP et SOL après contrôle ZIP Binance Public Data + CHECKSUM + continuité 1m + agrégation 1h. Aucun ZIP brut conservé. Aucune donnée synthétique.

## Audit du workspace réel

Archive propriétaire analysée: `seven_heaven_strategy_lab(5).zip`  
SHA-256: `13fc3563904526848a0c51d294ac8ea3083cd52b85fbe4502f07f1b40bad978f`

Avant rebuild:
- 43 fichiers source/données vérifiées;
- 1 profil;
- 0 StrategySpec;
- 28 résultats PAPER;
- 26 comparaisons.

Décision: les sources sont préservées; l'état généré est sauvegardé puis reconstruit.

## Workspace Rebuild V1

Le protocole est dry-run par défaut. Il:
1. relit le vrai Source Catalog via le serveur local;
2. refuse le reset si une source requise manque;
3. calcule l'inventaire SHA-256 des sources;
4. sauvegarde profils/specs/résultats/comparaisons existants;
5. reset uniquement l'état généré;
6. rejoue les endpoints réels `/api/profiles`, `/api/strategy-specs`, `/api/run`, `/api/compare`;
7. rejoue Scientific/Research et vérifie qu'ils restent éphémères;
8. vérifie que les sources sont byte-identiques avant/après.

Sur une copie exacte du workspace propriétaire:
- 43/43 sources byte-identiques;
- 22 sources dans le Source Catalog;
- 12 profils;
- 12 StrategySpecs;
- 12 résultats PAPER;
- 6 comparaisons;
- Scientific: 7 familles rejouées sans écriture;
- Research EMA: 4 variantes / 2 fenêtres sans écriture.

## Références de la matrice canonique

BTC/USDC OKX 90 j · 1h:
- EMA 10/30: -4.93014 %
- Bollinger 20/2: -6.46895 %
- Donchian 55/20: +5.21038 %
- DCA 1440 min / 50: -6.76412 %
- Hold 50 %: +4.28958 %
- Hold 100 %: +8.57916 %
- Cash: 0 %

Contrôles de régime:
- Donchian BTC/USDC 90 j · 4h: -11.44870 %
- Donchian ETH/USDC 90 j · 1h: -17.65070 %
- Donchian BTC/USDT OKX 90 j · 1h: -6.96279 %
- Donchian BTC/USDT Binance janvier 2020 · 1h: +15.05339 %
- EMA BTC/USDT Binance janvier 2026 · 1m: -92.20371 %

Ces écarts justifient l'ouverture scientifique d'Historical Vault: une stratégie ne doit pas être jugée sur une seule période ou un seul actif.

## Artifacts DEV

Application:
`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_AUDIT_FIXED_HISTORICAL_VAULT_WORKSPACE_REBUILD_V1_DEV.zip`

SHA-256:
`0fca6b38b9ef2a3f3577afb66652e1c5c92e194b9f4494396f89da64b4b94861`

Workspace canonique:
`SEVEN_HEAVEN_STRATEGY_LAB_WORKSPACE_CANONICAL_REBUILD_V1_2026_11_17.zip`

SHA-256:
`bb96fc8f68bf1511dcbce5e3c2fe89b9817a23c41d81e5cc8b65173d77bb8d29`

## Suite

Validation Firefox du propriétaire, puis installation d'un premier millésime Historical Vault 2024/2025 et comparaison d'une même StrategySpec entre actifs/années.

Aucun ordre réel. Aucun compte exchange. PAPER ONLY.
