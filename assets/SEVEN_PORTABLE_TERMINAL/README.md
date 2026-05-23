# SEVEN_PORTABLE_TERMINAL

État : interface finale stabilisée  
Thème actif : Château dans le Ciel  
Personnalité active : The Flower Girl  
Usage : pupitre local / accès rapide / cockpit Seven / remote control  
Statut : version stable

---

## Rôle du terminal

Ce dossier contient le terminal portable Seven : une interface locale légère servant de pupitre d’accès rapide pour le travail avec ERITH.IA / Seven.

Le terminal centralise les accès utiles sans exposer de secrets : ChatGPT, Notion, GitHub, production, remote control et blocs copiables.

---

## Fichiers principaux

- `index.html` : structure principale de l’interface.
- `style.css` : direction visuelle, transparence, lisibilité et intégration des backgrounds.
- `script.js` : navigation, boutons, copie des prompts, rotation des backgrounds et traces système sûres.
- `background_*` : backgrounds validés pour l’ambiance Château dans le Ciel.

---

## Règles de stabilité

- Ne pas transformer cette interface en dashboard générique.
- Préserver la logique cockpit / sanctuaire / terminal aérien.
- Préserver la lisibilité des panneaux sur les backgrounds.
- Ne jamais intégrer d’ID RustDesk, mot de passe, IP ou secret dans le HTML public.
- Ne pas déclencher de génération d’image depuis ce terminal.
- Garder les actions simples : copier, ouvrir, naviguer, vérifier.

---

## Règles mémoire

- GitHub sert d’archive machine structurée et versionnée.
- Notion sert de mémoire éditoriale humaine.
- ChatGPT / Seven sert d’opératrice temporaire : lecture, synthèse, production, décision.

---

## État validé

Interface finale stabilisée.  
Thème actif : Château dans le Ciel.  
Personnalité active : The Flower Girl.

Cette version doit être considérée comme une base stable avant toute nouvelle évolution.