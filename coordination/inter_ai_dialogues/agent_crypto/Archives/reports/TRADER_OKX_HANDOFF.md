# Trader / OKX — handoff canonique

Date : 2026-10-12

## Base protégée

- Trader canonique : **40.6.625**
- Architecture à conserver : `trading-desk.html` → iframe Administrator `?surface=trader` → `trader-runtime-mirror.js`
- Ne pas reconstruire le Trader depuis une ancienne lignée.
- Ne pas toucher au Graphique, Market Core 38.15.11, Lecture Technique, Market, Coffre ou géométrie F11 sans demande explicite.
- Checkpoint avant raccordement compte OKX : `checkpoint/trader-40.6.625-before-okx-account-20261012`

## Bridge / Aether Trust

- Bridge actif terrain : **1.9.15**
- Backend public : **1.4.6**, port 8790, lecture publique uniquement.
- Bridge privé : port **8787**.
- Aether Trust Owner : session persistante tant que le Bridge tourne ; logout / arrêt Bridge révoque la session.
- Identifiants API OKX stockés localement sous Windows via DPAPI.
- Aucun secret OKX dans GitHub, navigateur, localStorage ou IndexedDB.
- API OKX utilisée : clé **READ uniquement**, sans Trade ni Withdraw.

## Validation terrain acquise

La chaîne suivante a été validée sur le poste utilisateur :

`Trader / test local → Aether Trust → Bridge 8787 → API privée OKX EEA → compte réel`

Le test READ a retourné notamment :
- BTC réel : `0.0001280278957421 BTC` au moment du test ;
- ordres ouverts : 0 ;
- historique 3 mois : 0 ;
- exécutions 3 mois : 0 ;
- frais BTC-USDC lus ;
- compte EEA lu avec succès.

Le panneau Trader `COMPTE OKX · RÉEL` a également été validé connecté dans Firefox, avec rechargement Ctrl+F5 conservant la session navigateur.

## Surface Trader OKX

Fichier propriétaire : `public/agent_crypto_erith_ia/trader/trader-okx-account.js`

Fonctions présentes :
- BTC détenu ;
- USDC disponible ;
- EUR disponible ;
- ordres ouverts ;
- historique 3 mois ;
- exécutions 3 mois ;
- frais BTC-USDC ;
- rafraîchissement manuel et automatique ;
- authentification Aether Trust si aucune session Bridge n’est liée ;
- aucune route d’ordre réel.

Libellés français exigés :
- **LECTURE SEULE · AUCUN ORDRE**
- **Prix moyen d’achat**
- **Montant total investi**
- **Gain / perte actuel**
- **Exécutions**

Ne pas réintroduire `PRU`, `P&L`, `fills` ou `READ ONLY` dans l’interface française.

## Dernière correction importante

Une erreur de syntaxe dans le bloc Position BTC avait empêché le chargement complet du panneau. Elle a été corrigée dans :
- `0ba0b81c4ed570fa88e36a62a4ac15aa80dc918e`
- rafraîchissement asset : `aaa2c8693232cfd3a7c1ea5c8a03c46ca35d5f15`

Contrôle :
- syntaxe JavaScript : OK ;
- workflow **Agent-Crypto Trader Current** sur `aaa2c86` : **SUCCESS** ;
- workflow **Agent Crypto Trader Verified Archive R9** sur `aaa2c86` : **SUCCESS** ;
- le déploiement GitHub Pages le plus récent descendant de cette correction a terminé **SUCCESS**.

## Prochaine étape réelle

Ne pas fabriquer de chiffres.

Le solde BTC est connu, mais l’historique d’acquisition n’est pas encore prouvé. Les 3 mois actuels donnent 0 ordre / 0 exécution, donc le coût d’achat ne peut pas être déduit de cette seule fenêtre.

Prochaine opération :
1. étendre le Bridge READ aux historiques financiers / mouvements OKX disponibles au-delà des 3 mois actuels ;
2. qualifier l’origine du BTC détenu : achat, transfert, conversion ou autre mouvement ;
3. reconstruire uniquement à partir de données prouvées :
   - prix moyen d’achat ;
   - montant total investi ;
   - frais réellement payés ;
   - valeur actuelle ;
   - gain / perte actuel ;
4. si l’historique OKX reste insuffisant, afficher explicitement **NON PROUVÉ** au lieu d’estimer.

## Interdits pour la reprise

- aucun Trade réel tant que le bloc READ n’est pas complet et vérifié ;
- aucune permission Withdraw ;
- aucun secret dans le chat ou GitHub ;
- aucun nouveau propriétaire de Graphique/Market ;
- aucune refonte CSS globale ;
- aucune substitution silencieuse USD / USDC / USDT ;
- aucune modification du Coffre pendant que l’autre chantier historique travaille dessus.
