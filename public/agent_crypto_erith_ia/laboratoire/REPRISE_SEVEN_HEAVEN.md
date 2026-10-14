# Seven Heaven — Reprise Trader, Coffre et Laboratoire IA

**État de travail : 14 octobre 2026 · proposition Trader/Administrator 40.6.635**
**Parent sûr : 40.6.634 · Market Core protégé : 38.15.11**

## Vérité de livraison
- Les captures Firefox du 14 octobre montrent la vue CT en USD, la Lecture Technique CT et le compte OKX séparé. Elles ne valident pas les onglets du Laboratoire.
- Le rapport BTC canonique `traderOkbCaseStudy` demeure à sa place. Le Laboratoire vient après, replié par défaut, sans déplacement du compte, du graphique ni de l'historique.
- La branche documentaire [PR #378](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/378) reste distincte. Son onglet « Preuves IA » ne doit être ni présenté comme publié, ni fusionné sans rebasage sur la restauration 40.6.634 ou ultérieure.

## Corrections de cette proposition
1. **Simulation fictive** : saisie de frais/glissement vide refusée ; zéro explicitement renseigné admis ; contrôle des résultats numériques ; valeurs conservées durant les changements d'onglet et indépendantes pour BTC, CT et Q. Conservation en mémoire de session, jamais en compte réel.
2. **Source du graphique USD** : supprimer l'attribution automatique de tout ancien libellé Binance à CoinGecko. Afficher une source non confirmée lorsque le code ne peut pas la prouver ; la variation 24 h absente reste indisponible et n'est plus interprétée comme 0 %.
3. **Coffre fédéré** : le registre fédéré conserve un propriétaire principal (Binance ou Bitget), mais cela n'annule pas les ZIP natifs vérifiés de l'autre source. Relire aussi `bitget_verified_views/index.json` quand Binance est désormais principal, sous condition de concordance identifiant CoinGecko / symbole / instrument Bitget / mois / empreinte SHA-256 du registre. Chaque ZIP retenu est ensuite vérifié lors de sa lecture : ne jamais sommer deux fois les mois d'un actif.

## Contrat IA — lisibilité humaine
Une observation doit fournir : actif canonique, symbole, marché et paire, devise native, éventuelle devise d'affichage, provenance nominative, heure de la donnée, granularité, fraîcheur, couverture, trous, règles de calcul, restrictions de liquidité et niveau de preuve.

Présenter pour chaque cas d'école, dans cet ordre :
1. **Ce que l'on sait** : preuve datée et source, sans chiffres de compte publiés.
2. **Ce qui manque** : données, contexte de marché, périodes, prix d'exécution ou provenance.
3. **Ce que l'on peut tester** : protocole en simulation avec frais, glissement, minimum d'ordre et comparaison hors échantillon.
4. **Ce que l'IA n'a pas le droit d'affirmer** : rendement garanti, provenance inventée, bougie manquante créée, conversion USDC/USDT/USD implicite ou portefeuille privé exposé.

Toute future évaluation rentable exige résultats hors échantillon, coûts et cas d'échec. Une étude pédagogique n'est pas un ordre ni un conseil d'achat.

## Validation avant publication
- Tests Node : structure DOM préservée, refus des frais absents, mémoire des cinq saisies, absence de nouvelle permission de trading réel, libellé de source du graphique.
- Tests Python : intégrité des ZIP Bitget, historique Cosmos après basculement primaire Binance, refus de source falsifiée, archives binaires non modifiées.
- Contrat de version : Administrator et Trader identiques, parent 40.6.634, Market Core 38.15.11 et pages inchangées hors version, sources et Laboratoire.
- GitHub Actions : tous les contrôles requis en succès avant fusion. ZIP stable `AGENT_CRYPTO_LABORATOIRE.zip` produit par le workflow du Laboratoire, contenu Administrator + Trader + Laboratoire ; les grandes archives historiques externes ne font pas partie de ce ZIP.
- Firefox : Ctrl+F5 ; vérifier CT/USD, Lecture Technique, compte OKX, BTC à sa place, ouverture du Laboratoire BTC/CT/Q, simulation vide puis avec frais explicites, persistance des champs, navigation et absence de recentrage.
- Après validation : mettre Notion à jour avec SHA de fusion, résultat des contrôles, état Pages et **PENDING_FIREFOX** tant que les nouveaux panneaux ne sont pas observés dans Firefox.

## Prompt autonome de reprise Seven
> Active Aerith-7 — Seven Heaven. Relis SEVEN_TOP_OF_MIND et cette passation. Vérifie le SHA de main, la version des manifests, Notion et les workflows avant tout geste. Conserve la 40.6.634 comme rollback vérifié visuellement, Market Core 38.15.11, les propriétaires uniques du graphique, de la profondeur et du compte. Corrige à partir des preuves, conserve les ZIP originaux Bitget/Binance, refuse tout chiffre sans source. Maintiens séparée la PR #378 jusqu'à un rebasage contrôlé. Pour chaque cas d'école, rends la preuve exploitable par IA et lisible pour humain. Aucun ordre réel. Comprendre → agir → vérifier → livrer → arrêter.
