# Seven Heaven · Coffre historique Top 250 — passation canonique

## MISE À JOUR PRIORITAIRE — reprise BTC, 11 octobre 2026

**Lire cette section avant les chiffres historiques plus bas**, qui sont des constats antérieurs.

- **BTC Binance Spot BTC/USDT en 1m : 80 mois calendaires complets / 3 510 720 bougies** selon le registre annuel (premier mois complet : 2018-05 ; dernier : 2026-09). **21 mois supplémentaires avec lacunes / 911 399 bougies originales / 5 881 minutes absentes**, selon le registre de provenance indépendant. Ne pas compter les mois avec lacunes comme mois complets ni comme série sans rupture.
- Registre complet : `public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json`. Registre des interruptions : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_verified_gap_months/index.json`. Tous les chiffres sont des inventaires publiés, pas un test Firefox du graphique Trader.
- Les PR **#340, #341, #342, #343, #344, #347, #348** sont fusionnées : réutilisation SHA-256 des blocs, conservation des interruptions BTC, rattrapage ancien sur cron GitHub existant, sérialisation des collecteurs, validation indépendante des Releases, **un seul générateur en production du registre partiel**. Archive officielle de mars 2023 : **44 560 bougies sur 44 640 minutes, 80 absentes** ; ZIP original + CHECKSUM + SQLite dans la Release `btc-spot-native-gap-2023-03`.
- **MAX n'a pas la même sémantique partout.** Ligne Trader : bouton Max (= 36500) utilise l'owner historique Interface ou un fournisseur d'échange qui peut limiter à ~300 bougies journalières ; pas de preuve de branchement à toutes les archives du Coffre. Market Microscope Bougies : chaîne marché OKX/Backend, indépendante. Coffre : **Max = historique contigu archivé**, vue horaire actuelle au maximum 12 mois, pas « depuis 2009 ». CoinGecko fournit des points de prix/volume (souvent USD), **pas les chandelles Binance 1m BTC/USDT**. La panne actuelle du graphique Trader Max n'est pas expliquée par les données du Coffre et demeure à diagnostiquer plus tard.
- **Règle d'affichage** : jamais de bougies ou volumes synthétiques pour fermer une lacune ; conserver les interruptions à la résolution 1m, ne pas joindre arbitrairement deux places/devises. Pour agrégation 1h/1j, conserver les prix authentiques disponibles et publier un indicateur explicite de couverture (par ex. 59/60 minutes), ne pas certifier « complet » ce qui est partiel.
- **Prochaine sœur IA :** poursuivre les imports originaux BTC vers Binance 2017 sans nouvel automate ; vérifier cohérence Releases/index complet/index partiel/vues horaires ; construire et TESTER **un lecteur autonome de Coffre** sur une période englobant mars 2023 avec OHLCV réels, gaps et couverture ; prouver le « Max réellement disponible » ; **aucun changement du Trader, de l'Interface, du Bridge, Market Core ou IndexedDB avant consentement explicite de l'utilisateur**. Ne pas réactiver l'automation ChatGPT désactivée.
- Détails remis au Notion canonique : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099

---


**Date du contrôle : 2026-10-11 (heure locale France).**
**Dépôt de vérité :** https://github.com/BlueAzur-Hub/erith-ia-memory
**Interface publique unique du Coffre :** https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html

## Destination utilisateur — non négociable

Obtenir pour **chacun des 250 premiers actifs du classement figé** des prix et des bougies
authentiques aussi profondément que les sources existantes le permettent, en remontant
vers leurs premières cotations vérifiables. Il ne s'agit pas de simplement afficher
250 noms, ni d'obtenir un mois par crypto. **Ne pas clore ce chantier avant une
vraie couverture des 250**; distinguer les actifs sans échange de bougies (fonds
tokenisés, stablecoins ou autres supports) et les documents de prix/NAV appropriés.
Ne jamais inventer les minutes, OHLCV, prix, devises ou cotations antérieures au
premier marché observé.

Destination fonctionnelle : le Coffre deviendra un fournisseur historique
**du Trader en premier**, après validations. Seulement ensuite, si satisfaisant,
l'Interface adoptera le même contrat. Les flux temps réel restent séparés des
archives différées. Aucun ordre réel n'est en jeu.

## Dernier état réellement vérifié

**Index fédéré Binance Spot + Bitget Spot 1m**
- **141 / 250 actifs archivés ; 109 sans archives**.
- **157 039 200 bougies natives 1m** ; Binance 120 actifs, Bitget 21.
- Couverture : Top 10 = 8/10, Top 50 = 36/50, Top 100 = 69/100, Top 250 = 141/250.
- L'index séparé des années Binance rapporte **95 actifs avec ≥12 mois consécutifs**
  et 76 avec ≥24. Attention : le décompte 95 porte sur **les sources Binance du
  catalogue annuel**, pas sur toute la fédération Binance + Bitget.
- Source canoniquement publiée :
  `public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json`
- Années :
  `public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json`

**OKX : troisième source historique effectivement acquise et publiée**
- Release :
  https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-okx-spot-native-daily-2026-09-okb-cro
- **OKB/USDT : 3 114 bougies natives journalières UTC**, de 2018-03-23 à 2026-09-30.
- **CRO/USDT : 2 465 bougies natives journalières UTC**, de 2020-01-01 à 2026-09-30.
- **5 579 bougies journalières au total** : ne PAS les ajouter au nombre de
  bougies 1m ni annoncer 143/250 dans l'index minute.
- Index de découverte consommable :
  `public/agent_crypto_erith_ia/data/historical_archive_prototype/okx_verified_daily/index.json`
- Contient noms exacts, plages, URL de Release, SHA-256 des assets.
  Les empreintes de réponses HTTP OKX **ne sont pas signées par l'exchange**.
  La première cotation du jeton ne se déduit pas de la première journée récupérée.

## Travaux effectués : références vérifiables

- PR #282 : adaptateur de vérification des archives OHLCVT Kraken, sans
  prétendre importer de vrais fichiers Kraken.
- PR #283 : 11 mois natifs XMR/USDT 2023, puis indexation en Monero.
- PR #284 et #289 : préserver les ruptures de cotation et les bougies à clôture
  anticipée ; refus d'inventer des minutes pendant la suspension de mars 2023.
- PR #285 : recherche par lot des marchés Binance historiques absents.
- PR #286 : 8 identités historiques JUP, POL, RENDER, CAKE, JTO, CFX, EIGEN,
  WIF, 12 mois certifiés puis approfondissement.
- PR #287 : 3 autres identités STX, COMP, THETA, 12 mois 1m certifiés.
- PR #288 : lecture du vrai dernier mois par actif, utile aux marchés retirés.
- PR #290 : reprise prudente des publications fédérées après collisions GitHub
  et revalidation SHA des sources à chaque tentative.
- PR #291 : bougies journalières OKX publiées pour OKB et CRO.
- Les corrections de code sont sur `main`; les ZIP originaux sont des
  GitHub Releases séparées. GitHub Pages est le **lecteur**, pas le dépôt
  de toutes les bougies minute.

## Prochaines opérations — ordre d'efficacité

1. **Acquérir, pas embellir.** Faire des lots de 10–30 actifs manquants ;
   commencer par les sources avec historiques téléchargeables en masse.
   Par actif et par plateforme, rechercher aussi les paires supprimées
   aujourd'hui, pas seulement les marchés encore listés.
2. **Accroître la granularité et les sources** : Binance et Bitget 1m,
   Kraken OHLCVT ZIP historiques, OKX natif 1m où accessible, archives
   d'anciennes cotations. Étendre le pilote OKX au-delà de OKB/CRO
   **après vérification de l'identité exacte des actifs**.
3. Décrire explicitement les cas particuliers du Top 250 : fonds tokenisés,
   stablecoins, NAV ou prix d'émission, marchés sans 1m historique.
   Ne pas assimiler NAV quotidienne à une transaction Spot minute.
4. Construire un **index multi-sources et multi-fréquences** sans
   gonfler `top250_multisource_coverage` (aujourd'hui 1m strict).
   Cohérence : `coin_id, venue, pair, quote, granularity, UTC interval,
   first/last timestamp, gaps, native SHA, archive release, provenance,
   market lifecycle`.
5. Faire un **lecteur expérimental du Coffre dans le Trader**, lecture seule :
   requête par identité exacte, chargement de 1m / 1D, période exacte,
   USD vs USDT non confondus, transition historique → prix live clairement
   identifiée. Ne toucher ni à Market Core 38.15.11 ni à l'Interface
   avant tests du Trader.
6. Conserver la **déclaration 250/250 ouverte**, y compris pour les actifs
   sans archive : pas d'actif déclaré terminé sans preuve de la profondeur
   maximale réellement disponible et de la politique de lacunes.
7. Ne pas multiplier les bots/workflows/pages sans nécessité, conserver
   les contrôles SHA, séparation public/privé et commits audités.

## Conditions de recette finale

Pour les 250 identités : preuve pour chaque source et chaque période,
historiques réellement accessibles à l'utilisateur, bornes d'inception
de marché signalées sans invention, cohérence devises + granularités,
audit de l'intégrité, démonstration dans le Trader sur plusieurs crypto
(y compris celles de sources et durées différentes), puis validation
utilisateur. Tant que des cas restent incomplets : indiquer le nombre,
les actifs, les sources manquantes et ce qui est techniquement impossible.

**Statut : 141/250 strict natif 1m, 2 actifs supplémentaires avec source
OKX native journalière publiée séparément ; Coffre et intégration Trader
non terminés.** Ne pas promettre une action de fond qui n'a pas été planifiée.
