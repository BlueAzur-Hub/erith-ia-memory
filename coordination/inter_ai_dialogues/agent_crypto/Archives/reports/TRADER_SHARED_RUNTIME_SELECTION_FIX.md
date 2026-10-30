# Seven Heaven — correction ciblée de la sélection partagée Market / Bougies / Profondeur

Date : 08/10/2026. Audit de code, **pas** une refonte des moteurs.

## Architecture conservée

Trader 40.6.624 charge Administrator 40.6.624 dans une iframe same-origin. Le moteur de Market, les graphiques, la Lecture Technique, les Bougies et la Profondeur appartiennent toujours à Administrator ; les anciens JS autonomes du dossier trader/ ne sont pas chargés. Aucun second moteur n'est créé.

## Défauts démontrés à la lecture du code

1. AgentCryptoOkxMicrostructure écoutait le changement de devise et le nouveau listing, **mais pas** le signal canonique `agent-crypto:selected-market-changed`. Après BTC → OKB, un carnet BTC pouvait donc rester affiché jusqu'au prochain autre déclencheur.
2. AgentCryptoMarketInstrumentResolver écrivait `last` pour **toutes** les réponses de `resolve`, y compris le carnet (`book`) et une ancienne requête BTC arrivée après une plus récente OKB. La vérité d'exécution pouvait redevenir ancienne.
3. Pendant BTC → OKB → BTC en vol, le carnet annulait la première requête mais pouvait conserver l'intention intermédiaire OKB si l'opérateur revenait vite à BTC.

## Modification minimale

- Le résolveur publie désormais la vérité `candles` seulement pour la génération de requête la plus récente ET pour l'actif/devise actuellement sélectionnés. Une réponse `book` ne remplace pas l'étiquette d'exécution des bougies.
- Une réponse backend qui retourne un autre actif ou une autre devise que demandé est refusée, sans dessin de fausses bougies.
- Le carnet écoute l'événement canonique Market et vide le contexte chargé quand la crypto change. Un `refresh` est lancé seulement si la fenêtre Profondeur est ouverte.
- Une intention plus récente remplace une intention intermédiaire, y compris après annulation d'une requête précédente.
- On ne convertit pas les quotes : les choix OKX/Bitget/Binance restent propres à leurs capacités ; USD affiché n'est ni USDC ni USDT.
- Aucun reset de graphique, aucun changement d'HTML, de CSS, de Market Core, du Bridge ou des archives.

## Preuves requises

Workflow ciblé `.github/workflows/agent-crypto-trader-shared-selection.yml` : syntaxe JS ; tests Node VM sur BTC → OKB → BTC avec requête ancienne résolue en retard, échec ancien retardé, carnet indépendant des bougies, réponse backend hors actif, rafraîchissement de l'identité Profondeur ; régressions du Coffre R9/R10.

La CI prouve les fonctions simulées, pas un test réel dans Firefox avec Backend/Bridge. **Validation humaine terrain** à faire après la CI, en une seule séquence BTC → OKB → BTC dans le Trader ; aucune conclusion sur la connexion du Backend sans capture/mesure spécifique. Respecter la protection D Administrator 40.6.624 et Market Core 38.15.11.
