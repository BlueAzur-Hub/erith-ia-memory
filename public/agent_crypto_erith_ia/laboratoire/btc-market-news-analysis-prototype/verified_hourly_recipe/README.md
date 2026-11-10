# Seven Heaven — Raccordement horaire BTC/USDC OKX ↔ actualités de l'Interface

**État du 10 novembre 2026** — Module de laboratoire autonome. **Aucune modification de l'interface Administrator, du Trader, du graphique ou du Bridge R31.** Aucun ordre réel.

## Fonction réelle

- Relit `../../okx-hourly-collector/evidence/index.json` et les deux captures natives `BTC-USDC`, `1H`, des **5 et 8 novembre 2026**.
- Recalcule le SHA-256 des deux fichiers et contrôle les 48 heures UTC consécutives, les OHLC, les volumes BTC/USDC, la clôture de chaque bougie et l'identité Spot OKX.
- Relit un **sous-ensemble figé d'articles réels** de l'Interface, extrait de `data/news/latest.json` (snapshot du 10 novembre à 08:52 UTC). Les six événements sélectionnés sont datés du 5 ou du 8 novembre, associés à BTC et à une rubrique de risque (flux institutionnels, macro, réglementation ou effet de levier). Leur blob Git source est enregistré.
- Transforme chaque journée en objet de marché compatible avec `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js`. **Ce code existant n'est pas modifié.** Les événements sont rapprochés par timestamp de publication et bougies clôturées, pas par affirmation d'une causalité.
- Écrit deux documents dans `output/` : un JSON exploitable par les IA et un Markdown explicatif, en restant strictement dans le laboratoire.

Le workflow `agent-crypto-seven-btc-okx-hourly-news-analysis.yml` exécute les tests, contrôle les données sources, régénère les deux fichiers, puis publie ces sorties **seulement si elles ont changé**.

## Prudence : ce que le module ne peut PAS dire

1. Une publication à 16 h 29 UTC le 5 novembre (après le pic 15 h–16 h) **ne prouve pas** ce qui a déclenché la chute.
2. Le flux de nouvelles retenu ne contient **aucune publication proche de 21 h UTC le 8 novembre**, heure de la forte baisse. Le moteur doit afficher cette lacune et non inventer une explication.
3. Les ETF et les liquidations de contrats dérivés sont **des données externes**. Le module ne les chiffre pas à partir du volume Spot, et le simple titre d'un article n'en fait pas une mesure validée.
4. La capture OKX est publique et l'identité des fichiers est prouvée par des empreintes SHA-256, mais la réponse API n'est **pas signée par OKX**.
5. Deux séries distinctes de 24 heures ne permettent pas de calculer une **EMA 34 continue** sur la période des deux jours. Le programme présente `indisponible`, pas une valeur extrapolée.
6. Une IA externe ne peut pas prétendre avoir lu les données vivantes du Trader depuis ces fichiers ; il s'agit des données archivées dans le GitHub public.

## Commandes de reproduction locale (Node.js 20 ou 22)

Depuis `public/agent_crypto_erith_ia/laboratoire/btc-market-news-analysis-prototype/` :

```bash
node --test SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_TEST.cjs SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_RUNTIME_ADAPTER_TEST.cjs verified_hourly_recipe/SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_BRIDGE_TEST.cjs
node verified_hourly_recipe/SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_BRIDGE.js --check
node verified_hourly_recipe/SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_BRIDGE.js --write
```

`--check` **n'écrit aucun fichier** ; `--write` met à jour uniquement les deux fichiers sous `verified_hourly_recipe/output/`. L'outil ne fait aucun appel réseau, ne lit aucune donnée de compte privé et n'a pas de fonction de trading.

## Sources

- Bougies originales publiées : [`okx-hourly-collector/evidence/index.json`](../../okx-hourly-collector/evidence/index.json).
- Actualités publiques de l'Interface : [`data/news/latest.json`](../../../data/news/latest.json), les événements étudiés étant recopiés sélectivement et datés dans l'archive figée.
- Contrat technique Seven : [`SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_DATA_CONTRACT_2026_11_10.md`](../../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_DATA_CONTRACT_2026_11_10.md).
- Rapports précédents : dossier historique BTC et recoupement horaire externe, disponibles dans `laboratoire/`.

**Aucune donnée personnelle, clé, profil Trader ni Bridge privée dans ce dossier.**
