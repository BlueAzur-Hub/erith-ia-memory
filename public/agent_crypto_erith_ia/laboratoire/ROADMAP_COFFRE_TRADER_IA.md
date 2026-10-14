# Seven Heaven — Programme cumulatif du Coffre vers le Trader IA

**Document de préparation — 14 octobre 2026 — aucune publication d’interface autorisée par ce document.**
Base de travail : Trader / Administrator **40.6.636** ; parent validé CI **40.6.635** ; Market Core **38.15.11** protégé.
Bilan de la 40.6.636 : correctif de lecture CT/Q fusionné ; **PENDING_FIREFOX** tant que la recette visuelle nouvelle version n'a pas été faite par l'utilisateur.
Le déploiement GitHub Pages du commit ZIP 9514afd2d11c1a02b47f85ad588a6ac7b7290da3 a été confirmé SUCCESS.
Cette branche n'a pour rôle que de préparer les décisions ; ne pas fusionner, déployer ou changer l'état du Trader sans validation humaine à la reprise.

## A — Vérité de départ (registres GitHub, instantané du 14 octobre)

- Top 250 fédéré 1m : **144 / 250**, dont 126 propriétaires Binance et 18 Bitget ; **236 361 600 bougies natives minute déclarées**. Catalogue : public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json. Ce décompte est un inventaire des sources sélectionnées, pas un certificat de chaque minute ni une absence de trous.
- Sources journalières natives séparées : **58 actifs / 52 185 bougies 1D** ; public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multiresolution_sources/index.json. Les cours ont leurs propres paires USDT / USDC et horaires de session ; elles ne sont pas des bougies 1m.
- Union par identifiant canonique : **199 / 250**, dont 3 présents dans les deux registres ; **51 / 250** sans série dans cette union. Ne pas sommer 144 + 58.
- Années Binance : **108 actifs** avec au moins douze mois calendaires fermés consécutifs et **86** avec au moins 24, selon year_depth_index.json ; ne pas interpréter "mois complets" comme disparition des anomalies internes.
- Pilote Top 5 : BTC, ETH, BNB, XRP, SOL ; **7 périodes** précompilées par actif : 24h, 7j, 30j, 60j, 90j, 1an et Max, avec résolutions propres à chaque période ; public/agent_crypto_erith_ia/data/historical_archive_prototype/verified_periods/index.json. L'index est un instantané archivé, **pas la période glissante live**.
- Bitcoin Max intégré : **3 049 points**, **25 plages de lacunes journalières**, **5 881 minutes source absentes** ; depuis 2018-05-01 jusqu'à 2026-09-30 dans cet artefact. Les dates de cotation avant la première archive ne sont pas à inventer.
- Cas utile immédiatement : **Q / quack-ai** possède **390 bougies quotidiennes Bitget QUSDT** (dont **4 gaps** observés et un horaire de session native décalé de 16:00 UTC) dans le catalogue multi-résolution, bien que le lecteur R9/Univers/Top50 annonce une archive minute absente. **CT / concrete** n'est pas dans les deux catalogues ; ses 300 points externes OKX appartiennent au propriétaire Graphique et doivent rester identifiés comme tel.
- PR **#378 Preuves IA** ouverte : NE PAS fusionner sur l'ancien DOM sans rebasage et validation ; branche de documentation distincte.
- Aucun compte OKX privé, historique de portefeuille, token, clé, coût d'acquisition ou secret ne doit être copié vers GitHub, une requête IA publique ou une page de preuve.

Ces mesures ne doivent pas être considérées comme permanentes : une collecte automatique sur main peut les faire évoluer avant la prochaine séance. Reprendre les mesures depuis les mêmes index avant la livraison.

## B — Ce qui manque réellement

