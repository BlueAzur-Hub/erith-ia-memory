# Seven Heaven — Durabilité des signaux et coût local du délai de confirmation BTC

**11 novembre 2026 — recherche explicative rétrospective, uniquement PAPER.**

## Question et provenance

- 22 ZIP natifs Binance Spot BTC/USDT 1 minute vérifiés SHA-256 ; **960 480 bougies**.
- Fenêtres 2022 mai–juin, 2023 mai–juin, 2024 février–mars, 2025 février–mars, 2026 février–octobre.
- EMA10/30, SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX, paramètres déjà publiés.
- **Toutes ces fenêtres ont déjà été explorées : il ne s’agit PAS d’un test inédit de performance.**
- Étude événementielle des bascules brutes de signal, et non simulation de nouveaux ordres ; une bascule n’implique pas que le portefeuille soit positionné pour négocier.
- C1 : agir fictivement à ouverture de D+1 après clôture D. C3 : attendre 3 clôtures concordantes, puis ouverture D+3.
- Une bascule brute durant moins de 3 jours ne satisfait pas C3. Ceci ne prouve pas qu’elle soit fausse.
- Étiquetage J+7 : cours de clôture du **septième jour suivant l’ouverture C1**, comparé à cette ouverture ; hausse favorable à entrée, baisse favorable à sortie. Seuil ±3 %, constat ex post non utilisable pour décider.
- Prix C1→C3 : pour achat, hausse = délai défavorable ; pour vente, baisse = délai défavorable. Ce différentiel local NE constitue PAS un P&L de portefeuille.

## Table des transitions brutes (événements, et non transactions)

| Période | EMA : transitions / courtes | SuperTrend : transitions / courtes | Consensus : transitions / courtes |
|---|---:|---:|---:|
| 2022 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2023 | 4 / 1 | 1 / 0 | 4 / 0 |
| 2024 | 3 / 1 | 2 / 0 | 3 / 0 |
| 2025 | 3 / 2 | 3 / 0 | 0 / 0 |
| 2026 | 24 / 9 | 4 / 0 | 18 / 5 |

## Contrôle des pertes de temps C3 lorsque les trois clôtures existent

| Famille | Transitions | Durée <3 j | Transitions C3 admissibles | C3 prix local adverse médian | C3 adverse / favorable |
|---|---:|---:|---:|---:|---:|
| EMA | 34 | 13 | 21 | +1.447 % | 17 / 4 |
| SUPERTREND | 10 | 0 | 9 | -2.189 % | 4 / 5 |
| CONSENSUS | 25 | 5 | 20 | +1.307 % | 14 / 6 |

## Short runs : rappel du risque de filtrer un vrai départ

| Famille | Runs <3j | Suivis de mouvement favorable ≥3 % à J+7 | Défavorable ≥3 % | Neutres | Censurés |
|---|---:|---:|---:|---:|---:|
| EMA | 13 | 1 | 4 | 8 | 0 |
| SUPERTREND | 0 | 0 | 0 | 0 | 0 |
| CONSENSUS | 5 | 0 | 2 | 3 | 0 |

## Interprétation / garde-fous

- La confirmation C3 supprime mécaniquement les épisodes bruts qui durent un ou deux jours. Il faut regarder le mouvement du BTC **après** ces épisodes avant de les qualifier de « faux ».
- Le prix à J+7, la durée totale de l’épisode et les classes favorable/défavorable sont des **informations futures uniquement utilisées pour l’audit**, jamais des entrées d’un signal.
- Les trois familles observent le même BTC aux mêmes dates et les événements se recouvrent : les comptes ne constituent PAS des essais indépendants ni une signification statistique.
- L’étude ne chiffre pas le rendement d’une stratégie nouvelle : les performances complètes E1/S1, E3/S1 et E1/S3 sont documentées dans le précédent audit asymétrique.
- À défaut de nouvelles périodes avec retournements, une règle C2/C3 ne peut être déclarée supérieure et ne doit pas être déployée.
- Le contrôle négatif 2022 est inclus. Les indicateurs peuvent connaître des bascules brutes sans que les règles figées n’exécutent de transaction.

## Publication et reproduction inter-IA

- Code : `SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11.py`, lance depuis le dossier avec les 22 ZIP originaux et les scripts historiques Python publiés.
- Journal exhaustif : `SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_TRANSITION_EVENTS.csv`.
- Preuves et SHA : `SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json`.
- Les ZIP ne sont pas recopiés dans Git main ; leurs empreintes figurent dans les preuves.
- Aucune modification des programmes Administrator, Operator, Trader et Bridge. Aucun ordre réel.
