import tempfile
from pathlib import Path
import pytest
from src.historical_bundle_v3 import BUNDLE_ROOT, _manifest, install_from_bundle
from src.historical_vault_v1 import source_id

DATASETS=_manifest()['datasets']
ALL_PRESENT=all((BUNDLE_ROOT/d['filename']).is_file() for d in DATASETS)

@pytest.mark.skipif(not ALL_PRESENT, reason='CI/final package only: canonical shards injected from shared vault')
def test_all_ten_annual_shards_validate_and_install():
    with tempfile.TemporaryDirectory() as td:
        workspace=Path(td)
        for d in DATASETS:
            manifest=install_from_bundle(workspace,d['symbol'],d['year'],source_id(d['symbol'],d['year']))
            assert manifest['rows']==d['rows']
            assert manifest['historical_vault']['annual_shard_sha256']==d['sha256']
            assert manifest['historical_vault']['source_span']==d['source_span']
        assert len(list((workspace/'catalog_sources').glob('*/manifest.json')))==10
