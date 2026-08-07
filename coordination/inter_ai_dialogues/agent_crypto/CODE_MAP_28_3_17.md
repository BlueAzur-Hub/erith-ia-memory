# Agent-Crypto — Build 28.3.17 — Carte humaine du code

La navigation se fait avec `Ctrl+F` sur le numéro ou le titre du bloc.

| Bloc | Zone |
|---|---|
| 00 | Global / configuration / outils partagés |
| 01 | Header / Menu |
| 02 | Graphique |
| 03 | Target Top 5 |
| 04 | Market Flow |
| 05 | Market |
| 06 | Math Core |
| 07 | News Sentinel |
| 08 | Decision / Watchlist / Analyse |
| 09 | Parcours / Apprentissage |
| 10 | Simulation Cockpit |
| 11 | Métaux |
| 12 | Mémoire / Persistance |
| 13 | Sources / Bridge / Collecte |
| 14 | Version Control — Protected Core |
| 15 | Initialisation / Wiring |

## Règle de maintenance

Une mission sur un bloc ne modifie pas les autres blocs sans dépendance explicitement démontrée. Une zone validée devient canonique. Les corrections chronologiques de Build ne doivent plus être empilées en fin de fichier : le comportement final appartient au bloc fonctionnel concerné.

## Correspondance

Les blocs principaux 01 à 06 utilisent les mêmes numéros et titres dans `index.html`, `style.css` et `app.js`. Les zones complexes ou imbriquées du HTML utilisent des sous-blocs (`11.A`, `12.B`, etc.) sans changer la hiérarchie DOM validée.
