"""Seven Heaven StrategySpec v1: portable PAPER strategy contract."""
from __future__ import annotations
from copy import deepcopy
import hashlib, json, re, uuid
from src.engine import KINDS, LabError, options

SCHEMA = "seven.strategy_spec.v1"
ALLOWED_TIMEFRAMES = {"1m", "5m", "15m", "1h", "4h"}
_KIND_FIELDS = {
    "EMA_CROSS": ("ema_fast", "ema_slow"),
    "BOLLINGER": ("bb_period", "bb_sigma"),
    "DONCHIAN": ("donchian_entry", "donchian_exit"),
    "DCA": ("dca_every", "dca_quote"),
    "HOLD_50": (), "HOLD_100": (), "CASH": (),
    "CUSTOM_RULES": ("ema_fast", "ema_slow", "entry_rule", "filter_rule", "exit_rule",
        "rsi_period", "rsi_entry_max", "rsi_exit_min", "volume_period", "volume_multiplier",
        "stop_loss_pct", "take_profit_pct"),
}

def _canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)

def _fingerprint(payload):
    return hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()

def _clean_name(value):
    if not isinstance(value, str) or not 1 <= len(value.strip()) <= 64 or any(ord(c) < 32 for c in value):
        raise LabError("StrategySpec : nom attendu entre 1 et 64 caractères")
    return value.strip()

def _semantic_payload(kind, rules, market, portfolio, costs, execution):
    return {"strategy":{"kind":kind,"rules":deepcopy(rules)}, "market":deepcopy(market),
            "portfolio":deepcopy(portfolio), "costs":deepcopy(costs), "execution":deepcopy(execution)}

def build_strategy_spec(name, raw_params, *, spec_id=None):
    if not isinstance(raw_params, dict): raise LabError("StrategySpec : paramètres invalides")
    normalized=options(raw_params); timeframe=raw_params.get("timeframe","1m")
    if timeframe not in ALLOWED_TIMEFRAMES: raise LabError("StrategySpec : timeframe non autorisé")
    source_id=raw_params.get("source_id")
    if source_id is not None and (not isinstance(source_id,str) or not source_id.strip()):
        raise LabError("StrategySpec : source_id invalide")
    kind=normalized["kind"]; rules={k:normalized[k] for k in _KIND_FIELDS[kind]}
    market={"source_id":source_id,"timeframe":timeframe}
    portfolio={"capital_quote":normalized["capital"]}
    costs={"fee_per_side":normalized["fee"],"slippage_per_side":normalized["slippage"]}
    execution={"mode":"PAPER","signal_on":"closed_candle","hypothetical_fill":"next_open",
               "position_model":"spot_long_only","real_orders":False}
    semantic=_semantic_payload(kind,rules,market,portfolio,costs,execution)
    identity=spec_id or uuid.uuid4().hex
    if not isinstance(identity,str) or not re.fullmatch(r"[0-9a-f]{32}",identity):
        raise LabError("StrategySpec : identifiant invalide")
    spec={"schema":SCHEMA,"id":identity,"name":_clean_name(name),**semantic,
          "fingerprint_sha256":_fingerprint(semantic),
          "safety":{"paper_only":True,"account_keys":False,"real_order_endpoint":False,"external_engine_required":False}}
    return validate_strategy_spec(spec)

