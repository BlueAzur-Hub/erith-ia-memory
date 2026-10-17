#!/usr/bin/env python3
"""Observateur Q PAPER. Spot Bitget public; journal UTC prospectif, jamais d'ordre."""
import datetime as dt
import json
import math
import pathlib
import urllib.parse
import urllib.request

BASE = pathlib.Path(__file__).resolve().parents[1] / "data/trader_flux/q_paper"
SCHEMA = "erith.quack-ai.spot-paper.observations.v1"
PAIR = "QUSDT"
HOUR = 3600_000

def iso(now):
    return now.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def require(ok, message):
    if not ok:
        raise ValueError(message)

def read_public(path, params):
    url = "https://api.bitget.com" + path + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Erith-Q-Paper/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as response:
        require(response.status == 200, "Bitget HTTP anormal")
        raw = response.read(1_000_001)
        require(len(raw) <= 1_000_000, "Bitget réponse trop volumineuse")
        result = json.loads(raw)
    require(result.get("code") == "00000", "Bitget public indisponible")
    return result.get("data")

def validate_candles(raw, now):
    require(isinstance(raw, list), "Bougies Q absentes")
    now_ms = int(now.timestamp() * 1000)
    rows = []
    for c in raw:
        if not isinstance(c, list) or len(c) < 7:
            continue
        t = int(c[0]); values = [float(x) for x in c[1:7]]
        if t + HOUR > now_ms:
            continue
        require(all(math.isfinite(x) for x in values) and all(x > 0 for x in values[:4]) and values[4] >= 0 and values[5] >= 0, "Bougie Q invalide")
        op, high, low, close, vol, quote_vol = values
        require(low <= min(op, close) <= max(op, close) <= high, "OHLC Q incohérent")
        rows.append((t, op, high, low, close, vol, quote_vol))
    rows = sorted({c[0]: c for c in rows}.values())
    require(len(rows) >= 21, "Pas 21 bougies horaires closes Q")
    rows = rows[-21:]
    require(all(rows[i][0] - rows[i-1][0] == HOUR for i in range(1, len(rows))), "Bougies Q discontinues")
    require(0 <= now_ms - (rows[-1][0] + HOUR) <= 2*HOUR, "Bougies Q périmées")
    return {
        "last_closed_hour_utc": iso(dt.datetime.fromtimestamp(rows[-1][0]/1000, tz=dt.timezone.utc)),
        "close_usdt": rows[-1][4],
        "change_close_20h_pct": round((rows[-1][4]/rows[0][4] - 1)*100, 5),
        "last_hour_volume_q": rows[-1][5],
        "last_hour_quote_volume_usdt": rows[-1][6],
        "median_prior_20h_volume_q": round(sum(sorted(c[5] for c in rows[:-1])[9:11]) / 2, 5),
        "last_21_bars_contiguous": True,
    }

def validate_book(book, now):
    require(isinstance(book, dict), "Carnet Q absent")
    now_ms = int(now.timestamp()*1000)
    when = int(book["ts"])
    age = (now_ms - when)/1000
    require(-3 <= age <= 120, "Carnet Q absent, futur ou périmé")
    def side(key):
        a=book.get(key)
        require(isinstance(a,list) and len(a)>0, "Niveaux carnet Q absents")
        rows=[]
        for p,q,*_ in a:
            p=float(p);q=float(q)
            require(math.isfinite(p) and math.isfinite(q) and p>0 and q>0,"Niveau Q invalide")
            rows.append((p,q))
        return rows
    bids, asks = side("b"), side("a")
    bid=max(x[0] for x in bids); ask=min(x[0] for x in asks)
    require(bid<ask, "Carnet Q croisé ou non valide")
    spread=2*(ask-bid)/(ask+bid)*10000
    return {"best_bid_usdt":bid,"best_ask_usdt":ask,"spread_bps":round(spread,5),
            "book_timestamp_utc":iso(dt.datetime.fromtimestamp(when/1000, dt.timezone.utc)),
            "book_age_seconds":round(max(0,age),3),
            "bid_top20_notional_usdt":round(sum(p*q for p,q in bids[:20]),4),
            "ask_top20_notional_usdt":round(sum(p*q for p,q in asks[:20]),4)}

