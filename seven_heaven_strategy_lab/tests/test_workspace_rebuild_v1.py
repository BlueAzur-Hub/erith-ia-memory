from __future__ import annotations
import hashlib, json, subprocess, sys, tempfile
from pathlib import Path
from unittest.mock import patch

from src.binance_monthly_source_v46 import install, SOURCE_ID
from tests.test_binance_monthly_v46 import fixture

ROOT=Path(__file__).resolve().parents[1]
TOOL=ROOT/'tools'/'workspace_rebuild_v1.py'

def sha(path:Path): return hashlib.sha256(path.read_bytes()).hexdigest()

def test_workspace_rebuild_dry_run_then_execute_preserves_source_and_rebuilds_generated_state():
    with tempfile.TemporaryDirectory() as td:
        base=Path(td); workspace=base/'workspace'; workspace.mkdir()
        archive,checksum=fixture(2020,1)
        with patch('src.binance_monthly_source_v46._download',side_effect=[checksum.encode('ascii'),archive]):
            manifest=install(workspace)
        source_csv=workspace/'binance_monthly_sources'/SOURCE_ID/manifest['stored_csv']
        before=sha(source_csv)
        (workspace/'results').mkdir(); (workspace/'results'/'legacy.json').write_text('{}',encoding='utf-8')
        plan={
          'schema':'seven.workspace.rebuild.plan.v1','name':'test rebuild',
          'required_source_ids':[SOURCE_ID],
          'defaults':{'capital':1000,'fee':.001,'slippage':.0005,'ema_fast':10,'ema_slow':30,'bb_period':20,'bb_sigma':2.0,'donchian_entry':55,'donchian_exit':20,'dca_every':1440,'dca_quote':50,'entry_rule':'EMA_CROSS_UP','filter_rule':'NONE','exit_rule':'EMA_CROSS_DOWN','rsi_period':14,'rsi_entry_max':60,'rsi_exit_min':70,'volume_period':20,'volume_multiplier':1.0,'stop_loss_pct':0,'take_profit_pct':0},
          'runs':[{'name':'TEST · Binance Jan2020 · Donchian','kind':'DONCHIAN','source_id':SOURCE_ID,'timeframe':'1h'}],
          'comparisons':[{'name':'TEST comparison','kind':'DONCHIAN','source_id':SOURCE_ID,'timeframe':'1h'}],
          'ephemeral_acceptance':{'robustness_kinds':['CASH'],'filter_study_kind':'EMA_CROSS','source_id':SOURCE_ID,'timeframe':'1h'}
        }
        plan_path=base/'plan.json'; plan_path.write_text(json.dumps(plan),encoding='utf-8')
        dry=subprocess.run([sys.executable,str(TOOL),'--workspace',str(workspace),'--plan',str(plan_path)],cwd=ROOT,text=True,capture_output=True,timeout=90)
        assert dry.returncode==0,dry.stdout+dry.stderr
        assert 'DRY-RUN uniquement' in dry.stdout
        assert (workspace/'results'/'legacy.json').is_file()
        run=subprocess.run([sys.executable,str(TOOL),'--workspace',str(workspace),'--plan',str(plan_path),'--execute'],cwd=ROOT,text=True,capture_output=True,timeout=90)
        assert run.returncode==0,run.stdout+run.stderr
        assert 'REBUILD_OK' in run.stdout
        assert sha(source_csv)==before
        assert not (workspace/'results'/'legacy.json').exists()
        assert len(list((workspace/'profiles').glob('*.json')))==1
        assert len(list((workspace/'strategy_specs').glob('*.json')))==1
        assert len(list((workspace/'results').glob('*.json')))==1
        assert len(list((workspace/'comparisons').glob('*.json')))==1
        assert (workspace/'CANONICAL_REBUILD_MANIFEST.json').is_file()
        assert (workspace/'CANONICAL_EPHEMERAL_ACCEPTANCE.json').is_file()
        backups=list((base/'workspace_rebuild_backups').glob('generated-state-before-rebuild-*.zip'))
        assert len(backups)==1
