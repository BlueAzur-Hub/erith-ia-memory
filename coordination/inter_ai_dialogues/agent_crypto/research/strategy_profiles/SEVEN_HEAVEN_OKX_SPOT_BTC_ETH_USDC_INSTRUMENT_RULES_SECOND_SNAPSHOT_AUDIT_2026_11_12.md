# Seven Heaven — OKX BTC/USDC et ETH/USDC : limites d'ordre, précision et deuxième carnet

**12 novembre 2026 — Étude publique ponctuelle, read-only, PAPER, aucune transaction.**
Les sources, calculs et essais sont publiés dans le répertoire inter-IA. Exécution de référence [GitHub Actions #2 : SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43249814282), **six tests hors ligne réussis**. Un premier essai avait échoué uniquement parce que l'autotest attendait la chaîne `0.0050` au lieu de `0.005` : **mêmes nombres**, correction de l'assertion textuelle sans changer les règles ni les calculs.

## 1. Pourquoi cette étude ?

Le premier instantané de carnet [OKX Spot du 12 novembre à 15:27 UTC](./SEVEN_HEAVEN_OKX_BTC_ETH_USDC_LIVE_BOOK_COST_SCIENTIFIC_AUDIT_2026_11_12.md) a montré des spreads et des coûts de profondeur très faibles à cet instant. Il restait à vérifier **minSz, lotSz, tickSz, état public de l'instrument** et l'admissibilité **théorique de quantités pour de petits montants**, puis à prendre **une deuxième photographie** sans construire une fausse loi de volatilité avec deux seuls points.

[**Protocole figé avant la collecte**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_INSTRUMENT_RULES_AND_SECOND_SNAPSHOT_PROTOCOL_2026_11_12.md), commit `d560d6bd99ae3fe68f0c77cf490303167840e5f2`. Deux endpoints publics **GET uniquement**, `/api/v5/public/instruments` et `/api/v5/market/books`, paires exactes BTC-USDC, ETH-USDC. Aucun endpoint de compte ni de placement d'ordre.

## 2. Les règles officielles obtenues

Les API publiques ont renvoyé `code=0`, `instType=SPOT`, `quoteCcy=USDC`, `state=live`, avec un instrument unique correspondant à chaque paire.

| Champ public OKX | BTC-USDC | ETH-USDC | Unité |
|---|---:|---:|---|
| `state` | live | live | Statut de marché public |
| `minSz` | **0,00001** | **0,001** | BTC / ETH |
| `lotSz` | **0,00000001** | **0,000001** | BTC / ETH |
| `tickSz` | **0,1** | **0,01** | USDC par unité |
| `maxMktAmt` renvoyé | 1 000 000 | 180 000 | Champ de réponse, application dépend du type d'ordre |

Les définitions OKX sont explicites : pour **SPOT**, `minSz` et `lotSz` concernent la **quantité de l'actif de base**. Le pas du prix est `tickSz`. Le statut `live` n'est **pas une autorisation personnelle pour un compte EEE** ; il ne vérifie pas le solde, les limites de notionnel, les frais de l'utilisateur, les paires de son profil, la validation de taille à l'ordre ni les restrictions de négociation.

**Précision indispensable :** pour un ordre **Spot au marché**, `sz` peut être exprimé en monnaie de base ou de cotation selon le paramètre `tgtCcy`. Ne pas transformer les calculs de quantité **limite** ci-dessous en instruction de marché. La documentation officielle est [OKX API V5](https://www.okx.com/docs-v5/en/).

## 3. Scénarios théoriques de petits ordres limites

La deuxième photographie du carnet a donné les meilleurs **asks** BTC `71 316,90 USDC` et ETH `1 996,47 USDC`. Pour chaque budget, nous calculons `floor((budget/ask)/lotSz)*lotSz`, **sans dépenses supérieures au budget et sans inclure les frais**. Ce n'est **pas un ticket d'ordre réel**.

| Budget hypothétique | Quantité BTC sur grille | Quantité ETH sur grille | `minSz` respecté ? |
|---|---:|---:|---|
| 10 USDC | 0,00014021 BTC | 0,005008 ETH | Oui, deux actifs |
| 20 USDC | 0,00028043 BTC | 0,010017 ETH | Oui, deux actifs |
| 100 USDC | 0,00140219 BTC | 0,050088 ETH | Oui, deux actifs |
| 1 000 USDC | 0,01402192 BTC | 0,500884 ETH | Oui, deux actifs |

Les deux meilleurs prix ask sont conformes à `tickSz`. Les quantités sont des valeurs **arrondies vers le bas** à `lotSz` ; les reliquats USDC ne sont pas des frais. Les scénarios vérifient seulement la **contrainte de quantité de base**. Ils n'ont pas testé les restrictions de budget minimal en devise de cotation, les frais, les soldes, les limites dynamiques du prix, les règles régionales ni les conditions spécifiques au compte ; **l'API publique ne prouve donc pas que l'ordre serait accepté**.

## 4. Deux photographies successives du spread

| Mesure | BTC-USDC | ETH-USDC |
|---|---:|---:|
| Première capture marché | 2026-11-12 **15:27:25.507 UTC** | 2026-11-12 **15:27:25.657 UTC** |
| Deuxième capture marché | 2026-11-12 **15:38:34.007 UTC** | 2026-11-12 **15:38:34.307 UTC** |
| Premier spread | 0,014006 bp | 0,049925 bp |
| Deuxième spread | 0,014022 bp | **0,751354 bp** |
| Différence | **+0,000016 bp** | **+0,701429 bp** |
| Deuxième meilleur bid | 71 316,80 USDC | 1 996,32 USDC |
| Deuxième meilleur ask | 71 316,90 USDC | 1 996,47 USDC |

Environ **11 minutes 9 secondes** séparent les deux captures. Le spread ETH a augmenté d'un facteur voisin de **15**, tandis que le spread BTC est presque stable. **Cela ne prouve aucune saisonnalité horaire, ni une loi de volatilité, ni que le spread ETH reste toujours plus large.** Même la variation de spread peut être transitoire entre les deux captures ; les livres ne sont pas atomiquement synchronisés.

On ne peut pas calculer des frais « réellement exécutés » avec ces deux carnets, ni reporter directement ces écarts dans le replay EMA 10/30 effectué sur Bitstamp/USD en 2024–2026. Les observations portent ici sur **OKX/USDC**, un marché et un numéraire différents.

## 5. État des vérifications et preuves

- [**Protocole scientifique préenregistré**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_INSTRUMENT_RULES_AND_SECOND_SNAPSHOT_PROTOCOL_2026_11_12.md).
- [**Programme Python public seulement, sans POST**](./SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_INSTRUMENT_RULES_SECOND_SNAPSHOT_2026_11_12.py).
- [**Six tests de calcul et sécurité**](./test_seven_heaven_okx_spot_instrument_rules_second_snapshot.py).
- [**JSON de preuves, heures, quatre réponses publiques brutes avec SHA-256**](./okx_spot_instrument_rules_second_snapshot_2026_11_12_evidence/SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_SECOND_SNAPSHOT_EVIDENCE.json).
- [**CSV des huit calculs de taille**](./okx_spot_instrument_rules_second_snapshot_2026_11_12_evidence/SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_LIMIT_SIZE_EXAMPLES.csv).
- [**Rapport machine de la collecte**](./okx_spot_instrument_rules_second_snapshot_2026_11_12_evidence/SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_SECOND_SNAPSHOT_REPORT.md).
- [**GitHub Actions #2 réussi**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43249814282), six tests, sources contrôlées, CSV en fins de ligne LF, résultat complet archivé.

**Conclusion de l'étude :** les petites quantités BTC et ETH étudiées sont compatibles **avec les trois contraintes publiques essentielles des ordres limites** à cet instant (statut, pas de quantité, prix). L'étude **ne valide ni des ordres réels ni la tarification du compte**. Le spread a varié entre nos deux mesures, en particulier sur ETH. Pour déterminer son comportement dans différentes conditions, il faudrait désormais définir des observations à plusieurs instants **séparés et préenregistrés**, avec assez de points pour mesurer une distribution, sans confondre cela avec la validation prospective EMA.

**Aucune modification Administrator / Operator / Trader / Bridge, aucune programmation récurrente, aucun ordre.**
