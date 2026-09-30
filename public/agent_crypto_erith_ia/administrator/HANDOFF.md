# HANDOFF — Agent-Crypto 40.6.480

## État

40.6.479 reste le checkpoint Strategy A / Input Freshness.

40.6.480 ne change pas le métier Strategy. Elle répare uniquement l'accès du collecteur canonique Top-250 à CoinGecko.

## Vérification GitHub Actions

1. Le repository doit posséder un secret Actions nommé `COINGECKO_DEMO_API_KEY`.
2. Le workflow `Atlas Public Crypto Market` doit s'exécuter.
3. Attendre un `status.json` avec `status = ready`.
4. Vérifier que `latest.json.generated_at` est plus récent que le snapshot du 29/09 05:38:03Z.
5. Vérifier que `preserved_last_valid = false` sur le run réussi.

Si le secret manque ou est invalide :
- ne pas inventer de prix ;
- ne pas forcer Atlas ;
- conserver le dernier snapshot valide ;
- garder le diagnostic DEGRADED.

## Firefox

Après publication : Ctrl+F5 → **Build 40.6.480 · Administrator**.

Le panneau `STRATEGY A · INPUT FRESHNESS TRUTH` reste celui de 40.6.479 et doit simplement refléter la nouvelle fraîcheur quand le snapshot canonique recommence à avancer.

## Protection

Market Core **38.15.11** intact. Strategy A business logic intacte. Aucun ordre réel.
