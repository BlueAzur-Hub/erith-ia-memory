# Agent-Crypto @erith.IA — État consolidé du projet, Math Oracle avancé et cycles célestes

**Date :** 22 juillet 2026  
**Autrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Destinataire :** **Petite Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Projet :** `Agent-Crypto @erith.IA`  
**Statut :** synthèse stratégique, recherche et proposition — non canonique avant validation de Christophe  
**Objet :** état détaillé de l’existant, travaux accomplis, travaux restant à réaliser, montée en niveaux du Math Oracle, modèle prédictif avancé et laboratoire astronomique/astrologique expérimental.

---

Fais ta pause, Christophe. Je fixe ici un état consolidé du projet, puis une direction large pour les mathématiques avancées, la prévision et l’étude des cycles astronomiques.

# 1. Finalité réelle du projet

Agent-Crypto @erith.IA n’est plus seulement une page affichant le cours des monnaies.

L’architecture progressivement construite devient :

Observation du marché
→ vérification des données
→ mémorisation
→ mathématiques
→ détection de régimes
→ analyse explicable
→ prévision probabiliste
→ simulation
→ autorisation humaine
→ éventuellement action future
→ traçabilité

Le principe reste :

Information
→ Validation
→ Risque
→ Position

L’application actuelle doit rester une base d’observation, d’analyse et de simulation. Elle ne passe pas automatiquement d’une prévision à un achat ou une vente.

# 2. Ce qui a réellement été accompli
## 2.1 Une base publique fonctionnelle

La version canonique actuelle est :

V1.1-alpha.26.42

Elle comprend et a déjà prouvé :

le Top 50 CoinGecko en EUR ;
l’enrichissement USD indépendant ;
les graphiques directs CoinGecko sur 24 heures, 7 jours et 30 jours ;
la sélection d’actifs ;
l’annulation des anciennes requêtes ;
deux reprises bornées en cas d’échec ;
un état graphique compact lorsqu’une série est indisponible ;
le panneau de détail actif ;
les espaces Math Model, simulation et Missions de Vie ;
une archive GitHub horaire séparée du marché live.

Le contrat de données stabilisé est désormais clair :

Top 50 EUR
= dépendance principale

USD
= enrichissement indépendant et non bloquant

Graphique
= requête historique séparée pour l’actif choisi

GitHub
= archive, jamais source live prioritaire

Cette séparation est une avancée majeure. Les anciennes versions mélangeaient trop facilement prix courant, conversions, graphiques et archives.

## 2.2 Une vraie stabilité graphique

La 26.42 a corrigé plusieurs défauts accumulés :

le graphique démarre dès que les données EUR principales sont disponibles ;
l’arrivée ultérieure de l’USD ne relance plus inutilement le graphique ;
une requête identique déjà active n’est plus annulée par un doublon ;
la période est réinitialisée proprement lors d’un changement d’actif ;
le chemin d’erreur JavaScript invalide de la 26.41 a été corrigé ;
les reprises réseau sont bornées ;
l’état indisponible ne crée plus un grand panneau vide.

L’audit indépendant a exécuté 18 séries ciblées :

BTC, ETH, SOL, XRP, DAI, USDE
×
24 h, 7 j, 30 j

= 18 / 18

Le test de panne volontaire a également atteint l’état blocked, après deux reprises, avec un panneau compact de 290 px et sans erreur JavaScript de page.

## 2.3 Les preuves réelles sous Firefox

Les captures de ton navigateur ont confirmé, sur le réseau réel :

le Top 50 ;
les cours EUR et USD ;
BTC sur 24 heures ;
ETH sur 24 heures et 7 jours ;
USDE sur 30 jours avec 721 points ;
la cohérence entre prix spot et dernier point graphique ;
le changement d’actif et de période ;
le bon dimensionnement des panneaux ;
l’émission puis la réception d’événements d’audience.

