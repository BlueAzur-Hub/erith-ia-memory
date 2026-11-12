# Seven Heaven — Vérification inter-exchanges du filtre BTC EMA 10/30 : Binance contre Bitstamp

**12 novembre 2026 — Étude PAPER, 100 % rétrospective, lecture seule.** Aucune recommandation d'achat ou de vente, aucun ordre réel, aucun changement Administrator / Trader / Operator / Bridge.

## Résumé de la recherche

La méthode EMA 10/30 déjà étudiée sur Binance a été rejouée **sans ajustement** sur les cours Spot quotidiens **Bitstamp BTC/USD**. Les deux expériences portent sur les mêmes **1 035 journées UTC**, du **1er janvier 2024 au 31 octobre 2026**, après initialisation des EMA sur **275 clôtures** depuis le 1er avril 2023.

La différence de rendement EMA est limitée à **1,36 point** entre les sources. Les deux séries donnent **68 opérations fictives** ; leurs décisions d'exposition concordent pendant **1 034 journées sur 1 035**. Le résultat est **stable descriptivement au changement de place de cotation**, sans démontrer une rentabilité future. Le calendrier 2024–2026 a déjà été étudié : la nouvelle place de cotation n'est pas un *holdout temporel inédit*.

## 1. Protocole : paramètres gelés AVANT le calcul

[**Protocole de recherche prépublié**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_FIXED_PROTOCOL_2026_11_12.md), commit `c81886c154f540bb0b5c5be379c8aabc4c6f82b5`.

- **EMA10(t) > EMA30(t)** ET **clôture(t) > EMA30(t)** : seule condition d'exposition. Calcul sur clôtures UTC déjà connues.
- Achat ou vente **fictifs à l'ouverture UTC du jour suivant**, pas à la clôture qui détermine le signal.
- **1 000 unités de monnaie de cotation** de capital initial : USD chez Bitstamp, USDT chez Binance ; comparaison des **rendements en %**, sans conversion présumée USD=USDT.
- **Frais 0,10 % et glissement 0,05 % par côté**. Simulation de sensibilité avec coûts ×2.
- Portefeuille sans levier, sans short, soit 100 % BTC, soit 100 % liquidités. Témoin Buy & Hold.
- Valorisation liquidable déduisant les coûts fictifs de vente des BTC encore détenus. Même définition de drawdown sur la trajectoire du portefeuille depuis 1 000 unités initiales.

Aucun seuil, période, multiplicateur ni indicateur n'a été choisi *après* les résultats Bitstamp.

## 2. Provenance des prix et contrôles

| Élément | Binance, étude précédente | Bitstamp, nouvelle étude |
|---|---|---|
| Marché | Binance Spot BTC/USDT | Bitstamp Spot BTC/USD |
| Provenance consultée | Coffre Seven, bougies minute agrégées en heures puis jours | Miroir GitHub tiers de l'API Bitstamp quotidienne |
| Données testées | 1 035 journées UTC | 1 035 journées UTC |
| Initialisation | 275 journées depuis 2023-04-01 | 275 journées depuis 2023-04-01 |
| Contrôles complémentaires | Empreintes ZIP et SHA du précédent replay | Git blob SHA-1 épinglé, date, continuité, unicité, OHLCV |

