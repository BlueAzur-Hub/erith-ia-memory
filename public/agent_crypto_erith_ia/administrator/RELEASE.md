# Agent-Crypto 40.6.475 — PROSPECTIVE CAPTURE PLUMBING PROOF

## Point de départ

40.6.474 est visible et **ARMED**, mais aucun nouveau COST_GATE_WAIT n'a été produit pendant la fenêtre de test terrain. Le compteur historique `Cost waits` est resté à 65 alors qu'Auto A continuait à produire des cycles.

Le but de .475 n'est donc pas de changer Strategy A : il est de prouver et rendre observable la plomberie de capture sans attendre le marché.

## Correction bornée

Propriétaire unique :
`js/strategy-a-prospective-outcome-evidence-capture.js`

L'événement `agent-crypto:strategy-a-experiment-cycle` de .454 est volontairement partiel. Il contient l'identité du cycle mais pas `market.price_eur`.

40.6.475 :
1. lit le `cycle_id` de l'événement ;
2. résout **ce cycle exact** dans l'Experiment Ledger ;
3. n'utilise plus silencieusement le dernier cycle si l'ID demandé manque ;
4. échoue alors en `EVENT_CYCLE_NOT_FOUND_IN_LEDGER:<id>` ;
5. expose la plomberie dans le panneau : événements reçus, dernier event, cycle résolu, mode de résolution et dernière erreur.

## Harness isolé

Le workflow .475 simule :
- un événement partiel visant un COST_GATE_WAIT plus ancien alors qu'un cycle plus récent existe déjà ;
- la résolution exacte `LEDGER_BY_ID` ;
- l'écriture dans le store `meta` de l'IndexedDB durable existant ;
- une mesure OKX T0 factice via l'owner Execution Cost Truth ;
- un échantillon T+5 ;
- un ID absent qui doit échouer fermé sans prendre le dernier cycle.

## Invariants

Aucun changement de seuil, Cost Gate, Oracle, Risk, PAPER, cadence Auto A, Market Core 38.15.11, schéma IndexedDB ou ordre réel.

Le préfixe durable `prospective_outcome_474:` est conservé afin de ne pas abandonner d'éventuelles preuves .474 déjà écrites.