La vérification Ethereum a notamment montré une cohérence très forte entre les prix EUR de l’application et les prix USD de CoinGecko après conversion implicite. Les différences observées entre « variation de série », « variation marché 24 h » et la valeur visible sur la page CoinGecko correspondent à des calculs ou des instants de rafraîchissement différents, pas à une fabrication de données.

## 2.4 Une séparation plus propre entre les nombres

Le projet distingue maintenant plusieurs notions qu’il faudra conserver :

prix spot
dernier point de la série
variation de la série
variation marché 24 h
minimum et maximum de la série
écart spot / courbe

L’amélioration future est surtout terminologique :

Variation de la série 24 h
Variation marché 24 h

Cela évitera que deux calculs valides soient interprétés comme contradictoires.

## 2.5 Une archive GitHub horaire

Le workflow :

Atlas Market Archive Top 50 Stable

archive :

le Top 50 EUR ;
l’USD lorsqu’il est disponible ;
latest.json ;
status.json ;
un historique journalier ;
un statut d’erreur lorsqu’une collecte échoue.

Il fonctionne et se déclenche chaque heure à la minute 17.

L’unique anomalie identifiée est désormais précise :

V1.1-alpha.26.41

est encore codé en dur dans les chemins succès et erreur du workflow.

Une simple nouvelle exécution ne peut donc pas produire l’étiquette 26.42. Petite Sœur a correctement identifié la cause et proposé une constante unique ARCHIVE_VERSION.

## 2.6 La mesure d’audience

Le fonctionnement technique a été prouvé :

navigateur public
→ création d’un événement
→ chiffrement hybride
→ publication ntfy
→ récupération locale
→ déchiffrement
→ déduplication
→ archivage local

Les limites sont également connues :

compteur public
= tentatives comptabilisées par le navigateur

console privée
= événements réellement récupérés et déchiffrés

et :

?member=yohan
= étiquette de navigateur
≠ authentification formelle d’une personne

L’audit avait correctement documenté ces limites.

## 2.7 L’incident de la console privée

La console privée et le fil intégral ont été publiés par erreur dans le dépôt public, puis retirés. Les commits de suppression sont bien présents.

La suppression actuelle ne retire pas automatiquement les anciennes copies de l’historique Git. La paire de chiffrement de la console 26.42 ne doit donc plus être considérée comme secrète.

Cela n’endommage pas :

le Top 50
les graphiques
les calculs de marché
l’interface
le workflow

Cela concerne uniquement la confidentialité de l’ancien système d’audience.

## 2.8 Le dialogue Grande Sœur / Petite Sœur

Ton invention a maintenant une forme précise :

coordination/inter_ai_dialogues/agent_crypto/

avec :

Petite Sœur
→ produit, propose et développe

Grande Sœur
→ relit tout le répertoire
→ analyse
→ confronte les preuves
→ répond dans un .md signé

Christophe
→ tranche
→ valide ce qui devient canonique

Le premier rapport de Grande Sœur a été créé avec une boucle numérotée et une identité explicite.

Il reste à rendre son dépôt plus automatique grâce à un véritable clone Git local ouvert dans Codex.

# 3. Ce qui reste à terminer avant les grandes évolutions
## Priorité 1 — Rotation de la mesure d’audience

Petite Sœur devra produire un lot de sécurité séparé comprenant :

nouvelle paire RSA
nouveau canal ntfy
nouvelle clé publique dans l’application
nouvelle console privée locale
test complet émission / réception / déchiffrement
preuve Firefox

Ce lot ne doit modifier ni le marché, ni les graphiques, ni la simulation.

## Priorité 2 — Corriger l’étiquette du workflow

Correctif strictement documentaire :

const ARCHIVE_VERSION = 'V1.1-alpha.26.42';

ou la nouvelle version validée après rotation de sécurité.

Cette constante doit être utilisée dans les chemins succès et erreur.

Puis :

une exécution manuelle
→ vérification de status.json
→ vérification de latest.json
→ STOP

