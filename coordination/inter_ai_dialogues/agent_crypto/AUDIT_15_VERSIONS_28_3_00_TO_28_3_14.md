# Audit des 15 versions — Builds 28.3.00 à 28.3.14

## Verdict

- Les 15 archives canoniques ont une identité interne cohérente : **oui**.
- Le bloc de version est resté identique de 28.3.00 à 28.3.13 après normalisation des numéros.
- La rupture n’est pas une corruption progressive des quinze archives : elle commence avec la republication postérieure de deux fichiers sous la même identité 28.3.13.
- La première archive 28.3.15 livrée ensuite est invalide : elle remplace l’application racine par un pont et déplace le runtime, alors qu’une correction bornée était demandée.

## Contrôles par version

| Build | Identité 4 fichiers | JS | IDs HTML | Bloc version normalisé |
|---|---:|---:|---:|---|
| 28.3.00 | OK | OK | OK | `118a5aa42490` |
| 28.3.01 | OK | OK | OK | `118a5aa42490` |
| 28.3.02 | OK | OK | OK | `118a5aa42490` |
| 28.3.03 | OK | OK | OK | `118a5aa42490` |
| 28.3.04 | OK | OK | OK | `118a5aa42490` |
| 28.3.05 | OK | OK | OK | `118a5aa42490` |
| 28.3.06 | OK | OK | OK | `118a5aa42490` |
| 28.3.07 | OK | OK | OK | `118a5aa42490` |
| 28.3.08 | OK | OK | OK | `118a5aa42490` |
| 28.3.09 | OK | OK | OK | `118a5aa42490` |
| 28.3.10 | OK | OK | OK | `118a5aa42490` |
| 28.3.11 | OK | OK | OK | `118a5aa42490` |
| 28.3.12 | OK | OK | OK | `118a5aa42490` |
| 28.3.13 | OK | OK | OK | `118a5aa42490` |
| 28.3.14 | OK | OK | OK | `b334e0378ea3` |

## Groupes du bloc de version

- `118a5aa424907eeb` : 28.3.00, 28.3.01, 28.3.02, 28.3.03, 28.3.04, 28.3.05, 28.3.06, 28.3.07, 28.3.08, 28.3.09, 28.3.10, 28.3.11, 28.3.12, 28.3.13
- `b334e0378ea30352` : 28.3.14

## Incident 28.3.13

- Numéro de Build identique : **True**.
- Token identique : **True**.
- Diff `index.html` : +6 / -6 lignes.
- Diff `app.js` : +2 / -2 lignes.
- `style.css` et `version.json` inchangés : True.

C’est la violation centrale : du contenu public différent a été publié sous le même Build et le même token.

## Invalidation de la première 28.3.15

- `index.html` racine : 3954 → 35 lignes.
- `app.js` racine : 34692 → 127 lignes.
- Nouveau répertoire non demandé : `web/releases/28.3.15/`.
- Le test supprimait les vraies balises de ressources et injectait CSS/JS ; il ne pouvait donc pas valider leurs chemins réels.
- Le test de version future remplaçait le vérificateur de publication par une réponse toujours valide.
- Deux chemins CSS déplacés ont produit des 404 dans le contrôle navigateur.

**Cette archive ne doit pas être publiée.**

## Limite

Le test Firefox natif sur le profil réel reste extérieur à cet audit. Aucun résultat contrôlé ne doit être présenté comme une preuve Firefox.
