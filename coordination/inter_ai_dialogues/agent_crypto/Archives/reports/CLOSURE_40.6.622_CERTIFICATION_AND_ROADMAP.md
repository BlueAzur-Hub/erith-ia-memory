# Agent-Crypto — clôture 40.6.622

Date: 2026-10-07

## Baseline opérateur

- Trader / Administrator: **40.6.622**
- Market Core: **38.15.11**
- Bridge: **1.9.13**
- Private Backend opérationnel: **1.4.6 R2**
- Exécution réelle: **désactivée**

## Correction 40.6.622

Défaut terrain observé sur SOL-USDC / Bougies 1m:
la clôture courante pouvait être exactement égale au plus bas visible tandis que Lecture Technique affichait **Support : Aucun niveau**.

Cause:
le fallback visible exigeait strictement:
- support: `low < current`
- résistance: `high > current`

Correction bornée:
- support: `low <= current`
- résistance: `high >= current`

L'égalité est uniquement un fallback **indicatif**, marquée `currentEdge: true`, distance 0 %.
La méthode historique **PIVOTS_VISIBLES_W2** reste inchangée.

## Certification code / CI

**PASS — engineering/static certification.**

Preuves:
- Market Microscope Current: PASS sur le commit correctif du guard.
- Trader Current: PASS sur le code 40.6.622.
- Depth Current: PASS.
- Version Truth Guard: PASS.
- Version Delivery Guard: PASS.
- GitHub Pages: PASS sur le commit ZIP courant.
- self-tests ajoutés: current-edge support + current-edge resistance.
- Resolver multi-source non modifié.
- Bridge non modifié.
- Backend non modifié.
- Market Core non modifié.
- aucun ordre réel.

Cette certification est une certification d'intégrité logicielle interne, **pas** un audit sécurité externe, une certification financière ou une validation terrain.

## Validation terrain encore requise

Firefox:
1. SOL-USDC ou cas équivalent au plus bas courant: Support doit afficher le niveau courant au lieu de « Aucun niveau ».
2. Cas symétrique au plus haut courant: Résistance doit afficher le niveau courant.
3. Non-régression rapide: M/Bitget, XAUT/OKX ou OKB/OKX restent consultables.

## Roadmap après validation terrain

### 40.6.623 — Top 10 Explorer
- Top 10 Hausse 24h
- Top 10 Baisse 24h
- Top 10 Volume
- Top 10 Nouveaux Listings
- clic d'une ligne => sélection canonique => Ligne/Bougies/Profondeur/Lecture Technique
- réutiliser les données Market existantes
- aucun changement transport/Bridge/Backend

### LAB — Binance Book
Développement hors pile opérateur uniquement.
Promotion seulement après qualification Windows complète:
startup, /health, restart, régressions OKX/Bitget et un actif Binance-only.

### 40.6.624 — OKX Account READ ONLY
Solde, actifs et valorisation via Backend local.
Aucun secret navigateur. Aucun ordre.

### 40.6.625 — Instrument Truth + Fee Truth + Micro-Ticket Validator
minSz / lotSz / tickSz, frais du compte, spread/slippage et coût simulé.

### 40.6.626 — OKX Demo / Paper
Preuves d'exécution simulée uniquement.

## STOP gate

Ne pas modifier la baseline consultation sans défaut propriétaire démontré.
L'exécution réelle reste hors périmètre.
