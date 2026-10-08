# Trader — T0 / diagnostic ciblé des bougies — 08 octobre 2026

Modification bornée : le diagnostic T0 détaillé affiche paire chargée/attendue, intervalle, bougies invalides, ordre des timestamps, ruptures temporelles, bougies non confirmées (informatif seulement), dernière ouverture, date de réception, âge à T0 et seuil de fraîcheur.
Conditions métier inchangées : OHLCV valides, horodatages croissants, zéro rupture, fraîcheur 2,2 × durée de l’intervalle, actif concordant. La qualité G1 ne reçoit aucun PASS.
Aucun changement des propriétaires OKX Bougies/Carnet, Bridge, Backend, Market Core 38.15.11, Administrator, R9 ni ordre Paper/réel.
Cache-bust sémantique de la page HTML et des scripts Trader pour éviter le module T0 ancien dans Firefox, aucun nouveau nom versionné.
Tests : 13 assertions isolées PASS (validité, non confirmées, péremption, OHLCV, ruptures, ordre, actif, chargement, temps, G1, rendu, persistance). Une vraie capture Firefox reste à valider.
À la prochaine capture unique, si le diagnostic indique des ruptures ou une dernière bougie ancienne, conserver les données et analyser leur provenance avant d'envisager un changement de seuil.