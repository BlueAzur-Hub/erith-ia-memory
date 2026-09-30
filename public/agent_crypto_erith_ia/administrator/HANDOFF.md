# HANDOFF — Agent-Crypto 40.6.479

## Objet

Sécuriser la preuve acquise et rendre visible la fraîcheur réelle des entrées Strategy A avant toute correction supplémentaire.

## Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.479 · Administrator**.
3. Section 04 → Simulation.
4. Trouver **STRATEGY A · INPUT FRESHNESS TRUTH · 40.6.479**.
5. Vérifier que le dernier cycle Strategy est visible avec son heure.
6. Vérifier la séparation :
   - BTC prix + 24 h : DIRECT_DECISION_INPUT ;
   - Oracle / direction : DIRECT_DECISION_INPUT ;
   - Cost Gate modèle : DIRECT_DECISION_INPUT ;
   - Atlas CURRENT : CONTEXT_VISIBLE_NOT_PROVEN_DIRECT ;
   - Kraken + OKX mesuré : EVIDENCE_SHADOW_NOT_GATE ;
   - News : CONTEXT_ONLY.
7. Un Atlas CURRENT ancien doit être affiché STALE sans arrêter ni modifier Strategy.

## Atlas

Ne pas forcer un nouveau CURRENT sur le même snapshot.

Le diagnostic upstream actuel est : CoinGecko HTTP 403, dernier snapshot canonique valide conservé.

## Protection

Lecture Technique .477 et garde terminale .478 sont héritées. Market Core 38.15.11 intact. Aucun ordre réel.
