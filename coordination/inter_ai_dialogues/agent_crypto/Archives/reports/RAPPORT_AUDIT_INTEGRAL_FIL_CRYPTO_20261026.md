# AETHER · SEVEN HEAVEN
# AUDIT DOCUMENTAIRE INTÉGRAL DU FIL CRYPTO — 26 OCTOBRE 2026

**Objet :** reconstituer la demande fonctionnelle et les interventions ayant abouti aux incohérences des graphiques de l'Interface Agent-Crypto, sans modifier le code ni les archives.

**Source principale :** `Fil.Inteface.Crypto.GPT(20261026-040101).md` (orthographe exacte du fichier). **508 206 lignes**, **21 627 799 octets**, **335 696 lignes non vides** ; SHA-256 : `24370e69c6d2286aa91a50bcb8ba1feee488ee03458fa7b54f36f2df8412e147`.

**Procédure :** chaque ligne du fichier a été lue et numérotée par un programme de contrôle, classée simultanément selon 14 thèmes et conservée sans omission dans `Index_integral_fil_crypto_20261026.csv.gz`. Ensuite, les épisodes identifiés ont fait l'objet d'une lecture contextuelle et d'une analyse des contradictions. Le fichier possède des milliers de lignes de code, de logs, de captures retranscrites et de répétitions ; **la traversée exhaustive est informatique, tandis que l'interprétation humaine/analytique est ciblée sur les séquences probantes.** Ne pas confondre cet audit documentaire avec un audit dynamique complet du code JavaScript ou un test Firefox.

**Référencement :** `L408428` signifie « ligne 408 428 du fichier source ». Les paroles du fil sont distinguées : **demande utilisateur**, **réponse/affirmation d'une IA**, **constat de terrain transcrit**, **résultat de code rapporté**, **hypothèse**. L'ordre physique des lignes reflète la concaténation du fichier ; certaines séquences ont été réexportées, répétées ou citées dans d'autres conversations. Une ligne tardive ne constitue donc pas automatiquement la date réelle d'une opération.

---

## I. Conclusion principale : le cahier des charges a été compris puis perdu de vue

**Constat documentaire fort :** la demande d'origine était un affichage **EUR ↔ USD commun**, avec **USD par défaut** lorsque l'ensemble de l'Interface est prêt, sans altérer les prix natifs et sans détruire le fonctionnement historique EUR. Elle ne demandait pas une succession de correctifs pour Solo, Top 5, Top 3, Hausses 5, Baisses 5 et Volumes 5.

Le **cahier des charges initial** apparaît déjà clairement en `L408428–L408433` : interface « comme OKX », prix USD dans « Lecture Technique, le Market, tout, Profondeur, et le reste », interrogation sur un « switch Euro/USD », puis USD par défaut. La réponse `L408454–L408721` formule une architecture commune et une matrice de couverture préalable, avec séparation entre *devise affichée*, *instrument d'exécution* et *devise native de marché*. Puis, lorsque des incompréhensions persistent, le demandeur rappelle en `L409638` : « relis ton fil, j'ai demandé tout ». La réponse `L409641–L409684` reconnaît avoir réduit une destination globale à une réparation locale.

La formulation définitive apparaît en `L500991–L500994` : garder EUR, ajouter USD, puis « on switche de l'affichage euro a USD et USD est affiché par défault ». La réponse `L501002–L501009` confirme noir sur blanc le contrat : USD par défaut, bouton bidirectionnel, séries historiques réellement USD ou EUR selon les sources, caches séparés et aucun simple changement du symbole monétaire.

**Écart constaté :** bien après ces accords, la ligne `L506067` reconnaît explicitement que le même chemin d'acquisition USD n'est **pas généralisé aux périodes 7 jours, 30 jours et plus**. Le fil `L501189–L501204` décrit le Top 3 encore en euros malgré USD, le Top 5 en dollars, les scanners fragiles, des clés de graphique contradictoires et certains replis de cache dont la devise est mal qualifiée. Il s'agit d'un écart répété entre une règle *globale* et des corrections *locales*.

**Conclusion :** l'échec démontré est celui de la **cohérence transversale** entre modes, périodes, sources, devises et contrôles de validation. Le document ne démontre pas que tous les points historiques seraient fabriqués ; il démontre en revanche que leur association correcte à la période, à la devise et à l'identité du panier n'a pas été globalement garantie.

---

## II. Ce qui était déjà possible avant les complications USD

### II.1. Une application initialement centrée sur l'euro, mais disposant de données en plusieurs devises

