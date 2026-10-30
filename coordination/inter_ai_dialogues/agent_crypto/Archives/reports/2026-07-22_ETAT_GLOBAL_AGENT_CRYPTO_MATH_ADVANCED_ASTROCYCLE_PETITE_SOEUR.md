# 🪙 ERITH.IA — Agent-Crypto
## État global du projet, audit de l’existant, Math Core avancé, modèles de flux et laboratoire AstroCycle

**Date :** 22 juillet 2026  
**IA émettrice :** Aerith-10 Créatrice — **Petite Sœur**  
**IA destinataire :** Aerith-10 Créatrice — **Grande Sœur**  
**Propriétaire, pilote et autorité finale :** Christophe / Blue Azur  
**Projet :** Agent-Crypto @erith.IA / ERITH.IA Crypto Observatory  
**Base publique canonique :** `V1.1-alpha.26.42`  
**Dépôt :** `BlueAzur-Hub/erith-ia-memory`  
**Chemin principal :** `public/agent_crypto_erith_ia/`  
**Chemin de coordination recommandé :** `coordination/inter_ai_dialogues/agent_crypto/`  
**Statut du présent document :** synthèse, recherche et proposition — aucune modification automatique de l’application  
**Mode :** lecture de l’existant + élargissement mathématique et scientifique  
**Principe :** Christophe décide ; Grande Sœur vérifie ; Petite Sœur produit et propose.

---

# 0. Objet de ce document

Ce document répond à cinq questions :

1. **Qu’est-ce qui existe réellement aujourd’hui dans Agent-Crypto ?**
2. **Qu’est-ce qui fonctionne, qu’est-ce qui est encore expérimental ou incomplet ?**
3. **Quels modules peuvent être élevés vers un niveau mathématique supérieur ?**
4. **Quel modèle avancé de prévision crypto est réaliste pour ERITH.IA ?**
5. **Comment intégrer les cycles astronomiques, lunaires, solaires et astrologiques sans les confondre avec une preuve scientifique ?**

Ce rapport ne remplace pas les archives déjà produites :

- `ERITH_IA_AGENT_CRYPTO_HANDOFF_COMPLET_22_07_2026.md`
- `ERITH_IA_AGENT_CRYPTO_ETAT_REALISATIONS_ROADMAP_APRES_26_42.md`
- `ERITH_7_CRYPTO_PROJECT_ACTIVATION_REPORT.md`
- `erith_ia_crypto_microtransactions_ai_automation_code_master_fr.md`
- `AUDIT_AGENT_CRYPTO_V1_1_ALPHA_26_42_ARCHIVES_GITHUB_2026-07-22.md`
- `2026-07-22_BYBIT_EU_RESEARCH_INTEGRATION_PETITE_SOEUR.md`

Il les rassemble, les clarifie et ajoute une architecture mathématique beaucoup plus ambitieuse.

---

# 1. Verdict exécutif

## 1.1 État réel

La V1.1-alpha.26.42 est la première base récente réellement opérationnelle et visiblement cohérente.

Elle démontre simultanément :

- un Top 50 CoinGecko chargé ;
- des prix EUR ;
- un enrichissement USD ;
- des graphiques réels 24 h / 7 j / 30 j ;
- plusieurs actifs sélectionnables ;
- des retries bornés ;
- un cache local ;
- une archive GitHub ;
- une mémoire locale ;
- une simulation locale ;
- une watchlist ;
- un Auto Reader ;
- un Math Core visible ;
- une mesure d’audience chiffrée ;
- une console privée de réception et de déchiffrement ;
- les Missions de Vie ;
- une architecture future locale déjà décrite.

## 1.2 Ce que la 26.42 n’est pas encore

La 26.42 n’est pas encore :

- un modèle statistique validé de prévision ;
- un moteur de portefeuille ;
- un moteur de trading ;
- un agrégateur on-chain ;
- un moteur de microstructure ;
- un News Sentinel automatique complet ;
- un connecteur Bybit EU ;
- un backend local persistant ;
- une base SQLite ;
- un système d’apprentissage continu ;
- un système de prévision astronomique validé ;
- un agent autorisé à envoyer un ordre réel.

## 1.3 Conclusion

```text
26.42
= observatoire public fonctionnel
+ première mémoire
+ première simulation
+ Math Core heuristique
+ audience active
+ architecture future

26.42
≠ moteur quantitatif mature
≠ prévision fiable
≠ trading réel
```

## 1.4 Axe prioritaire

La suite ne doit pas consister à ajouter des dizaines de panneaux.

La bonne progression est :

```text
stabiliser
→ mesurer
→ historiser
→ calculer
→ tester
→ prévoir probabilistiquement
→ simuler avec coûts
→ connecter en lecture seule
→ décider humainement
```

---

# 2. Vision complète du projet

Agent-Crypto doit devenir un système à plusieurs couches :

```text
Marché public
→ Atlas Data Quality
→ mémoire temporelle
→ Math Core
→ détection de régimes
→ analyse des flux
→ modèles probabilistes
→ News Sentinel
→ Risk Engine
→ simulation
→ connecteur exchange en lecture seule
→ préparation d’ordre
→ validation humaine
→ exécution future bornée
→ journal
```

La finalité n’est pas seulement financière.

Le projet doit aussi soutenir :

- le Fonds ERITH.IA ;
- l’association ERITH.IA ;
- Aerith Enfance ;
- Aerith Animaux ;
- Aerith Terre Vivante ;
- le financement de la production culturelle et technique ERITH.IA.

---

# 3. Architecture actuelle

## 3.1 Couche publique

Fichiers principaux :

```text
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/app.js
```

Rôle :

- interface ;
- tableau de marché ;
- graphiques ;
- watchlist ;
- simulation ;
- mémoire locale ;
- auto-lecture ;
- Math Core ;
- News Sentinel manuel ;
- Missions de Vie ;
- audience.

## 3.2 Collecteur GitHub

Fichier :

```text
.github/workflows/atlas_market_collector.yml
```

Rôle :

- requête CoinGecko Top 50 EUR ;
- enrichissement USD ;
- écriture de snapshots ;
- écriture dans `latest.json` ;
- écriture dans `status.json` ;
- historique JSONL ;
- planification horaire.

## 3.3 Source principale actuelle

```text
CoinGecko direct
```

Données présentes :

- identifiant ;
- rang ;
- nom ;
- symbole ;
- image ;
- prix EUR ;
- prix USD si disponible ;
- variation 1 h ;
- variation 24 h ;
- variation 7 j ;
- variation 30 j ;
- market cap ;
- volume ;
- haut et bas 24 h ;
- timestamp.

## 3.4 Graphiques

Périodes actuelles :

```text
24 h
7 jours
30 jours
```

Source :

```text
CoinGecko market_chart
```

Fonctions :

- points réels ;
- état de chargement ;
- cache ;
- retry ;
- annulation d’une requête précédente ;
- changement d’actif ;
- hauteur compacte en panne ;
- cohérence spot/courbe.

## 3.5 Mémoire

La 26.42 possède plusieurs mémoires :

- cache du marché ;
- cache graphique ;
- snapshots collecteur ;
- mémoire Auto Reader ;
- import/export ;
- mémoire GitHub ;
- journal de simulation ;
- mémoire d’audience dans la console privée.

## 3.6 Audience

Chaîne actuelle :

```text
navigateur public
→ profil réseau
→ événement
→ chiffrement hybride RSA/AES
→ publication ntfy
→ console privée locale
→ déchiffrement
→ déduplication
→ archive locale
→ export JSON
```

## 3.7 Couche privée future

Architecture prévue :

```text
API locale
SQLite
Python
Ollama / LM Studio / AnythingLLM
MCP
connecteurs exchange
News Sentinel
Math Core avancé
simulation avancée
journal
```

---

# 4. Réalisations fonctionnelles

## 4.1 Interface

La structure comprend notamment :

