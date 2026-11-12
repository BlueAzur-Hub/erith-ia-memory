# Seven Heaven — Coûts de carnet observés sur OKX Spot BTC/USDC et ETH/USDC

**Étude ponctuelle du 12 novembre 2026**, horodatages UTC autour de **15:27:25**, sur l'API publique OKX ; **aucun compte, aucune clé API, aucun ordre réel, aucune transaction**.

## Résumé

Les deux requêtes officielles `GET /api/v5/market/books?instId=...&sz=400` ont réussi. Les **400 premiers niveaux** de chaque côté étaient disponibles pour BTC/USDC et ETH/USDC ; les réponses exactes ont été archivées avec leurs SHA-256. La capture représente un **unique état fugitif** de chaque carnet, et **non des coûts historiques moyens**.

**Constat principal :** les spreads étaient très faibles à ce seul instant, mais l'écart de prix moyen augmente avec le montant, particulièrement pour l'achat d'ETH au-delà des premiers niveaux. **Le niveau de frais taker (inconnu pour le compte personnel) peut avoir un effet beaucoup plus important que le spread affiché**. Ne pas confondre « faible spread à 15:27 UTC » avec « frais et glissement négligeables dans les simulations EMA 2024–2026 ».

## 1. Protocole publié avant la collecte

[**Protocole figé**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_COST_OBSERVATION_PROTOCOL_2026_11_12.md), commit `43bfe417f438338a0981ccf3d629c71fafcda0e5`.

Montants USDC étudiés, sans modification a posteriori : **10, 100, 1 000, 10 000, 100 000**. Achat : montant fixe de USDC consommé dans les asks ; vente : montant de BTC/ETH égal à `notionnel_USDC / mid` liquidé dans les bids. Les tailles observées sont les quantités en monnaie de base, non des USDC. L'analyse est purement mathématique sur un carnet gelé : il est impossible d'en déduire un prix garanti de remplissage futur.

Spread = `(best_ask-best_bid)/mid*10 000` points de base. Coût théorique de prix à l'achat = `(VWAP_ask/mid-1)*10 000` bp ; à la vente = `(1-VWAP_bid/mid)*10 000` bp. Cela **inclut le demi-spread et la profondeur consommée**. Les deux taux de frais illustratifs, **10 bp et 35 bp par côté**, sont additionnés **une seule fois**, sans compter deux fois le spread.

## 2. Données observées et sécurité du relevé

| Paramètre | BTC/USDC | ETH/USDC |
|---|---:|---:|
| Horodatage marché UTC | 15:27:25.507 | 15:27:25.657 |
| Meilleur bid (USDC) | 71 400,00 | 2 002,99 |
| Meilleur ask (USDC) | 71 400,10 | 2 003,00 |
| Spread relatif (bp) | **0,014006** | **0,049925** |
| Demi-spread (bp) | 0,007003 | 0,024963 |
| Niveaux observés | 400 / côté | 400 / côté |
| Décalage source → réception | 55,4 ms | 55,3 ms |

Le calcul a refusé, dans les tests synthétiques, les livres croisés, les dates trop anciennes, les formats invalides et la profondeur insuffisante. Les deux livres réels ont passé ces contrôles. **La proximité de leurs timestamps ne constitue pas un instantané atomique synchronisé.**

## 3. Friction théorique de prix à différents montants

Écart en **points de base (bp) par côté**, par rapport au mid. 1 bp = 0,01 %. **Montants en USDC**, pas prix du Bitcoin.

| Montant notionnel | BTC achat | BTC vente | ETH achat | ETH vente |
|---|---:|---:|---:|---:|
| 10 USDC | 0,007 | 0,007 | 0,025 | 0,025 |
| 100 USDC | 0,007 | 0,007 | 0,025 | 0,025 |
| 1 000 USDC | 0,007 | 1,051 | 0,025 | 0,434 |
| 10 000 USDC | 0,401 | 1,938 | 2,026 | 1,425 |
| 100 000 USDC | 4,323 | 3,554 | **12,047** | 2,592 |

