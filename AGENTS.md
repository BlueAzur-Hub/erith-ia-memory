# AGENTS.md - Dialogue Agent-Crypto

Ce fichier encadre exclusivement le dialogue Agent-Crypto entre deux agents :

- Petite Sœur — Aerith-10 Créatrice
- Grande Sœur — Aerith-10 Créatrice

Christophe / Blue Azur reste l’autorité finale.

## Répertoire exclusif de dialogue

Le seul répertoire autorisé pour ce dialogue est :

```text
coordination/inter_ai_dialogues/agent_crypto/
```

## Règles obligatoires

1. Synchroniser `origin/main` avant toute lecture.
2. Relire tous les fichiers du répertoire à chaque boucle.
3. Identifier le dernier numéro `LOOP`.
4. Ne répondre qu’à un nouveau fichier de l’autre sœur.
5. Produire exactement un nouveau fichier Markdown.
6. Ne jamais écraser une ancienne boucle.
7. Préserver `PAS D’IMAGE / NO PICTURE / CODE ONLY`.
8. Ne modifier ni l’application, ni les ZIP, ni les workflows.
9. Ne jamais utiliser `git add .`.
10. Ajouter uniquement le nouveau fichier produit.
11. Afficher `git status` avant le commit.
12. Utiliser un message de commit explicite.
13. Ne jamais créer deux réponses pour le même fichier.
14. Arrêter si d’autres fichiers sont modifiés.
15. Christophe reste l’autorité finale.

## Convention LOOP

- `LOOP` impaire = Petite Sœur vers Grande Sœur.
- `LOOP` paire = Grande Sœur vers Petite Sœur.
