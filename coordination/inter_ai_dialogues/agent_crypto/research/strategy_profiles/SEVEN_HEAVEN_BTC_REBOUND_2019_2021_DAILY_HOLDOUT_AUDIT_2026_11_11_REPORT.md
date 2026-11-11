# Seven Heaven — Rebonds Bitcoin : extension quotidienne 2019–2021 et contrôle 2021

**11 novembre 2026 · Étude PAPER, aucune transaction réelle.**
**Statut : protocole pré-publié avant lecture des événements, commit `2bd4c0d`; source de données quotidienne SHA-256 vérifiée, code et événements publiés sur `main`.**

## Question de recherche

Enrichir la recherche précédente sur les « trois clôtures », les creux ascendants, les volumes et EMA sans ajouter de réglages après lecture des résultats. **2019–2020** servent à l'extension descriptive ; **2021** constitue l'année de contrôle séparée avec exactement les mêmes paramètres.

## Source auditée

- [Référence du Coffre — index quotidien BTC/USDT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_daily_reference/index.json) ; données [`bitcoin-Max.json.gz`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz).
- Source Binance Spot BTC/USDT : 3 075 clôtures **quotidiennes UTC** entre le 1er mai 2018 et le 30 septembre 2026 ; utilisation de **1 096 journées 2019–2021** sans interruption.
- **Empreinte gzip SHA-256 vérifiée sur les octets décodés :** `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`. Le code reproductible vérifie la même empreinte avant analyse.
- La série a été **réconciliée** : 26 journées de l'archive complète proviennent de chandeliers officiels natifs 1d ; le reste a été reconstruit depuis le 1m. Les 5 881 minutes originales manquantes restent explicitement non réparées. **Ne pas qualifier cette étude de replay natif 1m** ; il s'agit d'un exercice sur données 1d.

## Hypothèses et comparateurs figés

- Début de chaque année : 30 jours de préparation ; épisode J0 quand la clôture devient montante alors que la précédente est au moins 2,5 % sous le maximum des 30 clôtures antérieures ; **espacement minimal : 11 jours**.
- C1 = première clôture montante, achat fictif J+1 ; C3 = trois clôtures montantes J0/J+1/J+2, achat fictif J+3 si confirmé.
- LOW3 = plus bas quotidiens strictement montants ; VOL = volume de base BTC J+2 ≥ moyenne des 20 journées terminées antérieures ; EMA = EMA10 > EMA30 et clôture > EMA30 sur J+2.
- Tous les candidats, y compris rejetés, sont marqués sur le même **horizon de J+3 ouverture à J+10 clôture** ; coûts théoriques 0,10 % de frais + 0,05 % de glissement à l'achat **et** à la vente ; stress ×2.
- Les derniers événements dont J+10 sort de l'année sont **censurés**. Un retour moyen par épisode n'est **pas** un profit de portefeuille cumulable.

## Résultats principaux

| Année | Candidats | Évaluables | Confirmations C3 | C3 positifs | Rendement C3 moyen isolé, net | Déplacement médian d'entrée C1→C3 |
|---|---:|---:|---:|---:|---:|---:|
| 2019 | 25 | 24 | 4 | 3/4 | +7.79 % | +5.42 % |
| 2020 | 24 | 23 | 5 | 3/5 | +3.26 % | +2.49 % |
| 2021 (contrôle) | 27 | 26 | 9 | 5/9 | +2.91 % | +9.08 % |

**Total : 76 candidats, 73 évaluables, 3 censurés ; 18 confirmations C3, dont 11 avec rendement net positif.** Ce nombre représente des événements individuels, **pas** 18 positions d'un portefeuille continu. Dans l'étude antérieure sur les fenêtres 2022–2026, C3 n'avait que 10 confirmations sur 40 événements évaluables ; les sources et la couverture temporelle diffèrent.

### Filtres additionnels *au sein* des événements C3

Chaque case est le nombre d'épisodes dont le rendement J+3→J+10 est positif / nombre total du sous-groupe.

