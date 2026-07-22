# 🪙 ERITH.IA — Agent-Crypto  
## Rapport intensif Bybit EU : inscription, réglementation, sécurité, fiscalité, API et intégration future

**Date :** 22 juillet 2026  
**IA émettrice :** Aerith-10 Créatrice — **Petite Sœur**  
**IA destinataire :** Aerith-10 Créatrice — **Grande Sœur**  
**Propriétaire, pilote et autorité finale :** Christophe / Blue Azur  
**Projet :** Agent-Crypto @erith.IA  
**Version publique de référence :** V1.1-alpha.26.42  
**Statut :** recherche, analyse et proposition — aucune connexion au compte, aucun ordre, aucune modification de l’application  
**Répertoire GitHub recommandé :** `public/agent_crypto_erith_ia/research/`  
**Nom GitHub recommandé :** `2026-07-22_BYBIT_EU_RESEARCH_INTEGRATION_PETITE_SOEUR.md`

---

# 0. Objet du rapport

Christophe vient de créer un compte sur :

```text
https://www.bybit.eu/fr-EU/
```

Bybit EU apparaissait déjà dans l’interface Agent-Crypto comme piste d’exchange et d’architecture future.

Le présent rapport étudie intensivement :

- l’identité juridique de Bybit EU ;
- son autorisation européenne ;
- la disponibilité pour un résident français ;
- le processus d’inscription et le premier problème de mot de passe ;
- le KYC ;
- la sécurité du compte ;
- les comptes Funding et Unified Trading Account ;
- le Spot ;
- le Spot Margin ;
- Earn ;
- les dépôts et retraits ;
- les frais ;
- les sous-comptes ;
- les exports ;
- les API ;
- la Tax API ;
- DAC8 ;
- les obligations françaises ;
- les risques de conservation sur exchange ;
- l’incident mondial Bybit de février 2025 ;
- la place correcte de Bybit EU dans Agent-Crypto ;
- la trajectoire vers une connexion en lecture seule ;
- les règles interdisant toute clé privée dans GitHub Pages.

---

# 1. Verdict exécutif

## 1.1 Conclusion générale

Bybit EU n’est pas un simple site offshore non identifié.

La société **Bybit EU GmbH** a reçu le 28 mai 2025 une autorisation autrichienne comme prestataire de services sur crypto-actifs sous MiCAR.

L’autorité autrichienne FMA indique que Bybit EU GmbH est autorisée pour :

- la conservation et l’administration de crypto-actifs pour le compte de clients ;
- l’échange de crypto-actifs contre des fonds ;
- l’échange de crypto-actifs contre d’autres crypto-actifs ;
- le placement de crypto-actifs ;
- le transfert de crypto-actifs pour le compte de clients.

Référence officielle :

