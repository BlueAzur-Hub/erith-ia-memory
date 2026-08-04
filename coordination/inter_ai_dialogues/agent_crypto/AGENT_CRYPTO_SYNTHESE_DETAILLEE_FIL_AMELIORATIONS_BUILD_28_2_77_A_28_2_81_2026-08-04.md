# AGENT-CRYPTO — Synthèse détaillée du fil de travail et de toutes les améliorations

**Période couverte :** 4 août 2026  
**Projet :** Agent-Crypto / Market Core V2.0-Alpha  
**Périmètre technique :** Builds 28.2.77 à 28.2.81  
**Opérateur humain :** Christophe  
**Rôle de l’assistante :** analyse, pédagogie, préparation locale des Builds, vérification et documentation  
**Statut général :** base publique stable, parcours pédagogique structuré, simulations exclusivement fictives, sécurité renforcée

---

# 1. Objet de ce document

Ce document reconstitue le fil de travail consacré à l’évolution de l’interface Agent-Crypto depuis le Build 28.2.77.

Il rassemble :

- les objectifs formulés par Christophe ;
- le parcours pédagogique crypto étudié dans le fil ;
- les essais de simulation réalisés ;
- les faiblesses identifiées dans l’interface ;
- les décisions de conception ;
- les améliorations introduites dans chaque Build ;
- les retours visuels de Christophe ;
- les règles de sécurité adoptées ;
- les vérifications automatisées ;
- les limites de validation ;
- l’état exact de reprise pour la suite.

Le document est conçu pour servir à la fois :

- de mémoire personnelle pour Christophe ;
- de rapport d’évolution du projet ;
- de guide de reprise pour une future session ;
- de référence pour une autre assistante chargée de poursuivre le développement.

---

# 2. Vision générale du projet

## 2.1 Objectif de Christophe

Christophe part d’un niveau réellement débutant en cryptomonnaies.

Son objectif déclaré est ambitieux et progressif :

> Devenir expert en cryptomonnaies dans un horizon d’environ deux ans.

L’objectif n’est pas de rechercher un gain rapide ni d’utiliser immédiatement des fonds réels. Le projet doit d’abord permettre de :

- comprendre les marchés ;
- lire les données ;
- maîtriser les frais ;
- simuler les décisions ;
- comprendre les risques ;
- apprendre la sécurité ;
- conserver une trace des exercices ;
- acquérir progressivement un vocabulaire expert ;
- préparer une éventuelle utilisation réelle beaucoup plus tard.

## 2.2 Principe pédagogique central

Le projet repose sur la règle suivante :

> Comprendre avant d’exécuter, simuler avant de risquer, vérifier avant de confirmer.

La simulation fictive permet de tester :

- des achats ;
- des ventes ;
- des variations de marché ;
- des frais ;
- des pertes ;
- des gains ;
- des retraits ;
- des contrôles de sécurité ;
- des scénarios d’arnaque ;

sans utiliser d’argent réel.

## 2.3 Contrat de sécurité permanent

Pendant toute cette phase :

- aucun ordre réel ;
- aucun dépôt réel ;
- aucun retrait réel ;
- aucun wallet réel connecté ;
- aucune clé privée ;
- aucune phrase de récupération ;
- aucune clé API d’exchange ;
- aucun effet de levier ;
- aucun emprunt ;
- aucun future ;
- aucun produit dérivé ;
- aucune écriture GitHub par l’assistante.

Christophe reste la seule personne qui publie les fichiers dans GitHub.

---

# 3. Base canonique avant les améliorations pédagogiques

## 3.1 Build 28.2.77

**Nom :** CANONICAL SNAPSHOT MEMORY DEDUPLICATION LOCK

Le Build 28.2.77 constitue la base canonique stable du travail pédagogique.

Il avait déjà consolidé :

- l’espace Crypto ;
- l’espace Métaux ;
- le Decision Board ;
- la mémoire locale des observations ;
- la distinction entre observations répétées et snapshots réellement distincts ;
- le collecteur public crypto ;
- les données CoinGecko ;
- la conversion USD vers EUR par référence BCE ;
- les prix Binance visibles ;
- les historiques CoinGecko ;
- le News Sentinel ;
- la Watchlist ;
- le Math Core ;
- le Bridge local ;
- le Control Center V2.1.0R1 ;
- le Bridge V1.7.6.

## 3.2 Correction centrale de 28.2.77

Avant ce Build, plusieurs rafraîchissements du navigateur pouvaient être interprétés comme plusieurs observations différentes alors qu’ils provenaient du même snapshot public.

Le Build 28.2.77 a imposé une identité canonique :

- identifiant du snapshot ;
- date de génération ;
- mode source ;
- provenance ;
- collecteur concerné.

Une observation répétée du même snapshot :

- ne crée plus une fausse comparaison ;
- incrémente un compteur ;
- conserve la mémoire existante ;
- neutralise les doublons pour l’analyse ;
- préserve les enregistrements historiques.

Le Decision Board compare ainsi des snapshots réellement distincts.

## 3.3 Validation de la base

Le Build 28.2.77 avait obtenu :

- 36 contrôles automatisés réussis sur 36 ;
- validation visible de l’espace Crypto ;
- validation visible de l’espace Métaux ;
- validation du Decision Board ;
- validation de la mémoire canonique ;
- validation du Bridge et du Control Center sous Firefox/Ryzen.

## 3.4 ZIP canonique

**Fichier :**

`AGENT_CRYPTO_BUILD_28_2_77_CANONICAL_SNAPSHOT_MEMORY_DEDUPLICATION_LOCK_FINAL.zip`

**SHA-256 :**

`d2d848b6d1bf6f116f439ae77bf57b17240171fd679759c6b5ecf1fcea215e55`

---

# 4. Parcours pédagogique étudié dans le fil

La conversation a progressivement transformé l’interface en outil de formation.

Le parcours a couvert les notions suivantes.

---

# 5. Lecture élémentaire d’un marché crypto

## 5.1 Prix actuel

Le prix actuel indique la valeur d’échange observée à un instant donné.

