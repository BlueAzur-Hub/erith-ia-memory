# KAT — Katana Network
## Dossier de recherche · Seven Heaven · 24 octobre 2026

**Dossier documentaire et laboratoire PAPER — aucun ordre réel.** Katana est un réseau Ethereum Layer 2 consacré à la finance décentralisée, tandis que **KAT** est son jeton. Ne pas confondre ce projet avec *Kamino Finance (KMNO)*, protocole distinct sur Solana. Les chiffres de marché ci-dessous sont datés, non des cotations garanties au moment de leur lecture.

## 1. Synthèse

**Pourquoi étudier KAT ?** Katana teste un modèle où la liquidité des applications DeFi, les frais des activités et les incitations financières sont coordonnés à l’échelle d’un même réseau plutôt que dispersés. Le jeton KAT donne accès, sous conditions de staking, à une participation à l’orientation des incitations vers les pools et à des récompenses variables. La simple détention de KAT ne confère pas automatiquement ces droits ni un dividende. L’essentiel du risque réside dans la dépendance à l’activité économique réelle, au cours du jeton, aux débloquages futurs et aux stratégies de rendement. [S1] [S2] [S3]

**Décision de recherche :** intégrer KAT à la veille exploratoire documentaire, sans modifier les 20 actifs de l’expérience historique Radar 20. Comparer ensuite en PAPER des scénarios de momentum, de retour à la moyenne et d’absence d’opération, avec données historiques natives OKX et frais clairement hypothétiques.

## 2. Carte d’identité

| Champ | Information vérifiée |
|---|---|
| Nom | Katana Network |
| Symbole | KAT |
| Nature | Jeton ERC-20 natif sur le réseau Katana, Layer 2 Ethereum orienté DeFi |
| Offre totale | 10 000 000 000 KAT fixes, émis initialement |
| Transférable depuis | 18 mars 2026 |
| Contrat KAT, réseau Katana | `0x7f1f4b4b29f5058fa32cc7a97141b8d7e5abdc2d` |
| Décimales | 18 |
| Réseau | Katana, chain ID 747474 |
| Spot OKX | KAT/USDT annoncé pour le 18 mars 2026 ; KAT/USDC observé dans le flux et l’archive natifs ERITH.IA |
| Documentation | https://docs.katana.network/ |
| Présentation | https://katana.network/ |

**Attention à l'identité :** l'adresse de contrat ci-dessus est la référence publiée par la documentation du réseau Katana. Vérifier séparément les réseaux de dépôt/retrait proposés par chaque plateforme ; ne pas supposer qu'une paire Spot entraîne automatiquement l'accès au même réseau de transfert. L'annonce OKX dit explicitement que la disponibilité peut dépendre de la région et du compte. [S2] [S4] [S5]

## 3. Ce que Katana cherche à améliorer

Une blockchain DeFi peut accueillir plusieurs applications concurrentes qui fragmentent la liquidité. Katana essaie de concentrer les marchés autour de quelques activités majeures : échange de tokens, prêts/emprunts, coffres de rendement et produits dérivés. Quatre mécanismes méritent un examen :
- **Vault Bridge** : les actifs transférés sur Katana peuvent rester productifs par des stratégies sur Ethereum pendant que leur représentation circule sur Katana. Cela crée des rendements potentiels mais ajoute des risques de bridge, de stratégie et de gestionnaire.
- **Chain-Owned Liquidity (CoL)** : une part des revenus nets du séquenceur est destinée à acquérir/déployer une liquidité contrôlée par le réseau, au lieu de ne rémunérer que des fournisseurs temporaires.
- **Revenus et incitations** : des activités comme le trading, les coffres et les stablecoins contribuent à un ensemble de revenus réorientés vers l’écosystème.
- **Interopérabilité** : Katana utilise Agglayer et une architecture de preuves à divulgation nulle de connaissance, avec des dépendances techniques à évaluer.

Ces mécanismes sont décrits par l'éditeur ; ils ne garantissent ni les taux d'APR affichés, ni la réussite économique, ni une hausse de KAT. [S1] [S6] [S7]

## 4. KAT, vKAT et avKAT : trois formes, trois usages

| Forme | Utilité principale | Point de vigilance |
|---|---|---|
| KAT | Jeton transférable, négociable et pouvant être staké | À lui seul, **aucun droit de vote** dans le mécanisme d'émissions |
| vKAT | Position de KAT verrouillée, représentée par un NFT non transférable, avec droit de vote sur les allocations d’incitations | Durée d’immobilisation, règles et frais de sortie |
| avKAT | Coffre gérant le vote et la capitalisation de récompenses de manière déléguée | Risque supplémentaire du coffre, stratégie, frais, liquidité et valeur relative |

Il faut distinguer les récompenses liées à une activité/staking des bénéfices d'une détention passive. Un APR promotionnel ou instantané de avKAT n'est pas un rendement assuré. [S2] [S3] [S8]

## 5. Répartition et calendrier des dix milliards de KAT