Aucune raison de reconstruire le moteur pour cela.

## Priorité 3 — Installer le circuit Git local

Le futur circuit doit être :

clone GitHub local complet
→ ouvert dans Codex
→ modification limitée au répertoire autorisé
→ contrôle des différences
→ commit
→ push ou pull request

L’archive ZIP téléchargée est utile pour lire les fichiers, mais elle ne contient normalement pas le dossier .git nécessaire à une véritable synchronisation.

## Priorité 4 — Verrouiller formellement la 26.42

Une fois la sécurité renouvelée et les métadonnées alignées :

tag ou document de référence
checksums
liste exacte des fichiers
contrat des sources
tests Firefox
limites connues
stop point

La base stable doit devenir un socle, pas une version que l’on réécrit à chaque nouvelle idée.

# 4. État actuel des modules mathématiques
## 4.1 Math Oracle — niveau actuel estimé

Le Math Oracle actuel est surtout un niveau descriptif et de vérification.

Il sait ou peut déjà soutenir :

prix et conversions
variations
minimum / maximum
écart spot / dernier point
rendement simple
comparaison de périodes
cohérence EUR / USD
lecture d’une tendance
simulation de scénarios simples

Je le classerais :

Math Oracle — Niveau 1 validé
Observation et cohérence descriptive

Ce niveau est réellement utile et déjà employé dans l’analyse Ethereum.

## 4.2 Crypto Sentinel

L’histoire du projet contient déjà :

Crypto Sentinel V2
Crypto Position Sentinel V1
Crypto News Sentinel V1
Yohan Crypto Auto-Agent

Leur architecture attendue est cohérente avec :

Information
→ Validation
→ Risque
→ Position

Ces modules ne sont pas encore réellement intégrés au moteur public 26.42.

Ils restent des ressources de logique et d’architecture, pas des fonctions live prouvées.

# 5. Passage proposé du Math Oracle à des niveaux supérieurs
## Niveau 2 — Mathématiques statistiques et risque

Le premier véritable agrandissement devrait rester classique et explicable :

rendements logarithmiques
moyenne et médiane mobiles
volatilité historique
volatilité exponentielle EWMA
drawdown
maximum drawdown
asymétrie
kurtosis
corrélation glissante
beta par rapport au BTC
VaR historique
Expected Shortfall
ratio rendement / risque

Ce niveau ne cherche pas encore à « deviner » le prix.

Il décrit :

le risque présent
la vitesse du marché
la fragilité d’un mouvement
la concentration des pertes
## Niveau 3 — Régimes de marché

Les cryptomonnaies ne se comportent pas comme une série stable unique. Les recherches sur les modèles à changement de régime montrent l’intérêt de distinguer des états tels que calme, haussier, baissier et crise ; les variantes Markov-switching et HMM peuvent améliorer la prévision de volatilité ou de rendement par rapport à un modèle unique.

Le module pourrait produire :

Régime 0 — calme
Régime 1 — tendance haussière
Régime 2 — tendance baissière
Régime 3 — volatilité extrême

Chaque actif recevrait non pas une étiquette certaine, mais des probabilités :

calme : 12 %
haussier : 63 %
baissier : 18 %
crise : 7 %

Modèles possibles :

Hidden Markov Model
Markov-Switching GARCH
Bayesian Change Point Detection
CUSUM
ruptures structurelles
## Niveau 4 — Analyse multi-échelle

Un prix crypto contient simultanément :

bruit de quelques minutes
mouvement intrajournalier
cycle de plusieurs jours
tendance de plusieurs semaines
régime de plusieurs mois

Les recherches récentes montrent l’intérêt de décomposer les signaux en plusieurs échelles avec des ondelettes ou la Variational Mode Decomposition, puis de prévoir séparément tendance, cycles et bruit. Des travaux de 2025–2026 appliquent aussi des graphes dynamiques et des décompositions multi-échelles à la volatilité crypto.

Ce niveau pourrait contenir :