Il ne doit jamais être lu seul.

Une bonne lecture associe :

- le prix ;
- la source ;
- l’heure ;
- l’âge des données ;
- la période de variation ;
- le volume ;
- la liquidité.

## 5.2 Variation sur 24 heures et 7 jours

La variation sur 24 heures décrit le mouvement récent.

La variation sur 7 jours permet de replacer ce mouvement dans une tendance plus large.

Une hausse sur 24 heures peut coexister avec :

- une baisse sur 7 jours ;
- une reprise après une chute ;
- une simple oscillation ;
- une volatilité temporaire.

## 5.3 Volume

Le volume représente la quantité ou la valeur échangée pendant une période.

Il sert à évaluer l’activité du marché.

Un mouvement de prix accompagné d’un volume important peut être plus significatif qu’un mouvement sur un marché presque vide.

## 5.4 Capitalisation

La capitalisation est approximativement :

`prix × nombre d’unités en circulation`

Elle indique la taille économique relative d’un actif.

Elle ne représente pas la somme d’argent réellement disponible pour vendre immédiatement toutes les unités.

## 5.5 Fraîcheur et provenance

Chaque chiffre doit être accompagné de :

- sa source ;
- son horodatage ;
- son âge ;
- sa nature : temps réel, snapshot, archive ou calcul local.

Cette règle est devenue une exigence de conception pour les info-bulles et les simulations.

---

# 6. Différences entre Binance, CoinGecko et les autres sources

Une différence de prix entre plusieurs sources n’est pas nécessairement une erreur.

Elle peut provenir :

- de marchés différents ;
- de paires différentes ;
- d’un agrégat multi-exchanges ;
- de la devise utilisée ;
- du moment de collecte ;
- du spread ;
- de la liquidité ;
- d’un retard de rafraîchissement.

Binance peut présenter un prix directement observé sur une paire.

CoinGecko peut produire une valeur agrégée à partir de plusieurs marchés.

La future interface doit donc expliquer la différence au lieu de présenter une valeur comme vérité absolue sans contexte.

---

# 7. Risque de marché

## 7.1 Volatilité

La volatilité mesure l’intensité des variations.

Elle ne dit pas si le marché va monter ou descendre.

Une forte volatilité signifie surtout que les écarts peuvent être rapides et importants.

## 7.2 Drawdown

Le drawdown mesure la baisse depuis un sommet précédent.

Exemple :

- sommet : 100 € ;
- valeur suivante : 75 € ;
- drawdown : 25 %.

Il aide à comprendre la profondeur d’une perte temporaire ou durable.

## 7.3 Value at Risk pédagogique

La VaR donne une estimation probabiliste d’une perte potentielle sur une période et selon un niveau de confiance.

Elle ne garantit jamais une perte maximale absolue.

La VaR dépend :

- des données passées ;
- de l’horizon ;
- de la méthode ;
- des hypothèses statistiques.

Elle peut sous-estimer les événements rares et violents.

---

# 8. Liquidité, spread et slippage

## 8.1 Liquidité

La liquidité représente la facilité avec laquelle une position peut être achetée ou vendue sans provoquer un mouvement important du prix.

Un marché liquide offre généralement :

- plus d’ordres ;
- un spread plus faible ;
- une exécution plus stable ;
- moins de slippage.

## 8.2 Spread

Le spread est l’écart entre :

- le meilleur prix d’achat ;
- le meilleur prix de vente.

Même si le marché ne bouge pas, cet écart représente déjà un coût potentiel.

## 8.3 Slippage

Le slippage est l’écart entre :

- le prix attendu ;
- le prix réellement exécuté.

Il peut apparaître lors :

- d’un ordre au marché ;
- d’une forte volatilité ;
- d’une faible liquidité ;
- d’un montant important ;
- d’un mouvement très rapide.

---

# 9. Frais et seuil de rentabilité

## 9.1 Coût d’achat

Un achat réel peut inclure :

- commission ;
- spread ;
- slippage ;
- conversion de devise ;
- frais de dépôt éventuels.

## 9.2 Coût de sortie

Une vente peut ajouter :

- commission de vente ;
- spread ;
- slippage ;
- éventuels frais de retrait.

## 9.3 Break-even

Le seuil de rentabilité est le niveau que le prix doit atteindre pour couvrir l’ensemble des coûts.

Une position à prix inchangé peut être légèrement négative à cause des frais.

Cette notion a été identifiée comme essentielle pour le simulateur.

---

# 10. Taille de position et exposition

## 10.1 Capital disponible

Le capital disponible est la somme fictive qui n’est pas actuellement engagée.

## 10.2 Montant placé

Le montant placé correspond à la valeur actuelle des positions fictives.

## 10.3 Exposition

L’exposition mesure la part du portefeuille soumise aux variations du marché.

Exemple :

- portefeuille total : 1 000 € ;
- positions : 250 € ;
- exposition : 25 %.

## 10.4 Concentration

Une concentration élevée sur un seul actif augmente le risque spécifique.

Même un actif réputé solide peut subir une forte baisse.

## 10.5 Risque par opération

La taille d’une opération doit être liée :

- au capital ;
- à la perte acceptable ;
- au scénario défavorable ;
- à la réserve minimale.

Cette logique a ensuite été intégrée dans les profils fictifs de 100 € et 1 000 €.

---

# 11. Perte latente et perte réalisée

## 11.1 Perte latente

Une perte latente existe tant que la position reste ouverte.

Elle peut encore évoluer.

## 11.2 Perte réalisée

La perte devient réalisée lors de la vente.

La distinction évite deux erreurs :

- croire qu’une perte latente n’existe pas ;
- croire qu’une perte latente est définitivement figée.

Le futur journal devait donc séparer :

- situation actuelle ;
- résultat final ;
- résultat brut ;
- résultat net.

---

# 12. Prix moyen d’achat

Lors de plusieurs achats, le prix moyen doit être pondéré par les quantités.

Il ne s’agit pas d’une simple moyenne des prix.

Le prix moyen devient la référence pour :

