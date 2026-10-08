# R2 · True OHLCV Spot Top 10 — pilot

Le pilote collecte des **chandelles OHLCV réelles sur Binance Spot**, sans trading ni clés privées. Les dix actifs sont ceux du manifeste de référence `2026-10-07` ; seuls sept possèdent une paire USDT explicite à vérifier (`BTC, ETH, BNB, XRP, SOL, TRX, ZEC`). `USDT`, `USDC` et `FIGR_HELOC` restent **non qualifiés**. Aucune paire n'est inventée.

- 24 h : 5 minutes × 288 chandelles clôturées.
- 7 jours : 1 heure × 168 chandelles clôturées.
- 30 jours : 4 heures × 180 chandelles clôturées.

Champs conservés : `open_time_ms, open, high, low, close, base_volume, quote_volume, trade_count`. Granularité et marché sont contractuels : **USDT n'est pas USD**, et ce n'est ni CoinGecko ni OKX USDC. Les timestamps sont UTC. Toute lacune ou anomalie d'OHLCV entraîne le rejet de la période. Si moins de cinq actifs sont complets, le pilote échoue sans publier de faux historiques.

**Chaîne :** `tools/collect_historical_top10_ohlcv.py` → validation locale des chandelles → archive `ohlcv_top10_YYYY-MM-DD.json.gz` + `manifest.json` → GitHub Actions (déclenchement initial sur push du script, puis manuel seulement). Il n'y a pas d'automatisation quotidienne pour le moment. Une nouvelle exécution le même jour peut remplacer son fichier quotidien : conservation cumulative par date à faire après la validation terrain.

Le prototype R1 (`top10/2026-10-01_2026-10-07`) reste inchangé : il contient des **observations Market irrégulières**, pas des chandelles. Aucune consommation du pilote par l'Interface, le Trader ou Math Core n'est autorisée avant validation.

Données historiques publiques uniquement. Quotas, droits de réutilisation et volumétrie restent à vérifier avant toute extension 50/100/250 et avant toute collecte récurrente.
