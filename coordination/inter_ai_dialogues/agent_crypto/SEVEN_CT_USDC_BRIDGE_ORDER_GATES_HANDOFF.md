# Seven Heaven — R25 : qualification Spot LIMIT avant l'envoi réel

**20 octobre 2026 · point de contrôle.** Source locale du Bridge R24 fournie en ZIP par le propriétaire. Candidat R25 compilé hors ligne, et PR Trader #550 fusionnée. **Aucun ordre réel envoyé ni route Trade ouverte.**

## Versions et noms
- Aether Control : 2.3.2R25 (répertoire AppData séparé de R24).
- Bridge : 1.9.19 ; Backend : 1.4.6 inchangé ; Trader : 40.6.640 (pas de renumérotation de ses fichiers) ; Market Core : 38.15.11 protégé.
- **Fichiers stables** construits pour l'utilisateur : `AETHER_CONTROL.exe` et `AETHER_CONTROL.zip` ; dans le ZIP : `ATLAS_CRYPTO_BRIDGE_CONTROL_CENTER.exe`, sources Python/Go, tests et manifest SHA-256. Aucun numéro ajouté au nom des fichiers ou fonctions.

## Nouveauté Bridge
- Route Aether Trust propriétaire uniquement : `GET /okx/order-gates?instId=CT-USDC`. Identité `CT-USDC` stricte ; autres paires refusées.
- Routes privées OKX ajoutées à la **liste blanche GET** : `/api/v5/account/instruments`, `/api/v5/account/max-avail-size`, `/api/v5/account/max-size`. `instType=SPOT`, `tdMode=cash`.
- Sources publiques OKX GET : `/api/v5/public/instruments` et `/api/v5/public/price-limit`. `minSz`, `lotSz`, `tickSz`, plafonds `maxLmtSz`, `maxLmtAmt`, et bornes de prix si attestés.
- Résultat filtré en informations nécessaires et indicateurs de preuve ; jamais de clé, identifiant de compte, autorisation privée brute ou solde complet. Le statut fail-closed conserve les sources absentes comme NON CERTIFIÉ.
- L'identité éventuellement migrée `CT-USD` + `tradeQuoteCcy=USDC` n'est PAS présumée équivalente à `CT-USDC`. Elle demanderait un traitement dédié si le compte l'impose.
- Pas de `/api/v5/trade/order`, d'endpoint POST de négociation, d'ordre automatique, de permissions Trade/Withdraw, ni de modification du `feeType` ou des secrets.

## GitHub Trader
- PR #550 : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/550
- Fusion `f4f8b08eebc5be64b75deb311e4a97eecc62f346` : https://github.com/BlueAzur-Hub/erith-ia-memory/commit/f4f8b08eebc5be64b75deb311e4a97eecc62f346
- Trois fichiers modifiés : `trader-okx-account.js`, `trader-paper-decision-view.js`, `test-paper-decision.cjs`.
- `AgentCryptoTraderOkxAccount` reste le propriétaire exclusif des requêtes Aether Trust. Lors du clic humain de vérification du ticket CT-USDC, il lit les nouvelles preuves GET et les valide (identité, datation, exactitude, scopes) puis affiche les informations utiles dans le ticket existant.
- Avec l'ancien R24 encore ouvert, la nouvelle lecture indique « Bridge R25 requis » plutôt que d'inventer des plafonds.
- AUCUN bouton d'ordre réel n'est actif ni accessible sur cette version. La prochaine étape sera une revue de la permission Trade séparée et de la confirmation humaine.

## Tests effectués
- Hors ligne : `bridge.py --self-test` réussi ; `test_okx_fee_type.py` 5/5 ; `test_okx_order_gates.py` 7/7 ; `test_okx_ledger.py` et `test_atlas_singleflight.py` réussis.
- Go Windows 64 bits compilé, ZIP complet validé avec `testzip` et comparaison du binaire inclus.
- SHA-256 EXE : `21c75551ab3574d1e28f8c8af061ae04bd7c93e6982fa4e3e53c777c6ab42680`.
- SHA-256 ZIP : `7c70ef4840b025194bc0701dcbc33745471b5c5e2554bf82864498b1d9ca35b0`.
- SHA-256 source payload : `311b52502e3b6372ca0a475d75bccf3c820998896667a4af3fd4245f22156dcc`.
- **Limites de preuve :** aucune exécution Windows/Firefox de R25 et aucun appel privé réel OKX depuis le développeur. La compilation et le test mock ne certifient ni l'éligibilité du compte ni l'acceptation d'un ordre.

## Recette terrain pour le propriétaire
1. Conserver R24 comme retour sûr. Dans Control Center, arrêter proprement Bridge/Backend puis quitter R24. Ne jamais lancer deux Control Centers simultanément.
2. Installer/exécuter `AETHER_CONTROL.exe` dans son dossier Windows séparé ; R25 installe sous AppData `2.3.2R25` sans écraser R24.
3. Vérifier Bridge 1.9.19 / Backend 1.4.6, self-test OK. Session Aether Trust propriétaire dans Firefox ; pas de clé API dans le chat.
4. Recharger Trader par Ctrl+F5, sélectionner CT Solo puis Laboratoire PAPER → ticket LIMIT → Vérifier. Lire les lignes « CONTROLES SPOT COMPTE » ; conserver CT/USDT graphique distinct de CT/USDC ticket.
5. **Si CT-USDC non autorisé ou données inconnues, ne rien essayer d'envoyer.** Aucune vente/achat réel pendant cette recette.

## Prochaine phase — capacité réelle, distincte de R25
La future transmission d'ordres requerra un mécanisme volontaire de Trade distinct de la clé Read, le mapping exact d'instrument/settlement, une prévalidation récente complète, un ordre LIMIT Spot avec identifiant client unique, une deuxième confirmation humaine portant sur paire/sens/prix/quantité/coût, un arrêt opérateur et une lecture de statut de l'ordre. Le retour OKX peut être accepté sans fill et une requête expirée peut avoir été acceptée : ne pas réessayer automatiquement. Interdire les ordres automatiques par Radar/Atlas. **N'autoriser cette phase qu'après validation de R25 et choix explicite du propriétaire sur les permissions Trade.**

**STOP : livraison candidate R25 et code Trader prêts ; ne pas confondre avec permission de trading réelle.**