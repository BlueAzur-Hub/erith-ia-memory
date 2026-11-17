(() => {
  "use strict";

  const BUILD = "V4.9-HISTORICAL-V3-MULTI-ASSET-CORPUS-V1";
  const button = document.getElementById("labHelpToggle");
  const layer = document.getElementById("labHelpLayer");
  const live = document.getElementById("labHelpLive");
  if (!button || !layer) return;

  const HELP = [
    {key:"header",selector:".masthead",kicker:"AIDE · STRATEGY LAB",title:"En-tête du laboratoire",purpose:"Affiche l’identité du Lab et ses trois verrous visibles : build, connexion locale et mode PAPER uniquement.",look:"BUILD, LOCAL · CONNECTÉ et PAPER ONLY avant toute étude.",action:"Le bouton ? active l’aide globale ; les indicateurs d’état ne déclenchent aucun calcul.",attention:"PAPER ONLY signifie simulation : aucun ordre réel n’est autorisé par ce Lab."},
    {key:"navigation",selector:".commandbar",kicker:"AIDE · NAVIGATION",title:"Navigation du Strategy Lab",purpose:"Rejoint les grandes zones sans changer les données actives.",look:"Observatoire, Laboratoire, Historique, Comparateur, Coffre local et la source rappelée à droite.",action:"Clique une rubrique pour la rejoindre ; le mode Aide reste actif pendant la navigation.",attention:"Naviguer ne relance aucune simulation."},
    {key:"observatory",selector:"#observatory",kicker:"AIDE · OBSERVATOIRE",title:"Vue d’ensemble",purpose:"Résume la philosophie du Lab : données vérifiées, calculs reproductibles et recherche PAPER locale.",look:"La lecture stratégique à droite reprend le dernier résultat affiché.",action:"Utilise cette zone comme point de départ puis descends vers le Navigateur ou l’Atelier.",attention:"La lecture affichée décrit un résultat PAPER historique, pas une recommandation de marché."},
    {key:"readout",selector:".hero-readout",kicker:"AIDE · LECTURE STRATÉGIQUE",title:"Résumé de la simulation active",purpose:"Concentre le nom de la méthode, le capital final, le rendement PAPER et un résumé de la dernière étude affichée.",look:"Nom de stratégie, timeframe, capital final, rendement et état du moteur.",action:"Compare ce résumé au rapport détaillé plus bas avant de tirer une conclusion.",attention:"Un rendement historique positif ou négatif ne prédit pas le futur."},
    {key:"guided",selector:"#guided-mode",kicker:"AIDE · PARCOURS GUIDÉ",title:"Préparer une étude de marché",purpose:"Organise le travail : choisir les données, choisir une méthode, préparer l’Atelier puis sauvegarder si nécessaire.",look:"Données → Méthode → Atelier → Sauvegarde.",action:"Commence par une source vérifiée puis une méthode ; Seven prépare l’Atelier sans masquer les paramètres.",attention:"Le parcours guidé n’exécute rien automatiquement."},
    {key:"guided-progress",selector:".guided-progress",kicker:"AIDE · ÉTAPES",title:"État de préparation",purpose:"Montre ce qui est déjà choisi avant de lancer une étude.",look:"Source active, méthode sélectionnée, état de l’Atelier et sauvegarde facultative.",action:"Utilise ces quatre étapes comme contrôle visuel avant PAPER.",attention:"Une étape verte ou prête n’est pas une validation de performance."},
    {key:"market-library",selector:".market-library-card",kicker:"AIDE · DONNÉES",title:"Bibliothèque de marchés",purpose:"Liste les historiques réellement disponibles pour l’Atelier avec leur provenance.",look:"Paire, plateforme, dates, nombre de bougies, timeframe natif et SHA-256.",action:"Filtre la liste puis clique Utiliser sur l’historique voulu.",attention:"Sélectionner une source ne lance aucun calcul et ne télécharge rien."},
    {key:"market-use",selector:".market-use-button",kicker:"AIDE · SOURCE",title:"Utiliser cet historique",purpose:"Rend cette ligne active pour la prochaine étude.",look:"Paire, exchange, période, bougies et intégrité de la même ligne.",action:"Clique pour envoyer cette source au Navigateur et à l’Atelier.",attention:"Aucun backtest, téléchargement ou ordre réel n’est déclenché."},
    {key:"historical-vault",selector:"#historical-vault",kicker:"AIDE · HISTORICAL VAULT",title:"Profondeur historique vérifiée",purpose:"Montre ce que le Coffre Seven a réellement indexé sur plusieurs années et sépare cette profondeur des sources déjà installées dans le Lab.",look:"Actif, mois vérifiés, profondeur consécutive, années complètes et statut INDEXÉ ou LOCAL · UTILISABLE.",action:"Installe explicitement une année complète 2024/2025 ou utilise une année déjà vérifiée localement.",attention:"INDEXÉ ne signifie pas installé. Une année n’entre dans le moteur qu’après téléchargement public, CHECKSUM, continuité minute, agrégation 1h et relecture locale."},
    {key:"historical-install",selector:".historical-install-button",kicker:"AIDE · INSTALLATION HISTORIQUE",title:"Installer une année vérifiée",purpose:"Installe l’année depuis le bundle annuel Seven déjà vérifié lorsqu’il est disponible ; sinon utilise le chemin Binance Public Data V1 avec 12 CHECKSUM, puis construit une source locale 1h.",look:"Actif, année, statut INDEXÉ et espace disque protégé.",action:"Clique une seule fois puis laisse Seven valider l’année complète avant qu’elle apparaisse dans la Bibliothèque de marchés.",attention:"Le bundle V3 couvre BTC/ETH/BNB/XRP/SOL 2024–2025 et est revalidé par taille, SHA-256, schéma, provenance mensuelle et continuité 1h. Le fallback V1 refuse aussi tout mois incomplet. Aucun ordre réel n’est possible."},
    {key:"historical-use",selector:".historical-use-button",kicker:"AIDE · HISTORIQUE LOCAL",title:"Utiliser cette année",purpose:"Sélectionne une année déjà installée comme source du Navigateur et de l’Atelier.",look:"Statut LOCAL · UTILISABLE et nombre de bougies 1h.",action:"Clique pour préparer les prochaines études sur cette année sans la retélécharger.",attention:"Sélectionner la source ne lance pas de simulation."},
    {key:"strategy-library",selector:".strategy-library-card",kicker:"AIDE · MÉTHODE",title:"Bibliothèque de stratégies",purpose:"Présente les méthodes exécutables par Seven avec leur logique et leur principal risque.",look:"Famille, fonctionnement, marché recherché, point faible et réglages de départ.",action:"Choisis une méthode, consulte sa fiche si utile, puis prépare-la dans l’Atelier.",attention:"Un indicateur seul n’est pas une stratégie complète d’entrée et de sortie."},
    {key:"learn",selector:"#guide-learn, #guided-atlas-knowledge",kicker:"AIDE · COMPRENDRE",title:"Comprendre la méthode",purpose:"Ouvre la fiche professionnelle de la méthode sélectionnée.",look:"Définition, calcul, lecture, paramètres, forces, limites et règles Seven.",action:"Lis la fiche puis reviens à l’Atelier lorsque la logique est claire.",attention:"Consulter une fiche ne change aucun réglage et ne lance aucun calcul."},
    {key:"prepare-study",selector:"#guide-create",kicker:"AIDE · PRÉPARATION",title:"Préparer l’étude",purpose:"Transfère la source et les réglages de départ choisis vers l’Atelier.",look:"Source et méthode affichées dans le Navigateur.",action:"Clique pour préparer le formulaire de l’Atelier.",attention:"Aucune simulation n’est lancée."},
    {key:"compare-shortcut",selector:"#guide-compare",kicker:"AIDE · COMPARER",title:"Préparer la comparaison",purpose:"Rejoint la logique de comparaison avec une base commune.",look:"Même source, timeframe, capital, frais et glissement.",action:"Prépare l’étude puis lance Comparer les 7 méthodes dans l’Atelier.",attention:"Ce raccourci ne calcule rien à lui seul."},
    {key:"expert",selector:"#guide-expert",kicker:"AIDE · ATELIER",title:"Atelier complet",purpose:"Rejoint tous les paramètres scientifiques et les moteurs PAPER existants.",look:"Timeframe, capital, coûts et paramètres propres à la méthode.",action:"Modifie seulement ce que tu veux tester puis lance PAPER.",attention:"Accéder à l’Atelier ne lance aucun calcul."},
    {key:"paper-future",selector:"#guide-paper",kicker:"AIDE · V5",title:"Robot PAPER",purpose:"Annonce la future étape V5 d’exécution fictive continue.",look:"Cette carte est volontairement inactive dans ce build.",action:"Aucune action disponible actuellement.",attention:"Aucun automate temps réel ni ordre réel n’est activé."},
    {key:"knowledge",selector:".knowledge-panel",kicker:"AIDE · KNOWLEDGE LAYER",title:"Fiche professionnelle",purpose:"Explique une méthode en profondeur sans transformer l’Atelier en manuel permanent.",look:"Définition, schéma, calcul, paramètres, forces, limites, règles Seven et preuves locales.",action:"Lis la fiche puis utilise ses actions pour revenir au graphique, à l’Atelier, au Comparateur ou au Coffre.",attention:"Une fiche explique une méthode ; elle ne garantit jamais sa rentabilité."},
    {key:"knowledge-actions",selector:"#ema-action-chart, #bollinger-action-chart, #donchian-action-chart, #ema-action-prepare, #bollinger-action-prepare, #donchian-action-prepare, #ema-action-compare, #bollinger-action-compare, #donchian-action-compare, #ema-action-results, #bollinger-action-results, #donchian-action-results, #passive-action-prepare, #passive-action-compare, #passive-action-results",kicker:"AIDE · KNOWLEDGE LAYER",title:"Action depuis une fiche",purpose:"Relie la leçon à une zone opérationnelle du Lab.",look:"Le libellé indique si l’action va vers le graphique, l’Atelier, le Comparateur ou des résultats existants.",action:"Utilise l’action après avoir vérifié la source active.",attention:"Préparer ne lance pas PAPER ; Voir mes résultats relit le Coffre sans recalculer."},
    {key:"source-panel",selector:".source-panel",kicker:"AIDE · SOURCES",title:"Source active & coffre historique",purpose:"Montre exactement quelles données alimentent les prochaines simulations.",look:"Actif, période, couverture, résolution, intégrité et provenance SHA-256.",action:"Choisis, collecte ou certifie une source publique puis sélectionne-la comme source active.",attention:"Une source vérifiée garantit l’intégrité du fichier, pas la qualité future d’une stratégie."},
    {key:"source-summary",selector:".source-layout",kicker:"AIDE · PROVENANCE",title:"Résumé de la source active",purpose:"Condense les informations nécessaires pour savoir ce qui est réellement testé.",look:"Marché, fenêtre UTC, nombre de bougies et empreinte/provenance.",action:"Contrôle ces quatre tuiles avant de comparer deux résultats.",attention:"Deux études sur des périodes ou résolutions différentes ne sont pas directement équivalentes."},
    {key:"source-actions",selector:"#import, #binance-monthly-import, #okx-import",kicker:"AIDE · COLLECTE",title:"Charger ou certifier une source",purpose:"Ajoute ou vérifie les données publiques prévues par le Lab.",look:"Paire, période, espace disque et mécanisme d’intégrité.",action:"Déclenche uniquement la collecte ou la certification explicitement demandée.",attention:"Aucune clé de compte n’est utilisée ; aucune stratégie n’est lancée automatiquement."},
    {key:"source-choice",selector:"#source-choice",kicker:"AIDE · SOURCE ACTIVE",title:"Choisir la source des simulations",purpose:"Détermine l’historique que le moteur utilisera pour les prochains calculs.",look:"Paire, plateforme et archive sélectionnée.",action:"Choisis une source existante ; le Lab remet à zéro les analyses qui ne correspondent plus à ce contexte.",attention:"Changer de source change le contexte scientifique des résultats suivants."},
    {key:"laboratory",selector:"#laboratory",kicker:"AIDE · ATELIER",title:"Atelier de configuration",purpose:"Compose le scénario PAPER qui sera envoyé au moteur local.",look:"Méthode, timeframe, capital, coûts et paramètres spécifiques.",action:"Configure le scénario puis utilise l’un des quatre boutons d’étude.",attention:"Aucun paramètre de cette zone n’envoie d’ordre à une plateforme."},
    {key:"strategy-kind",selector:"#kind",kicker:"AIDE · STRATÉGIE",title:"Famille de stratégie",purpose:"Choisit la logique exécutée par le moteur PAPER.",look:"EMA, Bollinger, Donchian, DCA, Buy & Hold, Cash ou règles personnalisées.",action:"Change la méthode puis vérifie les champs qui apparaissent en dessous.",attention:"Changer de méthode change les règles d’entrée et de sortie du prochain test."},
    {key:"timeframe",selector:".timeframe-bar",kicker:"AIDE · TIMEFRAME",title:"Horizon des bougies",purpose:"Définit la durée représentée par chaque bougie du test.",look:"Seuls les timeframes autorisés par la source active sont disponibles.",action:"Choisis 1m, 5m, 15m, 1h ou 4h selon la source.",attention:"Les mêmes paramètres numériques n’ont pas le même sens sur 1h et 4h."},
    {key:"costs",selector:"[name='capital'], [name='fee_pct'], [name='slippage_pct'], .fee-reference",kicker:"AIDE · CAPITAL & COÛTS",title:"Hypothèses financières PAPER",purpose:"Définit le capital fictif et les frictions utilisées par la simulation.",look:"Capital initial, frais Taker par côté, glissement par côté et référence Maker informative.",action:"Ajuste les hypothèses avant le test si tu veux mesurer leur impact.",attention:"Les frais Maker affichés en référence ne sont pas utilisés automatiquement pour les fills fictifs."},
    {key:"ema-params",selector:"#ema-fields",kicker:"AIDE · EMA",title:"Paramètres EMA",purpose:"Définit les fenêtres rapide et lente du croisement de moyennes.",look:"Nombre de bougies de l’EMA rapide et de l’EMA lente.",action:"Modifie les périodes puis relance PAPER pour comparer proprement.",attention:"Une EMA plus courte réagit davantage mais peut produire plus de faux signaux."},
    {key:"bb-params",selector:"#bb-fields",kicker:"AIDE · BOLLINGER",title:"Paramètres Bollinger",purpose:"Définit la période de moyenne et la largeur statistique des bandes.",look:"Période et nombre d’écarts-types sigma.",action:"Change une hypothèse à la fois pour garder l’expérience lisible.",attention:"Des bandes plus serrées ou plus larges changent la fréquence des signaux."},
    {key:"donchian-params",selector:"#donchian-fields",kicker:"AIDE · DONCHIAN",title:"Paramètres Donchian",purpose:"Définit les fenêtres causales de cassure d’entrée et de sortie.",look:"Entrée 55 et sortie 20 bougies par défaut.",action:"Teste d’autres fenêtres seulement dans une expérience explicitement identifiée.",attention:"Le canal exclut la bougie signal et le fill reste fictif à l’ouverture suivante."},
    {key:"dca-params",selector:"#dca-fields",kicker:"AIDE · DCA",title:"Paramètres DCA",purpose:"Programme des achats fictifs à intervalles réguliers.",look:"Intervalle en minutes et montant par achat.",action:"Ajuste fréquence ou montant puis compare au même historique.",attention:"Le DCA n’est pas une garantie de meilleur prix moyen ou de profit."},
    {key:"custom-params",selector:"#custom-fields",kicker:"AIDE · STRATÉGIE PERSONNELLE",title:"Créateur de règles",purpose:"Compose une stratégie sans écrire de code à partir des règles autorisées.",look:"Entrée, filtre, sortie, RSI, volume et protections fictives.",action:"Change une règle à la fois puis compare avec le profil d’origine.",attention:"Stop et objectif sont contrôlés après clôture puis remplis fictivement à l’ouverture suivante."},
    {key:"run",selector:"#run",kicker:"AIDE · PAPER",title:"Lancer la simulation PAPER",purpose:"Rejoue la configuration visible sur l’historique actif avec le moteur Seven.",look:"Source, timeframe, capital, frais, glissement et paramètres de stratégie.",action:"Clique pour calculer fills fictifs, capital, risque, graphique et rapport local.",attention:"Aucun ordre réel. Le résultat dépend exactement des données et coûts affichés."},
    {key:"compare",selector:"#compare",kicker:"AIDE · COMPARAISON",title:"Comparer les 7 méthodes",purpose:"Rejoue plusieurs méthodes sur une base commune.",look:"Même source, timeframe, capital et hypothèses de coût.",action:"Clique pour remplir la Matrice de comparaison PAPER.",attention:"Le tableau ne choisit pas automatiquement une meilleure stratégie."},
    {key:"robustness-run",selector:"#robustness-run",kicker:"AIDE · ROBUSTESSE",title:"Éprouver cette stratégie dans le temps",purpose:"Teste la stabilité chronologique au lieu de regarder un seul résultat global.",look:"Sélection sur le passé puis vérification sur des fenêtres ultérieures.",action:"Clique pour lancer Aether Scientific.",attention:"Une vérification négative peut réfuter une belle performance globale."},
    {key:"filters-run",selector:"#filters-run",kicker:"AIDE · RESEARCH",title:"Comparer 5 variantes de filtres",purpose:"Compare plusieurs filtres d’entrée en gardant les autres hypothèses communes.",look:"Profil d’origine, variantes RSI/volume, coûts et fenêtres de vérification.",action:"Clique pour lancer Aether Research sur EMA ou stratégie personnalisée.",attention:"Une variante sans trade n’est pas automatiquement gagnante."},
    {key:"profiles",selector:".profile-group",kicker:"AIDE · PROFILS",title:"Bibliothèque de profils",purpose:"Conserve des réglages d’Atelier pratiques pour les recharger plus tard.",look:"Nom de configuration et profil sélectionné.",action:"Enregistre ou recharge un profil de paramètres.",attention:"Un profil n’est pas un rapport de performance et ne relance rien automatiquement."},
    {key:"save-profile",selector:"#save-profile",kicker:"AIDE · PROFIL",title:"Enregistrer ce profil",purpose:"Sauvegarde les réglages actuels lorsqu’un workspace libre autorise les écritures manuelles.",look:"Dans un workspace canonique géré par Seven, cette action est volontairement désactivée.",action:"Les profils de référence sont reconstruits automatiquement par Seven.",attention:"Explorer le Lab ne doit pas polluer le Coffre canonique."},
    {key:"strategy-spec",selector:".strategy-spec-group",kicker:"AIDE · STRATEGYSPEC",title:"Sauvegarde portable de stratégie",purpose:"Conserve une recette rejouable avec source, résolution, règles, capital et coûts.",look:"Nom, empreinte, intention et limites expliquées après rechargement.",action:"Sauvegarde une recette ou recharge-en une pour la rejouer.",attention:"StrategySpec décrit une stratégie ; ce n’est ni un résultat ni un ordre."},
    {key:"save-spec",selector:"#save-strategy-spec",kicker:"AIDE · SAUVEGARDE",title:"Sauvegarder la stratégie",purpose:"Crée le StrategySpec correspondant à la configuration actuelle.",look:"Nom de sauvegarde et paramètres visibles dans l’Atelier.",action:"Clique pour écrire la recette dans le workspace local.",attention:"Aucune simulation n’est lancée."},
    {key:"replay-spec",selector:"#replay-strategy-spec",kicker:"AIDE · REPLAY",title:"Rejouer cette stratégie avec Seven",purpose:"Recalcule un StrategySpec sauvegardé avec le moteur Seven.",look:"Source, résolution et règles enregistrées dans la recette.",action:"Clique pour produire une nouvelle simulation PAPER et un nouveau rapport.",attention:"Rejouer crée un nouveau résultat ; le StrategySpec n’est jamais un ordre de marché."},
    {key:"results",selector:"#results",kicker:"AIDE · RÉSULTATS",title:"Lecture de la simulation",purpose:"Rassemble le résultat du dernier calcul PAPER et ses diagnostics.",look:"Capital final, rendement, drawdown, frais, inventaire, fills, graphique, Microscope, Quant et Forensics.",action:"Lis d’abord les métriques globales puis descends vers les preuves détaillées.",attention:"Un résultat isolé n’établit pas la robustesse d’une stratégie."},
    {key:"equity",selector:"#equity, #return",kicker:"AIDE · PERFORMANCE",title:"Capital final & rendement PAPER",purpose:"Mesure la valeur finale du portefeuille fictif et son évolution relative au capital initial.",look:"Montant final et pourcentage de rendement sur la période active.",action:"Compare-les au Buy & Hold, au Cash et aux coûts de la même période.",attention:"Rendement historique ≠ rendement futur."},
    {key:"drawdown",selector:"#drawdown",kicker:"AIDE · RISQUE",title:"Drawdown maximal",purpose:"Mesure la plus forte baisse du portefeuille depuis un sommet antérieur pendant le test.",look:"Une valeur plus négative signifie une chute historique plus profonde à supporter.",action:"Compare le drawdown entre méthodes et fenêtres, pas seulement le rendement final.",attention:"Le drawdown observé est historique et peut être dépassé dans d’autres périodes."},
    {key:"fees",selector:"#fees",kicker:"AIDE · COÛTS",title:"Frais simulés",purpose:"Additionne les commissions fictives payées par les fills du scénario.",look:"Montant des commissions et nombre de fills associés.",action:"Utilise ce chiffre avec le scénario sans frictions pour mesurer le poids des coûts.",attention:"L’écart total avec un scénario sans coûts n’est pas une simple soustraction de commissions."},
    {key:"inventory",selector:"#cash, #inventory, #counts, #rejected",kicker:"AIDE · PORTEFEUILLE",title:"État final du portefeuille PAPER",purpose:"Montre le cash, l’inventaire restant, le nombre d’achats/ventes et les ordres fictifs refusés.",look:"Cash restant, actif détenu, événements d’achat/vente et refus du moteur.",action:"Vérifie si une position reste ouverte avant d’interpréter le résultat.",attention:"Un inventaire ouvert est valorisé au dernier prix historique ; il n’est pas réalisé."},
    {key:"equity-chart",selector:".chart-panel",kicker:"AIDE · COURBE DE CAPITAL",title:"Trajectoire du portefeuille",purpose:"Montre comment la valeur totale fictive a évolué pendant l’historique testé.",look:"Paliers, baisses, reprises et date du dernier point.",action:"Utilise la courbe pour repérer les périodes de stress avant d’ouvrir Quant ou Forensics.",attention:"Le graphique est une conséquence du backtest, pas une prévision."},
    {key:"microscope",selector:"#market-microscope",kicker:"AIDE · MICROSCOPE",title:"Microscope des bougies",purpose:"Relit les bougies de la source active avec les indicateurs et fills PAPER du rapport.",look:"OHLCV, EMA/SMA/Bollinger/VWAP, marqueurs d’achat/vente et navigation temporelle.",action:"Déplace la fenêtre ou survole une bougie pour comprendre où les événements se produisent.",attention:"Les marqueurs sont des fills supposés à l’ouverture suivante, pas des opérations réelles."},
    {key:"quant",selector:"#quant-desk",kicker:"AIDE · QUANT",title:"Anatomie du risque",purpose:"Décompose la performance en statistiques de positions et de drawdown.",look:"Positions clôturées, taux de réussite, profit factor, exposition, résultat réalisé et latent.",action:"Utilise ces métriques pour comprendre comment le rendement a été obtenu.",attention:"Un taux de réussite faible peut coexister avec une stratégie viable ; aucune métrique seule ne suffit."},
    {key:"profit-factor",selector:"#quant-profitfactor, #quant-winrate, #quant-exposure",kicker:"AIDE · MÉTRIQUES",title:"Qualité des positions",purpose:"Décrit la proportion de trades gagnants, le rapport gains/pertes et le temps passé exposé.",look:"Taux de réussite, Profit Factor et temps en position.",action:"Lis ces valeurs ensemble avec le drawdown et le résultat net.",attention:"Profit Factor et win rate ne sont calculables que lorsque les positions clôturées le permettent."},
    {key:"latent",selector:"#quant-realized, #quant-unrealized",kicker:"AIDE · RÉSULTAT",title:"Réalisé & latent",purpose:"Sépare les gains/pertes des positions clôturées de la valeur d’un inventaire encore ouvert.",look:"Résultat réalisé et résultat latent.",action:"Vérifie cette séparation avant de comparer deux backtests.",attention:"Le latent dépend du dernier prix historique et n’est pas une vente effectuée."},
    {key:"forensics",selector:"#forensic-desk",kicker:"AIDE · FORENSICS",title:"Anatomie des décisions PAPER",purpose:"Reconstruit chaque position à partir de la règle réellement déclenchée et de l’historique conservé.",look:"Positions, fills, motifs d’entrée/sortie, MFE/MAE lorsque disponibles et intégrité de la source.",action:"Filtre puis ouvre Détails sur une position pour comprendre sa chronologie.",attention:"Forensics explique ce qui s’est passé ; il ne prouve pas qu’un autre filtre aurait évité la perte."},
    {key:"forensic-filter",selector:"#forensic-filter",kicker:"AIDE · FORENSICS",title:"Filtrer les positions",purpose:"Réduit le registre aux positions gagnantes, perdantes, ouvertes ou à toutes les positions.",look:"Le nombre de positions affichées après filtrage.",action:"Change le filtre pour étudier un type de position.",attention:"Le filtre ne recalcule pas le backtest."},
    {key:"comparison",selector:"#comparison",kicker:"AIDE · COMPARATEUR",title:"Matrice de comparaison PAPER",purpose:"Place plusieurs méthodes côte à côte sur la même source et les mêmes hypothèses de coût.",look:"Rendement, capital final, drawdown, frais et fills.",action:"Utilise Examiner pour approfondir une méthode précise.",attention:"Le meilleur chiffre de cette période n’est pas automatiquement la meilleure stratégie future."},
    {key:"examine",selector:".study-button",kicker:"AIDE · COMPARATEUR",title:"Examiner cette méthode",purpose:"Rejoue seule la méthode de cette ligne pour obtenir son rapport détaillé.",look:"La ligne sélectionnée et le contexte de la comparaison.",action:"Clique pour charger la méthode, relancer PAPER, enregistrer un rapport puis ouvrir sa lecture.",attention:"Examiner effectue réellement un nouveau calcul PAPER et ajoute un rapport au Coffre."},
    {key:"scientific",selector:"#robustness",kicker:"AIDE · AETHER SCIENTIFIC",title:"Laboratoire de robustesse",purpose:"Vérifie la stratégie sur plusieurs fenêtres chronologiques plutôt que sur une seule période globale.",look:"Entraînement antérieur, vérification ultérieure, drawdown et scénario de coûts renforcés.",action:"Compare les fenêtres et recherche les échecs autant que les réussites.",attention:"Une fenêtre de vérification n’est pas nécessairement aveugle si elle a déjà été consultée auparavant."},
    {key:"research",selector:"#strategy-research",kicker:"AIDE · AETHER RESEARCH",title:"Studio des stratégies comparées",purpose:"Compare une famille limitée de filtres sans modifier librement les paramètres après lecture des résultats.",look:"Variante sélectionnée sur le passé, vérifications ultérieures et comparaison au profil d’origine.",action:"Ouvre les détails des variantes pour comprendre ce qui a été sélectionné et ce qui a seulement été observé.",attention:"Voir les résultats ultérieurs des variantes non retenues sert à la transparence, pas au retuning après coup."},
    {key:"vault",selector:"#vault",kicker:"AIDE · COFFRE",title:"Coffre de tes expériences",purpose:"Conserve les rapports PAPER et comparaisons dans le workspace local.",look:"Journal des simulations et comparaisons enregistrées.",action:"Clique un ancien résultat pour le relire sans refaire le calcul ; clique une comparaison pour restaurer son tableau.",attention:"Sauvegarde le dossier workspace avant de déplacer ou remplacer la clé."},
    {key:"history-run",selector:"#history .history-item",kicker:"AIDE · COFFRE",title:"Recharger un rapport sauvegardé",purpose:"Relit un ancien rapport PAPER depuis le workspace.",look:"Méthode, timeframe, date et rendement enregistré.",action:"Clique pour réafficher le rapport et ses diagnostics.",attention:"Cette action ne relance pas la simulation."},
    {key:"history-comparison",selector:"#comparison-history .history-item",kicker:"AIDE · COFFRE",title:"Recharger une comparaison",purpose:"Relit un ancien tableau de comparaison depuis le workspace.",look:"Nombre de stratégies, timeframe et date de création.",action:"Clique pour restaurer le tableau dans le Comparateur.",attention:"Cette action ne recalcule pas les sept méthodes."}
  ];

  let active = false;
  let currentElement = null;

  function allTargets() {
    const rows = [], seen = new Set();
    for (const item of HELP) {
      for (const element of document.querySelectorAll(item.selector)) {
        if (seen.has(element)) continue;
        seen.add(element);
        rows.push([item, element]);
      }
    }
    return rows;
  }
  function setMarks(on) {
    for (const [, element] of allTargets()) {
      element.classList.toggle("lab-help-target", on);
      if (!on) element.classList.remove("lab-help-current");
    }
  }
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function cardHtml(item) {
    return [
      '<span class="lab-help-kicker">' + escapeHtml(item.kicker) + '</span>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p><b>À quoi ça sert ?</b> ' + escapeHtml(item.purpose) + '</p>',
      '<p><b>Que regarder ?</b> ' + escapeHtml(item.look) + '</p>',
      '<p><b>Action possible</b> ' + escapeHtml(item.action) + '</p>',
      item.attention ? '<p class="lab-help-attention"><b>Attention</b> · ' + escapeHtml(item.attention) + '</p>' : "",
      '<p class="lab-help-hint">Mode Aide actif · survole une autre zone · Échap ou ? pour fermer.</p>'
    ].join("");
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function positionLayer(anchor, point) {
    layer.hidden = false;
    layer.style.visibility = "hidden";
    layer.style.left = "14px";
    layer.style.top = "14px";
    const box = layer.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || innerWidth;
    const vh = document.documentElement.clientHeight || innerHeight;
    const margin = 14;
    let left, top;
    if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
      left = point.x + 18;
      top = point.y + 18;
    } else {
      const rect = anchor.getBoundingClientRect();
      left = rect.right + 14;
      top = rect.top;
      if (left + box.width > vw - margin) left = rect.left - box.width - 14;
      if (left < margin) left = rect.left;
    }
    left = clamp(left, margin, Math.max(margin, vw - box.width - margin));
    top = clamp(top, margin, Math.max(margin, vh - box.height - margin));
    layer.style.left = Math.round(left) + "px";
    layer.style.top = Math.round(top) + "px";
    layer.style.visibility = "visible";
  }
  function clearCurrent() {
    if (currentElement) currentElement.classList.remove("lab-help-current");
    currentElement = null;
  }
  function show(item, element, point) {
    if (!active || !item || !element) return;
    clearCurrent();
    currentElement = element;
    currentElement.classList.add("lab-help-target", "lab-help-current");
    layer.innerHTML = cardHtml(item);
    layer.setAttribute("aria-hidden", "false");
    if (live) live.textContent = item.title + ". " + item.purpose;
    positionLayer(element, point);
  }
  function hide() {
    clearCurrent();
    layer.hidden = true;
    layer.setAttribute("aria-hidden", "true");
  }
  function overview() {
    if (!active) return;
    show({
      kicker:"AIDE · STRATEGY LAB",
      title:"Comprendre sans bloquer le laboratoire",
      purpose:"Survole les zones signalées pour savoir ce qu’elles montrent ou ce qu’elles feront avant de cliquer.",
      look:"Observatoire, données, méthodes, Historical Vault, Atelier, résultats, Microscope, Quant, Forensics, Comparateur, Scientific, Research, StrategySpec et Coffre.",
      action:"Utilise ensuite le Lab normalement. L’aide reste active pendant toute la navigation et change seulement l’explication affichée.",
      attention:"L’aide ne lance aucune source, aucun calcul, aucune sauvegarde et aucun ordre réel."
    }, button);
  }
  function setActive(next) {
    active = Boolean(next);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.setAttribute("aria-label", active ? "Désactiver l’aide contextuelle globale du Strategy Lab" : "Activer l’aide contextuelle globale du Strategy Lab");
    document.body.classList.toggle("lab-help-mode", active);
    setMarks(active);
    if (active) overview(); else hide();
  }
  function resolve(node) {
    if (!(node instanceof Element)) return null;
    for (let element = node; element; element = element.parentElement) {
      const item = HELP.find(topic => element.matches(topic.selector));
      if (item) return {item, element};
    }
    return null;
  }

  button.addEventListener("click", () => setActive(!active));
  document.addEventListener("pointerover", event => {
    if (!active) return;
    const hit = resolve(event.target);
    if (!hit) return;
    if (currentElement === hit.element && event.relatedTarget instanceof Node && hit.element.contains(event.relatedTarget)) return;
    show(hit.item, hit.element, {x:event.clientX, y:event.clientY});
  }, true);
  document.addEventListener("pointerout", event => {
    if (!active || !currentElement) return;
    if (!(event.target instanceof Node) || !currentElement.contains(event.target)) return;
    if (event.relatedTarget instanceof Node && currentElement.contains(event.relatedTarget)) return;
    hide();
  }, true);
  document.addEventListener("focusin", event => {
    if (!active) return;
    const hit = resolve(event.target);
    if (hit) show(hit.item, hit.element);
  }, true);
  document.addEventListener("keydown", event => {
    const tag = event.target?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (event.key === "Escape" && active) { setActive(false); return; }
    if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setActive(!active);
    }
  }, true);
  window.addEventListener("resize", () => {
    if (active && !layer.hidden && currentElement) positionLayer(currentElement);
  }, {passive:true});

  globalThis.SevenLabHelpLayer = Object.freeze({
    build:BUILD,
    active:() => active,
    open:() => setActive(true),
    close:() => setActive(false),
    topics:HELP.map(item => item.key),
    availableTopics:() => HELP.filter(item => document.querySelector(item.selector)).map(item => item.key),
    late_mount_safe:true,
    storage:false,
    network:false,
    engine:false
  });
})();