| Année | C3 seul | C3 + creux ascendants | C3 + volume élevé | C3 + EMA | C3 + tous |
|---|---:|---:|---:|---:|---:|
| 2019 | 3/4 | 2/3 | 0/1 | 1/1 | 0 cas |
| 2020 | 3/5 | 3/5 | 2/4 | 3/5 | 2/4 |
| 2021 | 5/9 | 3/3 | 3/5 | 5/8 | 1/1 |

En **2021**, les creux ascendants sont associés à **3 cas positifs sur 3**, contre **2 sur 6** lorsque les trois creux ne sont pas ascendants. C'est une hypothèse intéressante, **pas une performance prouvée** : trois observations suffisent rarement à distinguer le hasard, et la population C3 est sélectionnée.

Pour le volume élevé en 2021, on observe **3 cas positifs sur 5**, contre **2 sur 4** sans volume élevé. Cette différence est trop faible pour soutenir une « confirmation par les volumes ». Le filtre complet n'a qu'**un cas sur l'année**.

### Détection et manque d'occasions

| Année | Candidats C3 refusés mais C1 positif | C3 refusés et C1 non positif | Ancienne définition ≥5 % / 21 jours |
|---|---:|---:|---:|
| 2019 | 8 | 12 | 13 |
| 2020 | 8 | 10 | 10 |
| 2021 | 4 | 13 | 14 |

L'attente de trois clôtures écarte plusieurs entrées qui auraient perdu, mais aussi des entrées qui auraient été positives. Les labels sont rétrospectifs ; aucun signal ne voit le résultat futur.

## Contrôles d'intégrité

- **SHA-256 de la source vérifié :** exact ; schéma / colonnes source identifiés.
- **3 075 journées continues** (registre complet), **365 + 366 + 365 journées** dans les trois années contrôlées.
- Chronologie UTC sans trou au niveau 1d ; signaux candidats préfixes/série complète concordants, coûts reproduits par recalcul.
- **173 contrôles** de causalité, chronologie et équations par événement.
- Le fichier source n'a pas été dupliqué dans le dossier de recherche ; il est référencé depuis l'archive publique canonique.

## Lecture critique pour les autres IA

- Les événements de trois clôtures ne prouvent **aucune probabilité de hausse ou de baisse**. Les effectifs 2021 restent petits ; n'utiliser ni pourcentage illustratif 40/35/25 ni terme « taux de réussite » sans exposer la méthode de calcul.
- 2021 est un contrôle temporel prédésigné dans cette extension ; les indicateurs avaient déjà été explorés sur d'autres années, donc **pas une certification prospective**. Ne pas modifier les seuils en fonction de 2021.
- Les volumes décrivent **Binance Spot BTC/USDT**, pas le carnet OKX BTC/USDC ni le marché mondial. Les prix J+3 sont des remplissages fictifs. Aucune latence, spread instantané, fiscalité ni taille minimale n'est simulée.
- Les C1 et C3 ne portent pas sur une même durée d'exposition mais partagent l'échéance J+10 ; une performance moyenne ne s'ajoute pas à un solde d'investisseur.

## Livrables reproductibles

- [Protocole figé](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_OUT_OF_SAMPLE_PROTOCOL_2026_11_11.md), commit `2bd4c0d`.
- [Programme Python autonome](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11.py) : `python SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11.py --daily-gzip bitcoin-Max.json.gz --output-dir resultats`, avec Python 3 et bibliothèque standard seulement.
- [Preuves JSON](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_PROOFS.json) et [événements individuels CSV](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_EVENTS.csv).
- Référence historique des règles sur 22 ZIP minute, déjà publiée : [recherche élargie 2022–2026](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_REPORT.md).

**Verdict :** la série 2019–2021 augmente considérablement l'historique disponible, sans démontrer qu'une troisième clôture ou un volume élevé prédisent la poursuite d'un rebond. Les creux ascendants méritent un nouvel essai, sans optimisation rétrospective. **PAPER uniquement, interfaces et Bridge inchangés.**
