# Seven Heaven — extension 2019–2021 des rebonds BTC : protocole figé avant lecture des événements

**Statut : recherche PAPER documentaire. Protocole arrêté le 11 novembre 2026 avant tout décompte ou calcul des résultats sur 2019–2021.**

## Source et provenance

- Source canonique déjà présente dans le dépôt : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz`.
- Registre de contrôle : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_daily_reference/index.json`.
- Empreinte SHA-256 exigée sur les octets gzip : `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`.
- Série Binance Spot **BTCUSDT**, clôtures quotidiennes UTC, `[open_time_ms,open,high,low,close,base_volume,quote_volume,trade_count]`. Le registre compte 3 075 journées continues du 1er mai 2018 au 30 septembre 2026, dont 26 journées complétées par les archives officielles natives 1d.
- **Important :** la continuité 1d n'implique pas une continuité native 1m. Le registre préserve 5 881 minutes historiques manquantes ; comparer ce dossier uniquement à des études **quotidiennes**, pas à des exécutions au carnet minute.

## Jeu indépendant et comparateurs pré-enregistrés

- **2019 et 2020 = extension exploratoire descriptive** ; **2021 = année de contrôle, évaluée avec les mêmes règles et sans les modifier après lecture de 2019–2020**.
- Chaque année est une séquence indépendante : premier mois de janvier (30 premières journées UTC) réservé à l'initialisation des indicateurs, puis épisodes du 31 janvier au 31 décembre. Les derniers épisodes dont l'échéance J+10 sort de l'année sont exclus des métriques et marqués censurés.
- Un épisode **J0** est la première clôture supérieure à la précédente après que la clôture J−1 a été au moins **2,5 % sous le plus haut des 30 clôtures précédentes**. N'accepter qu'un épisode tous les 11 jours au minimum ; blocage de 10 jours pleins, sans consultation des prix futurs.
- **C1** : achat fictif à l'ouverture J+1. **C3** : achat fictif à l'ouverture J+3 seulement si les clôtures J0, J+1 et J+2 sont strictement croissantes.
- **LOW3** : bas quotidiens strictement croissants entre J−1, J0, J+1 et J+2 ; **VOL** : volume de base BTC à J+2 au moins égal à la moyenne des 20 journées précédentes ; **EMA** : EMA10 > EMA30 et clôture à J+2 > EMA30 (EMA ensemencée au premier close annuel).
- **Issue** pour tous les épisodes, même C3 non confirmés : écart net entre ouverture J+3 et clôture J+10. Achat fictif et liquidation à l'horizon après coûts `0,10 % frais + 0,05 % glissement` par côté ; scénario coûts doublés. Comparer les groupes `C3`, `C3+LOW3`, `C3+VOL`, `C3+EMA`, `C3+LOW3+VOL+EMA` au même horizon.
- Classer l'issue ex post à J+10 : hausse >= +3 %, baisse <= -3 %, sinon oscillation neutre. Compter également les C1 gagnants écartés et perdants évités par C3. Les données futures ne servent **jamais** à choisir les épisodes ni à filtrer.
- Conserver en second témoin l'ancienne définition **baisse >=5 % avec blocage de 21 jours** (sans autre réglage).
- **Un épisode = une expérience fictive isolée de 1 000 USDT. Aucun cumul/compounding des rendements.** L'effectif des événements conditionnels peut être trop réduit pour tester LOW3/VOL/EMA ; l'indiquer.

## Mesures et contrôles prévus

Compter les candidats, censures et confirmations par année ; rendement moyen et médian, variation avec coûts doublés, signe des rendements par sous-groupe, séparation C3 / non-C3, et différence descriptive des règles additionnelles au sein de C3. Afficher les effectifs, intervalles de Wilson descriptifs et la différence entre 2019–2020 et 2021 sans transformer ces proportions en probabilités prospectives.

Contrôles bloquants : SHA-256 gzip, nombre et chronologie des journées, nombre annuel de 365/366/365 journées, OHLCV valides, fenêtres de décision causales, équations des frais et correspondance source/registre. Le code Python doit lire directement le fichier `.json.gz` publié par le Coffre. Les archives source ne sont pas dupliquées dans Git.

## Statut pratique et limites

- Recherche adaptée à **1d**, pas aux remplissages intraminute ; volumes Binance Spot, pas volume mondial ou carnet OKX BTC/USDC.
- 2021 est une année de contrôle pré-désignée dans cette extension, mais les concepts et seuils ont été élaborés sur 2022–2026 : il faut préserver l'indépendance de l'année sans l'utiliser pour optimiser les choix.
- Étude pédagogique et PAPER. Aucune opération de marché, aucun accès de compte, aucune modification Administrator, Operator, Trader ou Bridge.