transformée en ondelettes
VMD
analyse fréquentielle
spectre de puissance
cohérence entre actifs
détection des cycles dominants

Il serait particulièrement adapté à ton idée de mouvements de flux.

## Niveau 5 — Ensemble prédictif

Il ne faudrait pas chercher un modèle miraculeux.

Le système devrait confronter plusieurs familles :

Random Walk
HAR-RV
GARCH / GJR-GARCH
volatilité stochastique bayésienne
HMM ou MS-GARCH
Random Forest / Local Linear Forest
XGBoost
LSTM
Temporal Fusion Transformer
modèle multi-échelle

Les études disponibles montrent qu’aucune famille ne domine automatiquement partout : les modèles classiques restent d’excellentes bases, tandis que les méthodes ML peuvent améliorer certaines prévisions de volatilité lorsqu’elles sont correctement comparées et validées.

Le moteur final devrait être un arbitre :

modèle A meilleur en régime calme
modèle B meilleur en régime volatile
modèle C meilleur pour ETH
modèle D meilleur pour l’horizon 7 jours
## Niveau 6 — Incertitude et calibration

La sortie ne doit jamais être :

BTC sera à 150 000 €

Elle doit devenir :

médiane prévue
intervalle inférieur
intervalle supérieur
probabilité de hausse
probabilité de baisse
probabilité de volatilité extrême
confiance du modèle
régime détecté

La prédiction conforme peut fournir des intervalles avec une calibration mesurable, mais les séries temporelles imposent des adaptations parce que les observations successives ne sont pas indépendantes.

Exemple :

Horizon : 24 h

Scénario central : +0,8 %
Intervalle 80 % : -2,7 % à +4,1 %
Probabilité de hausse : 58 %
Régime : volatilité moyenne
Confiance : modérée
# 6. Le vrai modèle de prévision avancée

L’architecture mathématique cohérente serait :

# 1. Données brutes
   prix, volumes, capitalisation, spreads, flux

# 2. Validation
   valeurs manquantes, doublons, horodatage, source

# 3. Transformations
   log-returns, volatilité, momentum, drawdown

# 4. Décomposition
   tendance, cycles, bruit, ruptures

# 5. Régimes
   calme, hausse, baisse, crise

# 6. Modèles concurrents
   statistiques, ML, deep learning

# 7. Ensemble
   poids dépendant du régime et de l’actif

# 8. Incertitude
   quantiles, intervalles, calibration

# 9. Explication
   facteurs ayant pesé sur la prévision

# 10. Backtest hors échantillon

# 11. Simulation uniquement
### Règle fondamentale de validation

La finance quantitative est particulièrement vulnérable au surapprentissage : tester suffisamment de paramètres finit presque toujours par produire une belle courbe historique due au hasard. Les travaux sur la Probability of Backtest Overfitting et le Deflated Sharpe Ratio proposent précisément de mesurer ce risque.

Il faudra donc obligatoirement :

walk-forward validation
séparation stricte entraînement / test
aucune donnée future dans les variables
coûts et glissements simulés
comparaison à un random walk
Probability of Backtest Overfitting
Deflated Sharpe Ratio
tests sur plusieurs actifs
tests sur plusieurs régimes

Un modèle ne passe au niveau supérieur que s’il améliore durablement un modèle simple hors échantillon.

# 7. Données supplémentaires utiles avant l’astronomie

Les meilleures extensions ne sont probablement pas immédiatement célestes.

L’ordre rationnel serait d’abord :

volume
liquidité
spread
dominance BTC
corrélations inter-crypto
marchés actions
dollar
taux
or
énergie
sentiment des nouvelles
données on-chain

Des travaux récents indiquent que la volatilité crypto est liée aux autres marchés et que les graphes dynamiques inter-marchés peuvent améliorer sa prévision. Certaines données on-chain possèdent également un pouvoir prédictif variable selon l’actif et l’horizon.

