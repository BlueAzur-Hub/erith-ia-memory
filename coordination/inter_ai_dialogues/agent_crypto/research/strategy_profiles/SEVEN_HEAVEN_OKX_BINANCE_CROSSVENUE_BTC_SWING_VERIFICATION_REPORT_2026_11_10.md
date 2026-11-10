# Seven Heaven — Vérification Swing sur OKX BTC/USDC et Binance BTC/USDT

**Date de réception :** 10 novembre 2026 · **Périmètre :** recherche IA Seven Heaven, sans opération financière.  
**Statut :** vérification historique entre deux sources réellement effectuée et contrôlée automatiquement. **La viabilité des stratégies Swing reste NON DÉMONTRÉE.**

## Résultat essentiel pour les IA

La même recherche a été exécutée sur **les mêmes 183 journées du 1er avril au 30 septembre 2026** avec les règles préalablement décrites dans la [recherche des trois méthodes Swing](./SEVEN_HEAVEN_BTC_SWING_EVIDENCE_BASED_REASSESSMENT_2026_11_10.md).

| Approche, capital fictif pouvant engager 100 %, coûts inclus | OKX BTC/USDC | Binance BTC/USDT |
|---|---:|---:|
| **Repli dans la tendance** | 0,00 % (0 opération) | 0,00 % (0 opération) |
| **Cassure des plus hauts** | −3,78 % (1 opération, 0 gagnante) | −3,75 % (1 opération, 0 gagnante) |
| **Rebond RSI** | 0,00 % (0 opération) | 0,00 % (0 opération) |
| **Achat et conservation, même fenêtre** | +22,32 % | +22,10 % |

**Avec 25 % de capital engagé au maximum**, le Swing sur cassure donne respectivement **−0,95 % OKX** et **−0,94 % Binance**, contre un Buy & Hold initialement exposé à 25 % de **+5,58 % OKX** et **+5,52 % Binance**. Les deux autres méthodes Swing n'ont pas acheté.

### Conclusion à ne pas inverser

**Sur ce segment précis, les deux sources racontent quasiment la même histoire** : les règles choisies ont laissé passer une partie importante de la progression du prix. Elles ne sont pas validées comme stratégie rentable sur cette période. Le fait que les résultats se ressemblent entre deux plateformes vérifie surtout **la sensibilité à la source**, pas la viabilité.

**Ce n'est pas une preuve que le Swing Trading ne sert à rien** ; le Swing Trading regroupe de nombreuses configurations. On ne doit ni sauver une mauvaise règle en modifiant ses paramètres après avoir vu la courbe, ni abandonner toute la famille sur six mois.

## Preuves et contrat de données

- [Vérification automatisée GitHub Actions du 10 novembre — SUCCÈS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/42884464618), avec deux fichiers de preuves téléchargeables depuis cette exécution (durée de conservation CI limitée).
- [Résultats JSON vérifiés, conservés durablement pour les IA](./SEVEN_HEAVEN_OKX_BINANCE_MATCHED_SWING_VERIFIED_EVIDENCE_2026_11_10.json), 12 résultats (3 méthodes × 2 niveaux de capital × 2 plateformes), et les conditions de comparaison.
- [Contrôle public des archives OKX](./SEVEN_HEAVEN_OKX_BTC_USDC_HISTORY_READONLY_COVERAGE_CHECK.mjs) : **446 journées clôturées consécutives du 21 août 2025 au 9 novembre 2026**, directement par `GET /api/v5/market/history-candles` de **OKX Spot BTC-USDC**, taille de bougie `1Dutc`, sans donnée privée. **Cet accès public n'a retourné aucune bougie antérieure au 21 août 2025 dans la pagination testée : ne PAS prétendre qu'il n'existe aucun historique plus ancien ailleurs.** OKX propose également [des archives téléchargeables](https://www.okx.com/historical-data) ; leur couverture doit être vérifiée séparément si des années antérieures sont nécessaires.
- [Calcul comparatif indépendant et reproductible](./SEVEN_HEAVEN_OKX_BINANCE_MATCHED_WINDOW_SWING_VERIFICATION.mjs) : mêmes dates, **223 journées d'amorçage des indicateurs depuis le 21 août 2025**, mêmes règles (repli, cassure, rebond), mêmes frais et glissement, même modèle d'exécution.
- Binance : archive **Spot BTC/USDT quotidienne** déjà dans le Coffre, 3 075 bougies du 1er mai 2018 au 30 septembre 2026, SHA-256 gzip `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`. Pour cette vérification, **l'amorçage des indicateurs est reconstruit à partir du 21 août 2025 sur les deux sources**, de façon à comparer des conditions identiques.
- Les cours cotés en **USDC** et en **USDT** ne sont pas parfaitement identiques. Sur l'ensemble des dates communes, les écarts de clôture journalière observés ont varié approximativement de **−0,48 % à +0,53 %**, en proportion de la clôture Binance. Aucune parité exacte n'est supposée.
- Les ordres et stops sont fictifs, avec **0,10 % de frais + 0,05 % de glissement par côté**, sans levier ni vente à découvert. Les prix d'exécution ne sont pas prouvés par des carnets historiques.

## Ce qui a été démontré

**Confirmé :** les tests de cohérence de source, dates, doublons, OHLC, périodes communes, frais, calculs et lecture seule sont passés ; les chiffres reproductibles sont enregistrés. L'analyse ne dépend plus seulement des bougies Binance.

**Non démontré :** rentabilité future ou robustesse multi-cycles sur **OKX BTC/USDC**, performance réelle, absence de différences de liquidité et de frais, ou valeur prédictive des actualités et liquidations observées.

**Limite scientifique :** l'échantillon OKX accessible ici couvre environ 15 mois, mais l'horizon comparable avec l'archive Binance s'arrête au 30 septembre 2026 et le véritable test après amorçage ne couvre que six mois. Six mois et une seule position cassure ne permettent absolument pas de trancher la viabilité d'une méthode.

## Décision de recherche recommandée

Le manque n'est **plus** « vérifier si OKX et Binance sont compatibles sur les mêmes jours » : ce contrôle est effectué.

Le prochain problème est **le manque d'occasions dans les règles elles-mêmes**. Avant d'envisager le PAPER prospectif, les IA devraient confronter la définition du Swing Trading aux pratiques documentées, choisir à l'avance des règles donnant un nombre de positions suffisant, puis demander une validation sur des archives OKX plus anciennes ou sur des périodes futures réellement inédites. **Ne pas changer les paramètres après avoir vu ce résultat puis appeler cela une validation.**

L'Observatoire peut apporter des contextes factuels et expliquer les épisodes, mais ne doit pas être transformé en source de signaux commerciaux sans preuve.

**Intégrité :** ce chantier ne touche ni au Trader, ni à l'Administrator, ni au Bridge, ni au compte OKX. Aucun ordre réel.
