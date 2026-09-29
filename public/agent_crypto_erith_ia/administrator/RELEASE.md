# Agent-Crypto 40.6.469 — Capture des coûts : intégrité et reprise API

Base vérifiée : 40.6.468, main 444787f4bbfec85937ce3a48bb2195f22621add0.
Market Core 38.15.11 conservé. PAPER uniquement.

## Deux défauts reproduits avant correction

1. Le bridge signalait bien `duplicate:true` sur une deuxième ouverture du même PAPER, mais la façade de capture déclenchait une nouvelle mesure. En test Firefox, le bid initial 99 était remplacé par 95. La révision et l'horodatage changeaient aussi.
2. Execution Cost Truth exportait sa fonction `measure` avant de lui ajouter un wrapper de fin de mesure. Le bouton appelait le wrapper ; l'API publique conservait l'ancienne fonction. Un cycle reçu pendant la mesure publique restait en attente.

## Correction bornée

- Une première tentative par `(execution_id, phase)` est conservée, qu'elle soit en cours, réussie ou échouée. Une notification répétée ne remplace pas une observation contemporaine par un cours ultérieur.
- La façade ignore les ouvertures explicitement signalées comme doublons par le bridge.
- Une seule fonction `measure` porte désormais le `finally` commun, pour les appels publics, manuels et automatiques. La reprise réutilise le mécanisme existant, sans timer supplémentaire.
- Les deux chemins de chargement pointent sur les mêmes modules 40.6.469.

## Preuves

Firefox isolé, réseau externe bloqué, quotes et PAPER synthétiques ; aucune lecture de la base utilisateur, aucun ordre.
Avant : API publique = cycle perdu ; doublon = 2 captures et preuve remplacée.
Après : bouton et API reprennent chacun un seul cycle pour 5 notifications pendant une mesure ; aucune concurrence ; même résultat en échec de source.
Doublons après succès et pendant PENDING : une mesure, première preuve inchangée.
Entrée et sortie distinctes : chacune capturée une seule fois.
Échecs et réponse d'une autre mesure : conservés explicitement, jamais remplacés rétroactivement.
Montage DOM : un panneau, ARMED avec owners disponibles ; self-tests PASS.
Version Truth Guard à exécuter en CI ; validation Firefox opérateur encore attendue.

## Limites conservées et suite

- Une mesure occupée peut encore produire `BUSY_OR_STALE_MEASUREMENT` : aucune nouvelle mesure différée n'est présentée comme preuve du moment d'exécution.
- Les simulations de carnet disponibles restent 10/25/50/100 €. Un montant réellement investi de 49,90 € ne reçoit pas artificiellement la simulation 50 € ; son slippage reste inconnu.
- La mesure à la fermeture reste une observation de carnet et une simulation, pas le coût réalisé de vente d'une quantité détenue.
- L'injection after-cost reste OFF ; les quatre dossiers historiques incomplets ne sont pas complétés.
- La continuité de capture après rechargement et la sémantique de quantité de sortie nécessitent une preuve distincte avant toute intégration comptable. Aucun gate n'est promu par cette version.

## Test opérateur

Recharger l'entrée Administrator, vérifier Build 40.6.469 puis Section 04 → Simulation. Après chargement des propriétaires : un seul panneau Capture, état ARMED. Les compteurs à zéro restent normaux sans nouveau PAPER. Ne pas déclencher un trade pour valider cette version.