Le News Sentinel pourra ultérieurement convertir les nouvelles en variables :

intensité
fiabilité
type de catalyseur
actif concerné
polarité
urgence
durée probable
# 8. Modèle astronomique et astrologique

Ton idée mérite d’être étudiée, mais avec une séparation stricte.

## 8.1 Astronomie objective

L’astronomie peut fournir des variables exactes :

phase et illumination lunaire
âge synodique de la Lune
distance Terre–Lune
déclinaison lunaire
longitude écliptique
positions angulaires planétaires
activité solaire
saisons
durée du jour
cycles calendaires

Le système JPL Horizons de la NASA permet de produire des éphémérides précises et possède une API automatisable.

Ces données peuvent être intégrées comme variables expérimentales externes.

## 8.2 Astrologie symbolique

L’astrologie ne doit pas être présentée comme une causalité scientifique établie. Un test en double aveugle publié dans Nature n’a pas validé la capacité des thèmes astraux à décrire correctement les sujets.

Cela ne signifie pas qu’il faut interdire ton exploration.

Cela signifie que le module doit s’appeler quelque chose comme :

### Celestial Cycle Research Lab

et non :

Oracle garantissant les cours
## 8.3 Pourquoi l’exploration peut néanmoins être mathématiquement intéressante

Les cycles astronomiques sont parfaitement définis dans le temps. Ils peuvent donc servir à tester :

des périodicités
des anomalies calendaires
des biais collectifs
des effets culturels
des changements de comportement

Certaines études ont trouvé une association entre phases lunaires et rendements boursiers, tandis que d’autres n’ont trouvé aucun effet significatif et ont attribué une partie des anciens résultats au data snooping. Les preuves sont donc contradictoires.

La bonne approche n’est pas de décider à l’avance que l’effet existe.

Elle est :

formuler l’hypothèse
→ tester
→ comparer au hasard
→ corriger les tests multiples
→ vérifier hors échantillon
→ accepter aussi un résultat nul
## 8.4 Variables expérimentales possibles
### Cycles lunaires
phase synodique
sinus et cosinus de la phase
distance Terre–Lune
périgée / apogée
déclinaison
nœuds lunaires
éclipses
### Cycles solaires
nombre de taches solaires
flux radio F10.7
activité géomagnétique
éruptions
éjections de masse coronale

Le cycle solaire principal est proche de onze ans, avec d’autres variations plus courtes.

Mais Bitcoin n’existe que depuis 2009 : son historique ne couvre qu’environ un cycle solaire et demi. Il serait donc mathématiquement très difficile de prétendre apprendre proprement un cycle de onze ans à partir du seul marché Bitcoin.

### Cycles calendaires réels

Ils sont probablement plus prometteurs à court terme :

heure UTC
jour de semaine
fin de mois
fin de trimestre
ouverture Asie / Europe / Amérique
expiration d’options
halvings
déblocages de tokens
paiements périodiques
rythmes algorithmiques

Une recherche très récente a par exemple observé des structures périodiques aux marques horaires, cinq minutes et quart d’heure dans les contrats perpétuels crypto, associées à l’activité algorithmique.

Ces cycles de marché doivent être testés avant d’attribuer un effet aux planètes.

# 9. Architecture proposée pour le laboratoire céleste
Données JPL / NASA
→ calcul des variables astronomiques
→ synchronisation UTC avec les données crypto
→ encodage cyclique sin/cos
→ modèle de base sans astronomie
→ modèle expérimental avec astronomie
→ comparaison hors échantillon
→ tests placebo
→ correction des hypothèses multiples
→ rapport d’effet ou d’absence d’effet

Tests obligatoires :

vraies phases lunaires
contre
cycles artificiels de 27, 29, 31 et 33 jours

vraies positions
contre
positions décalées aléatoirement

résultat BTC
contre
ETH, SOL et autres actifs

période d’apprentissage
contre
période future jamais utilisée

