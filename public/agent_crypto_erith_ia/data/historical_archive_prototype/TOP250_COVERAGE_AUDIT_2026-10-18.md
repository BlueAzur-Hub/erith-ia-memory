# Coffre — Audit croisé Top250 · 18 octobre 2026

**Nature de cette livraison :** consolidation documentaire et indexée, **pas** acquisition de nouvelles bougies. Le checkpoint `top250_coverage_reconciliation_2026-10-18.json` est un instantané reproductible des index de sources disponibles, identifié par leur empreinte *Git blob SHA*. Le snapshot du 12 octobre est conservé intact.

## Périmètre vérifié

| Mesure | Valeur | Interprétation |
|---|---:|---|
| Identités du Top250 de référence | 250 | Univers des identifiants CoinGecko de l’index fédéré 1m |
| Avec archive Spot native 1 minute | 144 | Binance ou Bitget, quote USDT, séries déclarées dans l’index |
| Avec archive Spot native 1 journée **dans ces 250 IDs** | 56 | Source 1D indépendante, quote USDT ou USDC |
| Identités présentes aux deux résolutions | 3 | **Ne pas additionner** deux fois |
| Union dans cet univers | **197** | Présence d’au moins une série dans les deux catalogues |
| Absentes **de ces deux catalogues** | **53** | Ne prouve pas absence de marché ou d’autres sources |
| Archive 1D hors de cet univers de 250 | 2 | GEOD (USDT), CASH (USDC), univers de dates différents |
| Prêtes à 12 mois consécutifs selon l’index Binance annuel **séparé** | 108 | N’est pas une certification de l’intégralité de vie de l’actif |

Les déclarations de volume d’archives portent sur **236 361 600 lignes 1m** et **52 185 bougies 1D** *référencées* par les index : ce ne sont pas des octets ZIP re-téléchargés et certifiés dans ce contrôle. Il ne faut pas additionner les résolutions ou les montants cotés différemment.

## Différences avec le checkpoint du 12 octobre

Le bilan précédent indiquait 145 actifs minute et une union de 200. Le rapprochement du 18 octobre donne 144 et 197 **dans les index courants**. Les catalogues peuvent couvrir des listes de rangs/datations différentes : il ne faut donc **ni réécrire l’ancien constat ni affirmer une perte réelle de bougies** sur la seule base du différentiel.

HYPE (Hyperliquid) est associé à **quatre mois Bitget Spot 1m** dans l’index de fédération le plus récent (172 800 lignes), contre trois mois dans l’ancien bilan. Ils ne sont pas nécessairement consécutifs ; pas de revendication de couverture annuelle.

## Travaux prioritaires identifiés

La liste exhaustive des **53 identités** qui n’apparaissent ni dans l’index minute ni dans l’index journalier du Top250 est dans `review_candidates_no_series_in_these_indexes`, avec rang et identifiant canonique.

Pour les 50 premiers rangs, cela concerne notamment :

- Rang 9 : `figure-heloc` · FIGR_HELOC
- Rang 16 : `whitebit` · WBT
- Rang 47 : `hashnote-usyc` · USYC
- Rang 49 : `blackrock-usd-institutional-digital-liquidity-fund` · BUIDL

**Ce sont des candidats à une vérification d’identité et d’instrument Spot**, et non une file d’acquisition aveugle. Certains instruments ou fonds tokenisés peuvent ne pas offrir le couple Spot vérifiable nécessaire. Ne pas utiliser un ticker de substitution, un prix indicatif ou une source différente sans preuve.

## Suite technique

1. Réconcilier l’identité et la cotation (USDT / USDC) avec la preuve d’instrument de la place Spot.
2. Pour les instruments effectivement négociés, interroger le **collecteur existant** ; contrôler les ZIP / SHA256 / dates et ne conserver que les chandelles authentiques.
3. Mettre à jour les index fédérés et refaire cet audit ; le checkpoint daté reste figé.
4. Ne charger ces archives dans les graphiques et les simulations que lorsque leur provenance et leur période sont suffisantes.

**Garde-fous :** pas de synthèse OHLCV, pas d’USD fictif à partir d’USDT, pas de trading, pas de modification Market Core/Trader, pas de modification des index sources. Le test `tests/agent_crypto_vault_coverage_checkpoint.cjs` contrôle la cohérence de ce nouvel instantané ; si un index évolue, il indique explicitement que le snapshot est devenu ancien.
