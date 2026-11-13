# Seven Heaven Strategy Lab — Quick Handoff (13 November 2026)

**Objectif :** reprise en moins d'une page ; ne pas charger le fil Crypto de 24,9 Mo par défaut. **Chantier actif : laboratoire autonome de recherche historique / PAPER**, pas l'Administrator, le Trader, l'Operator Yoann ni le Bridge R31.

## Ce qui est fait
- **V1 → V4.5 publiées**, avec ZIP, SHA-256 et preuves par version dans le [registre canonique](README.md). V2 : cockpit ; V3 : bougies closes OKX Spot vérifiables ; V3.1 : historiques 10–90 jours ; V4 : stratégies personnelles ; V4.1 : indicateurs de performance et risque ; V4.2 : microscope ; V4.3 : robustesse chronologique ; V4.4 : forensics PAPER ; **V4.5 : comparaison contrôlée de filtres RSI/volume**.
- **V4.5.0 confirmée sur Firefox par le propriétaire** (capture et texte, sans audit indépendant du disque USB). Étude affichée : BTC/USDC OKX Spot, 720 bougies 1h, cinq variantes, deux fenêtres ultérieures. Un filtre RSI <45 termine à **0 % avec 0 transaction** sur une fenêtre : maintien en cash, pas gain. [Preuve de réception](SEVEN_HEAVEN_STRATEGY_LAB_V4_5_OWNER_FIREFOX_ACCEPTANCE_AND_RESEARCH_HANDOFF_2026_11_13.md).

## Ce qui n'est pas encore livré
- **V4.6 — extension historique :** [PR #767](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/767) **ouverte en brouillon au contrôle du 13/11**, non fusionnée, non installée. Premier validateur ZIP mensuel Binance BTC/USDT 1h : 14 tests sur fixtures, [CI réussie](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43493696195). **Aucun mois Binance réel certifié dans ce pilote** selon le [plan V4.6](SEVEN_HEAVEN_STRATEGY_LAB_V4_6_EXTENDED_HISTORICAL_RESEARCH_SOURCE_PLAN_2026_11_13.md).
- **V5 / robots :** horizon de recherche, **aucun déploiement réel**. [Freqtrade](https://github.com/freqtrade/freqtrade) = comparaison externe de backtests directionnels ; [Hummingbot](https://github.com/hummingbot/hummingbot) = famille de stratégies robots/grille/market making à étudier séparément, facultative. Aucune connexion à un compte, aucun ordre réel.

## Prochaine action unique
**Valider un vrai mois Binance Spot BTC/USDT 1h** avec son fichier `.zip.CHECKSUM`, SHA-256, horodatages UTC, continuité, trous, OHLCV, et reproductibilité PAPER. Puis seulement élargir les tests aux régimes 2019–2021 / 2024–2025, à capital, période, coûts et comparateurs constants. Ne pas mélanger OKX BTC/USDC avec Binance BTC/USDT.

## Où retrouver sans recharger 58 volumes
- [MEMORY_ENTRY — point d'entrée du fil Crypto](../../Archives/crypto_conversation_2026_11_13/MEMORY_ENTRY.md) → [état courant](../../Archives/crypto_conversation_2026_11_13/CURRENT_STATE.md) → [index thématique (20 rubriques, 860 liens)](../../Archives/crypto_conversation_2026_11_13/TOPIC_INDEX.md) → [index chronologique des 58 volumes](../../Archives/crypto_conversation_2026_11_13/INDEX.md). 577 201 lignes archivées, lecture ciblée par volume.
- [Plan directeur du Lab sur Notion](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72) · [Interface générale sur Notion](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) · [répertoire partagé Agent-Crypto](../../).
- [Sources du logiciel](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/seven_heaven_strategy_lab) · [GitHub Releases](https://github.com/BlueAzur-Hub/erith-ia-memory/releases).

**Précautions :** PAPER seulement ; frais et glissement simulés explicités ; résultats historiques ≠ gains futurs ; pas de copie du `workspace/` privé de la clé USB. La validation CI, la publication d'une Release, l'affichage Firefox et l'audit des données USB sont des preuves distinctes. **Ne pas modifier Administrator, Operator, Trader, TRADUS ou Bridge dans ce chantier documentaire.**

> Fiche datée du 13/11/2026, basée sur le registre de versions, la preuve Firefox V4.5, le plan V4.6 et la PR #767. Vérifier les mises à jour GitHub avant d'agir.