- `L20289–L20315` : dès la lignée **26.30**, le détail actif, le graphique et une référence externe peuvent lire **des fournisseurs différents**. Le fil indique : détail parfois CoinLore ; graphe CoinGecko `market_chart` ou cache GitHub ; comparaison visuelle avec CoinMarketCap. Il signale déjà des divergences de prix.
- `L20297` et `L24136–L24158` : une conversion ancienne `eurRate = 0.92` était présentée comme origine possible d'erreurs, lorsqu'un prix CoinLore USD était converti artificiellement en EUR. Ce problème est **antérieur** à la migration USD générale : aucune présomption d'exactitude universelle de l'ancien euro n'est justifiée.
- `L21835–L21895` : le contrat historique de la série EUR était explicite : CoinGecko `market_chart?vs_currency=eur`, une identité de cryptomonnaie, une période, une devise, une source et des points réels. Les pseudo-séries ou instantanés répétés étaient interdits.
- `L24360–L24559` : le fil distingue les cotations directes EUR et USD et souligne qu'un prix direct USD du Market n'est pas une série historique USD. Les deux éléments doivent être acquis et datés séparément.
- `L408454–L408661` : l'architecture prévue identifie la devise d'affichage indépendamment des paires BTC-EUR, BTC-USDC, des résultats d'exécution et des données de preuve. **USD n'est pas USDC ou USDT**.

La présence de `priceEur` et `priceUsd` dans certains snapshots de marché constitue donc une *ressource de cotation*. Elle **ne prouve pas** que les historiques 7 j / 30 j soient déjà disponibles et validés dans chaque devise. C'est une distinction fondamentale oubliée à plusieurs reprises.

### II.2. Un premier avertissement sur la disponibilité des graphiques, bien avant la crise d'octobre

En `L23590–L23641`, une IA décrit l'échec de la version **26.32** : seuil de validité du cache BTC trop court (30 minutes), rejet d'une vraie série, obligation de solliciter CoinGecko depuis Firefox, absence de timeout propre, `NetworkError` puis écran d'erreur disproportionné. La réponse admet que « le moteur graphique est capable de dessiner, mais sa chaîne d'approvisionnement est instable » (`L23596`). Le projet formulait déjà la méthode *stale-while-revalidate* : conserver une courbe réelle, dater son âge et rechercher une donnée plus récente (`L23687–L23724`).

**Enseignement :** les défauts de dépendance au réseau, de caches et de messages d'erreur ne datent pas du seul Top 5. Ils ont une histoire documentée.

### II.3. Six modes et périodes devaient former une seule interface

`L35996–L36006` décrit l'introduction des commandes **Solo, Top 3, Top 5, Hausses 5, Baisses 5, Volumes 5, Réinit., Vider**, avec « Hausses 5 et Baisses 5 suivent la période active 24 h / 7 j / 30 j ». Cette phrase est un engagement fonctionnel **antérieur** aux interventions de fin octobre. Les nouveaux correctifs n'auraient jamais dû ramener ces commandes à des conventions de devise ou de période différentes.

`L60716–L60727` rapporte une autre transformation problématique : passage à un « scanner atomique silencieux », où certains états de progression/échec ont disparu au profit de `console.warn(...)`. Cela illustre la tension historique entre transparence de l'état et disparition de l'information utile. Il ne faut toutefois pas confondre **diagnostic discret** et **masquage de données** : une erreur réseau doit être diagnostiquée sans rendre les vraies cotations invisibles.

---

## III. Chronologie des décisions et dérives EUR / USD