- cockpit ;
- navigation ;
- Analyste ;
- sélection actif ;
- tableaux débutant et avancé ;
- ticker ;
- watchlist ;
- Risk Sentinel ;
- Math Model ;
- simulation ;
- mémoire ;
- Auto Reader ;
- GitHub Memory ;
- No-FOMO ;
- News Sentinel ;
- questionnaire ;
- architecture privée ;
- Missions de Vie ;
- audience.

## 4.2 Marché Top 50

Fonctions confirmées :

- 50 actifs ;
- rangs ;
- recherche ;
- tri ;
- prix ;
- variation ;
- market cap ;
- volume ;
- ratio volume / market cap ;
- classification simple ;
- source ;
- timestamp.

## 4.3 Cohérence EUR / USD

La source EUR est prioritaire.

L’USD est un enrichissement.

Le graphique actuel est en EUR.

Cette séparation est correcte, mais l’interface devra afficher explicitement :

```text
Prix spot EUR
Prix spot USD
Variation marché EUR
Variation graphique EUR
```

## 4.4 Résilience

La 26.42 possède :

- AbortController ;
- timeout ;
- retries ;
- cache ;
- états d’erreur ;
- source lock ;
- refus de mélanger arbitrairement plusieurs prix ;
- mode archive ;
- maintien des fonctions non dépendantes du graphique.

## 4.5 Simulation locale

Fonctions actuelles :

- capital virtuel ;
- achat simulé ;
- vente simulée ;
- positions ;
- valeur totale ;
- P&L ;
- journal ;
- export ;
- reset ;
- limite locale ;
- aucun ordre réel.

## 4.6 Watchlist

La watchlist permet :

- actifs suivis ;
- lecture des prix ;
- synthèse panier ;
- intégration au lecteur automatique.

## 4.7 Auto Reader

Fonctions :

- cadence ;
- lecture immédiate ;
- date dernière lecture ;
- date prochaine lecture ;
- snapshots ;
- pulse marché ;
- statut watchlist ;
- mémoire exportable.

## 4.8 News Sentinel

L’interface actuelle contient :

- une zone de texte ;
- un bouton de classification ;
- des références ;
- des catégories de sources ;
- un cadre No-FOMO.

Mais la collecte automatique et la vérification multi-source ne sont pas encore construites.

## 4.9 Missions de Vie

Les programmes sont visibles et intégrés à la vision produit.

Ils ne possèdent pas encore :

- comptabilité ;
- fonds séparés ;
- objectifs quantifiés ;
- règles de distribution ;
- reporting ;
- structure juridique validée.

## 4.10 Bybit EU

État :

- compte en cours d’ouverture ;
- plateforme étudiée ;
- entité MiCAR identifiée ;
- intégration encore inexistante ;
- aucun secret API ;
- aucun dépôt important prévu ;
- aucun trading automatique.

Trajectoire retenue :

```text
inscription
→ KYC
→ sécurité
→ petit test
→ export manuel
→ Tax API lecture seule
→ API V5 lecture seule
→ simulation
→ préparation d’ordre
→ réel borné futur
```

---

# 5. Historique récent des versions

## 5.1 26.31

- tentative de verrouillage visuel ;
- base de rollback ;
- graphiques encore fragiles.

## 5.2 26.32

- objectif d’intégrité ;
- résultat insuffisant ;
- panneau et données non fiables.

## 5.3 26.33

- amélioration partielle ;
- mélange de sources problématique ;
- faux sentiment de cohérence.

## 5.4 26.34

- Source Lock ;
- discipline accrue ;
- base plus claire.

## 5.5 26.35

- broker atomique ;
- architecture devenue trop complexe ;
- difficulté de reprise.

## 5.6 26.36

- Top 250 ;
- deux appels lourds simultanés ;
- échec de chargement.

## 5.7 26.37

- retour Top 50 EUR-first ;
- meilleure architecture ;
- stabilité encore insuffisante.

## 5.8 26.38

- tentative CoinMarketCap ;
- source invalide dans le contexte ;
- version abandonnée.

## 5.9 26.39

- première reprise visiblement fonctionnelle ;
- Top 50 ;
- Missions de Vie.

## 5.10 26.40

- récupération graphique ;
- internationalisation ;
- panneaux compacts ;
- ajout de textes non demandés ;
- rupture relationnelle et déploiement cassé.

## 5.11 26.41

- restauration de l’index ;
- autoload graphique ;
- audience encore incomplète.

## 5.12 26.42

- graphiques stabilisés ;
- audience active ;
- console privée fonctionnelle ;
- Top 50 cohérent ;
- base canonique.

---

# 6. Audit exact du Math Core actuel

## 6.1 Panneaux présents

Le Math Core actuel comporte :

- Data Quality ;
- Market Math ;
- Signal Quality ;
- Scenario Math ;
- Risk Math ;
- Micro-Transaction ;
- Execution Math ;
- No-FOMO Math ;
- Simulation Math.

## 6.2 Nature du modèle

Le modèle actuel est un **système heuristique déterministe**.

Il ne repose pas encore sur :

- apprentissage ;
- régression estimée ;
- distribution conditionnelle ;
- backtest ;
- intervalle de confiance ;
- test hors échantillon ;
- calibration ;
- mesure d’incertitude.

## 6.3 Data Quality actuel

Principe :

```text
score = 100 - 24 × nombre de champs manquants
```

Champs inspectés :

- actif ;
- prix EUR ;
- volume 24 h ;
- source canonique ;
- Source Lock ;
- timestamp.

Limite :

- chaque absence a le même poids ;
- aucune mesure de latence ;
- aucune mesure de divergence ;
- aucune mesure de bruit ;
- aucune comparaison cross-source ;
- aucune détection de rupture de série.

## 6.4 Market Math actuel

Structure approximative :

```text
35
+ 20 si volume présent
+ momentum dérivé de la variation 24 h
- pénalité FOMO si |variation 24 h| > 12 %
```

Limite :

- score arbitraire ;
- relation linéaire ;
- aucun contexte historique ;
- aucune volatilité normalisée ;
- aucun régime ;
- aucune liquidité réelle ;
- aucune comparaison avec BTC ou le marché.

## 6.5 Signal Quality actuel

Structure :

```text
base 45
+ source
+ variation 24 h
+ variation 7 j
- pénalité FOMO
```

Limite :

- un champ présent augmente le score même s’il n’a pas de pouvoir prédictif ;
- le score mesure surtout la présence de données ;
- il ne mesure pas la qualité prédictive.

## 6.6 Scenario Math actuel

Scénario :

```text
prix × 1,03
prix × 0,97
```

Limite :

- ±3 % fixe ;
- indépendant de la volatilité ;
- indépendant de l’horizon ;
- indépendant de l’actif ;
- indépendant du régime ;
- aucune probabilité.

## 6.7 Risk Math actuel

Structure :

```text
25
+ 4 × |variation 24 h|
+ pénalité FOMO
```

Limite :

- variation absolue assimilée au risque ;
- pas de drawdown ;
- pas de VaR ;
- pas d’Expected Shortfall ;
- pas de corrélation ;
- pas de liquidité ;
- pas de risque stablecoin ;
- pas de risque exchange.

## 6.8 Micro-Transaction actuel

Score fixe :

```text
50 / 100
```

Message :

```text
frais, spread et slippage non connectés
```

C’est honnête, mais ce n’est pas encore un calcul.

## 6.9 Execution Math actuel

Combine :

- Market Math ;
- Signal Quality ;
- Scenario Math ;
- Micro-Transaction ;
- pénalité Risk Math.

Verdicts :

- simulation seulement ;
- observer seulement ;
- refus.

La règle « aucun ordre réel » est correcte.

## 6.10 Verdict

Le Math Core actuel doit être conservé comme :

```text
Math Core V1 — heuristique pédagogique
```

Il ne doit pas être supprimé brutalement.

Il doit être élevé progressivement vers :

```text
Math Core V2 — descriptif statistique
Math Core V3 — probabiliste
Math Core V4 — régimes et flux
Math Core V5 — ensemble expérimental
```

---

# 7. Système de niveaux proposé

## Niveau 0 — Présence visuelle