def observe(fetch=read_public, now=None):
    now=now or dt.datetime.now(dt.timezone.utc)
    require(now.tzinfo is not None,"horloge UTC requise")
    info=fetch("/api/v3/market/instruments", {"category":"SPOT","symbol":PAIR})
    require(isinstance(info,list),"Identité instrument indisponible")
    require(any(r.get("category") == "SPOT" and r.get("symbol") == PAIR
                and r.get("baseCoin") == "Q" and r.get("quoteCoin") == "USDT"
                and r.get("status") == "online" for r in info),"QUSDT Bitget Spot non confirmé")
    candles=validate_candles(fetch("/api/v3/market/candles",
        {"category":"SPOT","symbol":PAIR,"interval":"1H","limit":26}),now)
    book=validate_book(fetch("/api/v3/market/orderbook",
        {"category":"SPOT","symbol":PAIR,"limit":20}),now)
    require(abs((book["best_bid_usdt"]+book["best_ask_usdt"])/2/candles["close_usdt"]-1) <= .20,
            "Écart majeur carnet/bougie Q")
    return {"at_utc":iso(now),"coin_id":"quack-ai","symbol":"Q","venue":"Bitget","market":"QUSDT",
            "instrument_type":"SPOT","quote":"USDT","identity_status":"SYMBOL_SPOT_CONFIRMED_CONTRACT_EXTERNAL",
            "candles":candles,"book":book,"source":"Bitget v3 public Spot",
            "paper_only":True,"executed_order":False}

def save(entry,base=BASE):
    require(entry.get("paper_only") is True and entry.get("executed_order") is False and entry.get("market") == PAIR,"Relevé Q PAPER invalide")
    t=dt.datetime.fromisoformat(entry["at_utc"].replace("Z","+00:00"))
    day=t.date().isoformat()
    daily=base/"observations"/(day+".json")
    state_path=base/"state.json"
    if daily.exists():
        obj=json.loads(daily.read_text(encoding="utf-8"))
        require(obj.get("schema")==SCHEMA and obj.get("date_utc")==day,"Archive Q quotidienne incompatible")
        items=obj["observations"]
    else:
        items=[]
    require(isinstance(items,list) and all(r.get("paper_only") is True for r in items),"Journal Q corrompu")
    if items and items[-1]["at_utc"] >= entry["at_utc"]:
        print("Q: pas de double relevé ni retour en arrière")
        return False
    state=json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    require(not state or state.get("schema")==SCHEMA,"État Q incompatible")
    require(not state.get("last_observed_at") or state["last_observed_at"] < entry["at_utc"],"Horodatage Q antérieur au dernier état")
    base.mkdir(parents=True,exist_ok=True);daily.parent.mkdir(parents=True,exist_ok=True)
    items.append(entry)
    daily.write_text(json.dumps({"schema":SCHEMA,"date_utc":day,"coin_id":"quack-ai","observations":items},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    recent=(state.get("recent_observations",[])+[entry])[-168:]
    result={"schema":SCHEMA,"coin_id":"quack-ai","market":PAIR,"venue":"Bitget Spot","quote":"USDT",
            "status":"observing_public_spot","paper_only":True,"orders_enabled":False,
            "executed_order":False,"first_observed_at":state.get("first_observed_at") or entry["at_utc"],
            "last_observed_at":entry["at_utc"],"last":entry,
            "recent_observations":recent,"daily_archive_example":"observations/YYYY-MM-DD.json",
            "historical_daily_release_separate":True,
            "limitations":["Ce journal commence à la première collecte réelle, pas au début de la hausse.",
              "Pas de conversion supposée USD=USDT; aucune exécution, aucun frais de compte garanti.",
              "Le symbole spot ne certifie pas seul le contrat du jeton."]}
    state_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Q spot PAPER:",entry["at_utc"],"observations récentes:",len(recent))
    return True

if __name__=="__main__":
    save(observe())
