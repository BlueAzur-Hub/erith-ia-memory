# Seven Heaven — Adaptateur PAPER isolé : quantités, frais et inventaire BTC/ETH USDC

**13 novembre 2026. Développement de laboratoire, en lecture seule ; production intacte.**

## Livraison réalisée

- Module de recherche autonome Node.js : `SEVEN_HEAVEN_OKX_SPOT_PAPER_LOT_MINIMUM_INVENTORY_ADAPTER_2026_11_13.cjs`. Le module n'est chargé ni par l'Administrator ni par le Trader.
- Tests déterministes : `SEVEN_HEAVEN_OKX_SPOT_PAPER_LOT_MINIMUM_INVENTORY_ADAPTER_TESTS_2026_11_13.cjs`.
- Références des tailles : relevé officiel **public** OKX du 13 novembre 2026, **BTC-USDC** minSz 0.00001 BTC, lotSz 0.00000001 BTC, tickSz 0.1 USDC ; **ETH-USDC** minSz 0.001 ETH, lotSz 0.000001 ETH, tickSz 0.01 USDC.
- `32` tests déterministes réussis ; tous les jeux normaux 10/20/100/1000 USDC pour les deux marchés couvrent achats/sorties V5, achats/ventes V6 et réconciliation de quantité.

## Ce que corrige le laboratoire — sans changer les simulateurs existants

1. **Arrondi à la baisse `lotSz`** (BigInt à 12 décimales de précision) et test public `minSz` avant de déclarer un résultat de simulation recevable.
2. **Frais recalculés après arrondi**, achat et vente séparés, sous une hypothèse explicitement fixe de **0,10 % taker en USDC** par côté ; V5 conserve **0,05 % de glissement fixe** par côté, et V6 utilise les seuls niveaux d'un carnet synthétique sans ajouter le spread deux fois.
3. **Vente de la quantité effectivement achetée** : le simulateur V6 ne transforme plus un montant de vente indépendant en inventaire fictif. Le reliquat de liquidités après l'achat est conservé dans le bilan final.
4. **Blocage des quantités sous `minSz`**, de la profondeur insuffisante, d'un carnet périmé/d'une autre paire ; contrôle séparé de `tickSz` pour un prix d'ordre limite, sans appliquer à tort cet arrondi aux prix OHLC historiques.

## Exemples avec carnet de test synthétique (ce ne sont pas les vrais prix d'exécution)

| Marché | Budget USDC | Quantité achetée = revendue | Cash résiduel USDC | Friction aller-retour USDC |
|---|---:|---:|---:|---:|
| BTC-USDC | 10 | 0.00014089 | 0.00020774755 | -0.020015835633 |
| BTC-USDC | 20 | 0.00028178 | 0.0004124921 | -0.040037671266 |
| BTC-USDC | 100 | 0.00140892 | 0.0006309304 | -0.200215198524 |
| BTC-USDC | 1000 | 0.01408928 | 0.0006042046 | -2.002217354016 |
| ETH-USDC | 10 | 0.004972 | 0.00034765732 | -0.0200683962 |
| ETH-USDC | 20 | 0.009944 | 0.00066528464 | -0.0401967924 |
| ETH-USDC | 100 | 0.049721 | 0.00119510401 | -0.20122801035 |
| ETH-USDC | 1000 | 0.497215 | 0.00162477415 | -2.01284034525 |

## Limites encore ouvertes
- « Conformité aux contraintes **publiques connues** » ne vaut jamais acceptation d'un ordre **sur le compte européen** : un minimum en devise de cotation, des règles de paire/compte, la devise de frais et la disponibilité EEE peuvent différer.
- Tests entièrement **synthétiques** sur une profondeur à deux niveaux ancrée aux prix du relevé du 13 novembre, non une exécution réelle ni une mesure de performance.
- Ne pas substituer automatiquement les nouveaux calculs aux PnL historiques V5/V6 : le laboratoire est **séparé**, et les historiques déjà publiés gardent leurs hypothèses.
- Aucune permission d'ordre, aucun changement de Bridge, Administrator, Operator, Trader ; scripts de recherche uniquement dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`.

**Verdict :** l'adaptateur est prêt pour les comparaisons PAPER de laboratoire **après validation CI**, pas pour le déploiement, encore moins pour l'exécution réelle.
