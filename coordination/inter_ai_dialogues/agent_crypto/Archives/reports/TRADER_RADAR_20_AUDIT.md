# ERITH.IA — Radar 20 : contrôle des données et qualification du test

**Date du constat : 2026-10-12.** Audit documentaire en lecture seule. Aucune recommandation d'achat, aucun ordre, aucune mesure de rentabilité réalisée.

## Résultat vérifié depuis les index du Coffre

**20 actifs sur 20** sont associés, dans les index publics, à des archives mensuelles de bougies **originales Binance Spot 1 minute / USDT**, avec couverture du bloc continu **juillet → septembre 2026**. Les index indiquent également au moins **42 mois consécutifs** jusqu'en septembre 2026 pour tous ces actifs. La présence des archives est prouvée par les catalogues ; **les octets de chaque archive compressée ne sont pas retéléchargés/recalculés par cet audit**, et la période du 1er au 12 octobre 2026 n'est pas couverte par ces archives mensuelles.

| Groupe | Symbole | Identité CoinGecko | Mois natifs indexés | Trois mois complets |
|---|---|---|---:|---|
| A | ETH | `ethereum` | 62 | Juil./Août/Sept. 2026 : oui |
| A | SOL | `solana` | 60 | Juil./Août/Sept. 2026 : oui |
| A | XRP | `ripple` | 62 | Juil./Août/Sept. 2026 : oui |
| A | ADA | `cardano` | 62 | Juil./Août/Sept. 2026 : oui |
| A | LINK | `chainlink` | 62 | Juil./Août/Sept. 2026 : oui |
| B | AVAX | `avalanche-2` | 62 | Juil./Août/Sept. 2026 : oui |
| B | SUI | `sui` | 40 | Juil./Août/Sept. 2026 : oui |
| B | NEAR | `near` | 62 | Juil./Août/Sept. 2026 : oui |
| B | UNI | `uniswap` | 62 | Juil./Août/Sept. 2026 : oui |
| B | AAVE | `aave` | 62 | Juil./Août/Sept. 2026 : oui |
| C | LTC | `litecoin` | 62 | Juil./Août/Sept. 2026 : oui |
| C | BCH | `bitcoin-cash` | 62 | Juil./Août/Sept. 2026 : oui |
| C | DOT | `polkadot` | 62 | Juil./Août/Sept. 2026 : oui |
| C | HBAR | `hedera-hashgraph` | 62 | Juil./Août/Sept. 2026 : oui |
| C | XLM | `stellar` | 62 | Juil./Août/Sept. 2026 : oui |
| D | DOGE | `dogecoin` | 62 | Juil./Août/Sept. 2026 : oui |
| D | PEPE | `pepe` | 40 | Juil./Août/Sept. 2026 : oui |
| D | SHIB | `shiba-inu` | 60 | Juil./Août/Sept. 2026 : oui |
| D | APT | `aptos` | 45 | Juil./Août/Sept. 2026 : oui |
| D | ARB | `arbitrum` | 42 | Juil./Août/Sept. 2026 : oui |

Les identités proviennent des catalogues officiels du projet ; le symbole seul ne doit jamais servir à réassigner un jeton.

### Sources canoniques contrôlées sur main

- [Year Depth — contrôles de continuité des mois](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json) — Git blob `7bd4adc6c9c79b555c91c60a46c1df4965b267ae`.
- [Index multisource minute](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) — Git blob `5446dc85c93660ce80a85db7fe2b32093fb2d8ff`.
- [Réconciliation Top 250](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_coverage_reconciliation.json) — Git blob `a663d29a07d93b27b4e1454eec2481b826532093`.
- La réconciliation déclare **200/250 actifs** avec au moins une source ; ce n'est pas un certificat d'historique complet de la création à aujourd'hui.

## Avertissement majeur — marché exécutable OKX Europe ≠ source Binance

L'accès européen à **USDT comme instrument de trading est restreint sur OKX Europe**. Ne jamais désigner `ETHUSDT` Binance comme si l'utilisateur pouvait exécuter un ordre `ETH-USDT` sur son compte EEE. Les archives de Binance sont utiles pour **étudier des rendements historiques USDT**, et **ne certifient ni les volumes, ni les spreads, ni les cours ni les paires négociables chez OKX**.

Sources officielles (consultées le 12 octobre 2026) :

