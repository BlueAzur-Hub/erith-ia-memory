# Seven Heaven — Réconciliation Radar ↔ Dossiers Crypto ↔ Historical Vault

**Date : 8 novembre 2026.** Trois dossiers pilotes **Q, ICNT et FLUID** réconciliés sur le plan documentaire. **Pas de nouvel Atlas des 250**, pas de doublon des données.

| Projet | Identifiant exact | Fiche | Données réellement retrouvées |
|---|---|---|---|
| **Q / Quack AI** | `quack-ai` | [Cas d'école Q](cas-ecole-quack-ai.md) (déjà mis à jour) | 6 Radar/J+1/J+7 ; 390 bougies Bitget 1D avec 4 lacunes ; journal Bitget Spot séparé |
| **ICNT / Impossible Cloud Network** | `impossible-cloud-network-token` | [Dossier ICNT](cas-ecole-icnt-impossible-cloud-network.md) | 9 détections ; 7 J+1, 6 J+7 ; données Bitget Spot horaires datées ; aucune entrée 1D/1m dans deux catalogues consultés |
| **FLUID / Fluid** | `instadapp` | [Dossier FLUID](cas-ecole-fluid-instadapp.md) | 3 détections ; 3 J+1, 1 J+7 ; **553 bougies natives OKX Spot 1D UTC** sans lacune cataloguée |

## Sources communes déjà présentes, sans recopie

- [Radar Historique](radar-historique.html), [Dossiers Crypto](crypto-knowledge.html), [Historical Vault](../administrator/historical-vault.html).
- [Détections et suivis](../data/crypto/radar-opportunities/dynamic-followups.json), [qualification Spot](../data/crypto/radar-opportunities/qualification-latest.json), [état d'identité](../data/crypto/radar-opportunities/spot-identity-latest.json).
- [Registre de connaissances](../data/crypto/research/asset-knowledge.json), [catalogue quotidien](../data/historical_archive_prototype/top250_multiresolution_sources/index.json), [catalogue natif à la minute](../data/historical_archive_prototype/top250_multisource_coverage/index.json).
- [Positions PAPER fictives](../data/crypto/radar-opportunities/spot-paper-forward.json) : **aucun fill** dans le fichier consulté ; aucun ordre réel.

## Leçons conservées

**Q n'est pas QNT.** FLUID utilise l'ancien **ID CoinGecko `instadapp`**, ce qui ne doit pas créer un faux conflit d'identité. L'ancien registre de FLUID contient une mention erronée du jeton **BR** : à traiter dans un chantier de qualité des données distinct, sans écraser la preuve initiale.

**Les statuts de preuve ne sont pas interchangeables :** annonce de cotation d'un instrument, correspondance de contrat, présence d'un carnet, prix en USD, quote en USDT, bougie quotidienne et exécution Spot sont des objets distincts. Les suivis J+1/J+7 manquants ou futurs restent explicitement manquants.

**Opération terminée ici :** Q existait et était déjà réconcilié ; deux fiches complémentaires sont créées pour ICNT et FLUID, avec cet index. Pas de modification du Trader, Administrator, Operator, API, collecteurs, historiques, JSON, comptes ni ordres. Cette mission **ne prétend pas auditer les 250 cryptomonnaies**.
