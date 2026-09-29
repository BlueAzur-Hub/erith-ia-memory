# HANDOFF — Agent-Crypto 40.6.477

## Objet unique

Réparer le chargement initial de l'image **Lecture Technique** sans toucher au reste du runtime.

## Firefox opérateur

1. Ctrl+F5.
2. Vérifier **Build 40.6.477 · Administrator**.
3. Test A — Lecture Technique ouverte au démarrage : l'image doit apparaître sans clic AUTO/RND.
4. Test B — replier Lecture Technique, démarrer avec cache froid, puis ouvrir : l'image doit charger à l'ouverture.
5. Test C — ouvrir pendant la lecture asynchrone du cache : une seule reprise est autorisée et l'image doit apparaître.
6. Vérifier AUTO puis RND.
7. Si une image privée est utilisée, vérifier qu'elle reste prioritaire et fonctionnelle.
8. Observer séparément la stabilité Firefox / Transformer Book : cette version ne prétend pas corriger le plantage global.

## Invariants

- réseau différé tant que le panneau reste replié ;
- aucun préchargement de la bibliothèque complète ;
- aucun nouveau timer ;
- aucun nouvel observer ;
- Strategy A inchangée ;
- Aether / Redivider inchangés ;
- Market Core **38.15.11** intact ;
- aucun ordre réel.
