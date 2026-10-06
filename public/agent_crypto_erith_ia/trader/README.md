# ERITH.IA Trading Desk — 40.6.599

## FINAL HANDOFF · D LOCK

La correction finale remet le Graphique Ligne dans la destination demandée :

**Le Trader ne possède plus un moteur de chargement par période.  
Il lit la masse historique déjà détenue par l'Interface et restitue la fenêtre choisie.**

## Source historique réutilisée

Le Trader lit en priorité le cache historique canonique de l'Administrator :

- IndexedDB PRIMARY : `agent_crypto_storage_relief_40278`
- store : `payloads`
- payload : `agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50`

Si IndexedDB PRIMARY n'est pas disponible, il peut lire la copie locale du **même cache Interface**.

Il ne crée plus de cache historique Trader par période.

## Clic 24h / 7j / 30j / 60j / 90j / 1a / Max

Un clic de période :

1. ne lance **aucune requête réseau** ;
2. cherche d'abord la période exacte déjà détenue par l'Interface ;
3. sinon, cherche la plus petite série Interface couvrant la période et en extrait la fenêtre utile ;
4. restitue cette série dans le graphique.

Donc le bouton de période est un **sélecteur de lecture de la base historique**, pas un déclencheur réseau.

## Réseau

Une requête directe CoinGecko n'est tolérée qu'au **bootstrap** d'un actif/devise si aucune série Interface exploitable n'existe pour le contexte courant.

Elle n'est jamais déclenchée par un bouton de période.

## EUR / USD

- EUR : priorité aux familles Interface Binance puis CoinGecko.
- USD : priorité CoinGecko puis Binance.
- Les deux contextes restent séparés.

## 40.6.598

La logique de cache propre Trader introduite en 40.6.598 est **abandonnée** dans 40.6.599.
La clé précédente n'est plus écrite. Aucun nettoyage automatique n'est effectué.

## Protégé

- Administrator 40.6.571
- Market Core 38.15.11
- PAIR centrale 40.6.597
- Source Dock 40.6.596
- Interface filtrée 40.6.595
- tooltip / prix historiques 40.6.594
- Bougies / Profondeur / Lecture Technique / Math Core
- READ ONLY · aucun ordre réel

## Test de clôture

BTC → Ligne → 24h → 7j → 30j → 60j → 90j → 1a.

Attendu :
- pas de `NetworkError` au changement de période ;
- source visible : **HISTORIQUE INTERFACE · BASE LOCALE** lorsqu'une série existe dans la base ;
- les valeurs et le tooltip changent avec la période ;
- aucun appel réseau provoqué par le bouton de période.

Puis EUR → USD et même test.

Cette version est la **version de clôture du fil**.