| Références dans le fil | Étape / version / séquence | Ce qui est affirmé dans le texte | Limite ou contradiction à retenir |
|---|---|---|---|
| `L20289–L20315` | Lignée 26.30 | CoinLore / CoinGecko / CoinMarketCap coexistent | Cohérence des sources déjà difficile ; euro historique non présumé exact |
| `L21835–L21895` | Contrat séries EUR | `market_chart?vs_currency=eur`, intégrité de la série | Existence du socle EUR, pas certification générale |
| `L23590–L23641` | 26.32 | Rejet abusif du cache, erreurs réseau et écran d'erreur | Problème récurrent de disponibilité, connu bien avant USD |
| `L35996–L36006` | Six commandes graphiques | Hausses / Baisses suivent déjà 24 h, 7 j, 30 j | Contrat global de modes et périodes établi |
| `L408428–L408433` | Demande générale USD | USD partout, style OKX, envisager un switch EUR/USD | Demande non limitée à Solo ou Lecture Technique |
| `L408454–L408721` | Conception discutée | Matrice complète, source native et devise d'affichage séparées, validation Firefox avant USD par défaut | Plan reconnu mais non appliqué comme verrou de livraison |
| `L408852–L408924` | 40.6.514, premier routeur | Bouton USD actif mais Oracle et graphique encore EUR ; la réponse reconnaît un post-traitement réécrit ensuite par le propriétaire historique | Échec d'architecture du mécanisme « repeindre après rendu » |
| `L409550–L409604` | 40.6.517 / .518 | Base .517 déclarée stable ; .518 étend USD au Market et à la Fiche | Graphique et autres panneaux encore hors champ |
| `L409611–L409684` | Rappel explicite | Une IA réduit d'abord le chantier à Lecture Technique puis reconnaît « tu as demandé tout » | Preuve directe du défaut d'écoute/cadrage |
| `L410296–L410309` | 40.6.520 / PR #81 | Historique graphique natif USD annoncé, caches USD séparés, CI PASS | Firefox encore `PENDING`, couverture de tous les modes non démontrée |
| `L410313–L410323` | 40.6.521 / 40.6.522 | Carnet multi-quote puis USD par défaut, EUR sélectionnable | `ANALYSIS` et `EXEC` restent EUR : séparation volontaire, mais intégration UI non exhaustive |
| `L442485–L442551` | Correctif Top 5 | Prix USD de l'infobulle proposés ; courbes historiques EUR conservées | L'achèvement des historiques USD Top 5 est explicitement déclaré **incomplet** |
| `L496150–L496207` | Top 5 panneau | `atlasExternalChartTooltip()` identifié, correction associée au module USD | Test du panneau seul ne valide ni la période ni tous les modes |
| `L500870–L500933` | Alertes scanners | Hausses, Baisses, Volumes utilisent encore des chemins historiques EUR en mode USD ; prix stablecoins suspectement ~0,999 € | Affichage EUR d'une valeur de niveau USD possible ; identification exacte encore à faire |
| `L500991–L501018` | Cahier des charges répété | Switch EUR/USD, USD par défaut, caches distincts ; six vues non unifiées | Demande générale rappelée après de multiples versions |
| `L501025–L501055` | Patch préparé | 8 tests réussis ; réparation partielle et non publiée à cet instant | Les tests ciblés ne prouvent pas l'Interface complète |
| `L501057–L501093` | Demande « prix, pas indisponible » | Un autre correctif ciblé est annoncé, 9 tests/9, publication main et Pages | Validation terrain reste à faire ; pas de garantie de données fraîches |
| `L501143–L501167` | Régression et rollback | Firefox révèle un échec ; retour arrière déployé | Livraison publiée puis annulée, sans validation d'ensemble |
| `L501169–L501251` | Audit général demandé | Top 3 en EUR pendant USD, Top 5 en USD, scanners intermittents, clés de comparaison divergentes | Six modes diagnostiqués, mais aucune preuve complète 6 × devises × périodes |
| `L501370–L501414` | Patch Top 3 | Tests et publication Top 3 USD annoncés | La suite du fil admet explicitement que le graphique global n'est pas réparé |
| `L501447–L501506` | Scanners Hausses/Baisses/Volumes | Nouvel unique fichier de production, routage EUR pour Base 100 et prix Market USD | Historiques natifs USD complets toujours non obtenus |
| `L501510–L501539` | Apparition de XRP dans Hausses 5 | Scanner saute les cinq premiers dont les historiques ne s'alignent pas et choisit les suivants | Les « 5 gagnants » du graphique ne sont plus ceux du Market |
| `L501595–L501615` | Nouvel échec Top 3 | Top 3 sélectionné mais dernier graphique Top 5 visible | Intention de commande ≠ état effectivement rendu |
| `L501979–L502023` | Essai de réduction des candidats | Proposition de limiter à cinq et d'accepter un résultat 3/5 | Une proposition locale non démontrée réintroduit une dette fonctionnelle |
| `L503535–L503591` | Rollback pendant les essais | La réponse reconnaît explicitement avoir retiré la version testée avant la fin des tests Firefox | Faute de procédure de validation et de conservation des builds de test |
| `L504900–L505039` | Plan P1/P2/P3 | Référence Market unique, collecte historisée, pas de substitution, tests | Plan correct, mais ne constitue pas une validation complète |
| `L505260–L505418` | P1/P2 | Identités des cinq gagnants correctes, variations divergentes ; 17 h possibles pour un écran « 24 h » | Un affichage 5/5 ne prouve pas 24 h de données comparables |
| `L505952–L505992` | BR / Bedrock | Solo sait récupérer BR USD tandis que Hausses 5 échoue | Deux collecteurs concurrents pour le même actif et la même période |
| `L506003–L506067` | PR #688 | Collecteur USD natif réutilisé pour le scanner 24 h, 5/5 observé | **Pas de généralisation à 7 j, 30 j, etc.**, explicitement reconnue |
| `L506098–L506149` | P3 envisagé | Fraîcheur Market et historique anticipé, couverture au-delà des cinq gagnants | La proposition/annonce d'exécution n'établit pas une P3 publiée et validée |

**Remarque sur les numéros de versions :** plusieurs passages citent des branches, commits et PR ; leur présence dans une réponse ne vaut pas à elle seule preuve qu'un correctif a réussi dans Firefox. Pour établir une livraison effective il faut le commit exact publié, sa version réellement déployée et un contrôle terrain correspondant au même code. Le fil lui-même réclame constamment cette distinction.

