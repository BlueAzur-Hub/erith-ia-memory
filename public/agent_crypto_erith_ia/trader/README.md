# ERITH.IA Trading Desk — 40.6.581

## Statut
Interface fidelity pass du Trader. Même application Agent-Crypto, même page `trading-desk.html`, toujours READ ONLY.

## Ce que 40.6.581 corrige
- **Menu haut** : reprend la grammaire visuelle Administrator mais reste limité au Trader. Aucun fil Aether, Atlas, Oracle, Veille, Sources, Decision Board ou Command Center.
- **Navigation** : Marché · Graphique · Lecture · Profondeur · Math Core, avec PAIR / SPOT / PERP / READ ONLY / retour Administrator.
- **Graphique** : remet le cockpit visuel autour du propriétaire Bougies existant : Marché Crypto, Afficher (Volume / Légende / Analyse / Fiche / Profondeur), Affichage EUR/USD ; le propriétaire Bougies conserve et injecte ses contrôles MICROSCOPE Ligne/Bougies et ses indicateurs/intervalles.
- **Fiche Market** : restitution d’une vraie Fiche Crypto flottante/latérale liée à l’actif sélectionné dans Market, avec prix, source, 24 h, 7 j, 30 j si disponible, vol/cap, capitalisation, volume 24 h, score Math/Atlas disponible et décision de consultation.
- **Market et Math Core** : structures 40.6.580 conservées ; palette Math rouge/orange/turquoise/vert inchangée.
- **Lecture Technique / Profondeur** : propriétaires existants conservés ; aucun changement métier.

## Protections
- Administrator **40.6.571** inchangé.
- Market Core **38.15.11** inchangé.
- Candles owner inchangé.
- Depth owner inchangé.
- Lecture Technique 40.6.580 inchangée.
- Math Core transpose 40.6.580 inchangé.
- Architecture EUR/USD inchangée.
- Aucun ordre réel, aucune clé privée, aucun thread Aether.

## Stop Gate
Validation statique via PR/CI avant merge. Terrain Firefox 40.6.581 : **PENDING CHRISTOPHE**.

Après PASS terrain : geler le squelette Trader avant toute phase OKX privé READ ONLY.
