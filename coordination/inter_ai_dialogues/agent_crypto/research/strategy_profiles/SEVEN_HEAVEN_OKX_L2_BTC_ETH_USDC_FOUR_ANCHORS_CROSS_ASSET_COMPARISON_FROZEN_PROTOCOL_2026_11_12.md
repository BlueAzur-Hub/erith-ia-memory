# Seven Heaven — BTC/ETH Spot USDC, comparaison L2 historique à quatre heures UTC fixes

**Préenregistré le 12 novembre 2026, AVANT la disponibilité des résultats ETH du jour entier.** Aucun ordre, recherche PAPER.

## Bases et conditions bloquantes

Comparer les **mêmes quatre ancres** sur les **archives officielles Spot L2 400 niveaux d'OKX du 15 octobre 2026**, à **00:00, 06:00, 12:00 et 18:00 UTC**, dans les paires **BTC-USDC** et **ETH-USDC**.

L'archive BTC est déjà complètement lue et vérifiée :
[preuves BTC](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), Git blob `a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40`.

**Condition impérative :** résultats ETH complètement publiés sur `main`, quatre horaires valides, gzip CRC, SHA-256 archive entière et membre, 20 premières lignes de la preuve de préfixe ETH identiques, aucune erreur de replay. Si cette condition n'est pas remplie, comparaison **INCOMPLÈTE** et aucun chiffre ETH inventé.

## Méthode de comparaison, fixée maintenant

Pour chaque heure et chaque paire, les **premiers états valides à ou après l'heure cible**, avec un décalage <=60 s ; les observations sont approximativement simultanées **à quelques millisecondes près**, mais pas des transactions synchronisées.

Comparer sans transformation de monnaie (toutes les valeurs notionnelles sont en USDC) :

1. **Spread relatif en bp** des quatre états, différences ETH moins BTC en bp ; minimum, maximum, moyenne et médiane de **ces quatre chiffres uniquement** avec leur effectif exact. Ne pas nommer une moyenne sur quatre points « spread quotidien moyen ».
2. **Friction de prix carnet**, excluant toujours les frais de plateforme, pour achat et vente théoriques à **10, 100, 1 000, 10 000, 100 000 USDC**. Présenter les 40 comparaisons couplées de côtés (4 heures × 5 notionnels × achat/vente) en JSON/CSV et tableau descriptif 1 000/100 000 dans rapport. `insufficient_visible_depth` ne reçoit aucune valeur fabriquée.
3. Compteurs intégrité et profondeur de chaque archive séparément : nombre d'événements, snapshots, deltas, suppressions, timestamps, checksum de fichier ; valider champs et schema des deux preuves.
4. Vérifier que les quatre heures cibles sont identiques ; **ne pas choisir a posteriori des heures plus favorables**.

## Limites non négociables

- **Une seule journée et quatre horaires**, soit 4 observations par paire, ne suffisent pas pour quantiles de marché, régimes haussiers/baissiers, saisonnalité intrajournalière, comparaison de stabilité des spreads ou preuve de rendement.
- Les prix carnet ne représentent pas des fills réels, les tailles affichées peuvent disparaître ; aucune liquidité réelle garantie, et les frais propres au compte sont inconnus.
- Les archives peuvent ne pas avoir `seqId`/`prevSeqId` ; SHA-256/CRC des fichiers n'établissent pas l'absence de messages manquants lors de leur production.
- Aucun paramètre EMA 10/30 modifié et **aucune imputation des coûts L2 de 2026 aux 122 transactions fictives du replay historique Bitstamp/USD**.

Publier rapport, données numériques compactes avec liens SHA, méthode reproductible et passation dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Aucune surveillance programmée, aucun ordre, aucun changement Trader/Bridge/Administrator/Operator.