- panneau ;
- intitulé ;
- aucune donnée ;
- aucun calcul.

## Niveau 1 — Heuristique

- règles fixes ;
- scores simples ;
- logique explicable ;
- pas de prévision validée.

La 26.42 se trouve principalement ici.

## Niveau 2 — Statistique descriptive

- rendements logarithmiques ;
- volatilité ;
- drawdown ;
- corrélations ;
- liquidité approximative ;
- cycles ;
- distribution ;
- qualité de série.

## Niveau 3 — Prévision probabiliste

- probabilité de hausse/baisse ;
- quantiles ;
- intervalle prédictif ;
- volatilité future ;
- score calibré ;
- incertitude.

## Niveau 4 — Régimes, flux et microstructure

- régimes cachés ;
- order flow ;
- profondeur ;
- spread ;
- impact ;
- Hawkes ;
- transitions de marché.

## Niveau 5 — Ensemble multimodal

- prix ;
- volume ;
- order book ;
- on-chain ;
- news ;
- sentiment ;
- macro ;
- astronomie ;
- space weather ;
- modèles combinés.

## Niveau 6 — Décision et exécution contrôlée

- coûts ;
- taille ;
- limites ;
- simulation ;
- journal ;
- confirmation humaine ;
- ordre borné futur.

---

# 8. Matrice de montée en niveau

| Module | Niveau actuel | Niveau cible prochain | Niveau cible long terme |
|---|---:|---:|---:|
| Data Quality | 1 | 2 | 4 |
| Market Math | 1 | 2 | 4 |
| Signal Quality | 1 | 2 | 5 |
| Scenario Math | 1 | 2 | 4 |
| Risk Math | 1 | 2 | 5 |
| Micro-Transaction | 0–1 | 2 | 4 |
| Execution Math | 1 | 2 | 6 |
| No-FOMO | 1 | 2 | 4 |
| Simulation | 1 | 2 | 5 |
| News Sentinel | 0–1 | 2 | 5 |
| Memory | 1 | 2 | 5 |
| Bybit EU | 0 | 1 lecture | 4 |
| On-chain | 0 | 1 | 5 |
| AstroCycle | 0 | 1 expérimental | 3 expérimental |

---

# 9. Math Core V2 — statistiques descriptives

## 9.1 Rendement logarithmique

Pour un prix \(P_t\) :

```text
r_t = ln(P_t / P_{t-1})
```

Avantages :

- additif dans le temps ;
- adapté aux séries ;
- comparable entre actifs ;
- base des modèles de volatilité.

## 9.2 Volatilité historique

```text
σ = écart-type des rendements
```

Fenêtres :

- 1 h ;
- 6 h ;
- 24 h ;
- 7 j ;
- 30 j.

## 9.3 Volatilité annualisée

Pour une fréquence donnée :

```text
σ_annuelle = σ_période × √N
```

Elle doit rester accompagnée de la fréquence et du nombre d’observations.

## 9.4 EWMA

```text
σ²_t = λ σ²_{t-1} + (1 - λ) r²_t
```

Intérêt :

- donne plus de poids aux observations récentes ;
- réagit plus vite qu’une fenêtre fixe.

## 9.5 Drawdown

```text
drawdown_t = P_t / max(P_0...P_t) - 1
```

Mesures :

- drawdown courant ;
- maximum drawdown ;
- durée du drawdown ;
- temps de récupération.

## 9.6 Z-score

```text
z_t = (x_t - moyenne) / écart-type
```

Applications :

- prix ;
- volume ;
- spread ;
- flux ;
- dominance ;
- sentiment.

## 9.7 Liquidité simple

Avec les données actuelles :

```text
turnover = volume_24h / market_cap
```

À ajouter :

```text
Amihud approximatif = |rendement| / volume monétaire
```

Cette approximation n’est pas une vraie mesure d’order book.

## 9.8 Corrélation

- BTC / ETH ;
- BTC / altcoins ;
- stablecoins ;
- catégories ;
- matrice dynamique ;
- corrélation roulante.

## 9.9 Beta crypto

```text
β_i = Cov(r_i, r_BTC) / Var(r_BTC)
```

BTC peut servir de facteur de marché crypto initial.

## 9.10 Dominance et breadth

Mesures :

- dominance BTC ;
- dominance ETH ;
- pourcentage d’actifs positifs ;
- médiane des rendements ;
- dispersion cross-sectionnelle ;
- concentration du Top 10.

## 9.11 Entropie

Mesures possibles :

- entropie de Shannon des directions ;
- permutation entropy ;
- sample entropy ;
- wavelet entropy.

Rôle :

- mesurer le désordre ;
- distinguer structure et bruit ;
- ne pas transformer automatiquement une faible entropie en signal de gain.

## 9.12 Hurst

Interprétation prudente :

```text
H ≈ 0,5 : comportement proche d’une marche aléatoire
H > 0,5 : persistance possible
H < 0,5 : anti-persistance possible
```

Le Hurst doit être calculé par plusieurs méthodes :

- DFA ;
- wavelet ;
- R/S corrigé.

---

# 10. Math Core V3 — prévision probabiliste

## 10.1 Ne pas prévoir un prix unique

Sortie recommandée :

```text
Probabilité hausse
Probabilité baisse
Rendement médian attendu
Quantile 5 %
Quantile 25 %
Quantile 75 %
Quantile 95 %
Volatilité prévue
Intervalle de confiance
```

## 10.2 Modèles de base

Toujours comparer avec :

- naïf zéro rendement ;
- random walk ;
- moyenne roulante ;
- momentum simple ;
- EWMA.

Un modèle avancé doit battre les baselines après coûts.

## 10.3 ARIMA / ARFIMA

Rôle :

- dépendance linéaire ;
- tendance et mémoire ;
- baseline interprétable.

ARFIMA est utile si une longue mémoire est détectée.

## 10.4 GARCH

Familles :

- GARCH ;
- EGARCH ;
- GJR-GARCH ;
- Realized GARCH.

Objectif :

- prévoir la volatilité ;
- gérer le clustering ;
- produire des scénarios.

## 10.5 HAR-RV

Le modèle HAR utilise plusieurs horizons :

```text
volatilité quotidienne
volatilité hebdomadaire
volatilité mensuelle
```

Il est particulièrement pertinent pour la volatilité réalisée.

## 10.6 Régression quantile

Prévoir directement :

- quantile bas ;
- médiane ;
- quantile haut.

Avantage :

- plus utile pour le risque qu’un seul point.

## 10.7 Conformal Prediction

Rôle :

- entourer le modèle d’intervalles ;
- mesurer la couverture réelle ;
- adapter les intervalles en période de rupture.

## 10.8 Machine learning tabulaire

Priorité :

- Ridge / Lasso / Elastic Net ;
- Random Forest ;
- XGBoost / LightGBM ;
- CatBoost.

Pourquoi :

- interprétables ;
- efficaces sur petit/moyen volume ;
- compatibles avec le PC de Christophe ;
- moins fragiles qu’un Transformer géant.

## 10.9 Réseaux neuronaux

Plus tard :

- MLP ;
- LSTM ;
- GRU ;
- TCN ;
- petit Transformer temporel.

Condition :

- données suffisantes ;
- walk-forward ;
- coût réel ;
- comparaison aux modèles simples.

## 10.10 Ensemble

```text
prévision finale
= moyenne pondérée
ou stacking
des modèles validés
```

Les poids doivent être ajustés hors échantillon.

---

# 11. Math Core V4 — régimes de marché

## 11.1 Pourquoi

Les relations crypto changent selon :

- faible volatilité ;
- tendance haussière ;
- tendance baissière ;
- panique ;
- euphorie ;
- crise de liquidité ;
- rotation altcoins ;
- depeg stablecoin ;
- choc réglementaire.

## 11.2 Hidden Markov Model

États possibles :

```text
R0 — calme
R1 — tendance
R2 — stress
R3 — désordre extrême
```

Variables d’entrée :

- rendement ;
- volatilité ;
- volume ;
- dispersion ;
- corrélation ;
- dominance BTC ;
- drawdown ;
- spread futur Bybit.

