# Pages historiques Seven Heaven — Optimisation F11
Deux pages préexistantes restent fonctionnellement inchangées : `historical-inventory.html` (R1) et `historical-archive-reader.html` (R3).
CSS partagé `historical-f11.css` : fond sobre, espace utile augmenté, grille métriques en 5 colonnes, tableaux plus lisibles, modes F11 et fenêtre normale, breakpoint mobile.
L'inventaire R1 replie le tableau complet des 80 historiques par défaut, sans en supprimer le contenu. Le bas des deux pages passe sur deux colonnes en grand écran. Les contrôles `Analyser`, `Vérifier l'archive` et `Copier le rapport` conservent leurs identifiants et leur script inchangé.
Tests statiques JS PASS. Validation visuelle/Firefox/F11 reste à faire côté utilisateur. Aucun accès écriture IndexedDB, aucune mutation des moteurs.
