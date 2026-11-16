# Seven Heaven Strategy Lab — V4.8 Thread Recovery Audit — 2026-11-16

## Pourquoi ce document existe

Ce document empêche une IA de reprise de répéter la dérive du fil du 16 novembre 2026.

## Point canonique

- V4.6.2 : dernière release stable historique du Lab.
- V4.7.0-RC1 : base propriétaire testée dans Firefox, moteur PAPER conservé.
- StrategySpec v1 : fondation V4.8 Gate 1 déjà développée.
- V4.8 : chantier produit, pas une release stable installée.
- V5 : Robot PAPER futur ; aucun automate temps réel dans V4.8.

## Incident de reprise

Trois prototypes Gate 2 ont été produits trop vite après une mauvaise interprétation d'un retour visuel utilisateur. Ils ne doivent pas être pris comme références canoniques :

1. première Gate 2 : fonctions utiles mais bloc visuel mal dimensionné ;
2. variante Integrated RC1 UI : refonte excessive non demandée ;
3. variante Coherent UI : nouvelle réorganisation qui a aggravé la confusion.

Le retour utilisateur initial ne demandait pas une refonte fonctionnelle : le nouveau bloc était simplement dimensionné différemment des autres sections.

## Règles de reprise obligatoires

1. Une demande = une modification bornée.
2. Expliquer d'abord ce qui change, ce qui ne change pas, et pourquoi.
3. Ne jamais transformer une remarque visuelle en refonte d'architecture sans demande explicite.
4. Ne pas multiplier les numéros de version dans l'UI : distinguer moteur, chantier DEV et release.
5. Les documents de continuité vont dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/`, jamais dans le paquet programme.
6. Le moteur PAPER canonique ne change pas pendant la Knowledge Layer sans décision explicite.
7. Chaque nouvelle fonction du mode guidé doit être compréhensible et utilisable depuis l'interface.

## Direction retrouvée

V4.8 devient une couche professionnelle au-dessus du moteur :

- Bibliothèque de marchés lisible ;
- Bibliothèque de stratégies ;
- Knowledge Layer contextuelle ;
- StrategySpec comme sauvegarde portable/rejouable ;
- Atelier scientifique complet conservé ;
- zéro ordre réel.

## Niveau d'interface attendu

Professionnel ≠ cryptique. L'interface peut être dense mais doit hiérarchiser :

- terme professionnel ;
- traduction claire ;
- définition ;
- fonctionnement ;
- paramètres ;
- forces/limites ;
- règle exacte Seven ;
- preuve par backtest ;
- sources/références.
