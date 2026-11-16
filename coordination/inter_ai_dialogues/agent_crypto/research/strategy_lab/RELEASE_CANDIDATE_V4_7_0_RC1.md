# Seven Heaven Strategy Lab — V4.7.0-RC1

Release candidate du 16 novembre 2026.

## Objet

Introduire Donchian 55/20 comme famille native auditable dans le Strategy Lab, à partir du travail validé et mergé par la PR #772.

## Contrat Donchian natif

- entrée par clôture au-dessus du plus haut des 55 bougies précédentes ;
- sortie par clôture sous le plus bas des 20 bougies précédentes ;
- la bougie signal est exclue du canal causal ;
- le fill PAPER reste placé à l'ouverture de la bougie suivante ;
- aucun effet de levier, emprunt, clé privée ou ordre réel ;
- paramètres d'entrée/sortie visibles dans l'Atelier ;
- signal_context disponible pour Aether Forensics ;
- intégration au Comparateur comme septième référence ;
- Aether Scientific rejoue Donchian sans optimisation automatique de périodes ;
- Aether Research filtres reste réservé aux familles EMA/personnalisées.

## Validation requise pour cette RC

La RC n'est publiable comme candidate que si le même commit passe :

- suite Python complète sur Linux ;
- suite Python complète sur Windows Python 3.13 ;
- démarrage réel via le lanceur Windows .cmd ;
- smoke public OKX ;
- test de parité financière avec tools/experimental_donchian.py ;
- génération d'une archive sans workspace/ ni cache Python ;
- SHA-256 joint à l'archive.

## Statut

V4.6.2 reste la release stable installée tant qu'une validation propriétaire distincte n'autorise pas la publication stable et l'installation de V4.7.

PAPER ONLY.
