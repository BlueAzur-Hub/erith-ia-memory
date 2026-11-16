"""Seven Heaven StrategySpec v1.

A StrategySpec is a Seven-owned, versioned, human-readable strategy definition.
It is intentionally independent from the browser UI, OKX, Freqtrade, Hummingbot
and any future execution adapter.

The current v1 adapter maps only strategies already implemented by the internal
PAPER engine. It never executes user code and never enables real orders.
"""
from __future__ import annotations

from copy import deepcopy
import hashlib
import json
import re
import uuid

from src.engine import KINDS, LabError, options

SCHEMA = "seven.strategy_spec.v1"
ALLOWED_TIMEFRAMES = {"1m", "5m", "15m", "1h", "4h"}

_KIND_FIELDS = {
    "EMA_CROSS": ("ema_fast", "ema_slow"),
    "BOLLINGER": ("bb_period", "bb_sigma"),
    "DONCHIAN": ("donchian_entry", "donchian_exit"),
    "DCA": ("dca_every", "dca_quote"),
    "HOLD_50": (),
    "HOLD_100": (),
    "CASH": (),
    "CUSTOM_RULES": (
        "ema_fast", "ema_slow",
        "entry_rule", "filter_rule", "exit_rule",
        "rsi_period", "rsi_entry_max", "rsi_exit_min",
        "volume_period", "volume_multiplier",
        "stop_loss_pct", "take_profit_pct",
    ),
}


