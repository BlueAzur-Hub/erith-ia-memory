"""Reuse previously materialized immutable annual hourly shards.

Prior source-month identities and counts must match exactly. The stored gzip
checksum must match its SHA-256, otherwise fall back to source ZIP re-import.
Never interpolates or invents candles.
"""
from pathlib import Path
import re

_SAFE_NAME = re.compile(r'^[a-z0-9-]+-\d{4}-span\d+-[a-f0-9]{64}\.json\.gz$')


def reuse(group, previous_asset, published_folder, digest):
    """Return (file, compressed_bytes, metadata) only for identical source months."""
    if not isinstance(previous_asset, dict) or not isinstance(previous_asset.get('shards'), list):
        return None
    sources = group['source_months']
    for shard in previous_asset['shards']:
        if not isinstance(shard, dict) or (shard.get('year'), shard.get('span')) != (group['year'], group['span']):
            continue
        old_sources = shard.get('source_months')
        if not isinstance(old_sources, list) or len(old_sources) != len(sources) or not sources:
            continue
        if any(not isinstance(prev, dict) or
               prev.get('month') != cur.get('month') or
               prev.get('release') != cur.get('release') or
               prev.get('source_zip_sha256') != cur.get('sha256') or
               prev.get('native_1m_count') != cur.get('candles')
               for prev, cur in zip(old_sources, sources)):
            continue
        name = shard.get('file')
        sha = shard.get('sha256')
        if (not isinstance(name, str) or not _SAFE_NAME.fullmatch(name) or
            not isinstance(sha, str) or not re.fullmatch('[a-f0-9]{64}', sha) or
            not name.endswith('-' + sha + '.json.gz')):
            continue
        candidate = Path(published_folder) / name
        if not candidate.is_file():
            continue
        data = candidate.read_bytes()
        if digest(data) != sha or len(data) != shard.get('bytes'):
            continue
        return name, data, dict(shard)
    return None
