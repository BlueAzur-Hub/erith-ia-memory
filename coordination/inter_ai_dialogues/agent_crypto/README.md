# Agent-Crypto · Coordination / Inter-AI Dialogues

Ce répertoire est une **zone d’archives, de handoff et de dialogue de chantier**. Il conserve volontairement les fils, audits, bundles et états intermédiaires historiques.

## Source de vérité courante

Ne déduire **jamais** la version runtime active à partir du nom du fichier le plus récent dans ce répertoire.

Au 12/09/2026, la vérité publiée du MASTER est :

- Administrator : `40.6.100`
- Market Core : `38.15.11`
- Build truth : `public/agent_crypto_erith_ia/administrator/build.json`
- Entrée Administrator immuable : `public/agent_crypto_erith_ia/administrator/index-40.6.100.html`
- Release : `public/agent_crypto_erith_ia/administrator/RELEASE_40_6_100.md`
- Prompt de reprise canonique : `public/agent_crypto_erith_ia/administrator/PROMPT_REPRISE_AERITH_7_AGENT_CRYPTO.md`

L’Operator réutilise le runtime Administrator partagé ; sa livraison doit rester alignée sur la Build courante sans créer un second moteur.

## Règle d’usage

1. `administrator/build.json` et l’entrée immuable réellement publiée font autorité sur la version.
2. Les fichiers de ce dossier servent à reconstruire le contexte, les décisions et les preuves historiques.
3. Les ZIP/bundles/versioned handoffs sont conservés pour traçabilité ; ils ne constituent pas un boot source.
4. Un ancien fil peut décrire correctement son époque tout en étant obsolète pour le runtime courant.
5. Aucun fichier historique n’est supprimé ou réécrit uniquement pour « nettoyer » le dossier.

## Discipline de reprise

Avant toute chirurgie :

`demande actuelle → main courant → build.json → entrée immuable → preuve terrain → propriétaire unique → geste minimal → preuve → stop`

En bref : le cimetière garde ses pierres tombales ; **CURRENT reste indiqué à l’entrée**.
