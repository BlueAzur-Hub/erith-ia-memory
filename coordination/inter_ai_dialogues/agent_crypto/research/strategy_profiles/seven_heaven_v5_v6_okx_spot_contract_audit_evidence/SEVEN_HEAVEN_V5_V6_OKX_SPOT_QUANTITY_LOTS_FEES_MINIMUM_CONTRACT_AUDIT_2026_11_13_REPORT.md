# Seven Heaven — Audit du vrai code V5/V6 : frais, minSz, lotSz et petites quantités

**13 novembre 2026 · Tests exécutés sur les sources JavaScript réelles et inchangées de l'Administrator. Aucun ordre réel.**

## Résultat

**Les calculs de frais V5 et V6 passent les tests de référence, mais les deux moteurs ne sont pas conformes à un moteur d'ordre OKX : ils n'intègrent pas l'arrondi lotSz ni le contrôle minSz des quantités rendues.** Cela ne constitue pas un problème de sécurité d'exécution puisque les modules sont PAPER/read-only, mais une **limite de réalisme** qu'il faut rendre explicite.

| Mesure vérifiée sur les moteurs réels | Résultat |
|---|---:|
| Tests ciblés réussis | 22/22 |
| V5 : quantités d'entrée non alignées sur lotSz aux prix des fixtures | 8/8 |
| V6 : quantités d'achat non alignées sur lotSz aux prix des fixtures | 8/8 |
| V6 : quantités de vente non alignées sur lotSz aux prix des fixtures | 8/8 |
| V6 : quantité SELL ≠ quantité BUY pour un même budget indicatif | 8/8 |
| V6 : cas de quantité sous minSz accepté dans une fixture de stress | 2/2 |

## Contrat réel et preuves des écarts

- **V5 historique :** valide bougies, source OKX, croisements EMA, ordre temporel, coûts et capital. Il calcule `quantity = cash / (nextOpen × (1+slippage) × (1+fee))`; la vente fictive emploie `proceeds = quantity × nextOpen × (1−slippage) × (1−fee)`. Ces égalités ont été vérifiées sur huit entrées et leur aller-retour clos, pour 10/20/100/1000 USDC sur les deux instruments.
- **V6 carnet instantané :** l'achat déduit mathématiquement le coût `feePercent` du budget avant de balayer les asks, puis la vente retranche les frais des bids. Les tests vérifient que le budget total achat inclut bien ses frais, sans les doubler.
- **Quantités :** V5 et V6 produisent une `baseQuantity` calculée en flottants sans la rabattre au pas de quantité `lotSz`. Le montant obtenu serait donc susceptible d'être refusé par OKX si réutilisé tel quel dans un ordre réel. L'échantillon des cours de référence 13/11 ne montre **aucune quantité sous `minSz` avec un budget ≥ 10 USDC**, mais les calculs ne comportent **aucune validation minSz**.
- **Contre-exemple indépendant, pas un prix réel :** une fixture fictive d'ETH à 20 000 USDC ou BTC à 2 000 000 USDC avec seulement 10 USDC démontre que V6 retourne `ok: true` pour une quantité inférieure au `minSz` public. La faille est **documentaire/fonctionnelle pour l'admissibilité théorique**, pas la preuve d'un ordre réellement exécuté.
- **V6 SELL :** le champ `quoteBudget` est converti en quantité de base depuis le cours médian du carnet, et non depuis une position V5 achetée. Une estimation SELL à 10 USDC n'est donc **pas** une sortie fidèle du BTC/ETH correspondant à l'estimation BUY de 10 USDC.
- **Âge, carnet et profondeur :** les deux fichiers existants possèdent déjà des contrôles de contexte, d'horodatage et de niveau ; les tests d'origine restent nécessaires pour contrôler ces gardes séparément.

## Contraintes OKX observées et statut réel

| Instrument | minSz public | lotSz public | tickSz public |
|---|---:|---:|---:|
| BTC-USDC | 0,00001 BTC | 0,00000001 BTC | 0,1 USDC |
| ETH-USDC | 0,001 ETH | 0,000001 ETH | 0,01 USDC |

Ces valeurs proviennent du relevé public OKX du **13/11/2026 à 01:41 UTC**, sans garantie d'accès sur le compte européen, sans contrôle de notional minimum supplémentaire. Les prix du carnet ci-dessus sont des **références dans des fixtures**, pas des exécutions historiques ou une profondeur réelle.

## Décisions

1. **Classer V5 et V6 comme simulations théoriques éducatives correctes dans leurs hypothèses, non comme moteurs d'ordres admissibles.** Ne pas faire croire que `ok: true` garantit l'acceptation d'un ordre sur OKX.
2. Si l'on veut simuler précisément un ordre conforme, ajouter **dans une évolution séparée explicitement demandée** : validation publique `minSz/lotSz/tickSz`, arrondi de quantité à la baisse, calcul des frais sur la quantité arrondie, réconciliation de l'inventaire de base pour la vente, contrôle de la devise de commission et gestion des exceptions EEE/min-notional.
3. Tester séparément cet adaptateur sans modifier le V5 historique, ni rétroactivement les PnL des études déjà archivées. Ne jamais prétendre que les études Bitstamp/USD sont directement les frais OKX/USDC.

## Reproduction

- Programme autonome : `SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13.cjs` (Node.js).
- Preuves détaillées : `SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13_PROOFS.json`.
- Sources d'origine vérifiées par Git Blob SHA-1 : `069162a40c4a65651ff1cd9ac98a837d64f41e9a` (V5) et `7ae813cd1268ddd657052cc1e2ca474e8b1aed3b` (V6).
- Les tests synthétiques existants V5 et V6 sont exécutés par le workflow GitHub Actions associé ; leur PASS doit être confirmé sur le run avant de le revendiquer.

**Frontière :** aucun changement d'Administrator, d'Operator, du Trader, du Bridge, aucun ordre réel, aucun secret, aucun prix inventé présenté comme une cotation. Seuls le programme de recherche, ses preuves et le rapport sont publiés.