- le P/L latent ;
- le seuil de rentabilité ;
- les scénarios ;
- le résultat de sortie.

---

# 13. DCA et moyenne à la baisse

## 13.1 DCA

Le DCA consiste à investir des montants réguliers selon un calendrier défini.

Il réduit la dépendance à un unique point d’entrée.

## 13.2 Moyenne à la baisse

La moyenne à la baisse consiste à racheter après une baisse.

Elle peut réduire le prix moyen mais augmente le capital exposé.

Elle ne doit pas être confondue avec un DCA planifié.

---

# 14. Ratio rendement/risque et espérance

## 14.1 Ratio rendement/risque

Le ratio compare :

- le gain potentiel ;
- la perte potentielle.

Un ratio favorable ne garantit pas que le scénario se produira.

## 14.2 Espérance mathématique

L’espérance combine :

- probabilité de gain ;
- gain moyen ;
- probabilité de perte ;
- perte moyenne.

Une stratégie peut avoir :

- beaucoup de gains faibles ;
- quelques pertes importantes ;

et rester négative.

Inversement, un taux de réussite inférieur à 50 % peut rester rentable si les gains moyens dépassent suffisamment les pertes.

---

# 15. Série de pertes et drawdown du portefeuille

Même une méthode correcte peut produire plusieurs pertes successives.

Il faut donc connaître :

- la taille de position ;
- la perte maximale acceptable ;
- la réserve ;
- le drawdown cumulé ;
- la capacité à poursuivre sans augmenter le risque.

Cette idée a conduit à la notion de profil simulé avec limites fixes.

---

# 16. Carnet d’ordres

Le carnet contient :

- les offres d’achat ;
- les offres de vente ;
- les quantités ;
- les niveaux de prix.

Il permet de comprendre :

- le spread ;
- la profondeur ;
- les zones de liquidité ;
- l’effet d’un ordre important.

Un carnet d’ordres n’est pas une prédiction fiable : des ordres peuvent être annulés.

---

# 17. Ordres Spot

## 17.1 Ordre au marché

Il cherche une exécution immédiate.

Avantage :

- rapidité.

Risques :

- spread ;
- slippage ;
- prix final différent du prix visible.

## 17.2 Ordre limite

Il fixe un prix maximal d’achat ou minimal de vente.

Avantage :

- meilleur contrôle du prix.

Limite :

- aucune garantie d’exécution.

## 17.3 Stop-loss

Il déclenche une sortie lorsqu’un seuil est atteint.

Il ne garantit pas le prix final en cas de mouvement rapide.

## 17.4 Stop-limit

Il déclenche un ordre limite.

Il contrôle mieux le prix mais peut rester non exécuté.

## 17.5 Take-profit

Il prépare une vente lorsque l’objectif est atteint.

## 17.6 OCO

Un ordre OCO associe généralement :

- un objectif de gain ;
- une protection.

L’exécution de l’un annule l’autre.

Ces fonctions restent étudiées mais ne sont pas utilisées réellement.

---

# 18. Exchange et wallet

## 18.1 Exchange

Un exchange facilite :

- achat ;
- vente ;
- conversion ;
- conservation temporaire.

L’utilisateur dépend alors :

- du compte ;
- du prestataire ;
- des règles de retrait ;
- de la sécurité de la plateforme.

## 18.2 Wallet personnel

Un wallet personnel permet de contrôler les clés.

Il augmente aussi la responsabilité :

- sauvegarde ;
- phrase de récupération ;
- réseau ;
- adresse ;
- frais ;
- sécurité physique et numérique.

---

# 19. Anatomie d’un retrait

Un retrait implique :

- un actif ;
- un réseau ;
- une adresse ;
- un montant ;
- un minimum ;
- des frais ;
- un montant net ;
- parfois un memo ou tag ;
- un TXID ;
- des confirmations.

Une adresse correcte sur un mauvais réseau peut provoquer une perte ou une récupération complexe.

Le retrait test a donc été intégré comme exercice fictif.

---

# 20. Sécurité du compte

Les règles étudiées comprennent :

- adresse email dédiée ou correctement sécurisée ;
- mot de passe unique ;
- 2FA ;
- passkey lorsque disponible ;
- protection des retraits ;
- verrou global des paramètres ;
- contrôle des sessions ;
- favoris officiels ;
- refus des liens publicitaires ;
- aucun code communiqué à un support ;
- aucun accès distant donné à un inconnu.

---

# 21. Sécurité du wallet

La phrase de récupération :

- ne doit jamais être photographiée ;
- ne doit jamais être stockée dans un cloud ordinaire ;
- ne doit jamais être saisie sur un site ;
- ne doit jamais être envoyée à un support ;
- ne doit jamais être communiquée à une assistante.

Une personne connaissant la phrase peut généralement contrôler les fonds.

La perte de la phrase peut rendre les fonds irrécupérables.

---

# 22. Traçabilité et fiscalité

Le fil a insisté sur la conservation des preuves :

- date ;
- type d’opération ;
- actif ;
- montant ;
- prix ;
- frais ;
- source ;
- TXID ;
- justificatif ;
- valeur au moment de l’opération.

Les règles fiscales peuvent évoluer.

Toute future opération réelle nécessitera une vérification des sources officielles françaises au moment concerné.

---

# 23. Stablecoins

Les stablecoins cherchent à suivre une valeur de référence.

Ils peuvent comporter :

- risque d’émetteur ;
- risque de réserve ;
- risque de décrochage ;
- risque réglementaire ;
- risque de réseau ;
- risque de smart contract ;
- risque de liquidité.

« Stable » ne signifie pas « sans risque ».

---

# 24. Staking et rendement

Le rendement peut provenir :

- du fonctionnement d’un réseau ;
- d’une délégation ;
- d’un prêt ;
- d’un protocole ;
- d’une incitation temporaire.

Il faut distinguer :

- staking natif ;
- staking par un prestataire ;
- lending ;
- farming ;
- récompense promotionnelle.

Un rendement élevé implique souvent un risque supplémentaire.

---

# 25. Tokenomics

