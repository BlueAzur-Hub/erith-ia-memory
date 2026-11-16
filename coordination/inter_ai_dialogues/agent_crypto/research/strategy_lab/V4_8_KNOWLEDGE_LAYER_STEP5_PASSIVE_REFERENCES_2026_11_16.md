# Seven Heaven Strategy Lab — V4.8 Knowledge Layer Step 5 — Références passives — 2026-11-16

## Statut

**DEV construite · réception Firefox propriétaire en attente.**

Parent direct validé visuellement par le propriétaire :
- `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_HELP_LAYER_V1_GLOBAL_DEV.zip`
- SHA-256 : `3ff751bba56b84ebd2efa202a4df4beff19829968a5037a44159f7841ef50399`

Paquet Step 5 :
- `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP5_PASSIVE_REFERENCES_DEV.zip`
- SHA-256 : `8871321dde43f22271740e6355cec11235aee0478ca86047e90de549cc0457ca`

## But

Compléter la Knowledge Layer avant toute nouvelle stratégie technique en documentant les références déjà utilisées par le Comparateur :

- DCA programmé ;
- Buy & Hold 50 % BTC ;
- Buy & Hold 100 % BTC ;
- Conservation USDC.

La couche explique ce que chaque référence mesure réellement, son contrat Seven exact, ses limites et la manière correcte de l'utiliser comme baseline.

## DCA — contrat Seven exact

Le formulaire exprime l'intervalle en **minutes**. `src/observatory.py` convertit cette durée en un nombre entier de bougies selon le timeframe actif avec un arrondi supérieur avant l'appel au moteur.

Le moteur PAPER :
- achète à l'ouverture de la première bougie active ;
- répète l'achat selon l'intervalle converti en bougies ;
- applique les frais et le glissement configurés ;
- ne vend pas automatiquement la position DCA ;
- valorise l'inventaire restant à la dernière clôture pour la valeur finale.

La fiche ne présente donc pas le DCA comme une promesse de gain ni comme une stratégie d'entrée/sortie symétrique.

## Buy & Hold — contrats Seven exacts

### Buy & Hold 50 %

- une seule entrée PAPER au début de la fenêtre active ;
- cible environ 50 % du capital initial en BTC ;
- le solde reste en cash ;
- aucune vente automatique ;
- inventaire final valorisé à la dernière clôture.

### Buy & Hold 100 %

- une seule entrée PAPER au début de la fenêtre active ;
- utilise le capital disponible pour acheter du BTC, sous réserve des frais et arrondis ;
- aucune vente automatique ;
- inventaire final valorisé à la dernière clôture.

Les deux variantes sont des **références de comparaison**, pas des recommandations.

## Conservation USDC

- zéro ordre PAPER ;
- zéro fill ;
- zéro frais de trading ou glissement dans le modèle ;
- capital nominal conservé comme baseline.

Le modèle ne prétend pas simuler rendement monétaire, inflation, risque stablecoin, risque de contrepartie ou risque opérationnel externe.

## Interface

Un unique panneau professionnel réutilisable `#passive-knowledge-panel` sert les quatre références afin d'éviter quatre gros blocs concurrents.

Chaque fiche contient :
- rôle dans le Comparateur ;
- mécanique ;
- lecture ;
- paramètres ;
- forces ;
- limites ;
- contrat exact du moteur Seven ;
- questions à poser avant de conclure ;
- références ;
- actions pour préparer, comparer et retrouver les résultats.

Le Help Layer V1 global reste l'unique système d'aide `?`.

## Fichiers DEV modifiés

- `src/strategy_knowledge.py`
- `web/index.html`
- `web/app.js`
- `web/styles.css`
- `web/lab-help-layer.js`
- `README_FR.md`
- tests V4.8 correspondants

## Moteur protégé

`src/engine.py` reste inchangé.

SHA-256 :
`f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

Aucun ordre réel, aucune clé API, aucun secret, aucune donnée privée `workspace/`.

## Recette

- **137 / 137 tests Python : PASS**
- `node --check web/app.js` : PASS
- `node --check web/lab-help-layer.js` : PASS
- ZIP réextrait puis retesté : PASS
- archive distribuée : aucun `workspace/`, aucun `__pycache__`, aucun `.pyc/.pyo`

### Recette UI automatisée

Un environnement Chromium système a exécuté la vraie page HTML/CSS/JS dans un DOM automatisé, avec réponses API mockées à partir du backend local réel :

- clic réel sur le `?` global ;
- Help Layer visible et changement de cible ;
- ouverture réelle des fiches DCA, Hold 50 %, Hold 100 % et Cash ;
- préparation DCA dans l'Atelier sans lancement de simulation ;
- console JavaScript propre ;
- aucune exception page.

Limite : la navigation Playwright directe vers localhost est bloquée par la politique de l'environnement, et l'exécutable Firefox Playwright n'est pas installé ; son téléchargement a échoué faute de résolution réseau vers le CDN. **La réception Firefox Windows du propriétaire reste donc un gate distinct.**

## Sources générales utilisées

Les définitions générales du DCA et des approches passives ont été recoupées avec Investor.gov et FINRA. Elles servent au contexte pédagogique ; le comportement exact affiché dans le Lab vient toujours du moteur Seven réellement audité.

## Gate suivant

1. réception visuelle et fonctionnelle du Step 5 dans Firefox par le propriétaire ;
2. si accepté : ouvrir le chantier **historiques longs + multi-actifs** ;
3. ne pas ajouter MACD/SuperTrend automatiquement avant ce gate ;
4. ne pas transformer cette DEV en release stable sans réception et décision explicites.
