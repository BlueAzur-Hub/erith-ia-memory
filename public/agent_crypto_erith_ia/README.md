# Agent-Crypto @erith.IA

Version : V1.1-alpha  
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
├── archives_historiques/
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
- Aucun changement dans `archives_historiques/`.
- Recommandation : ne plus mettre à jour `archives_historiques/` à chaque version.
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
- Dossier `archives_historiques/` laissé figé.

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


---

## V1.0-RC6 — Correction affichage graphiques

Objectif : corriger RC5, où le bloc graphique existait mais le JavaScript ne pilotait pas encore correctement le canvas et le détail actif.

### Correctifs

- Graphique principal rendu immédiatement après Livecheck.
- Fallback visuel immédiat pour éviter un panneau vide.
- Chargement CoinGecko historique quand disponible.
- Détail actif rempli après Livecheck.
- Clic sur une ligne du tableau = graphique + détail + score mis à jour.
- Périodes 24h / 7j / 30j actives.
- Colonne mini-graph dans le tableau.


---

## V1.0-RC7 — Libellés sources clarifiés

Objectif : supprimer l’ambiguïté entre sources réussies et sources interrogées.

### Correction

Avant :

```text
Sources OK : 6/7
7/7 testées
```

Après :

```text
Sources réussies : 6/7
7/7 interrogées · 1 échec
```

### Verrou anti-hallucination

Le bloc anti-hallucination devient dynamique :

- si Livecheck OK : il indique la source active et les limites ;
- si Livecheck échoue : il bloque prix, tableau et score fiable.


---

## V1.0-RC8 — Redraw graphique 24h + sources lisibles

Objectif : corriger deux points d’ergonomie.

### Correctifs

- Le graphique 24h est redessiné automatiquement après Livecheck.
- Le canvas est recalculé après layout avec `requestAnimationFrame`.
- Le bouton 24h / 7j / 30j reste actif, mais n’est plus nécessaire pour déclencher le premier rendu.
- Les sources distinguent :
  - sources réussies ;
  - sources interrogées ;
  - échecs.
- Le rouge est expliqué : il signifie source marché principale indisponible, pas erreur utilisateur.


---

## V1.0-RC9 — Diagnostic sources + filtres/tri

Objectif : rendre visible la source exacte qui échoue et améliorer la navigation dans le tableau.

### Ajouts

- Panneau `Diagnostic sources` visible en haut.
- CoinGecko marqué comme source critique.
- Sources secondaires distinguées.
- État par source :
  - OK ;
  - ÉCHEC ;
  - en attente ;
  - temps de réponse ;
  - détail.
- Explication claire :
  si CoinGecko échoue, le tableau reste bloqué même si des sources secondaires répondent.
- Filtres du tableau :
  - Tous ;
  - BTC / ETH ;
  - Stablecoins ;
  - Altcoins majeurs ;
  - Spéculatifs.
- Tri du tableau :
  - rang marché ;
  - score ;
  - volume ;
  - hausse 24h ;
  - baisse 24h ;
  - ratio volume / market cap.


---

## V1.0-RC10 — Diagnostic sources replacé en bas

Objectif : respecter l’ergonomie validée.

### Changement

- Suppression du bloc `Diagnostic sources` en haut.
- Conservation du diagnostic détaillé dans le panneau `Live Sources` en bas.
- Ajout d’une note courte en bas :
  CoinGecko est critique pour autoriser tableau, prix et graphiques.
- Navigation supérieure allégée : suppression du bouton `Diagnostic`.

### Raison

Le diagnostic existait déjà en bas et y était plus lisible. RC9 le dupliquait inutilement en haut.


---

## V1.0-RC11 — Crypto Command Layer

Objectif : préparer une couche de commandes IA propre, inspirée des architectures CLI/API, sans exposer de clés privées et sans trading réel.

### Commandes ajoutées

```text
help
market_snapshot
asset BTC
chart ETH 7d
compare BTC ETH
sources
category USDT
risk SOL
```

### Règles de sécurité

```text
Aucun buy.
Aucun sell.
Aucun order.
Aucun withdraw.
Aucune clé privée dans GitHub Pages.
Aucun wallet réel dans le frontend public.
```

### Rôle

Cette couche prépare une future intégration Kraken / Bybit / Binance via backend sécurisé, dry-run, logs, limites et validation humaine.


---

## V1.0-RC12 — Kraken / Bybit / News / accès distant

Objectif : intégrer le cadrage confirmé par opérateur autorisé sans passer au trading réel.

