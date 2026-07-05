# Charlene Salon — V1 métier locale

## Ce qui est livré

Application HTML/CSS/JavaScript autonome destinée à être publiée sous :

```text
assets/CHARLENE_SALON/
```

Fonctions incluses :

- parcours de projet et plan d’ouverture ;
- comparaison de locaux avec grille pondérée ;
- carte de prestations avec durée, coût produit, marge et marge horaire ;
- budget de démarrage et charges mensuelles ;
- lecture du seuil de chiffre d’affaires à partir des hypothèses saisies ;
- routines d’ouverture et fermeture ;
- planning interne sans données clientes ;
- suivi de stock, seuils et liste de réapprovisionnement préparatoire ;
- registre de décisions ;
- export/import JSON, impression et réinitialisation locale ;
- exemple de démonstration effaçable ;
- interface responsive ordinateur et mobile.

## Règle de données

L’application n’emploie aucune API, aucune clé, aucun token et aucun serveur applicatif. Les données sont stockées dans le navigateur de l’appareil via `localStorage`.

Ne pas y enregistrer de données clientes nominatives, données bancaires, données de santé, documents RH, contrats ou secrets.

## Publication

1. Décompresser l’archive.
2. Remplacer intégralement le dossier public existant :
   ```text
   assets/CHARLENE_SALON/
   ```
3. Utiliser le texte du fichier `COMMIT_MESSAGE.txt` comme message de commit.
4. Attendre la publication GitHub Pages, puis ouvrir l’URL publique habituelle.
5. Tester : ajout d’une prestation, d’une ligne de budget, export JSON, puis import JSON.

## Statut de livraison

Cette archive a été construite hors dépôt. Elle ne correspond à aucun commit GitHub tant qu’elle n’a pas été téléversée et validée dans le dépôt public.
