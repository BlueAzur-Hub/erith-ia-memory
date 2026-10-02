# Agent-Crypto · Operator 40.6.510

Operator 40.6.510 est la première livraison Operator dérivée du checkpoint Administrator **40.6.509** avec Market Core **38.15.11**.

## Architecture

- runtime canonique partagé : `../administrator/index-40.6.509.html` ;
- vue Operator : `?view=intermediate` ;
- entrée Operator : `operator-entry=40.6.510` ;
- profil : `yohan` ;
- aucun second moteur ;
- aucun privilège Administrator ajouté ;
- aucun wallet, clé ou ordre réel ;
- paper-only ;
- Backend attendu : loopback/read-only **1.4.4** ;
- Bridge attendu : **1.9.13** ;
- Aether Control attendu : **2.3.2R19**.

## Preuve Administrator héritée

Terrain 02/10/2026 :
- Build **40.6.509 · Administrator** visible ;
- Market Core **38.15.11** ;
- Graph Context V7 : **DB OK · LS ok** ;
- Carnet / Profondeur OKX **LIVE 2 s** ;
- fenêtre Profondeur déplaçable indépendamment ;
- Lecture Technique conservée ;
- vue read-only, aucune exécution réelle.

## Héritage Operator

- Graphique / Market Microscope ;
- Ligne + Bougies ;
- OHLC + volume + MA5/10/20 ;
- BTC / ETH / BNB / XRP / SOL ;
- Lecture Technique ;
- Math Core lecture seule ;
- Carnet / Profondeur OKX read-only ;
- Strategy A inchangée ;
- Simulation et Evidence découplées ;
- REDIVIDER préservé.

## Ce que 40.6.510 ne fait pas

- ne copie pas l’Administrator ;
- ne crée pas un deuxième Market Core ;
- ne donne pas de session Administrator ;
- ne modifie pas le Backend / Bridge ;
- ne modifie pas Strategy / Oracle / Cost Gate ;
- ne publie aucun ordre réel ;
- n’embarque aucun secret.

## Test terrain requis

1. Firefox Ryzen : ouvrir `operator/` ;
2. confirmer la vue Intermédiaire / rôle Operator ;
3. confirmer l’absence d’accès Administrator ;
4. tester Graphique / Bougies / multi-actifs ;
5. tester Lecture Technique ;
6. tester Book / Profondeur avec Backend 8790 ;
7. tester l’état propre sans Backend ;
8. confirmer Market Core 38.15.11.

Administrator reste la source canonique. Operator est une livraison/profil du même moteur.
