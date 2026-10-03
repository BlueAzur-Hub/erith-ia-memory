# Agent-Crypto 40.6.514 — USD DEFAULT · OKX MULTI-QUOTE · CT NEW LISTING

## Base

Parent terrain-validé : **40.6.513**.

Le contrat de Profondeur validé en 40.6.513 reste gelé :

- portal technique sous `document.body` ;
- mode docké en coordonnées document absolues ;
- mode détaché/maximisé en coordonnées viewport fixes ;
- aucune boucle de suivi de scroll ;
- Graphique et Lecture Technique ne changent jamais de parent.

## Devise d'affichage

40.6.514 complète la couche `Quote Currency Architecture`.

Par défaut :

```text
DISPLAY USD
EXEC BTC-EUR
SETTLE EUR
```

Le choix **DISPLAY USD / EUR** reste indépendant de l'instrument d'exécution et de l'actif de règlement.

### Vérité USD

Une valeur USD doit provenir d'une source USD directe.

Interdit :

```text
valeur EUR -> remplacer € par $
```

Autorisé :

```text
CoinGecko USD direct -> interface USD
CoinGecko EUR direct -> interface EUR
OKX BASE-USDC -> carnet natif USDC
OKX BASE-EUR -> carnet natif EUR
```

## Graphique

En DISPLAY USD :

- historique direct CoinGecko avec `vs_currency=usd` ;
- cache séparé par devise ;
- axe, tooltip et légende USD ;
- aucune réutilisation silencieuse d'un cache EUR comme série USD.

En DISPLAY EUR :

- comportement historique EUR conservé.

## Market / Market Flow / Fiche / Lecture Technique

La couche de présentation utilise les champs USD directs disponibles.

L'enrichissement Top 250 USD est borné, indépendant et non destructif.

Si une valeur USD n'est pas disponible, elle reste indisponible ; une valeur EUR n'est pas déguisée.

## Oracle

Le **prix visible** de Lecture Oracle suit DISPLAY USD/EUR.

La logique métier Oracle, ses scores, enveloppes, cohérence et scénarios ne sont pas réécrits dans cette version.

## OKX Microscope + Profondeur

DISPLAY USD route l'instrument natif vers `BASE-USDC`.

DISPLAY EUR route l'instrument natif vers `BASE-EUR`.

Le transport local 8790 conserve désormais le `AbortSignal` original, afin qu'une ancienne requête ne survive pas artificiellement à une nouvelle sélection.

La Profondeur conserve les états :

- FRESH
- STALE
- OFFLINE
- UNKNOWN

Une dernière lecture conservée en état STALE/OFFLINE est visuellement atténuée et n'est pas présentée comme fraîche.

## Concrete / CT

Concrete est traité comme **nouveau listing externe**, séparé du classement canonique CoinGecko.

Entrées opérateur :

- bouton `Nouveaux · CT` dans Market ;
- recherche exacte `CT` ;
- recherche exacte `CONCRETE`.

Surface :

- paire native : `CT-USDC` ;
- ticker public OKX à la demande ;
- accès Bougies ;
- accès Profondeur ;
- aucun rang Top 250/1000 inventé ;
- aucune injection dans les candidats Oracle ;
- aucune mutation Strategy.

## CSS borné

### Lecture Technique

Seulement :

- chiffres tabulaires ;
- contraste légèrement supérieur des textes secondaires ;
- distinction visuelle devise principale / secondaire.

### Profondeur

Seulement :

- en-tête du carnet sticky ;
- chiffres tabulaires ;
- atténuation visuelle STALE/OFFLINE.

Aucune modification de géométrie du dock validé en 40.6.513.

## Recette Firefox

1. Ctrl+F5 → **Build 40.6.514 · Administrator**.
2. Vérifier **USD actif par défaut**.
3. Vérifier Target Top 5 / Market / Market Flow / Fiche / Lecture Technique.
4. Ouvrir le Graphique Prix : axes/tooltip USD et historique USD réel.
5. Ouvrir Oracle : prix visible USD.
6. Ouvrir Profondeur : BTC/USDC sous USD.
7. Passer EUR : BTC/EUR ; revenir USD : BTC/USDC.
8. Faire plusieurs bascules rapides : aucune réponse dépassée ne doit réécrire l'ancien contexte.
9. Market → **Nouveaux · CT** ou saisir **CT** + Entrée.
10. Vérifier la ligne Concrete / CT-USDC.
11. Tester Bougies CT-USDC puis Profondeur CT-USDC.
12. Revalider déplacement/détachement/raccrochage de Profondeur : comportement 40.6.513 inchangé.

## Stop Gate

Si un défaut est observé, corriger uniquement le propriétaire de la surface concernée.

Ne pas ouvrir Market Core, Strategy ou le dock 40.6.513 sans preuve directe.