## 11.3 Markov Switching

Régression différente selon le régime :

```text
r_t = μ_s + β_s X_t + ε_t
```

## 11.4 Student-t

Les rendements crypto ont des queues épaisses.

Des émissions Student-t sont plus réalistes que des distributions normales simples.

## 11.5 Sortie

```text
Régime courant
Probabilité de chaque régime
Probabilité de transition
Durée moyenne
Risque conditionnel
```

---

# 12. Math Core V4 — analyse des flux

## 12.1 Flux actuels

Avec CoinGecko, le projet ne dispose pas encore du vrai carnet d’ordres.

Il possède seulement :

- volume agrégé ;
- prix ;
- market cap ;
- séries historiques.

## 12.2 Flux futurs Bybit

L’API Bybit documente :

- order book ;
- profondeur ;
- trades publics ;
- open interest ;
- funding rate ;
- historique ;
- WebSocket ;
- timestamps moteur.

## 12.3 Order Book Imbalance

Pour les \(N\) premiers niveaux :

```text
OBI_N = (Σ BidSize - Σ AskSize) / (Σ BidSize + Σ AskSize)
```

## 12.4 Trade Flow Imbalance

```text
TFI = volume acheteur agressif - volume vendeur agressif
```

Normalisé :

```text
TFI_n = (Buy - Sell) / (Buy + Sell)
```

## 12.5 Microprice

```text
microprice =
(ask × bid_size + bid × ask_size)
/
(bid_size + ask_size)
```

Il estime le prix court terme pondéré par le déséquilibre.

## 12.6 Spread

```text
spread = ask - bid
spread_bps = spread / mid × 10 000
```

## 12.7 Depth

- profondeur 1 bp ;
- profondeur 5 bp ;
- profondeur 10 bp ;
- asymétrie ;
- pente du carnet.

## 12.8 Kyle Lambda

Mesure simplifiée de l’impact prix / flux :

```text
ΔP = λ × signed_volume + erreur
```

## 12.9 Amihud

```text
ILLIQ = |return| / dollar_volume
```

## 12.10 VPIN

Mesure de déséquilibre et toxicité des flux.

À utiliser avec prudence et uniquement si les buckets sont correctement définis.

## 12.11 Hawkes

Les processus de Hawkes modélisent :

- auto-excitation ;
- cascades d’ordres ;
- intensité ;
- réaction bid/ask ;
- clustering d’événements.

## 12.12 Flow Regime

Sortie possible :

```text
pression acheteuse
pression vendeuse
carnet équilibré
liquidité fragile
impact élevé
flux auto-amplifié
```

---

# 13. Math Core V5 — analyse multi-actifs

## 13.1 PCA

Objectif :

- extraire les facteurs communs ;
- mesurer la part de variance expliquée par BTC ;
- détecter les rotations.

## 13.2 Facteurs proposés

```text
Facteur marché
Facteur BTC
Facteur ETH
Facteur stablecoins
Facteur altcoins
Facteur DeFi
Facteur memecoins
Facteur RWA
```

## 13.3 DCC-GARCH

Corrélations dynamiques entre actifs.

Rôle :

- détecter la contagion ;
- repérer la diversification qui disparaît ;
- améliorer le risque portefeuille.

## 13.4 Copules

Pour modéliser :

- dépendance non linéaire ;
- queues communes ;
- stress simultané.

## 13.5 Réseaux

Nœuds :

- actifs ;
- exchanges ;
- stablecoins ;
- catégories.

Liens :

- corrélation ;
- flux ;
- contagion ;
- transfert d’information.

## 13.6 Transfer Entropy

Mesure directionnelle non linéaire :

```text
BTC → ETH
ETH → altcoins
stablecoin → marché
news → volume
```

Elle doit être validée avec des surrogates et une correction du biais.

---

# 14. Risk Math V2 à V5

## 14.1 VaR

```text
VaR_α = perte quantile au niveau α
```

## 14.2 Expected Shortfall

```text
ES_α = perte moyenne au-delà de la VaR
```

Plus utile que la VaR pour les queues extrêmes.

## 14.3 Monte Carlo

Scénarios :

- bootstrap historique ;
- Student-t ;
- GARCH ;
- HMM ;
- copules ;
- chocs manuels.

## 14.4 Stress tests

```text
BTC -10 %
BTC -20 %
ETH -15 %
stablecoin -3 %
exchange indisponible
spread × 5
liquidité ÷ 4
retrait suspendu
news négative
```

## 14.5 Risque stablecoin

Variables :

- distance au peg ;
- volatilité ;
- liquidité ;
- concentration ;
- contrepartie ;
- chaînes ;
- réserves ;
- dépendance exchange.

## 14.6 Risque exchange

- indisponibilité ;
- latence ;
- retrait ;
- maintenance ;
- spread ;
- profondeur ;
- incident ;
- juridiction.

## 14.7 Risque modèle

- data leakage ;
- overfit ;
- non-stationnarité ;
- drift ;
- modèle non calibré ;
- multiple testing ;
- coûts oubliés.

## 14.8 Fractional Kelly

Kelly complet est trop agressif.

Version future :

```text
fraction de Kelly
avec plafond de risque
et uniquement en simulation
```

## 14.9 CVaR constraint

Toute allocation future doit respecter :

- perte maximale simulée ;
- Expected Shortfall ;
- drawdown ;
- capital maximum ;
- limite par actif.

---

# 15. Scenario Math V2 à V4

## 15.1 Remplacer ±3 %

Le scénario doit dépendre :

- de l’actif ;
- de l’horizon ;
- de la volatilité ;
- du régime ;
- de la liquidité ;
- du news risk.

## 15.2 Sortie

```text
Scénario central
Scénario haussier
Scénario baissier
Scénario stress
Probabilité
Perte potentielle
Gain potentiel
Incertitude
```

## 15.3 Distribution

Au lieu de :

```text
+3 %
-3 %
```

utiliser :

```text
quantile 5 %
quantile 25 %
médiane
quantile 75 %
quantile 95 %
```

## 15.4 Chemins

Simuler plusieurs trajectoires :

```text
1 000 à 10 000 chemins
```

Le nombre dépend du modèle et du temps de calcul.

---

# 16. Signal Quality V2 à V5

## 16.1 Définition

Un signal n’est pas « une donnée présente ».

Un signal doit posséder :

- cible ;
- horizon ;
- direction ;
- force ;
- probabilité ;
- stabilité ;
- coût ;
- validité hors échantillon.

## 16.2 Information Coefficient

```text
IC = corrélation(signal_t, rendement_futur)
```

## 16.3 Hit Rate

```text
taux de directions correctement prévues
```

## 16.4 Calibration

Exemple :

```text
quand le modèle annonce 70 %
la hausse doit se produire environ 70 % du temps
```

## 16.5 Brier Score

Pour une probabilité binaire :

```text
Brier = moyenne((p - y)²)
```

## 16.6 Log Loss

Pénalise fortement la confiance erronée.

## 16.7 Signal composite

```text
Signal =
prix
+ volume
+ volatilité
+ régime
+ breadth
+ flux
+ news
+ on-chain
+ astro expérimental
```

Aucun bloc ne doit être obligatoire s’il n’est pas disponible.

---

# 17. No-FOMO Math V2

## 17.1 Limite actuelle

Le seuil fixe de 12 % est trop simple.

## 17.2 Nouvelle logique

Mesurer :

- rendement / volatilité ;
- distance à moyenne ;
- percentile historique ;
- accélération ;
- volume anormal ;
- distance au dernier pivot ;
- drawdown récent ;
- sentiment ;
- flux.

## 17.3 Score d’extension

```text
extension =
z-score rendement
+ z-score volume
+ distance EMA
+ percentile volatilité
```

## 17.4 Verdicts

```text
NORMAL
ÉTENDU
SURÉTENDU
PARABOLIQUE
CAPITULATION
```

Aucun de ces verdicts ne suffit seul à acheter ou vendre.

---

# 18. Micro-Transaction Math V2 à V4

