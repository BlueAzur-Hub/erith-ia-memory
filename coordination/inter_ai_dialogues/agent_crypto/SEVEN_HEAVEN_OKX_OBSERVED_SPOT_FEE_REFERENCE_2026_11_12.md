# Seven Heaven — OKX Spot fee reference observed on 2026-11-12

**Statut :** référence documentaire d'un écran de frais OKX authentifié, transmise volontairement pour le travail Agent-Crypto. **Ne pas traiter comme tarif universel, historique ou garanti.**

**Date de relevé :** 12 novembre 2026 (France / Europe-Paris ; heure précise non certifiée).  
**Source :** capture et texte de la page OKX `Actifs > Frais > Mon niveau de frais` fournis par l'opérateur dans la conversation du 12 novembre 2026 ; URL de navigation : https://my.okx.com/fr-fr/balance/fee.  
**Confidentialité :** cette note publique contient uniquement les **taux Spot nécessaires au laboratoire**. Elle ne reproduit ni capture d'écran, ni identifiant OKX, ni solde, ni volume d'opérations, ni informations de portefeuille. La source originale reste dans la conversation.

## Frais Spot affichés — compte consulté

- **Niveau affiché :** Utilisateur régulier.
- **Maker Spot : 0,0800 %** = **8 points de base (bp)** par côté.
- **Taker Spot : 0,1000 %** = **10 points de base (bp)** par côté.
- La page inclut des catégories spécifiques telles que **Groupe 1** et **Paires sans frais**. Les taux ci-dessus sont la référence générale affichée : **le tarif applicable à une paire exacte (p. ex. BTC-USDC ou ETH-USDC) doit être confirmé dans OKX avant une opération ou un paramétrage de production.**

La capture est une **preuve d'affichage personnel au 12 novembre 2026** ; elle ne prouve ni depuis quand ces taux sont applicables, ni le tarif d'exécution d'une transaction historique, ni le coût exact d'un ordre particulier.

## Usage autorisé dans les études PAPER

1. Paramètre **scénario taker/taker au taux affiché** : 0,10 % + 0,10 % = **0,20 %**, soit **20 bp** de commissions pour deux côtés fictifs, *avant coût carnet et variations du prix*.
2. Paramètre **scénario maker/maker au taux affiché** : 0,08 % + 0,08 % = **0,16 %**, soit **16 bp** de commissions pour deux côtés, **sans garantie de remplissage** ; un modèle maker ne peut pas être déduit d'un carnet consommé en mode taker.
3. Pour un scénario maker/taker, 0,08 % + 0,10 % = **0,18 %** (18 bp).
4. Conserver ces paramètres comme **observés**, dater chaque recalcul et éviter de les appliquer rétroactivement aux replays d'août/septembre/octobre 2026.
5. **Ne jamais additionner le spread deux fois** : le coût VWAP depuis le prix médian inclut déjà spread + impact de profondeur.
6. Séparer les coûts OKX Spot **USDC** des études de stratégies sur d'autres plateformes/devises (par exemple Bitstamp **USD**).
7. Cette référence ne constitue ni une autorisation de trader, ni une information d'accès à un compte, ni une commande à transmettre au Bridge.

## Références de recherche

- [Rapport Seven Heaven : spread, profondeur et frais](./SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md).
- [Passation de la session de recherche](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_SESSION_HANDOFF_2026_11_12.md).

## Reprise pour les autres IA

**À retenir :** les taux Spot **personnellement affichés** le 12/11/2026 sont **maker 0,0800 %, taker 0,1000 %**, et non les barèmes EEE génériques supposés antérieurement dans certains rapports. Ils doivent être **reconfirmés si la date, le niveau du compte ou le groupe de la paire change**.

**Ne pas demander à l'utilisateur de redonner ces taux à chaque nouveau fil.** Commencer par ce document partagé pour les hypothèses de calcul et demander une nouvelle capture seulement si une vérification de fraîcheur est réellement nécessaire. Aucune modification de paramètres réels, du Trader, du Bridge ou des ordres.
