# Agent-Crypto — Dossiers de veille des hausses aperçues le 27 octobre 2026

**Seven Heaven · dossier inter-IA de capitalisation de données, pas une liste d’achats.**

## Pages HTML · navigation Firefox (28 octobre 2026)

- [Ouvrir la bibliothèque HTML des 16 dossiers](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/veille-2026-10-27/index.html) : chaque Markdown de ce répertoire possède une page HTML datée, intégrant ses constats, sources et incertitudes.
- Les pages HTML sont publiées exclusivement sous `public/agent_crypto_erith_ia/laboratoire/veille-2026-10-27/`, **pas dans `administrator/`**.
- Les études préexistantes [HYPE](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/hype-case-study.html) et [ZEC](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/zcash-case-study.html) sont préservées et reliées dans les pages de veille, sans recopie de données de carnet ni mise à jour fictive du Coffre.
- [Commit HTML 5c9344bc](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/5c9344bce579ab42a67951c52adea433643b4a3c), avec **17 fichiers HTML + 1 CSS**, et un lien ajouté à la page centrale `crypto-knowledge.html`.

## Objet et portée

Ce rapport fige **16 identités** explicitement visibles en hausse à au moins un instant dans les captures Firefox/OKX de cette conversation. Certaines ont **ensuite baissé** (SOL/OKB), et QNT montre une contradiction entre classement Market et historique EUR. Captures locales **27/10/2026**, heures approximatives. L'ordre ci-dessous relève du besoin de vérification, **pas d'une notation de rendement futur**.

**[Observations structurées transcrites](OBSERVATIONS_2026-10-27.json)** : pourcentages visibles, paire/quote lorsque lisibles, et source ; aucune bougie native inventée.

| Dossier | Priorité | Critère de recherche |
|---|---|---|
| [BTW — Bitway](BTW_DOSSIER_2026-10-27.md) | P0 | Vérifier Spot/perp et retournement violent |
| [QNT — Quant](QNT_DOSSIER_2026-10-27.md) | P0 | Incohérence de signe Market vs courbe |
| [XRP — XRP](XRP_DOSSIER_2026-10-27.md) | P2 | Qualification des variations, carnet et temps |
| [XMR — Monero](XMR_DOSSIER_2026-10-27.md) | P2 | Qualification des variations, carnet et temps |
| [UNI — Uniswap](UNI_DOSSIER_2026-10-27.md) | P2 | Qualification des variations, carnet et temps |
| [HYPE — Hyperliquid](HYPE_DOSSIER_2026-10-27.md) | P1 | Lien avec dossier canonique existant |
| [M — MemeCore](M_DOSSIER_2026-10-27.md) | P1 | Qualification des variations, carnet et temps |
| [MORPHO — Morpho](MORPHO_DOSSIER_2026-10-27.md) | P1 | Qualification des variations, carnet et temps |
| [BCH — Bitcoin Cash](BCH_DOSSIER_2026-10-27.md) | P2 | Qualification des variations, carnet et temps |
| [ZEC — Zcash](ZEC_DOSSIER_2026-10-27.md) | P1 | Lien avec dossier canonique existant |
| [DASH — Dash](DASH_DOSSIER_2026-10-27.md) | P2 | Qualification des variations, carnet et temps |
| [BTC — Bitcoin](BTC_DOSSIER_2026-10-27.md) | Référence | Qualification des variations, carnet et temps |
| [ETH — Ethereum](ETH_DOSSIER_2026-10-27.md) | Référence | Qualification des variations, carnet et temps |
| [DOGE — Dogecoin](DOGE_DOSSIER_2026-10-27.md) | Référence | Qualification des variations, carnet et temps |
| [SOL — Solana](SOL_DOSSIER_2026-10-27.md) | Référence | Qualification des variations, carnet et temps |
| [OKB — OKB](OKB_DOSSIER_2026-10-27.md) | Référence | Qualification des variations, carnet et temps |

## Trois urgences de qualification

1. **BTW : hausse extrême mais interprétation incertaine.** Captures du même jour : près de +30 % dans Market, +61 % de 24h sur la fiche Solo, environ +63 % sur OKX **X-Perp**. Les valeurs ne sont pas simultanées et ne définissent pas le même produit. L'annonce officielle OKX précise BTWUSD UM X-Perp ouvert le 22/10. Ne jamais traiter un perpétuel comme une paire Spot accessible. Source fournisseur de prix [CoinGecko BTW](https://www.coingecko.com/en/coins/bitway), [OKX X-Perp](https://www.okx.com/en-gb/help/okx-to-list-btwusd-x-perp). Un tiers [Tokenomics.com](https://app.tokenomics.com/tokenomics/bitway/unlocks) suggère un déblocage au 02/11 : **prévision non recoupée avec l’émetteur**, contradictoire avec d’autres tableaux, donc aucun fait certain sur le déblocage.
2. **QNT : signal incohérent détecté.** Market +6,85 % vs courbe EUR −3,53 % sur « Hausses 5 ». Le [correctif de garde-fous TEST](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/2c25514d1ed0) refuse de déclarer cette divergence comme une hausse validée. Les contrôles unitaires sont positifs mais tests complets Firefox/Chromium non validés. Ne pas classer QNT parmi les hausses certifiées.
3. **HYPE et ZEC : reprendre les dossiers canoniques**, pas recréer des historiques. Voir [HYPE](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/hyperliquid.json) et [ZEC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/zcash.json).

## Séparation logique du projet

- **Administrator** : code et ressources nécessaires à l'Interface, aucun dossier de veille ajouté à son arborescence.
- **Coordination partagée (ce répertoire)** : études documentaires, captures transcrites, hypothèses ouvertes, horodatage, liens de source.
- **Coffre historique** : seulement des bougies natives vérifiées et des provenances attestées. Ce lot n’ajoute aucune minute de prix, ni carnet rétrodaté, ni fichier au Coffre. Consulter [son index de couverture Top250](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage).
- **Notion maître** : index de continuité, à actualiser après publication GitHub.

## Méthode de recherche prospective — documenter les opportunités sans fabriquer du rendement

Chaque observation au temps T doit fixer **ID exact, symbole, type Spot/perp, plateforme, paire de cotation, prix bruts, timestamps UTC, carnet frais, spread/profondeur, OHLC closes, volume et coût des frais**. Le même actif doit être revu sur les fenêtres futures T+1h, +4h, +24h, +48h ; ne jamais réutiliser des prix récupérés après coup comme si l’agent avait su agir auparavant. Les signaux de scanner sont descriptifs : aucun ordre réel, aucune promesse de gain.

**Manques actuels :** pas de mesures synchronisées du carnet et des 5/15m OHLC pour toutes les paires ; échantillon de capture insuffisant pour estimer probabilité de succès, slippage ou espérance de gain nette. Identité des paires Spot non démontrée chez OKX pour la plupart des candidats. Non-adéquation USD/USDT/USDC/EUR possible.

## Poursuite à la prochaine vérification

Contrôler **BTW Spot/exécution vs perpétuel**, puis **QNT cohérence Market et période de la série**, puis volume/profondeur des actifs M/MORPHO/ZEC/HYPE. Ne pas accroître l'exposition ni déclencher de trade sur la seule force des variations passées.
