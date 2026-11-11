# Seven Heaven — Stratégie des « 4 Rois » : extraction publique, audit critique et critères de backtest

**Date :** 11 novembre 2026  
**Statut :** audit documentaire, pas un backtest de la méthode, pas de conseil d'investissement.  
**Destination canonique :** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` sur `BlueAzur-Hub/erith-ia-memory`.

## Sources et étendue réelle de lecture

- **Source primaire effectivement lue** : https://www.4-kings.fr/strategie — page HTML publique « La stratégie des quatre Rois », consultée le 11/11/2026. Les descriptions des quatre rôles sont accessibles sans abonnement dans cette page.
- **Présentation générale** : https://www.4-kings.fr/ — page d'accueil qui présente également un découpage de l'univers crypto en catégories « 1st Class », « Eco Class », « All Exchanges », « zone de recherche rapide ». Ces catégories ne doivent pas être confondues avec les **quatre rôles d'achat/vente** décrits sur `/strategie`.
- **Risque crypto, contexte réglementaire** : https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/crypto-actifs-bitcoin-etc/investir-dans-le-bitoin-prudence ; https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/crypto-actifs-bitcoin-etc/investir-en-crypto-actifs-les-precautions-pratiques (AMF, juillet 2026).
- **Chaîne associée dans le précédent audit** : https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A ; voir `SEVEN_HEAVEN_LES_ROIS_DU_BITCOIN_CHANNEL_SOURCE_AUDIT_2026_11_11.md`.

**Limite explicite :** aucune formation payante, ebook verrouillé, compte privé, performance auditée ou série de trades certifiée n'a été consulté. Ne pas prétendre connaître les paramètres cachés ni que les auteurs les ont omis de toutes leurs publications.

## I. Ce que les auteurs exposent gratuitement

La page qualifie la démarche de **risk management de moyen / long terme**, et non de setup de day trading. Les quatre cartes désignent des **décisions successives**, pas quatre cryptomonnaies :

| Symbole | Rôle de la source primaire | Interprétation pédagogique précise |
|---|---|---|
| **♣ Trèfle** | **Achat** : recherche de *double bottom* en W sur les bougies **hebdomadaires** ; zone de prix long terme qualifiée de basse ou d'accumulation. | Entrée dans une zone jugée dépréciée après formation d'un double creux. Un W n'est pas la preuve d'un retournement. |
| **♠ Pique** | **Achat** : attendre un *pullback* / retest, par exemple le retour vers la ligne de cou d'un double bottom après cassure. | Entrer après repli plutôt que suivre impulsivement une hausse. Un retest peut échouer. |
| **♦ Carreau** | **Vente partielle** : exemples donnés : revendre **50 %** à **+110 %** de hausse, **25 %** à **+410 %**, ou vendre une fraction à un objectif de prise de profit lié à une zone/Fibonacci. | Sécurisation progressive. À +110 %, si 50 % de la position initiale intacte est vendu, le produit brut est 105 % du montant investi initialement ; **avant frais et impôts**. La base du « 25 % » et le calendrier exact ne sont pas spécifiés sans ambiguïté. |
| **♥ Cœur** | **Vente à l'objectif final** : revendre entre **50 % et 90 %** de la position, puis éventuellement conserver un solde pendant **5 à 10 ans**. | Sortie de long terme et conservation résiduelle. Le but final et la base des pourcentages restent propres à l'investisseur. |

Indicateurs déclarés : **MACD, RSI, OBV** (On-Balance Volume), plus **retracements de Fibonacci**, particulièrement 0,618 ; horizons **daily/weekly**. Le site évoque l'apport régulier possible de 5 % à 10 % des revenus, l'absence de levier et l'identification de zones long terme.

### Ne pas inventer de « recette » manquante

La page consultée ne fixe pas de manière suffisamment déterministe :

1. La règle chiffrée d'identification d'un double fond (deux pivots, tolérance en %, nombre de semaines d'écart, validation de la ligne de cou, date de confirmation observable).
2. Le calcul mécanique des zones d'achat/vente long terme et du niveau Fibonacci (pivots historiques utilisés, mise à jour, gestion du future leak).
3. Les paramètres et **seuils d'achat/vente** du MACD, RSI et OBV, leur éventuel rôle de veto ou leur ordre de priorité.
4. La définition opérationnelle d'un « pullback » : tolérance autour du niveau, durée maximum, cas où le niveau est traversé, condition d'abandon.
5. La taille de chaque entrée, la répartition du portefeuille, les exceptions en cas de faillite du projet ou de longue baisse, ainsi que les règles exactes de réinvestissement et les tailles de ventes restantes.
6. Des résultats de backtest **reproductibles**, avec période horodatée, capital, transactions, frais, drawdown et témoin Buy & Hold, sur la page consultée.

Un programme prétendant reproduire exactement la méthode serait donc **en partie inventé** à partir du seul contenu gratuit. Il est possible de tester une *variante opérationnelle inspirée par les principes publics*, à condition de la nommer comme telle.

## II. Examen de la solidité des affirmations

**Aspects raisonnables comme principes généraux :** préparer un plan, limiter les décisions impulsives, éviter le levier, définir des prises de bénéfices et réfléchir aux tailles de position. Ces habitudes ne constituent cependant aucune preuve de surperformance.

**Points nécessitant davantage de preuves :**

- Le texte public promet « Aucun Risque » en expliquant que le capital investi est considéré perdu d'avance. C'est une **attitude psychologique**, pas une réduction de la probabilité ni du montant réel de perte. Le site reconnaît lui-même une perte possible de **100 % sur une position**. La formule commerciale « aucun risque » ne doit pas être reprise comme fait.
- La page avance environ **90 % de chances** de nouvelles occasions d'achat et rapporte qu'une décision « hors plan » serait mauvaise **8 fois sur 10** ; sans population, échantillon, protocole, calcul d'incertitude ni mesure vérifiable visibles sur la page, ces pourcentages **ne sont pas des statistiques validées**.
- La page présente également une estimation selon laquelle **90 % des ordres** seraient initiés par des robots : non vérifiée ici, et non une hypothèse nécessaire pour tester les quatre rôles.
- « Acheter une crypto dépréciée / fondamentalement sous-évaluée » ne garantit pas un retournement : un actif peut baisser durablement ou disparaître.
- Réduire les risques par l'absence de levier est sensé, mais une stratégie **sans limite de perte explicite** reste exposée à un drawdown important ou à une perte totale en Spot.
- Multiplier son capital par 10 en 10 ans est présenté comme un exemple d'objectif, **pas comme un rendement démontré**.
- Sur les pages consultées, **aucune preuve indépendante de rendement de la méthode n'a été vérifiée**. Ceci n'établit pas que les auteurs ont perdu de l'argent, ni qu'il s'agirait d'une escroquerie : de telles conclusions demanderaient des preuves distinctes.

L'AMF rappelle que les crypto-actifs sont fortement volatils et qu'une perte de capital est possible, y compris sur des horizons longs.

## III. Correspondances avec le laboratoire Seven Heaven

| Élément « 4 Rois » | Travaux comparables déjà publiés | Ce qui n'a **pas** été vérifié |
|---|---|---|
| W hebdomadaire / support | Audits de rebonds, creux ascendants et confirmations C1/C3 | **Aucun replay exact** du W hebdomadaire de la méthode commerciale. |
| Pullback et retest de ligne de cou | Mesure de coût d'entrée retardée, sorties et entrées asymétriques | **Aucun backtest exact** d'une ligne de cou hebdomadaire, et tolérance absente. |
| MACD / RSI / volumes OBV | Études distinctes MACD/RSI/ADX, volumes Binance, EMA/SuperTrend | OBV n'est **pas interchangeable** avec volume brut ; ne pas utiliser les résultats du volume comme validation de l'OBV. |
| Ventes partielles +110 % / +410 % | Simulations PAPER avec coûts et valeur nette totale du portefeuille | Aucun scénario « ♦/♥ » de prise de bénéfices exactement simulé. |
| Gestion du risque de position | Audits de drawdown, cash et Buy & Hold | Taille de position, coût moyen, fiscalité et extinction de projet non documentés pour les 4 Rois. |

## IV. Comment en faire une expérience scientifique sans acheter de formation

1. **Nommer l'expérience « 4 Rois — variante publique Seven », jamais « stratégie officielle validée ».** Conserver intégralement le texte des hypothèses et la date de figement.
2. Tester d'abord seulement **♣ W hebdomadaire** et **♠ retest de ligne de cou**, avec pivots définis mathématiquement, horodatage des confirmations et prix observables sans look-ahead.
3. Ajouter séparément **♦ vente de 50 % à +110 %** et une variante documentée de **♥ sortie finale**, sans prétendre reconstituer les parties ambiguës ; comparer avec Buy & Hold, DCA et sorties partielles simples.
4. Inclure frais OKX plausibles, glissement, capital mobilisé, pertes latentes, pertes maximales et périodes sans position ; comparer Binance BTCUSDT historique et OKX BTCUSDC avant toute extrapolation.
5. Faire une séparation nette apprentissage/test hors échantillon. Les anciennes fenêtres 2022–2026 ont déjà été examinées par Seven Heaven, donc ne pas les appeler « échantillon inédit ».
6. **Ne rien intégrer dans le Trader** à partir du seul contenu marketing. Aucune exécution réelle, aucun achat de formation nécessaire.

## Conclusion pour les autres IA

**Fait documentaire :** quatre fonctions (♣ et ♠ = achats ; ♦ et ♥ = ventes), RSI/MACD/OBV, zones de long terme, W weekly, retest, ventes progressives.  
**Non établi :** supériorité statistique, probabilité de succès 90 %, risque nul, caractère entièrement reproductible des règles publiées.  
**Action possible :** rédiger des règles mathématiques nouvelles, déclarées comme *variante Seven* et testables ; ne jamais présenter leurs rendements comme ceux des auteurs.

**État :** audit de la page officielle librement accessible. Aucun achat, aucun ordre et aucune modification Administrator/Operator/Trader/Bridge.