La **nouvelle source Bitstamp** provient du dépôt public [daniegitx1/btc-price-history](https://github.com/daniegitx1/btc-price-history), fichier `data/btc_usd_daily.csv`, Git blob `0bd9a80472f46cbf47a678e9f17d6c5a9edab7f5`. Il s'agit d'un **miroir tiers**, non d'une réponse fraîche directement attestée ni signée par l'exchange. L'empreinte protège la reproductibilité de la copie, **pas** la fiabilité fondamentale de chaque cotation.

Le témoin est la [courbe de portefeuille BTC/ETH déjà publiée sur MASTER](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv) (colonne `btc_ema`, `btc_hold`, `btc_exposed`), Git blob `c8ed2a206ea616ea87eeb83e31f7138d5b131588`, accompagnée de ses [preuves originales](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json).

**Contrôles réellement effectués :** 1 310 journées Bitstamp consécutives de 2023-04-01 à 2026-10-31 ; horodatage journalier sans jour absent ni doublon ; OHLC positifs et ordonnés, volumes non négatifs ; 1 035 journées communes pour le portefeuille ; 1 034 couples de rendements comparables ; concordance des états d'exposition jour par jour. Le code de contrôle a effectivement été appliqué aux deux CSV récupérés via GitHub.

## 3. Résultats du replay historique continu

| Politique, 2024→oct. 2026 | Binance BTC/USDT | Bitstamp BTC/USD |
|---|---:|---:|
| **EMA10/30 — rendement** | **+67,14 %** | **+65,78 %** |
| EMA10/30 — capital final fictif | 1 671,38 USDT | 1 657,82 USD |
| EMA10/30 — perte maximale | −34,21 % | −34,48 % |
| EMA10/30 — opérations fictives | 68 | 68 |
| EMA10/30 — jours BTC détenu | 486 | 487 |
| EMA10/30 — rendement coûts ×2 | +50,91 % | +49,69 % |
| Buy & Hold — rendement | +82,93 % | +82,68 % |
| Buy & Hold — perte maximale | −52,97 % | −53,08 % |

**Important :** le Buy & Hold BTC seul termine devant l'EMA sur les **deux** sources, malgré une baisse maximale beaucoup plus importante. L'EMA n'est donc pas la politique la plus rentable de ce test. Elle a réduit la baisse en échange d'occasions de hausse manquées et de nombreux allers-retours.

## 4. Concordance des marchés et point de fragilité

- **Corrélation des rendements journaliers BTC** des deux séries : **0,999883** (1 034 comparaisons).
- Différence absolue médiane entre les **variations quotidiennes**, exprimée en points de pourcentage : **0,0221 point** ; 95e percentile : **0,0828 point**.
- **Concordance de l'état exposé/cash : 1 034 / 1 035 jours, soit 99,90 %.**
- **Divergence unique : 17 juillet 2026.** Bitstamp entre en position un jour avant Binance. À la clôture Bitstamp du 16 juillet : EMA10 **63 620,6571 USD**, EMA30 **63 619,8942 USD**, écart de seulement **0,763 USD**. Un petit écart de cotation suffit donc à déplacer une décision lorsque les EMA sont presque confondues.
- Années 2024 et 2025 : aucune divergence d'exposition ; 2026 janvier–octobre : une divergence.

La corrélation très élevée est **attendue pour deux séries du même actif**, et ne doit pas être présentée comme un test sur deux marchés indépendants de risques. Le désaccord d'une journée démontre qu'il existe tout de même des **signaux marginaux sensibles à la source**.

## 5. Pourquoi ce n'est pas une validation d'investissement

1. **Même passé déjà étudié :** le lieu de cotation change, mais le régime Bitcoin sous-jacent reste largement commun aux deux séries. Un résultat robuste entre deux exchanges n'implique pas une stratégie profitable dans l'avenir.
2. **USD ≠ USDT :** le miroir Bitstamp est coté en dollars, la série Binance en USDT. Les écarts de numéraire, la prime/décote USDT et le risque d'émetteur ne sont pas normalisés. Les deux capitaux ne sont pas directement interchangeables ; seuls les indicateurs relatifs sont comparés.
3. **Exécution théorique :** ouvertures quotidiennes supposées exécutables, aucun carnet, spread réel historique, profondeur, latence, rejet, impôt, impact sur le marché ou risque de garde. Les coûts imposés restent fictifs.
4. **Données tiers et code :** les contrôles SHA vérifient les copies ; la reconstitution complète des données Bitstamp directement depuis l'API exchange n'a pas été effectuée ici. Le calcul historique a été exécuté indépendamment via un moteur JavaScript sur les deux CSV. Le programme miroir Python est publié, mais **sa réexécution intégrale dans un environnement Python séparé demeure à confirmer**.
5. **Ethereum non couvert ici :** il faut une deuxième série ETH/USD fiable et comparable avant d'étendre le verdict au portefeuille BTC/ETH 50/50. Une validation BTC seule n'autorise pas à conclure sur ETH.

## 6. Matériel reproductible, destinataire : autres IA

- [**Règles figées avant calcul**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_FIXED_PROTOCOL_2026_11_12.md)
- [**Code Python autonome, sans API privée**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_REPLAY_2026_11_12.py)
- [**Preuves JSON chiffrées, empreintes, paramètres et divergence**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_EVIDENCE_2026_11_12.json)
- [**Passation inter-IA**](./SEVEN_HEAVEN_CRYPTO_STRATEGY_RESEARCH_HANDOFF_2026_11_11.md)

**Pour reproduire :** lancer le script Python dans un environnement ayant accès à GitHub. Le programme télécharge les **blobs Git immuables** (non le `main` mouvant), refuse une empreinte inattendue, contrôle les 1 310 journées et rejoue la simulation. On peut également fournir les deux CSV localement via `--bitstamp-csv` et `--binance-csv` sans connexion. `--output` écrit un JSON local, sans publication ni opération sur un compte de trading.

**Conclusion Seven :** les règles EMA 10/30 non retouchées donnent un comportement presque identique entre les deux places pour BTC sur ces dates. C'est un contrôle de **transportabilité des signaux**, **pas** une validation hors échantillon de performance future. Le prochain contrôle scientifique utile est un replay ETH sur une seconde source fiable, puis une vérification BTC/ETH à dates strictement identiques, avant toute réflexion sur l'exploitation.