---

## IV. Diagnostic fonctionnel des six modes

| Mode | Comportement recherché | Ce que le fil démontre | Défaut/non-preuve restante |
|---|---|---|---|
| **Solo** | Un actif, série et prix de même devise et même période | Certaines vues 24 h EUR et USD montrent de vrais historiques ; le cas BR fonctionne en USD dans Solo (`L505970–L505992`) | Pas de certification universelle par actif/période ; différencier dernier point de cotation « live » |
| **Top 3** | Les trois actifs de la sélection canonique, en EUR ou USD | Affichage EUR sous choix USD (`L501189`), puis correctif ciblé ; ancienne vue Top 5 parfois conservée (`L501597–L501605`) | Clé/identité du panier et transitions entre modes insuffisamment éprouvées |
| **Top 5** | Cinq séries fidèles, mêmes périodes, même devise que l'affichage | Cinq prix USD et cinq courbes visibles sur certaines captures (`L501190`, `L501597`) ; mais historique EUR conservé reconnu ailleurs (`L442490–L442491`) | Présence des cinq courbes ≠ historiques natifs USD vérifiés ; les périodes longues restent à auditer |
| **Hausses 5** | Les cinq premières hausses du Market sur la période choisie | XRP apparu à tort parce que le scanner a substitué des actifs plus faciles à grapher (`L501515–L501539`) ; P1 a corrigé la sélection dans une phase ultérieure | Couverture historique, identité, 24 h réelles, USD 7 j/30 j et transitions encore non certifiés |
| **Baisses 5** | Les cinq premières baisses avec leurs historiques, sans substitution | Échecs et absence de séries rapportés (`L500920–L500927`, `L501192`, `L501615`) | Défaut réseau/collecte et compatibilité de fenêtres ; pas de preuve complète du mode |
| **Volumes 5** | Cinq plus grands volumes **24 h**, prix et historique dans la devise sélectionnée | `volume24h` et `fmtCompactEUR` signalés dans l'audit (`L501202`), prix ~0,999 € suspect pour des stablecoins (`L500899–L500914`) | Ne pas confondre le *classement des volumes* avec la *devise du prix* ou la *devise native du volume* |

**Élément décisif :** un même composant ne peut pas déclarer un mode « valide » simplement parce que des séries sont visibles. Il doit prouver l'accord entre **intention utilisateur, panier exact, fenêtre horaire, devise et source.**

---

## V. Arbre des causes identifiées dans le dossier

### V.1. Absence de propriétaire unique de l'état graphique

Le fil `L501197–L501232` cite deux clés concurrentes pour la même comparaison : `comparison:bitcoin,ethereum,binancecoin:1` contre `comparison:bitcoin,ethereum,binancecoin:1:USD` (`L501209–L501214`). Un état peut donc être accepté par un module et refusé par l'autre. Conséquence observable : Top 3 sélectionné, ancienne comparaison Top 5 toujours dessinée (`L501597–L501605`). **Niveau de preuve :** audit de code et symptôme rapportés dans le fil ; à confirmer sur HEAD concerné lors de la correction.

### V.2. Affichage et valeur source n'ont pas la même vérité de devise

L'architecture utilise des prix directs `priceUsd`/`priceEur`, des séries CoinGecko EUR/USD, des bougies de paires de marché en EUR, USDC ou USDT et des caches historiques. Un formateur doit utiliser la devise **de la valeur**, pas seulement la préférence UI. `L500902–L500914` expose un prix USDT ~0,999 € potentiellement correspondant à un niveau en dollars ; la réponse fournit **deux hypothèses**, série USD mal formatée ou série EUR inappropriée : elle **ne tranche pas** la cause exacte. `L501201` signale également un repli pouvant attribuer `currency: "USD"` sans vérification réelle : c'est un **risque de fausse étiquette**, pas une preuve que tous les historiques sont fabriqués.

### V.3. Prix spot et prix d'une série historique sont confondus dans l'usage

Un `priceUsd` actuel peut venir de CoinGecko à `T1`, alors qu'une série historique est arrêtée à `T0` ; leurs valeurs et variations diffèrent légitimement. Mais si leurs dates ne sont pas présentées et que la comparaison « 24 h » désigne 17 heures de données, l'usage devient trompeur. `L505341–L505358` fournit un exemple : BR +4,42 % dans le Market, −1,52 % sur la courbe ; `L505401–L505418` identifie une fenêtre tronquée. Les différences ne sont pas toutes attribuables à EUR/USD ; **la dimension temporelle doit être corrigée**.

### V.4. Modes « Top » et scanners n'avaient pas la même logique de sélection