### Décisions ajoutées

```text
Kraken = référence wallet / compte / sécurité.
Bybit = référence API trading à comparer.
Binance = inspiration command layer / données marché.
Mode = semi-automatique avec validation humaine.
Simulation avant argent réel = obligatoire.
Accès distant = réservé à 2 opérateurs autorisés, hors GitHub Pages.
```

### Ajouts UI

- Section `Exchange & Wallet Plan`.
- Section `Accès déporté`.
- Section `News Sentinel — références`.
- Phases : Observer → Commander → Simuler → Valider humain → Réel verrouillé.

### Commandes IA ajoutées

```text
planning
exchange_plan
news_sources
```

### Sécurité

```text
Aucune clé privée dans GitHub Pages.
Aucune clé de retrait.
Aucun ordre réel.
Backend sécurisé requis pour la suite.
```


---

## V1.0-RC13 — Paper Trading Sandbox

Objectif : préparer les futures micro-transactions en mode simulation uniquement.

### Ajouts

- Section `Paper Trading Sandbox`.
- Capital virtuel local : 1000 €.
- Simulation achat / vente.
- Portefeuille virtuel stocké en localStorage.
- Journal de simulation.
- P/L virtuel.
- Commandes IA :
  - `sim_buy BTC 25`
  - `sim_sell BTC 10`
  - `portfolio`
  - `reset_sim`

### Verrous

```text
Aucun ordre réel.
Aucun wallet réel.
Aucune clé API.
Aucune clé de retrait.
Simulation locale seulement.
```


---

## V1.0-RC14 — Safety Control Room

Objectif : intégrer le cadrage sécurité confirmé par opérateur autorisé.

### Ajouts

- Section `Safety Control Room`.
- Bac à sable obligatoire.
- Accès renforcé : 2 opérateurs autorisés uniquement.
- Clés API : lecture seule d’abord, aucune clé de retrait.
- Kill switch préparatoire.
- Gates de progression :
  - G1 Observatoire public ;
  - G2 Command Layer ;
  - G3 Paper trading ;
  - G4 Lecture seule Kraken ;
  - G5 Semi-auto humain ;
  - G6 Réel micro verrouillé.
- Commandes IA :
  - `safety_plan`
  - `kill_switch`
  - `access_plan`
  - `gates`

### Verrou

GitHub Pages reste observation + simulation. L’accès distant réel et les clés exchange exigent un backend sécurisé hors dépôt public.


---

## V1.0-RC15 — Backend Blueprint

Objectif : séparer clairement public, privé, simulation et futur Kraken.

### Ajouts

- Section `Backend Blueprint`.
- Diagramme :
  - Public : GitHub Pages ;
  - Privé : machine privée / backend local ;
  - Exchange : Kraken d’abord.
- Règles de séparation :
  - aucune clé dans GitHub Pages ;
  - aucun ordre réel depuis frontend ;
  - clés et logs seulement côté backend privé ;
  - accès 2 opérateurs autorisés uniquement.
- Gates backend :
  - B1 Plan public/privé ;
  - B2 Backend local ;
  - B3 Kraken lecture seule ;
  - B4 Logs + kill switch ;
  - B5 Simulation serveur ;
  - B6 Réel humain.
- Commandes IA :
  - `backend_blueprint`
  - `kraken_readonly_plan`
  - `remote_blueprint`
  - `security_review`

### Prochaine étape

`RC16 — Kraken Read-Only Plan`, sans ordre réel.


---

## V1.0-RC16 — Command Output Humain

Objectif : rendre les commandes IA compréhensibles sans devoir lire le détail technique brut.

### Problème

Les commandes `backend_blueprint` et `security_review` fonctionnaient, mais l’interface affichait surtout du détail technique brut. Résultat : l’utilisateur pouvait croire que rien ne s’était passé.

### Ajouts

- Bloc `Lecture humaine` au-dessus du détail technique brut.
- Résumé clair par commande :
  - `backend_blueprint`
  - `security_review`
  - `kraken_readonly_plan`
  - `remote_blueprint`
  - `market_snapshot`
  - `asset`
  - `chart`
  - `portfolio`
  - `sources`
- Le détail technique brut reste affiché dessous pour contrôle technique masqué.

### Règle

Aucune fonction dangereuse ajoutée.
Aucun ordre réel.
Aucune clé privée.


---

## V1.0-RC17 — Commandes humaines FR

Objectif : supprimer la confusion autour des commandes techniques comme `backend_blueprint`.

### Changement principal

