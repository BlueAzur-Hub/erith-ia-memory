# Agent-Crypto — 40.6.435 · STRATEGY A OKX BACKEND ROUTE TRUTH

Parent : 40.6.434.
Market Core : 38.15.11.

## Terrain parent
40.6.434 : Kraken PASS ; OKX direct navigateur FAIL par timeout WebSocket EEA puis timeout REST public.
Le même dump prouve Source Truth CEX CEX READY, OKX 5/5 et 4/4 sources via le Private Backend local.

## Correction unique
Execution Cost Truth ne contacte plus OKX directement sur Internet.
Il réutilise http://127.0.0.1:8790/quotes?assets=BTC, Private Backend V1.4.2.
Bid/ask OKX servent au meilleur achat, meilleure vente et spread top-of-book.

## Vérité conservée
Backend V1.4.2 ne prouve pas encore un carnet multi-niveaux dans son contrat public actuel.
Donc profondeur ±5/±25 bp = NON EXPOSÉE et glissement 10/25/50/100 EUR = N/D.
Aucune valeur n'est inventée.

## Protections
Aucun accès Internet OKX direct depuis Firefox. Aucun WebSocket ajouté. Aucun timer, stockage, clé API, wallet ou ordre réel.
Cost Gate, Oracle, Risk, Paper, Market Core 38.15.11, Aether et cockpit inchangés.

## Test
Ctrl+F5 > Build 40.6.435 > Simulation / Strategy A > Execution Cost Truth > MESURER KRAKEN + OKX.
OKX attendu : Source BACKEND LOCAL 8790 · OKX PUBLIC avec bid/ask + spread.
Puis EXPORTER le JSON.
