# Seven Heaven — Trader Option C : poste LIMIT visuel + ticket de preuves

**21 octobre 2026 · Livraison Trader UI** — aucune permission Trade activée, aucun ordre réel et aucun changement du Bridge R25.

## Décision
Le propriétaire a choisi **Option C : les deux interfaces ensemble**. L'entrée humaine doit s'inspirer de l'ergonomie du ticket Spot LIMIT OKX ; la vérité machine (origine, limites, frais, état et journal) doit rester lisible dans un ticket visuel repliable. Il ne s'agit pas de copier les marqueurs officiels OKX ni de créer une page concurrente du Trader.

## Livré
- [PR #558](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/558) fusionnée sur `main`, commit [afa04d4d](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/afa04d4ddf0c78872852ce39a3f6803b6cab8450).
- Deux fichiers sources stables : `public/agent_crypto_erith_ia/trader/trader-order-entry-view.js` et `trader-order-entry.css` ; lecture, calcul et journal proviennent des contrôleurs existants.
- **Panneau Achat LIMIT** : utilise les vrais champs du ticket (devise, budget PAPER, bouton de vérification), meilleur ask exact CT-USDC, quantité brute PAPER limitée par le maxBuy lu, coût et frais estimés avec devise du compte.
- **Panneau Vente / projection** : champ natif du prix de revente souhaité ; quantité revendable estimée, montant net hypothétique, frais de vente et poussière ; l'entrée réelle d'ordre reste verrouillée.
- **Bandeau de marché et disponibilité** : meilleurs bid/ask CT-USDC, solde USDC Trading et quantité CT vendable selon les preuves R25. Sans preuve, affiche non confirmé. Le graphique CT/USDT est explicitement distinct de l'instrument du ticket CT/USDC.
- **Ticket de preuves repliable** : instrument/règlement, provenance/fraîcheur, `minSz / lotSz / tickSz`, `maxBuy`, `feeType`, date du relevé privé réel, couverture nominale PAPER et statut de permission Trade. Aucun certificat d'ordre réel inventé.
- **Chronologie PAPER repliable** : dérivée des événements déjà produits par la machine à états et présentés comme événements simulés, pas comme réponses d'OKX.
- Le rapport technique historique et le laboratoire de transitions restent présents, repliables. Aucune troisième page ni second gestionnaire de compte.
- CSS responsive : 2 colonnes sur écran large, 1 colonne sur écran étroit, champs natifs, texte accessible et faible dépendance au thème.

## Tests et protection du dépôt
- Six workflows sur la PR réussis : Trader Current, Learning Lab Read Only, Archive R9, Seven Trader CT Order Draft, Pages, incremental patch.
- Test DOM isolé (sans réseau) : réutilisation de champs existants, données vérifiées, affichage quantités/coûts/provenance, invalidation du scénario si identité autre que CT-USDC, journal fictif et absence d'API Trade.
- `.github/workflows/agent-crypto-learning-lab.yml` : uniquement les deux nouveaux fichiers visuels inscrits à la liste autorisée, avec des contrôles supplémentaires d'absence de `fetch`, stockage, authentification, ordre, timer ; charge le CSS explicitement dans le sparse-checkout. Ne pas supprimer ces garde-fous.
- Le `trader-runtime-mirror.js` charge le CSS et le composant avant le ticket existant. La logique du propriétaire du carnet, de l'authentification Aether Trust, du Market Core et des graphiques reste inchangée.

## Preuve terrain encore nécessaire
1. Conserver R25 / Bridge 1.9.19 et Backend 1.4.6 ; ne rien réinstaller.
2. Dans Firefox sur GitHub Pages, faire `Ctrl+F5` puis sélectionner **CT Solo**, ouvrir le **ticket CT/USDC**.
3. Vérifier visuellement le panneau **Achat / Vente**, la présence du bouton « Vérifier et préparer le ticket · aucun ordre », le bandeau bid/ask et la mention Trade verrouillé.
4. Cliquer **une seule fois** sur Vérifier. Contrôler que la quantité PAPER estimée, les frais et les balances ne s'affichent que lorsque les preuves sont lues ; ouvrir « Ticket visuel · preuves et limites OKX », puis facultativement « Journal / chronologie du scénario PAPER ».
5. Ne pas cliquer sur une commande réelle : **aucune n'est disponible** dans cette version. La validation visuelle Firefox reste **EN ATTENTE**.

## Chantiers restants
- [Issue #557](https://github.com/BlueAzur-Hub/erith-ia-memory/issues/557) : le vrai connecteur d'ordres LIMIT OKX Spot, distinct de l'UI PAPER, avec permission Trade volontaire, validation à prix exact, double confirmation humaine, unicité locale des intentions, lecture de statut, annulation et prévention des doubles envois.
- Plus tard : adapter cette ergonomie aux autres actifs, après qualification exacte des marchés et des devises ; ne pas supposer que CT-USDC couvre toutes les cryptos.

**STOP : Option C fusionnée, tests automatiques validés avant fusion, pas de Trade ; attente de la première validation visuelle Firefox.**