1. **Qualification et inventaire** : distinguer « source présente », « mois complet », « points valides », « période demandée couverte », « lacunes natives », « points déjà agrégés », « jamais coté », « marché supprimé » et « aucune source repérée ».
2. **Catalogue interrogeable multi-sources et multi-fréquences** : 1m Binance/Bitget, 1D OKX/Bitget/KuCoin/etc., prix USD CoinGecko, séries sources alternatives, dates de session, identifiants, paires et contrôles SHA-256. Ne jamais réécrire les registres natifs pour fabriquer une série unique.
3. **Lecteur autonome fiable** : requêtes ciblées par identifiant/paire/source/intervalle/résolution, téléchargement vérifié, pagination/agrégation contrôlée, retour des lacunes, pas de copie de plusieurs millions de points vers Firefox ou une IA.
4. **Pont Trader lecture seule** : afficher côte à côte le résultat du Coffre, la cotation du graphique et l'instrument privé, sans fusion implicite CT/Q/BTC ni conversion USD/USDT/USDC inventée.
5. **Couverture des sept périodes** pour 5 → 10 → 25 → 50 → 100 → 250 actifs, en honorant l'inception réelle et l'étendue de la source ; Max n'est jamais « tout depuis 2009 » par convention.
6. **Paquet de preuves IA compact** : métadonnées + fenêtre de points ciblée + statistiques calculées, limites et traçabilité ; les historiques complets restent dans le Coffre. Les IA demandent les données dont elles ont besoin, pas l'archive entière.
7. **Laboratoire humain** : onglet Preuves IA rebasé, tableau lisible sans jargon, distinguer observations/simulations/positions réelles, résultats contradictoires et source manquante. Préserver le positionnement du rapport BTC.
8. **Acquisition ciblée des 51 absents** : identité et cycle de marché, recherche de paires anciennes/supprimées, différence NAV / taux de stablecoin / transaction Spot, sources officielles, acquisition par lots avec reprise sur erreur et statut honnête.
9. **Opérations continues** : contrôler fréquence des collecteurs, réexécutions, commits concurrents, GitHub Releases, stockage binaire, checksum, coûts, quotas, age de données, reprise sur erreur et rétention.

## D — Programme de versions cumulatives, une seule responsabilité par version

Toute version est **proposée** et **non publiée**. Les numéros sont des repères de livraison ; aucun suffixe numérique ne sera introduit dans de nouveaux noms de fichiers ou fonctions.

| Version envisagée | Thème unique | Résultat observable / barrière d'acceptation |
| --- | --- | --- |
| **40.6.637** | Diagnostic / inventaire | Rapport reproductible des 250 identités, 1m/1D, doublons, bornes, gaps, état Firefox 40.6.636 ; aucune modification du graphe |
| **40.6.638** | Catalogue fédéré multi-fréquence | Un index de découverte additif comprenant Q 1D ; prouver 199 identités sans double comptage ; sources historiques natives inchangées |
| **40.6.639** | Lecteur Coffre autonome | API de lecture seule avec paramètres identité/source/paire/devise/période, vérification SHA et limites de mémoire ; tests déconnectés du Trader |
| **40.6.640** | Q journalier dans Trader | Présenter 390 bougies natives QUSDT/Bitget avec quatre gaps et heure de session attestée, sans les inventer ni les étiqueter USD ; CT externe reste séparé |
| **40.6.641** | Pilote cinq cryptos / sept périodes | BTC/ETH/BNB/XRP/SOL : 24h/7j/30j/60j/90j/1an/Max via index existant ; dates de clôture et résolutions visibles, pas de fausse fraîcheur |
| **40.6.642** | BTC Max et lacunes | Lire le Max intégré, signaler interruption de mars 2023, couverture horaire/journalière et minutes non retrouvées ; aucune bougie synthétique |
| **40.6.643** | Contrat de preuve destiné à l'IA | Objet compact structuré, fenêtre choisie, source/quote/âge/qualité/inconnues ; JSON vérifié, aucune information privée |
| **40.6.644** | Laboratoire « Preuves IA » | Adapter la PR #378 aux panneaux réellement restaurés, afficher les paquets lisibles, garder le rapport BTC à sa place |
| **40.6.645** | Extension Top 10 | Mesurer la couverture exacte par période ; ajouter ou qualifier sources absentes, puis recette 10 actifs |
| **40.6.646** | Extension Top 25 | Même contrat, sans traiter prix de fonds tokenisés comme bougies Spot |
| **40.6.647** | Extension Top 50 | Couverture par période et profondeur maximale accessible, statistiques de latence/volume, cas variés |
| **40.6.648** | Extension Top 100 | Imports ciblés manquants et contrôles qualité ; aucune obligation de déclarer 100/100 complet si données indisponibles |
| **40.6.649** | Extension Top 250 | Cataloguer les 250 : source authentique ou motif d'absence vérifiable pour chaque actif ; ne pas prétendre disposer de 250 séries 1m |
| **Après 40.6.649** | Top 500 / 1 000 et industrialisation | À décider selon résultats de performances, coûts de stockage, quotas et disponibilité des sources ; pas de numéro promis avant chiffrage |

