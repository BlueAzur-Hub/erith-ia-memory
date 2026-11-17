"""Structured Strategy Atlas v1 for the guided Seven Strategy Composer."""
from __future__ import annotations
from copy import deepcopy
from src.engine import KINDS, LabError, options

SCHEMA="seven.strategy_atlas.v1"
_ENTRIES=[
 {"atlas_id":"trend.ema_cross","title":"Croisement EMA","family":"TREND","family_label":"Suivi de tendance","kind":"EMA_CROSS",
  "definition":"EMA signifie Moyenne Mobile Exponentielle. La stratégie compare une moyenne rapide à une moyenne lente pour détecter un changement de dynamique.",
  "intent":"Suivre une tendance confirmée par un croisement de moyennes.",
  "how_it_works":"Entrée quand l'EMA rapide croise au-dessus de l'EMA lente ; sortie quand elle repasse dessous. Le moteur PAPER exécute fictivement à l'ouverture suivante.",
  "regime":"Tendance suffisamment persistante.","weakness":"Faux croisements et accumulation de frais en marché latéral.",
  "parameter_note":"10/30 = 10 et 30 bougies. Sur 1h cela représente environ 10 h / 30 h ; sur 4h environ 40 h / 120 h.",
  "defaults":{"ema_fast":10,"ema_slow":30}},
 {"atlas_id":"trend.donchian","title":"Cassure Donchian","family":"TREND","family_label":"Cassure / tendance","kind":"DONCHIAN",
  "definition":"Donchian construit un canal à partir des plus hauts et plus bas récents. La stratégie cherche une sortie durable de ce canal.",
  "intent":"Entrer sur cassure d'un canal historique, sortir sur cassure opposée.",
  "how_it_works":"Entrée si la clôture dépasse le plus haut des 55 bougies précédentes ; sortie si elle passe sous le plus bas des 20 précédentes.",
  "regime":"Tendance et expansion de prix.","weakness":"Fausses cassures quand le marché reste sans direction.",
  "parameter_note":"55/20 = fenêtre d'entrée de 55 bougies et fenêtre de sortie de 20 bougies.",
  "defaults":{"donchian_entry":55,"donchian_exit":20}},
 {"atlas_id":"mean_reversion.bollinger","title":"Bandes de Bollinger","family":"MEAN_REVERSION","family_label":"Retour à la moyenne / volatilité","kind":"BOLLINGER",
  "definition":"Deux bandes entourent une moyenne et s'écartent quand la volatilité augmente. Elles servent ici à étudier un retour du prix vers sa moyenne.",
  "intent":"Tester un retour du prix vers sa moyenne.",
  "how_it_works":"Le moteur observe l'écart du prix à la moyenne et les bandes calculées sur la période choisie avant d'appliquer les règles PAPER de la stratégie.",
  "regime":"Marché oscillant ou latéral.","weakness":"Une tendance forte peut rester longtemps près ou hors d'une bande.",
  "parameter_note":"20 × 2 = moyenne calculée sur 20 bougies et bandes placées à 2 écarts-types.",
  "defaults":{"bb_period":20,"bb_sigma":2}},
 {"atlas_id":"accumulation.dca","title":"DCA programmé","family":"ACCUMULATION","family_label":"Accumulation","kind":"DCA",
  "definition":"DCA signifie achats périodiques : on répartit une somme en plusieurs achats fictifs au lieu de chercher un point d'entrée unique.",
  "intent":"Répartir des achats fictifs dans le temps.",
  "how_it_works":"Seven achète un montant fixe à intervalle régulier dans la simulation, sans chercher à prédire le prochain mouvement.",
  "regime":"Accumulation long terme testée sans timing directionnel.","weakness":"Ne protège pas d'une baisse prolongée et reste exposé au marché.",
  "parameter_note":"Le réglage principal est la fréquence d'achat et le montant dépensé à chaque passage.",
  "defaults":{"dca_every":1440,"dca_quote":50}},
 {"atlas_id":"baseline.hold_50","title":"Buy & Hold 50 %","family":"BASELINE","family_label":"Référence passive","kind":"HOLD_50",
  "definition":"Référence simple : investir fictivement 50 % du capital dans l'actif et conserver le reste en devise de cotation.",
  "intent":"Mesurer une exposition passive de 50 %.","how_it_works":"Achat initial fictif de 50 % du capital puis conservation jusqu'à la fin de la période.",
  "regime":"Référence de comparaison.","weakness":"Exposition directe à la baisse de l'actif.","parameter_note":"Aucun réglage de signal : cette ligne sert surtout de point de comparaison.","defaults":{}},
 {"atlas_id":"baseline.hold_100","title":"Buy & Hold 100 %","family":"BASELINE","family_label":"Référence passive","kind":"HOLD_100",
  "definition":"Référence simple : investir fictivement tout le capital dans l'actif et le conserver.",
  "intent":"Mesurer l'exposition passive complète.","how_it_works":"Achat initial fictif de 100 % du capital puis conservation jusqu'à la fin de la période.",
  "regime":"Référence de comparaison.","weakness":"Exposition complète à la baisse de l'actif.","parameter_note":"Aucun réglage de signal : utile pour savoir si une stratégie active fait mieux ou moins bien qu'une simple détention.","defaults":{}},
 {"atlas_id":"baseline.cash","title":"Conserver le cash","family":"BASELINE","family_label":"Référence sans exposition","kind":"CASH",
  "definition":"Référence neutre : ne pas acheter l'actif et conserver la devise de cotation.",
  "intent":"Conserver la devise de cotation comme référence neutre.","how_it_works":"Aucune position n'est ouverte ; le capital reste en devise de cotation pendant toute la période.",
  "regime":"Référence sans exposition à l'actif.","weakness":"Ne participe pas à une hausse du marché.","parameter_note":"Rendement nominal de référence proche de 0 % dans le modèle, hors rémunération éventuelle du cash.","defaults":{}},
 {"atlas_id":"composer.custom_rules","title":"Règles personnalisées Seven","family":"COMPOSER","family_label":"Construction personnalisée","kind":"CUSTOM_RULES",
  "definition":"Assemblage contrôlé de règles d'entrée, filtres et sorties à partir des briques déjà présentes dans Seven.",
  "intent":"Assembler des règles bornées sans écrire de code.","how_it_works":"Tu choisis les conditions d'entrée, le filtre éventuel, la sortie et les protections PAPER ; Seven applique exactement ces règles au backtest.",
  "regime":"Recherche contrôlée et explicable.","weakness":"Risque de surapprentissage si l'on ajuste trop les règles après avoir vu les résultats.",
  "parameter_note":"Commencer avec peu de règles, garder les coûts visibles et vérifier ensuite sur d'autres périodes.",
  "defaults":{"ema_fast":10,"ema_slow":30,"entry_rule":"EMA_CROSS_UP","filter_rule":"NONE","exit_rule":"EMA_CROSS_DOWN","rsi_period":14,"rsi_entry_max":60,"rsi_exit_min":70,"volume_period":20,"volume_multiplier":1.0,"stop_loss_pct":0,"take_profit_pct":0}},
]

def _validated_entry(item):
    if item["kind"] not in KINDS: raise LabError("Strategy Atlas : famille moteur inconnue")
    options({"kind":item["kind"],"capital":1000,"fee":0.001,"slippage":0.0005,**item["defaults"]})
    return {**deepcopy(item),"paper_only":True,"execution_family":"SEVEN_SPOT_LONG_ONLY","compatible_timeframes":["1m","5m","15m","1h","4h"],
            "external_validators":{"freqtrade":"OPTIONAL_DIRECTIONAL_REFERENCE","hummingbot":"OPTIONAL_EXECUTION_REFERENCE","freqai":"OPTIONAL_ML_REFERENCE"}}

def catalog():
    entries=[_validated_entry(x) for x in _ENTRIES]
    return {"schema":SCHEMA,"entries":entries,"families":sorted({x["family"] for x in entries}),"count":len(entries),"paper_only":True}

def template(atlas_id):
    for item in _ENTRIES:
        if item["atlas_id"]==atlas_id: return _validated_entry(item)
    raise LabError("Strategy Atlas : modèle inconnu")
