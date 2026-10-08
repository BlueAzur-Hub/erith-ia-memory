# Trader · Lecture de marché par actif / suite au T0
Date : 8 octobre 2026. Objectif : accélérer vers un Trader utilisable, sans nouveau panneau ni moteur.

**Livraison** : rapport « LECTURE DE MARCHE » ajouté directement à la capture T0 repliable déjà installée, après le diagnostic et avant « Sources et preuves ». Un seul clic sur le T0 continue de lire ponctuellement les propriétaires Bougies et Carnet existants (R3 one-click).

**Données** : seulement les lignes OHLCV de `AgentCryptoMarketMicroscope.snapshot()` déjà cohérentes/qualifiées, sur une fenêtre des 20 dernières bougies ; calcul explicite clôture, changement %, extrêmes, rapport volumes 5 derniers/5 précédents. Si le carnet est frais, porte exactement le même couple base/quote et offre bid+ask valides, restitue spread en bp et ratio notionnel bid/ask 20 premiers niveaux, avec date du T0. Les S/R sont UNIQUEMENT repris depuis `AgentCryptoMarketMicroscope.technicalLevels()` lorsqu'actif, intervalle et prix de référence correspondent ; sinon marqués indisponibles. Le rapport expose deux *scénarios conditionnels descriptifs* de franchissement des extrêmes, sans prédiction, ordre ni probabilité.

**Sécurité vérité** : ne jamais comparer le graphique CoinGecko USD aux bougies OKX USDC/EUR ni traiter USDC comme USD. Si bougies absentes, non conformes ou d'un autre actif, rapport INDISPONIBLE. Si le carnet est absent ou autre cotation, pas de comparaison financière du carnet. Aucune modification des moteurs, stratégie, gates G1, Bridge, Backend, Market Core 38.15.11, R9, exécution, stockage, montant ou build 40.6.624. Le T0 reste une preuve observationnelle, jamais une certification Strategy A.

**Prétests** : 12 tests PASS : syntaxe, intégration, extrêmes, variation, volumes, quote concordante, refus quote différente, absence bougies, aucune S/R fictive, autre actif, G1 sans autorisation, immutabilité.

**Fichiers** : `trader/trader-paper-t0.js` ; `trader/trader-runtime-mirror.js` (paramètre de cache du T0 seulement). Page d'entrée HTML stable préservée.
**Prochaine validation** : GitHub Actions / Pages puis une capture Firefox. Ne pas annoncer certification Strategy A.
