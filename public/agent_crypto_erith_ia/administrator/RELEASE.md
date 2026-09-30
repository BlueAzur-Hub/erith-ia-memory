# Agent-Crypto 40.6.488 — PUBLIC CRYPTO COLLECTOR PRE-480 RESTORE

## Objet unique

Restaurer le producteur public Crypto canonique Top-250 à son dernier état validé avant la régression 40.6.480.

## Source de restauration

- Build source : **40.6.479**
- Commit source : `aa120142b856596739e0fc6abd5b418fe58f379a`
- Trois propriétaires restaurés exactement :
  - `.github/workflows/atlas-public-crypto-market.yml`
  - `public/agent_crypto_erith_ia/tools/collect_public_crypto.py`
  - `public/agent_crypto_erith_ia/tools/collect_public_crypto_rank_complete.py`

## Méthode

Aucune réinvention. Aucun changement de fournisseur. Aucun changement Strategy A ou Atlas CURRENT.

La restauration remet les trois propriétaires au contenu exact du checkpoint 40.6.479.

## Protections

- Market Core 38.15.11 inchangé
- Strategy A inchangée
- Atlas CURRENT engine inchangé
- Oracle / Math inchangés
- Aether / Redivider inchangés
- Lecture Technique inchangée
- Bridge R17 / V1.9.13 inchangé
- Oracle Evidence 40.6.487 inchangé
- Web Classique inchangée
- aucun ordre réel

## Preuve attendue

Après merge sur main, le workflow `Atlas Public Crypto Market` doit produire un nouveau snapshot utilisable.

Si le provider refuse encore l'appel, le dernier snapshot valide reste conservé et l'incident est traité comme une preuve provider distincte de la restauration.