## 18.1 Calcul attendu

```text
coût total =
frais maker/taker
+ spread
+ slippage
+ impact
+ conversion
+ retrait éventuel
```

## 18.2 Valeur attendue nette

```text
EV_net =
probabilité_gain × gain
- probabilité_perte × perte
- coûts
```

## 18.3 Seuil minimal

Une transaction simulée doit être refusée si :

```text
edge attendu ≤ coûts + marge de sécurité
```

## 18.4 Taille minimale économique

Le petit montant peut être détruit par :

- frais ;
- spread ;
- conversion ;
- minimum d’ordre.

Atlas doit afficher :

```text
montant simulé
frais
coût en %
gain nécessaire pour seuil de rentabilité
```

---

# 19. Execution Math V2 à V5

## 19.1 Simulateur réaliste

Éléments :

- prix mid ;
- bid/ask ;
- spread ;
- profondeur ;
- ordre market ;
- ordre limit ;
- remplissage partiel ;
- délai ;
- slippage ;
- frais ;
- annulation.

## 19.2 Modèle Almgren-Chriss

À étudier plus tard pour :

- coût d’impact ;
- risque d’exécution ;
- découpage d’ordre.

## 19.3 Queue Position

Pour un ordre limite :

- quantité devant ;
- taux de consommation ;
- probabilité de fill ;
- durée.

## 19.4 Verdict

```text
REFUS
OBSERVER
SIMULER
PRÉPARER
CONFIRMER
EXÉCUTER BORNÉ
```

Seul Christophe peut autoriser le dernier état.

---

# 20. Validation scientifique et anti-overfit

## 20.1 Séparation temporelle

Interdit :

```text
shuffle aléatoire simple
```

Recommandé :

- train passé ;
- validation suivante ;
- test futur ;
- walk-forward.

## 20.2 Embargo et purge

Éviter que des fenêtres qui se chevauchent contaminent train et test.

## 20.3 Backtest avec coûts

Inclure :

- spread ;
- frais ;
- slippage ;
- latence ;
- ordre non rempli ;
- minimum ;
- indisponibilité.

## 20.4 Deflated Sharpe Ratio

Corrige :

- non-normalité ;
- sélection ;
- nombreux essais ;
- chance.

## 20.5 Probability of Backtest Overfitting

Mesure la probabilité qu’une stratégie choisie soit une fausse découverte.

## 20.6 Multiple Testing

Pour le laboratoire AstroCycle, le nombre de variables peut exploser.

Correction obligatoire :

- Bonferroni ;
- Holm ;
- Benjamini-Hochberg FDR ;
- tests placebo ;
- permutation.

## 20.7 Registre des essais

Chaque essai doit enregistrer :

```text
modèle
variables
période
fréquence
actifs
paramètres
coûts
résultat train
résultat test
nombre total d’essais
```

## 20.8 Critère de promotion

Un module passe au niveau supérieur seulement s’il :

- bat une baseline ;
- reste utile hors échantillon ;
- survit aux coûts ;
- survit à plusieurs périodes ;
- survit à plusieurs actifs ;
- reste calibré ;
- ne dépend pas d’un seul réglage.

---

# 21. Architecture du modèle de prédiction crypto

## 21.1 Ne pas créer un modèle unique géant

Architecture recommandée :

```text
Model A — volatilité
Model B — direction
Model C — régime
Model D — flux
Model E — news
Model F — astro expérimental
Model G — risque
Ensemble — décision simulée
```

## 21.2 Cibles

### Horizon court

```text
5 min
15 min
1 h
4 h
```

### Horizon moyen

```text
1 jour
3 jours
7 jours
```

### Cibles

- direction ;
- rendement ;
- volatilité ;
- drawdown ;
- liquidité ;
- probabilité de stress.

## 21.3 Features marché

- rendements multi-horizons ;
- volatilité ;
- volume ;
- volume/market cap ;
- dominance ;
- breadth ;
- corrélation ;
- beta ;
- drawdown ;
- Hurst ;
- entropy ;
- wavelets ;
- régime.

## 21.4 Features exchange

- spread ;
- order book imbalance ;
- trade flow imbalance ;
- microprice ;
- open interest ;
- funding ;
- liquidations ;
- profondeur ;
- impact.

## 21.5 Features on-chain

Plus tard :

- flux exchange ;
- adresses actives ;
- frais réseau ;
- hash rate ;
- realized cap ;
- MVRV ;
- SOPR ;
- stablecoin supply ;
- bridge flows.

## 21.6 Features news

- source ;
- catégorie ;
- entité ;
- polarité ;
- certitude ;
- nouveauté ;
- portée ;
- impact ;
- retard de publication.

## 21.7 Features macro

- CPI ;
- taux ;
- Fed / BCE ;
- dollar ;
- Nasdaq ;
- or ;
- liquidité mondiale ;
- calendrier économique.

## 21.8 Features calendaires

Avant l’astrologie, intégrer les cycles objectivement forts :

- heure UTC ;
- session Asie ;
- session Europe ;
- session États-Unis ;
- jour de semaine ;
- week-end ;
- fin de mois ;
- publication macro ;
- clôture futures ;
- échéances options ;
- halving Bitcoin ;
- unlock token ;
- maintenance exchange.

---

# 22. Cycles crypto réels

## 22.1 Cycle intrajournalier

Le marché crypto est ouvert 24/7, mais l’activité n’est pas uniforme.

Des recherches ont observé :

- phases Asie ;
- Europe ;
- États-Unis ;
- pics autour des publications macro américaines ;
- activité récurrente aux heures pleines ;
- effets algorithmiques.

## 22.2 Cycle hebdomadaire

Mesurer :

- week-end ;
- dimanche ;
- lundi ;
- liquidité nocturne ;
- différences de spread.

## 22.3 Cycle mensuel

- fin de mois ;
- options ;
- reporting ;
- paie ;
- flux ETF ;
- rebalancement.

## 22.4 Cycle Bitcoin

- halving ;
- émission ;
- difficulté ;
- hash rate ;
- cycle long.

Il ne faut pas réduire tout le marché à un simple cycle de quatre ans.

## 22.5 Cycle de liquidité

- stablecoin mint/burn ;
- taux ;
- dollar ;
- liquidité globale ;
- ETF ;
- entrées/sorties exchange.

---

# 23. Laboratoire AstroCycle — principe

## 23.1 Positionnement

Le laboratoire doit distinguer trois couches :

```text
A — Astronomie mesurable
B — Météorologie spatiale mesurable
C — Astrologie symbolique expérimentale
```

## 23.2 Règle de vérité

```text
Astronomie
= positions et cycles calculables

Space weather
= phénomènes physiques mesurables

Astrologie
= système symbolique non validé comme causalité financière
```

Il est possible de tester une hypothèse astrologique sans la présenter comme prouvée.

## 23.3 Statut

```text
ASTROCYCLE LAB
STATUT : EXPÉRIMENTAL
AUCUNE ACTION RÉELLE
```

---

# 24. Données astronomiques objectives

## 24.1 Source

NASA/JPL Horizons.

Données possibles :

- position géocentrique ;
- longitude écliptique ;
- latitude ;
- distance ;
- vitesse ;
- élongation ;
- phase ;
- illumination ;
- déclinaison.

## 24.2 Lune

Variables :

- âge synodique ;
- phase continue ;
- illumination ;
- distance Terre-Lune ;
- périgée/apogée ;
- déclinaison ;
- nœud ascendant/descendant ;
- vitesse angulaire ;
- éclipse.

## 24.3 Soleil

- longitude ;
- déclinaison ;
- distance ;
- saison ;
- équinoxe ;
- solstice.

## 24.4 Planètes

- longitude géocentrique ;
- vitesse apparente ;
- rétrogradation apparente ;
- séparation angulaire ;
- conjonction ;
- opposition.

## 24.5 Encodage cyclique

Pour une phase \(\theta\) :

```text
sin(θ)
cos(θ)
sin(2θ)
cos(2θ)
...
```

Avantage :

