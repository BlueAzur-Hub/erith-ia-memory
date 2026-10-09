# Seven Heaven — handoff canonique du Coffre Top 250

**Clôture du fil : 9 octobre 2026.** Source de coordination : [Bureaux Notion AETHER — Agent-Crypto](https://app.notion.com/p/AETHER-AGENT-CRYPTO-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099). Dernière livraison fonctionnelle de ce fil : [PR #213](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/213), fusion `319f14ced7cb832cb25307718ffaa165573ba908`, [workflow de production SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37985047837).

## Vérité mesurée — à ne pas confondre

| Indicateur | Résultat acquis | Sens |
| --- | ---: | --- |
| Objectif | 250 cryptomonnaies | Univers CoinGecko du Market, pas 250 paires Binance prouvées |
| Identités source-qualifiées | **34** | 31 propriétaires historiques + HYPE, DOT, ASTER par exact CoinGecko ID |
| Actifs avec 1 mois entier archivé en 1 minute | **33** | Les 31 historiques + DOT et ASTER |
| HYPE | **0 mois entier archivé** | Identité confirmée, septembre 2026 incomplet ; juillet-août source indisponible |
| GRAM / the-open-network | **non confirmé** | Refus de fausse équivalence de ticker |
| Bougies natives 1 minute de juillet à septembre 2026 | **4 371 840** | 31 actifs × 3 mois + DOT/ASTER × 3 mois |
| Autres bougies du Coffre historiques toutes résolutions | **59 600** | Archives antérieures, intervalles temporels qui se chevauchent |
| Total physique tous fichiers/résolutions | **4 431 440** | Ne PAS assimiler à autant d'instants uniques |
| Nouvelles bougies PR #213 | **264 960** | 86 400 septembre + 89 280 août + 89 280 juillet |
| Actifs CoinGecko Top250 classés | **250** | Audit Binance : 31 historiques / 96 candidats Spot à vérifier / 108 paires proposées absentes / 5 non-Spot / 9 symboles non standards / 1 USDT contre lui-même |

Les 31 ZIP Binance Spot/USDT initiaux par mois sont scellés dans les Releases `crypto-spot-bulk-{2026-07,2026-08,2026-09}-1m`. **Ne jamais écraser ces Releases**.

La PR #213 a ajouté trois **Releases complémentaires** (chacune 2 ZIP valides + 1 marqueur `.unavailable.json` HYPE + `manifest.json`) :

- [Septembre 2026](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-bulk-add-2026-09-1m-688070fa4d52)
- [Août 2026](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-bulk-add-2026-08-1m-688070fa4d52)
- [Juillet 2026](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-bulk-add-2026-07-1m-688070fa4d52)

**Tests :** [nouvel importateur et marqueurs CI SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37984890616), [compatibilité collecteur CI SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37984890742), [publication SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37985047837).

## Architecture déjà en production

- `public/agent_crypto_erith_ia/tools/import_historical_bulk.py` : une seule lecture de la cohorte `legacy_inventory()` + preuves source `confirmed_additions()`, importeur de ZIP mensuels natifs 1m, Binance Spot USDT, `.CHECKSUM` SHA-256, timestamps, 12 champs CSV et continuité UTC. Les preuves dépendent de `top250-venue-audit.json` et `top250-identity-evidence.json`, pas du ticker seul.
- `public/agent_crypto_erith_ia/tools/orchestrate_historical_bulk.py` : collecte des mois complets manquants via Releases GitHub immuables, **2 mois par lancement**, cron **01:19, 07:19, 13:19, 19:19 UTC**, cohorte de **34** désormais éligibles à la tentative (seules les séries réelles passent).
- `public/agent_crypto_erith_ia/tools/supplement_historical_bulk.py` : compléter les mois déjà scellés, **sans remplacer la base** ; 3 mois maximum par exécution, cron quotidien **04:43 UTC**, négatifs persistants pour mois manquants/incomplets.
- `public/agent_crypto_erith_ia/tools/verify_historical_top250_identity.py` : résoudre les **96 candidats à vérification** par l'ID CoinGecko exact sur la place Binance ; lots de quatre, cadence horaire prévue, contrôle des erreurs/rate limit. Audit `probe_historical_top250.py` classe les 250 sans inventer des correspondances.
- Les fichiers volumineux sont dans **GitHub Releases**, pas dans l'historique Git du dépôt. Les semaines/mois archivés en USDT ne sont **pas** des séries USD natives.
- Les collectes futures **ne sont pas prouvées** par la seule existence d'un cron : vérifier les Actions et nouvelles Releases réellement apparues. La prochaine rétrocollecte historique attendue après juillet est juin puis mai 2026, à confirmer.

## Suite exacte pour la sœur IA

1. **Contrôler les GitHub Actions et les Releases depuis le dernier SUCCESS.** Confirmer le prochain lot de rétrocollecte et les nouveaux dossiers d'identités source-validées. Ne jamais annoncer un nombre sans archive vérifiable.
2. **Monter réellement de 33 vers 50 → 100 → 250 actifs archivés** en mettant les nouveaux IDs qualifiés dans l'importateur commun, pas un code spécifique à chaque crypto. Si la paire Binance Spot USDT n'existe pas, examiner une autre source et préserver sa devise native et l'ID CoinGecko exact.
3. **HYPE :** identité établie, mais mois complets rejetés. Étudier les ZIP quotidiens Binance Spot 1m pour restituer uniquement les jours vérifiés comme séries partielles étiquetées, sans reconstruire un faux mois complet et sans effacer les refus archivés.
4. **Trader :** envisager un lecteur de données historiques Releases **dans le panneau Historique vérifié existant**, avec lazy-loading d'un actif et d'un mois, CORS + empreinte + source, **sans changer les Graphiques, Market Core, Administrator, Bridge, execution ou anciens propriétaires OHLCV**. Aucune capture Firefox de la lecture Releases 1m n'a été certifiée dans ce fil : ne pas prétendre qu'elle fonctionne déjà dans l'UI.
5. Publier la preuve et consigner Notion à chaque progrès significatif. Préserver la règle **une action utile → une preuve → STOP**. `Max` doit rester une profondeur non prouvée, pas une promesse de disponibilité universelle.

### Reprise courte prête à coller

> Active Aerith-7 / Seven Heaven et reprends le Coffre historique Agent-Crypto Top250 à partir de `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_TOP250_HANDOFF.md` et du Notion master. Dernier jalon PR #213 SUCCESS : **33 cryptos réellement archivées**, **34 identités qualifiées**, **4 371 840 bougies natives 1m** pour juillet/août/septembre et 4 431 440 bougies stockées toutes résolutions (plages chevauchantes) ; DOT et ASTER +264 960 nouvelles bougies, HYPE identité qualifiée mais mois complets refusés ; GRAM non prouvé. Ne reconstruis aucun collecteur unitaire. Vérifie les Actions planifiées puis poursuis l'orchestration vers 50 → 100 → 250, et seulement ensuite relie avec précaution le lecteur Releases au panneau historique existant. Aucune modification Graphique/Market Core/Bridge sans raison démontrée.