**Jalons** :
- Premier lot de validation utilisateur : **40.6.636 terrain**, puis **40.6.637 → 40.6.640**, une à la fois.
- Deuxième lot : **40.6.641 → 40.6.644**, seulement après réussite du lecteur et des périodes pilotes.
- Troisième lot : **40.6.645 → 40.6.649**, acquisition et expansion en phases ; jamais d'annonce automatique de complétude.

## Contrat fonctionnel d'une requête du Trader à la bibliothèque

Entrée minimale :
- asset_id canonique et symbole ; périmètre Market et contexte Graphique explicitement indépendants.
- venue / instrument / quote native (BTCUSDT, CT-USDT, QUSDT…), granularité souhaitée.
- plage UTC [début, fin) ou période nominale ; politique de lacunes ; résolution visuelle désirée.
- source native ou stratégie de comparaison strictement déclarée, jamais conversion silencieuse.

Sortie documentaire attendue :
- dataset_id stable, version du manifeste, état « absent / partiel / qualifié / vérifié », SHA-256 du fichier téléchargé, URL de preuve source, horodatage de collecte.
- identifiant, marché, plateforme, devise native et éventuelle devise d'affichage ; si conversion, taux+source+heure ; nature (transaction Spot / prix indicatif / NAV).
- début et fin réels, UTC / session, nombre de bougies, résolution native, trous, interruptions, fenêtre récupérée, âge et fraîcheur.
- sous-ensemble des valeurs nécessaires (par exemple 12 bougies récentes ou fenêtre demandée), volume, min/max/variation calculés **uniquement si couverts**.
- erreurs explicites : NO_SOURCE, NOT_LISTED_YET, WRONG_PAIR, MISSING_FX, GAP, INCOMPLETE, QUOTA, INTEGRITY, STALE, PRIVATE_SCOPE.
- preuve exportable pour IA : court résumé en français + JSON stable. Les dizaines de millions de bougies ne sont jamais injectées dans le contexte du LLM.

**Schéma candidat** : observer/query -> resolver manifest -> retrieve exact file -> hash verify -> decode -> validate UTC/price/OHLCV -> window -> aggregate with coverage -> evidence packet -> human view + IA.
La librairie ne passe **jamais** d'ordre, n'efface pas IndexedDB, ne déclenche pas automatiquement des téléchargements massifs et ne réécrit pas le graphe propriétaire.

## Tests de réception obligatoires (un jalon, une preuve)

- Contrôler parent SHA, manifestes Administrator/Trader concordants, Market Core 38.15.11, absence de modification de Bridge et de permissions de trading.
- Créer un test unitaire pour chaque nouveau lecteur ; simuler faux hash, résultat de mauvaise paire, mauvaise devise, mauvais actif, horodatages inversés, doublons et trou.
- Vérifier les fichiers source réellement requis dans le ZIP cumulatif ; commit sur main seulement après acceptation, puis SHA et URL du ZIP, résultat GitHub Actions et GitHub Pages.
- Dans Firefox (Ctrl+F5) : CT graphique pendant Q Market, Q 1D, BTC Max avec lacunes, cinq actifs pilotes, navigation et persistance, F11, compte OKX séparé, aucune recentration non demandée.
- Garder **PENDING_FIREFOX** tant que la nouvelle version n'a pas été observée par l'utilisateur.
- STOP / rollback si saturation, boucle réseau, code touchant le graphe sans nécessité, disparition menu bas, confusion USD/USDT/USDC, création de faux points ou discordance entre index et ZIP.

## À relire lors de la reprise

- Fil : Fil.Inteface.Crypto.GPT(20261014-005446).md ; bilan fil de la veille et captures 40.6.634.
- Passation : coordination/inter_ai_dialogues/agent_crypto/coffre_top250_passation.md.
- Contrat : public/agent_crypto_erith_ia/laboratoire/REPRISE_SEVEN_HEAVEN.md.
- Dossier CT : public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md.
- PR #381 fusionnée (CT/Q), PR #378 non fusionnée (Preuves IA).
- Page Notion canonique : AETHER · AGENT-CRYPTO INTERFACE.
- Avant toute opération, comparer HEAD main au dernier commit de référence ; les collecteurs peuvent faire évoluer les chiffres.

**Décision de cette séance de préparation : pas de livraison de code, pas de modification de l'interface, pas de fusion de PR, pas de nouveau workflow de collecte avant le retour de l'utilisateur.**
