# Source Catalog v1 — source générique locale

Une nouvelle source historique certifiée peut être consommée sans modifier la liste Python BTC/ETH en utilisant :

```text
workspace/
└── catalog_sources/
    └── CAT_SOLUSDT_2024_1H_CERTIFIED/
        ├── manifest.json
        └── bars.csv
```

`bars.csv` utilise les colonnes déjà comprises par Seven :

```csv
timestamp,open,high,low,close,volume
```

Exemple de manifeste :

```json
{
  "schema": "seven.source_catalog.dataset.v1",
  "id": "CAT_SOLUSDT_2024_1H_CERTIFIED",
  "exchange": "Certified Research Corpus",
  "pair": "SOL/USDT",
  "base": "SOL",
  "quote": "USDT",
  "source_timeframe": "1h",
  "available_timeframes": ["1h", "4h"],
  "rows": 8784,
  "first_utc": "2024-01-01T00:00:00+00:00",
  "last_utc": "2024-12-31T23:00:00+00:00",
  "close_boundary_utc": "2025-01-01T00:00:00+00:00",
  "stored_csv_sha256": "<64 caractères hexadécimaux>",
  "certification": "SHA256_CONTIGUOUS_CERTIFIED_CORPUS"
}
```

## Garde-fous

- `source_id` borné et sans chemin arbitraire ;
- CSV obligatoirement situé sous le namespace dédié ;
- SHA-256 recalculé avant lecture ;
- continuité temporelle vérifiée par `load_bars` ;
- nombre de bougies borné ;
- aucun chemin absolu privé exposé par l'API ;
- aucune clé de compte ;
- aucun ordre réel.

Le catalogue rend les **sources disponibles** dynamiques. Il ne certifie pas lui-même la provenance d'un corpus : la chaîne de certification doit être établie avant installation du manifeste.
