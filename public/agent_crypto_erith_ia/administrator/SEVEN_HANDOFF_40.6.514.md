# Seven Handoff — Agent-Crypto 40.6.514

## État

Parent **40.6.513** : validé terrain par Christophe le 3 octobre 2026.

40.6.514 est la couche suivante :

**USD DEFAULT · OKX MULTI-QUOTE · CT NEW LISTING**

## Ce qui change

- USD devient la devise d'affichage par défaut.
- EUR reste disponible immédiatement.
- Le Graphique utilise un historique USD direct et un cache par devise.
- Market / Market Flow / Fiche / Lecture Technique reçoivent les valeurs USD directes disponibles.
- Oracle affiche le prix en USD sans modifier son moteur de scénario.
- Microscope et Profondeur utilisent BASE-USDC sous DISPLAY USD.
- Profondeur utilise BASE-EUR sous DISPLAY EUR.
- Le transport local propage AbortSignal.
- CT / Concrete obtient une voie New Listing explicite.

## Ce qui ne change pas

- Market Core 38.15.11.
- Strategy A / Cost Gate.
- Aether.
- Web Classique.
- Backend 1.4.4 et Bridge 1.9.13 comme contrats protégés.
- Géométrie du dock Profondeur validée 40.6.513.
- Aucune API privée.
- Aucun wallet.
- Aucun ordre réel.

## CT

CT n'est pas forcé dans le Top 250/1000.

La source Market native dédiée est OKX public `CT-USDC`.

Accès opérateur :

```text
Market -> Nouveaux · CT
ou
Recherche -> CT -> Entrée
```

Puis :

- Sélectionner
- Bougies
- Profondeur
- lien OKX

## Prochaine preuve

Firefox Ryzen est l'autorité terrain.

Si PASS :

- geler la couche USD/USDC ;
- poursuivre l'audit de couverture résiduelle USD, notamment les panneaux moins visibles et les données Extended.

Si FAIL :

- identifier une seule surface ;
- corriger uniquement son propriétaire ;
- ne pas toucher au Market Core ni au dock Profondeur 40.6.513.

## Packaging

40.6.514 livre un **PATCH ONLY**.

Aucun ZIP du répertoire Administrator complet.
