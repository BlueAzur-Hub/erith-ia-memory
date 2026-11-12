# Seven Heaven — BTC/ETH Spot USDC : 96 quarts d’heure, 15 août et 15 septembre 2026

**Protocole figé le 12 novembre 2026, avant le nouveau replay dense des quatre archives.** Il reprend sans modification les règles de l'étude 96 états du 15 octobre 2026, dont les deux rapports et preuves sont déjà publiés dans ce répertoire.

## Sources et journées fixées

Quatre fichiers seulement, tous déjà intégralement identifiés et contrôlés lors de l'étude des quatre heures : **15 août 2026 BTC-USDC et ETH-USDC ; 15 septembre 2026 BTC-USDC et ETH-USDC**. Pas de substitution d'instrument/date, de réoptimisation ni de sélection du jour au vu des spreads. Chaque fichier sera retéléchargé via son URI OKX CDN `static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/YYYYMMDD/PAIR-L2orderbook-400lv-YYYY-MM-DD.tar.gz`, et comparé aux SHA-256 intégraux **déjà enregistrés**.

| UTC | Instrument | Archive entière SHA-256 | .data SHA-256 | .data octets |
|---|---|---|---|---:|
| 2026-08-15 | BTC-USDC | `a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130` | `c7836a3f16229b1b211230ef4b40f46a3e25067196dee9193df0642c734e0050` | 57596807 |
| 2026-08-15 | ETH-USDC | `9da303d949bce4f25248f7d3f6b7e34e2be6ed426b4945a395c3097d7932bfca` | `403a2c22a53730a15a3deb826fd1df1a90e13c1486f60c5b0d84a69ffed5b870` | 59989509 |
| 2026-09-15 | BTC-USDC | `53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460` | `4a1b0c645c7c672c94f3a8e58c885def6441d34b9d8e7f6006f5d05f0e8e66ac` | 491977909 |
| 2026-09-15 | ETH-USDC | `694464feb71a39dccff0188087079f3d200b50e51efc4a4120b454e4a9213924` | `5e558436c384f8e8d6d9e21d29f3b322501072e642dfa276ce95d082bb4b6178` | 408853414 |

Les quatre **preuves à quatre horaires déjà publiées** servent d'étalon immuable pour le SHA-256 de la source, les **20 premiers hashes de lignes JSON** et les relevés 00/06/12/18 UTC : même timestamp, numéro de message, prix, spread et coûts de carnet. Leurs Git blob SHA-1 sont conservés comme ancres : août BTC `7e78002061c8ecf01ef178e0ee90920480b665ce`, août ETH `65bd1adfbd7a4a1098b7392cfcc49f6b2059bbc8`, septembre BTC `214d213c6085e44636c4e34f2b46596cd4c73fea`, septembre ETH `37f18a89b92b36e418775b4fd1e4fe19c90d7486`.

## Grille et mesures, sans nouvelle optimisation

- **96 heures fixes** par instrument et par date : 00:00, 00:15, 00:30, …, 23:45 UTC. Le premier état reconstruit à ou après l'heure cible est retenu seulement si son décalage est `<=60 000 ms`. Sinon `missing_anchor`, pas d'interpolation ni remplacement.
- Rejouer les snapshots et mises à jour JSON en temps non décroissant, `size=0` supprimant le niveau. Refuser état vide/croisé, prix ou tailles non valides, ligne JSON incomplète, instrument erroné ou delta avant snapshot.
- Collecter **tous les horodatages des événements `snapshot`** et confronter leur numérotation et leur décalage à la grille de 96 horaires ; ne PAS supposer sans mesure qu'une snapshot survient chaque quart d'heure.
- À chaque état valide : bid/ask, spread bp `(ask-bid)/mid*10 000`, profondeur et coûts de prix théoriques VWAP vs mid **sans frais** pour les cinq montants de **10, 100, 1 000, 10 000, 100 000 USDC**, deux côtés achat/vente.
- Calculer p10/p50/p90 (percentile empirique type 7), min/max, moyenne et effectifs **sur les valeurs disponibles uniquement**. Garder visible toute cellule manquante ; si les quatre points historiques ne correspondent pas, **invalider la journée**, et ne pas publier de « 96 points validés ».
- **Bornes par archive : maximum 230 Mo compressés et 1,4 Go décompressés**, gzip CRC intégral + SHA-256 des octets complets et du membre `.data`, sans extraire ni committer l'archive volumineuse.

## Comparaison conditionnelle avec octobre

La référence du 15 octobre demeure inchangée : [BTC et ETH, 96 états, 192 snapshots, 1 920 coûts](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_INTRADAY_SPREAD_AND_DEPTH_SCIENTIFIC_REPORT_2026_11_12.md). Si et seulement si les quatre nouvelles preuves passent, comparer **3 jours × 2 actifs × 96 états = 576 états**, soit **2 880 couples de coûts par montant/côté au total** (576 × 5), ou **5 760 coûts individuels** (576 × 5 × 2). Les **288 couples de spreads BTC/ETH** doivent être appariés par date et heure ; ne jamais fusionner des dates différentes par erreur.

Pour chaque actif et chaque journée : 96 spreads. Pour chaque actif sur les trois dates : **288 points**. Sur les 288 paires entre actifs : proportion d'ETH plus large, distributions empiriques p10/p50/p90, extrêmes. **Trois journées calendaires restent insuffisantes pour une estimation représentative du marché** ; aucune causalité de crise ou d'annonce, aucun rendement EMA déduit.

## Discipline d'archive et d'arrêt

Publier le code, les résultats compacts JSON/CSV, les comptages de snapshots, le contrôle des quatre ancres, les SHA, la preuve de calcul indépendant et le rapport dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`, avec la passation inter-IA actualisée. Source complète externe à GitHub. Aucune surveillance périodique, aucun compte, aucun ordre, aucun changement Trader / Administrator / Operator / Bridge. SHA/CRC contrôlent les octets reçus mais **pas** les éventuels événements manquants en amont, faute de chaîne `seqId/prevSeqId`.
