# Agent-Crypto — Handoff

Build **40.6.410** · parent **40.6.409** · rollback **40.6.407**.

## Politique

**Cockpit d'abord, Strategy automatique ensuite.**

Le boot-priority Strategy au `DOMContentLoaded` est retiré.
Strategy démarre via le signal Aether existant, sans clic opérateur.

## Entre modules Strategy

- MessageChannel task boundary ;
- zéro sleep artificiel ;
- zéro requestIdleCallback ;
- ordre et chargement séquentiel inchangés.

## Vérification

Comparer :
- Aether ready ;
- Consultation ready ;
- Strategy Core ready ;
- queue/yield/sleep Strategy ;
- eval/load-event restant.

**STOP : aucune 40.6.411 avant lecture du rapport.**