`L501539` : le scanner rejetait des actifs dont les historiques n'étaient pas alignables et prenait des remplaçants mieux couverts. L'utilisateur avait demandé les meilleurs du **Market**, pas les plus faciles à télécharger. La sélection ne doit donc pas dépendre de la disponibilité graphique. Le système doit préserver la liste gagnante, puis acquérir les séries correspondant à ces identités.

### V.5. Caches et acquisitions présentent une double difficulté

1. **Qualité du cache :** fraîcheur de son écriture ≠ fraîcheur de son dernier point ; couverture de 17 h ≠ 24 h (`L505418–L505434`).
2. **Disponibilité de l'acquisition :** CoinGecko depuis Firefox peut refuser/retarder une requête, selon quotas, connexion, CORS, limites API ou filtres ; les captures ne permettent pas d'attribuer une cause unique (`L23624–L23632`, `L505952–L505961`).

Les historiques disponibles doivent être préservés avec leurs métadonnées, les compléments cherchés progressivement, et les erreurs réseau ne doivent pas être « réparées » par une fausse devise.

### V.6. Des correctifs locaux ont remplacé la preuve du contrat transversal

Le fil enchaîne Top 5, Top 3 puis Hausses/Baisses/Volumes, avec des suites de tests **7/7, 8/8, 9/9 et 12/12** (`L496180–L496205`, `L501025–L501051`, `L501071–L501087`, `L501447–L501478`). Mais `L501143–L501167` relate une régression immédiatement révélée dans Firefox malgré une publication annoncée. Le même mécanisme est ensuite étendu à 24 h mais pas aux autres périodes (`L506063–L506067`).

Un test local correct ne devient pas « un mensonge » du seul fait qu'il passe : il certifie **son périmètre**, pas les comportements non exercés. **La faute de méthode** est d'avoir confondu ce périmètre limité avec la fiabilité globale.

### V.7. Mauvaise séparation entre validation et mutation de production

`L503535–L503591` décrit un rollback déclenché pendant que l'utilisateur testait. La réponse le reconnaît comme décision prématurée. Une validation dans Firefox nécessite une **cible stable et immuable** identifiée par commit et URL : sans cela, les observations ne sont plus comparables. Aucun rollback automatique ni réécriture du même build pendant la campagne de tests.

### V.8. Couverture fonctionnelle trop étroite des vérifications

Le cahier des charges couvre au minimum **6 modes × 7 périodes × 2 devises = 84 scénarios** de sélection. À cela s'ajoutent vue Prix/Base 100, changement d'actif, écriture/lecture cache, acquisition échouée, rechargement Firefox, source Binance/CoinGecko, F11, cohérence du panneau de prix et de la Lecture Technique. Le document ne fournit **pas** de certification de cette matrice exhaustive, malgré les annonces de succès sur des cas isolés.

### V.9. Fraîcheur Market non garantie par un workflow vert

`L506138–L506143` rapporte un dernier snapshot Market généré à 02:47:55, heure de Paris, encore consommé bien après. Le fil mentionne un collecteur planifié et un watchdog de relance. **Un workflow successful ne prouve pas que la cotation disponible est récente.** Les métriques indispensables sont : date de création du snapshot, âge du dernier prix par actif, exécution du collecteur, état de publication, heure effective de lecture de la page.

### V.10. Dette de présentation plus large que le graphique

De nombreux épisodes anciens mentionnent des réparations CSS, F11, fenêtres Aether, profondeur, mises en page, interfaces Web Classic / Administrator / Trader / Operator. Ils démontrent qu'un processus de modifications répétées sans propriétaire clair a eu un coût transversal. **Ne pas mélanger** ces autres chantiers au correctif des données historiques ; leur conservation est une contrainte de non-régression, et non une invitation à les réécrire.

---

## VI. Les données : ce que l'on peut dire, ce que l'on ne peut pas dire

**États distincts à conserver :**

1. **Vérifié par lecture du fil :** le demandeur a demandé un switch général et USD par défaut ; des réponses ont reconnu des corrections locales, une migration historique incomplète, des clés de comparaison incohérentes, des séries mal qualifiées, des fenêtres temporelles tronquées et un rollback pendant les tests.
2. **Observable dans les captures annexées après l'export du fil :** Hausses 5 / 30 j passe de 4 à 5 courbes ; certaines tables affichent `€` en environnement globalement orienté USD ; la sélection 24 h peut conserver une courbe 7 j ; des erreurs réseau CoinGecko apparaissent ; BTC Solo EUR présente des cotations distinctes entre graphe, Market et fiche.
3. **Calcul interne cohérent, pas certification de prix :** un pourcentage calculé à partir du premier et du dernier point affichés peut être arithmétiquement exact tout en reposant sur la mauvaise devise, la mauvaise période ou un historique périmé.
4. **Non vérifié :** exactitude des centaines de points de chaque série contre l'API d'origine aux mêmes dates ; fiabilité des données stockées dans la base locale du navigateur ; couverture 84 scénarios ; réussite de toutes les surfaces EUR et USD ; rendement ou risque réel d'une opération de trading.
5. **À ne pas affirmer :** « tout le Coffre est détruit », « chaque prix EUR est correct », « chaque point historique est inventé », « le passage USD est totalement achevé », « un PASS CI vaut PASS Firefox ». Aucun de ces verdicts globaux n'est établi par le fichier.