Les boutons affichent maintenant des noms humains :

```text
Plan architecture
Contrôle sécurité
Plan Kraken lecture seule
Portefeuille virtuel
Résumé marché
Sources info
```

Les commandes techniques restent dans `data-command` et dans le détail technique brut pour opérateur autorisé, mais l’utilisateur n’a plus besoin de les comprendre.

### Ajouts

- Aide visible : “Clique sur un bouton en français”.
- détail technique brut replié sous `Afficher le détail technique brut`.
- Résumé humain conservé au-dessus.
- Alias français :
  - `Plan architecture`
  - `Contrôle sécurité`
  - `Plan Kraken`
  - `Résumé marché`

### Règle

Aucune fonction dangereuse ajoutée.
Aucun ordre réel.
Aucune clé privée.


---

## V1.0-RC18 — Mode humain simple

Objectif : rendre la zone Commandes IA compréhensible pour un utilisateur non développeur.

### Problème

Même avec les boutons français, la présence d’une ligne de commande et du détail technique brut restait trop technique.

### Corrections

- `Commandes IA contrôlées` devient `Tests simples de l’assistante`.
- Ajout d’un guide en 4 blocs :
  - clique un bouton ;
  - lis la carte verte ;
  - ignore le détail technique brut ;
  - rien ne peut acheter/vendre ici.
- L’entrée manuelle est repliée dans `Entrée manuelle avancée`.
- Le détail technique brut reste replié.
- Le bloc humain s’affiche par défaut avec une aide simple.

### Règle

Aucune fonction dangereuse ajoutée.
Aucun ordre réel.
Aucune clé privée.


---

## V1.0-RC19 — Zéro nominatif + zéro détail technique brut visible

Objectif : corriger deux points :

- pas de prénom dans l’interface publique ;
- pas de détail technique brut comme lecture normale.

### Corrections

- Remplacement des noms par `2 opérateurs autorisés`.
- Remplacement des mentions de machine personnelle par `machine privée`.
- Suppression de l’affichage brut technique dans l’interface.
- La carte humaine devient la seule lecture normale.

### Règle

L’interface publique ne doit pas afficher de noms personnels.
L’utilisateur lit uniquement la carte humaine.
Aucun ordre réel.
Aucune clé privée.


---

## V1.0-RC20 — Impact concret + Physical Security Layer

Objectif : rendre visible l’impact réel de l’app et intégrer la piste Ledger / sécurité physique sans confusion.

### Ajouts

- Section `Impact concret`.
- Section `Physical Security Layer`.
- Explication claire :
  - ce qui est déjà actif ;
  - ce qui n’est pas encore actif ;
  - ce qui reste verrouillé.
- Clarification Ledger :
  - Ledger = coffre matériel / wallet froid / validation physique possible ;
  - Kraken = exchange de référence ;
  - backend privé = future couche de connexion sécurisée ;
  - IA = observation et simulation seulement.

### Verrou

Aucun wallet réel connecté.
Aucune clé privée.
Aucune clé de retrait.
Aucun ordre réel.


---

## V1.0-RC21 — Briefing terrain / infos à collecter

Objectif : préparer la prochaine session de clarification sans créer de risque technique.

### Ajouts

- Section `Briefing terrain`.
- Questions à poser :
  - objectif exact ;
  - cryptos prioritaires ;
  - risques interdits ;
  - sources d’information ;
  - machine privée ;
  - accès renforcé ;
  - validation humaine.
- Liste `À ne pas faire`.
- Commandes humaines :
  - `Briefing session`
  - `Questions à poser`
  - `À ne pas faire`

### Règle

Pas de nom personnel dans l’interface.
Pas de clé réelle.
Pas de wallet réel.
Pas de trading réel.


---

## V1.0-RC22 — Situation & prochaines étapes

Objectif : donner une vue claire du projet après RC21.

### Ajouts

- Section `Situation du projet`.
- Synthèse :
  - actif maintenant ;
  - préparé seulement ;
  - verrouillé ;
  - prochaine vraie décision.
- Étapes visuelles :
  - Observatoire public ;
  - Lecture humaine ;
  - Simulation locale ;
  - Session infos ;
  - Backend privé ;
  - Kraken lecture seule ;
  - Réel verrouillé.
- Commandes humaines :
  - `Situation`
  - `Prochaines étapes`
  - `Limites`

### Règle

Pas de nom personnel dans l’interface publique.
Pas de clé réelle.
Pas de wallet réel.
Pas de trading réel.


---

