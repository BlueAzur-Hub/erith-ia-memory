# Agent-Crypto 40.6.470 — OKX POTENTIAL OUTCOME AUDIT

## But

Mesurer ce qu'il est réellement advenu des cycles que le shadow 40.6.467 avait classés **OKX POTENTIAL** avant slippage.

La référence est figée :
- population : **144 COST WAIT**;
- plancher OKX + marge : **0,6109 % avant slippage**;
- population POTENTIAL attendue : **16**.

Le module n'utilise pas le snapshot OKX courant. Si la population 144/16 ne se reconstitue pas, l'état devient **BASELINE_DRIFT** et les ratios ne sont pas présentés comme la vérité .467.

## Méthode

Pour les 16 cycles reconstruits :
- retrouver le cycle T0 dans Experiment Ledger / Durable Evidence;
- certifier un échantillon autour de T+5, T+15 et T+60 avec la même tolérance de 150 s que l'audit Outcome existant;
- calculer la **MFE cumulée** depuis T0 jusqu'à l'échantillon certifié de chaque horizon;
- compter combien dépassent le plancher figé 0,6109 %.

## Interprétation

Dépasser 0,6109 % signifie uniquement que le pic favorable échantillonné a dépassé le plancher frais+spread+marge utilisé dans le shadow .467.

Cela ne prouve pas :
- le coût historique réel;
- le slippage OKX;
- une exécution possible au pic;
- un P/L réalisé;
- la rentabilité;
- qu'un gate doit être abaissé.

Aucun seuil, Oracle, Risk, Paper, Market Core, stockage ou ordre réel n'est modifié.
