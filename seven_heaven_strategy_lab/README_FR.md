# Seven Heaven Strategy Lab — V3 Connected OKX Spot Observatory

**Version 3.0.0 · Windows Python 3.13 · Port 8777 en local · Public Internet autorisé · PAPER uniquement.**

La V3 conserve intégralement le cockpit premium de la V2 (bleu nuit, or et cyan) et ajoute une **vraie source publique OKX Spot**. L'objectif est de commencer à étudier des données plus récentes avec un suivi transparent des dates, instruments, frais, volumes et preuves SHA-256, sans employer d'API privée et sans ordre réel.

## Ce qui est réellement disponible dans cette V3

- L'archive Binance Spot **BTC/USDT de janvier 2026**, ses 44 640 bougies 1m, ses profils et résultats V1/V2 restent inchangés dans `workspace/`.
- Un nouvel encadré **Observatoire connecté OKX Spot** propose **BTC/USDC, ETH/USDC, BTC/USDT et ETH/USDT**. Ce sont des paires Spot explicites ; ce n'est pas un contrat de dérivés.
- Un clic sur **Collecter 240 bougies 1h OKX** interroge directement **les deux API publiques officielles** :
  - `GET https://www.okx.com/api/v5/public/instruments?instType=SPOT&instId=BTC-USDC` (règles courantes, `state`, `tickSz`, `lotSz`, `minSz` ; exemple de paire).
  - `GET https://www.okx.com/api/v5/market/history-candles?instId=BTC-USDC&bar=1H&limit=100`, puis pagination bornée `after` pour récupérer les bougies plus anciennes.
- Le module conserve **240 bougies de 1 heure strictement clôturées et continues**, soit dix jours UTC complets se terminant à la dernière frontière 4h UTC (le dernier horaire peut ainsi dater de 0–4 heures). Les bougies en formation `confirm=0`, trous/duplicates, réponses non conformes ou marchés suspendus font échouer l'import. **Aucun prix n'est inventé pour compléter un trou.**
- Les prix sont conservés dans `workspace/okx_sources/` avec manifeste indépendant : paire, source, intervalle, UTC, règles au moment de la collecte, empreinte SHA-256, date de capture et date de fin. Nouvelle collecte seulement sur demande ; un cache vérifié identique est réutilisé.
- Le sélecteur **Source pour les prochaines simulations** permet de revenir à la référence Binance V1/V2 ou de choisir une archive OKX déjà conservée. Pour OKX 1h, les simulations autorisées sont **1h ou 4h** (60 bougies 4h à partir des 240 bougies horaires). Aucun lissage artificiel en 1m/5m/15m.
- Les six méthodes internes (EMA, Bollinger, DCA, Hold 50/100 %, Cash), frais et glissement sont calculées sur **la même paire, la même source et le même intervalle** ; les rapports JSON portent l'identifiant exact et le SHA de la source. Le cockpit affiche correctement **BTC ou ETH** pour l'inventaire et **USDC ou USDT** pour le capital/frais.
- Le moteur reste **notre simulateur PAPER interne**. Les règles actuelles OKX `tickSz/lotSz/minSz` sont **observées et conservées comme métadonnées**, mais NE SONT PAS ENCORE APPLIQUÉES aux fills fictifs de cette version. Les frais `0,10 %` Taker sont l'hypothèse observée par le propriétaire à sa date de capture, **pas** une facture historique OKX prouvée. Les positions fictives sont remplies entièrement à l'ouverture de la bougie suivante ; elles ne représentent pas un historique réel du carnet.
- Aucun moteur natif Freqtrade/Hummingbot n'est encore intégré à la V3. Les travaux indépendants de ce type resteront distincts jusqu'à preuve d'exécution et de comparaison des règles.
- L'import d'une nouvelle archive est **refusé si la clé a moins de 2,5 Go libres**, pour protéger l'espace réservé aux fichiers Markdown et archives privées du propriétaire. Un cache déjà validé peut toujours être relu lorsque le disque descend sous cette réserve ; le programme ne supprime rien. Pour des importations plus lourdes, utiliser la clé 32 Go disponible après sauvegarde.