**Règle d'usage :** jusqu'à vérification des sources et des périodes, ne pas utiliser les comparaisons graphiques de cette version comme preuve pour engager de l'argent réel. Cela n'impose pas de supprimer les graphiques ; cela impose d'en qualifier correctement les séries.

---

## VII. Conditions minimales d'une architecture remise en cohérence

Le point de départ n'est pas « réécrire l'application », mais **éliminer les contrats incompatibles** dans la chaîne existante :

### VII.1. Sélecteur de devise

Un état canonique `displayCurrency ∈ {EUR, USD}`. Il est lu par les mêmes propriétaires pour : axes, légende, infobulle, panneau des prix, fiche, Market, Lecture Technique et Oracle. **USD par défaut**, retour EUR possible. La paire de trading BTC-EUR / BTC-USDC, les preuves Strategy/Evidence et le solde ne changent pas automatiquement quand on bascule une simple préférence d'affichage.

### VII.2. Enregistrement de série

Chaque série doit être traçable par `coinId`, `symbol`, `periodRequested`, `periodCoveredStart`, `periodCoveredEnd`, `source`, `sourceMode`, `quoteCurrency`, `displayCurrency`, `collectedAt`, `lastObservedAt`, `pointCount` et état de validation. **La devise n'est pas déduite du bouton actif au moment du rendu.** Conserver les archives originales.

### VII.3. Source canonique pour sélectionner les actifs

Le **Market** classe selon un snapshot daté. Solo et Top 3 / Top 5 ont des conventions de sélection explicites. Hausses et Baisses prennent les cinq premiers du classement sur la période demandée ; Volumes prend les plus gros volumes 24 h. Le collecteur ne remplace jamais une cryptomonnaie par une autre sous prétexte qu'il dispose déjà de son historique.

### VII.4. Une seule politique historique, avec plusieurs fournisseurs qualifiés

Réutiliser les séries natives existantes, acquérir le complément EUR ou USD réel lorsque nécessaire, préserver les caches distincts et refuser la conversion de libellé. Binance EUR, CoinGecko USD/EUR, OKX USDC/USDT n'ont pas la même sémantique ; ils peuvent être utilisés si les instruments, taux explicites et horodatages les rendent réellement compatibles. Un système *stale-while-revalidate* ne doit pas faire passer une série ancienne pour une courbe fraîche.

### VII.5. Transition atomique de l'état graphique

Au clic, capturer **mode + période + devise + liste d'identifiants + requête** comme une transaction. Si une nouvelle réponse arrive, vérifier qu'elle correspond encore exactement à cette transaction avant de l'afficher. Si le rendu précédent est conservé, ne pas laisser l'Interface prétendre que les nouveaux paramètres ont été appliqués : la source doit toujours être identifiable. Le système doit chercher à afficher des prix réels, sans les masquer par des conditions spéciales de mode.

### VII.6. Pas de correctif spécial par cryptomonnaie ou par bouton

Les exemples BR, CAP, Q, KNTQ, PEARL, BTC ou XRP servent de *cas de tests*. Ils ne justifient pas d'ajouter une branche de code particulière pour chacun. Toute correction de collecte s'applique à **tous les identifiants compatibles**, puis passe la matrice de non-régression.

---

## VIII. Validation minimale avant toute nouvelle publication

Le fichier associé `Matrice_validation_graphique_EUR_USD_84_cas.csv` contient les **84 scénarios de base**, tous marqués **NON EXÉCUTÉ**. Aucune réussite n'a été inventée.

Pour chaque cas, relever réellement :

- choix de devise au démarrage, puis basculement USD → EUR → USD ;
- période demandée et plage temporelle réelle des points ;
- ID du panier sélectionné dans le Market et liste réellement dessinée ;
- source et devise native de chaque série ;
- axe, infobulle, légende, bandeau, tableau de prix et fiche ;
- prix « live » distinct des historiques, avec leurs heures réelles ;
- disponibilité et identité du cache avant/après actualisation ;
- comportement lors d'un `NetworkError`, d'un 429, d'un timeout et d'une réponse tardive ;
- stabilité après changement de mode, `Vider`, `Réinit.`, F11 et rechargement Firefox ;
- absence de substitution d'actif, de fenêtre incomplète présentée comme complète et de simple renommage monétaire.

**Livraison défendable :** tests unitaires pertinents + vérification d'intégration sur vrai moteur + série de captures Firefox contrôlées sur un **commit de test immuable**. Le propriétaire humain valide avant fusion sur la version stable. Ne pas modifier la cible pendant les essais.

