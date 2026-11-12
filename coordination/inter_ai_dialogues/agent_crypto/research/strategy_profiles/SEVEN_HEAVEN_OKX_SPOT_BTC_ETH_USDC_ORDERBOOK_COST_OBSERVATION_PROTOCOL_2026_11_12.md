# Seven Heaven — Observation ponctuelle des coûts de carnet OKX Spot BTC/USDC et ETH/USDC

**Préenregistré le 12 novembre 2026 avant collecte.** Étude PAPER et lecture publique seule ; aucun compte, aucune clé API, aucun ordre. Ce protocole suit le stress-test EMA 10/30 50/50 publié dans le Coffre.

## Question

Les coûts théoriques du replay antérieur (**0,10 % de frais + 0,05 % de glissement par côté**) sont-ils d'un ordre de grandeur plausible face aux **spreads et profondeurs instantanés** du carnet OKX Spot ? On ne peut pas extrapoler une capture à la moyenne de 2024–2026 ni à l'exécution future. Le contrôle est un **diagnostic ponctuel**, non un vrai backtest des coûts historiques.

## Sources exactes

- API publique OKX [GET /api/v5/market/books](https://www.okx.com/docs-v5/en/), paramètres `instId=BTC-USDC` puis `ETH-USDC`, `sz=400` profondeurs par côté. Aucun accès à `/api/v5/trade/order`. Paires explicitement choisies pour la lecture OKX Spot USDC ; **ne pas substituer BTC-USDT ou ETH-USDT si les paires sont indisponibles**.
- Vérifier `code=0`, `data[0].asks/bids`, timestamp de marché `ts`, prix strictement positifs, tailles strictement positives, ordonnancement croissant des ask/décroissant des bid ; refuser marché croisé ou vide ; noter les limitations d'accessibilité régionale si API retourne une erreur.
- Enregistrer les empreintes **SHA-256 des réponses brutes**, les dates UTC de réception de chaque appel, les meilleurs prix, les niveaux utilisés, et la réussite/erreur. Le JSON publié contiendra seulement des données publiques.

## Calculs obligatoires — montants fixés avant la collecte

Pour chacun des **5 montants notionnels fixes** **10, 100, 1 000, 10 000, 100 000 USDC** :
1. Mid = (meilleur bid + meilleur ask) / 2. Spread en points de base (bp) = `(ask-bid)/mid*10000`.
2. **Achat fictif** : dépenser le montant USDC à travers les asks du meilleur au moins bon, selon les quantités en monnaie de base ; obtenir la quantité de BTC/ETH et son prix moyen. Écart moyen de prix par rapport au mid : `(prix_achat_moyen/mid-1)*10000` bp.
3. **Vente fictive** : vendre une quantité d'actif égale à `montant_USDC / mid` à travers les bids ; calculer le prix de vente moyen, `(1-prix_vente_moyen/mid)*10000` bp.
4. **Impact au-delà du demi-spread** : écart achat/vente moyen moins `spread/2` (en bp) ; ce chiffre est une approximation de marche de carnet dans un snapshot immobile, **pas un glissement effectivement exécuté**.
5. Lorsque la profondeur retourne moins de liquidité que le montant demandé, publier `insufficient_visible_depth` et **aucune estimation de coût pour ce montant**. Aucun remplissage fictif.
6. Mettre en regard **deux hypothèses illustratives de frais taker par côté : 0,10 % et 0,35 %**, non reliées au compte personnel. Documenter clairement que, selon la grille OKX Europe mise à jour en septembre 2026, le taux réel varie avec le compte, le niveau et le type d'accès : https://www.okx.com/en-eu/help/what-are-the-new-trading-fees-for-eea-users . Le coût illustratif est frais + écart d'exécution moyen versus mid, **sans double compter** le demi-spread.

## Contrôles et interprétation

- Mesurer les deux **côtés séparément** ; les deux livres de BTC et d'ETH peuvent provenir de timestamps différents, ne pas présenter l'ensemble comme snapshot simultané.
- Prendre **une capture par instrument**, pas une moyenne sur plusieurs heures. Conditions fugitives, risque de stale book/latence, quantité affichée non garantie, priorités d'ordre/règles minSz/tickSz non vérifiées, impact réel et exécution différente du carnet figé.
- Comparer les coûts ponctuels illustratifs à l'hypothèse précédente de 15 bp (0,15 %) par côté et au seuil rétrospectif de 55,06 bp ; **aucune déduction** de rentabilité EMA future ni requalification du replay ancien.

## Livrables

Dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : collecteur Python public lecture seule, tests synthétiques, JSON des snapshots et mesures, CSV de synthèse, rapport lisible, mise à jour de passation inter-IA. En cas d'échec API, préserver une preuve honnête d'échec **sans données inventées**, et ne pas déclarer l'analyse validée.

**Aucune collecte récurrente, aucune automatisation d'ordre et aucun changement Administrator / Operator / Trader / Bridge.**