L’étude d’un jeton doit inclure :

- offre maximale ;
- offre en circulation ;
- inflation ;
- émissions ;
- allocations ;
- vesting ;
- unlocks ;
- concentration ;
- utilité réelle ;
- gouvernance.

Un projet peut être techniquement intéressant mais subir une forte pression de vente lors des déblocages de jetons.

---

# 26. Smart contracts, DeFi et bridges

## 26.1 Smart contract

Un smart contract est un programme déployé sur une blockchain.

Une interaction peut exécuter une fonction irréversible.

## 26.2 Approval

Une autorisation peut permettre à un contrat de déplacer des jetons.

Une autorisation illimitée incomprise constitue un risque majeur.

## 26.3 DeFi

La DeFi peut inclure :

- échange décentralisé ;
- prêt ;
- emprunt ;
- staking ;
- fourniture de liquidité ;
- produits dérivés ;
- agrégation de rendement.

## 26.4 Bridge

Un bridge déplace ou représente des actifs entre réseaux.

Il ajoute :

- plusieurs réseaux ;
- un protocole intermédiaire ;
- des frais ;
- un délai ;
- un risque de contrat ;
- un risque de liquidité ;
- un risque de mauvaise destination.

La phase débutante doit uniquement les simuler.

---

# 27. Marge, levier, futures et liquidation

## 27.1 Spot

En Spot sans emprunt :

- le capital engagé correspond au capital possédé ;
- il n’existe pas de liquidation automatique causée uniquement par la baisse du prix.

## 27.2 Levier

Le levier augmente l’exposition.

Exemple :

- capital : 100 € ;
- levier ×5 ;
- exposition : 500 €.

Une variation de 5 % produit environ 25 € de gain ou de perte brute, avant coûts.

## 27.3 Futures et perpetuals

Ils donnent une exposition contractuelle au prix.

L’utilisateur ne détient pas nécessairement l’actif.

Les contrats perpétuels utilisent souvent un funding périodique.

## 27.4 Liquidation

La liquidation ferme automatiquement une position lorsque la marge devient insuffisante.

Elle dépend :

- du prix d’entrée ;
- du levier ;
- de la marge ;
- de la maintenance ;
- des frais ;
- du funding ;
- du mark price.

## 27.5 Décision du projet

Dans le parcours actuel :

- levier interdit ;
- marge interdite ;
- futures interdits ;
- perpetuals interdits ;
- short interdit ;
- emprunt interdit.

Ces notions sont étudiées pour comprendre les risques, jamais pour fournir une voie d’exécution.

---

# 28. Arnaques et manipulations

Le dernier bloc pédagogique a montré l’étendue des risques.

## 28.1 Principales arnaques étudiées

- fausse plateforme ;
- faux support ;
- phishing ;
- prise de contrôle à distance ;
- malware de presse-papiers ;
- address poisoning ;
- faux giveaway ;
- arnaque sentimentale ;
- faux groupe de trading ;
- pump-and-dump ;
- rug pull ;
- honeypot ;
- faux jeton ;
- wallet drainer ;
- fausse récupération de fonds ;
- usurpation d’un proche ;
- faux emploi ;
- faux paiement.

## 28.2 Signaux critiques

- rendement garanti ;
- urgence ;
- secret prétendument réservé aux initiés ;
- demande de payer pour débloquer un retrait ;
- support réclamant un code ;
- accès distant ;
- adresse imposée par téléphone ;
- plateforme imposée par un inconnu ;
- autorisation illimitée incomprise ;
- promesse de doubler un envoi ;
- relation personnelle associée à un investissement.

## 28.3 Principe adopté

> Une opération techniquement possible n’est pas automatiquement une opération acceptable.

Elle doit être :

- comprise ;
- vérifiée ;
- documentée ;
- libre de toute pression ;
- compatible avec les règles du profil ;
- confirmée humainement.

---

# 29. Premier essai de simulation fictive

Une opération fictive BTC de 5 € a été effectuée dans le Mode École guidé.

## 29.1 Achat simulé

Le système affichait :

- achat fictif BTC : 5 € ;
- capital restant : 95 € ;
- valeur des positions : environ 5 € ;
- total simulé : environ 100 € ;
- exposition : 5 sur 30.

La quantité affichée était d’environ :

`0,00009057 BTC`

## 29.2 Vente simulée

Une vente fictive a ensuite été réalisée.

Le journal affichait :

- achat simulé ;
- vente simulée ;
- disparition de la position après vente.

## 29.3 Limites observées

Le simulateur ne montrait pas encore clairement :

- prix d’entrée exact ;
- prix de sortie exact ;
- commission d’achat ;
- commission de vente ;
- spread ;
- slippage ;
- seuil de rentabilité ;
- P/L brut ;
- P/L net ;
- durée ;
- source du prix ;
- fraîcheur du prix ;
- résultat réalisé détaillé.

Christophe a correctement identifié qu’un investissement de 5 € devait intégrer les coûts.

Cette observation a déclenché le Build 28.2.78.

---

# 30. Cahier des charges consolidé après la formation

Les améliorations demandées ont été regroupées autour des axes suivants.

## 30.1 Explication dynamique

Chaque aide devait pouvoir indiquer :

- définition ;
- valeur actuelle ;
- lecture simple ;
- source ;
- heure ;
- âge ;
- caractère réel ou hypothétique ;
- limite du calcul.

## 30.2 Transparence des simulations

Le simulateur devait intégrer :

- prix d’entrée ;
- prix actuel ;
- prix de sortie ;
- quantité brute ;
- quantité nette ;
- frais d’achat ;
- frais de vente ;
- spread ;
- slippage ;
- seuil de rentabilité ;
- P/L brut ;
- P/L net ;
- durée ;
- source ;
- fraîcheur.

## 30.3 Scénarios immédiats

Boutons souhaités :

- −5 % ;
- −3 % ;
- −1 % ;
- cours actuel ;
- +1 % ;
- +3 % ;
- +5 %.

Ces scénarios ne doivent pas modifier le portefeuille.

## 30.4 Libellés clairs

