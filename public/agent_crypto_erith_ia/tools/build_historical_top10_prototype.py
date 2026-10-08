#!/usr/bin/env python3
"""Prototype Top 10 : archive de relevés MARKET existants, sans accès réseau.
Lecture : data/history/*.jsonl. Écriture uniquement dans --output-dir.
NE PRODUIT PAS de chandelles OHLCV à partir de snapshots.
"""
import argparse
import gzip
import hashlib
import json
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HISTORY = ROOT / "data" / "history"

def build(through: date, days: int):
    if not 1 <= days <= 31:
        raise ValueError("days doit être compris entre 1 et 31")
    dates = [(through - timedelta(days=i)).isoformat() for i in range(days - 1, -1, -1)]
    source_files = []
    records = []
    for day in dates:
        path = HISTORY / (day + ".jsonl")
        if not path.is_file():
            raise FileNotFoundError(path)
        raw = path.read_bytes()
        rows = [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]
        if not rows:
            raise ValueError("archive vide : " + day)
        for row in rows:
            if (row.get("schema") != "atlas_market_snapshot_top50_v1"
                    or row.get("live_ok") is not True or not isinstance(row.get("assets"), list)):
                raise ValueError("relevé non qualifié : " + day)
        source_files.append({"path": "data/history/" + day + ".jsonl",
                             "bytes": len(raw), "records": len(rows),
                             "sha256": hashlib.sha256(raw).hexdigest()})
        records.extend((day + ".jsonl", row) for row in rows)
    records.sort(key=lambda item: item[1]["saved_at"])
    anchor = records[-1][1]
    chosen = sorted((asset for asset in anchor["assets"]
                     if isinstance(asset.get("rank"), int) and 1 <= asset["rank"] <= 10),
                    key=lambda asset: asset["rank"])
    if len(chosen) != 10 or len({a["id"] for a in chosen}) != 10:
        raise ValueError("Core 10 non qualifié")
    assets = [{"id": a["id"], "symbol": a["symbol"], "name": a["name"],
               "rank_at_reference": a["rank"]} for a in chosen]
    observations = []
    seen = set()
    for filename, snap in records:
        identity = snap["snapshot_id"]
        if identity in seen:
            raise ValueError("doublon snapshot " + identity)
        seen.add(identity)
        lookup = {a["id"]: a for a in snap["assets"]}
        prices = []
        for coin in assets:
            row = lookup.get(coin["id"])
            if not row:
                raise ValueError("prix absent " + coin["id"] + " / " + identity)
            price = [row.get("price_eur"), row.get("price_usd"),
                     row.get("change_24h_pct"), row.get("volume_24h_eur"), row.get("rank")]
            if any(x is None or not isinstance(x, (int, float)) for x in price):
                raise ValueError("donnée manquante " + coin["id"])
            if price[0] <= 0 or price[1] <= 0 or price[3] < 0:
                raise ValueError("prix/volume incohérent " + coin["id"])
            prices.append(price)
        observations.append({"t": snap["saved_at"], "snapshot_id": identity,
                             "source_file": filename, "prices": prices})
    archive = {"schema": "aerith.market.top10.observations.v1",
               "kind": "irregular_snapshot_observations_not_OHLCV",
               "reference": anchor["snapshot_id"],
               "scope": "fixed_top10_by_market_cap_at_reference",
               "source": "CoinGecko via existing atlas_market_collector snapshots",
               "quote_currencies": ["EUR", "USD"],
               "columns": ["price_eur", "price_usd", "change_24h_pct",
                           "volume_24h_eur", "rank_at_snapshot"],
               "window": {"first": observations[0]["t"], "last": observations[-1]["t"]},
               "assets": assets, "observations": observations}
    return archive, source_files

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--through", default="2026-10-07")
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    archive, sources = build(date.fromisoformat(args.through), args.days)
    out = args.output_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)
    raw = (json.dumps(archive, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    (out / "observations.json").write_bytes(raw)
    with (out / "observations.json.gz").open("wb") as f:
        with gzip.GzipFile(filename="", mode="wb", fileobj=f, mtime=0, compresslevel=9) as gz:
            gz.write(raw)
    zipped = (out / "observations.json.gz").stat().st_size
    result = {"schema": "aerith.market.top10.archive_measurement.v1",
              "reference": archive["reference"],
              "observations": len(archive["observations"]),
              "asset_count": len(archive["assets"]),
              "price_records": len(archive["observations"]) * len(archive["assets"]),
              "source_bytes": sum(s["bytes"] for s in sources),
              "json_bytes": len(raw), "gzip_bytes": zipped,
              "gzip_ratio": round(zipped / len(raw), 4),
              "source_provenance": sources,
              "note": "Snapshots de marché irréguliers, PAS des chandelles OHLCV."}
    (out / "measurement.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "source_provenance"}, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
