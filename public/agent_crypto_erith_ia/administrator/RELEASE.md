# Agent-Crypto 40.6.448 — HTML DOCUMENT STRUCTURE RECOVERY

## Problème corrigé
Deux insertions HTML .446/.447 contenaient trois séquences littérales antislash+n au lieu de retours à la ligne. Deux apparaissaient avant le header ; le parseur fermait prématurément HEAD.

## Correction bornée
- Remplacement des trois séquences uniquement dans les deux insertions de balisage identifiées.
- Restauration du HEAD et suppression des nœuds texte parasites.
- Identité de document, manifeste et aria-label cohérents en 40.6.448.
- Entrée canonique index.html et copie de livraison index-40.6.448.html identiques.
- Aucun changement de fichier CSS ou JavaScript externe ; URLs et ordre des ressources inchangés.
- Backend .441, cadrage .442, métriques Oracle .445, loader .446 et lisibilité .447 conservés.

## Preuves
HTML_STRUCTURE_TEST_40.6.448.json : Firefox isolé, DOM du document complet et rendu sans scripts métier/réseau, à 1920×920, 1920×1080 et 1280×720. Aucun texte parasite ; feuille de lisibilité dans HEAD. 655 IDs, 44 scripts externes, 32 liens et 58 styles inline préservés. Syntaxe de 19 scripts inline vérifiée. Garde canonique Version Truth : PASS.

Ces contrôles ne constituent pas une validation du runtime local de Christophe. La typographie fine Strategy et les autres dettes de l’audit .447 restent distinctes.

## Protection
Market Core 38.15.11, Web Classic, Aether, Oracle, Atlas CURRENT, Lecture Technique, Strategy, Risk, Paper, Window Manager, données et stockage inchangés.