def validate_strategy_spec(spec, *, verify_fingerprint=True):
    if not isinstance(spec,dict) or spec.get("schema")!=SCHEMA: raise LabError("StrategySpec : schéma non supporté")
    if not isinstance(spec.get("id"),str) or not re.fullmatch(r"[0-9a-f]{32}",spec["id"]): raise LabError("StrategySpec : identifiant invalide")
    _clean_name(spec.get("name"))
    strategy=spec.get("strategy")
    if not isinstance(strategy,dict) or strategy.get("kind") not in KINDS: raise LabError("StrategySpec : stratégie inconnue")
    kind=strategy["kind"]; rules=strategy.get("rules")
    if not isinstance(rules,dict) or set(rules)!=set(_KIND_FIELDS[kind]): raise LabError("StrategySpec : règles incompatibles avec la famille "+kind)
    market=spec.get("market")
    if not isinstance(market,dict) or set(market)!={"source_id","timeframe"}: raise LabError("StrategySpec : marché incomplet")
    if market["timeframe"] not in ALLOWED_TIMEFRAMES: raise LabError("StrategySpec : timeframe non autorisé")
    portfolio=spec.get("portfolio"); costs=spec.get("costs"); execution=spec.get("execution")
    if not isinstance(portfolio,dict) or set(portfolio)!={"capital_quote"}: raise LabError("StrategySpec : portefeuille invalide")
    if not isinstance(costs,dict) or set(costs)!={"fee_per_side","slippage_per_side"}: raise LabError("StrategySpec : coûts invalides")
    required={"mode":"PAPER","signal_on":"closed_candle","hypothetical_fill":"next_open","position_model":"spot_long_only","real_orders":False}
    if execution!=required: raise LabError("StrategySpec : contrat d'exécution non autorisé")
    if spec.get("safety")!={"paper_only":True,"account_keys":False,"real_order_endpoint":False,"external_engine_required":False}:
        raise LabError("StrategySpec : contrat de sécurité invalide")
    options({"kind":kind,"capital":portfolio["capital_quote"],"fee":costs["fee_per_side"],"slippage":costs["slippage_per_side"],**rules})
    semantic=_semantic_payload(kind,rules,market,portfolio,costs,execution)
    if verify_fingerprint and spec.get("fingerprint_sha256")!=_fingerprint(semantic): raise LabError("StrategySpec : empreinte incohérente")
    return deepcopy(spec)

def strategy_spec_to_params(spec):
    checked=validate_strategy_spec(spec,verify_fingerprint=False)
    raw={"kind":checked["strategy"]["kind"],"capital":checked["portfolio"]["capital_quote"],
         "fee":checked["costs"]["fee_per_side"],"slippage":checked["costs"]["slippage_per_side"],
         "timeframe":checked["market"]["timeframe"],**checked["strategy"]["rules"]}
    if checked["market"].get("source_id") is not None: raw["source_id"]=checked["market"]["source_id"]
    normalized=options(raw)
    return {**normalized,"timeframe":raw["timeframe"],**({"source_id":raw["source_id"]} if "source_id" in raw else {})}

def explain_strategy_spec(spec):
    s=validate_strategy_spec(spec); kind=s["strategy"]["kind"]; r=s["strategy"]["rules"]
    intents={"EMA_CROSS":f"Suivre une tendance avec EMA {r.get('ema_fast')}/{r.get('ema_slow')}.",
             "BOLLINGER":f"Tester un retour à la moyenne Bollinger {r.get('bb_period')} / {r.get('bb_sigma')} sigma.",
             "DONCHIAN":f"Suivre une cassure Donchian {r.get('donchian_entry')}/{r.get('donchian_exit')} sur clôtures.",
             "DCA":f"Accumuler fictivement {r.get('dca_quote')} unités toutes les {r.get('dca_every')} minutes.",
             "HOLD_50":"Allouer fictivement 50 % du capital à l'actif au début de la période.",
             "HOLD_100":"Allouer fictivement 100 % du capital à l'actif au début de la période.",
             "CASH":"Conserver intégralement la devise de cotation.",
             "CUSTOM_RULES":"Appliquer les règles bornées du Strategy Composer Seven."}
    weaknesses={"EMA_CROSS":"Retard et faux croisements possibles en marché latéral.","BOLLINGER":"Une tendance persistante peut invalider le retour à la moyenne.",
                "DONCHIAN":"Fausses cassures possibles sans tendance persistante.","DCA":"L'accumulation ne protège pas d'une baisse prolongée.",
                "HOLD_50":"Exposition directe à la baisse de l'actif.","HOLD_100":"Exposition complète à la baisse de l'actif.",
                "CASH":"Ne participe pas à une hausse éventuelle.","CUSTOM_RULES":"Une combinaison historique peut sur-apprendre une période."}
    return {"title":s["name"],"kind":kind,"timeframe":s["market"]["timeframe"],"intent":intents[kind],
            "execution":"Signal sur bougie clôturée ; fill PAPER hypothétique à l'ouverture suivante.",
            "weakness":weaknesses[kind],"safety":"Aucun ordre réel, aucune clé de compte, aucun moteur externe requis."}
