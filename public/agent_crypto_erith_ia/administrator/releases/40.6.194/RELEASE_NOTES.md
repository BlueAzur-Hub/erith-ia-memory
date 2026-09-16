# Agent-Crypto 40.6.194 — G3 T0 Decision Proof

Parent: 40.6.193

## Objectif
Produire la première preuve de décision Strategy A connue à **t0** sans appliquer l'Oracle actuel au passé et sans mélanger un résultat futur au signal initial. Une décision `NO_TRADE` est une observation valide.

## Nouveau propriétaire
- `js/strategy-a-g3-t0-decision-proof.js`
- Source lue : `AgentCryptoStrategyAExperimentLedger.read()` uniquement.
- Projection prospective : identifiant, actif/paire/devise, temps marché, temps de disponibilité, temps de décision, décision/motif, versions enregistrées et entrées Strategy A réellement présentes dans la ligne.
- Les champs futurs (`closed_at`, outcome, PnL, prix de sortie, post-current, etc.) sont exclus de la projection t0 et n'entrent pas dans son empreinte.
- Une version Strategy/Policy absente dans la ligne historique reste absente : le build runtime courant n'est jamais utilisé pour la compléter.

## États
- `INCOMPLETE` : la ligne ne permet pas encore une preuve t0 traçable.
- `TRACEABLE_CANDIDATE` : ID + actif + décision + temps de décision/disponibilité sont présents.
- `CERTIFIED_T0_ROW` : en plus, temps marché antérieur ou égal à la disponibilité, versions Strategy/Policy enregistrées, et toutes les entrées nécessaires au replay sont présentes.

Une première ligne certifiée **prouve le raccord**, pas Gate 3 entière. Gate 3 reste `PENDING`.

## Self-test local
- `NO_TRADE` complet peut produire une ligne t0 certifiée : PASS.
- temps décision/disponibilité manquant : rejeté.
- PnL/`closed_at` futurs : exclus.
- ajouter un résultat futur ne change pas l'empreinte t0 : PASS.
- `saved_at` n'est jamais promu en temps de marché : PASS.
- build runtime courant ne remplit jamais une version Strategy/Policy historique absente : PASS.

## Intégration
- Le canonical Administrator charge maintenant le propriétaire t0 explicitement.
- Evidence Dossier Single-Owner passe de 3 à 4 panneaux structurés et monte le panneau `G3 · T0 DECISION PROOF` dans le dossier existant.
- Aucun correcteur de badge post-rendu, aucun listener autonome, timer, observer ou stockage supplémentaire.

## Protégé
- Market Core 38.15.11 inchangé.
- Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique et TRADUS inchangés.
- Aucun seuil de trading Strategy A changé.
- Aucun ordre réel, wallet, credentials ou appel exchange ajouté.
- PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain Firefox
1. Recharger Administrator jusqu'à `Build 40.6.194 · Administrator`.
2. Dans Evidence Dossier, vérifier `4 / 4 PANNEAUX` si les quatre API sont disponibles.
3. Vérifier `G3 · T0 DECISION PROOF` : les cycles existants doivent apparaître comme `TRACEABLE_CANDIDATE`, `CERTIFIED_T0_ROW` ou `INCOMPLETE` avec les manques explicités.
4. Ne pas forcer un PASS si les anciennes lignes n'enregistrent pas les versions/temps/entrées nécessaires ; ces manques deviennent précisément le contrat de capture prospective à corriger.
5. Étape suivante : assembler ces lignes t0 avec la série marché 40.6.193 dans un dataset immuable de replay, puis exécuter le replay historique sans fuite du futur.