Les libellés abstraits devaient devenir :

- Argent disponible ;
- Montant actuellement placé ;
- Valeur totale du portefeuille ;
- Gain/perte depuis achat.

## 30.5 Security Gate

Trois états :

- vert ;
- orange ;
- rouge.

Le système doit donner le motif précis sans produire de conseil financier.

## 30.6 Retrait fictif

Le laboratoire devait couvrir :

- actif ;
- réseau ;
- adresse de démonstration ;
- montant ;
- frais ;
- net ;
- minimum ;
- test ;
- TXID fictif ;
- confirmations ;
- incompatibilités.

## 30.7 Scam Sentinel

Le système devait détecter de façon déterministe les signaux sélectionnés sans prétendre certifier une personne, un site ou un protocole.

## 30.8 Préservation absolue

Aucune amélioration ne devait :

- supprimer un bloc ;
- réduire le contenu ;
- masquer définitivement une fonction ;
- casser Crypto ;
- casser Métaux ;
- casser le Decision Board ;
- casser le Bridge ;
- modifier les collecteurs ;
- modifier les workflows ;
- créer une action réelle.

---

# 31. Build 28.2.78 — PEDAGOGY SECURITY GATE LOCK

## 31.1 Objectif

Ajouter la première couche pédagogique et sécuritaire complète sur la base 28.2.77.

## 31.2 Améliorations

### Info-bulles pédagogiques

Ajout d’aides accessibles par `ⓘ`.

Elles pouvaient expliquer :

- capital ;
- exposition ;
- P/L ;
- frais ;
- seuil de rentabilité ;
- réseaux ;
- sécurité ;
- retraits ;
- arnaques.

### Hypothèses de coûts

Ajout de paramètres locaux pour :

- frais d’achat ;
- frais de vente ;
- impact d’entrée ;
- impact de sortie.

Ces valeurs sont présentées comme hypothèses pédagogiques, pas comme tarifs contractuels de Kraken.

### Coût aller-retour

Le système estime le coût total d’une entrée puis d’une sortie.

### Break-even

Le simulateur calcule un prix d’équilibre estimé.

### P/L brut et net

Le résultat brut est séparé du résultat net estimé après coûts.

### Scénarios instantanés

Ajout des variations de −5 % à +5 % sans modification du portefeuille.

### Correction de `−0,00 €`

Les valeurs proches de zéro sont affichées comme `0,00 €`.

### Security Gate V1

Le système classe la simulation en :

- vert ;
- orange ;
- rouge.

### Laboratoire de retrait fictif V1

Ajout d’un scénario de retrait sans adresse réelle ni réseau réel.

### Scam Sentinel V1

Ajout de huit signaux d’arnaque déterministes.

### Stabilisation visuelle

Le libellé `DONNÉES À JOUR` devient `À JOUR`.

La largeur du cartouche est verrouillée pour éviter les déformations.

## 31.3 Préservation

Comparaison avec 28.2.77 :

- 669 identifiants HTML conservés ;
- 45 identifiants ajoutés ;
- tous les boutons conservés ;
- 47 blocs dépliables conservés ;
- exercices du Mode École conservés.

## 31.4 Vérification

- 102 contrôles réussis sur 102 ;
- syntaxe JavaScript ;
- JSON ;
- cohérence des marqueurs ;
- calculs ;
- simulation ;
- retrait ;
- arnaques ;
- géométrie ;
- test local Chromium.

## 31.5 Retour de Christophe

Christophe a publié et testé cette version.

Les captures ont montré que les nouveaux blocs apparaissaient.

Retour principal :

> Les popups pédagogiques centrées et bloquantes ne sont pas appréciées.

La fonctionnalité était jugée acceptable, mais l’expérience devait être moins intrusive.

## 31.6 ZIP

`AGENT_CRYPTO_BUILD_28_2_78_PEDAGOGY_SECURITY_GATE_LOCK_FINAL.zip`

SHA-256 :

`6936c1a08fd39dd34b517c62da4259839ec069e4ab708aa437cac61c05aaa921`

---

# 32. Build 28.2.79 — INLINE EXPERT LEARNING & TRANSACTION PROOF LOCK

## 32.1 Objectif

Corriger l’expérience des aides et introduire une progression longue.

## 32.2 Panneau pédagogique non modal

La popup centrée a été remplacée par :

- un panneau ancré à droite sur grand écran ;
- un panneau bas sur petit écran ;
- aucune couche opaque plein écran ;
- aucun flou global ;
- possibilité de continuer à utiliser l’interface ;
- boutons réduire, développer et fermer ;
- préférence locale mémorisée.

## 32.3 Parcours Expert sur 24 mois

Ajout de onze modules :

1. marché et données ;
2. Spot et carnet d’ordres ;
3. frais et gestion du risque ;
4. sécurité du compte ;
5. portefeuilles et retraits ;
6. stablecoins et tokenomics ;
7. smart contracts et DeFi ;
8. staking et rendements ;
9. dérivés et liquidation ;
10. arnaques et investigation ;
11. traçabilité et fiscalité.

Chaque module possède :

- un état ;
- une note personnelle ;
- une progression ;
- un export Markdown.

États possibles :

- à découvrir ;
- découvert ;
- compris ;
- pratiqué ;
- à revoir.

Le système n’attribue pas de note financière.

## 32.4 Transaction Proof Ledger

Le journal a été enrichi avec :

- identifiant `SIM-...` ;
- horodatage ;
- type d’événement ;
- actif ;
- montant ;
- prix disponibles ;
- coûts disponibles ;
- résultat réalisé ;
- filtres ;
- export Markdown ;
- export JSON.

Les anciens événements locaux sont migrés sans suppression.

La capacité du journal passe de 50 à 100 événements.

## 32.5 Préservation

- tous les identifiants de 28.2.78 conservés ;
- tous les boutons conservés ;
- tous les blocs dépliables conservés ;
- Security Gate conservé ;
- retrait fictif conservé ;
- Scam Sentinel conservé ;
- scénarios conservés ;
- coûts conservés ;
- Crypto, Métaux, Decision Board et Bridge conservés.

