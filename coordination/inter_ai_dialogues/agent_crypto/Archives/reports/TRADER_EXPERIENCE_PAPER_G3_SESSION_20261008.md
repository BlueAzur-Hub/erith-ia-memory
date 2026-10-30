# Trader — véritable séance prospective Strategy A Paper · 8 octobre 2026

## Demande
« Un bouton reset pour recommencer cette expérience » = ouvrir une nouvelle expérience Strategy A Paper. Ne pas confondre la capture T0 de qualité du marché avec une décision prospective G3.

## Trois actions finies
1. « Nouvelle expérience Paper · RESET » : ouvre une séance en mémoire volatile, identifiée par l'heure et l'actif. Enregistre les références Experiment / After-cost et G3 disponibles. **Aucun tick Auto A, aucun ordre, aucun effacement**.
2. « Capturer 1 cycle Paper » : UNIQUEMENT au clic de l'opérateur, charge au besoin le seul module propriétaire existant `strategy-a-g3-prospective-t0-capture.js` et appelle une fois sa méthode canonique `capture_once()`. Cette méthode peut provoquer un `runner.tick()` local et persister une nouvelle preuve prospective ; les gardes du propriétaire restent pleinement actifs. Une séance = une tentative, que cette tentative soit bloquée ou aboutisse. Aucune promotion de gate. Le module retourne un ID ou un blocage authentique.
3. « Terminer la séance » : clôture l'observation en mémoire et garde un bilan (statut, ID, différence du nombre de preuves G3, motif de blocage). Aucune suppression, aucun nouveau cycle.

## Vérités et protections
Aucune modification des propriétaires G3, Strategy A Safety, gouverneur, after-cost, moteur d'ordres, Market Core 38.15.11 ou Bridge. Trader 40.6.624 inchangé. La capture T0 qualité du marché existante reste une action distincte. Les 1760 anciens cycles Experiment, 13 lignes After-cost et trois dates manquantes ne sont ni vidés ni certifiés. G1 EVIDENCE_REQUIRED, G9 LOCKED et toute autorisation Paper restent sous contrôle canonique. Le résultat peut être AUTO_A_NOT_ACTIVE ou absence de nouveau cycle ; c'est un résultat bloqué, non un échec du bouton. Le RESET ne promet ni profitability, ni trade, ni simulation valide.

## Tests de précommit
Deux scripts JS parsés, simulation d'une séance réussie (un seul capture_once, ID C-1), une deuxième tentative refusée, une séance bloquée AUTO_A_NOT_ACTIVE, archives non touchées et clôture unique.

## Livraison
Commit main atomique, ZIP compact à trois fichiers (deux scripts + notice), suivi de vérification CI/Pages et mise à jour des Bureaux Notion. Une fois la publication réussie : une seule vérification Firefox de présence des trois boutons puis d'une séance. Ne pas répéter 20 tests.