## V1.0-RC23 — Questionnaire session

Objectif : transformer le briefing en fiche remplissable pendant la discussion.

### Ajouts

- Section `Questionnaire session`.
- Champs :
  - objectif de la session ;
  - cryptos prioritaires ;
  - montant virtuel de simulation ;
  - risques interdits ;
  - sources d’information ;
  - machine privée envisagée ;
  - accès renforcé ;
  - sécurité physique / wallet matériel.
- Sauvegarde locale navigateur.
- Génération d’une note de reprise.
- Effacement local.
- Commande :
  - `Questionnaire`

### Sécurité

Ne jamais saisir :
- seed phrase ;
- clé API réelle ;
- mot de passe ;
- information nominative ;
- wallet réel ;
- donnée de retrait.

Aucun trading réel.


---

## V1.0-RC24 — Audit GitHub cleanup

Objectif : corriger les traces vues après vérification du dépôt GitHub.

### Corrections

- Version visible portée à V1.0-RC24.
- Boutons techniques secondaires renommés :
  - `remote_blueprint` → `Plan accès distant`
  - `access_plan` → `Plan accès`
  - `gates` → `Étapes sécurité`
- Nettoyage des références internes trop nominatives dans les fichiers publics.
- Nettoyage des textes obsolètes :
  - mentions RC15 / RC22 résiduelles ;
  - `PC opérateur` remplacé par `machine privée` ;
  - libellés techniques rendus humains.
- Le manifeste ne liste plus les archives historiques nominatives.

### Règle

Aucun renommage destructif des archives historiques.
Aucun changement de trading.
Aucune clé réelle.
Aucun wallet réel.
Aucun ordre réel.


---

## V1.0-RC25 — Fix audit cleanup regression

Objectif : corriger une régression introduite par le nettoyage RC24.

### Corrections

- `backend-Étapes sécurité` restauré en `backend-gates`.
- `data-command="Plan accès distant"` restauré en commande interne stable.
- Les boutons restent lisibles :
  - `Plan accès distant`
  - `Plan accès`
  - `Étapes sécurité`
- Les titres visibles sont rendus plus humains :
  - `ARCHITECTURE PRIVÉE`
  - `SÉCURITÉ`

### Règle

Aucun changement financier.
Aucune clé réelle.
Aucun wallet réel.
Aucun ordre réel.


---

## V1.0-RC26 — Export note de reprise

Objectif : rendre la fiche de session exploitable hors interface.

### Ajouts

- Bouton `Copier la note`.
- Bouton `Télécharger .md`.
- Note générée au format Markdown propre.
- Rappel intégré :
  - aucune clé réelle ;
  - aucun wallet réel ;
  - aucun trading réel ;
  - aucune information nominative.

### Règle

La note exportée doit être relue avant partage.
Ne jamais y inscrire de seed phrase, clé API, mot de passe ou information personnelle.


---

## V1.0-RC27 — Hotfix export Markdown + Coinbase backend requis

Objectif : corriger deux vrais problèmes fonctionnels constatés en test.

### Corrections

- Export Markdown :
  - les `\n` visibles sont remplacés par de vrais retours ligne ;
  - les préfixes collés du type `Champ Objectif...` sont nettoyés dans l’export ;
  - la note `.md` redevient lisible pour un humain.

- Coinbase :
  - Coinbase n’est plus traité comme un échec réseau bloquant ;
  - Coinbase est classé `Backend requis` ;
  - le compteur de sources ne doit plus présenter Coinbase comme une panne utilisateur.

### Règle

Aucune clé réelle.
Aucun wallet réel.
Aucun ordre réel.
Aucun trading automatique.


---

## V1.1-alpha — Profil Solo Débutant 100 €

Objectif : passer de RC27 à un simulateur-école personnel adapté au profil débutant.

### Profil actif

- Capital virtuel : 100 €.
- Cryptos autorisées : BTC, ETH, SOL.
- Ticket conseillé : 5 €.
- Maximum par opération : 10 €.
- Exposition maximale : 30 €.
- Réserve minimale : 70 €.

### Nouvelles règles de refus

- Refus hors BTC / ETH / SOL.
- Refus au-dessus de 10 € par opération.
- Refus si l’exposition virtuelle dépasse 30 €.
- Refus si la réserve virtuelle descend sous 70 €.
- Livecheck obligatoire avant simulation.

### Sécurité maintenue

Aucune clé réelle.
Aucun wallet réel.
Aucun ordre réel.
Aucun trading automatique.
Aucun retrait.