## 32.6 Vérification

- 63 contrôles sur 63 ;
- test statique et structurel ;
- aucune validation Chromium revendiquée car la navigation locale était bloquée ;
- validation humaine Firefox/Ryzen requise après publication.

## 32.7 Retour de Christophe

Christophe a publié le Build 28.2.79 puis le Build 28.2.80.

Son retour sur les deux versions :

> Pas mal.

Il a indiqué aimer l’interface et ne rien vouloir jeter.

## 32.8 ZIP

`AGENT_CRYPTO_BUILD_28_2_79_INLINE_EXPERT_LEARNING_TRANSACTION_PROOF_LOCK_FINAL.zip`

SHA-256 :

`4e263aae9374bd826ec8de31382994e4d0dfa03a900543c787fd6fc63b3e98f6`

---

# 33. Build 28.2.80 — DUAL CAPITAL SIMULATION PROFILE LOCK

## 33.1 Demande de Christophe

Christophe a demandé une simulation autour de 1 000 € au lieu de 100 €.

La décision a été de ne pas remplacer le profil 100 €, mais de conserver deux profils séparés.

## 33.2 Profil Solo Progression 1 000 €

- capital initial : 1 000 € ;
- ticket conseillé : 50 € ;
- maximum par opération : 100 € ;
- exposition maximale : 300 € ;
- réserve minimale : 700 € ;
- actifs autorisés : BTC, ETH, SOL.

## 33.3 Profil Solo Débutant 100 €

- capital initial : 100 € ;
- ticket conseillé : 5 € ;
- maximum par opération : 10 € ;
- exposition maximale : 30 € ;
- réserve minimale : 70 € ;
- actifs autorisés : BTC, ETH, SOL.

## 33.4 Séparation des données

Chaque profil possède :

- son capital ;
- ses positions ;
- son journal ;
- ses limites ;
- ses valeurs par défaut.

Le passage d’un profil à l’autre :

- sauvegarde le profil courant ;
- charge l’autre profil ;
- n’efface aucune donnée.

Les anciennes données 100 € sont migrées dans le profil débutant sans supprimer l’enregistrement historique.

## 33.5 Adaptation des exercices

Les exercices du Mode École utilisent les limites du profil actif.

Exemple :

- sous 100 € : ticket 5 € ;
- sous 1 000 € : ticket 50 €.

Le Security Gate utilise également :

- le maximum actif ;
- l’exposition active ;
- la réserve active.

## 33.6 Vérification

- 100 contrôles sur 100 ;
- identifiants conservés ;
- boutons conservés ;
- 47 blocs dépliables conservés ;
- profils séparés ;
- migration non destructive ;
- exercices dynamiques ;
- compatibilité des fonctions antérieures.

## 33.7 Publication

La version publique `version.json` consultée après publication indiquait :

- Build 28.2.80 ;
- token de publication 28.2.80.

Christophe a confirmé avoir publié et vérifié les deux dernières versions.

## 33.8 ZIP

`AGENT_CRYPTO_BUILD_28_2_80_DUAL_CAPITAL_SIMULATION_PROFILE_LOCK_FINAL.zip`

SHA-256 :

`36e766199d6f343d04c83b9f568f918f03db426f3dd217fb12ca5ae07e3340f9`

---

# 34. Réflexion après le Build 28.2.80

Christophe a indiqué :

- apprécier fortement la base ;
- ne rien vouloir supprimer ;
- être toujours réellement débutant ;
- aimer particulièrement le parcours expert sur 24 mois.

La conclusion de conception a été :

> Il ne faut pas ajouter de la complexité pour elle-même. Il faut aider Christophe à savoir où commencer, quoi pratiquer et pourquoi.

Trois axes ont été retenus :

- orientation ;
- pratique ;
- mémoire.

La proposition du cockpit d’apprentissage a été immédiatement validée par Christophe.

---

# 35. Build 28.2.81 — LEARNING JOURNEY COCKPIT & GUIDED PRACTICE LOCK

## 35.1 Objectif

Transformer le parcours expert sur 24 mois en cursus interactif quotidien.

Le Build ne remplace pas l’Observatoire ni l’Administration.

Il ajoute une entrée pédagogique claire.

## 35.2 Cockpit d’apprentissage

Le cockpit rassemble :

- profil fictif actif ;
- capital virtuel ;
- ticket recommandé ;
- progression globale ;
- positions ouvertes ;
- exposition ;
- dernière preuve du journal ;
- prochaine notion recommandée.

## 35.3 Moteur de recommandation

L’ordre de priorité est déterministe :

1. module marqué `À revoir` ;
2. module encore `À découvrir` ;
3. module non encore pratiqué.

Il ne produit :

- aucun signal d’achat ;
- aucun conseil financier ;
- aucune prédiction ;
- aucun score de rentabilité.

## 35.4 Session guidée de 15 minutes

Chaque session comprend :

1. relire une notion ;
2. ouvrir la zone correspondante ;
3. effectuer un exercice fictif ;
4. vérifier les frais et le résultat ;
5. écrire une note personnelle.

La session enregistre localement :

- identifiant ;
- progression ;
- note ;
- date de fin ;
- nombre de sessions terminées.

## 35.5 Bouton de continuité

Le cockpit permet de reprendre le parcours sans rechercher manuellement la zone utile.

Des raccourcis conduisent vers :

- marché ;
- simulation ;
- frais ;
- Security Gate ;
- retrait fictif ;
- Scam Sentinel ;
- parcours expert ;
- Transaction Proof Ledger.

La destination est temporairement mise en évidence.

## 35.6 Trois niveaux d’aide

Christophe n’aimant pas les popups intrusives, le Build ajoute :

- aides désactivées ;
- aides courtes ;
- aides détaillées.

Le choix est mémorisé localement.

### Aides désactivées

Les panneaux `ⓘ` ne s’ouvrent pas.

### Aides courtes

Affichage d’une définition et d’une valeur actuelle.

### Aides détaillées

Affichage de l’explication pédagogique complète.

