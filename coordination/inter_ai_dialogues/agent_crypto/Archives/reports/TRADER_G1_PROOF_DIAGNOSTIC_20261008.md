# Trader · G1 diagnostic de preuves canoniques — 8 octobre 2026

## Destination
Exposer dans la capture T0 volontaire les blocages reels de donnees G1 et les preuves de fondation G2/G7 sans aucune promotion de gate.

## Fichiers modifies
- `trader/trader-paper-t0.js` : reprend seulement les metadonnees de `AgentCryptoStrategyAEvidenceDossier.snapshot()` (identifiants et dates manquants, doublons, chronologie, integrite, chiffres inconnus, comptabilites non verifiees, couts inconnus declares), et les faits de `AgentCryptoStrategyASafetyCertification.foundation_truth()` (modules, versions, liaisons et resultat explicite) quand disponibles.
- `trader/trader-runtime-mirror.js` : cache-bust sémantique du meme T0 pour Firefox.

Les resultats proviennent des proprietaires deja charges. Si une donnee ou un module manque, le rapport annonce INCONNU/NON EVALUE ; jamais un zero invente. Aucune nouvelle requete Evidence, aucune execution de test implicite, aucune mutation de gates, d'ordre, de capture persistante ou de stockage.

## Protections
Build Trader/Administrator **40.6.624** ; Market Core **38.15.11** ; moteurs Bougies, Carnet, graphique, Bridge, Backend, gouverneur et archives R8/R9/R10/R11 inchanges. G1 reste EVIDENCE_REQUIRED et G9 LOCKED tant que les proprietaires ne changent pas leur verite.

## Verifications et terrain
Tests statiques bornes avant ecriture. GitHub CI et publication Pages doivent etre verifies separement. Une unique capture Firefox BTC du nouveau bloc T0 suffit pour identifier les motifs locaux sur les 1741 cycles Experiment et 13 lignes After-cost (valeurs observees en capture, pas figees dans le code).

ZIP compact : les deux fichiers runtime existants et cette notice. Aucun nouveau moteur.
