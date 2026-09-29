# Agent-Crypto 40.6.478 — PROSPECTIVE TERMINAL RECORD WRITE GUARD

## Défaut démontré

Dans le collecteur prospectif .476/.477, chaque nouveau cycle parcourait tous les dossiers et appelait `applySample()`.

Même lorsqu'un dossier avait déjà T+5, T+15 et T+60 tous terminaux, `addObservation()` s'exécutait avant la vérification des horizons. Un cycle tardif pouvait donc signaler un changement puis déclencher une écriture IndexedDB sans nouvelle preuve utile.

## Correction bornée

40.6.478 ajoute une seule règle :

> si T+5, T+15 et T+60 sont tous `CAPTURED` ou `MISSED_WINDOW`, le dossier est terminal et `applySample()` retourne immédiatement `false`.

Conséquences :
- aucune observation post-terminale ;
- aucune réécriture IndexedDB post-terminale ;
- `updated_at` du dossier terminé ne bouge plus ;
- les dossiers encore PENDING continuent de progresser normalement ;
- les fenêtres tardives restent `MISSED_WINDOW`.

## Invariants

Aucun changement des horizons 5/15/60 min, tolérance, Cost Gate, seuils, décision Strategy A, capture OKX T0, Oracle, Risk, PAPER, schéma IndexedDB ou Market Core 38.15.11.

Lecture Technique .477 est héritée sans modification.

Aucun ordre réel.