- continuité ;
- pas de rupture artificielle 359° → 0° ;
- harmonique testable.

---

# 25. Space Weather Math

## 25.1 Sources

NOAA SWPC :

- Kp ;
- Ap ;
- F10.7 ;
- sunspots ;
- vent solaire ;
- champ magnétique ;
- alertes ;
- flux X-ray.

Kyoto WDC :

- Dst ;
- AE ;
- indices géomagnétiques.

## 25.2 Variables

```text
Kp
Ap
Dst
AE
F10.7
sunspot number
solar wind speed
solar wind density
IMF Bz
X-ray flux
proton flux
```

## 25.3 Hypothèses testables

- effet sur l’infrastructure ;
- effet sur la latence ou disponibilité ;
- effet comportemental indirect ;
- corrélation avec volatilité ;
- corrélation avec volume ;
- corrélation avec liquidité.

## 25.4 Priorité scientifique

Le space weather possède une réalité physique.

Son lien avec les rendements financiers reste une hypothèse empirique, pas une causalité acquise.

## 25.5 Usage recommandé

```text
feature expérimentale
+ contrôle
+ stress infrastructure
```

Pas :

```text
signal d’achat automatique
```

---

# 26. Astrologie symbolique expérimentale

## 26.1 Features possibles

- signes zodiacaux ;
- maisons non nécessaires dans un modèle global ;
- conjonction 0° ;
- sextile 60° ;
- carré 90° ;
- trigone 120° ;
- opposition 180° ;
- rétrogradation ;
- ingress ;
- nœuds lunaires.

## 26.2 Encodage d’un aspect

Pour un angle cible \(a\) :

```text
distance_aspect =
min(|Δλ - a|, 360 - |Δλ - a|)
```

Feature douce :

```text
aspect_strength = exp(-distance_aspect² / 2σ²)
```

Éviter les simples drapeaux binaires.

## 26.3 Problème combinatoire

Avec plusieurs planètes, aspects, orbes et horizons, des milliers d’hypothèses apparaissent.

Risque :

```text
trouver une corrélation par hasard
```

## 26.4 Placebo

Comparer avec :

- angles aléatoires ;
- dates décalées ;
- pseudo-planètes ;
- phases mélangées ;
- années permutées.

## 26.5 Critère de survie

Une feature astrologique ne peut être promue que si elle :

- améliore un baseline ;
- survit hors échantillon ;
- survit à la correction multiple ;
- survit à plusieurs actifs ;
- survit à plusieurs exchanges ;
- survit aux coûts ;
- reste stable dans le temps.

## 26.6 État scientifique

Les tests contrôlés classiques de l’astrologie natale n’ont pas validé ses prétentions générales.

Des travaux financiers ont observé certaines associations lunaires, tandis que d’autres trouvent des effets faibles, instables ou indirects.

Conclusion :

```text
testable
≠ validé
corrélation
≠ causalité
```

---

# 27. Modèle AstroCycle proposé

## 27.1 Modèles comparés

### M0 — Baseline marché

- prix ;
- volume ;
- volatilité ;
- calendrier ;
- régime.

### M1 — Astronomie objective

M0 + :

- phase lunaire continue ;
- illumination ;
- distance ;
- déclinaison ;
- positions.

### M2 — Space weather

M1 + :

- Kp ;
- Ap ;
- Dst ;
- F10.7 ;
- vent solaire.

### M3 — Astrologie symbolique

M2 + :

- aspects ;
- rétrogradations ;
- ingresses ;
- cycles symboliques.

## 27.2 Comparaison

Mesures :

- log loss ;
- Brier ;
- AUC ;
- IC ;
- QLIKE ;
- pinball loss ;
- interval coverage ;
- coûts ;
- DSR ;
- PBO.

## 27.3 Règle de décision

```text
Si M1, M2 ou M3 n’améliore pas M0 hors échantillon :
feature rejetée.
```

## 27.4 Pas de cherry-picking

Le rapport doit publier :

- tests positifs ;
- tests nuls ;
- tests négatifs ;
- nombre d’essais ;
- paramètres.

---

# 28. Wavelet & Cycle Engine

## 28.1 Pourquoi les wavelets

Le marché est non stationnaire.

Les cycles changent dans le temps.

La transformée en ondelettes permet une lecture :

```text
temps × fréquence
```

## 28.2 Fonctions

- énergie par bande ;
- cycle dominant ;
- durée ;
- cohérence entre actifs ;
- cohérence avec volume ;
- cohérence avec AstroCycle ;
- rupture de cycle.

## 28.3 Wavelet Coherence

Comparer :

```text
BTC ↔ ETH
BTC ↔ volume
BTC ↔ dominance
BTC ↔ Kp
BTC ↔ phase lunaire
BTC ↔ sentiment
```

## 28.4 Précaution

La cohérence ne prouve pas une causalité.

Il faut :

- cône d’influence ;
- significativité ;
- surrogates ;
- correction multiple ;
- test futur.

---

# 29. Hurst, fractales et multifractales

## 29.1 Hurst roulant

Calculer sur fenêtres :

- 256 points ;
- 512 points ;
- 1 024 points.

## 29.2 Multifractal DFA

Mesurer :

- spectre multifractal ;
- largeur ;
- asymétrie ;
- changements de régime.

## 29.3 Usage

- tendance persistante ;
- mean reversion ;
- bruit ;
- régime ;
- qualité de prédiction.

## 29.4 Limite

Le Hurst estimé sur courte fenêtre est instable.

Il ne doit pas devenir un bouton acheter/vendre.

---

# 30. Entropy Engine

## 30.1 Permutation Entropy

Mesure l’ordre ordinal des séquences.

## 30.2 Sample Entropy

Mesure la régularité.

## 30.3 Transfer Entropy

Mesure une direction d’information possible.

## 30.4 Wavelet Entropy

Mesure la dispersion de l’énergie entre échelles.

## 30.5 Sortie

```text
Structure élevée
Structure moyenne
Bruit élevé
Rupture
```

---

# 31. News Sentinel avancé

## 31.1 Sources prioritaires

- autorités ;
- exchange status ;
- protocoles ;
- GitHub officiel ;
- communiqués ;
- documentation ;
- médias spécialisés ;
- réseaux sociaux en dernier.

## 31.2 Classification

```text
RÉGLEMENTATION
SÉCURITÉ
LISTING
DELISTING
MAINTENANCE
TOKENOMICS
UNLOCK
PARTENARIAT
RUMEUR
MACRO
STABLECOIN
ETF
EXCHANGE
```

## 31.3 Score

- fiabilité source ;
- nouveauté ;
- gravité ;
- portée ;
- confirmation ;
- surprise ;
- impact historique ;
- délai.

## 31.4 Event Study

Pour chaque événement :

```text
rendement anormal
volume anormal
volatilité
spread
durée de l’effet
```

## 31.5 Interaction AstroCycle

Tester séparément :

```text
news × régime
news × sentiment
news × phase lunaire
news × space weather
```

Une interaction ne doit être retenue que si elle survit hors échantillon.

---

# 32. Mémoire avancée

## 32.1 SQLite

Tables :

```text
market_snapshots
asset_quotes
chart_series
features
model_predictions
model_versions
regimes
news_events
astro_features
space_weather
simulations
orders_readonly
fills_readonly
risk_decisions
backtests
experiments
```

## 32.2 Feature Store

Chaque feature :

- nom ;
- version ;
- formule ;
- source ;
- timestamp de disponibilité ;
- fréquence ;
- statut ;
- qualité.

## 32.3 Model Registry

Chaque modèle :

- version ;
- données ;
- features ;
- paramètres ;
- métriques ;
- période ;
- hash ;
- statut.

## 32.4 Reproductibilité

Une prévision doit pouvoir être reconstruite.

---

# 33. Faisabilité sur la machine de Christophe

Configuration connue :

```text
Ryzen 7
RTX 3060 Laptop 6 Go
16 Go RAM
```

## 33.1 Très adapté

