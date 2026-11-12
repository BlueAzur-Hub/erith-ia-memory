# Seven Heaven — ETH/USD Bitstamp officiel : protocole figé avant extraction et replay

**Date de préparation : 12 novembre 2026 · Statut : PROTOCOLE PRÉENREGISTRÉ, résultat natif encore inconnu.**

## Objectif
Vérifier si la règle EMA 10/30 du Coffre Seven Heaven est transférable de Binance Spot ETH/USDT vers **Bitstamp Spot ETH/USD**, sur les mêmes **1 035 journées** du 1er janvier 2024 au 31 octobre 2026, sans aucune optimisation. Ne pas assimiler une concordance sur un même historique à une validation prospective.

## Provenance à utiliser
- API publique officielle Bitstamp OHLC : `https://www.bitstamp.net/api/v2/ohlc/ethusd/` ; `step=86400` (journalier UTC), `limit<=1000`, `end=<timestamp UTC>`. Documentation : https://www.bitstamp.net/api/ (section OHLC data). `start` et `end` simultanés : Bitstamp précise que `end` prévaut.
- Deux requêtes au moins sont nécessaires pour dépasser la limite de 1 000 bougies. Télécharger par pagination à rebours, horodater les requêtes et archiver les réponses dans des fichiers de preuve, fusionner par timestamp **sans interpoler**.
- **Fenêtre d'initialisation EMA** : 1er avril 2023 → 31 décembre 2023, 275 jours, incluant **chaque journée UTC**. Fenêtre d'évaluation : 1er janvier 2024 → 31 octobre 2026, 1 035 jours. Total attendu **1 310 jours sans trou**.
- Arrêter l'étude et publier une erreur descriptive si API inaccessible, réponse invalide, date dupliquée contradictoire, lacune horaire, marché/pair inattendu, OHLC incohérents ou plafond de pagination atteint. Ne substituer ni Yahoo Finance ni Binance pour combler les manques.
- Référence Binance ETH/USDT préexistante : `SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv` dans le même dossier GitHub, Git blob SHA-1 `c8ed2a206ea616ea87eeb83e31f7138d5b131588`. Utiliser ses champs `eth_exposed`, `eth_ema`, `eth_hold` sur les **mêmes 1 035 dates**. Contrôle de répétition du replay Binance seulement si les huit sources natives d'origine sont relues, sinon expliciter la réutilisation de cette preuve.

## Politique inchangée
- EMA10 et EMA30 calculées sur `close` quotidien, amorcées toutes deux à la clôture du **2023-04-01**. `bull(t)=(EMA10(t)>EMA30(t)) AND (close(t)>EMA30(t))`.
- Achat/vente fictifs exclusivement à **l'ouverture suivante t+1** selon l'état de la clôture t, portefeuille 100 % ETH ou 100 % cash USD, capital **1 000 USD** ; pas de short, levier, rééquilibrage ni intérêts.
- Frais 0,10 % et glissement 0,05 % **de chaque côté** ; coût ×2 étudié par sensibilité, **sans modification des paramètres après lecture**.
- `qty=cash*(1-fee)/(open*(1+slip))` à l'achat ; `cash=qty*open*(1-slip)*(1-fee)` à la vente ; valeur liquidable `cash+qty*close*(1-slip)*(1-fee)`.
- Drawdown maximum à partir de 1 000 unités et des sommets de valorisation liquidable. Comparer EMI, Buy & Hold, cash. Enregistrer rendements, drawdowns, nombre de transactions fictives, jours exposés, 1 035 états d'exposition, nombre et dates des désaccords, corrélation des 1 034 variations quotidiennes *de clôture à clôture*, et résultats de coûts doublés.
- **Ne pas comparer directement USD Bitstamp à USDT Binance comme une seule monnaie**. Rapporter performances relatives, pas arbitrage réalisable ni profit réel.

## Livrables / publication
Dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : programme standard library, protocole présent, rapport de contrôle, JSON de provenance avec empreinte SHA-256 des données natives extraites et Git SHA-1 des références, CSV des 1 310 jours, CSV des jours divergents, preuve d'exécution. L'archive issue de l'API est un **relevé non signé**, distinct d'une signature cryptographique de Bitstamp.

**Sécurité :** accès public en lecture seule uniquement, aucun secret, compte, ordre ou changement d'Administrator / Operator / Trader / Bridge. Le résultat ne sera considéré comme confirmé que si l'exécution sur données réelles a réussi et que ses preuves ont été contrôlées.