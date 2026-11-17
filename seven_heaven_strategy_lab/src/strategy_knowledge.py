"""Seven Heaven Strategy Knowledge v1.

Educational/reference layer only. It never changes paper execution rules and has no
access to accounts, exchange keys or live-order endpoints.
"""
from __future__ import annotations
from copy import deepcopy

SCHEMA = "seven.strategy_knowledge.v1"

_ARTICLES = {
    "ema": {
        "id": "ema",
        "title": "EMA — Moyenne Mobile Exponentielle",
        "subtitle": "Indicateur de tendance réactif, fondé sur les prix passés",
        "family": "Suivi de tendance",
        "technical_name": "Exponential Moving Average",
        "level": "Fondamental → avancé",
        "summary": (
            "Une EMA lisse le prix tout en donnant davantage de poids aux observations récentes. "
            "Elle réagit donc plus vite qu'une moyenne mobile simple de même période, mais reste "
            "un indicateur retardé : elle décrit et confirme un mouvement déjà engagé, elle ne prédit pas le marché."
        ),
        "what_it_measures": (
            "La direction et le rythme moyen du prix sur une fenêtre exprimée en bougies. "
            "Une EMA courte réagit vite ; une EMA longue est plus lente et donne une lecture plus stable."
        ),
        "sma_difference": (
            "Une SMA donne le même poids aux observations de sa fenêtre. Une EMA donne plus de poids "
            "aux prix récents et conserve une influence décroissante des observations plus anciennes."
        ),
        "formula": {
            "alpha": "α = 2 / (N + 1)",
            "ema": "EMA(t) = EMA(t−1) + α × [Prix(t) − EMA(t−1)]",
            "note": (
                "N est la période en bougies. Plus N est petit, plus α est grand et plus l'EMA réagit vite. "
                "Le premier point peut être amorcé avec une moyenne simple."
            ),
        },
        "reading": [
            "EMA montante : le prix moyen récent progresse ; contexte potentiellement haussier.",
            "EMA descendante : le prix moyen récent recule ; contexte potentiellement baissier.",
            "Prix au-dessus d'une EMA montante : mouvement cohérent avec une tendance haussière, sans certitude de poursuite.",
            "Prix sous une EMA descendante : mouvement cohérent avec une tendance baissière, sans certitude de poursuite.",
            "Deux EMA qui se croisent : la dynamique récente change relativement à la dynamique plus lente."
        ],
        "crossover": {
            "bullish": (
                "Croisement haussier : l'EMA rapide passe de dessous à au-dessus de l'EMA lente. "
                "Cela indique que la dynamique récente devient plus forte que la dynamique lente."
            ),
            "bearish": (
                "Croisement baissier : l'EMA rapide repasse sous l'EMA lente. "
                "Cela indique un affaiblissement relatif de la dynamique récente."
            ),
            "warning": (
                "Un croisement n'est pas une prédiction. Deux moyennes mobiles sont des indicateurs retardés. "
                "En marché latéral, les croisements répétés peuvent produire des faux départs et beaucoup de frais."
            ),
        },
        "strengths": [
            "Lecture simple et reproductible de la direction moyenne du prix.",
            "Plus réactive qu'une SMA de même période.",
            "Utile comme filtre de tendance ou comme composant d'une stratégie plus large.",
            "Facile à comparer entre plusieurs périodes et timeframes."
        ],
        "limits": [
            "Retard : l'EMA réagit après le prix, même si elle est plus rapide qu'une SMA.",
            "Whipsaws / faux croisements dans les marchés sans direction claire.",
            "Une période très courte augmente la sensibilité au bruit et peut multiplier les transactions.",
            "Une période longue filtre davantage le bruit mais réagit plus tard.",
            "Aucune EMA ne tient compte à elle seule du contexte, du volume, des nouvelles ou du carnet d'ordres."
        ],
        "context_tools": [
            "Volume : vérifier si le mouvement s'accompagne d'une activité significative.",
            "Structure de prix : creux/sommets, supports et résistances.",
            "Volatilité : distinguer tendance régulière et marché erratique.",
            "Multi-timeframe : vérifier si le signal court terme est cohérent avec une structure plus large."
        ],
        "seven_engine": {
            "name": "Croisement EMA long-only PAPER",
            "entry": (
                "Sur la dernière bougie clôturée, l'EMA rapide doit passer de dessous à au-dessus de l'EMA lente. "
                "Si aucune position n'est ouverte, Seven prépare un achat fictif."
            ),
            "exit": (
                "Sur la dernière bougie clôturée, l'EMA rapide doit repasser de dessus à dessous de l'EMA lente. "
                "Si une position est ouverte, Seven prépare une vente fictive."
            ),
            "execution": (
                "Le signal est calculé uniquement avec une bougie déjà clôturée. Le fill PAPER est exécuté "
                "fictivement à l'ouverture de la bougie suivante, avec frais et glissement configurés."
            ),
            "positioning": "Spot long-only : cash + inventaire, sans levier, sans short et sans ordre réel.",
            "warmup": "Le moteur attend suffisamment de bougies pour initialiser l'EMA lente avant de trader.",
        },
        "analysis_checklist": [
            "Rendement final : la stratégie a-t-elle gagné ou perdu sur cette période précise ?",
            "Drawdown maximal : quelle a été la pire baisse du capital pendant le test ?",
            "Frais : combien de performance a été consommée par les allers-retours ?",
            "Nombre de fills : trop de transactions peut signaler un marché latéral ou des paramètres trop sensibles.",
            "Comparaison passive : fait-elle mieux ou moins bien que Buy & Hold et que la conservation du cash ?",
            "Robustesse : le résultat tient-il sur d'autres périodes, actifs et fenêtres walk-forward ?"
        ],
        "references": [
            {
                "label": "TradingView Help Center — Exponential Moving Average",
                "url": "https://www.tradingview.com/support/solutions/43000592270-exponential-moving-average/",
                "scope": "définition, calcul, usages, limites"
            },
            {
                "label": "TradingView Help Center — Moving Averages",
                "url": "https://www.tradingview.com/support/solutions/43000502589-moving-averages/",
                "scope": "retard, croisements, tendance, support/résistance"
            },
            {
                "label": "Fidelity Learning Center — Exponential Moving Average (EMA)",
                "url": "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/ema",
                "scope": "EMA vs SMA, sensibilité, formule, interprétation"
            },
            {
                "label": "Seven Heaven Strategy Lab — src/engine.py",
                "url": "local://src/engine.py",
                "scope": "règles exactes du moteur PAPER Seven"
            }
        ],
        "paper_only": True,
        "educational_only": True,
    },
    "bollinger": {
        "id": "bollinger",
        "title": "Bandes de Bollinger — Volatilité & retour à la moyenne",
        "subtitle": "Enveloppe dynamique autour d'une moyenne, basée sur la dispersion récente des prix",
        "family": "Volatilité / retour à la moyenne",
        "technical_name": "Bollinger Bands",
        "level": "Fondamental → avancé",
        "summary": (
            "Les Bandes de Bollinger entourent une moyenne mobile simple par une bande haute et une bande basse "
            "placées à un nombre choisi d'écarts-types. Elles visualisent donc à la fois un niveau relatif du prix "
            "et l'évolution de la volatilité. Une touche de bande n'est pas, à elle seule, un signal de retournement."
        ),
        "what_it_measures": (
            "La position du prix par rapport à sa moyenne récente et l'amplitude de ses variations. "
            "Quand la volatilité augmente, les bandes s'écartent ; quand elle diminue, elles se resserrent."
        ),
        "formula": {
            "middle": "Bande médiane = SMA(N)",
            "upper": "Bande haute = SMA(N) + k × σ(N)",
            "lower": "Bande basse = SMA(N) − k × σ(N)",
            "note": (
                "N est la période en bougies, σ l'écart-type des clôtures sur cette fenêtre et k le multiplicateur. "
                "Le réglage classique est N = 20 et k = 2."
            ),
        },
        "reading": [
            "Bandes qui se resserrent : volatilité récente plus faible ; un mouvement important peut suivre, sans direction garantie.",
            "Bandes qui s'élargissent : volatilité en hausse ; le marché devient plus agité.",
            "Prix proche de la bande haute : niveau relativement élevé par rapport à sa moyenne récente, pas automatiquement 'trop cher'.",
            "Prix proche de la bande basse : niveau relativement faible par rapport à sa moyenne récente, pas automatiquement 'bon marché'.",
            "Prix qui longe une bande : une tendance forte peut persister ; parier systématiquement sur un retour immédiat vers la moyenne est dangereux."
        ],
        "patterns": {
            "squeeze": (
                "Squeeze : les bandes deviennent inhabituellement étroites. Cela signale une contraction de volatilité. "
                "Une expansion peut suivre dans un sens ou dans l'autre ; Seven ne traite donc pas le squeeze comme une direction certaine."
            ),
            "walk": (
                "Walking the band : le prix peut rester près d'une bande pendant une tendance forte. "
                "Toucher la bande haute ou basse n'impose donc pas un retournement."
            ),
            "warning": (
                "Les bandes donnent une lecture relative du prix et de la volatilité. Elles sont plus solides lorsqu'elles sont combinées "
                "à la structure de marché, au volume ou à un autre filtre plutôt qu'utilisées seules."
            ),
        },
        "strengths": [
            "Visualise immédiatement la contraction et l'expansion de volatilité.",
            "Donne une définition relative de prix élevé ou faible par rapport à une moyenne récente.",
            "Paramètres simples à reproduire et à comparer entre actifs et timeframes.",
            "Peut servir de base à des stratégies de retour à la moyenne, de breakout ou de filtre de volatilité."
        ],
        "limits": [
            "Une touche de bande ne signifie pas qu'un retournement va se produire.",
            "En tendance forte, le prix peut rester longtemps sur ou hors d'une bande.",
            "Le réglage 20 × 2 n'est pas universel : période et multiplicateur changent fortement le comportement.",
            "Les bandes reposent sur les prix passés ; elles n'intègrent ni news, carnet d'ordres ni contexte fondamental.",
            "Une stratégie de retour à la moyenne peut subir de fortes pertes lorsqu'un marché cesse d'osciller et part franchement en tendance."
        ],
        "context_tools": [
            "Structure de prix : support/résistance, sommets et creux.",
            "Volume : vérifier si une cassure ou un retour s'accompagne d'activité.",
            "Tendance : EMA, SuperTrend ou structure multi-timeframe pour éviter de contrer une tendance forte.",
            "Band Width / largeur : quantifier la contraction ou l'expansion des bandes."
        ],
        "seven_engine": {
            "name": "Bollinger mean-reversion long-only PAPER",
            "entry": (
                "Sur la dernière bougie clôturée, Seven calcule une moyenne et un écart-type sur la fenêtre Bollinger. "
                "Si la clôture est sous la bande basse et qu'aucune position n'est ouverte, Seven prépare un achat fictif."
            ),
            "exit": (
                "Si une position est ouverte et que la dernière clôture est au-dessus de la bande haute, "
                "Seven prépare une vente fictive."
            ),
            "execution": (
                "Le signal utilise uniquement une bougie déjà clôturée. Le fill PAPER est exécuté fictivement à l'ouverture "
                "de la bougie suivante, avec les frais et le glissement configurés."
            ),
            "positioning": "Spot long-only : cash + inventaire, sans levier, sans short et sans ordre réel.",
            "warmup": "Le moteur attend d'avoir N clôtures disponibles avant de calculer les bandes et d'autoriser un signal."
        },
        "analysis_checklist": [
            "Rendement final : la règle de retour à la moyenne a-t-elle produit un gain net sur cette période ?",
            "Drawdown maximal : combien la stratégie a-t-elle perdu pendant les phases où le prix a continué dans la même direction ?",
            "Frais et nombre de fills : les oscillations ont-elles créé trop d'allers-retours ?",
            "Régime : le marché était-il réellement latéral ou a-t-il basculé en tendance ?",
            "Comparaison passive : la stratégie fait-elle mieux que Buy & Hold et la conservation du cash sur les mêmes dates ?",
            "Robustesse : le comportement reste-t-il acceptable sur d'autres actifs, périodes et fenêtres walk-forward ?"
        ],
        "references": [
            {
                "label": "TradingView Help Center — Bollinger Bands (BB)",
                "url": "https://www.tradingview.com/support/solutions/43000501840-bollinger-bands-bb/",
                "scope": "définition, calcul, volatilité, paramètres, lecture des bandes"
            },
            {
                "label": "Fidelity Learning Center — Bollinger Bands",
                "url": "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/bollinger-bands",
                "scope": "paramètres 20 × 2, contraction/expansion, limites et usages"
            },
            {
                "label": "Seven Heaven Strategy Lab — src/engine.py",
                "url": "local://src/engine.py",
                "scope": "règles exactes du moteur PAPER Seven"
            }
        ],
        "paper_only": True,
        "educational_only": True,
    },
    "donchian": {
        "id": "donchian",
        "title": "Canal de Donchian — Cassure & suivi de tendance",
        "subtitle": "Canal des extrêmes récents : attendre qu'un prix sorte réellement d'une zone avant de suivre le mouvement",
        "family": "Cassure / suivi de tendance",
        "technical_name": "Donchian Channels / Price Channel Breakout",
        "level": "Fondamental → avancé",
        "summary": (
            "Un canal de Donchian encadre le marché avec le plus haut et le plus bas observés sur une fenêtre de bougies. "
            "Il ne cherche pas à deviner un point bas : il attend qu'un prix confirme une sortie de sa zone récente. "
            "Cette logique peut accompagner de grandes tendances, mais elle accepte aussi des faux départs et des séries de petites pertes."
        ),
        "what_it_measures": (
            "Les extrêmes récents du marché. La borne haute correspond au plus haut observé sur N bougies et la borne basse "
            "au plus bas observé sur N bougies. L'écartement du canal reflète aussi l'amplitude récente du prix."
        ),
        "formula": {
            "upper": "Canal haut(N) = max(plus hauts des N bougies précédentes)",
            "lower": "Canal bas(N) = min(plus bas des N bougies précédentes)",
            "middle": "Milieu = (Canal haut + Canal bas) / 2  ·  repère visuel, pas règle native Seven",
            "note": (
                "Dans Seven, la bougie qui déclenche le signal n'est pas incluse dans le canal causal : le moteur compare "
                "la dernière clôture terminée aux extrêmes des bougies qui la précèdent."
            ),
        },
        "reading": [
            "Canal horizontal et étroit : marché relativement contenu ; une future sortie peut devenir intéressante, sans direction garantie.",
            "Canal qui monte : les extrêmes récents progressent ; la structure de prix se décale vers le haut.",
            "Clôture au-dessus du canal haut précédent : cassure haussière confirmée par la clôture selon la règle Seven.",
            "Simple mèche au-dessus puis clôture sous le canal : Seven ne considère pas cela comme une entrée Donchian native.",
            "Après l'entrée, un nouveau sommet peut étendre le canal ; la stratégie cherche à rester dans une tendance tant que la règle de sortie n'est pas déclenchée."
        ],
        "breakouts": {
            "confirmed": (
                "Cassure confirmée : la clôture terminée dépasse le plus haut du canal d'entrée calculé uniquement sur les bougies précédentes. "
                "Seven attend donc une clôture, pas seulement une mèche intrabougie."
            ),
            "false": (
                "Faux breakout : le prix sort brièvement d'une zone puis revient rapidement dans le canal. "
                "Les stratégies de cassure peuvent en subir plusieurs avant de capter une tendance durable."
            ),
            "warning": (
                "Une cassure n'est pas une prédiction. Elle dit seulement que le prix vient de dépasser un extrême historique de la fenêtre choisie. "
                "Volume, structure multi-timeframe, volatilité et contexte peuvent aider à juger sa qualité, mais ne font pas partie de la règle Donchian native Seven."
            ),
        },
        "parameters": {
            "entry": (
                "55 bougies d'entrée : Seven exige une rupture d'un extrême plus ancien ; l'entrée devient plus sélective et généralement plus lente."
            ),
            "exit": (
                "20 bougies de sortie : une fenêtre plus courte permet de quitter plus tôt qu'une sortie symétrique 55/55 lorsqu'une tendance se dégrade."
            ),
            "asymmetry": (
                "55/20 est donc asymétrique : on demande davantage de preuve pour entrer que pour sortir. "
                "Ce choix appartient à la stratégie étudiée ; il n'existe pas de couple universel valable pour tous les marchés."
            ),
        },
        "strengths": [
            "Règle de prix très explicable : aucun modèle opaque, seulement des extrêmes observés.",
            "Peut rester exposée assez longtemps pour capturer une tendance durable lorsqu'elle apparaît.",
            "Paramètres faciles à reproduire, auditer et comparer entre actifs et timeframes.",
            "La clôture comme confirmation réduit certains faux départs intrabougie par rapport à une simple mèche."
        ],
        "limits": [
            "En marché latéral, les cassures peuvent échouer les unes après les autres et accumuler pertes et frais.",
            "Le signal arrive après qu'un nouvel extrême a déjà été franchi : la stratégie accepte volontairement du retard.",
            "Une sortie 20 bougies peut rendre une partie d'un gain avant de sortir, car elle attend une cassure opposée du canal de sortie.",
            "55/20 n'est pas universel : un réglage trop court devient bruyant ; un réglage trop long devient très lent.",
            "Le canal ne connaît ni news, liquidations, carnet d'ordres, volume ni contexte fondamental."
        ],
        "context_tools": [
            "Volume : observer si la cassure s'accompagne d'une activité supérieure à la normale.",
            "Structure : vérifier les supports/résistances et la succession de sommets/creux.",
            "Volatilité : distinguer expansion réelle et simple bruit autour d'une zone.",
            "Multi-timeframe : confronter la cassure locale à la structure d'un horizon plus large."
        ],
        "seven_engine": {
            "name": "Donchian 55/20 long-only PAPER",
            "entry": (
                "Si aucune position n'est ouverte, Seven prend la dernière bougie clôturée et calcule le plus haut des 55 bougies qui la précèdent. "
                "Si la clôture est strictement au-dessus de ce canal haut, Seven prépare un achat fictif."
            ),
            "exit": (
                "Si une position est ouverte, Seven calcule le plus bas des 20 bougies précédant la dernière clôture. "
                "Si cette clôture est strictement sous ce canal bas, Seven prépare une vente fictive."
            ),
            "execution": (
                "Le signal est fondé uniquement sur une bougie déjà clôturée. Le fill PAPER est exécuté fictivement à l'ouverture "
                "de la bougie suivante, avec les frais et le glissement configurés."
            ),
            "positioning": "Spot long-only : une position maximum, cash + inventaire, sans levier, sans short et sans ordre réel.",
            "warmup": (
                "Le moteur attend au minimum la fenêtre nécessaire avant d'autoriser la règle. Les canaux causaux excluent la bougie signal elle-même."
            ),
        },
        "local_evidence": {
            "headline": "Ce que Seven a déjà observé avec Donchian 55/20 en 4h",
            "warning": (
                "Ces résultats sont des observations historiques du Lab, pas des probabilités futures. Les périodes, actifs et capitaux "
                "ne doivent pas être additionnés comme un seul portefeuille. Les échecs restent volontairement visibles."
            ),
            "items": [
                {
                    "label": "BTC · blocs 2019–2021",
                    "value": "3 positifs / 5",
                    "detail": "+2,69 %, −0,74 %, +42,30 %, +5,95 %, −6,77 %. Sensibilité au régime déjà visible."
                },
                {
                    "label": "BTC/ETH/BNB/XRP/SOL · années 2024–2025",
                    "value": "7 positifs / 10",
                    "detail": "Le modèle réussit plusieurs fenêtres mais échoue nettement sur BNB 2024, XRP 2025 et SOL 2025."
                },
                {
                    "label": "Panel 2026 · janvier à octobre",
                    "value": "0 positif / 5",
                    "detail": "BTC, ETH, BNB, XRP et SOL sont tous négatifs avant même les coûts : falsification forte d'une robustesse tous-régimes."
                },
                {
                    "label": "136 round-trips 2024–2025",
                    "value": "54 gagnants / 82 perdants",
                    "detail": "Gagnant médian +7,76 % contre perdant médian −5,66 % ; durée médiane 69 bougies 4h contre 26,5. Quelques tendances longues paient beaucoup de faux départs."
                }
            ],
            "conclusion": (
                "Lecture Seven : Donchian 55/20 4h reste une excellente référence de trend-following pour le laboratoire, "
                "mais les données locales réfutent l'idée d'une stratégie universelle. Le régime de marché domine davantage que les frictions."
            )
        },
        "analysis_checklist": [
            "Rendement net : la stratégie a-t-elle capté suffisamment de grandes tendances pour compenser les faux breakouts ?",
            "Drawdown : quelle profondeur de baisse faut-il supporter pendant les séquences de cassures ratées ?",
            "Taux de réussite : une stratégie de tendance peut rester intéressante avec peu de trades gagnants si les gains gagnants sont beaucoup plus grands que les pertes.",
            "Frais et fills : combien de cassures ont provoqué des allers-retours inutiles ?",
            "Comparaison passive : Donchian fait-elle mieux que Buy & Hold sur les mêmes dates et les mêmes coûts ?",
            "Robustesse : le résultat persiste-t-il sur plusieurs actifs, périodes, timeframes et fenêtres walk-forward sans changer 55/20 après coup ?"
        ],
        "references": [
            {
                "label": "TradingView Help Center — Donchian Channels (DC)",
                "url": "https://www.tradingview.com/support/solutions/43000502253-donchian-channels-dc/",
                "scope": "définition, calcul des bandes, volatilité, cassures et limites"
            },
            {
                "label": "Investopedia — Donchian Channels: Formula, Calculations, and Uses",
                "url": "https://www.investopedia.com/donchian-channels-formula-8415235",
                "scope": "formule, breakout, faux signaux, paramètres et usages"
            },
            {
                "label": "Seven Heaven Strategy Lab — RELEASE_CANDIDATE_V4_7_0_RC1.md",
                "url": "local://RELEASE_CANDIDATE_V4_7_0_RC1.md",
                "scope": "contrat Donchian natif 55/20 et parité avec l'outil expérimental historique"
            },
            {
                "label": "Seven Heaven Strategy Lab — src/engine.py",
                "url": "local://src/engine.py",
                "scope": "règles exactes du moteur PAPER Seven : canaux précédents, clôture signal, fill suivant"
            }
        ],
        "paper_only": True,
        "educational_only": True,
    },
    "dca": {
        "id": "dca",
        "title": "DCA programmé — Accumuler sans chercher le point parfait",
        "subtitle": "Achats fictifs de montant constant à intervalles réguliers, indépendamment du sens immédiat du marché",
        "family": "Accumulation programmée",
        "technical_name": "Dollar-Cost Averaging",
        "level": "Fondamental → comparaison",
        "summary": (
            "Le DCA répartit une enveloppe en achats réguliers de même montant au lieu de concentrer toute l'exposition sur un seul point d'entrée. "
            "Il réduit la dépendance à une date d'achat unique, mais il ne transforme pas une baisse prolongée en stratégie gagnante et ne garantit aucun prix moyen favorable."
        ),
        "role": "Référence d'accumulation : mesurer ce que donne une discipline d'achats réguliers face aux stratégies actives et au Buy & Hold.",
        "mechanics": [
            "Choisir un intervalle demandé en minutes et un montant fixe dans la devise de cotation.",
            "Seven convertit l'intervalle demandé en un nombre entier de bougies du timeframe actif, arrondi vers le haut si nécessaire.",
            "Le premier achat PAPER a lieu à l'ouverture de la première bougie active, puis les achats suivants suivent cette cadence effective.",
            "Les achats cessent lorsque le cash restant ne permet plus un ordre fictif valide ; aucune vente périodique n'est imposée par le DCA natif."
        ],
        "reading": [
            "DCA lisse le moment d'entrée : plusieurs prix d'achat remplacent un point d'entrée unique.",
            "Quand le prix baisse, un même montant achète davantage d'unités ; quand il monte, il en achète moins.",
            "Une forte tendance haussière précoce peut favoriser un investissement immédiat, car une partie du cash DCA reste temporairement non investie.",
            "Une baisse persistante peut faire accumuler une position perdante : la régularité n'annule pas le risque de marché.",
            "Plus la cadence est fréquente, plus le nombre de fills et les coûts potentiels deviennent importants."
        ],
        "parameters": {
            "interval": "Intervalle demandé : 1 440 minutes par défaut. Seven l'aligne sur des bougies entières du timeframe actif.",
            "amount": "Montant par achat : 50 unités de devise de cotation par défaut, sous réserve du cash restant et du minimum fictif du moteur.",
            "timeframe": "Exemple : 1 440 min = 24 h. Sur 1h cela devient 24 bougies ; sur 4h, 6 bougies ; sur 15m, 96 bougies."
        },
        "strengths": [
            "Discipline simple et reproductible, sans besoin de prédire un creux.",
            "Réduit la dépendance à un seul point d'entrée.",
            "Facile à comparer sur plusieurs actifs et périodes avec le même budget et la même cadence.",
            "Garde une partie du capital en cash tant que l'accumulation n'est pas terminée."
        ],
        "limits": [
            "Ne protège pas d'une baisse prolongée de l'actif.",
            "Peut sous-performer un investissement immédiat dans une hausse durable, car le capital entre progressivement.",
            "Davantage de fills peut signifier davantage de frais et de glissement simulés.",
            "Le résultat dépend fortement du point de départ, de la durée, du montant, de la cadence et de la tendance de l'actif.",
            "Ce DCA PAPER ne modélise ni rendement du cash en attente, ni fiscalité, ni intérêt, ni exécution réelle."
        ],
        "seven_engine": {
            "entry": "Premier achat fictif à l'ouverture de la première bougie active, puis nouvel achat à chaque cadence effective tant que le cash permet un ordre valide.",
            "exit": "Aucune règle de vente automatique dans le DCA natif Seven : l'inventaire peut rester ouvert jusqu'à la fin de l'historique.",
            "execution": "Chaque achat est exécuté fictivement à l'ouverture de la bougie prévue, avec frais et glissement configurés. La fréquence demandée en minutes est arrondie vers le haut à un nombre entier de bougies.",
            "positioning": "Cash + inventaire spot long-only, achats multiples autorisés, sans levier, sans short et sans ordre réel.",
            "valuation": "À la fin du test, l'inventaire restant est valorisé à la dernière clôture ; aucune liquidation finale forcée n'est inventée."
        },
        "analysis_checklist": [
            "Comparer au Buy & Hold 100 % : le DCA a-t-il bénéficié de son étalement ou a-t-il laissé trop longtemps du cash non investi ?",
            "Comparer au Cash : l'exposition progressive a-t-elle été rémunérée par rapport à 0 % nominal dans le modèle ?",
            "Regarder les fills et les frais : la cadence choisie consomme-t-elle une part significative du résultat ?",
            "Vérifier le capital restant : l'enveloppe a-t-elle été entièrement investie ou le test s'est-il terminé avant ?",
            "Rejouer sur d'autres dates : un bon résultat ne doit pas dépendre d'un seul point de départ."
        ],
        "references": [
            {"label":"Investor.gov — Dollar-Cost Averaging","url":"https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging","scope":"définition générale : montants égaux investis à intervalles réguliers"},
            {"label":"FINRA — Benefits and Limitations of Dollar-Cost Averaging","url":"https://syndication.finra.org/content/benefits-and-limitations-dollar-cost-averaging","scope":"bénéfices, coût d'opportunité, frais et limites"},
            {"label":"Seven Heaven Strategy Lab — src/observatory.py + src/engine.py","url":"local://src/observatory.py","scope":"conversion minutes → bougies, achats PAPER, cash, frais, valorisation finale"}
        ],
        "paper_only": True, "educational_only": True,
    },
    "hold_50": {
        "id": "hold_50",
        "title": "Buy & Hold 50 % — Référence passive à demi-exposition",
        "subtitle": "Investir fictivement environ la moitié du capital au départ et conserver l'autre moitié en cash",
        "family": "Référence passive",
        "technical_name": "50% Buy-and-Hold Baseline",
        "level": "Fondamental → comparaison",
        "summary": (
            "Buy & Hold 50 % sert de référence intermédiaire : Seven affecte environ la moitié du capital à l'actif au début du test et conserve le reste en devise de cotation. "
            "Cette ligne aide à distinguer la performance de l'actif de celle d'une stratégie active, tout en réduisant l'exposition par rapport à un Buy & Hold 100 %."
        ),
        "role": "Baseline de risque intermédiaire : une seule entrée, moitié exposée à l'actif, moitié conservée en cash.",
        "mechanics": [
            "À la première bougie active, Seven prépare un seul achat PAPER avec une allocation cible de 50 % du capital initial.",
            "Les frais et le glissement de l'entrée sont appliqués ; le moteur ajuste la quantité au pas minimal et au cash réellement disponible.",
            "Aucun signal technique n'est utilisé et aucune vente intermédiaire n'est déclenchée.",
            "À la fin, l'inventaire restant est marqué à la dernière clôture ; le cash non investi reste dans le portefeuille."
        ],
        "reading": [
            "Si l'actif monte, la moitié investie participe à la hausse tandis que le cash amortit l'exposition.",
            "Si l'actif baisse, la perte est généralement moins forte qu'avec 100 % d'exposition, toutes choses égales par ailleurs.",
            "Cette référence n'essaie pas de choisir de bons moments d'entrée ou de sortie.",
            "Elle est particulièrement utile pour juger si la complexité et les coûts d'une stratégie active apportent réellement quelque chose."
        ],
        "parameters": {"allocation":"Allocation cible : 50 % du capital initial vers l'actif, le reste en cash.","signals":"Aucun indicateur, aucune optimisation et aucune sortie de signal."},
        "strengths": ["Très simple à reproduire et à auditer.","Un seul fill d'entrée limite les frictions simulées.","Le cash restant réduit l'exposition totale à l'actif.","Bonne référence pour comparer rendement et drawdown d'une stratégie active."],
        "limits": ["Reste exposé aux baisses de l'actif.","Peut sous-performer 100 % Buy & Hold dans une forte hausse.","N'adapte jamais l'exposition au régime de marché.","Ne modélise aucun rendement du cash restant ni fiscalité réelle."],
        "seven_engine": {
            "entry":"Un seul achat fictif à l'ouverture de la première bougie active, avec une allocation cible de 50 % du capital initial.",
            "exit":"Aucune vente automatique : l'inventaire est conservé jusqu'à la fin de la fenêtre historique.",
            "execution":"Le prix d'entrée inclut le glissement configuré et la commission ; la quantité respecte le pas minimal du moteur.",
            "positioning":"Environ 50 % exposé à l'actif + solde en cash, spot long-only, sans levier ni ordre réel.",
            "valuation":"Inventaire valorisé à la dernière clôture ; aucune liquidation finale forcée."
        },
        "analysis_checklist": ["Comparer au Buy & Hold 100 % pour mesurer l'effet de l'exposition réduite.","Comparer au Cash pour savoir si le risque pris a été rémunéré.","Comparer aux stratégies actives sur les mêmes dates et coûts.","Regarder le drawdown autant que le rendement final.","Ne pas conclure à partir d'une seule fenêtre historique."],
        "references": [
            {"label":"FINRA — Active vs. Passive Investing","url":"https://syndication.finra.org/content/active-vs-passive-investing","scope":"buy-and-hold comme approche passive, différence avec gestion active"},
            {"label":"Investor.gov — Asset Allocation and Diversification","url":"https://www.investor.gov/introduction-investing/getting-started/asset-allocation","scope":"allocation entre actifs et cash, horizon et tolérance au risque"},
            {"label":"Seven Heaven Strategy Lab — src/engine.py","url":"local://src/engine.py","scope":"allocation initiale 50 %, un fill, cash restant et valorisation finale"}
        ],
        "paper_only": True, "educational_only": True,
    },
    "hold_100": {
        "id": "hold_100",
        "title": "Buy & Hold 100 % — Référence passive d'exposition complète",
        "subtitle": "Investir fictivement le capital disponible au départ puis conserver l'actif pendant toute la fenêtre",
        "family": "Référence passive",
        "technical_name": "100% Buy-and-Hold Baseline",
        "level": "Fondamental → comparaison",
        "summary": (
            "Buy & Hold 100 % est la baseline la plus directe pour demander : qu'aurait donné une exposition immédiate et maximale à l'actif sur exactement les mêmes dates ? "
            "Seven effectue un seul achat PAPER initial puis ne tente aucun timing de marché."
        ),
        "role": "Baseline d'exposition complète : référence simple pour mesurer si une stratégie active fait réellement mieux qu'une détention passive.",
        "mechanics": [
            "À la première bougie active, Seven utilise le capital disponible pour un achat PAPER initial, frais inclus.",
            "La quantité est ajustée au pas minimal ; un petit reliquat de cash peut subsister à cause des frais et de l'arrondi.",
            "Aucune entrée supplémentaire et aucune vente intermédiaire ne sont déclenchées.",
            "La valeur finale combine le reliquat de cash et l'inventaire valorisé à la dernière clôture."
        ],
        "reading": ["Référence fortement sensible au point de départ : entrer juste avant une hausse ou une baisse change fortement le résultat.","Un seul fill réduit les frictions par rapport à une stratégie très active.","Le drawdown montre le coût historique d'une exposition complète pendant la période.","Une stratégie active doit justifier ses frais et sa complexité face à cette référence simple."],
        "parameters": {"allocation":"Allocation cible : capital disponible immédiatement investi dans l'actif, sous réserve des frais et du pas minimal.","signals":"Aucun indicateur, aucune optimisation, aucune sortie de signal."},
        "strengths": ["Simplicité maximale et audit facile.","Très peu de frictions simulées : un seul achat initial.","Capture entièrement une hausse de l'actif après l'entrée.","Référence exigeante pour juger la valeur ajoutée d'un système actif."],
        "limits": ["Exposition complète aux baisses et drawdowns de l'actif.","Dépend fortement de la date initiale choisie.","Aucune adaptation au régime de marché.","Une bonne performance historique de l'actif n'implique pas une répétition future."],
        "seven_engine": {
            "entry":"Un seul achat fictif à l'ouverture de la première bougie active avec le capital disponible, frais compris.",
            "exit":"Aucune vente automatique : l'inventaire est conservé pendant toute la fenêtre.",
            "execution":"Glissement et commission sont appliqués à l'entrée ; la quantité est arrondie au pas minimal du moteur.",
            "positioning":"Exposition spot long-only proche de 100 %, sans levier, sans short et sans ordre réel.",
            "valuation":"Inventaire valorisé à la dernière clôture avec éventuel reliquat de cash ; aucune liquidation finale forcée."
        },
        "analysis_checklist": ["Comparer au Hold 50 % pour mesurer le prix de l'exposition complète.","Comparer au Cash pour mesurer la prime historique obtenue contre l'absence d'exposition.","Comparer aux stratégies actives après frais, pas seulement sur le rendement brut de l'actif.","Examiner le drawdown maximal et la profondeur des périodes de perte.","Rejouer sur plusieurs dates de départ pour éviter une conclusion dépendante d'un seul timing."],
        "references": [
            {"label":"FINRA — Active vs. Passive Investing","url":"https://syndication.finra.org/content/active-vs-passive-investing","scope":"définition de l'approche passive / buy-and-hold"},
            {"label":"Fidelity — Long-term investing strategies","url":"https://www.fidelity.com/learning-center/trading-investing/long-term-investments","scope":"buy-and-hold, horizon long et réduction des transactions"},
            {"label":"Seven Heaven Strategy Lab — src/engine.py","url":"local://src/engine.py","scope":"achat initial 100 %, frais, reliquat de cash et valorisation finale"}
        ],
        "paper_only": True, "educational_only": True,
    },
    "cash": {
        "id": "cash",
        "title": "Conservation du cash — Référence sans exposition à l'actif",
        "subtitle": "Ne pas acheter l'actif : baseline nominale à 0 % dans le modèle Seven",
        "family": "Référence sans exposition",
        "technical_name": "Cash Baseline",
        "level": "Fondamental → comparaison",
        "summary": (
            "La ligne Cash est le zéro de référence du Lab : aucun achat n'est effectué et le capital reste dans la devise de cotation pendant toute la fenêtre. "
            "Dans le modèle Seven, elle sert à demander si le risque pris par une autre méthode a réellement produit une valeur supplémentaire."
        ),
        "role": "Baseline neutre du comparateur : 0 fill, 0 frais de trading et 0 % nominal tant que la devise de cotation elle-même n'est pas modélisée.",
        "mechanics": ["Aucun ordre PAPER n'est créé.","Le capital initial reste entièrement en devise de cotation.","Le portefeuille n'est pas exposé aux variations de l'actif testé.","Seven ne crédite aucun intérêt, rendement de stablecoin ou rémunération du cash."],
        "reading": ["Une stratégie négative a fait moins bien que ne rien acheter sur cette fenêtre.","Une stratégie positive a rémunéré le risque historique pris par rapport à cette baseline nominale.","0 % dans Seven ne signifie pas 'sans risque' dans la vie réelle : le modèle ne simule pas la qualité de la devise de cotation, l'inflation, la contrepartie ou un rendement monétaire.","Cash est une référence de décision expérimentale, pas une recommandation de portefeuille."],
        "parameters": {"allocation":"100 % du capital reste dans la devise de cotation.","signals":"Aucun signal, aucun fill, aucun frais de trading dans le modèle."},
        "strengths": ["Référence extrêmement claire pour les comparaisons.","Aucune exposition au prix de l'actif testé.","Aucun frais de trading ni glissement dans le moteur.","Permet de distinguer une vraie valeur ajoutée d'une simple activité de trading."],
        "limits": ["Ne participe à aucune hausse de l'actif.","Le 0 % est nominal et propre au modèle Seven.","Inflation, rendement du cash, risque d'une devise/stablecoin et contrepartie ne sont pas simulés.","Ne représente pas nécessairement l'alternative économique réelle disponible à l'utilisateur."],
        "seven_engine": {
            "entry":"Aucune entrée : Seven n'achète pas l'actif.",
            "exit":"Aucune sortie : aucune position n'est ouverte.",
            "execution":"0 fill PAPER, 0 commission de trading, 0 glissement appliqué.",
            "positioning":"100 % en devise de cotation dans le modèle, zéro inventaire de l'actif testé.",
            "valuation":"Capital nominal inchangé dans le moteur ; aucune rémunération du cash n'est ajoutée."
        },
        "analysis_checklist": ["Toute stratégie active positive fait-elle mieux que Cash après frais et glissement ?","Le gain supplémentaire justifie-t-il le drawdown et le temps d'exposition ?","Une stratégie négative aurait-elle dû rester inactive pendant ce régime ?","Comparer aussi au Hold 50 % et 100 % pour séparer effet de marché et qualité du timing.","Ne pas confondre 0 % nominal du modèle avec absence de risques économiques réels."],
        "references": [
            {"label":"Investor.gov — Asset Allocation and Diversification","url":"https://www.investor.gov/introduction-investing/getting-started/asset-allocation","scope":"rôle du cash dans une allocation et lien avec horizon / risque"},
            {"label":"Investor.gov — Beginner's Guide to Asset Allocation","url":"https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset","scope":"cash/cash equivalents, rendement plus faible et risque d'inflation"},
            {"label":"Seven Heaven Strategy Lab — src/engine.py","url":"local://src/engine.py","scope":"absence de fill et capital nominal inchangé dans la baseline CASH"}
        ],
        "paper_only": True, "educational_only": True,
    }

}


def catalog() -> dict:
    return {
        "schema": SCHEMA,
        "articles": [deepcopy(article) for article in _ARTICLES.values()],
        "count": len(_ARTICLES),
        "paper_only": True,
    }


def article(article_id: str) -> dict:
    if article_id not in _ARTICLES:
        raise KeyError(article_id)
    return {"schema": SCHEMA, "article": deepcopy(_ARTICLES[article_id]), "paper_only": True}
