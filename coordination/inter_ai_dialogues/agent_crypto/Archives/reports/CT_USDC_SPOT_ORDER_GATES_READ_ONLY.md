# Seven Heaven — CT/USDC : contrôle des conditions Spot sans ordre

**Date :** 20 octobre 2026 · **État :** enquête documentaire et revue du code, sans exécution de transaction.
**Périmètre :** ticket PAPER CT-USDC d'ERITH.IA Trader 40.6.640, PR #548 fusionnée, **lecture seule**.
**Confidentialité :** fichier dans le dépôt public ; aucun solde privé, identifiant de compte, jeton Bridge ou historique individuel n'est reproduit.

## 1. Observations effectivement établies

- Relevé Firefox utilisateur du 20 octobre 2026, vers 22 h 28 (heure locale) : règle publique récente **CT-USDC Spot**, état `live`, `minSz=10 CT`, `lotSz=0.01 CT`, `tickSz=0.0001 USDC`. Ces valeurs sont datées, **pas garanties valables au prochain clic**.
- Le ticket PAPER utilise la paire exacte **CT-USDC**, un carnet public local récent si qualifié, et la lecture du compte via le Bridge préexistant. Les bougies **CT-USDT** en affichage USD constituent **un autre marché**.
- PR [#548](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/548) : lecture anonyme de `/api/v5/public/instruments?instType=SPOT&instId=CT-USDC`, contrôle exact de la paire, état `live`, âge maximal 120 secondes, repli explicite sur archive en cas d'échec ; arithmétique décimale des lots ; `orders_enabled=false`.
- La PR **ne vérifie pas** les plafonds, les bandes de prix, le minimum notionnel éventuel ni le type de devise effectivement débitée pour les frais. La preuve Firefox atteste des trois filtres publics à l'instant observé, **pas une acceptation d'ordre**.

## 2. Découvertes officielles OKX qui changent le diagnostic

### 2.1 Devise des frais d'achat : `feeType` existe réellement

**GET `/api/v5/account/config`**, **permission Read**, retourne notamment `feeType` :

- `0` : frais facturés dans la **devise obtenue** (achat CT/USDC : CT retenus à la réception).
- `1` : frais toujours facturés dans la **devise de cotation** (achat CT/USDC : USDC, en supplément du notionnel d'achat).

Ce paramètre est **propre au compte**. Les taux maker/taker CT-USDC connus ne suffisent **pas** pour déduire `feeType`. La capture fournie ne donne pas cette valeur. Les montants des fills historiques et `feeCcy` peuvent corroborer la pratique lors d'opérations passées, sans prouver la configuration actuelle.

**Ne jamais appeler** `POST /api/v5/account/set-fee-type` : cette route **modifie** le compte. La mission exige seulement la lecture `GET`.

Sources : [OKX docs v5 — account/config](https://www.okx.com/docs-v5/en/) ; [OKX changelog 2025-09-17](https://www.okx.com/docs-v5/log_en/) ; [OKX explication de l'option](https://www.okx.com/en-us/help/okx-to-introduce-spot-fee-payment-option-in-quote-currency). Vérifier l'applicabilité régionale au compte OKX Europe ; ne pas la présumer.

### 2.2 Plafonds instrument et bandes de prix

La réponse publique `GET /api/v5/public/instruments` documente aussi notamment :

- `maxLmtSz` : quantité maximale d'un **ordre limite** (base, CT).
- `maxLmtAmt` : montant maximal en **USD** d'un ordre limite, lorsque fourni.
- `maxMktSz`, `maxMktAmt` : plafonds propres aux ordres au marché, **à ne pas appliquer à un LIMIT sans qualification**.
- `state`, `baseCcy`, `quoteCcy`, `instType` : identité / disponibilité.
- `initPxLmtPct`, `floatPxLmtPct`, `maxPxLmtPct` : paramètres de bande de prix (dépendent du marché et de la période).

Pour une **limite de prix réellement calculée**, OKX documente **GET `/api/v5/public/price-limit?instId=CT-USDC`** ; ne pas substituer un simple contrôle `tickSz`. L'absence, la réponse vide ou un champ non applicable n'autorise aucune supposition.

**Valeurs effectives CT-USDC à cet instant : non récupérées dans cette enquête.** Les API publiques n'ont pas pu être interrogées directement depuis cet environnement ; seul le relevé Firefox utilisateur qualifie `minSz/lotSz/tickSz` à 22 h 28.

Source : [OKX docs v5 — Get instruments, price limits](https://www.okx.com/docs-v5/en/) et [changelog du 30 juin 2026](https://www.okx.com/docs-v5/log_en/).

### 2.3 Disponibilité propre au compte

Routes documentées **en lecture seule** et à évaluer dans le Bridge existant, après analyse du code et sans élargir les permissions :

- `GET /api/v5/account/instruments?instType=SPOT` : instruments négociables par **ce compte**, restrictions et selon la région ; confirmer la paire exacte.
- `GET /api/v5/account/config` : `acctLv`, `feeType`, état des permissions de lecture, sans exposer les identifiants.
- `GET /api/v5/account/max-avail-size?instId=CT-USDC&tdMode=cash` : disponibilité **contextuelle** pour le marché Spot.
- `GET /api/v5/account/max-size?instId=CT-USDC&tdMode=cash` : maximum de quantité selon le compte.
- `GET /api/v5/account/trade-fee?instType=SPOT&instId=CT-USDC` : taux applicables à la paire ; route déjà présente dans le Trader via `/okx/fees`.
- `GET /api/v5/trade/fills` ou historique des fills existant, pour `feeCcy` **historique**, à garder privé.

**Ne pas lancer de `POST` de prévalidation** : l'endpoint `POST /api/v5/trade/order-precheck` documenté nécessite la permission **Trade** et ne couvre que les modes *Multi-currency margin* et *Portfolio margin*. Il ne constitue pas un contrôle universel sûr en Spot simple. Aucune permission Trade n'est à demander ni accorder pour ce chantier.

Source : [OKX docs v5 — account, trade and precheck](https://www.okx.com/docs-v5/en/).

### 2.4 Minimum notionnel / acceptation définitive

`minSz` est une **quantité minimum en CT**, pas un seuil de valeur en USDC. Aucun **minimum notionnel distinct et effectivement applicable à CT-USDC** n'est certifié par les seules trois valeurs de la PR #548. Ne pas inventer un « minimum 5 USDC » ou un « minimum 10 USDC ». L'acceptation finale dépend aussi des contrôles internes, de la région, de l'état de l'instrument et de l'exécution instantanée.

Une opération valide au sens de la quantité et du prix peut encore être refusée, et un ordre accepté peut ne pas être exécuté.

## 3. Conséquence mathématique : deux branches, sans ordre

Hypothèses strictement PAPER : achat `Q` CT au prix `P` USDC/CT, taux taker d'illustration `f=0.001`, pas de quantité `0.01 CT`. Ces hypothèses ne sont pas des conditions de marché actuelles.

| Cas | CT livrés avant tout autre arrondi | USDC requis hors coûts additionnels |
|---|---|---|
| `feeType=0` frais dans CT | `Q*(1-f)` | `Q*P` |
| `feeType=1` frais dans USDC | `Q` | `Q*P*(1+f)` |

Pour vérifier une future revente LIMIT, arrondir la **quantité CT disponible vers le bas** au pas `lotSz`, puis exiger au moins `minSz`. Ne pas arrondir arbitrairement les montants de frais réels : leur devise, précision et arrondi doivent être qualifiés séparément.

Le chiffre `10.02 CT` de la PR #548 est **un minimum brut mathématique sous frais CT de 0,10 %**, non un seuil d'ordre universel, ni une recommandation d'achat.

## 4. Matrice de certitude au point d'arrêt

| Contrôle | Niveau |
|---|---|
| Pair CT-USDC Spot, état live, min 10, lot .01, tick .0001 | **Vérifié à l'instant du relevé Firefox** ; réévaluer à chaque opération |
| Taux de frais du compte pour la paire | **Relevé privé utilisateur daté** ; non republié ici |
| `feeType` actif de ce compte | **NON VÉRIFIÉ** ; lecture GET account/config possible si Bridge autorisé |
| `maxLmtSz`, `maxLmtAmt` du CT-USDC courant | **NON VÉRIFIÉS** |
| Bande de prix LIMIT `price-limit` actuelle | **NON VÉRIFIÉE** |
| Minimum notionnel distinct CT-USDC | **NON CERTIFIÉ** ; ne pas inventer |
| Instrument négociable sur ce compte / permission régionale | **NON VÉRIFIÉ par la seule API publique** |
| Solde effectivement mobilisable après réservations et frais | **NON CERTIFIÉ pour un ordre futur** |
| Ordre réel possible/exécuté par ERITH.IA | **NON : ticket PAPER non exécutable** |

## 5. Suite technique bornée, avant toute nouvelle PR

1. Relire le Bridge source exact et ses routes existantes ; confirmer la **permission Read** et la séparation données privées / publication GitHub.
2. Qualifier **sans ordre** le `feeType` via `GET account/config` dans le Bridge privé uniquement si la route existe déjà ou si un correctif de lecture seule est explicitement autorisé.
3. Étendre la qualification publique **en lecture seule** aux plafonds LIMIT et à la bande `price-limit`, avec vérification de paire et fraîcheur.
4. Ne propager au ticket que les valeurs utiles, des booléens de preuve et les raisons de blocage. **Jamais** de token, compte brut, identifiant utilisateur ou ledger dans le HTML public, GitHub ou Notion.
5. Tester : compte non reconnu ; `feeType` absent ; `feeType` 0/1 ; budget suffisant dans un mode mais insuffisant dans l'autre ; limites de prix ; devises CT/USDC distinctes de CT/USDT ; carnet ancien ; ordre toujours désactivé.
6. **STOP après la qualification** : ne pas toucher à Market Core, graphique, Bridge, paramètres du compte ni autorisations Trade dans cette livraison documentaire.

### Conclusion Seven

**Les conditions inconnues sont désormais identifiées et documentées, pas artificiellement déclarées vérifiées.** Le contrôle décisif supplémentaire est `feeType` en lecture seule, puis les plafonds/limites et la disponibilité propre au compte. Aucun ordre, transfert, conversion ni modification du Trader n'est effectué par cette note.
