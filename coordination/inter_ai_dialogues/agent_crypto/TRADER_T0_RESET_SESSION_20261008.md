# Trader — RESET de séance T0 sans suppression (8 octobre 2026)

D : fermer une séance de test en une capture et permettre une nouvelle observation, sans faire croire que la certification de tout l'historique est nécessaire pour recommencer.

Le nouveau bouton « RESET · nouvelle séance » du bloc T0 vide uniquement le rapport courant et enregistre en **mémoire volatile** le compteur de référence des lignes Experiment et After-cost et l'actif sélectionné. Le T0 suivant indique les deux variations brutes et le nombre de captures de la séance. Un rechargement Firefox fait perdre la séance ; aucun stockage ni aucune archive n'est supprimé.

Ce RESET ne purge pas les 1760 anciens cycles Experiment ni les 13 lignes After-cost, n'efface pas IndexedDB, n'invente pas les dates manquantes, ni les coûts de spread/slippage. G1, les propriétaires canoniques, le gouverneur, les permissions Paper et toutes les limites restent identiques. Si la matrice affiche FOUNDATION_PASS pour G2/G7 mais que la preuve de fondation courante n'est pas démontrée, le rapport indique la divergence sans changer le gate.

Fichiers runtime modifiés : trader-paper-t0.js (UI et séance en mémoire), trader-runtime-mirror.js (cache-bust du même script). Aucun moteur de graphique, carnet, Bridge, code de trading, build ou Market Core modifié. Trader 40.6.624 / Market Core 38.15.11.

Preuve de recette : syntaxe des deux JS, test du bouton, compteurs de départ 1760 et 13 non effacés, deux resets successifs. Livraison = commit GitHub main, ZIP compact, déploiement Pages vérifié, relève Notion. Une seule capture de terrain facultative suffit si le bouton est bien visible.