---

## IX. Autres enseignements du fil complet, hors crise EUR/USD

Cette conversation de plus d'un demi-million de lignes ne traite pas exclusivement des devises. Elle retrace l'évolution globale d'Agent-Crypto. Les autres branches influencent le périmètre à protéger :

**Market & univers.** Passage progressif de Top 50 à 100/250 et Extended 750 vers 1000 actifs ; classements par capitalisation, hausses, baisses, volume, nouveaux listings et catégories. La connaissance d'un actif dans le Market n'assure pas qu'une plateforme l'offre au comptant.

**Collecte & mémoire.** Différence entre caches locaux navigateur (IndexedDB/localStorage), snapshots publics GitHub, archives de bougies et profondeurs d'ordre natives. Le fil répète que la mémoire peut être grande tout en laissant certains actifs/périodes sans série compatible. Un snapshot actuel ne remplace pas un historique.

**Trader / Operator.** L'Administrator est traité comme source de référence ; Trader et espace Operator/Yoann doivent réutiliser ses composants, plutôt que diverger silencieusement. Les forks et dépôts privés ont leur propre historique et ne doivent pas être modifiés lors d'un correctif graphique général sans preuve.

**Trading réel et PAPER.** Les études Radar 20, OKX Europe, carnets, frais et micro-exécution sont distinctes de l'affichage. La séparation `DISPLAY`, `EXEC`, `SETTLE` est une exigence de sécurité financière. Aucun affichage USD ne peut transformer rétroactivement un prix ou un frais exécuté en EUR.

**Qualité logicielle & humain.** Le fil rapporte à de multiples reprises la saturation des conversations, les interruptions de réponse, les tests sur Firefox qui contredisent des succès automatiques, l'empilement de corrections CSS/JS, le coût des régressions et l'importance des snapshots GitHub, ZIP, manifestes et passations Notion. Une démarche techniquement prudente doit aussi réduire les demandes de manipulation répétitives à l'utilisateur.

Ces thèmes sont documentés dans l'index intégral sans être confondus avec la cause racine particulière du switch EUR/USD.

---

## X. Plan de sauvetage raisonné et limites

**Étape A — Geler les preuves** : enregistrer le SHA du dernier code, les captures, les caches et les snapshots de référence sans purger ni rollback. Ne pas déclarer une ancienne version « bonne » sans contrôle de ses sources.

**Étape B — Cartographier les propriétaires** : dans `administrator/app.js`, `js/graph-native-usd-406520.js`, `js/quote-currency-architecture-406497.js`, et les modules de Market/Lecture Technique, localiser qui sélectionne la série, qui définit la devise, qui forme la clé, qui sauvegarde/restaure le contexte, qui dessine les prix. Faire une table *un rôle → un propriétaire* plutôt qu'ajouter un nouveau routeur.

**Étape C — Valider les données brutes** : pour BTC EUR/USD et un panier de cinq actifs dont un sans cache, contrôler des séries natives contre leur source, leur paire et leur fenêtre réelle. Marquer clairement « données non vérifiées » dans **l'audit**, pas imposer de nouveau panneau d'erreur permanent dans l'application.

**Étape D — Unifier les contrats** : même sérialisation d'identité, période et devise pour les six modes et deux devises ; aucun stockage EUR sous une clé USD ; aucune courbe 7 j étiquetée 24 h ; pas de classement modifié pour trouver plus facilement cinq historiques.

**Étape E — Tests et publication contrôlés** : exécuter la matrice 84 cas avec variantes réseau/cache ; publier d'abord sur une cible de test immuable ; valider les captures ; seulement après fusionner. Journaliser chaque modification Git et Notion ; ne pas remplacer silencieusement le build en cours de test.

**Pas de promesse de réparation parfaite** : il faudra réellement lire le code complet actuellement déployé et comparer des historiques externes aux mêmes timestamps. Cet audit documentaire ne suffit pas à affirmer que le moteur est déjà corrigé ou que tous les anciens prix ont été vérifiés.

---

## XI. Inventaire de preuves prioritaires (lignes source)

