# ERITH.IA — Q / Quack AI · Cas d'école Radar → Trader → Coffre

**Statut : recherche PAPER, lecture seule — aucune exécution réelle.**
**Date initiale d'étude : 17 octobre 2026.** Une date de publication documentaire n'est pas un relevé de carnet.

[Page humaine Trader](../trader/quack-ai-case-study.html) · [Journal PAPER JSON](../data/trader_flux/q_paper/state.json) · [Radar — protocole](PROTOCOLE_RADAR_CIBLAGE.md)

## 1. Identité, marchés, contexte

- Identifiant CoinGecko : `quack-ai` ; symbole `Q` ; projet Quack AI.
- Adresse annoncée BNB Smart Chain (BEP-20) : `0xc07e1300dc138601FA6B0b59f8D0FA477e690589`.
- Quack AI était coté le **2 septembre 2025**, notamment Bitget Spot Q/USDT à 08:00 UTC, **bien avant** sa hausse du 17 octobre 2026. Binance Alpha n'est pas Binance Spot.
- [Annonce officielle Bitget](https://www.bitget.com/support/articles/12560603836754) · [site du projet](https://quackai.ai/) · [historique Bitget publié sur notre GitHub](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-bitget-spot-native-daily-2026-09-single-symbol-owners).
- Marché de travail : **Bitget Spot QUSDT (USDT)**. Les cours CoinGecko sont **USD** et ne constituent pas des exécutions QUSDT. Aucun dérivé Futures n'est inclus.

La qualification Radar du 17 octobre a observé `QUSDT` en Spot Bitget ; elle a marqué **`SYMBOL_ONLY_NOT_COIN_ID_PROVEN`**. Le dossier d'identité historique a par ailleurs établi un candidat « exact CoinGecko ID + contrat » ; il ne certifie pas par magie l'adresse d'un carnet à chaque nouvelle lecture. Croiser les références du jeton avec l'instrument officiel avant de déclarer « identité certifiée ».

## 2. Trois familles de données déjà présentes

### A. Archive quotidienne dans le Coffre — **historique, pas temps réel**

Le catalogue `data/historical_archive_prototype/top250_multiresolution_sources/index.json` référence pour `quack-ai` **390 chandelles natives journalières QUSDT Bitget**, 4 lacunes dans l'intervalle observé, et le fichier de release `quack-ai-QUSDT-1D.json.gz` (empreinte SHA-256 cataloguée). Cette couverture s'arrête à la fin septembre 2026. Il s'agit d'une référence externe GitHub Release, pas de la confirmation d'une série 1m intégrée dans le lecteur du Coffre.

Le catalogue `top250_multisource_coverage/index.json` indique pour Q **0 mois et 0 bougie originelle 1m vérifiée**. Les données horaires récentes ne remplacent pas ces archives 1m.

### B. Première observation Radar de ce jour — **fait historique**

Snapshot `data/crypto/radar-opportunities/2026-10-17.json`, Core généré à **10:35:04 UTC** : `quack-ai`, rang 134, prix CoinGecko **0,0711509725 USD**, variation 24 h **+32,11454 %**, 7 j **+132,1782 %**, volume agrégé 24 h **58 952 182 USD**. Le mouvement était **déjà commencé** à ce relevé. Il serait faux d'affirmer que le Radar a prédit le départ de la hausse.

### C. Qualification Spot — **instantané de carnet, pas simulation exécutée**

`data/crypto/radar-opportunities/qualification-latest.json` : qualification à **19:16:07 UTC**, marché QUSDT Bitget, 20 bougies horaires closes, bid/ask proches de **0,122437 USDT**, coût d'aller-retour **fictif 0,28830 % pour 100 USDT**, frais **hypothétiques 0,1 % chaque côté**. Cette mesure est datée, ne se réutilise **pas** comme spread actuel. La valeur négative de `book_age_seconds` (−0,27 s) signale un léger décalage des horloges et doit être traitée comme anomalie d'horodatage, pas « anticipation ».

Le snapshot public CoinGecko de **19:19:41 UTC** note Q à environ **0,122074 USD**, +120,64 % sur 24 h et +294,24 % sur 7 j. Ce sont les valeurs de ce snapshot, pas une cotation live.

## 3. Hypothèses à tester, sans réécriture après coup

- **Continuation après consolidation** : prix Spot franchit un plus haut de consolidation **sur bougie horaire close** avec volume supérieur à la médiane des dernières 20 bougies. Observer à +1 h / +4 h / +24 h / +7 j. Une impulsion dont les bougies sont déjà clôturées **avant** T0 ne compte pas comme prédiction.
- **Essoufflement / retournement** : clôture horaire sous la médiane mobile de 20 heures après une impulsion établie, avec volume notable. Ne pas confondre ce constat avec une recommandation de vendre.
- **Abstention** : carnet absent, latence, identité non vérifiée, bougies discontinues, faible profondeur ou incohérence USD/USDT ⇒ *observation incomplète*, sans décision simulée.

Le protocole ne choisit ni seuil de profit opportuniste ni « entrée » rétrospective au prix le plus bas. L'expérience démarre seulement lorsqu'un observateur prospectif obtient un premier relevé vérifiable.

## 4. Répartition des responsabilités

- **Radar** : découvre, classe et archive les candidats et les raisons de la sélection.
- **Interface Administrator** : moteur commun Market, Graphique, Bougies, Carnet et sélection unique ; priorité de correction ici.
- **Trader** : console de consultation, lectures multi-horizons, analyse PAPER, et page humaine dédiée **sans moteur graphique supplémentaire**.
- **Atlas-10** : calculs, contradictions, qualité des données ; **Aerith-10** : explications, hypothèses, limites ; **Seven** : coordination et mémoire des preuves.
- **Coffre** : historiques vérifiés et leurs références SHA-256. Les points de suivi prospectif PAPER restent dans `data/trader_flux/q_paper/` avec leur source et date UTC, pas réinjectés comme « bougies historiques certifiées ».

## 5. Stop point, preuves et suites

La page du Trader peut afficher le snapshot du marché, le dernier journal Q si disponible et ses manques. Aucun ordre, aucune clé privée et aucun lien de trading réel ne sont ajoutés. Si le workflow PAPER échoue, on garde le dernier journal daté, on n'invente pas un relevé.

Après validation de Q : réutiliser les mêmes contrôles sur le Top 24 h, Top 7 j, Top volume, nouveaux listings, rebonds et risques de retournement ; éviter un nouveau code de graphique pour chaque actif. Les sélections et les résultats doivent être datés et non extrapolés.
