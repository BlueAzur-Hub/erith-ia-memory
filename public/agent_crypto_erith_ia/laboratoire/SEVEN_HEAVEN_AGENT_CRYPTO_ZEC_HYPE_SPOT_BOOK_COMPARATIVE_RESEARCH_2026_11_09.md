# Seven Heaven — Comparaison ZEC/USDC et HYPE/USDC sur 58 carnets rapprochés

**Analyse du 9 novembre 2026 de données historiques OKX Spot des 22–28 octobre. Aucun carnet actuel ni ordre réel.**
Complément des [dossiers ZEC](./SEVEN_HEAVEN_AGENT_CRYPTO_ZEC_SPOT_RESEARCH_2026_11_09.md) et [HYPE](./SEVEN_HEAVEN_AGENT_CRYPTO_HYPE_SPOT_RESEARCH_2026_11_09.md), et du [tableau Top 10](./SEVEN_HEAVEN_AGENT_CRYPTO_TOP10_OKX_EVIDENCE_RESEARCH_SCORECARD_2026_11_09.md). Voir le [registre JSON reproduisant les 58 couples, horaires et valeurs](../data/crypto/research/seven_heaven_zec_hype_paired_spot_book_evidence_2026_11_09.json).

> **Résultat :** HYPE affichait le spread le plus faible dans **48 observations sur 58**, tandis que ZEC présentait en médiane davantage de profondeur des cinq niveaux à l'achat et à la vente. **Un spread plus serré n'est pas synonyme de volume suffisant, ni de prix garanti.**

## 1. Méthode, horodatages et exclusion

Les fichiers du Coffre contiennent **85 carnets publics ZEC/USDC** (22–28 octobre), et **59 carnets HYPE/USDC** (24–28 octobre), chacun avec cinq niveaux cotés. Pour comparer des observations contemporaines :

- Appariement par `hour_utc` identique, puis contrôle de `source_at_utc` des **carnets**, non des tickers.
- Tolérance maximale **300 secondes** d'écart ; **59 heures appariées**, **58 retenues**.
- Un couple exclu : `2026-10-24T07Z`, **1 205 s / 20 min 05 s** d'écart.
- Sur les 58 couples : écart médian **14 secondes**, 95e percentile **102,15 secondes**, écart maximal **135 secondes**.
- Calcul indépendant : `spread_pb = (ask−bid)/[(ask+bid)/2] × 10 000` ; `profondeur_top5_USDC = somme(prix_i × quantité_i)` pour chaque côté.
- Pas de remplissage synthétique des heures absentes, pas de conversion USDC/USDT/USD et pas de prétention à une série de carnet continue.

Les intervalles entre observations sont irréguliers (médiane d'environ **1,41 h pour ZEC**, **1,42 h pour HYPE**, et maximum **5,325 h** pour les deux sur leurs ensembles archivés). La série HYPE de 59 prélèvements couvre une période plus courte que la série ZEC de 85 : **les médianes appariées ci-dessous ne sont pas les médianes globales des archives**.

### Sources originales datées et empreintes Git

| Jour UTC | Carnets ZEC | Carnets HYPE |
|---|---|---|
| 2026-10-22 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-22.json) · `275eecee85a1990ef120d736117423672f3fee68` | Non collecté |
| 2026-10-23 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-23.json) · `84cbde707131a4850f72295999dd1dbd957a2d47` | Non collecté |
| 2026-10-24 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-24.json) · `5d2f49aecbf348d202d86c9f32e8929e0c39f32c` | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-24.json) · `f383b5f3a470970f7ec34cb11f0119b19d99701d` |
| 2026-10-25 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-25.json) · `81d44bb5e6781b9915cf90b64081f154fec13eaf` | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-25.json) · `112539b5bdd05e27fe960cf1a633f0b950791d53` |
| 2026-10-26 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-26.json) · `58c02af4c1d006695c55a0559c6f04bd8942175f` | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-26.json) · `8d1db0e80a1ca89eeb979d8c6345697c591a50d2` |
| 2026-10-27 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-27.json) · `6e23dfe1a8dab5ba25e05b308408f7f940807499` | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-27.json) · `81d6caad237c9e79b85642d4a8bfcd74140f2c94` |
| 2026-10-28 | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/case-market-hourly/2026-10-28.json) · `2397f13e5c858ab533b05f395871edd971cc96b7` | [source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-28.json) · `0e20c8b76b05e9bc604da1770d77ce4bb8df4adc` |

