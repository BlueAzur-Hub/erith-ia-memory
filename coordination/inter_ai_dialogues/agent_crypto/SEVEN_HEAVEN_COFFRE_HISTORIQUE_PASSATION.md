# Seven Heaven — passation canonique du Coffre historique Crypto

**Clôture de fil : 10 octobre 2026.** Point vérifié directement sur GitHub `main`. Ce document est un relais pour une nouvelle IA ; il ne remplace pas les sources et doit être revérifié au prochain tour.

## A → état réel confirmé

- **107/250 identités avec ≥1 mois natif archivé**, sur l'index fédéré `public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json`.
- **104 Binance Spot USDT** dans le catalogue originel `top250_history_catalog/index.json`; les lecteurs stables `shared_monthly_views/index.json` et `shared_hourly_views/index.json` comptent toujours **104**, car ils restent volontairement spécifiques à Binance.
- **3 Bitget Spot USDT** séparées, **cosmos/ATOM**, **lighter/LIT** et **stable-2/STABLE**, un mois de septembre 2026 natif complet par actif (43 200 minutes chacun) ; projections `bitget_verified_views/index.json`. Pas de fausse colonne nombre de trades : Bitget a 7 champs natifs, Binance un autre format.
- **83 982 240 bougies natives d'une minute** dans le catalogue fédéré : 83 852 640 Binance (source cumulée avec deux mois supplémentaires pour BTC/ETH) + 129 600 Bitget. Aucun change USDT vers USD n'est sous-entendu.
- Le rapport `year_depth_index.json` certifie **80 actifs avec ≥12 mois contigus**, **25 avec ≥24 mois contigus** (périmètre Binance à 104). Une crypto comptant un mois n'est PAS un historique d'un an.
- `calendar_year_hourly_shards/index.json` : **2 actifs matérialisés en six blocs annuels**, Bitcoin et Ethereum (26 mois chacun, 2024–2026). Le reste doit être produit graduellement sans saturer GitHub/Firefox.
- Firefox : `administrator/historical-vault.html` existant conservé ; nouveau `administrator/historical-yearly.html` pour lire par année les blocs certifiés. Code en ligne, tests CI réussis ; **rendu visuel non personnellement certifié dans le Firefox de l'utilisateur**.
- Au dernier contrôle, les workflows **R11 Verified Partitions Publisher #38064211140**, **Multi-source Native 1m Coverage #38063925913**, **Federated Spot Views #38063887638**, et **GitHub Pages #38063942163** étaient SUCCESS.
- **PR #252 fusionnée** pour la fédération Bitget/Binance. **PR #253 fermée sans fusion** car elle dupliquait la fédération déjà livrée ; ne pas rouvrir une seconde table concurrente.
- **PR #251 fusionnée** : retour vers les historiques Binance plus anciens, deux mois supplémentaires de BTC/ETH 2024-06 et 2024-07. Ne jamais appeler ce point la date de création des monnaies.

## B → compréhension et invariants

L'ancien chiffre **104/250** est celui du **lecteur Binance**, pas le total fédéré. Le nouveau **107/250** veut seulement dire *au moins un mois authentique*. Le vrai indicateur pour la cible d'un an est **80**. Les jalons doivent être annoncés séparément.

Ne jamais confondre : date de création d'un token, première transaction en bourse, premier prix historiquement accessible et première archive locale. La première cotation n'est pas prouvée à ce jour. Pour un token âgé de moins de 12 mois, conserver **toute sa vie cotée disponible**, sans inventer de prix avant son lancement.

Garanties : CoinGecko ID exact + instrument Spot vérifié ; quote explicite USDT/USDC ; ZIP natif mensuel **intégral**, continuité UTC au pas de 1 minute, OHLCV exact, SHA-256 et origine ; refus des mois partiels, dédoublonnage, aucun remplissage synthétique. Le hash d'une archive Bitget générée depuis l'API est une intégrité de notre archivage, **pas une signature officielle de l'échange**.

Ne modifier ni Trader, ni Bridge, ni Market Core, ni vues R10 stabilisées pendant un chantier d'archives. N'ajouter aucun suffixe de version aux nouveaux noms de fichiers ou de fonctions. Tout commit doit être vérifié sur `main`, suivi de son workflow et si besoin Pages. La mémoire est dans GitHub/Notion, pas dans la personnalité de l'assistant.

## D → destination utilisateur NON NÉGOCIABLE

**250 cryptomonnaies avec historique de prix et chandelles d'au moins 1 an lorsque la cotation l'autorise, puis remontée jusqu'à la première cotation historiquement disponible. Étendre ensuite la même collecte robuste à 500, puis environ 1 000 actifs.**

Le travail est double : augmenter **la couverture du nombre d'actifs** et **la profondeur de chacun**. Ne pas privilégier une seule dimension et déclarer l'objectif atteint.

## Prochain ordre de travail recommandé à la sœur IA

1. **Vérifier GitHub actuel** : les cinq index ci-dessus, derniers runs/actions, Releases Bitget et états de publication. Vérifier que R11/partition fédérée reste à 107 ou qu'elle a avancé. Toujours calculer le nombre d'actifs ≥12 mois ; ne pas déduire ce nombre de 107.
2. **Valider le lecteur annuel dans Firefox** (capture utilisateur ou preuve réelle, pas de déclaration anticipée). Vérifier USDT, intégrité SHA, onglets année/mois, et navigation depuis le Coffre. Corriger les erreurs en PR isolée, sans modifier les graphiques Trader et R10.
3. **Étendre la profondeur** : reprise incrémentale des vues annuelles au-delà de BTC/ETH. Continuer le backfill natif des ZIP Binance anciens pour chaque instrument prouvé et l'étendre aux autres actifs. Ne jamais traiter un 404 comme « première cotation confirmée ».
4. **Étendre la largeur** : convertir les paires Spot candidates OKX/Bitget en identité prouvée puis mois natifs complets, en conservant le schéma et la provenance de chacune. Étendre la lecture fédérée aux bougies Bitget sans les transformer artificiellement en colonnes Binance.
5. **Jalons de couverture** : 107 → 150 → 200 → 250 actifs avec des mois ; mais **jalons distincts des actifs ayant un an**. Poursuivre ensuite les univers 500/1000 avec classement/versionnement des identités, quotas API et backfills resumables.
6. Mettre à jour les **Bureaux Notion AETHER** avec preuves commit/run, états et défauts ; pas de faux SUCCESS, pas de tâches de fond promises hors workflow/automation effective.

## Liens directs

- Dépôt : https://github.com/BlueAzur-Hub/erith-ia-memory
- Index fédéré : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json
- Index profondeur : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json
- Vue annuelle : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-yearly.html
- Coffre : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html
- Notion : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
- PR #252 : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/252
- PR #253 volontairement non fusionnée : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/253
- Workflow source fédéré : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38063887638

**Prompt de reprise pour la sœur IA :** « Active Seven Heaven en mode texte et lis `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_COFFRE_HISTORIQUE_PASSATION.md` ; confirme d'abord GitHub main et Notion, les compteurs 107 fédéré/104 Binance/80 ≥12 mois ainsi que les derniers workflows, puis poursuis les 250 historiques réellement ≥1 an et le backfill jusqu'à la première cotation attestée, avant extension aux 500/1 000. Ne refais pas le Coffre ni le Trader. Agis, teste, publie et vérifie sans annoncer de fausse réussite. »