| Allocation officielle | Part | Quantité |
|---|---:|---:|
| Écosystème et trésorerie communautaire | 48,35 % | 4,835 Md |
| Contributeurs principaux | 15,65 % | 1,565 Md |
| Communauté de stakers POL (vKAT) | 15 % | 1,500 Md |
| Récompenses de liquidité des applications | 10 % | 1,000 Md |
| Utilisateurs particuliers et institutionnels | 10 % | 1,000 Md |
| Vente publique | 1 % | 100 M |
| **Total** | **100 %** | **10 Md** |

L'équipe indique **aucune allocation à des investisseurs de capital-risque** ; cela ne veut pas dire « aucune allocation à des contributeurs ». La documentation précise une libération sur les première, deuxième, troisième et quatrième dates anniversaires de la transférabilité pour certaines catégories (notamment les contributeurs et le reliquat de trésorerie communautaire). Les incitations des applications sont distribuées progressivement par les projets concernés. **Il ne faut pas confondre totalité créée, quantité débloquée et quantité réellement circulante.** [S9]

**Risque dilution :** environ 3,36 Md KAT circulants dans l'instantané DefiLlama du 24 octobre 2026, soit près d'un tiers des 10 Md théoriques. La valeur totalement diluée peut donc être significativement supérieure à la capitalisation circulante. L'évolution du nombre de jetons sur le marché doit être relevée lors de chaque bilan. [S10]

## 6. Photographie des données publiques — 23 et 24 octobre 2026

| Indicateur | Observation datée | Ce que cela signifie |
|---|---:|---|
| KAT/USDC, capture OKX utilisateur du 24 octobre vers 06 h 14 | ≈ 0,00459 USDC | Dernier cours de la paire, pas un prix d’achat/vente garanti |
| Variation 24 h dans la même capture | +15,38 % | Variation glissante à cet instant ; pas un rendement réalisable après détection |
| Prix KAT agrégé DefiLlama, instantané du 24 octobre | ≈ 0,0041 USD | Autre source, autre moment et autre unité ; comparaison indicative seulement |
| Capitalisation du jeton DefiLlama | ≈ 13,7 M USD | Valorisation circulante, pas trésorerie |
| Valorisation entièrement diluée DefiLlama | ≈ 41 M USD | Valorisation hypothétique des 10 Md au prix considéré |
| Offre circulante DefiLlama | ≈ 3,36 Md KAT | Différente de l’offre totale |
| TVL DeFi du réseau Katana | ≈ 37 M USD | Dépôts DeFi estimés ; ne pas confondre avec la capitalisation du jeton |
| Volume DEX sur Katana, instantané DefiLlama du 23 octobre | ≈ 0,20–0,24 M USD / 24 h | Trading sur les DEX du réseau, pas volume Spot KAT/USDC |
| Volume de perpétuels sur Katana, même période | ≈ 39–48 M USD / 24 h | Dérivés ; pas une mesure de liquidité du Spot KAT |
| Frais des applications sur Katana, même période | ≈ 15 000 USD / 24 h | Frais de l’ensemble des applications ; pas revenu versé automatiquement aux détenteurs KAT |
| Comptes actifs, données chaîne | ≈ 703 adresses sur 24 h | Métrique d’activité de réseau ; ni utilisateurs uniques vérifiés ni acheteurs KAT |

**Les chiffres de DefiLlama proviennent de snapshots à horaires différents ; ils ne sont ni un carnet d’ordres ni une preuve de volume négociable pour une taille donnée.** Ne jamais additionner TVL, volume de dérivés et capitalisation. [S10] [S11]

## 7. Données ERITH.IA effectivement acquises

Manifestation GitHub publique du 24 octobre 2026 : 51 paires Spot USDC archivées, zéro échec déclaré. **KAT-USDC** possède :
- 1 499 bougies closes **15 minutes** ;
- 2 699 bougies closes **1 heure** ;
- 166 bougies closes **1 jour UTC**, du **11 mai au 23 octobre 2026** inclus.

Cela suffit à documenter des mouvements sur plusieurs mois, sans représenter encore 365 jours de données. Le fait de disposer de 166 bougies journalières ne démontre pas que les carnets historiques ou les ordres fictifs auraient été exécutables à leur cours de clôture.

**État Radar :** KAT ne figure pas dans les vingt cryptos de l’expérience prospective fixe ni dans la cohorte exploratoire du 20 octobre. Le dossier constitue une proposition motivée de surveillance indépendante, **pas une injection silencieuse dans un protocole gelé**. [S12]

## 8. Forces, faiblesses et risques

**Points forts à documenter :** modèle économique décrit précisément par le projet ; possibilité d'observer TVL et activité des applications ; contrats et audits publics ; distinction explicite entre KAT négociable et formes de staking ; archives OKX natives disponibles pour des simulations reproductibles. [S1] [S8] [S13]

**Risques opérationnels :** erreurs de code, exploitation des smart contracts, dépendance aux séquenceurs et bridges, problème de garanties, oracle ou liquidation dans les applications, confiance dans les curateurs du Vault Bridge, congestion Ethereum/interopérabilité, stablecoin perdant son ancrage.

