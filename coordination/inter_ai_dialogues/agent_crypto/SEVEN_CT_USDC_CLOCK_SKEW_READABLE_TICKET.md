# Seven Heaven — CT/USDC : écart d'horloge et lecture simplifiée du ticket

**21 octobre 2026 · lecture seule · aucun ordre réel.**

## Preuve Firefox
Dans le relevé transmis à 00 h 16, le ticket CT-USDC indique : `DIAGNOSTIC CARNET LOCAL · TIMESTAMP_FUTURE`, puis repli sur archive publique GitHub de 213 minutes. Les autres contrôles R25 (paire CT-USDC, frais du compte, quantités et plafond d'achat) sont opérationnels. Le texte du carnet local ne fournit **pas l'horodatage exact**, donc l'avance des horloges n'est pas mesurable à partir du relevé.

## Défaut de code identifié
`verifiedCtLiveBook` et `diagnoseCtLiveBook` rejetaient strictement toute réponse dont `observed_at_utc` est postérieur à `Date.now()` : **une seule milliseconde d'avance** déclenchait le diagnostic `TIMESTAMP_FUTURE`. Un tel rejet ne prouve ni défaillance Backend, ni horloge Windows mal réglée.

## Livraison
- [PR #553](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/553) fusionnée sur `main`, commit [c41e49aa](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/c41e49aa5d37b7f86ef34b320f0ca31ed192af94).
- Tolérance volontairement limitée à **2 secondes d'avance** entre horloge du carnet et horloge Firefox. Une avance plus grande est refusée et **mesurée en secondes** dans le diagnostic.
- L'ancienneté maximale **20 secondes**, l'identité **CT-USDC**, l'ordre des meilleurs prix et les quantités positives restent obligatoires. La comparaison de fraîcheur du contrôle de compte emploie la même tolérance bornée.
- Au-dessus du rapport complet, un résumé court affiche : `CARNET`, `COMPTE`, `PRIX`, `ORDRES`. Les dizaines de lignes techniques restent accessibles dans `Afficher le rapport technique complet`, replié par défaut. Le contenu du rapport et les preuves détaillées ne sont pas supprimés.
- Deux tests ajoutés : **avance +1,5 s acceptée**, **avance +3 s refusée**, carnet **21 s ancien refusé**, rapport technique toujours consultable.
- R25 / Bridge 1.9.19, Backend 1.4.6 et Market Core 38.15.11 **inchangés**. Aucune permission Trade, ordre réel ou mouvement de fonds.

## Résultats CI
- PR #553 : `Agent-Crypto Trader Current`, `lightweight multisite Pages`, `incremental patch` réussis avant fusion.
- Vérifier séparément le workflow Pages post-fusion et la recette Firefox ; ne pas déclarer carnet `LOCAL_OK` sans preuve terrain.

## Recette Firefox
1. Garder R25 actif ; **pas de nouvel exécutable**.
2. Rafraîchir le Trader (`Ctrl+F5`). Ouvrir CT Solo → Laboratoire PAPER → ticket CT/USDC → `Vérifier ce scénario`.
3. **Lire seulement les quatre lignes du résumé**. Si `CARNET CT/USDC · RÉCENT OKX ACCEPTÉ`, noter le contrôle avec son horodatage ; cela ne garantit pas l'exécution d'un ordre.
4. Si le carnet reste `TIMESTAMP_FUTURE`, déplier le rapport et lire l'**avance désormais chiffrée** : au-delà de 2 s, poursuivre l'investigation sur la génération d'horodatage Backend/OKX et la comparaison client. Ne pas augmenter aveuglément la tolérance.
5. Si `BOOK_STALE` ou `LOCAL_REQUEST_FAILED`, suivre le diagnostic et corriger le maillon concerné. Toute archive reste une étude historique.

**Point d'arrêt :** correction de vérification et affichage simplifié livrés ; fonctionnement chez l'utilisateur en attente de validation Firefox.
