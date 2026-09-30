# HANDOFF — Agent-Crypto 40.6.481

## Checkpoint

40.6.480 reste le correctif d'accès CoinGecko. 40.6.481 est séparée et ne touche qu'au transport de lecture Oracle Evidence.

## Vérification opérateur

Ctrl+F5 → **Build 40.6.481 · Administrator**.

Ouvrir Oracle → **Evidence & validation**.

Attendu :
1. aucune erreur `serialized value is too large`;
2. Explorer reconstruit ;
3. Oracle Lab / Integrity ne retombent plus sur des zéros de fallback liés à l'échec de lecture ;
4. compteur Evidence non réinitialisé ;
5. aucune suppression de données.

## Protection

Market Core 38.15.11 intact. Strategy A, profil Solo Progression 1 000 €, gates, Risk, PAPER, Atlas CURRENT et Oracle Math intacts.

## Suite

Une fois .481 terrain PASS : préparer séparément le stockage tiered navigateur chaud + GitHub froid. Ne pas purger IndexedDB avant preuve d'archivage vérifiée.
