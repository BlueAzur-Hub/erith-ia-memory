# Agent-Crypto · Operator 40.6.510 — candidate branch

Operator est préparé à partir du checkpoint Administrator **40.6.508** avec Market Core **38.15.11**.

## Architecture

- runtime canonique partagé : `../administrator/index-40.6.508.html` ;
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

## Héritage volontaire de l'Administrator 40.6.508

- Graphique / Market Microscope ;
- bougies OHLC + volume + MA5/10/20 ;
- multi-actifs ;
- Carnet / Profondeur OKX en lecture seule ;
- Market Core 38.15.11 inchangé ;
- Strategy A business logic inchangée ;
- Simulation et Evidence restent découplées ;
- REDIVIDER préservé.

## Ce que cette candidate ne fait pas

- ne copie pas toute l'interface Administrator ;
- ne crée pas un deuxième Market Core ;
- ne donne aucun accès Administrator ;
- ne modifie pas le Backend ;
- ne modifie pas Strategy / Oracle / Cost Gate ;
- ne publie pas d'ordre réel ;
- ne contourne pas le besoin de test Firefox.

## État

**CANDIDATE BRANCH — NON PUBLIÉE**

Tests à faire avant toute livraison :
1. Firefox Ryzen : entrée Operator, vue intermédiaire, aucun privilège Administrator ;
2. Graphique/Bougies/multi-actifs visibles et stables ;
3. Profondeur/Book read-only si Backend 8790 disponible ;
4. état propre si Backend absent ;
5. Market Core 38.15.11 identique ;
6. Transformer Book : vérification d'affichage dégradé propre sans Bridge local ;
7. seulement après preuve : Version Truth / Delivery puis livraison.

Administrator reste la source canonique. Operator reste un miroir de livraison/profil, jamais un second moteur.
