from __future__ import annotations
import http.client, json, os, tempfile, threading
from pathlib import Path
from unittest.mock import patch

from src import server
from src.binance_monthly_source_v46 import install, SOURCE_ID
from tests.test_binance_monthly_v46 import fixture


def request(path, body=None):
    httpd=server.ThreadingHTTPServer(("127.0.0.1",0),server.Handler)
    thread=threading.Thread(target=httpd.serve_forever,daemon=True); thread.start()
    try:
        conn=http.client.HTTPConnection("127.0.0.1",httpd.server_port,timeout=10)
        payload=None if body is None else json.dumps(body)
        headers={"Host":f"127.0.0.1:{httpd.server_port}"}
        if payload is not None: headers["Content-Type"]="application/json"
        conn.request("GET" if body is None else "POST",path,body=payload,headers=headers)
        resp=conn.getresponse(); data=json.loads(resp.read().decode("utf-8")); conn.close(); return resp.status,data
    finally:
        httpd.shutdown(); httpd.server_close(); thread.join(timeout=5)


def install_fixture(workspace:Path):
    archive,checksum=fixture(2020,1)
    with patch("src.binance_monthly_source_v46._download",side_effect=[checksum.encode("ascii"),archive]):
        install(workspace)


def params():
    return {"kind":"EMA_CROSS","source_id":SOURCE_ID,"timeframe":"1h","capital":1000,"fee":.001,"slippage":.0005,"ema_fast":10,"ema_slow":30,"bb_period":20,"bb_sigma":2.0,"donchian_entry":55,"donchian_exit":20,"dca_every":1440,"dca_quote":50,"entry_rule":"EMA_CROSS_UP","filter_rule":"NONE","exit_rule":"EMA_CROSS_DOWN","rsi_period":14,"rsi_entry_max":60,"rsi_exit_min":70,"volume_period":20,"volume_multiplier":1.0,"stop_loss_pct":0,"take_profit_pct":0}


def test_managed_workspace_keeps_manual_results_ephemeral_but_saves_user_configs_separately():
    with tempfile.TemporaryDirectory() as td:
        workspace=Path(td); install_fixture(workspace)
        (workspace/"CANONICAL_REBUILD_MANIFEST.json").write_text(json.dumps({"schema":"seven.workspace.canonical_rebuild.v1","created_utc":"2026-11-17T00:00:00+00:00","generated":{"profiles":[],"strategy_specs":[],"runs":[],"comparisons":[]}}),encoding="utf-8")
        with patch.object(server,"WORKSPACE",workspace), patch.dict(os.environ,{"SEVEN_LAB_WORKSPACE_WRITE_MODE":"explore"}):
            status,health=request("/api/health")
            assert status==200 and health["workspace"]["managed"] is True
            assert health["workspace"]["ui_persistence_allowed"] is False
            assert health["workspace"]["manual_configuration_persistence_allowed"] is True
            status,run=request("/api/run",{"params":params()})
            assert status==201 and run["report"]["workspace_persistence"]["persisted"] is False
            assert not list((workspace/"results").glob("*.json")) if (workspace/"results").exists() else True
            status,cmp=request("/api/compare",{"params":params()})
            assert status==201 and cmp["report"]["workspace_persistence"]["persisted"] is False
            status,profile=request("/api/profiles",{"name":"manual","params":params()})
            assert status==201 and (workspace/"user_profiles"/(profile["profile"]["id"]+".json")).is_file()
            status,spec=request("/api/strategy-specs",{"name":"manual","params":params()})
            assert status==201 and (workspace/"user_strategy_specs"/(spec["strategy_spec"]["id"]+".json")).is_file()
            status,listing=request("/api/profiles")
            assert status==200 and any(x.get("namespace")=="user" for x in listing["profiles"])
            status,listing=request("/api/strategy-specs")
            assert status==200 and any(x.get("namespace")=="user" for x in listing["strategy_specs"])


def test_canonical_write_mode_allows_rebuild_persistence():
    with tempfile.TemporaryDirectory() as td:
        workspace=Path(td); install_fixture(workspace)
        (workspace/"CANONICAL_REBUILD_MANIFEST.json").write_text(json.dumps({"schema":"seven.workspace.canonical_rebuild.v1","generated":{}}),encoding="utf-8")
        with patch.object(server,"WORKSPACE",workspace), patch.dict(os.environ,{"SEVEN_LAB_WORKSPACE_WRITE_MODE":"canonical"}):
            status,run=request("/api/run",{"params":params()})
            assert status==201 and run["report"]["workspace_persistence"]["persisted"] is True
            assert len(list((workspace/"results").glob("*.json")))==1