## 35.7 Notes et export

La session peut être exportée en Markdown.

L’objectif est de créer une mémoire personnelle de formation.

## 35.8 Préservation

Comparaison 28.2.80 vers 28.2.81 :

- identifiants HTML : 751 vers 784 ;
- boutons : 251 vers 257 ;
- blocs dépliables : 47 vers 47 ;
- champs : 35 vers 40 ;
- aucune suppression d’identifiant ;
- aucune suppression de fonction JavaScript nommée ;
- aucun nouvel appel réseau ;
- profils 100 € et 1 000 € préservés ;
- parcours 24 mois préservé ;
- ledger préservé ;
- Security Gate préservé ;
- retrait fictif préservé ;
- Scam Sentinel préservé ;
- Crypto et Métaux préservés ;
- Decision Board préservé ;
- Bridge préservé.

## 35.9 Vérification

- 128 contrôles sur 128 ;
- syntaxe JavaScript ;
- validité JSON ;
- cohérence Build/token ;
- moteur du cockpit testé dans Node.js ;
- cinq étapes vérifiées ;
- trois modes d’aide vérifiés ;
- stockage local vérifié ;
- export Markdown vérifié ;
- absence de nouvel appel `fetch` ou WebSocket ;
- ZIP vérifié.

## 35.10 Limite actuelle

Au moment de cette synthèse :

- Build 28.2.81 livré localement ;
- validation statique : PASS ;
- validation publique Firefox/Ryzen : encore à effectuer après publication par Christophe.

Aucun succès visuel public n’est revendiqué avant ce test.

## 35.11 ZIP

`AGENT_CRYPTO_BUILD_28_2_81_LEARNING_JOURNEY_COCKPIT_GUIDED_PRACTICE_LOCK_FINAL.zip`

SHA-256 :

`da807a7fd484ef2fac0352b594f64f9f1be03a6e993d5dad9ea1ea46e6fa00b8`

---

# 36. Évolution globale de l’interface

## 36.1 Avant

L’application était principalement :

- un observatoire ;
- un ensemble de données ;
- une simulation simple ;
- un Decision Board ;
- un espace Crypto/Métaux ;
- un Bridge.

## 36.2 Après

Elle est devenue :

- observatoire ;
- simulateur de coûts ;
- simulateur de scénarios ;
- laboratoire de risque ;
- laboratoire de retrait ;
- système anti-arnaque ;
- parcours expert ;
- carnet d’apprentissage ;
- journal de preuves fictives ;
- double profil de capital ;
- cockpit de progression quotidienne.

---

# 37. Architecture pédagogique actuelle

Le parcours complet peut maintenant suivre ce cycle :

1. observer le marché ;
2. comprendre les données ;
3. choisir un exercice fictif ;
4. vérifier les limites ;
5. simuler un achat ;
6. lire les coûts ;
7. tester des scénarios ;
8. vendre fictivement ;
9. lire le résultat ;
10. enregistrer la preuve ;
11. rédiger une note ;
12. progresser dans le parcours.

---

# 38. Architecture de sécurité actuelle

La sécurité repose sur plusieurs couches.

## 38.1 Profil

Le profil définit :

- capital ;
- ticket ;
- maximum ;
- exposition ;
- réserve ;
- actifs autorisés.

## 38.2 Security Gate

Il contrôle la cohérence de la simulation.

## 38.3 Scam Sentinel

Il contrôle les signaux d’arnaque sélectionnés.

## 38.4 Laboratoire de retrait

Il enseigne :

- actif ;
- réseau ;
- adresse ;
- minimum ;
- frais ;
- test ;
- net ;
- confirmations.

## 38.5 Journal de preuve

Il conserve les décisions fictives.

## 38.6 Contrat d’interdiction

Aucune fonction réelle n’est activée.

---

# 39. Valeur pédagogique du profil 1 000 €

Le profil 1 000 € rend les exercices plus représentatifs d’un portefeuille réel envisagé sans augmenter le risque réel.

Il permet de comprendre plus facilement :

- 5 % d’exposition ;
- 10 % par opération ;
- réserve de 70 % ;
- diversification ;
- variation en euros ;
- poids des frais ;
- résultat net.

L’ancien profil 100 € reste utile pour :

- découverte ;
- micro-exercices ;
- vérification rapide ;
- comparaison pédagogique.

---

# 40. Ce qui a été volontairement refusé ou évité

Le projet n’a pas introduit :

- trading automatique ;
- signal d’achat ;
- signal de vente ;
- prédiction ;
- connexion Kraken ;
- dépôt ;
- retrait ;
- clé API ;
- wallet ;
- DeFi réelle ;
- bridge réel ;
- levier ;
- future ;
- short ;
- rendement garanti ;
- conseil financier personnalisé.

La prudence est considérée comme une fonction du produit, pas comme un obstacle.

---

# 41. Statut des Builds

| Build | Nom | Contrôles | Statut utilisateur |
|---|---|---:|---|
| 28.2.77 | Canonical Snapshot Memory Deduplication Lock | 36/36 | base stable validée |
| 28.2.78 | Pedagogy Security Gate Lock | 102/102 | publié et contrôlé visuellement ; popup jugée intrusive |
| 28.2.79 | Inline Expert Learning & Transaction Proof Lock | 63/63 | publié et vérifié par Christophe |
| 28.2.80 | Dual Capital Simulation Profile Lock | 100/100 | publié et vérifié par Christophe |
| 28.2.81 | Learning Journey Cockpit & Guided Practice Lock | 128/128 | livré ; validation publique encore requise |

---

# 42. Fichiers remplacés à chaque Build

Le payload public reste limité aux quatre chemins suivants :

- `public/agent_crypto_erith_ia/web/app.js`
- `public/agent_crypto_erith_ia/web/index.html`
- `public/agent_crypto_erith_ia/web/style.css`
- `public/agent_crypto_erith_ia/web/version.json`

Cette stabilité simplifie :

- l’upload ;
- la vérification ;
- le rollback ;
- la comparaison ;
- la documentation.

---