Ces SHAs représentent **les fichiers sources archivés**, pas le SHA-256 de nouveaux fichiers téléchargés depuis OKX. Les premiers niveaux et profondeurs calculés ont été contrôlés contre les champs `spread_bps` des sources (tolérance d'arrondi), et pour ZEC contre `top5_*_quote_depth`.

## 2. Résultats mesurés sur les 58 mêmes heures

| Indicateur | ZEC/USDC | HYPE/USDC |
|---|---:|---:|
| Spread médian calculé | **4,882 pb** | **2,332 pb** |
| Spread au 25e percentile | 2,749 pb | 0,689 pb |
| Spread au 95e percentile | 8,446 pb | 8,914 pb |
| Spread maximal de cet échantillon | 9,790 pb | 12,183 pb |
| Profondeur médiane **bid**, cinq niveaux | **7831,51 USDC** | **2256,82 USDC** |
| Profondeur médiane **ask**, cinq niveaux | **7500,98 USDC** | **3818,27 USDC** |
| Observations dont le spread est plus serré | 10/58 | 48/58 |

**HYPE est plus serré 48 fois, ZEC 10 fois.** La médiane ZEC du sous-ensemble apparié (**4,882 pb**) diffère du dossier sur ses **85 relevés** (**2,92 pb**), tout comme la médiane HYPE des 58 (**2,332 pb**) diffère de celle sur **59 relevés** (**2,07 pb**). Garder les fenêtres distinctes évite de fausses contradictions.

## 3. Profondeur statique des cinq niveaux et seuil de 1 000 USDC

À titre descriptif, le seuil `profondeur cotée >= 1 000 USDC` est vérifié séparément sur les cinq meilleurs niveaux **bid** et **ask**. Ce seuil est uniquement une **quantité affichée dans un carnet ancien**, et non un ordre disponible pour un compte.

| Sur les 58 couples appariés | ZEC | HYPE |
|---|---:|---:|
| Top cinq **ask** ≥ 1 000 USDC | 54/58 | 55/58 |
| Top cinq **bid** ≥ 1 000 USDC | 55/58 | 46/58 |
| Les **deux côtés** ≥ 1 000 USDC | **52/58** | **44/58** |
| Les **deux marchés et deux côtés** sur une même paire horaire | 41/58 | 41/58 |

Un carnet peut présenter 1 000 USDC cumulés sur cinq niveaux alors que la profondeur à **son meilleur prix seulement** est faible. Cette méthode ne prouve pas le prix moyen d'un ordre, un remplissage, ni le glissement à la quantité visée. Elle sépare simplement l'épaisseur du carnet et le spread affiché.

## 4. Coûts fictifs : illustrer un ordre de grandeur, pas une exécution

Sur **1 000 USDC notionnels**, exercice hypothétique utilisant le **spread médian des 58 couples**, **frais taker supposés de 0,10 % par côté** (10 pb chacun), et éventuellement **glissement défavorable supposé de 0,20 % par côté** (20 pb chacun). Ces hypothèses ne décrivent **pas** les frais réels du compte OKX et le slippage n'a pas été calculé depuis une marche d'ordre.

**Formule approchée, linéarisée :** coût total (pb) ≈ spread médian + 2×frais supposés + 2×glissement supposé ; coût sur 1 000 USDC ≈ `coût_pb / 10`.

| Coût approximatif sur 1 000 USDC | ZEC | HYPE |
|---|---:|---:|
| Spread médian + 0,10 % de frais × 2, aucun glissement ajouté | 24,88 pb ≈ **2,49 USDC** | 22,33 pb ≈ **2,23 USDC** |
| Même hypothèse, puis +0,20 % de glissement × 2 | 64,88 pb ≈ **6,49 USDC** | 62,33 pb ≈ **6,23 USDC** |

La différence entre deux **coûts théoriques moyens calculés à partir des médianes** ne prédit pas la performance. Nous n'avons ni exécuté un ordre de 1 000 USDC, ni fait un aller-retour réel, ni vérifié le lot minimum, les frais, le prix moyen sur les cinq niveaux, la priorité ou le droit d'ordres du profil.

## 5. Fiabilité, limites et condition de qualification PAPER

**Confirmé dans les seules archives :** 12 fichiers source (7 ZEC, 5 HYPE), 144 observations brutes, 59 rapprochements horaires dont 58 proches dans le temps ; tous les carnets concernés sont Spot OKX à cinq niveaux et sans `fill` certifié. Les statistiques de spread et profondeur décrivent des **échantillons ponctuels d'octobre**.

**Non confirmé :** état courant `state`, règles `minSz/lotSz/tickSz` valides en novembre, frais personnels du compte, droits régionaux, profondeur actuelle, maintien des quantités en file, exécution ou bénéfice. Une fenêtre horaire peut manquer et les comparaisons de secondes ne constituent pas une simultanéité stricte.

**Prochaine action documentaire :** relever des carnets et règles **actuels** de ZEC-USDC et HYPE-USDC avec horodatages de l'exchange, vérifier les périodes historiques nécessaires à une simulation, puis établir un scénario PAPER entièrement journalisé **sans exécution réelle**. Tant que ces pièces manquent, **aucune certification PAPER** n'est attribuée.

**Statut : comparaison d'archives documentée et traçable ; Administrator, Trader, MASTER et Bridge R31 inchangés.**

## 6. Étude complémentaire : prix moyen d'achat par taille (9 novembre)

La [nouvelle étude de marche dans les carnets à 100, 500 et 1 000 USDC](./SEVEN_HEAVEN_AGENT_CRYPTO_ZEC_HYPE_SPOT_BOOK5_BUY_SIZE_IMPACT_STUDY_2026_11_09.md) calcule les prix moyens théoriques de **348 scénarios** à partir des cinq niveaux archivés : couverture du budget, écart au meilleur vendeur, frais fictifs et limites des carnets. Le [JSON reproductible](../data/crypto/research/seven_heaven_zec_hype_spot_book5_buy_size_impact_2026_11_09.json) contient les observations. Aucun ordre ou PAPER exécuté, aucune qualification actuelle de paire.
