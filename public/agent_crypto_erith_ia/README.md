# Agent-Crypto @erith.IA

Version : V1.0-RC5  
Statut : prototype public / observatoire crypto prudent / non financier  
Dépôt cible : `BlueAzur-Hub/erith-ia-memory`  
Répertoire cible : `public/agent_crypto_erith_ia/`

---

## Identité

**Agent-Crypto @erith.IA** est un observatoire crypto prudent pour ChatGPT et GitHub Pages.

Il sert à :

- surveiller des données crypto réellement récupérées ;
- vérifier les sources avant d’afficher des prix ;
- classer les signaux informationnels ;
- appliquer une validation croisée marché / liquidité / sécurité / social / on-chain ;
- produire un score mathématique d’observation ;
- détecter la FOMO et le retard d’entrée ;
- refuser les tableaux chiffrés inventés.

Il ne sert pas à :

- prédire l’avenir avec certitude ;
- dire acheter ou vendre ;
- donner un conseil financier personnalisé ;
- promettre un gain ;
- recommander le levier, les futures ou le all-in.

---

## Nouveautés V0.3

- interface plus compacte et plus lisible au premier écran ;
- ticker corrigé, moins coupé, plus lent ;
- panneau **Live Sources** renforcé ;
- panneau **Score Observation Crypto** plus lisible ;
- ajout d’un bloc **Tableau autorisé / refusé** ;
- ajout d’une lecture froide automatique du marché chargé ;
- No-FOMO plus visible ;
- footer et labels mis à jour V0.3 ;
- aucun prix statique ajouté ;
- maintien du verrou V1.2 : pas de source live, pas de prix.

---

## Règle dure

```text
Pas de source live réellement consultée = pas de prix.
Pas de données récupérées = pas de tableau chiffré.
Pas de tableau hypothétique.
Pas de market cap inventée.
Pas de volume inventé.
Pas de classement inventé.
```

---

## Structure

