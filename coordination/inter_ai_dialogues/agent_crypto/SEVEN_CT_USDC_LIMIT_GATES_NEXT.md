# Seven Heaven — CT/USDC : prochaine étape des contrôles LIMIT

**20 octobre 2026 · Mission suivante après R24 / PR #549.**
**Statut :** contrat de travail documentaire, **aucun changement logiciel** dans ce document ; ni clé, ni solde, ni numéro de compte.

## Point de départ certifié par l'utilisateur

- Aether Control R24 / Bridge 1.9.18 / Backend 1.4.6 démarrés dans Windows.
- La capture/relevé Firefox 23 h 12 montre le ticket PAPER `CT-USDC` alimenté par le Bridge, avec `feeType=0` lu à 21:12:08Z : les frais **d'achat** CT/USDC sont débités en **CT** selon la configuration actuelle.
- Le Trader calcule déjà `minSz`, `lotSz`, `tickSz` et simule les frais. **Aucun ordre réel.**
- Ne pas changer le mode des frais : l'utilisateur souhaite examiner l'option manuellement dans l'interface OKX.

## Découverte OKX officielle : instrument / quote variables selon le compte

La migration des paires Spot USD/USDC a été documentée par OKX au 30 septembre 2026. Les réponses doivent garder l'identité du marché exact, et le support d'une quote éventuelle `tradeQuoteCcy` doit être contrôlé **pour le compte**, sans déduire un droit de négociation de la seule API publique.

1. **GET /api/v5/account/instruments?instType=SPOT** — privé **Read**. Qualifier `CT-USDC` pour ce compte et le cas échéant `tradeQuoteCcyList`. Une paire visible publiquement n'est pas nécessairement négociable par ce compte.
2. **GET /api/v5/account/max-avail-size?instId=CT-USDC&tdMode=cash** — privé **Read**. Pour une paire Spot, `availBuy` est en **USDC** (quote) ; `availSell` est en **CT** (base). Vérifier exactitude de la paire, mode cash, horodatage/fraîcheur. Ne pas confondre avec Funding et ne pas valider les réservations futures.
3. **GET /api/v5/account/max-size?instId=CT-USDC&tdMode=cash** — privé **Read** si nécessaire pour la limite propre au compte. Distinguer `maxBuy` et `maxSell` (quantités et unités selon spécification).
4. **GET /api/v5/public/instruments?instType=SPOT&instId=CT-USDC** — public. Déjà utilisé : étendre les contrôles à `maxLmtSz` et `maxLmtAmt` **lorsque renseignés**. `maxLmtAmt` est en USD : ne pas comparer directement au coût USDC sans conversion attestée. `state=live` nécessaire mais non suffisant.
5. **GET /api/v5/public/price-limit?instId=CT-USDC** — public. Recueillir les limites de prix calculées par OKX, avec identité exacte et fraîcheur, au lieu de déduire les bandes des seuls `tickSz` et pourcentages d'instrument. Une borne absente ne vaut pas absence de restriction.

**Sources officielles :**
- https://www.okx.com/docs-v5/en/ (Account: Get instruments / Get max available tradable amount / Get max order size ; Public: Get instruments / Get price limit).
- https://www.okx.com/docs-v5/trick_en/ (availBuy en quote, availSell en base pour Spot).
- https://www.okx.com/docs-v5/log_en/ (migration USD/USDC du 30/09/2026, évolution des limites de prix du 30/06/2026).

## Règles de production pour le prochain chantier

- Construire un **petit endpoint Bridge GET owner-only** retournant seulement des booléens de preuve et les champs utiles, jamais les payloads de compte complets ni les tokens. Ne pas multiplier les requêtes automatiques ; lecture déclenchée par un clic humain sur le ticket PAPER.
- La permission de la clé OKX doit rester **Read**. **Aucun** POST `/api/v5/trade/order`, `order-precheck` ou `set-fee-type`; pas de capacité Trade ajoutée.
- En cas de route absente, paire autre que CT-USDC, donnée future/ancienne, quantités non décimales, règle manquante ou réponse ambiguë, afficher **NON CERTIFIÉ**, ne jamais marquer l'ordre « exécutable ».
- Le ticket peut afficher **« contraintes vérifiées pour cette simulation datée »**, jamais « ordre garanti ». Le carnet est indicatif, un ordre limite peut être non exécuté.
- Préserver la séparation `CT-USDT` (graphique externe, affichage USD) / `CT-USDC` (instrument du ticket Spot). Aucun prix CT/USDT ne doit tarifer l'ordre CT/USDC.
- Isoler un changement par PR ; tests négatifs obligatoires ; workflows verts puis recette Firefox. Bridge R24 et Trader 40.6.640 doivent rester utilisables pendant la préparation.

## Résultat opérationnel attendu pour la prochaine étape

Sur une seule étude CT/USDC en lecture seule, afficher : instrument autorisé **pour le compte** ou non confirmé ; `availBuy` et `availSell` (avec unités distinctes) ; taille et prix conformes aux filtres connus ou non confirmés ; frais d'achat CT selon la lecture `feeType=0` tant qu'aucun nouveau relevé ne le contredit ; **AUCUN ORDRE POSSIBLE**.

**Point d'arrêt de cette note :** recherche et périmètre définis ; ni R25 ni nouvelle version du Trader livrés dans ce document.