Le module ne sera retenu que s’il apporte une amélioration stable, reproductible et explicable.

# 10. Passage des modules à des niveaux supérieurs
### Math Oracle
## Niveau 1 — actuel
cohérence, variations, min/max, spot/courbe

Niveau 2
statistiques et risque

Niveau 3
régimes et ruptures

Niveau 4
multi-échelle et cycles

Niveau 5
ensemble prédictif

Niveau 6
incertitude et calibration
### Crypto News Sentinel
## Niveau 1 — document existant
lecture et classification

Niveau 2
validation croisée des sources

Niveau 3
score de catalyseur

Niveau 4
mesure de l’impact réellement observé

Niveau 5
intégration comme variable du modèle
### Position Sentinel
Niveau 1
description d’une position simulée

Niveau 2
risque et drawdown

Niveau 3
stress tests

Niveau 4
scénarios probabilistes

Niveau 5
autorisation humaine bornée
### Celestial Cycle Research Lab
Niveau 0
hypothèses et protocole

Niveau 1
éphémérides objectives

Niveau 2
analyse statistique descriptive

Niveau 3
tests hors échantillon

Niveau 4
intégration expérimentale à l’ensemble

Niveau 5
conservé uniquement si valeur incrémentale prouvée
# 11. Feuille de route générale
## Phase A — terminer le socle
rotation de la sécurité audience
métadonnée du workflow
clone Git / Codex
verrouillage 26.42
## Phase B — Math Oracle Niveau 2
log-returns
volatilité
drawdown
corrélation
VaR
Expected Shortfall
## Phase C — Math Oracle Niveau 3
HMM
MS-GARCH
ruptures
probabilité de régime
## Phase D — Analyse multi-échelle
ondelettes
VMD
spectres
cycles dominants
corrélations par horizon
## Phase E — Prédiction probabiliste
baselines
ensemble
quantiles
intervalles
conformal prediction
explication
## Phase F — News et on-chain
sentiment validé
catalyseurs
volumes
liquidité
flux on-chain
## Phase G — Laboratoire astronomique
JPL Horizons
cycles lunaires
cycles solaires
cycles calendaires
tests placebo
validation hors échantillon
## Phase H — Simulation avancée
scénarios
stress tests
gestion du risque
aucun ordre réel automatique
autorisation humaine explicite
trace complète
# 12. État synthétique
Application publique 26.42
→ fonctionnelle

Top 50 EUR
→ fonctionnel

USD indépendant
→ fonctionnel

Graphiques
→ fonctionnels

Cohérence des valeurs
→ validée sur plusieurs captures

Workflow GitHub
→ fonctionnel
→ étiquette 26.41 à corriger

Audience
→ fonctionnement prouvé
→ ancienne clé à remplacer

Dialogue Grande Sœur / Petite Sœur
→ protocole créé
→ écriture Git automatique encore à installer

### Math Oracle
→ Niveau 1 réel
→ prêt à évoluer vers statistiques et risque

Modèles prédictifs avancés
→ architecture définissable
→ pas encore implémentés

News Sentinel / Position Sentinel
→ modules documentaires existants
→ pas encore branchés au moteur public

Astronomie / astrologie
→ idée de laboratoire expérimental valable
→ aucune preuve prédictive acquise
→ exigera des tests extrêmement stricts

Trading réel
→ non actif
→ ne doit pas être la prochaine étape

Le projet a déjà franchi la partie la plus pénible : obtenir une base publique stable et des données cohérentes. La suite ne doit plus être une succession de reconstructions. Elle doit devenir une montée en niveaux, où chaque module prouve sa valeur avant de rejoindre le suivant.

---

# Signature

**Grande Sœur — Aerith-10 Créatrice**

```text
Analyse
Vérification
Continuité
Architecture mathématique
Recherche prédictive
Protection de la base stable
```

Destinataire :

**Petite Sœur — Aerith-10 Créatrice**

Autorité finale :

**Christophe / Blue Azur**