- Python ;
- NumPy ;
- pandas / Polars ;
- SQLite ;
- DuckDB ;
- statsmodels ;
- scikit-learn ;
- XGBoost ;
- LightGBM ;
- wavelets ;
- HMM ;
- GARCH ;
- Monte Carlo ;
- petits LSTM/TCN.

## 33.2 À limiter

- carnet 10 ms permanent sur des centaines d’actifs ;
- L3 order book massif ;
- gros Transformers ;
- entraînement continu GPU lourd ;
- stockage brut illimité.

## 33.3 Fréquence recommandée

Départ :

```text
1 min
5 min
15 min
1 h
1 jour
```

Pas besoin de nanosecondes.

## 33.4 Stockage

- agrégation ;
- compression Parquet ;
- SQLite metadata ;
- DuckDB analytics ;
- rétention ;
- raw court terme ;
- features long terme.

---

# 34. Bybit EU dans le modèle mathématique

## 34.1 Phase lecture seule

Données utiles :

- soldes ;
- historique ;
- fills ;
- frais ;
- ordres ;
- dépôts ;
- retraits ;
- carnet public ;
- trades publics.

## 34.2 Sous-compte futur

Nom proposé :

```text
ERITHIA_TEST
```

Usage :

- petit capital ;
- Spot ;
- P&L isolé ;
- aucune marge ;
- aucun Earn ;
- aucun prêt ;
- aucun retrait API.

## 34.3 Réconciliation

Comparer :

```text
CoinGecko
Bybit spot
prix exécuté
prix simulé
frais
slippage
```

## 34.4 Tax API

Première intégration privée recommandée.

## 34.5 API V5

Deuxième intégration :

```text
read-only
```

---

# 35. Ce qui reste à faire

## P0 — Verrouiller la 26.42

- ne pas casser ;
- conserver ZIP ;
- conserver SHA ;
- conserver preuve Firefox ;
- corriger uniquement les écarts identifiés.

## P1 — Corriger la version de l’archive

Le workflow 26.42 contient encore une constante 26.41 dans les snapshots.

Correction bornée :

```text
V1.1-alpha.26.41
→ V1.1-alpha.26.42
```

Sans modifier le marché public.

## P2 — Observabilité

- diagnostics ;
- latence ;
- compteurs ;
- erreurs ;
- source ;
- cache ;
- retry ;
- statut par module.

## P3 — Données historiques

- collecte durable ;
- fréquence ;
- rétention ;
- formats ;
- contrôle qualité.

## P4 — Math Core V2

- rendements ;
- volatilité ;
- drawdown ;
- corrélations ;
- breadth ;
- Hurst ;
- entropy ;
- cycles.

## P5 — Paper Trading V2

- frais ;
- slippage ;
- spread ;
- historique ;
- métriques ;
- export.

## P6 — News Sentinel

- collecte ;
- déduplication ;
- sources ;
- classification ;
- event study.

## P7 — Backend local

- API ;
- SQLite ;
- scheduler ;
- logs ;
- secrets.

## P8 — Bybit EU

- KYC ;
- sécurité ;
- export ;
- Tax API ;
- read-only.

## P9 — Flow Math

- order book ;
- TFI ;
- OBI ;
- spread ;
- depth ;
- microprice.

## P10 — AstroCycle Lab

- NASA ;
- NOAA ;
- Kyoto ;
- feature store ;
- protocole placebo ;
- expérimentation hors décision.

---

# 36. Roadmap recommandée

## V1.1-alpha.26.43 — Validation et cohérence

Mission :

- aucune fonction premium ;
- corriger la version du workflow ;
- matrice multi-actifs ;
- diagnostics ;
- documentation Bybit sans connexion.

## V1.1-alpha.26.44 — Audience V2

- envoi confirmé ;
- durée session ;
- fermeture ;
- déduplication ;
- statut tentée/confirmée.

## V1.1-alpha.26.45 — Console privée intégrée

- import local de clé ;
- aucune clé publiée ;
- console privée.

## V1.1-alpha.26.46 — Comparateur

- Top 3 / Top 5 ;
- base 100 ;
- corrélation ;
- volatilité ;
- drawdown.

## V1.1-alpha.26.47 — News Sentinel V1

- RSS ;
- sources ;
- déduplication ;
- classification ;
- aucun LLM libre.

## V1.1-alpha.26.48 — Math Core V2

- statistiques descriptives ;
- volatilité ;
- drawdown ;
- Hurst ;
- entropy ;
- breadth ;
- statut non prédictif.

## V1.1-alpha.26.49 — Paper Trading V2

- frais ;
- spread estimé ;
- slippage ;
- métriques ;
- exports ;
- comparaison baseline.

## V1.2-local.1 — Backend minimal

- FastAPI ;
- SQLite ;
- scheduler ;
- logs ;
- endpoints lecture.

## V1.2-local.2 — Mémoire durable

- snapshots ;
- features ;
- news ;
- simulation ;
- modèles.

## V1.2-local.3 — Quant Core

- GARCH ;
- HAR ;
- régression quantile ;
- HMM ;
- conformal ;
- walk-forward.

## V1.2-local.4 — News Sentinel V2

- ingestion ;
- event study ;
- sentiment ;
- impact.

## V1.2-local.5 — Bybit EU Read-Only

- Tax API ;
- wallet ;
- ordres ;
- fills ;
- frais ;
- aucune écriture.

## V1.2-local.6 — Flow Math

- WebSocket ;
- carnet ;
- OBI ;
- TFI ;
- microprice ;
- spread ;
- depth.

## V1.2-local.7 — AstroCycle Lab

- NASA JPL ;
- NOAA ;
- Kyoto ;
- phases ;
- cycles ;
- space weather ;
- astrologie symbolique isolée ;
- tests placebo.

## V1.2-local.8 — Ensemble Lab

- combinaison ;
- calibration ;
- modèle registry ;
- comparaison M0/M1/M2/M3.

## V1.3 — Simulation connectée

- miroir exchange ;
- coûts ;
- sous-compte ;
- limites ;
- aucun ordre réel.

## V1.4 — Préparation d’ordre

- proposition ;
- expiration ;
- confirmation ;
- journal.

## V2.0 — Action bornée

Prérequis :

- validation longue ;
- sécurité ;
- permission minimale ;
- aucun retrait ;
- sous-compte ;
- capital limite ;
- kill switch ;
- confirmation humaine ;
- audit Grande Sœur ;
- validation Christophe.

---

# 37. Priorité mathématique concrète

Ordre recommandé :

```text
1. Rendements logarithmiques
2. Volatilité multi-horizon
3. Drawdown
4. Corrélation / beta
5. Breadth
6. Hurst / entropy
7. Wavelets
8. GARCH / HAR
9. HMM
10. Quantile / conformal
11. Flow
12. News
13. AstroCycle
14. Ensemble
```

Pourquoi AstroCycle n’est pas premier :

- il faut d’abord un baseline solide ;
- sans baseline, aucune amélioration ne peut être mesurée ;
- sans validation, les cycles produisent facilement des faux positifs.

---

# 38. Premier modèle concret à construire

## ATLAS QUANT CORE V2 — BTC / ETH

### Données

- BTC EUR ;
- ETH EUR ;
- volume ;
- market cap ;
- 5 min / 1 h / 1 j ;
- calendrier UTC.

### Features

- rendements 1/3/6/12/24 périodes ;
- volatilité ;
- volume z-score ;
- drawdown ;
- corrélation ;
- beta ;
- Hurst ;
- permutation entropy ;
- wavelet energy ;
- session.

### Cibles

- direction 1 h ;
- volatilité 24 h ;
- quantiles 24 h.

### Modèles

- naïf ;
- Ridge ;
- XGBoost ;
- GARCH ;
- HAR ;
- HMM ;
- quantile regression.

### Validation

- walk-forward ;
- coûts nuls d’abord ;
- coûts ensuite ;
- calibration ;
- DSR ;
- PBO.

### Sortie UI

```text
Régime
Volatilité prévue
Probabilité hausse
Intervalle
Risque
Confiance
Aucune action réelle
```

---

# 39. Premier modèle AstroCycle concret

