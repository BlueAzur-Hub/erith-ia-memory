# Laboratoire · Archives techniques — Snapshot Analyse (inactif)

**Statut : archive uniquement. Projet de présentation abandonné à la demande de l'utilisateur le 16 octobre 2026.**

Ce dossier conserve les sources techniques pour mémoire et reprise éventuelle **sur instruction explicite uniquement**. Il ne constitue **ni** une version à déployer, **ni** un module à installer, **ni** une demande de nouvelle fiche ou de nouveaux textes sur le graphique.

## Sources conservées

| Fichier | Nature | Origine |
| --- | --- | --- |
| `snapshot-analyse.js` | Calculateur autonome, purement mathématique, sans accès réseau, interface ou ordre réel | [PR #447](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/447), code source original |
| `test-snapshot-analyse.cjs` | Tests unitaires du calculateur (conservés, pas déclenchés automatiquement) | PR #447, tests originaux |
| `snapshot-analyse.md` | Contrat historique et hypothèses de travail, non canonique pour l'Interface actuelle | [PR #445](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/445), document original conservé au commit antérieur au retrait |
| `published-series-accessor.txt` | Extrait exact, **non exécutable**, du lecteur de séries jadis ajouté à `administrator/app.js` | [PR #446](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/446), récupéré avant le retrait |
| `published-series-test.txt` | Extrait exact du test de fidélité au graphique, archivé comme texte non exécutable | PR #446, extrait du test `test-market-radar-fidelity.cjs` |

Les anciens prototypes visuels rejetés restent récupérables **uniquement dans l'historique Git** : [PR #448](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/448), [PR #449](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/449) et [PR #450](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/450). Ils ne sont pas remis dans l'Interface.

**Commit source de référence pour les copies :** `6428762704239e48fb0fa9ae610e8787df42980b` (avant [PR #451 — retrait confirmé](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/451)).

## Verrous de continuité

- Aucune balise HTML `script` ni `link` ne référence cette archive.
- Aucun script de cette archive n'est chargé par l'Administrator, l'Interface ou le Trader.
- Aucun changement dans `administrator/app.js`, le graphique, sa géométrie, ses légendes, la Lecture Technique, le Market Core, le Bridge ou les ordres.
- Aucune restauration des textes pédagogiques et des panneaux refusés.
- Les tests unitaires sont conservés **pour mémoire** ; ils ne sont pas ajoutés aux workflows automatiques.
- Le contrat Markdown reflète **une étape passée**, et non les décisions fonctionnelles valides après abandon.

**Règle de reprise :** archiver n'est pas activer. Ne pas relancer ce chantier de présentation sans une nouvelle demande explicite. La priorité de stabilité est de préserver le graphique existant et d'éviter toute redondance.
