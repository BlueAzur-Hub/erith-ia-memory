# Seven Heaven — OKX BTC/ETH USDC : règles d'instrument et deuxième photographie du carnet

**Préenregistré le 12 novembre 2026 avant cette nouvelle collecte.** Recherche en lecture publique, aucune donnée de compte, aucun ordre, aucune surveillance périodique.

## Question
Le carnet instantané du 12 novembre à **15:27:25 UTC** doit être complété par les **contraintes officielles de négociation** (statut, `minSz`, `lotSz`, `tickSz`) et par une deuxième capture. Cette comparaison de deux instants **ne constitue pas** un échantillonnage horaire ni une estimation de coûts historiques.

## Endpoints publics, paires figées
Pour chacune des paires `BTC-USDC` et `ETH-USDC` exclusivement :
- Métadonnées : `GET https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId=BTC-USDC` (puis `ETH-USDC`).
- Carnet : `GET https://www.okx.com/api/v5/market/books?instId=BTC-USDC&sz=400` (puis `ETH-USDC`).
- Source de référence initiale figée : `okx_spot_usdc_orderbook_2026_11_12_evidence/SEVEN_HEAVEN_OKX_SPOT_USDC_ORDERBOOK_COST_EVIDENCE.json`, Git blob SHA-1 `2d7ff439b9699f14b07c5eed5588664aa6503b77`, capture UTC 2026-11-12 15:27:25.

Documentation : https://www.okx.com/docs-v5/en/ . Le statut `live` indique un instrument actif selon l'API, **pas** une garantie de disponibilité sur un compte européen donné ni d'acceptation d'un ordre.

## Tests d'intégrité et arrêt
- Vérifier `code=0`, instrument unique exact `instId`, `instType=SPOT`, `baseCcy` et `quoteCcy=USDC`; `minSz`, `lotSz`, `tickSz` doivent être numériques strictement positifs. Conserver `state` tel que renvoyé, sans forcer `live`.
- Vérifier `code=0` pour chaque carnet, premier bid positif inférieur au premier ask, profondeur ordonnée, taille positive, horodatage source avec âge raisonnable ; rejeter un livre invalide.
- Archiver **octets JSON bruts** pour chaque requête accessible, `SHA-256`, URL publique, heure UTC réception, et aucune donnée personnelle. Chaque échec est documenté comme indisponible ; **ne jamais inventer une valeur de minSz, lotSz ou tickSz**.
- Aucun accès de trading, POST, ordre ou permission privée.

## Simulations prédéfinies (hypothèses, pas tickets validés)
- **10, 20, 100 et 1 000 USDC** par paire.
- Au **meilleur prix vendeur (ask)** d'une capture, quantité de base théorique `floor((montant/ask)/lotSz)*lotSz`, arrondie **vers le bas** ; comparer à `minSz` et au budget.
- Vérifier le meilleur ask sur la grille de `tickSz`, sans remplacer le prix du carnet si incohérent.
- Les quantités théoriques sont des **tests de compatibilité de taille pour un ordre limite**, pas des achats garantis : `minSz` en base, `lotSz` en base, `tickSz` en quote. Des règles de minimum en notionnel, limites de prix, frais, balances, restrictions géographiques, statut de compte, et `tradeQuoteCcy` peuvent s'ajouter. Conserver les champs de maximum s'ils existent, ne pas les réinterpréter.
- **Pour les ordres Spot au marché** : le paramètre `tgtCcy` détermine si `sz` est exprimé en devise de base ou de cotation ; ne pas généraliser le calcul limite à un ordre au marché. Aucune simulation de place order API.

## Deuxième photographie
Comparer **uniquement** le spread instantané BTC/USDC et ETH/USDC au relevé initial horodaté, et calculer les variations arithmétiques en bp. Ne pas conclure une saisonnalité horaire, une loi de liquidité ni une corrélation avec la volatilité à partir de **deux observations**. Les captures ne sont pas simultanées. Ne pas modifier le modèle EMA 10/30 ni injecter cette observation tardive dans 2024–2026.

## Sorties exigées
Publier dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : programme Python read-only, tests synthétiques, JSON de preuves avec SHA, tableaux CSV, rapport rédigé, passation inter-IA. Un seul workflow GitHub Actions déclenché sur code/manuel **sans horaire récurrent**. Signaler explicitement toute preuve manquante. Aucune modification Administrator/Operator/Trader/Bridge.