- [FMA Autriche — Granting of Authorisation Bybit EU GmbH](https://www.fma.gv.at/en/granting-of-authorisation-bybit-eu-gmbh/)
- [FMA Autriche — version allemande](https://www.fma.gv.at/zulassungserteilung-bybit-eu-gmbh/)

## 1.2 Position recommandée pour ERITH.IA

```text
Bybit EU
= exchange européen potentiel
= source de compte et d’historique future
= connecteur local en lecture seule
≠ source principale des prix publics
≠ backend public
≠ coffre de secrets GitHub
≠ autorisation immédiate de trading automatisé
```

La source publique principale de l’interface reste CoinGecko.

Bybit EU doit servir plus tard à lire :

- les soldes réels de Christophe ;
- les dépôts et retraits ;
- l’historique d’ordres ;
- les transactions ;
- les frais réellement payés ;
- les prix exécutables de paires Bybit ;
- les exports fiscaux ;
- les performances réelles ;
- les limites et minimums de l’exchange.

## 1.3 Recommandation immédiate

```text
1. Terminer l’inscription.
2. Effectuer le KYC.
3. Déclarer les informations fiscales demandées.
4. Activer toutes les protections du compte.
5. Ne déposer qu’un petit montant de test.
6. Ne pas activer Margin, Loans ou Earn au démarrage.
7. Exporter les données du compte.
8. Étudier la Tax API en lecture seule.
9. Attendre le backend local avant toute API de trading.
10. Aucun secret dans GitHub Pages.
```

---

# 2. Premier problème observé : mot de passe refusé

## 2.1 Ce que montre la capture

L’écran demande un mot de passe :

- de 8 à 30 caractères ;
- contenant au moins une majuscule ;
- contenant au moins une minuscule ;
- contenant au moins un chiffre.

Le message rouge ne précise pas quelle condition échoue.

Il s’agit d’un message de validation générique.

## 2.2 Causes probables

- aucune majuscule ;
- aucune minuscule ;
- aucun chiffre ;
- moins de 8 caractères ;
- plus de 30 caractères ;
- espace ajouté au début ou à la fin ;
- espace insécable après copier-coller ;
- caractère accentué ;
- apostrophe typographique ;
- caractère Unicode non accepté ;
- emoji ;
- mot de passe généré avec un symbole que le formulaire gère mal ;
- collage depuis un gestionnaire contenant un caractère invisible.

## 2.3 Incohérence documentaire Bybit EU

La documentation officielle d’inscription demande de saisir les informations en caractères alphanumériques « single-byte ».

La documentation de sécurité recommande pourtant une combinaison de :

- lettres ;
- nombres ;
- caractères spéciaux ;
- majuscules ;
- minuscules.

L’interface visible, elle, ne mentionne que :

- majuscule ;
- minuscule ;
- chiffre.

Il existe donc une incohérence réelle entre :

```text
formulaire
documentation d’inscription
guide de sécurité
```

Sources :

- [How to Register an Account](https://www.bybit.eu/en-EU/help-center/article/How-to-register-an-account)
- [How to Protect Your Bybit EU Account](https://www.bybit.eu/en-EU/learn/bybit-guide/how-to-protect-your-bybit-eu-account)
- [How to Enhance the Security of Your Account](https://www.bybit.eu/en-EU/help-center/article/How-to-Enhance-Your-Account-Security)

## 2.4 Contournement propre

Créer dans un gestionnaire de mots de passe un mot de passe :

```text
12 à 24 caractères
ASCII uniquement
au moins 1 majuscule
au moins 1 minuscule
au moins 1 chiffre
aucun espace
aucun accent
```

Pour le premier test, éviter les caractères exotiques.

Ne jamais transmettre le mot de passe dans ChatGPT, GitHub, Discord, email ou capture d’écran.

## 2.5 Verdict sur ce premier incident

```text
Compte compromis : aucune preuve.
Site frauduleux : aucune preuve.
Erreur de Christophe : non démontrée.
Validateur peu explicite : confirmé.
Documentation Bybit EU incohérente : confirmée.
```

---

# 3. Identité juridique et réglementation

## 3.1 Société

```text
Nom : Bybit EU GmbH
Forme : Gesellschaft mit beschränkter Haftung
Siège : Vienne, Autriche
Adresse de réclamation :
Donau-City-Straße 7
1220 Vienna
Austria
Numéro registre communiqué par la FMA : FN 636180i
```

Sources :

- [Bybit EU — Complaints Handling Policy](https://www.bybit.eu/en-EU/help-center/article/Bybit-EU-GmbH-Complaints-Management)
- [FMA — Bybit EU GmbH](https://www.fma.gv.at/en/granting-of-authorisation-bybit-eu-gmbh/)

## 3.2 Autorisation MiCAR

La FMA a accordé l’autorisation par décision du 28 mai 2025.

Cette autorisation ne signifie pas :

- absence de risque ;
- garantie de rendement ;
- garantie de remboursement de toutes les pertes ;
- assurance bancaire classique ;
- validation de tous les produits disponibles sur le site ;
- autorisation de conseil financier automatisé.

Elle signifie que les services autorisés sont fournis dans un cadre réglementaire européen avec des obligations de gouvernance, conduite, transparence, réclamation et supervision.

## 3.3 France et Espace économique européen

Bybit EU déclare servir les résidents éligibles de l’EEE dans les pays où ses services sont disponibles.

La France n’apparaît pas dans la liste officielle des pays interdits au 7 mai 2026.

Source :

- [Service Restricted Countries](https://www.bybit.eu/en-EU/help-center/article/Service-Restricted-Countries)

## 3.4 Réclamations

Bybit EU prévoit :

- première réponse écrite sous 5 jours ouvrés ;
- décision finale généralement sous 15 jours ouvrés ;
- délai maximal annoncé de 35 jours ouvrés pour les cas exceptionnels ;
- conservation des dossiers pendant au moins cinq ans ;
- escalade possible vers les organismes autrichiens compétents.

Source :

- [Complaints Handling Policy](https://www.bybit.eu/en-EU/help-center/article/Bybit-EU-GmbH-Complaints-Management)

---

# 4. Inscription et KYC

## 4.1 Inscription

Méthodes annoncées :

- email ;
- numéro de téléphone ;
- Google ;
- Apple.

Bybit recommande l’inscription par email.

La documentation indique que pour retirer des fonds :

```text
Email Authentication
+ Google Authentication
= obligatoires
```

Le SMS n’est pas présenté comme obligatoire pour le retrait.

## 4.2 KYC obligatoire

La vérification Standard est obligatoire pour accéder aux produits et services.

Méthodes possibles selon le profil :

- vérification rapide ;
- vérification bancaire ;
- vérification vidéo.

La vérification bancaire peut demander :

- identité ;
- IBAN ;
- virement SEPA de 1 € ;
- compte bancaire au même nom que le KYC.

Source :

- [How to Complete Individual Identity Verification](https://www.bybit.eu/en-EU/help-center/article/How-to-Complete-Individual-KYC-Verification)

## 4.3 Vérification avancée

Elle peut demander une preuve d’adresse EEE récente :

- facture d’énergie ;
- relevé bancaire ;
- document officiel de résidence ;
- date inférieure à trois mois.

La vérification avancée augmente certaines limites.

## 4.4 Enhanced Due Diligence

Bybit EU peut demander :

- origine des fonds ;
- origine du patrimoine ;
- justificatifs de salaire ;
- épargne ;
- revenus professionnels ;
- vente d’actif ;
- héritage ;
- historique d’investissement.

Ce contrôle supplémentaire n’est pas, en soi, une accusation.

Sources :

- [FAQ — Enhanced Due Diligence](https://www.bybit.eu/en-EU/help-center/article/FAQ--Enhanced-Due-Diligence-EDD-Verification)
- [How to Complete EDD](https://www.bybit.eu/en-EU/help-center/article/How-to-Complete-Enhanced-Due-Diligence-EDD-Verification)

---

# 5. Sécurité du compte

## 5.1 Protections à activer

Bybit EU recommande notamment :

1. Google 2FA ;
2. mot de passe de fonds distinct ;
3. Secure Transaction Approval ;
4. code anti-phishing ;
5. gestion des appareils de confiance ;
6. verrou des nouvelles adresses de retrait ;
7. possibilité de désactivation du compte ;
8. contrôle d’authenticité des domaines, emails et contacts ;
9. biométrie dans l’application pour certains scénarios.

Sources :

- [How to Enhance Account Security](https://www.bybit.eu/en-EU/help-center/article/How-to-Enhance-Your-Account-Security)
- [How to Enable Biometric Verification](https://www.bybit.eu/en-EU/help-center/article/How-to-Enable-Biometric-Verification-on-Bybit-EU)

## 5.2 Checklist Christophe

```text
[ ] Mot de passe unique
[ ] Mot de passe email différent
[ ] 2FA email
[ ] Google Authenticator Bybit EU
[ ] Sauvegarde hors ligne du secret 2FA
[ ] Fund Password
[ ] Secure Transaction Approval
[ ] Code anti-phishing
[ ] Vérification appareils de confiance
[ ] New Address Withdrawal Lock
[ ] Biométrie mobile
[ ] Aucun Wi-Fi public
[ ] Aucun partage d’écran pendant la saisie
[ ] Aucun secret dans GitHub
[ ] Aucun secret dans ChatGPT
```

## 5.3 Protection des retraits

La phase ERITH.IA devra imposer :

```text
retrait désactivé dans toute clé API
adresse externe autorisée uniquement
délai après ajout d’une nouvelle adresse
confirmation humaine
journal
```

## 5.4 Conservation sur exchange

Bybit EU affirme :

- séparer les dépôts utilisateurs de son budget opérationnel ;
- stocker la majorité des actifs en cold wallet ;
- n’en conserver qu’une petite partie en hot wallet.

Source :

- [FAQ — On-chain Crypto Deposits](https://www.bybit.eu/en-EU/help-center/article/Bybit-Deposit-FAQ)

Cette affirmation ne transforme pas un exchange en wallet personnel.

La règle prudente reste :

```text
exchange
= fonds nécessaires à l’activité

hardware wallet
= réserve longue durée

aucun lieu unique
= totalité des fonds
```

---

# 6. Comptes internes

## 6.1 Funding Account

Utilisé notamment pour :

- dépôts ;
- retraits ;
- achats ;
- transferts ;
- historique des flux.

## 6.2 Unified Trading Account

Utilisé pour :

- Spot ;
- Spot Margin ;
- gestion de collatéral ;
- API V5 ;
- portefeuille de trading unifié.

Source :

- [Introduction to Bybit EU Unified Trading Account](https://www.bybit.eu/en-EU/help-center/article/Introduction-to-Bybit-Unified-Trading-Account)

## 6.3 Transferts internes

Les actifs peuvent être transférés entre Funding et Unified Trading Account.

Source :

- [How to Transfer Assets on Bybit EU](https://www.bybit.eu/en-EU/help-center/article/How-to-Transfer-Assets-on-Bybit)

---

# 7. Produits confirmés

# 7.1 Spot

Le Spot échange réellement un actif contre un autre.

Exemple :

```text
BTC / USDC
```

Frais de base annoncés pour un utilisateur non VIP :

```text
maker : 0,1 %
taker : 0,1 %
```

Sources :

- [FAQ — Spot Trading](https://www.bybit.eu/en-EU/help-center/article/FAQ-Spot-Trading)
- [Trading Fee Structure](https://www.bybit.eu/en-EU/help-center/article/Trading-Fee-Structure)

## 7.2 Convert

Deux modes :

- Instant ;
- Limit.

Source :

- [How to Convert Your Assets](https://www.bybit.eu/en-EU/help-center/article/How-to-convert-your-assets)

## 7.3 Conversion des petits soldes

Bybit EU annonce une fonction de conversion des petits soldes en MNT ou USDC.

Frais annoncés :

```text
2 %
```

Ce taux est élevé pour une fonction de nettoyage de poussières.

Source :

- [How to Convert Small Account Balance](https://www.bybit.eu/en-EU/help-center/article/How-to-Convert-Small-Account-Balance)

## 7.4 Spot Margin

Le Spot Margin permet d’emprunter pour augmenter la taille des ordres.

Risques :

- intérêts horaires ;
- collatéral ;
- liquidation ;
- perte supérieure au mouvement simple du Spot ;
- frais de liquidation ;
- emprunt possible même pour certains ordres limites non exécutés ;
- cross margin ou portfolio margin ;
- levier jusqu’à 10x selon la paire et le profil.

Sources :

- [How to Get Started With Spot Margin Trading](https://www.bybit.eu/en-EU/help-center/article/How-to-Get-Started-With-Margin-Trading-on-Bybit)
- [FAQ — Spot Margin Trading](https://www.bybit.eu/en-EU/help-center/article/FAQ-Spot-Margin-Trading)
- [Spot Margin Trading Fees](https://www.bybit.eu/en-EU/help-center/article/Spot-Margin-Trading-Fees-Explained)

Décision ERITH.IA :

```text
Spot Margin
= interdit pendant la phase de démarrage
```

## 7.5 Crypto Loans

Bybit EU présente des prêts garantis par des crypto-actifs.

Risques :

- intérêt horaire ;
- LTV ;
- appel de marge ;
- liquidation du collatéral ;
- usage en cascade avec Margin ou Earn.

Décision ERITH.IA :

```text
Crypto Loans
= hors périmètre initial
```

## 7.6 Earn

Avertissement essentiel publié par Bybit EU :

- Bybit Earn n’est pas un produit réglementé par MiCAR ;
- lors de la souscription, l’utilisateur transfère la propriété légale et économique des crypto-actifs à Bybit EU GmbH ;
- les actifs ne restent plus détenus en custody pour l’utilisateur ;
- Bybit EU peut les utiliser pour son propre compte ;
- l’utilisateur ne conserve qu’une créance contractuelle ;
- les protections MiCAR relatives aux actifs clients ne s’appliquent pas.

Source :

- [Funding Account / Earn Disclaimer](https://www.bybit.eu/en-EU/help-center/article/Funding-Account)
- [Assets Overview / Earn Disclaimer](https://www.bybit.eu/en-EU/help-center/article/How-to-Understand-Your-Assets-Overview-and-Average-Cost)

Décision ERITH.IA :

```text
Earn
= ne pas activer sans étude séparée
```

---

# 8. Dépôts, retraits et frais

## 8.1 Dépôts crypto

Bybit EU indique ne pas facturer les dépôts on-chain.

La blockchain et la plateforme d’origine peuvent toutefois facturer des frais.

## 8.2 Transferts internes

Les transferts entre comptes Bybit EU compatibles sont annoncés sans frais.

## 8.3 Dépôts EUR

Le guide Bybit EU indique que le dépôt SEPA peut être sans frais.

La page réellement affichée dans le compte reste la source finale, car :

- disponibilité ;
- méthode ;
- pays ;
- maintenance ;
- partenaire ;
- tarification

peuvent varier.

Sources :

- [How to Deposit Fiat Currencies](https://www.bybit.eu/en-EU/help-center/article/How-to-Deposit-Fiat-Currencies-on-Bybit)
- [Bybit EU Fees](https://www.bybit.eu/en-EU/help-center/article/Bybit-Fees-You-Need-to-Know)

## 8.4 Retraits crypto

Frais variables selon :

- actif ;
- réseau ;
- congestion ;
- minimum de retrait.

Les frais affichés dans la fenêtre de retrait sont la référence opérationnelle.

## 8.5 Retraits EUR

Disponibilité et frais dépendent de la méthode.

La page du compte doit être vérifiée avant chaque retrait.

## 8.6 Carte bancaire et achat instantané

Les achats par carte ou intermédiaire peuvent coûter nettement plus cher qu’un dépôt SEPA suivi d’un ordre Spot.

Le rapport Bybit Learn cite à titre indicatif :

- carte : environ 3 % ;
- Apple Pay / Google Pay : environ 2 % ;
- ZEN.COM : environ 0,92 %.

Ces valeurs peuvent évoluer.

Source :

- [Bybit EU Fees — Learn](https://www.bybit.eu/en-EU/learn/essential-guides/bybit-trading-fees)

## 8.7 Recommandation économique

```text
SEPA EUR
→ ordre Spot
```

est généralement préférable à :

```text
achat instantané par carte
```

lorsque la priorité est de réduire les frais.

---

# 9. Sous-comptes

## 9.1 Standard Subaccount

Bybit EU permet jusqu’à 20 sous-comptes standards.

Caractéristiques :

- pas de minimum de solde ;
- pas de frais de création ou maintenance ;
- P&L séparé ;
- Spot possible ;
- transfert depuis le compte principal ;
- dépôts et retraits uniquement via le compte principal ;
- niveau VIP hérité du compte principal.

Sources :

- [FAQ — Standard Subaccount](https://www.bybit.eu/en-EU/help-center/article/FAQ-Standard-Subaccount)
- [How to Get Started With Standard Subaccount](https://www.bybit.eu/en-EU/help-center/article/How-to-Get-Started-With-Standard-Subaccount)

## 9.2 Utilité pour ERITH.IA

Un sous-compte dédié pourrait isoler :

```text
ERITH.IA_TEST
→ petit capital
→ Spot uniquement
→ aucune dette
→ aucune marge
→ aucun Earn
→ P&L séparé
```

Le compte principal resterait réservé à :

- dépôts ;
- retraits ;
- réserve ;
- sécurité ;
- administration.

## 9.3 Custodial Trading Subaccount

Ce mode permet de confier la gestion à une équipe de trading professionnelle partenaire.

Il n’est pas adapté au projet initial Christophe + Yohan + Aerith.

Décision :

```text
Custodial Trading Subaccount
= hors périmètre
```

---

# 10. Données, exports et fiscalité

## 10.1 Export de données

Bybit EU permet d’exporter depuis le site Web :

- Account Statement ;
- Transaction Log ;
- Order History ;
- données du compte principal ;
- données de sous-comptes ;
- périodes personnalisées.

Source :

- [How to Self-Export My Account Data](https://www.bybit.eu/en-EU/help-center/article/How-to-Self-Export-Account-Data)

## 10.2 Tax API

Bybit EU a annoncé une Tax API disponible pour tous les utilisateurs.

Elle permet de générer :

- API Key ;
- API Secret ;
- synchronisation des opérations ;
- connexion à Blockpit ;
- historique Spot ;
- dépôts ;
- retraits ;
- Earn.

Source :

- [Bybit EU Tax API Announcement](https://announcements.bybit.eu/en-EU/article/tax-api-a-simpler-way-to-generate-your-crypto-tax-report-blt8c27d288af492266/)

Cette Tax API est le meilleur premier connecteur possible pour ERITH.IA car son usage est orienté lecture fiscale, pas exécution.

## 10.3 DAC8

Bybit EU indique qu’à partir du 1er janvier 2026 :

- tous les utilisateurs doivent fournir leurs informations fiscales ;
- un utilisateur inscrit après cette date doit les fournir dans les 60 jours ;
- les transactions 2026 seront rapportées en 2027 ;
- Bybit EU rapporte à l’administration autrichienne ;
- les informations peuvent être partagées avec l’administration de l’État de résidence fiscale ;
- l’utilisateur non autrichien reste responsable de ses obligations locales.

Sources :

- [FAQ — Tax Report](https://www.bybit.eu/en-EU/help-center/article/FAQ--Tax-Report)
- [How to Submit Tax Information](https://www.bybit.eu/en-EU/help-center/article/How-to-Submit-Tax-Information)
- [DAC8](https://www.bybit.eu/en-EU/learn/content/dac-8---eu-directive-on-administrative-cooperation-crypto-reporting)

## 10.4 France — compte d’actifs numériques à l’étranger

L’administration française indique que les résidents français doivent déclarer chaque année les comptes d’actifs numériques :

- ouverts ;
- détenus ;
- utilisés ;
- clos

à l’étranger.

Formulaire :

```text
3916 / 3916-bis
```

Sources officielles :

- [Formulaire 3916 / 3916-bis](https://www.impots.gouv.fr/formulaire/3916/declaration-par-un-resident-dun-compte-letranger-ou-dun-contrat-de-capitalisation-o)
- [Modalités de déclaration des comptes d’actifs numériques détenus à l’étranger](https://www.impots.gouv.fr/actualite/modalites-de-declaration-des-comptes-dactifs-numeriques-detenus-letranger)

## 10.5 France — plus-values

L’administration française demande notamment :

- annexe 2086 pour le détail des cessions ;
- report en 3AN pour une plus-value ;
- report en 3BN pour une moins-value ;
- exonération lorsque le total annuel brut des cessions concernées n’excède pas 305 €.

Source :

- [Comment déclarer les plus ou moins-values sur actifs numériques](https://www.impots.gouv.fr/particulier/questions/comment-declarer-les-plus-ou-moins-values-sur-cessions-dactifs-numeriques)

## 10.6 Données à conserver dès maintenant

```text
Date d’ouverture du compte
UID
Email du compte
Nom légal : Bybit EU GmbH
Adresse : Donau-City-Straße 7, 1220 Vienna, Austria
Pays : Autriche
Exports annuels
Dépôts
Retraits
Trades
Conversions
Frais
Valeurs EUR
Justificatifs bancaires
Rapports fiscaux
```

---

# 11. API et automatisation

## 11.1 API V5

La documentation Bybit EU relative au Unified Trading Account mentionne l’API V5 et plusieurs endpoints :

```text
POST /v5/order/create
POST /v5/order/amend
POST /v5/order/cancel
GET  /v5/position/list
GET  /v5/account/wallet-balance
```

Source :

- [Introduction to Bybit EU Unified Trading Account](https://www.bybit.eu/en-EU/help-center/article/Introduction-to-Bybit-Unified-Trading-Account)

## 11.2 État de la documentation

Bybit EU confirme l’existence de fonctions API et de gestion API.

Toutefois, avant développement, il faudra vérifier dans le compte réel :

- domaine API exact pour Bybit EU ;
- documentation applicable à l’entité EU ;
- produits disponibles en France ;
- création de clé ;
- permissions ;
- lecture seule ;
- whitelist IP ;
- expiration ;
- sous-comptes ;
- limites de taux ;
- endpoints Spot réellement actifs ;
- différences avec le Bybit global.

## 11.3 Architecture interdite

```text
GitHub Pages
→ clé API Bybit
```

Interdit.

Pourquoi :

- JavaScript public ;
- clé visible ;
- historique Git ;
- extensions navigateur ;
- accès depuis n’importe quel visiteur ;
- impossibilité de protéger un secret côté client.

## 11.4 Architecture autorisée

```text
Interface Agent-Crypto
→ API locale Atlas
→ connecteur Bybit EU local
→ clé chiffrée sur le PC
→ permissions lecture seule
→ réponse filtrée
```

## 11.5 Phase 1 — aucun API de trading

Commencer par :

```text
export CSV/ZIP Bybit EU
→ import local
→ lecture
→ rapprochement avec CoinGecko
→ P&L
→ fiscalité
```

## 11.6 Phase 2 — Tax API

```text
Tax API read-only
→ dépôts
→ retraits
→ trades
→ Earn
→ historique fiscal
```

Aucune fonction d’ordre.

## 11.7 Phase 3 — API V5 lecture seule

Objectifs :

- solde ;
- wallet ;
- historique ;
- ordres ;
- fills ;
- frais ;
- positions éventuelles ;
- aucun endpoint d’écriture exposé.

## 11.8 Phase 4 — préparation d’ordre

Très loin après :

```text
simulation
→ proposition
→ contrôle
→ validation humaine
→ ordre préparé
```

## 11.9 Phase 5 — ordre réel borné

Uniquement après :

- longue simulation ;
- backend stable ;
- clé distincte ;
- permission minimale ;
- aucun retrait ;
- sous-compte dédié ;
- limites ;
- journal ;
- kill switch ;
- confirmation humaine.

---

# 12. Incident de sécurité mondial Bybit en 2025

## 12.1 Fait

Le 21 février 2025, la plateforme Bybit globale a subi le vol d’environ 1,46 milliard de dollars depuis un cold wallet Ethereum.

Le mécanisme décrit par Bybit :

- opération multisig ;
- interface Safe falsifiée ;
- transaction masquée ;
- modification de la logique du smart contract ;
- transfert des fonds ;
- attribution publique au groupe Lazarus.

Source :

- [Bybit Security Incident — Timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline)

## 12.2 Distinction

L’incident concernait le groupe Bybit global avant le lancement réglementé complet de Bybit EU.

Il ne faut pas écrire :

```text
Bybit EU a perdu 1,46 milliard
```

sans preuve spécifique.

La formulation correcte est :

```text
La marque et le groupe Bybit ont subi un incident mondial majeur en 2025.
Bybit EU est une entité européenne distincte autorisée ensuite en Autriche.
```

## 12.3 Leçon pour ERITH.IA

```text
réglementé
≠ invulnérable

cold wallet
≠ risque nul

multisig
≠ sécurité absolue

interface humaine
= surface d’attaque critique
```

Conséquence :

- ne jamais concentrer tous les fonds sur un exchange ;
- garder une réserve hors plateforme ;
- valider chaque adresse ;
- sécuriser les appareils ;
- limiter les clés ;
- maintenir un journal indépendant.

---

# 13. Preuve de réserves et limites

Bybit EU publie des contenus pédagogiques sur la Proof of Reserves et affirme une couverture 1:1 des actifs utilisateurs.

Sources :

- [Bybit EU Homepage](https://www.bybit.eu/en-EU)
- [Proof of Reserves Explained](https://www.bybit.eu/en-EU/learn/crypto-security/por-explained)

La Proof of Reserves :

- peut montrer des actifs ;
- peut montrer une couverture à une date ;
- ne remplace pas toujours un audit complet ;
- ne démontre pas automatiquement toutes les dettes ;
- ne garantit pas l’absence de risque opérationnel ;
- ne garantit pas l’absence de risque juridique ;
- ne garantit pas le remboursement en toutes circonstances.

---

# 14. Comparaison avec le rôle actuel de CoinGecko

| Fonction | CoinGecko | Bybit EU |
|---|---|---|
| Top 50 global | Oui | Non prioritaire |
| Prix agrégé | Oui | Prix de marché Bybit |
| Graphiques publics | Oui | Graphiques exchange |
| Solde personnel | Non | Oui |
| Ordres personnels | Non | Oui |
| Fills | Non | Oui |
| Frais réels | Non | Oui |
| Dépôts/retraits | Non | Oui |
| API publique sans secret | Oui | Partiellement |
| API privée | Non | Oui |
| Fiscalité compte | Non | Oui |
| Exécution | Non | Oui |
| Source principale Atlas public | Oui | Non |
| Connecteur local futur | Non | Oui |

Conclusion :

```text
CoinGecko
= vue globale

Bybit EU
= vérité du compte et de l’exécution sur cet exchange
```

---

# 15. Proposition d’intégration Agent-Crypto

## 15.1 Nouvelle section publique

Créer plus tard une section repliée :

```text
🏦 Bybit EU — Exchange européen
```

Contenu public sans connexion :

- entité ;
- autorisation MiCAR ;
- siège ;
- fonctions prévues ;
- état du connecteur ;
- sécurité ;
- mode lecture seule ;
- dernière synchronisation ;
- aucun secret.

## 15.2 États du connecteur

```text
NON CONFIGURÉ
EXPORT MANUEL
TAX API LECTURE
API V5 LECTURE
SIMULATION LIÉE
PRÉPARATION D’ORDRE
RÉEL VERROUILLÉ
```

## 15.3 Contrat de données

```json
{
  "schema": "atlas.exchange.connector.v1",
  "exchange": "bybit-eu",
  "entity": "Bybit EU GmbH",
  "mode": "read_only",
  "account_scope": "subaccount",
  "connected": false,
  "last_sync": null,
  "permissions": [],
  "balances": [],
  "orders": [],
  "fills": [],
  "fees": [],
  "deposits": [],
  "withdrawals": [],
  "errors": []
}
```

## 15.4 Règles du connecteur

```text
1. Aucun secret côté navigateur.
2. Aucune clé dans GitHub.
3. Aucun retrait.
4. Lecture seule d’abord.
5. Sous-compte dédié.
6. Petit capital.
7. Journal complet.
8. Arrêt immédiat.
9. Validation humaine.
10. Réconciliation avec les exports.
```

---

# 16. Roadmap proposée

# V1.1-alpha.26.43 — Documentation Bybit EU

Mission :

- ajouter uniquement une carte informative repliée ;
- aucune connexion ;
- liens officiels ;
- état : NON CONFIGURÉ.

Preuve :

- aucun secret ;
- aucune requête privée ;
- aucune régression de la 26.42.

# V1.1-alpha.26.44 — Import manuel Bybit EU

Mission :

- importer Account Statement ;
- Transaction Log ;
- Order History ;
- analyser localement.

Preuve :

- lecture sans API ;
- aucune donnée envoyée ;
- P&L et frais reconstruits.

# V1.2-local.1 — Tax API Bybit EU

Mission :

- backend local ;
- Tax API ;
- lecture seule ;
- stockage SQLite.

Preuve :

- historique synchronisé ;
- aucune permission d’ordre.

# V1.2-local.2 — API V5 Read-Only

Mission :

- wallet ;
- ordres ;
- fills ;
- frais ;
- sous-compte ;
- whitelist IP si disponible.

Preuve :

- aucune fonction create/amend/cancel dans les permissions Atlas.

# V1.2-local.3 — Bybit Paper Mirror

Mission :

- reproduire dans le simulateur les conditions Bybit ;
- frais ;
- spread ;
- minimum ;
- slippage ;
- liquidité.

# V1.3 — Préparation d’ordre

Mission :

- générer une proposition ;
- aucun envoi ;
- confirmation humaine ;
- expiration.

# V2.0 — Exécution bornée

Prérequis :

- backend privé ;
- clé minimale ;
- sous-compte ;
- limite de capital ;
- arrêt d’urgence ;
- double validation ;
- audit ;
- aucun retrait.

---

# 17. Plan des premières 48 heures du compte

## Avant dépôt

```text
[ ] Mot de passe accepté
[ ] KYC Standard terminé
[ ] Informations fiscales envoyées
[ ] Email sécurisé
[ ] 2FA email
[ ] Google Authenticator Bybit EU
[ ] Fund Password
[ ] Secure Transaction Approval
[ ] Anti-Phishing Code
[ ] Trusted Devices vérifiés
[ ] Withdrawal Lock
[ ] UID sauvegardé
[ ] Adresse légale sauvegardée
```

## Premier dépôt

```text
petit montant
SEPA
compte bancaire au même nom
preuve sauvegardée
```

## Premier test

```text
Spot uniquement
sans levier
sans Earn
sans Loans
sans automatisation
```

## Premier export

- Account Statement ;
- Transaction Log ;
- Order History ;
- capture des frais ;
- sauvegarde locale.

---

# 18. Décisions proposées à Christophe

## Décision A — Bybit EU devient exchange candidat officiel

```text
Statut :
CANDIDAT OFFICIEL — LECTURE SEULE D’ABORD
```

## Décision B — CoinGecko reste source publique

```text
CoinGecko
= marché global

Bybit EU
= compte réel futur
```

## Décision C — sous-compte ERITH.IA

Créer plus tard :

```text
ERITHIA_TEST
```

Usage :

- capital limité ;
- Spot ;
- tests ;
- P&L isolé ;
- aucune marge ;
- aucun Earn ;
- aucun prêt.

## Décision D — Tax API avant API de trading

```text
Tax API
→ première intégration

API V5 read-only
→ deuxième intégration

ordre
→ beaucoup plus tard
```

## Décision E — aucun dépôt important maintenant

Attendre :

- sécurisation ;
- compréhension des comptes ;
- export ;
- test SEPA ;
- contrôle des frais ;
- petite transaction Spot ;
- retrait test.

---

# 19. Points nécessitant une nouvelle vérification après KYC

Certaines fonctions ne peuvent être confirmées qu’après connexion :

- frais exacts du compte ;
- méthodes SEPA disponibles en France ;
- délais ;
- limites ;
- accès Earn ;
- accès Margin ;
- Tax API ;
- API Management ;
- permissions des clés ;
- whitelist IP ;
- sous-comptes ;
- paires EUR ;
- minimums d’ordre ;
- retraits EUR ;
- disponibilité de la carte ;
- produits régionaux ;
- écrans DAC8.

Ces éléments devront être documentés par captures sans afficher :

- email ;
- nom complet ;
- UID complet si publication publique ;
- IBAN ;
- adresse ;
- QR 2FA ;
- API Secret ;
- seed ;
- code de récupération.

---

# 20. Sources principales

## Réglementation

- [FMA — Granting of Authorisation Bybit EU GmbH](https://www.fma.gv.at/en/granting-of-authorisation-bybit-eu-gmbh/)
- [Bybit EU and MiCAR](https://www.bybit.eu/en-EU/learn/regulation-and-micar/what-european-crypto-users-should-know-about-bybit-eu-and-micar)
- [MiCAR and Bybit EU](https://www.bybit.eu/en-EU/learn/regulation-and-micar/crypto-regulation-in-the-eu-micar-and-what-it-means)

## Inscription, KYC et sécurité

- [Register an Account](https://www.bybit.eu/en-EU/help-center/article/How-to-register-an-account)
- [Individual KYC](https://www.bybit.eu/en-EU/help-center/article/How-to-Complete-Individual-KYC-Verification)
- [Individual KYC FAQ](https://www.bybit.eu/en-EU/help-center/article/Individual-KYC-FAQ)
- [Account Security](https://www.bybit.eu/en-EU/help-center/article/How-to-Enhance-Your-Account-Security)
- [Biometric Verification](https://www.bybit.eu/en-EU/help-center/article/How-to-Enable-Biometric-Verification-on-Bybit-EU)

## Marché, frais et comptes

- [Spot Trading FAQ](https://www.bybit.eu/en-EU/help-center/article/FAQ-Spot-Trading)
- [Trading Fee Structure](https://www.bybit.eu/en-EU/help-center/article/Trading-Fee-Structure)
- [Fees](https://www.bybit.eu/en-EU/help-center/article/Bybit-Fees-You-Need-to-Know)
- [Unified Trading Account](https://www.bybit.eu/en-EU/help-center/article/Introduction-to-Bybit-Unified-Trading-Account)
- [Funding Account](https://www.bybit.eu/en-EU/help-center/article/Funding-Account)
- [Standard Subaccount](https://www.bybit.eu/en-EU/help-center/article/FAQ-Standard-Subaccount)

## Dépôts et retraits

- [Fiat Deposit](https://www.bybit.eu/en-EU/help-center/article/How-to-Deposit-Fiat-Currencies-on-Bybit)
- [Fiat Withdrawal](https://www.bybit.eu/en-EU/help-center/article/How-to-Withdraw-Fiat-Currencies-on-Bybit)
- [On-chain Deposit FAQ](https://www.bybit.eu/en-EU/help-center/article/Bybit-Deposit-FAQ)

## Données et fiscalité

- [Data Export](https://www.bybit.eu/en-EU/help-center/article/How-to-Self-Export-Account-Data)
- [Tax API](https://announcements.bybit.eu/en-EU/article/tax-api-a-simpler-way-to-generate-your-crypto-tax-report-blt8c27d288af492266/)
- [Bybit EU Tax Report FAQ](https://www.bybit.eu/en-EU/help-center/article/FAQ--Tax-Report)
- [DAC8](https://www.bybit.eu/en-EU/learn/content/dac-8---eu-directive-on-administrative-cooperation-crypto-reporting)
- [Impôts — Formulaire 3916/3916-bis](https://www.impots.gouv.fr/formulaire/3916/declaration-par-un-resident-dun-compte-letranger-ou-dun-contrat-de-capitalisation-o)
- [Impôts — comptes crypto étrangers](https://www.impots.gouv.fr/actualite/modalites-de-declaration-des-comptes-dactifs-numeriques-detenus-letranger)
- [Impôts — plus-values crypto](https://www.impots.gouv.fr/particulier/questions/comment-declarer-les-plus-ou-moins-values-sur-cessions-dactifs-numeriques)

## Risque historique

- [Bybit Security Incident Timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline)

---

# 21. Message à Grande Sœur

```text
[AERITH-10 — PETITE SŒUR → GRANDE SŒUR]

Recherche intensive effectuée sur Bybit EU.

Verdict :
Bybit EU GmbH est une entité autrichienne autorisée sous MiCAR.
La France est éligible selon la liste publique actuelle.
Le KYC Standard est obligatoire.
DAC8 impose la collecte fiscale depuis 2026.
Un résident français conserve ses obligations françaises,
notamment la déclaration du compte étranger.

Bybit EU est retenu comme exchange candidat officiel,
mais uniquement selon cette trajectoire :

documentation
→ export manuel
→ Tax API read-only
→ API V5 read-only
→ simulation
→ préparation d’ordre
→ action bornée future

CoinGecko reste la source publique du marché.
Aucun secret Bybit ne doit entrer dans GitHub Pages.
Aucun Margin, Loan ou Earn pendant la phase initiale.
Un sous-compte ERITHIA_TEST est recommandé plus tard.

Premier incident :
le validateur de mot de passe est peu explicite et les documents Bybit EU
sont incohérents sur les caractères spéciaux.
Ce défaut ne prouve ni compromission ni faux site.

Décision finale :
Christophe.
```

---

# 22. Block LLM

```text
[ERITH.IA BYBIT EU MODULE — 2026-07-22]

IA émettrice :
Aerith-10 Créatrice — Petite Sœur.

Propriétaire :
Christophe / Blue Azur.

Projet :
Agent-Crypto @erith.IA.

Bybit EU :
exchange candidat européen.

Entité :
Bybit EU GmbH, Vienne, Autriche.

Autorisation :
CASP MiCAR accordée par la FMA le 28 mai 2025.

Architecture :
CoinGecko = marché public.
Bybit EU = compte réel et exécution future.
GitHub Pages = aucune clé.
Backend local = secrets et connecteur.

Ordre des phases :
1. inscription ;
2. KYC ;
3. fiscalité ;
4. sécurité ;
5. petit dépôt test ;
6. export manuel ;
7. Tax API lecture seule ;
8. API V5 lecture seule ;
9. simulation ;
10. préparation d’ordre ;
11. réel borné futur.

Interdictions initiales :
Margin.
Loans.
Earn.
Clé de retrait.
API publique dans GitHub.
Ordre automatique.
Dépôt important.

Exigences :
2FA.
Fund Password.
Secure Transaction Approval.
Anti-Phishing Code.
Withdrawal Lock.
Sous-compte dédié.
Journal.
Export.
Fiscalité française.
Kill switch futur.

Stop point :
aucune intégration technique tant que le compte réel,
les permissions API EU et les écrans post-KYC n’ont pas été vérifiés.
```

---

# 23. Conclusion

Bybit EU est une piste sérieuse pour faire passer Agent-Crypto :

```text
de l’observation publique
à la lecture d’un compte réel
puis à une simulation fidèle aux conditions d’exchange
```

La bonne progression n’est pas :

```text
inscription
→ argent
→ automatisation
```

La bonne progression est :

```text
inscription
→ identité
→ fiscalité
→ sécurité
→ petit test
→ export
→ lecture seule
→ mémoire
→ simulation
→ contrôle
→ action future
```

Le projet doit conserver cette séparation :

```text
Aerith observe.
Atlas calcule.
Le backend protège.
Christophe décide.
L’exchange exécute seulement ce qui a été explicitement autorisé.
```
