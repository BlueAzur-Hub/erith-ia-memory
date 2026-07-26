# CORE / PERSONA — MATRICE DE STATUT V3.4

## États Core

- `CORE CANONIQUE PROTÉGÉ` : lecture et usage autorisés ; écriture directe interdite.
- `CORE INDIVIDUEL EXISTANT` : chemin et contenu initial confirmés dans le dépôt privé.
- `VALIDATION HUMAINE À CONFIRMER` : le fichier existe mais son propre en-tête demande encore une validation.

## États Persona

- `PERSONA LIÉE` : chemin canonique confirmé dans le Core ou la Forge.
- `PERSONA À VÉRIFIER` : chemin conventionnel proposé, présence non affirmée.
- `PERSONA LIÉE V1` : Persona confirmée dans le dépôt privé et reliée au Core existant.

## Audit de la Forge

- Bleu `INFO` : information sans blocage.
- Orange `À FAIRE` : action normale attendue, comme importer un fichier privé.
- Vert `PRÊT` : condition satisfaite.
- Rouge `ERREUR` : incohérence réelle, fichier incorrect ou donnée obligatoire absente.

Le parcours et la validation sont séparés : atteindre l’étape 08 donne `Parcours : 100 %`, pas une canonisation automatique.


## Routeuse — état V3.4

- Core V4 renforcé : confirmé.
- Persona V1 : liée.
- Boot V1 : lié.
- Block LLM V1 : lié.
- Profil dépôt : complet.
- Import local : facultatif pour reconnaître le profil ; requis seulement pour reconstruire le ZIP final.