def _canonical(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def _fingerprint(payload: dict) -> str:
    return hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()


def _clean_name(value) -> str:
    if not isinstance(value, str):
        raise LabError("StrategySpec : nom invalide")
    name = value.strip()
    if not 1 <= len(name) <= 64 or any(ord(c) < 32 for c in name):
        raise LabError("StrategySpec : nom attendu entre 1 et 64 caractères")
    return name


def _semantic_payload(*, kind: str, rules: dict, market: dict, portfolio: dict,
                      costs: dict, execution: dict) -> dict:
    """Fields that define executable PAPER semantics, excluding identity/display."""
    return {
        "strategy": {"kind": kind, "rules": deepcopy(rules)},
        "market": deepcopy(market),
        "portfolio": deepcopy(portfolio),
        "costs": deepcopy(costs),
        "execution": deepcopy(execution),
    }


def build_strategy_spec(name: str, raw_params: dict, *, spec_id: str | None = None) -> dict:
    """Convert current bounded engine parameters into a portable StrategySpec v1."""
    if not isinstance(raw_params, dict):
        raise LabError("StrategySpec : paramètres invalides")
    normalized = options(raw_params)
    timeframe = raw_params.get("timeframe", "1m")
    if timeframe not in ALLOWED_TIMEFRAMES:
        raise LabError("StrategySpec : timeframe non autorisé")
    source_id = raw_params.get("source_id")
    if source_id is not None and (not isinstance(source_id, str) or not source_id.strip()):
        raise LabError("StrategySpec : source_id invalide")

    kind = normalized["kind"]
    rules = {key: normalized[key] for key in _KIND_FIELDS[kind]}
    market = {"source_id": source_id, "timeframe": timeframe}
    portfolio = {"capital_quote": normalized["capital"]}
    costs = {
        "fee_per_side": normalized["fee"],
        "slippage_per_side": normalized["slippage"],
    }
    execution = {
        "mode": "PAPER",
        "signal_on": "closed_candle",
        "hypothetical_fill": "next_open",
        "position_model": "spot_long_only",
        "real_orders": False,
    }
    semantic = _semantic_payload(
        kind=kind, rules=rules, market=market, portfolio=portfolio,
        costs=costs, execution=execution,
    )
    identity = spec_id or uuid.uuid4().hex
    if not isinstance(identity, str) or not re.fullmatch(r"[0-9a-f]{32}", identity):
        raise LabError("StrategySpec : identifiant invalide")

    spec = {
        "schema": SCHEMA,
        "id": identity,
        "name": _clean_name(name),
        **semantic,
        "fingerprint_sha256": _fingerprint(semantic),
        "safety": {
            "paper_only": True,
            "account_keys": False,
            "real_order_endpoint": False,
            "external_engine_required": False,
        },
    }
    validate_strategy_spec(spec)
    return spec


def strategy_spec_to_params(spec: dict) -> dict:
    """Validate a StrategySpec and convert it to existing internal engine params."""
    checked = validate_strategy_spec(spec, verify_fingerprint=False)
    raw = {
        "kind": checked["strategy"]["kind"],
        "capital": checked["portfolio"]["capital_quote"],
        "fee": checked["costs"]["fee_per_side"],
        "slippage": checked["costs"]["slippage_per_side"],
        "timeframe": checked["market"]["timeframe"],
    }
    source_id = checked["market"].get("source_id")
    if source_id is not None:
        raw["source_id"] = source_id
    raw.update(checked["strategy"]["rules"])
    normalized = options(raw)
    return {
        **normalized,
        "timeframe": raw["timeframe"],
        **({"source_id": source_id} if source_id is not None else {}),
    }


def validate_strategy_spec(spec: dict, *, verify_fingerprint: bool = True) -> dict:
    if not isinstance(spec, dict):
        raise LabError("StrategySpec : objet JSON attendu")
    if spec.get("schema") != SCHEMA:
        raise LabError("StrategySpec : schéma non supporté")
    if not isinstance(spec.get("id"), str) or not re.fullmatch(r"[0-9a-f]{32}", spec["id"]):
        raise LabError("StrategySpec : identifiant invalide")
    _clean_name(spec.get("name"))

    strategy = spec.get("strategy")
    if not isinstance(strategy, dict) or strategy.get("kind") not in KINDS:
        raise LabError("StrategySpec : stratégie inconnue")
    kind = strategy["kind"]
    rules = strategy.get("rules")
    if not isinstance(rules, dict):
        raise LabError("StrategySpec : règles invalides")
    expected = set(_KIND_FIELDS[kind])
    if set(rules) != expected:
        raise LabError("StrategySpec : règles incompatibles avec la famille " + kind)

    market = spec.get("market")
    if not isinstance(market, dict) or set(market) != {"source_id", "timeframe"}:
        raise LabError("StrategySpec : marché incomplet")
    if market["timeframe"] not in ALLOWED_TIMEFRAMES:
        raise LabError("StrategySpec : timeframe non autorisé")
    if market["source_id"] is not None and (
        not isinstance(market["source_id"], str) or not market["source_id"].strip()
    ):
        raise LabError("StrategySpec : source_id invalide")

    portfolio = spec.get("portfolio")
    costs = spec.get("costs")
    execution = spec.get("execution")
    if not isinstance(portfolio, dict) or set(portfolio) != {"capital_quote"}:
        raise LabError("StrategySpec : portefeuille invalide")
    if not isinstance(costs, dict) or set(costs) != {"fee_per_side", "slippage_per_side"}:
        raise LabError("StrategySpec : coûts invalides")
    required_execution = {
        "mode": "PAPER",
        "signal_on": "closed_candle",
        "hypothetical_fill": "next_open",
        "position_model": "spot_long_only",
        "real_orders": False,
    }
    if execution != required_execution:
        raise LabError("StrategySpec : contrat d'exécution non autorisé")

    safety = spec.get("safety")
    if safety != {
        "paper_only": True,
        "account_keys": False,
        "real_order_endpoint": False,
        "external_engine_required": False,
    }:
        raise LabError("StrategySpec : contrat de sécurité invalide")

    # Reuse the existing engine validator as the single source of numerical limits.
    probe = {
        "kind": kind,
        "capital": portfolio["capital_quote"],
        "fee": costs["fee_per_side"],
        "slippage": costs["slippage_per_side"],
        **rules,
    }
    options(probe)

    semantic = _semantic_payload(
        kind=kind, rules=rules, market=market, portfolio=portfolio,
        costs=costs, execution=execution,
    )
    expected_fingerprint = _fingerprint(semantic)
    if verify_fingerprint and spec.get("fingerprint_sha256") != expected_fingerprint:
        raise LabError("StrategySpec : empreinte incohérente")
    if not isinstance(spec.get("fingerprint_sha256"), str) or not re.fullmatch(
        r"[0-9a-f]{64}", spec["fingerprint_sha256"]
    ):
        raise LabError("StrategySpec : empreinte invalide")
    return deepcopy(spec)


def explain_strategy_spec(spec: dict) -> dict:
    """Return owner-facing explanations without changing engine semantics."""
    checked = validate_strategy_spec(spec)
    kind = checked["strategy"]["kind"]
    r = checked["strategy"]["rules"]
    timeframe = checked["market"]["timeframe"]

    if kind == "DONCHIAN":
        intent = (
            f"Entrer quand une clôture dépasse le plus haut des {r['donchian_entry']} "
            f"bougies précédentes, puis sortir quand une clôture passe sous le plus bas "
            f"des {r['donchian_exit']} bougies précédentes."
        )
        weakness = "Peut subir plusieurs fausses cassures lorsque le marché manque de tendance."
    elif kind == "EMA_CROSS":
        intent = (
            f"Entrer lorsque l'EMA {r['ema_fast']} passe au-dessus de l'EMA {r['ema_slow']}, "
            "et sortir lors du croisement inverse."
        )
        weakness = "Les croisements peuvent arriver tard et se multiplier dans un marché hésitant."
    elif kind == "BOLLINGER":
        intent = (
            f"Chercher un retour à la moyenne avec Bollinger {r['bb_period']} / "
            f"{r['bb_sigma']} sigma."
        )
        weakness = "Une tendance persistante peut maintenir le prix loin de la moyenne."
    elif kind == "DCA":
        intent = (
            f"Investir fictivement {r['dca_quote']} unités de cotation toutes les "
            f"{r['dca_every']} minutes tant que le capital le permet."
        )
        weakness = "L'accumulation ne protège pas contre une baisse prolongée de l'actif."
    elif kind == "HOLD_50":
        intent = "Allouer fictivement 50 % du capital à l'actif au début de la période."
        weakness = "La performance dépend directement de l'évolution de l'actif."
    elif kind == "HOLD_100":
        intent = "Allouer fictivement 100 % du capital à l'actif au début de la période."
        weakness = "Exposition complète à la baisse de l'actif."
    elif kind == "CASH":
        intent = "Conserver intégralement la devise de cotation pendant la période."
        weakness = "Ne participe pas à une hausse éventuelle de l'actif."
    else:
        filter_text = {
            "NONE": "sans filtre complémentaire",
            "RSI_BELOW": f"avec RSI < {r['rsi_entry_max']}",
            "VOLUME_ABOVE": f"avec volume > moyenne × {r['volume_multiplier']}",
        }[r["filter_rule"]]
        intent = (
            f"Appliquer {r['entry_rule']} {filter_text}, puis sortir avec "
            f"{r['exit_rule']} selon les règles bornées du créateur Seven."
        )
        weakness = "Une combinaison historique convaincante peut ne pas se généraliser à d'autres régimes."

    return {
        "title": checked["name"],
        "kind": kind,
        "timeframe": timeframe,
        "intent": intent,
        "execution": "Signal sur bougie clôturée ; fill PAPER hypothétique à l'ouverture suivante.",
        "weakness": weakness,
        "safety": "Aucun ordre réel, aucune clé de compte, aucun moteur externe requis.",
    }
