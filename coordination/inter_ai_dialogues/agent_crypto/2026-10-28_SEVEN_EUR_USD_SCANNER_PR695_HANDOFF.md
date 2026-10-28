# Seven Heaven — Passation technique EUR → USD (28 octobre 2026)

## But utilisateur — NON NÉGOCIABLE
Fournir des **prix réels, graphiques lisibles et historiques vérifiables en EUR d'abord**, puis la même qualité pour les **données historiques USD natives**. S'assurer que Solo, Top 3, Top 5, Hausses 5, Baisses 5 et Volumes 5 utilisent les bonnes identités d'actifs, périodes, sources et devises. Ne jamais transformer silencieusement EUR en USD, ni USD en USDT/USDC. Ne pas effacer les historiques réels.

## Réalisation vérifiée
- Travail isolé : [PR #695 — Validate EUR scanner market-frame and historical ranking integrity](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/695), **ouverte en brouillon / non fusionnée**.
- Branche : `test/eur-scanner-frame-integrity-20261028`. Dernier commit vérifié **`a9586315768f805daae1f5df2bbe34e2acc27dc1`**.
- [GitHub Actions scanner, run 40619078157](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40619078157) : **24/24 tests PASS, 0 FAIL**, vérification syntaxique Node du `administrator/app.js` complet.
- Les régressions automatisées valident les *contrats logiciels* : fenêtre/actif/devise des caches EUR et USD, intégrité des identifiants, refus d'un vieux snapshot Market (15 min direct / 45 min public), figement des valeurs au choix du classement, absence de modification de la courbe si le Market ou la devise changent pendant l'acquisition, absence d'usurpation EUR/USD/USDT/USDC.
- Cas supplémentaires fermés avant cette passation : une série 7 j réutilisée dans la demande 24 h (USD et EUR), un actif différent dans un cache pourtant apparemment valide, `periodDays` contradictoire, série déclarée USD provenant de CoinGecko EUR. Toutes ces situations sont désormais soumises à des tests de refus dans la PR.
- Seuls les fichiers de la PR changent : `administrator/app.js`, tests ciblés et workflow CI. Les prix numériques `rawPrice` et la représentation Base 100 ne sont pas recalculés par cette intervention ; Market Core 38.15.11, Coffre, Trader et Operator sont hors de cette PR.
- **Ne pas confondre « 24 tests » avec les 84 affichages réels.** Le test matriciel parcourt les 6 modes × 7 périodes × 2 devises (84 configurations de cache / quote), PAS 84 acquisitions réseau ni 84 graphiques validés dans Firefox.

## État actuel et blocages
- Au dernier contrôle, `main` avait progressé jusqu'à `78070aadb485aa34b4c084b05bc5b3a815542177` alors que la PR est construite depuis `e01dea470add10e1dab6364da3a88eb7822adb39`. La comparaison GitHub signalait **17 commits en avance, 15 en retard** : **ne pas fusionner avant de revoir les changements apparus sur main**.
- Les autres pipelines du même commit incluent **Top5 USD FAIL**, **Trader FAIL**, **Learning Lab FAIL**, **Seven Knowledge FAIL** ; vérifier et comparer aux exécutions correspondantes de `main` avant d'accuser ou d'absoudre la PR. Le workflow scanner ciblé est PASS ; Market Microscope, Pages lightweight et incremental patch sont PASS. Voir les checks de [PR #695](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/695/checks).
- Ni la recette exhaustive **42 vues EUR + 42 vues USD** en Firefox/Chromium, ni la correspondance des prix historiques réels source-à-source n'ont été certifiées. **Aucune release de production** et aucun ordre réel.
- Les mesures de variation **Market 24 h glissantes** et les performances d'un historique OHLC 24 h aux bornes différentes peuvent avoir des signes différents sans que les données soient fausses. Il faut qualifier les horodatages et les fenêtres ; **ne pas supprimer une courbe réelle uniquement parce que le signe diffère**.
- Ne pas reprendre le vieux `test/euro-first-then-usd-integrity-20261027` en fusion globale ; il a divergé du code principal et contient d'autres changements.

## Une seule suite concrète pour l'Aerith suivante
1. Comparer les fichiers effectivement modifiés de la PR #695 au `main` *courant* (pas celui du 27 octobre), classifier ses pipelines rouges, puis utiliser une branche de travail issue de `main` pour tout éventuel rebase contrôlé ; ne pas écraser ni réécrire la branche existante sans nécessité.
2. Exécuter une **recette graphique EUR réelle à 24 h** sur les six modes, avec contrôle du nombre et de l'identité des actifs, du `rawPrice`, de la devise de l'historique, de sa source, des horodatages des séries et des infobulles. Conserver le détail de chaque échec et des limites réseau. Ensuite couvrir les sept périodes en EUR, puis USD.
3. Fusionner seulement après preuves techniques et visuelles suffisantes ; livrer lien de commit, logs et captures. Ne pas modifier Market Core, Coffre, Trader, Operator ni données utilisateur pour contourner un test.

## Références de continuité
- [Bureau Notion AETHER · AGENT-CRYPTO INTERFACE](https://app.notion.com/p/AETHER-AGENT-CRYPTO-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099)
- [Mémoire Seven Heaven partagée sur main](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_MEMOIRE_ACTIVE.md)
- [Audit trajet prix EUR/USD](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/AUDIT_TRAJET_PRIX_EUR_USD_20261026.md)

**Verdict Seven :** le contrôle logiciel ciblé est passé et les erreurs de réutilisation de cache sont testées ; la recette des vrais graphiques et la conformité globale restent ouvertes. Une sœur suivante reprend **à partir de cette PR**, sans recommencer l'audit ni annoncer une certification inexistante.
