# Agent-Crypto 40.6.462 — STRATEGY A AFTER-COST COMPLETENESS TRUTH

## Objet unique
Expliquer exactement pourquoi les 4 after-cost reliés sans ambiguïté à 4 PAPER en .461 restent à 0/4 COMPLETE + VERIFIED.

## Source de vérité
Le propriétaire historique `strategy-a-after-cost-metrics.js` définit COMPLETE uniquement lorsque tous les coûts obligatoires sont connus :
- fees_eur (entry + exit)
- impact_eur
- spread_eur
- slippage_eur

L'identité comptable doit ensuite être VERIFIED et `accounting_identity_ok=true`.

## Nouveau diagnostic
Le panneau .462 analyse uniquement les liens 1↔1 uniques du Crosswalk .461 et montre :
- COMPLETE + VERIFIED ;
- lignes avec frais manquants ;
- impact manquant ;
- spread manquant ;
- slippage manquant ;
- mismatch comptable ;
- faits de base incomplets ;
- PAPER orphelins conservés ;
- diagnostic par lien.

## Garde-fous
UNKNOWN reste UNKNOWN. Aucun coût n'est inventé ou complété. Aucune archive n'est modifiée. Aucun gate n'est certifié. Aucun seuil, réseau ou ordre réel. Market Core 38.15.11 intact.