**Risques de gouvernance :** les changements passent, selon la documentation, par un administrateur multisignature 3/5, un délai de 10 jours et un conseil de sécurité disposant d'un droit de veto à 10/13. Cela encadre certaines décisions sans éliminer la centralisation pratique ni les scénarios d'urgence. [S14]

**Risques de marché :** ventes après distributions, spéculation sur les APR, retrait de liquidité, dépendance à l'activité DeFi, baisse de TVL, divergences entre marchés USDT/USDC/USD, faiblesse potentielle de la profondeur sur la paire observée, volatilité et écarts d'exécution.

**Question essentielle :** l'augmentation de l'usage économique du réseau se traduit-elle effectivement par une demande soutenue de KAT ou par des récompenses nettes en hausse pour les stakers, une fois dilution et frais pris en compte ? Ce lien doit être **mesuré**, pas supposé.

## 9. Comparaison KMNO / KAT

| Angle | KMNO / Kamino | KAT / Katana |
|---|---|---|
| Écosystème | Solana | Réseau Ethereum Layer 2 dédié DeFi |
| Activité | Prêts, emprunts, gestion de liquidité | Échanges, prêts, dérivés, liquidité et rendement à l'échelle du réseau |
| Détention simple | Pas de partage automatique de revenus établi dans notre étude | Pas de vote sur les allocations d’émissions sans staking |
| Staking/gouvernance | Staking et gouvernance effective à qualifier | vKAT/avKAT et vote d'incitations documentés |
| Risques communs | Smart contracts, qualité du collatéral, émissions, liquidité | Idem, avec bridges et séquenceur supplémentaires |
| Intérêt PAPER | Déblocage attendu le 30 octobre et trajectoire prix/TVL | Sensibilité à la TVL, au staking, aux incitations et aux déblocages annuels |

Ce n'est pas une comparaison de « meilleure crypto à acheter » : les deux activités, niveaux de maturité et prix ne sont pas des grandeurs directement interchangeables.

## 10. Programme de recherche prospective PAPER

1. **Archivage** : bougies closes KAT-USDC, snapshots de spread, meilleures offres, profondeur à tailles comparables et horodatages ; journaliser les données absentes au lieu de les synthétiser.
2. **Signal historique sans regard vers l’avenir** : tester le momentum et le retour à la moyenne sur les séquences déjà archivées, mais distinguer cette étude rétrospective d'une expérience prospective réellement observée.
3. **Comparatifs** : mêmes dates et coûts que les variantes KMNO, témoin ETH et témoin « ne pas agir », selon des horizons de 24 h, 48 h et 7 jours.
4. **Montants fictifs variables** : explorer plusieurs tickets indépendamment du petit solde réel du compte OKX. Un montant fictif ne devient « exécutable » que si la profondeur et les minima sont observés.
5. **Qualité de résultat** : nombre d'occasions, taux de données suffisantes, frais, slippage estimé, pertes maximales, gains nets théoriques, sorties possibles et délais.
6. **Exigence** : un simple écart entre deux cours historiques sans carnet n'est pas une preuve de profit exécutable ; ne pas retoucher le protocole Radar 20 historique.

**Verdict Seven Heaven : KAT mérite un dossier complet et une veille exploratoire, mais aucun label de rentabilité ou d'achat.** Prochaine épreuve : lier l’archive aux graphiques existants, puis faire fonctionner l'analyse PAPER de façon reproductible.

## 11. Sources directes et vérifiables

[S1] Katana Network — présentation : https://katana.network/  
[S2] Katana documentation — KAT : https://docs.katana.network/katana/core-concepts/what-is-kat/  
[S3] Katana — KAT, vKAT, avKAT : https://docs.katana.network/katana/how-to/kat-token-overview/  
[S4] OKX Europe — listing KAT/USDT : https://www.okx.com/fr-fr/help/okx-to-list-kat-katana-for-spot-trading-and-convert-pre-market-futures-to  
[S5] Katana — aperçu technique : https://docs.katana.network/katana/core-concepts/what-is-katana/  
[S6] Katana — Vault Bridge : https://docs.katana.network/katana/core-concepts/vault-bridge/  
[S7] Katana — rendement et revenus : https://docs.katana.network/katana/core-concepts/sustainability/  
[S8] Katana — participation et verrouillage KAT : https://docs.katana.network/katana/katana-staking/  
[S9] Katana — distribution et vesting officiels : https://docs.katana.network/katana/core-concepts/what-is-kat/tokenomics/  
[S10] DefiLlama — jeton KAT : https://defillama.com/token/KAT  
[S11] DefiLlama — réseau Katana : https://defillama.com/chain/katana  
[S12] ERITH.IA — manifeste des bougies OKX : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/spot-candles/coverage.json  
[S13] Katana — audits et sécurité : https://docs.katana.network/katana/additional-resources/security-overview/  
[S14] Katana — modèle d'administration / timelocks : https://docs.katana.network/katana/core-concepts/safety-and-sustainability/

**Date du dossier : 24 octobre 2026. Lecture seule. Aucun ordre réel, aucune modification de solde, aucun accès au compte personnel OKX.**