```text
public/agent_crypto_erith_ia/
├── README.md
├── agent_crypto_erith_ia_master_fr.md
├── agent_crypto_erith_ia_chatgpt_instructions_fr.md
├── agent_crypto_erith_ia_model_math_fr.md
├── agent_crypto_erith_ia_live_data_protocol_fr.md
├── agent_crypto_erith_ia_dashboard_spec_fr.md
├── agent_crypto_erith_ia_commands_fr.md
├── agent_crypto_erith_ia_tests_fr.md
├── docs/
├── modules/
├── archives_yohan/
└── web/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## Prototype web

Ouvrir :

```text
web/index.html
```

Lien GitHub Pages attendu après commit :

```text
https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/web/index.html
```

Le prototype ne contient pas de prix statiques. Les tableaux se remplissent uniquement si une source réelle répond au Livecheck.


---

## Changelog V0.4

Objectif : correction d’échelle UI.

- Titre fortement réduit.
- Header moins haut.
- Boutons et nav plus compacts.
- Cards marché moins massives.
- Ticker plus propre et moins envahissant.
- Score mathématique réduit pour mieux tenir dans le premier écran.
- Compteur `Sources OK` rendu plus robuste pendant et après Livecheck.
- V0.4 conserve le verrou : pas de source live, pas de prix.


---

## Changelog V0.5

Objectif : passage en mode cockpit dense.

- Titre réduit encore fortement.
- Interface générale descendue d’un cran typographique.
- Header plus bas.
- Boutons, nav, cards et ticker compactés.
- Tableau et panneaux plus denses.
- Premier écran conçu pour montrer immédiatement métriques + lecture froide + verrou.
- Aucune modification du principe live : pas de source live, pas de prix.


---

## Changelog V0.6

Objectif : ultra-compact.

- Titre `Agent-Crypto @erith.IA` sur une seule ligne.
- Header encore réduit.
- Navigation et boutons réduits.
- Cards marché plus basses.
- Tableau plus dense.
- Score mathématique plus petit.
- Plus de contenu exploitable visible dès le haut de page.
- Verrou anti-hallucination inchangé.


---

## Changelog V0.7

Objectif : correction réelle du titre et passage terminal compact.

- Le titre est maintenant une vraie ligne HTML : `Agent-Crypto @erith.IA`.
- Suppression de la structure visuelle qui forçait `@erith.IA` à passer dessous.
- Échelle générale fortement réduite.
- Header compressé.
- Dashboard-first : plus de tableau et de contenu utile visible rapidement.
- Verrou anti-hallucination inchangé.


---

## Changelog V0.8

Objectif : arrêter la boucle design et corriger les vrais défauts fonctionnels.

- Ticker rendu lisible avec éléments séparés :
  symbole, prix, variation, couleurs distinctes.
- Tableau marché corrigé :
  après Livecheck OK, les lignes CoinGecko doivent apparaître.
- Score Observation corrigé :
  après Livecheck OK, le premier actif chargé est scoré.
- Lecture froide corrigée :
  elle passe en mode live quand une source réelle est active.
- Aucun changement de règle :
  pas de source live, pas de prix.


---

## Changelog V0.9

Objectif : micro-correction après validation de la V0.8.

- Correction du champ `Décision tableau` :
  il passe maintenant bien à `Autorisé · source réelle` après Livecheck OK.
- Le ticker garde un temps d’arrêt au départ pour éviter d’être coupé à gauche.
- Aucun changement dans `archives_yohan/`.
- Recommandation : ne plus mettre à jour `archives_yohan/` à chaque version.
  Ce dossier doit rester une archive historique figée.


---

## V1.0-RC1 — Version candidate stabilisée

Cette version regroupe les corrections utiles sans toucher aux archives historiques.

### Inclus

- Titre sur une ligne : `Agent-Crypto @erith.IA`.
- Interface compacte de type cockpit.
- Livecheck multi-sources.
- CoinGecko comme source marché principale.
- Tableau marché actif après Livecheck OK.
- Score Observation actif après récupération des données.
- Ticker lisible avec couleurs distinctes.
- Lecture froide synchronisée avec l’état live.
- Décision tableau synchronisée entre header et panneau sources.
- Dossier `archives_yohan/` laissé figé.

### Règle inchangée

```text
Pas de source live, pas de prix.
Pas de données récupérées, pas de tableau chiffré.
Pas de tableau fictif.
```


---

## V1.0-RC3 — Mode Débutant + Mode Avancé

Objectif : rendre le cockpit compréhensible sans supprimer les données utiles.

### Ajouts

- Panneau `Mode Débutant`.
- Panneau `Mode Avancé` repliable.
- Explication simple des métriques :
  capitalisation, volume 24h, dominance BTC, score de veille.
- Classification des actifs :
  pilier marché, stablecoin, altcoin majeur, altcoin, token spéculatif.
- Décisions plus simples :
  observer, vérifier, repère marché, surveillance stabilité, risque élevé.
- Bloc “Pourquoi cette décision ?” dans le score.
- Les données avancées restent disponibles.

### Règle inchangée

```text
Pas de source live, pas de prix.
Pas de données récupérées, pas de tableau chiffré.
Pas de tableau fictif.
```


---

## V1.0-RC4 — Avancé visible + cache stable

Objectif : garder la puissance visible et éviter les mélanges de fichiers en cache.

### Correctifs

- `style.css` chargé avec cache-buster `?v=1.0-rc4`.
- `app.js` chargé avec cache-buster `?v=1.0-rc4`.
- Mode Avancé visible par défaut.
- Bouton renommé `Masquer avancé`.
- Toggle avancé rendu plus robuste.

### Règle

Débutant crypto ne veut pas dire débutant informatique.
La version RC4 garde le cockpit avancé visible.


---

## V1.0-RC5 — Graphiques analyste

Objectif : ajouter une couche visuelle inspirée des grands tableaux crypto, sans transformer l’outil en clone de site financier.

### Ajouts

- Panneau `Graphique Analyste`.
- Sélection d’un actif depuis le tableau.
- Périodes : 24h / 7j / 30j.
- Graphique principal sur canvas.
- Mini-graphique par ligne du tableau.
- Panneau détail actif :
  prix, type, décision, ratio volume/market cap, variation 24h/7j.
- Conservation du mode Débutant et du mode Avancé.

### Règle

Les graphiques aident à observer. Ils ne donnent pas de conseil d’achat.
