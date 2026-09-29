# Agent-Crypto 40.6.461 — STRATEGY A EVIDENCE IDENTITY CROSSWALK TRUTH

## Objet unique
Vérifier si les 4 after-cost et les 9 états PAPER de Durable Evidence sont réellement orphelins avant toute correction de données.

## Cause du faux négatif possible
Le stockage durable choisit historiquement des identifiants primaires différents :
- after-cost : reconciliation_id → execution_id → trade_id → identity ;
- PAPER : execution_id → trade_id → reconciliation_id.

Une même opération peut donc contenir les deux identifiants mais apparaître orpheline si on compare seulement l'ID primaire choisi.

## Correction diagnostique
Le nouveau crosswalk compare tous les champs disponibles de chaque ligne :
- execution_id
- reconciliation_id
- trade_id
- identity

Il classe les candidats :
- EXACT_EXECUTION_MATCH
- RECONCILIATION_MATCH
- TRADE_MATCH
- CROSS_FIELD_MATCH
- MULTI_ID_MATCH

Il distingue aussi liens 1↔1 uniques, candidats ambigus et vrais orphelins.

## Garde-fous
Aucune fusion automatique. Aucune écriture IndexedDB. Aucun gate certifié. Aucun seuil, réseau ou ordre réel. Market Core 38.15.11 intact.