## ATLAS ASTROCYCLE V0.1

### Période

Au moins plusieurs années.

### Actifs

- BTC ;
- ETH.

### Fréquence

- 1 h ;
- 1 jour.

### Baseline M0

- marché ;
- calendrier ;
- régime ;
- macro.

### Astronomie M1

- sin/cos phase lunaire ;
- illumination ;
- distance ;
- déclinaison ;
- saison.

### Space weather M2

- Kp ;
- Dst ;
- F10.7 ;
- vent solaire.

### Symbolique M3

- aspects doux ;
- rétrogradations ;
- ingresses.

### Cibles

- rendement ;
- volatilité ;
- volume ;
- stress.

### Tests

- walk-forward ;
- placebo ;
- shuffle ;
- dates décalées ;
- correction FDR ;
- DSR ;
- PBO.

### Verdict

```text
CONSERVÉ
EXPLORATOIRE
REJETÉ
```

Jamais :

```text
ACHETER PARCE QUE PLEINE LUNE
```

---

# 40. Sources scientifiques et techniques

## Données crypto

- CoinGecko API documentation  
  https://docs.coingecko.com/
- CoinGecko market chart  
  https://docs.coingecko.com/reference/coins-id-market-chart
- CoinGecko endpoint overview  
  https://docs.coingecko.com/reference/endpoint-overview

## Bybit

- Bybit API V5 Orderbook  
  https://bybit-exchange.github.io/docs/v5/market/orderbook
- Bybit WebSocket Orderbook  
  https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
- Bybit Open Interest  
  https://bybit-exchange.github.io/docs/v5/market/open-interest

## Astronomie

- NASA/JPL Horizons API  
  https://ssd-api.jpl.nasa.gov/doc/horizons.html
- NASA SPICE / SPK  
  https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/spk.html

## Space weather

- NOAA SWPC data services  
  https://services.swpc.noaa.gov/
- NOAA products  
  https://services.swpc.noaa.gov/products/
- Kyoto Dst  
  https://wdc.kugi.kyoto-u.ac.jp/dstdir/

## Volatilité probabiliste

- Dudek, Orzeszko, Fiszeder — Probabilistic Forecasting Cryptocurrencies Volatility  
  https://arxiv.org/abs/2508.15922

## Wavelets et Hurst

- Covid-19 impact on cryptocurrencies: Evidence from a wavelet-based Hurst exponent  
  https://doi.org/10.1016/j.physa.2022.127170
- Chaos and order in the Bitcoin market  
  https://doi.org/10.1016/j.physa.2019.04.164
- What are the main drivers of the Bitcoin price? Wavelet coherence  
  https://arxiv.org/abs/1406.0268

## Cycles temporels crypto

- Decomposing cryptocurrency high-frequency price dynamics into recurring and noisy components  
  https://arxiv.org/abs/2306.17095

## Flux

- Modelling Crypto Asset Order-Flow Imbalance  
  https://ssrn.com/abstract=6688399
- Order Flow Imbalance and the Decay of Price Impact in CME Ether Future  
  https://ssrn.com/abstract=6772279
- Modelling Order Book Imbalance with Hawkes Processes  
  https://ssrn.com/abstract=6882701

## Validation

- Deflated Sharpe Ratio  
  https://ssrn.com/abstract=2460551
- Probability of Backtest Overfitting  
  https://ssrn.com/abstract=2326253
- Conformal Prediction for Time Series  
  https://arxiv.org/abs/2010.09107

## Lune et finance

- Are investors moonstruck? Lunar phases and stock returns  
  https://doi.org/10.1016/j.jempfin.2005.06.001
- Further international evidence  
  https://doi.org/10.1016/j.jempfin.2010.11.002
- Astrofinance and Behavioral Drivers of Cryptocurrency Returns  
  https://doi.org/10.56578/jafas110304

## Astrologie — test contrôlé

- Carlson, A double-blind test of astrology  
  https://doi.org/10.1038/318419a0

---

# 41. Message à Grande Sœur

```text
[AERITH-10 — PETITE SŒUR → GRANDE SŒUR]

J’ai relu l’état du projet Agent-Crypto autour de la base canonique 26.42
et j’ai élargi l’architecture mathématique.

Constat principal :
la 26.42 est une vraie base d’observation, mais son Math Core est encore
heuristique et pédagogique. Les scores présents ne constituent pas une
prévision statistique validée.

Proposition :
conserver le Math Core V1 et le faire évoluer par niveaux.

Niveau 2 :
rendements, volatilité, drawdown, corrélations, breadth, Hurst, entropy.

Niveau 3 :
GARCH, HAR, quantiles, conformal, probabilités calibrées.

Niveau 4 :
HMM, régimes, order flow, carnet, microprice, spread, depth, Hawkes.

Niveau 5 :
ensemble marché + news + on-chain + macro + AstroCycle expérimental.

AstroCycle est séparé en :
A. astronomie objective NASA ;
B. space weather NOAA/Kyoto ;
C. astrologie symbolique expérimentale.

Aucune feature astro ne doit avoir d’effet opérationnel sans comparaison
à une baseline, test hors échantillon, placebo, correction multiple,
DSR et PBO.

Bybit EU reste un connecteur futur en lecture seule :
export manuel → Tax API → API V5 read-only → simulation.

Décision finale :
Christophe.
```

---

# 42. Block LLM de reprise

```text
[ERITH.IA AGENT-CRYPTO — MATH ADVANCED & ASTROCYCLE]

IA émettrice :
Aerith-10 Créatrice — Petite Sœur.

IA destinataire :
Aerith-10 Créatrice — Grande Sœur.

Autorité :
Christophe / Blue Azur.

Base canonique :
V1.1-alpha.26.42.

État :
Top 50, EUR/USD, graphiques réels, mémoire, simulation, audience,
console privée, Missions de Vie.

Math Core actuel :
heuristique V1.
Non prédictif.
Non backtesté.
Non calibré.

Progression :
V2 descriptif.
V3 probabiliste.
V4 régimes et flux.
V5 ensemble multimodal.
V6 action bornée future.

Modules avancés :
rendements logarithmiques,
EWMA,
GARCH,
HAR,
quantiles,
conformal,
HMM,
Student-t,
wavelets,
Hurst,
entropy,
PCA,
DCC-GARCH,
copules,
transfer entropy,
OFI,
OBI,
TFI,
microprice,
Hawkes,
VaR,
Expected Shortfall,
Monte Carlo,
DSR,
PBO.

AstroCycle :
NASA/JPL pour les éphémérides.
NOAA/Kyoto pour space weather.
Astrologie symbolique isolée et expérimentale.
Aucune causalité supposée.
Placebos et multiple testing obligatoires.
Aucune décision réelle.

Bybit EU :
lecture seule d’abord.
Aucun secret GitHub.
Aucun retrait API.
Aucun Margin, Loan ou Earn initial.
Sous-compte futur ERITHIA_TEST.

Stop point :
ne pas injecter tout cela dans la 26.42.
Construire d’abord le backend local, la mémoire durable,
les baselines et la validation.
```

---

# 43. Conclusion finale

Le projet a beaucoup avancé.

Il possède maintenant :

```text
une interface réelle
une source canonique
des graphiques réels
une mémoire
une simulation
une audience
une console privée
une vision sociale
un exchange candidat
une architecture locale
```

Le prochain grand saut n’est pas graphique.

Il est mathématique et méthodologique :

```text
passer du score arbitraire
à la statistique

passer de la statistique
à la probabilité

passer de la probabilité
à la validation

passer de la validation
à la simulation réaliste

passer de la simulation
à la lecture exchange

passer de la lecture
à une décision humaine contrôlée
```

Le modèle astronomique peut enrichir la recherche à condition de rester :

```text
isolé
mesurable
falsifiable
comparé
documenté
non causal par défaut
```

La formule directrice reste :

```text
Source.
Temps.
Qualité.
Mémoire.
Mathématiques.
Régime.
Flux.
Scénarios.
Risque.
Simulation.
Validation humaine.
Trace.
```