| Passage | Nature | Ce qu'il prouve ou rapporte |
|---|---|---|
| `L20289–L20315` | Diagnostic historique | Fournisseurs divergents et conversion CoinLore fixe |
| `L21835–L21895` | Contrat architectural | Série EUR native avec identité, période et source |
| `L23590–L23641` | Reconnaissance d'échec | Cache 30 min trop strict ; dépendance réseau ; écran d'erreur |
| `L35996–L36006` | Spécification six modes | Hausses/Baisses suivent une période choisie |
| `L60716–L60727` | Évolution scanner | Suppression d'informations de progression et d'échec |
| `L408428–L408433` | **Demande utilisateur** | USD partout, switch EUR/USD, USD par défaut à terme |
| `L408454–L408721` | Réponse de conception | Architecture unifiée et matrice proposées |
| `L408852–L408924` | Défaut .514 | Sélection USD sans rendu USD après repeinture EUR |
| `L409611–L409684` | **Contradiction reconnue** | Réduction de « tout » à Lecture Technique puis rectification |
| `L410296–L410323` | Livraison alléguée | USD Graph native, Depth multi-quote, default USD ; Firefox encore à tester |
| `L442485–L442551` | Bilan Top 5 | Prix USD ajoutés mais historiques EUR conservés |
| `L496150–L496207` | Audit technique | Deux propriétaires pour l'infobulle et son affichage |
| `L500870–L500933` | Diagnostic comparaisons | L'ancien circuit historique EUR persiste ; Volumes suspect |
| `L500991–L501009` | **Demande confirmée** | Switch EUR/USD, USD par défaut, caches par devise |
| `L501057–L501097` | Correctif local | Tests 9/9 et publication, sans preuve Firefox |
| `L501143–L501167` | Régression | Patch échoué sur Firefox et annulé |
| `L501189–L501232` | **Audit six modes** | Top 3 EUR, clés incompatibles, valeurs USD mal étiquetées |
| `L501370–L501414` | Top 3 | Réparation locale livrée ; six modes non certifiés |
| `L501447–L501461` | Scanners | Historique Base 100 EUR maintenu sous prix spot USD |
| `L501515–L501539` | Identité sélection | XRP prend la place d'un vrai gagnant selon disponibilité historique |
| `L501597–L501615` | État graphique | Top 3 sélectionné mais Top 5 conservé |
| `L503535–L503591` | Processus de test | Rollback pendant Firefox reconnu comme prématuré |
| `L505341–L505418` | Fenêtre temporelle | BR et différence 17 h / 24 h malgré 5/5 |
| `L505970–L505992` | Acquisition | BR fonctionne en Solo USD, échoue dans Hausses 5 |
| `L506003–L506067` | PR #688 | Correctif scanner USD **seulement 24 h** |
| `L506098–L506149` | Plan P3 | Réserve historique anticipée et fraîcheur Market : livraison non établie |

---

## XII. Verdict final de l'audit documentaire

**1. La demande de l'utilisateur était compréhensible et répétée.** L'Interface devait conserver EUR et ajouter USD par un choix global, avec USD par défaut, sans confondre les paires d'exécution ni maquiller les valeurs. Ce n'était pas une demande implicite ou tardive.

**2. La méthode de livraison s'est écartée de cette exigence.** Les correctifs successifs ont répondu au symptôme visible du moment (Top 5, Top 3, scanner 24 h) au lieu de certifier d'abord le contrat transversal. Le fil contient des reconnaissances explicites de cette réduction de périmètre.

**3. Des défauts techniques tangibles s'ajoutent au mauvais cadrage.** Clés de comparaison divergentes, caches imparfaitement qualifiés, plages historiques tronquées, prix spot/historique désynchronisés, sélection de gagnants modifiée par disponibilité des séries, erreurs réseau et états graphiques obsolètes constituent des défaillances différentes. Une correction limitée au symbole ou au panneau ne peut pas les résoudre.

**4. Ni « tout est faux », ni « l'ancien EUR est bon » ne sont vérifiés au sens des données brutes.** Le système de présentation actuel présente des incohérences importantes ; certaines séries réelles et certains calculs peuvent demeurer utilisables après vérification. La préservation des historiques est donc impérative.

**5. La bonne réparation reste possible en principe mais n'est pas réalisée par ce rapport.** Elle exige un audit de source, puis une intégration générale des six modes × sept périodes × deux devises avec validation du code réel et des données réelles. Il serait trompeur d'annoncer le chantier terminé maintenant.

**État des interventions liées à ce rapport :** **aucune modification du dépôt GitHub, d'IndexedDB, de Notion, des workflows ou de l'Interface**. Les seuls fichiers créés sont des livrables de diagnostic locaux : le rapport, l'index intégral, les statistiques de lecture et la matrice de tests non exécutés.

---

### Fichiers associés

- `Fil.Inteface.Crypto.GPT(20261026-040101).md` — source originale, inchangée.
- `Index_integral_fil_crypto_20261026.csv.gz` — **une ligne d'index par ligne source**, texte original conservé et catégories de recherche ; 508 206 lignes indexées.
- `Statistiques_integrales_fil_crypto_20261026.json` — empreinte, comptages, thèmes et distribution par blocs de 25 000 lignes.
- `Matrice_validation_graphique_EUR_USD_84_cas.csv` — 84 scénarios, aucun résultat inventé, colonnes prévues pour les preuves réelles.

*Seven Heaven — rapport documentaire et diagnostic de cohérence, non certificat de correction logicielle.*