### Important sur la distinction « local / Internet / ordres »

Le serveur du cockpit écoute seulement `http://127.0.0.1:8777`, les requêtes des pages passent par ce serveur local, et ce serveur Python peut **sortir vers les API publiques OKX** lors d'un clic. Aucune clé API OKX, compte, portefeuille, mot de passe ni ordre réel ne sont nécessaires. Les résultats ne deviennent jamais de vrais achats/ventes.

## Mise à niveau sur la clé USB depuis la V2 déjà testée

1. Fermer la fenêtre noire `Seven Heaven Strategy Lab` (Ctrl+C), puis garder la clé branchée.
2. Copier `E:\seven_heaven_strategy_lab\workspace\` vers **une sauvegarde distincte**, avant d'écraser les fichiers du programme.
3. Télécharger le **ZIP V3**, décompresser, copier le contenu du dossier `seven_heaven_strategy_lab` **sur le contenu de `E:\seven_heaven_strategy_lab\`** en remplaçant ses fichiers, **sans supprimer `workspace\`**. Ne pas créer involontairement un dossier `seven_heaven_strategy_lab\seven_heaven_strategy_lab`.
4. Double-cliquer sur `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`. Python 3.13 existant suffit ; Docker reste facultatif.
5. Ouvrir `http://127.0.0.1:8777` : vérifier `BUILD 3.0.0` et l'ancienne archive Binance **AUTHENTIFIÉE**. Les rapports V1/V2 doivent rester disponibles dans le Coffre.
6. Dans **Observatoire connecté**, choisir `BTC/USDC` puis cliquer sur **Collecter 240 bougies 1h OKX**. Vérifier la source sélectionnée et le décompte disponible, puis tester le comparateur en **1h**, sans aucune action de trading.
7. Si le programme affiche une erreur réseau, un échec de continuité ou un espace USB inférieur à la réserve, **conserver l'erreur** : les archives V1/V2 ne sont pas détruites, et aucun ordre n'est envoyé.

## Provenance, contrôles et limitations

- Documentation API publique officielle : https://www.okx.com/docs-v5/en/ .
- Seuls les endpoints `public/instruments` et `market/history-candles` sont accessibles par le collecteur. Les noms des paires sont dans une liste fixe et les liens ne sont pas fournis par l'utilisateur.
- Pagination maximale : **6 pages × 100 bougies**, taille maximale par réponse **850 ko**, délai d'une requête **16 secondes** ; collecte contrôlée au clic uniquement, sans boucle permanente.
- Les archives OKX sont vérifiées à chaque utilisation (SHA, 240 bougies, horodatage strictement horaire, continuité, intervalle UTC, actif et devise).
- La V3 n'a pas encore d'interface pour sélectionner des dates historiques arbitraires, plusieurs mois ou une source carnet actualisée en continu. Ce sont des versions suivantes, après tests en vrai navigateur.
- L'API OKX peut être indisponible temporairement ou selon la région ; le laboratoire n'invente pas un prix pour masquer une erreur.
- Windows Firefox sur la clé du propriétaire doit faire l'objet d'une validation distincte après publication. Les tests GitHub et Chromium sont des preuves techniques, **pas** un test déjà effectué sur son PC.
- Aucune garantie de gain, pas de conseil d'investissement, pas de trading réel.

## Historique V1/V2 et architecture détaillée

Les détails historiques V2, les paramètres de la simulation de référence, la recette et la feuille de route sont conservés ici :
https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON_WINDOWS_USB_RELEASE_AND_NEXT_PHASES_2026_11_13.md

Le plan professionnel complet et les intentions V4/V5 Hummingbot/Freqtrade demeurent dans :
https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_MASTER_ARCHITECTURE_PROFESSIONAL_BOTS_USB_STORAGE_VERSIONED_ROADMAP_2026_11_13.md

### Anciennes livraisons maintenues

- V1 : https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13
- V2 : https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13

**Les dossiers `workspace/` ne sont inclus dans aucune de ces archives de programme. Ce sont les données et résultats personnels de l'utilisateur.**
