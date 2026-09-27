# Agent-Crypto — 40.6.431 · STRATEGY A ORACLE COST CALIBRATION TRUTH

Parent : **40.6.430**.  
Market Core : **38.15.11**.

## Objet unique

Transformer l'audit Strategy A du fil courant en **vérité de calibration visible**, sans modifier le moteur.

Nouveau propriétaire canonique :

`js/strategy-a-oracle-cost-calibration-audit.js`

Nom stable et fonctionnel : aucun numéro de build dans le nom du fichier.

## Vérité de coût retrouvée

Le seuil Strategy A est calculé par :

- frais achat : **0,25 %** ;
- impact entrée : **0,05 %** ;
- frais vente : **0,25 %** ;
- impact sortie : **0,05 %** ;
- coût aller-retour modélisé : **0,60 %** ;
- marge de sécurité : **0,20 %** ;
- seuil requis : **max(0,80 %, coût + marge)** = **0,80 %** avec le modèle courant.

Point critique : ces valeurs viennent des **champs Simulation ou du fallback pédagogique**. Le code du projet dit lui-même que les frais réels de plateforme, le spread réel et le slippage réel ne sont pas vérifiés ici.

## Vérité Oracle retrouvée

Strategy A lit :

`atlasOracleBuildModel(BTC).bullAmplitude`

puis expose cette valeur sous le nom :

`expected_move_pct`

Mais `bullAmplitude` est une **enveloppe déterministe de scénario**, calculée depuis l'enveloppe de risque, l'échelle d'horizon, la force directionnelle et le short tilt. Ce n'est ni une probabilité entraînée, ni un rendement attendu calibré.

Échelles d'amplitude Oracle :

- 1 min : 0,085 ;
- 5 min : 0,180 ;
- 15 min : 0,320.

## Lecture avec l'audit .430

Le nouveau panneau recroise automatiquement ces deux vérités avec le Cost-Wait Outcome Audit :

- coût modélisé courant ;
- seuil courant ;
- enveloppe Oracle médiane observée ;
- MFE médiane observée ;
- couverture T+60 ;
- écart MFE − enveloppe.

## Décision de chantier

**Ne pas modifier le seuil 0,80 % dans cette version.**

Avant toute calibration métier :

1. distinguer coûts d'exécution réellement vérifiés et modèle pédagogique ;
2. calibrer `bullAmplitude` contre la MFE réelle ;
3. seulement ensuite tester un nouveau Cost Gate en Paper.

## Protections

- aucun seuil changé ;
- aucune formule Oracle changée ;
- aucune décision Strategy A changée ;
- Risk Governor inchangé ;
- Paper inchangé ;
- Market Core 38.15.11 inchangé ;
- Aether inchangé ;
- CSS cockpit inchangé ;
- aucun nouveau fetch / WebSocket / timer récurrent / observer / stockage ;
- aucun ordre réel.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.431**.
3. Ouvrir Simulation / Strategy A.
4. Vérifier le panneau **STRATEGY A · ORACLE / COST CALIBRATION TRUTH · 40.6.431** sous le Cost-Wait Audit.
5. Console : `AgentCryptoStrategyAOracleCostCalibrationAudit.self_test().pass === true`.
6. Vérifier que Strategy A conserve exactement ses seuils et son comportement.

Terrain : **PENDING FIREFOX**.
