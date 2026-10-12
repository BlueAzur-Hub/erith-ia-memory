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
- **Relecture binaire et re-hachage des séries : NON EFFECTUÉS.**
- **Disponibilité/volume/spread des paires autorisées OKX EEE pour le compte : NON VÉRIFIÉS.**
- **Backtest des signaux sur bougies brutes : NON EXÉCUTÉ.**
- **Résultats financiers réels ou simulés : AUCUN RÉSULTAT À ANNONCER.**

Prochaine action utile : contrôles des instruments autorisés du compte OKX Europe **en lecture seule**, puis exécution reproductible d'un backtest figé sur les archives de juillet à septembre 2026. Ne pas créer un radar visuel ou un moteur parallèle avant ces preuves.
