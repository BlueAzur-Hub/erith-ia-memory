# ERITH.IA — FLUID / Fluid · Dossier Radar, OKX Spot et Coffre

**Fiche vérifiée le 8 novembre 2026 ; recherche documentaire, lecture seule.**  
**ID CoinGecko exact :** `instadapp` · **Nom/ticker :** Fluid / `FLUID` · **Marché :** OKX **Spot FLUID-USDT**.  
**Ne pas confondre un prix USD CoinGecko et un prix de transaction USDT sur OKX.**

[Retour à l'index des trois cas](RECONCILIATION_RADAR_Q_ICNT_FLUID_2026_11_08.md) · [Radar Historique](radar-historique.html) · [Bibliothèque Crypto](crypto-knowledge.html)

## 1 — Projet et contrat : concordance officielle

- [OKX Europe — annonce officielle](https://www.okx.com/en-eu/help/okx-to-list-fluid-fluid-for-spot-trading) : **FLUID/USDT Spot depuis le 27 mars 2025 à 10 h UTC**, contrat Ethereum `0x6f40d4a6237c257fff2db00fa0510deeecd303eb`, protocole DeFi de prêt et d'échanges.
- [CoinGecko — Fluid](https://www.coingecko.com/fr/coins/fluid) : ticker **FLUID**, ID API **`instadapp`**, contrat Ethereum correspondant. Ce nom d'ID reflète un héritage historique : **il ne s'agit pas d'une collision de jeton sur cette seule base**.
- Le [blog historique du projet sur INST](https://fluid.io/blog/inst) rattache déjà cette adresse au jeton de gouvernance INST. **Ne pas en déduire sans vérification l'ensemble des droits actuels du token FLUID**.
- La publication OKX Europe précise que ses services ne sont **pas accessibles identiquement à tous les utilisateurs**. Une cotation publique ne prouve pas l'accès à ce produit depuis un compte particulier.

### Anomalie à conserver pour correction distincte

La [fiche ancienne `asset-knowledge.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/asset-knowledge.json) pour `coin_id=instadapp` contient la phrase « **Rôle précis du jeton BR** ... ». **BR ne correspond pas à FLUID** : il s'agit d'une incohérence documentaire de contenu, non d'une preuve de collision CoinGecko. La même fiche conserve `identity_coin_gecko_exchange_token_verified=false` à la qualification du 17 octobre. Le JSON historique n'est **pas modifié silencieusement**.

## 2 — Trois détections Radar et suivis J+1/J+7

Source unique : [`dynamic-followups.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/dynamic-followups.json), filtre par **`id=instadapp`**, pas par symbole seul. Dernière archive référencée : **2026-11-07**.

| T0 de détection UTC | Catégorie Radar | Prix initial USD | J+1 | Statut J+1 | J+7 | Statut J+7 |
|---|---|---:|---:|---|---:|---|
| 2026-10-17 10:35 | Momentum | 2.38790782 | -3,51 % | mesuré | -7,36 % | mesuré |
| 2026-11-04 00:40 | Rebond | 2.04802719 | +27,80 % | mesuré | — | en attente |
| 2026-11-05 00:55 | Momentum | 2.61730038 | -7,19 % | mesuré | — | en attente |

**État exact : trois J+1 observés, un J+7 observé, deux J+7 encore en attente** (échéances calendaires des **11 et 12 novembre 2026**). Ne pas remplacer des données futures par des estimations, ni appeler « résultat de trading » un changement de snapshot.

## 3 — Historical Vault : 553 bougies quotidiennes natives OKX

[Catalogue `top250_multiresolution_sources/index.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multiresolution_sources/index.json) :
- CoinGecko ID `instadapp`, marché `FLUID-USDT`, venue `OKX Spot`, cadre **`1Dutc`** et quote `USDT` ;
- **553 bougies 1D UTC** entre le **2025-03-27** et le **2026-09-30**, **0 lacune** dans l'intervalle catalogué ;
- [Release GitHub des données quotidiennes](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-okx-spot-native-daily-2026-09-leo-cc-nft-a-fluid-s), fichier `instadapp-FLUID-USDT-1Dutc.json.gz`, empreinte SHA-256 **fournie par le catalogue, non recalculée depuis l'archive** : `7c4d6df217c253a7e7f69d4e8e40fed5d3a598eb5856491fe8a12cb7041b42b9` ;
- [Catalogue natif 1 minute](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) : **0 bougie 1m native, 0 mois 1m** référencés pour cet actif dans ce catalogue. **L'absence de minute n'efface pas les 553 journées quotidiennes.**

L'archive quotidienne s'arrête à **septembre 2026**. Les observations Radar d'octobre/novembre sont des snapshots USD à horodatages particuliers : **aucune jonction automatique en une série de bougies horaires continues**.

## 4 — Qualification ancienne, PAPER et utilité du projet

- L'ancienne [fiche `asset-knowledge.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/asset-knowledge.json) mentionne **OKX FLUID-USDT Spot** et un spread de **9.87 pb** à **2026-10-17T19:16:07Z**. Coût aller-retour hypothétique de **0.355 % pour 100 USDT** : **aucune garantie de prix, de frais ni de liquidité aujourd'hui**.
- [`spot-paper-forward.json`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/spot-paper-forward.json) ne comporte **aucune position FLUID** dans la version inspectée ; le fichier indique `paper_fills=0`. Aucun ordre ni P&L démontré.
- [Site de Fluid](https://fluid.io/) : prêts et échanges dans une infrastructure DeFi, mais **la TVL, l'activité économique, le droit effectif des détenteurs et les frais du protocole n'ont pas été quantifiés ni archivés dans cette étude**. Un projet utile ne garantit pas un token intéressant à acheter.

## 5 — Bilan des preuves et ce qui manque

| Question | Conclusion |
|---|---|
| CoinGecko `instadapp` = Fluid / FLUID | Concordance des pages officielles et CoinGecko |
| Adresse du contrat Ethereum ↔ OKX | Concordance documentaire forte |
| Paire FLUID-USDT Spot | Cotation officiellement annoncée ; accès régional à vérifier au besoin |
| Série historique 1D | **553 journées natives, 0 lacune cataloguée** |
| Série native 1m | **0** dans l'index inspecté |
| Suivi Radar | **3 J+1 observés, 1 J+7 observé, 2 J+7 en attente** |
| Transactions et P&L exécutés | Non démontrés ; aucun ordre lancé |
| Mention « jeton BR » dans l'ancienne fiche | Anomalie identifiée ; source intacte |

**Point d'arrêt FLUID : dossier constitué, archives et preuves reliées. Aucun code, JSON, archive ni ordre modifié.**