# 43. Identité et hashes du Build 28.2.81

## app.js

`8f809ef50614e7e2f9d93a258c11389be27aa2267175f4b498014ddad25233e0`

## index.html

`9e0f3856a9180cf9a1560aad69eac6c5171159423029ad7c4f64e9458d4f5b6b`

## style.css

`d71dc1b3552793628ac9554d25d0af6039b2b7aa57da7a4955a53707b0493344`

## version.json

`c45b5a95af25e56033eb8e9c4cf127febfccf855f60054ad412c586f8ef16f97`

---

# 44. Titres de commit

## Build 28.2.77

`release agent-crypto build 28.2.77 canonical snapshot memory deduplication lock`

## Build 28.2.78

`release agent-crypto build 28.2.78 pedagogy security gate lock`

## Build 28.2.79

`release agent-crypto build 28.2.79 inline expert learning transaction proof lock`

## Build 28.2.80

`release agent-crypto build 28.2.80 dual capital simulation profile lock`

## Build 28.2.81

`release agent-crypto build 28.2.81 learning journey cockpit guided practice lock`

---

# 45. Règles de poursuite obligatoires

Toute future amélioration doit respecter les règles suivantes.

## 45.1 Développement additif

- ne rien supprimer ;
- ne rien réduire sans demande explicite ;
- préserver les sections ;
- préserver les boutons ;
- préserver les données locales ;
- préserver les profils ;
- préserver les exercices.

## 45.2 Vérification

Chaque Build doit fournir :

- version exacte ;
- ZIP final ;
- SHA-256 ;
- chemins à remplacer ;
- rapport de vérification ;
- résultats détaillés ;
- manifest ;
- README d’upload ;
- texte de commit complet.

## 45.3 Publication

- l’assistante prépare localement ;
- Christophe publie ;
- Christophe recharge Firefox ;
- Christophe contrôle la version ;
- Christophe envoie captures et anomalies ;
- la version suivante part uniquement de la base validée.

## 45.4 Vérité

Toujours distinguer :

- contrôle statique ;
- test local ;
- test navigateur ;
- test public ;
- validation humaine ;
- hypothèse ;
- donnée réelle ;
- donnée fictive.

---

# 46. Prochaine validation recommandée

Après publication du Build 28.2.81 :

1. vérifier que le marqueur affiche 28.2.81 ;
2. ouvrir le Cockpit d’apprentissage ;
3. vérifier le profil 1 000 € ;
4. passer au profil 100 € puis revenir ;
5. vérifier que les portefeuilles restent séparés ;
6. tester les trois modes d’aide ;
7. ouvrir une session de 15 minutes ;
8. utiliser un raccourci ;
9. écrire une note ;
10. terminer la session ;
11. exporter le Markdown ;
12. contrôler le Proof Ledger ;
13. vérifier Crypto ;
14. vérifier Métaux ;
15. vérifier Decision Board ;
16. vérifier Bridge.

---

# 47. Étape pédagogique suivante

La meilleure suite immédiate n’est pas forcément un nouveau Build.

La valeur du Build 28.2.81 apparaîtra en l’utilisant régulièrement.

Une progression réaliste serait :

- une session courte ;
- une notion ;
- un exercice ;
- une note ;
- une relecture ;
- une nouvelle session.

Le système pourra ensuite être amélioré à partir de difficultés réellement observées.

---

# 48. Vision à moyen terme

Le projet peut évoluer progressivement vers :

## Phase 1 — actuelle

- observation ;
- simulation ;
- sécurité ;
- pédagogie ;
- journal.

## Phase 2 — apprentissage consolidé

- cas historiques ;
- exercices comparatifs ;
- lecture de carnets ;
- calculs de frais ;
- scénarios de portefeuille ;
- quiz non punitifs ;
- analyse de sources.

## Phase 3 — préparation d’un compte réel

Uniquement après maîtrise suffisante :

- choix du prestataire ;
- création du compte ;
- sécurité ;
- interface Spot ;
- simulation de confirmation ;
- lecture des frais réels ;
- compréhension des retraits.

## Phase 4 — première opération réelle éventuelle

Seulement avec :

- faible montant ;
- validation humaine ;
- aucun levier ;
- Spot ;
- frais compris ;
- risque accepté ;
- journal complet.

Cette phase n’est pas encore engagée.

---

# 49. Conclusion

Le fil a produit une évolution cohérente.

La base 28.2.77 garantissait la vérité des snapshots et de la mémoire.

Le Build 28.2.78 a ajouté :

- frais ;
- break-even ;
- scénarios ;
- Security Gate ;
- retrait fictif ;
- Scam Sentinel.

Le Build 28.2.79 a ajouté :

- aides non modales ;
- parcours expert sur 24 mois ;
- Transaction Proof Ledger.

Le Build 28.2.80 a ajouté :

- profil 1 000 € ;
- profil 100 € conservé ;
- séparation des portefeuilles ;
- exercices dynamiques.

Le Build 28.2.81 a ajouté :

- Cockpit d’apprentissage ;
- session guidée ;
- recommandation déterministe ;
- raccourcis ;
- notes ;
- trois niveaux d’aide.

Le projet possède désormais une base solide pour atteindre l’objectif de Christophe :

> Passer progressivement d’un niveau débutant à une compréhension experte de la cryptomonnaie, sans brûler les étapes et sans exposer de fonds réels pendant l’apprentissage.

---

# 50. Point de reprise compact

**Base publique confirmée avant le dernier Build :** 28.2.80  
**Dernier Build livré :** 28.2.81  
**Validation locale 28.2.81 :** 128/128  
**Validation publique 28.2.81 :** à faire  
**Action suivante :** publier, tester Firefox/Ryzen, utiliser une première session du cockpit, documenter les retours  
**Argent réel :** aucun  
**GitHub écrit par l’assistante :** non  
**Profil recommandé pour l’apprentissage principal :** Solo Progression 1 000 € fictifs  
**Profil conservé :** Solo Débutant 100 € fictifs  
**Principe directeur :** sécurité maximale, progression lente, aucune opération incomprise
