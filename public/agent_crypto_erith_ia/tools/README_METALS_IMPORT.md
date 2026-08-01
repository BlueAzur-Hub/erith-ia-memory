# ERITH.IA — Import local d’un snapshot Métaux

Cet outil publie un JSON déjà obtenu depuis une source réelle dans
l’archive Métaux séparée.

Il ne contacte aucun fournisseur, ne demande aucune clé et refuse les
champs ressemblant à une clé, un token, un secret ou un mot de passe.

## Fichiers écrits

- `data/metals/latest.json`
- `data/metals/status.json`
- `data/metals/history/YYYY-MM-DD.jsonl`
- `data/metals/history/index.json`

## Préparation

Copier `data/metals/import_template.json` vers un fichier local, par
exemple `metals_snapshot_real.json`, puis remplir uniquement avec des
valeurs réellement reçues.

Ne jamais ajouter de clé API dans ce fichier.

## Validation

```text
python tools/metals_snapshot_ingest.py --input metals_snapshot_real.json --root public/agent_crypto_erith_ia --dry-run
```

## Publication

```text
python tools/metals_snapshot_ingest.py --input metals_snapshot_real.json --root public/agent_crypto_erith_ia
```

Le panier XAU, XAG, XPT, XPD et HG est exigé par défaut.
L’option `--allow-partial` doit être explicitement ajoutée pour un panier
incomplet.

## Verrous

- aucune absence n’est transformée en zéro ;
- aucune donnée Crypto n’alimente les Métaux ;
- un snapshot identique n’est pas ajouté deux fois ;
- un snapshot unique alimente le Market mais ne crée pas de courbe ;
- aucune collecte fournisseur n’est exécutée par la page publique.