- [OKX Europe : pourquoi USDT n'est pas négociable](https://www.okx.com/en-eu/learn/usdt-not-tradeable-okx-europe-stablecoin-guide) (juin 2026).
- [OKX Europe : carnet unifié USD et règlement en USDC](https://www.okx.com/en-eu/help/how-do-i-trade-a-usd-pair-using-usdc-or-another-stablecoin) (septembre 2026).
- [OKX Europe : annonce de paires USD/EUR](https://www.okx.com/en-us/help/okx-to-support-60-tokens-on-unified-usd-and-eur-spot-trading-pairs-in-eea) (février 2026) : comprend HBAR/USD, SHIB/USD, AAVE/USD, ARB/USD, BCH/EUR, PEPE/EUR, NEAR/USD et NEAR/EUR. **Annonce historique et non statut actuel certifié par compte.**
- [OKX API : GET /api/v5/account/instruments?instType=SPOT](https://www.okx.com/docs-v5/en/) : inventaire privé pertinent, **permission READ** ; vérifier aussi la règle de règlement de chaque instrument.

**État de la vérification account-specific EEA : NON EFFECTUÉE.** Cet audit n'a aucun accès à l'API OKX privée du poste utilisateur ni aux derniers instruments Spot de son compte. Les liens Web de négociation en apparence publics ne garantissent pas les droits de ce compte. Toutes les paires OKX des vingt candidats restent **à vérifier** avant toute simulation qualifiée « exécutable OKX ».

## Méthode du premier test — à exécuter ensuite

1. **Univers bloqué :** ces vingt identités, pas de remplacement a posteriori suivant la performance.
2. **Fenêtre historique :** 1er juillet 00:00 UTC → 1er octobre 00:00 UTC, archives mensuelles de juillet, août et septembre. L'expérience teste donc **92 jours calendaires complets**, non « 90 jours en direct jusqu'au 12 octobre ».
3. **Développement :** juillet-août 2026. **Évaluation laissée intacte :** septembre 2026. N'optimiser aucun paramètre avec septembre avant de le tester.
4. **Hypothèse unique initiale, provisoire :** détecter à la clôture d'une période de 4h une hausse de prix accompagnée d'un volume relatif élevé par rapport aux 20 périodes *précédentes*, entrer au plus tôt à la bougie suivante ; comparer à une conservation passive et à une référence sans signal. Les seuils doivent être fixés à l'avance.
5. **Frais :** scénario explicite acheteur/vendeur + spread + glissement de cours. À défaut de prix OKX historiques prouvés, simuler plusieurs niveaux de coûts et qualifier le résultat « **indicatif Binance — non certifié OKX** ».
6. **Barème temporel :** les frais OKX Europe pour les comptes Spot standards changent le **25 septembre 2026** ([annonce](https://www.okx.com/en-eu/help/important-notice-upcoming-spot-fee-adjustment-eea)). Ne pas répliquer un taux unique de fin septembre à tout juillet.
7. **Sorties obligatoires :** opérations datées et traçables, capital fictif, frais estimés par opération, gains/pertes nets, taux de réussite, drawdown, stratégie de comparaison, limites et résultats distincts juillet-août / septembre.
8. **Barrières :** zéro ordre réel, zéro clé dans GitHub, aucune modification Trader/Graphique/Market Core/Coffre, aucun « PASS » de rentabilité si archives ou carnets de marché ne sont pas contrôlables.

## Statut

- **Sélection et couverture indexée de juillet-septembre : PASS DOCUMENTAIRE 20/20.**
- **Contrôle des 20 projections compressées de septembre : GZIP CRC32 ET 720 BOUGIES HORAIRES CONTIGUËS PAR ACTIF VÉRIFIÉS.** Les ZIP source d'origine ne sont pas indépendamment re-téléchargés ni re-hachés.
- **Disponibilité/volume/spread des paires autorisées OKX EEE pour le compte : NON VÉRIFIÉS.**
- **Pilotage sur septembre (agrégats horaires authentiques) : EXÉCUTÉ — SIMULATION INDICATIVE ; TEST 92 JOURS ET CONDITIONS OKX NON EFFECTUÉS.**
- **Résultat de première simulation : +115,77 USDT fictifs cumulés sur 69 opérations indépendantes de 100 USDT ; NOTIONNEL TOTAL RECYCLÉ 6 900 USDT, NON RENDEMENT D'UN PORTEFEUILLE.**

Prochaine action utile : contrôles des instruments autorisés du compte OKX Europe **en lecture seule**, puis exécution reproductible d'un backtest figé sur les archives de juillet à septembre 2026. Ne pas créer un radar visuel ou un moteur parallèle avant ces preuves.

## Premier test chiffré réalisé — SEPTEMBRE 2026, 20 actifs, 720 bougies horaires chacun

**Statut : PILOTE INDICATIF NON CERTIFIÉ OKX.** Données reprises directement dans les 20 fichiers GitHub `shared_monthly_views/<coin_id>.json.gz` (projections Binance Spot 1h de septembre 2026). Chaque archive a été décodée à partir des octets GitHub, contrôlée par **CRC32 GZIP**, puis vérifiée pour : identité CoinGecko, paire/quote USDT, mois septembre, **720 bougies horaires contiguës**, cohérence OHLCV et volumes numériques.

**Règle figée avant les deux lots de résultats :**
- Construire des périodes UTC consécutives de 4h à partir des bougies horaires.
- À la clôture d'une période 4h : hausse du cours de clôture d'au moins **3 %** par rapport à la période précédente **ET** volume coté USDT au moins **2 fois** la moyenne des **20 périodes 4h précédentes** ; la moyenne exclut la période du signal.
- **Acheter fictivement à l'ouverture des quatre heures suivantes**, puis **revendre fictivement 24h plus tard** (à la clôture de la sixième bougie de 4h après le signal). Pas de positions simultanées sur la même crypto dans le simulateur ; nouveau signal possible ensuite.
- **100 USDT fictifs par opération, indépendamment des autres.** Frais supposés 0,20 % à l'achat + 0,20 % à la vente ; glissement défavorable supposé 0,15 % chaque sens. Coûts estimés ≈ 0,70 % aller-retour, non historiques certifiés OKX EEE.
- Aucun capital de portefeuille partagé, aucun effet de levier, aucune prédiction IA, aucun carnet OKX passé reconstitué. Les changements de frais OKX du 25 septembre ne sont pas calibrés ici ; cette hypothèse uniforme est **provisoire**.

| Groupe | Actif | Opérations | Gagnantes | Résultat fictif (100 USDT/op.) | Achat & conservation du mois (autre méthode) |
|---|---|---:|---:|---:|---:|
| A | ETH | 2 | 1 | −0,15 USDT | +8,09 % |
| A | SOL | 3 | 0 | −0,83 USDT | +13,81 % |
| A | XRP | 4 | 2 | −7,57 USDT | +7,23 % |
| A | ADA | 3 | 2 | +0,39 USDT | +23,80 % |
| A | LINK | 4 | 1 | −5,68 USDT | +25,97 % |
| B | AVAX | 5 | 3 | +11,23 USDT | +50,16 % |
| B | SUI | 3 | 2 | +14,19 USDT | +59,06 % |
| B | NEAR | 8 | 4 | +33,61 USDT | +176,09 % |
| B | UNI | 4 | 2 | +23,94 USDT | +68,58 % |
| B | AAVE | 3 | 1 | −2,08 USDT | +27,59 % |
| C | LTC | 2 | 1 | +4,96 USDT | +37,55 % |
| C | BCH | 4 | 3 | +10,24 USDT | +23,05 % |
| C | DOT | 6 | 4 | +4,97 USDT | +44,58 % |
| C | HBAR | 2 | 2 | +6,36 USDT | +41,29 % |
| C | XLM | 3 | 2 | +1,69 USDT | +26,75 % |
| D | DOGE | 2 | 1 | +2,11 USDT | +13,34 % |
| D | PEPE | 4 | 3 | +15,32 USDT | +19,39 % |
| D | SHIB | 2 | 1 | +0,24 USDT | +12,82 % |
| D | APT | 1 | 1 | +12,48 USDT | +42,78 % |
| D | ARB | 4 | 2 | −9,67 USDT | +84,17 % |

**Totaux : 20/20 fichiers valides ; 14 400 bougies horaires testées ; 69 opérations indépendantes (38 gagnantes, 31 perdantes). Résultat net fictif agrégé = +115,7696 USDT pour 69 engagements nominaux distincts de 100 USDT, soit +1,68 % en moyenne par opération.** Ces montants représentent l'addition de gains/pertes indépendants, **pas la performance d'un portefeuille de 100, 1 000 ou 6 900 USDT**.

**Lecture des risques :** parmi les échecs, XRP a produit une opération à environ **−12,09 %**, DOT environ **−10,45 %**, ARB environ **−14,02 %**, après coûts supposés. Une hausse de prix/volume ne garantit ni continuité ni profit.

**Comparateur descriptif** : l'achat et la conservation sur la totalité de septembre (mêmes hypothèses de coûts de marché au début et à la fin) a montré une hausse dans les 20 actifs, **moyenne non pondérée environ +40,30 %**. Ce comparateur reste **non directement comparable** au modèle d'opérations indépendantes : durées d'exposition, capital engagé et risque sont différents. Le marché haussier du mois rend le pilote particulièrement peu probant pour d'autres régimes.

### Ce qui reste INCONNU / NON DÉMONTRÉ

- Performance hors de septembre (juillet-août, période de marché baissier, mouvements rares, tests répétés).
- Courbes de capital, contraintes d'exposition multi-actifs, drawdown de portefeuille, corrélation des signaux simultanés.
- Cours acheteur/vendeur et frais exacts **sur OKX Europe** pour chacune des 20 paires ; instruments autorisés du **compte utilisateur**, taille minimum, devises de règlement.
- Slippage réel et liquidité aux instants de décision ; spread de Binance/USDT **non équivalent** à OKX/EUR, USD unifié ou USDC.
- Test 92 jours complet du 1er juillet au 30 septembre, comparaison équitable achat/conservation, périodes tenues à l'écart et résistance des résultats aux variations de paramètres.

**Conclusion de travail :** le pipeline technique de lecture des données et de replay sur septembre est confirmé. **Aucune rentabilité fiable/OKX n'est certifiée**. Ne pas ajuster les seuils sur septembre après avoir vu ce test ; réserver les données futures et les autres régimes à une validation indépendante.
