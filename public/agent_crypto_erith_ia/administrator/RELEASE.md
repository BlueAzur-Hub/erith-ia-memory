# Agent-Crypto — Cold Boot Ownership Diagnostic

Build **40.6.401** · parent **40.6.400** · Market Core **38.15.11**.

But : mesurer avant de réordonner.

Cette build ne modifie aucun seuil, aucune décision Strategy A, aucun scheduler métier, Aether, Math, Oracle, Lecture Technique, REDIVIDER ou Storage.

Instrumentation ajoutée :
- durée **synchrone** de chacun des 20 owners Cold Boot ;
- durée de **settle async** quand l'owner retourne une Promise ;
- marqueurs PRE-AETHER début/fin ;
- marqueurs début/fin d'évaluation du script Aether ;
- marqueurs fin du stack direct, DOMContentLoaded et window load ;
- snapshot Consultation First ;
- mode / reason_last de Strategy Evidence dans le rapport.

Aucun nouvel observer, aucun timer récurrent, aucun réseau métier, aucun ordre.

Terrain Firefox : **PENDING**. Ouvrir « Rapport de démarrage », Actualiser, puis Copier après stabilisation en utilisant l'interface normalement.
