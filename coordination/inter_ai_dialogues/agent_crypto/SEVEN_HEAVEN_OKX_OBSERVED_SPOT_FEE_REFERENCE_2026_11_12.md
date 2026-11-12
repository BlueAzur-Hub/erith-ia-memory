# Seven Heaven — OKX Spot fee reference observed on 2026-11-12

**Statut :** **fiche de renvoi secondaire vers le référentiel canonique déjà présent** dans [Notion AETHER · AGENT-INTERFACE — OKX MEMORY CORE → 01 · Trading Fees](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). Cette note GitHub ne prétend pas créer une mémoire nouvelle. **Ne pas traiter comme tarif universel, historique ou garanti.**

**Dates de relevé :** **6 novembre 2026** (déjà documenté dans le Notion), **9 novembre 2026** (deuxième capture documentée dans le Notion), **12 novembre 2026** (troisième capture dans le présent fil ; heure précise non certifiée).  
**Source canonique préexistante :** [OKX MEMORY CORE → 01 · Trading Fees dans Notion](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). Source visuelle complémentaire : capture et texte de la page OKX `Actifs > Frais > Mon niveau de frais` du 12 novembre 2026 ; URL de navigation : https://my.okx.com/fr-fr/balance/fee.  
**Confidentialité :** cette note publique contient uniquement les **taux Spot nécessaires au laboratoire**. Elle ne reproduit ni capture d'écran, ni identifiant OKX, ni solde, ni volume d'opérations, ni informations de portefeuille. La source originale reste dans la conversation.

## Frais Spot affichés — compte consulté

- **Niveau affiché :** Utilisateur régulier.
- **Maker Spot : 0,0800 %** = **8 points de base (bp)** par côté.
- **Taker Spot : 0,1000 %** = **10 points de base (bp)** par côté.
- La page inclut des catégories spécifiques telles que **Groupe 1** et **Paires sans frais**. Les taux ci-dessus sont la référence générale affichée : **le tarif applicable à une paire exacte (p. ex. BTC-USDC ou ETH-USDC) doit être confirmé dans OKX avant une opération ou un paramétrage de production.**

Les captures des **6, 9 et 12 novembre 2026** attestent un **affichage répété des mêmes taux**, sans prouver depuis quand ils sont applicables, ni le tarif d'exécution historique, ni le coût exact d'une paire ou d'un ordre particulier. **La troisième capture n'aurait pas dû être redemandée : le Notion indiquait explicitement « NE PAS REDÉMANDER ».**

## Usage autorisé dans les études PAPER

1. Paramètre **scénario taker/taker au taux affiché** : 0,10 % + 0,10 % = **0,20 %**, soit **20 bp** de commissions pour deux côtés fictifs, *avant coût carnet et variations du prix*.
2. Paramètre **scénario maker/maker au taux affiché** : 0,08 % + 0,08 % = **0,16 %**, soit **16 bp** de commissions pour deux côtés, **sans garantie de remplissage** ; un modèle maker ne peut pas être déduit d'un carnet consommé en mode taker.
3. Pour un scénario maker/taker, 0,08 % + 0,10 % = **0,18 %** (18 bp).
4. Conserver ces paramètres comme **observés**, dater chaque recalcul et éviter de les appliquer rétroactivement aux replays d'août/septembre/octobre 2026.
5. **Ne jamais additionner le spread deux fois** : le coût VWAP depuis le prix médian inclut déjà spread + impact de profondeur.
6. Séparer les coûts OKX Spot **USDC** des études de stratégies sur d'autres plateformes/devises (par exemple Bitstamp **USD**).
7. Cette référence ne constitue ni une autorisation de trader, ni une information d'accès à un compte, ni une commande à transmettre au Bridge.

## Références de recherche

- [**Priorité absolue : Notion canonique OKX MEMORY CORE → 01 · Trading Fees**](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) — versions déjà vérifiées les 6 et 9 novembre, puis troisième confirmation du 12 novembre.
- [Rapport Seven Heaven : spread, profondeur et frais](./SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md).
- [Passation de la session de recherche](./SEVEN_HEAVEN_AGENT_CRYPTO_RESEARCH_SESSION_HANDOFF_2026_11_12.md).

## Reprise pour les autres IA

**À retenir :** les taux Spot **personnellement affichés et déjà connus depuis les captures des 6 et 9 novembre**, confirmés une troisième fois le 12/11/2026, sont **maker 0,0800 %, taker 0,1000 %**, et non les barèmes EEE génériques utilisés à tort dans la première version de notre rapport. **Il n'est pas démontré que le compte ait changé de tarification le 25 septembre.** Recontrôler seulement lorsque des faits nouveaux (niveau du compte, tarification particulière d'une paire, facturation d'une transaction) le requièrent.

**NE PAS REDÉMANDER.** En nouvelle session, lire **d'abord le référentiel canonique Notion**, puis ce renvoi GitHub et le rapport scientifique corrigé. Une capture n'est nécessaire que pour une question réellement nouvelle. **Ne pas multiplier les fiches Notion sur les mêmes frais.** Aucune modification de paramètres réels, du Trader, du Bridge ou des ordres.
