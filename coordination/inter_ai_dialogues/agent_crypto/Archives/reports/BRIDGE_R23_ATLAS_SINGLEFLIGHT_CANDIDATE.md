# Seven Heaven — Bridge R23 Atlas singleflight · candidat Windows (18 octobre 2026)

**Nature :** checkpoint de traçabilité de l'audit, **ne déploie pas de code**, ne publie pas les binaires Windows sur GitHub. La livraison source et exécutable compilé est accessible dans la conversation ChatGPT du 18 octobre 2026, sous les noms précisés ci-dessous, et doit être archivée sur GitHub séparément si le transport binaire est autorisé. Ne jamais qualifier R23 de version terrain tant qu'il n'a pas été exécuté et vérifié sous Windows.

## Sources et périmètre

- ZIP utilisateur de départ : `AGENT_CRYPTO_AETHER_CONTROL_R22_BRIDGE_V1_9_16_BACKEND_V1_4_6_OKX_LEDGER_READ(2).zip` ; EXE R22 correspondant vérifié lors de l'audit précédent.
- Correctif dérivé : Control Center `2.3.2R23`, Bridge `1.9.17`, backend OKX READ `1.4.6` inchangé, configuration et source Go incluses.
- **EXE candidat local** `ATLAS_10_CRYPTO_BRIDGE_CONTROL_CENTER_R23_BRIDGE_V1_9_17_BACKEND_V1_4_6_ATLAS_SINGLEFLIGHT.exe`, **SHA-256 `0f3ab0e8d2f75a599fb4989a0d21a5feffaa9063450af74eeec41869c72e9936`** ; PE32+ x64 Windows GUI cross-compilé Go.
- **ZIP candidat local** `AGENT_CRYPTO_AETHER_CONTROL_R23_BRIDGE_V1_9_17_BACKEND_V1_4_6_ATLAS_SINGLEFLIGHT.zip`, **SHA-256 `a8cb2b7c31bf8b675cf85a5e676ad4d7b26cd2e4ca4e1ea002426176c41d3e6a`** ; 33 entrées, contient mêmes bytes EXE/source et `source/payload.zip` reconstruit, manifest `SHA256SUMS.txt`, tests et README.
- Ne contient aucun secret API OKX, session Aether Trust, portefeuille ou fichier utilisateur ; maintenir sur disque les secrets DPAPI locaux séparés.

## Correctif R23 (côté Bridge seulement)

1. `bridge.py` : dictionnaire `ATLAS_SUITE_INFLIGHT` verrouillé par `threading.Lock` et entrée `threading.Event`, clé SHA-256 prenant en compte contrat + provider + modèle + réglages de génération. Onze requêtes identiques reçues pendant une génération ne produisent qu'une inférence et partagent le résultat.
2. `MODEL_INFERENCE_SEMAPHORE = threading.BoundedSemaphore(1)` partagé entre inférences Atlas et Aerith, maximum 4 secondes d'attente lorsqu'un autre modèle local tourne, puis repli déterministe; /health, cotations publiques et OKX privé READ ne prennent pas ce sémaphore.
3. En cas d'échec ou délai de jonction, aucun second calcul identique ne démarre par ce chemin, et l'entrée in-flight est libérée. Les réponses en cache restent mutualisées.
4. Journal local non sensible `bridge/data/diagnostics/atlas_runtime.jsonl` avec horodatage UTC, PID, digest court et durées : `atlas_owner_started`, `atlas_owner_finished`, `atlas_joined_existing`, `atlas_join_timeout`, `atlas_cache_hit`, `model_busy_refused`, `model_inference_started`, `model_inference_finished`. Ne journalise pas le contenu du snapshot ni les secrets.
5. Schéma config actualisé `atlas_10_crypto_bridge_config_v1_9_17`, métadonnées Windows `R23`; pas de modification Trader 40.6.640, Market Core 38.15.11, Backend 1.4.6 ou routes d'ordre privé.

## Tests réalisés sans accès au PC Windows

- `bridge.py --self-test` : OK ; `test_okx_ledger.py` : **19 contrôles simulés** OK ; `test_atlas_singleflight.py` : **5 tests de concurrence** OK (11 appels identiques, libération sur exception, isolation par modèle, charge simultanée, attente dépassée sans double génération).
- Windows GUI x64 compilé via `GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags '-H windowsgui -s -w'`. Vérification SHA-256 de toutes les entrées dans ZIP et concordance du payload embarqué. Aucun Ollama réel, compte OKX ni Firefox Windows n'a été utilisé lors de la construction.

## Cause du double lancement, limites et prochaine étape

Le programme de l'Administrator `administrator/app.js` demande jusqu'à **deux tentatives automatiques** et peut réarmer un cycle au changement d'identifiant de snapshot de marché. Il utilise plusieurs événements readiness (market-refresh, graph-ready, bridge-ready, post-auth). Les temporisations Bridge et Atlas ne correspondent pas nécessairement aux trente minutes observées. Le correctif Bridge stoppe les générations **identiques concomitantes dans un même processus**, mais pas les nouveaux cycles consécutifs associés à des snapshots **différents** ou à plusieurs instances Bridge.

**ATTENTION migration Windows :** cliquer sur la croix pour fermer l'ancien Control Center **laisse le processus Bridge ancien en cours d'exécution**. Le bouton Démarrer de R23 voit le port déjà actif et peut répondre « Bridge externe déjà actif · aucune action effectuée » ; il ne remplace alors pas automatiquement les scripts R22. Lorsque tout calcul est terminé, arrêter explicitement le Bridge depuis l'ancien Control Center, puis quitter cet ancien Control Center, lancer R23 et vérifier la version renvoyée par /health (1.9.17). Ne jamais forcer l'arrêt d'un processus externe inconnu. Si un `portable.flag` est présent à côté de R23, éviter qu'il pointe vers un dossier `bridge/bridge.py` resté à R22.

**Étape suivante :** valider R23 sous Windows avec **un seul Control Center**, préserver R22 pour rollback ; analyser `atlas_runtime.jsonl` et l'ID de chaque snapshot, puis corriger le vrai propriétaire de relance côté Administrator si les snapshots différents déclenchent des cycles excessifs. Avant cela, privilégier temporairement Atlas en mode MANUEL en cas de surcharge. Aucune permission Trade/Withdraw, aucun bot réel et aucune modification du compte privé.
