# HANDOFF — Agent-Crypto 40.6.488

## Décision

40.6.488 est une restauration stricte du producteur Crypto canonique Top-250.

Le code source restauré provient de 40.6.479 / commit `aa120142b856596739e0fc6abd5b418fe58f379a`.

## Propriétaires restaurés

- `.github/workflows/atlas-public-crypto-market.yml`
- `public/agent_crypto_erith_ia/tools/collect_public_crypto.py`
- `public/agent_crypto_erith_ia/tools/collect_public_crypto_rank_complete.py`

## Héritage protégé

Le reste de l'Administrator reste celui de 40.6.487. Les modules runtime 40.6.487 sont hérités sans modification fonctionnelle.

## Validation

Après publication :
1. attendre le workflow `Atlas Public Crypto Market`;
2. vérifier le statut du collecteur canonique ;
3. vérifier qu'un snapshot plus récent est publié ;
4. seulement ensuite considérer Atlas CURRENT de nouveau alimenté.

Ne pas ouvrir un nouveau chantier Strategy / Atlas tant que cette preuve n'est pas connue.
