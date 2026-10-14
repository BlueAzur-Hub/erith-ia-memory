# Seven Heaven — Publication Frontend légère et Coffre indépendant
Les mises à jour du Trader étaient de petits CLEAN_UPLOAD (<1 Mo). GitHub Pages republiait simultanément les énormes archives du Coffre. Ce sont trois objets distincts : patch, frontend, données.

## Candidat PR #388
- Le constructeur tools/build-runtime-pages.py crée le frontend HTML/CSS/JS sans le dossier data, les JSONL, archives gz/ZIP, anciennes pages HTML ou grandes images racine assets/images.
- Le module public/agent_crypto_erith_ia/web/vault-data-router.js est chargé avant les scripts actifs par chaque page Crypto publiée. Uniquement les fetch GET/HEAD sur le chemin DATA public de Pages sont envoyés vers les mêmes fichiers du dépôt public sur raw.githubusercontent.com. Bridge OKX et ordres non affectés. Les contrôles SHA et OHLCV des lecteurs demeurent.
- Les images de luxe dans assets/images restent inchangées sur le dépôt Git; leurs URLs racine sont remplacées dans le build, avec téléchargement à la demande depuis Raw.
- Le workflow GitHub Actions filtre les pushes main. Si un commit modifie seulement public/agent_crypto_erith_ia/data/**, ce workflow ne tourne pas.
- La publication est verrouillée jusqu'au réglage de Source Pages sur GitHub Actions ET variable dépôt AGENT_CRYPTO_RUNTIME_PAGES_ENABLED=true.

## Prudence et recette
- La PR ne modifie pas main. Rien dans le Coffre Oracle n'est supprimé. Market Core 38.15.11 et compte privé OKX conservés.
- Vérifier CORS et lecture effective sur Firefox pour R9, Univers, BTC, CT et Q ; conserver SHA-256 et prix non inventés.
- Un routeur fetch ne capture pas les téléchargements directs via balise lien, XMLHttpRequest ou WebSockets ; examiner les usages avant bascule.
- Tester LT AUTO/AUBE/JOUR/SOIR/NUIT/LUNE/RND, F11, fonds de graphique, compte OKX privé CT/USDC et graphique public CT/USDT.
- Ensuite fusionner après recette, changer Pages Source=Actions et autoriser le workflow; rollback possible vers ancienne source.

Le pipeline actuel reste en vigueur jusqu'au changement explicite de la source Pages. Le nouveau workflow, seul, ne désactive pas l'ancien.