Les cinq montants étaient entièrement couverts par la **profondeur visible** de chacun des deux livres à cet instant. Cela n'assure pas qu'un ordre de même taille serait accepté ni rempli de la même façon (lots, tick size, limites d'ordre, latence, mouvements du carnet non testés).

**Exemple 1 000 USDC :** en BTC, l'achat théorique a traversé 1 niveau et la vente 4 ; en ETH, achat 1 niveau et vente 2. Les coûts de prix théoriques sont très inférieurs à l'hypothèse de 5 bp de glissement par côté utilisée dans notre premier stress-test EMA. Ce constat est **ponctuel**, pas une correction de nos archives 2024–2026.

**Exemple 100 000 USDC ETH :** acheter aurait utilisé **64 niveaux** et coûté **12,047 bp** de prix moyen versus mid ; vendre la quantité équivalente aurait utilisé 16 niveaux pour **2,592 bp**. Le coût est asymétrique et dépend de la profondeur de chaque côté.

## 4. Ajouter des frais : scénarios, pas frais du compte

La documentation [OKX Europe mise à jour le 3 septembre 2026](https://www.okx.com/en-eu/help/what-are-the-new-trading-fees-for-eea-users) indique des barèmes maker/taker **différents selon le profil et les conditions de compte**, avec notamment des taux taker réguliers de 0,10 % dans une configuration et 0,35 % dans une autre. Cela ne permet **pas de connaître le taux applicable à un compte donné**, ni de promettre une classification personnelle.

**Friction théorique totale d'** **un côté** = écart de prix moyen de l'ordre depuis le mid **+ frais taker hypothétiques**.

| Instrument / côté / notionnel | Prix de carnet (bp) | Avec frais 0,10 % | Avec frais 0,35 % |
|---|---:|---:|---:|
| BTC achat 1 000 USDC | 0,007 | **10,007 bp** | **35,007 bp** |
| BTC vente 1 000 USDC | 1,051 | **11,051 bp** | **36,051 bp** |
| ETH achat 1 000 USDC | 0,025 | **10,025 bp** | **35,025 bp** |
| ETH vente 1 000 USDC | 0,434 | **10,434 bp** | **35,434 bp** |
| BTC achat 100 000 USDC | 4,323 | 14,323 bp | 39,323 bp |
| ETH achat 100 000 USDC | 12,047 | **22,047 bp** | **47,047 bp** |

Nos simulations EMA précédentes fixaient **15 bp par côté** (10 bp frais + 5 bp glissement) et trouvaient une égalité EMA/Buy & Hold autour de **55,063 bp par côté** dans l'historique. Ces comparaisons ont un rôle pédagogique, **mais les marchés/cotations diffèrent (Bitstamp USD historique vs OKX USDC actuel)**, ainsi que les instants, tailles, conditions de liquidité, taxes et modèles d'exécution. **Ne pas injecter ces coûts instantanés de 2026 dans les 122 opérations historiques comme s'ils avaient été observés en 2024–2026.**

## 5. Précautions fondamentales

1. Deux **snapshots publics ponctuels**, non une distribution statistique de spreads, coûts moyens, stress de liquidité ou volatilité intrajournalière. Aucune conclusion historique/prospective de rentabilité.
2. Le **prix au mid n'est pas un prix exécutable** ; une opération de marché réelle peut aussi rencontrer annulations, prix différents, file d'attente, restrictions minSz/tickSz, expiration de données, partial fills.
3. Le **carnet de BTC/USDC et d'ETH/USDC n'est pas celui de BTC/USDT, ETH/USDT ou de Bitstamp USD**, ni celui d'un compte personnel. Aucune conversion USD/USDC à parité supposée.
4. Les **frais 0,10 % et 0,35 % sont seulement deux exemples**, la page tarifaire officielle doit être confrontée au barème exact du compte et de l'instrument avant toute évaluation individualisée.
5. Ni la liquidation fiscale ni l'exécution d'ordres ne sont simulées. Le service utilise **exclusivement la route publique `/api/v5/market/books`** et n'accède jamais à la route de trading `/api/v5/trade/order`.

## 6. Preuves et code publiés

- [**Protocole de collecte figé**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_COST_OBSERVATION_PROTOCOL_2026_11_12.md).
- [**Collecteur et calculateur Python auditable**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_ONE_SHOT_2026_11_12.py).
- [**Tests offline (5 tests) et refus des carnets invalides**](./test_seven_heaven_okx_spot_usdc_orderbook_cost.py).
- [**Résultats JSON avec timestamps, mesures et SHA-256**](./okx_spot_usdc_orderbook_2026_11_12_evidence/SEVEN_HEAVEN_OKX_SPOT_USDC_ORDERBOOK_COST_EVIDENCE.json).
- [**CSV lisible des 20 scénarios achat/vente**](./okx_spot_usdc_orderbook_2026_11_12_evidence/SEVEN_HEAVEN_OKX_SPOT_USDC_COST_BY_NOTIONAL.csv).
- [**Réponses brutes BTC-USDC et ETH-USDC**](./okx_spot_usdc_orderbook_2026_11_12_evidence/), SHA-256 BTC `1eb9877a5763622358b279649de5db8820fbdbeda35ec615da78e295c02988a2`, ETH `007cb140106f1bb4bea7f04f96f3a1334079251b590b8ae2585a3178c636331a`.
- [**GitHub Actions, exécution complète réussie**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43247779001).

**Suite méthodologique recommandée :** avant de conclure sur des coûts réalistes, recueillir des **relevés répétés dans des conditions et périodes variées**, documenter les frais réellement applicables et tester les contraintes d'ordre. À ce stade, la surveillance répétée n'est pas activée ; cette livraison est **une photographie ponctuelle correctement archivée**. Aucune opération réelle ni modification Administrator / Operator / Trader / Bridge.
