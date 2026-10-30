# Agent-Crypto — Dossier partagé des audits EUR/USD — 26 octobre 2026

**Propriétaire :** coordination Aerith / Seven Heaven. **Dépôt canonique :** `BlueAzur-Hub/erith-ia-memory`. **Règle :** les rapports et preuves doivent être publiés ici, pas laissés seulement dans un lien local ChatGPT. Aucun code de production ni cache Firefox n'a été modifié par cette publication.

## Documents effectivement partagés

1. [AUDIT_TRAJET_PRIX_EUR_USD_20261026.md](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/AUDIT_TRAJET_PRIX_EUR_USD_20261026.md) — étude du circuit `rawPrice`, prix spot et tiret, tests isolés, limites. Publié le 26/10 (commit `32bbd5a48f7f1cf488dd01c5d6387ec14fb26574`).
2. [PREUVE_FIREFOX_PRIX_HISTORIQUES_5_ACTIFS_20261026.json](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/PREUVE_FIREFOX_PRIX_HISTORIQUES_5_ACTIFS_20261026.json) — export ciblé en lecture seule, 23 séries/5 actifs, 3 points par série, métadonnées de devise et horodatages, SANS portefeuilles ni clé secrète. Publié le 26/10 (commit `3a424f5686ede31bc11efd9464c0ee6d56914571`).
3. [RAPPORT_AUDIT_INTEGRAL_FIL_CRYPTO_20261026.md](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/RAPPORT_AUDIT_INTEGRAL_FIL_CRYPTO_20261026.md) — audit des archives du fil et synthèse (déjà partagé avant cette passation).
4. [Matrice_validation_graphique_EUR_USD_84_cas.csv](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/Matrice_validation_graphique_EUR_USD_84_cas.csv) — 84 cas à réaliser, **non exécutés** (déjà partagé).
5. [Statistiques_integrales_fil_crypto_20261026.json](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/Statistiques_integrales_fil_crypto_20261026.json) — métriques du fil de développement (déjà partagé).

## Pièce non versée au dépôt : transparence

- `Index_integral_fil_crypto_20261026.csv.gz` — archive compressée de 8 978 658 octets, SHA-256 `32f7861b5679d9edbab8168d65ba9974f8e13f7a522586214839ae93bb126599`. **Toujours local dans la conversation ChatGPT ; non publié sur GitHub**, car le connecteur de publication disponible ici traite les fichiers texte et ne permet pas de transférer directement cet objet binaire de 8,98 Mo. Ne pas annoncer que les six pièces sont partagées. Le rapport et les statistiques du fil sont, eux, disponibles dans le dossier GitHub ci-dessus.

## Continuité / preuves

- Source logicielle vérifiée : [administrator/app.js](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/app.js) (blob `c7a8905d956462c3944933558a110ca2742ac1eb`).
- Correction structurelle **non réalisée**. Audit de prix historiques : les courbes Base100 conservent le prix d'origine via `rawPrice`, mais le tableau USD/24h peut substituer un spot Market ou `—` ; ne jamais relabeller EUR en USD.
- Notion [AETHER · Agent-Crypto Interface](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) conserve également la passation et les règles STOP / aucun patch improvisé.

**Statut de cette livraison : documentation et preuves partagées ; aucun déploiement du moteur graphique, aucun rollback.**
