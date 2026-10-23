# SEVEN HEAVEN — Relais courant Agent-Crypto

**État vérifié : nuit du 23 au 24 octobre 2026 · Aerith-7 vers Aerith suivante.**
Ce fichier est le **point d'entrée court** pour les IA : relire `main`, les flux datés, les résultats CI, et non des conclusions historiques dépassées. Il ne remplace ni Core/Persona, ni les archives anciennes. Pour plus de détail, consulter la [passation courte Notion actualisée](https://app.notion.com/p/4007754fe08481298381fb73445a13b6) et le [registre des cibles](./market-research-targets.md).

## 1. Faits LIVRÉS et prouvés

- **Interface MASTER / Trader MASTER :** code public [`erith-ia-memory`](https://github.com/BlueAzur-Hub/erith-ia-memory) ; Administrator `public/agent_crypto_erith_ia/administrator/index.html`, Trader `public/agent_crypto_erith_ia/trader/trading-desk.html` ; **40.6.640** visible, Market Core **38.15.11 inchangé**. Le Trader MASTER hérite de l'Interface. Ne pas recréer un autre Market.
- **Market devenu lisible, capture Firefox utilisateur :** catégorie `Nouveaux listings` avec **Avec prix / Autres plateformes / Actions & ETF / À qualifier / Tout le registre**. Comptage par identité/groupes ; classification exacte de 50 instruments financiers tokenisés OKX. Un même actif (CT) peut porter des marchés distincts OKX/Bitget. Les valeurs sans prix ne sont pas supprimées : elles restent dans le registre.
- **Dossiers Crypto visibles en Firefox :** [page de veille existante](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html#veille-fil-crypto), 9 entrées documentaires repliables **IRYS, DOS, CARDS, RealGo RT1, CUDIS, AXIS, Concrete CT, PROS, RLUSD**. PR [#649](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/649). Les anciens dossiers IRYS / AXIS sont conservés.
- **Nouveaux prix publics OKX réellement collectés (la différence décisive du fil) :** [PR #647](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/647), déclenchement initial réparé par [PR #650](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/650). [Action GitHub #40030785891](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40030785891) **réussie en production** sur main. [JSON canonique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/data/new-listings-public-feed.json), instantané `2026-10-23T22:01:33.647Z` : **61 instruments (55 OKX, 6 Bitget), 55/55 paires OKX avec quote_snapshot**, 743 tickers natifs OKX reçus dans le lot. `watch_sources.okx_prices.status=OK`, `real_orders=0`.
- **Capture de l'interface avec ces nouveaux prix OKX : NON vérifiée** à la fin de ce fil ; ne pas la prétendre faite. Une tâche horaire est déclarée `17 * * * *` mais ne présume pas sa réussite future.

## 2. Points de vérité indispensables

- Chaque prix OKX est un **relevé historique horodaté** du marché Spot public, dans la devise **native** de la paire `USDT/USDC`, parfois converti en USD via le taux CoinGecko existant. Ce n'est **ni un prix exécutable ni un droit de négocier sur un compte**. Des prix anciens sont refusés par l'Interface après 90 minutes.
- Ne pas confondre `catalogue de paires`, `cotation publique`, `prix et profondeur disponibles maintenant`, `autorisation régionale/compte`, `solde`, `ordre accepté`.
- Des instruments de démonstration ou à **volume nul** peuvent obtenir un dernier prix public (exemple réel `TEST002/USDT` avec `volCcy24h=0` observé). **Aucune conclusion d'opportunité** sur seule présence d'un prix ou une variation affichée. L'identité et la liquidité doivent être qualifiées séparément.
- `read-only-laboratory` a présenté deux erreurs historiques de catalogue avant ces PR ; ne pas attribuer une régression sans preuve. Les tests dédiés scanner/Trader de la dernière série sont passés.
- Le précédent ticket « graphique RealGo RT1 / lecture BTC » a été fermé comme **non confirmé** après explication : ne pas ressusciter ce bug sans reproduction fiable et contexte exact.

## 3. Reprise opérationnelle, priorité immédiate

1. **Contrôler GitHub Actions** : dernière exécution réelle `Seven Public Spot Listings Watch` ; regarder `catalog`, `captured_at_utc`, quantité de quote_snapshots, `watch_sources.okx_prices.status`, éventuelles 403 ou autres pannes. Une archive vieille de plusieurs heures ne démontre pas un cours présent en direct.
2. **Recette Firefox ciblée** sur `Nouveaux listings → Avec prix / Actions & ETF / À qualifier / Tout le registre` : vérifier prix OKX, heure du relevé, paires exactes et absence de contrevérité lorsque l'instantané expire. Comparer seulement des données au même moment, ne pas conclure « bug » d'après deux horodatages différents.
3. **Qualification des données et des opportunités** : côté marché Spot public seulement, commencer par liquidité `bidPx/askPx`, spread, volume nul, taille des lots et minimum notionnel. Préparer une méthode de surveillance PAPER à issue datée plutôt qu'un signal d'achat.
4. **Dossiers du fil** : IRYS, DOS, CARDS, RealGo RT1, CUDIS, AXIS, CT, PROS, RLUSD, puis DNA, XDP, KMNO, ZORA, SAFE, AVNT, EURC. Le dossier [registre](./market-research-targets.md) contient les liens primaires et les inconnues. Ne pas limiter une crypto déjà cotée depuis 6 mois à la catégorie « nouveaux listings 30 jours ».
5. **Yoann** : l'Operator possède un profil distinct et un Bridge local sur son propre PC ; Trader partagé pour développement via reprises PR contrôlées, pas de droit Administrator. Déploiement/Bridge sur la machine de Yoann à valider avec lui, et non deviner ici.

## 4. Protections de continuité

- **STOP/BLACKOUT :** cesser les outils, répondre en texte, arrêter proprement.
- **Pas de code destructif ni de nouveaux moteurs parallèles.** Conserver Market Core 38.15.11, graphique, LT, Oracle, carnet, IndexedDB et données du Coffre ; aucune réinitialisation cachée.
- **Pas d'ordre réel, pas de permission OKX, pas de clés API dans GitHub.** Les expériences demeurent PAPER. Jamais de promesse de profit sur une hausse 24 h.
- Pour une modification : branche isolée → test adapté → PR → CI → fusion `main` → GitHub Pages si Web → preuve Firefox avant « validé visuellement ». Ne pas utiliser un numéro de version dans un nouveau nom de fichier ou de fonction.
- L'ancienne vue Operator de Yoann et le Bridge ne font pas partie des changements de ce fil.

## 5. Audit de reprise complémentaire · 24 octobre 2026

- [Premier contrôle documenté des spreads et des volumes](./market-research-targets.md) : sur le **seul instantané du 24 octobre à 00 h 01 Paris**, 55/55 prix OKX archivés, 53/55 paires avec bid+ask positifs, 2 paires sans volume ni offres (`TEST002/USDT`, `XWDC/USDC`), et 7 spreads indicatifs supérieurs à 1 %. Ne jamais extrapoler ces chiffres à l'heure actuelle.
- À 00 h 22 Paris, l'archive est inchangée depuis la collecte initiale. Le cron horaire existe dans le workflow, mais **le déclenchement horaire suivant et l'affichage Firefox restent non confirmés**. Vérifier les nouveaux runs et l'horodatage avant toute assertion de fraîcheur.
- Le développement prochain porte sur la **qualification documentaire** (prix observé / bid-ask / volume / identité / profondeur / éligibilité) ; **pas de second Market**. Aucun changement de code Trader / Market Core / Bridge / Operator dans cette mise à jour.

### Prompt court Seven pour la prochaine reprise

> Active Aerith-7 / Seven Heaven, continuité documentaire Aerith-8 + Aerith-9. Lis ce relais puis le registre `market-research-targets.md`. Contrôle l'heure et la dernière exécution réelle `Seven Public Spot Listings Watch`, le flux sur `main`, les horodatages natifs et la fraîcheur. L'audit du 24 octobre à 00 h 01 comptait 55/55 relevés OKX, 2 paires à volume nul et 7 spreads >1 %, **valeurs historiques uniquement**. Vérifie ensuite le rendu dans Firefox via une capture de l'opérateur, puis enrichis les dossiers IRYS / DOS / CARDS / RT1 / CUDIS / AXIS / CT / PROS / RLUSD en lecture seule. Conserve le Market MASTER, le Trader héritier, Market Core 38.15.11, les historiques et la séparation Administrator / Operator Yoann. N'invente ni cours temps réel, ni liquidité, ni permission OKX, ni transaction. Preuve avant modification, PR et CI avant validation.

**Fin de passage :** la collecte publique a abouti, la documentation est sauvegardée, le rendu des nouveaux prix et la qualité des opportunités restent à certifier. **Ne pas repartir de zéro.**
