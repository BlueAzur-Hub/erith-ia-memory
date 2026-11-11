# Seven Heaven — « Règle des 3 jours » : bougies quotidiennes, structure, volumes et coût du retard

**11 novembre 2026 · recherche rétrospective PAPER, sans ordres ni changements de production.**

## Ce que les images montrent — et ne prouvent pas

- Les visuels fournis illustrent l’observation de **trois clôtures quotidiennes**, les **creux et sommets**, les **EMA** et les **volumes**. Les images de synthèse sont datées du **7 novembre 2026** tandis que la capture de l’Administrator est du **11 novembre 2026** : ne pas mélanger les cours ou niveaux.
- Les scénarios « reprise 40 % / consolidation 35 % / baisse 25 % » de l’infographie ne sont pas des probabilités statistiquement mesurées. **Nous ne les conservons pas comme probabilités.**
- La vue Administrator affichée est en **15 minutes**, elle ne valide aucune règle fondée sur trois clôtures **journalières**. L’horodatage et le cache doivent également être examinés avant tout diagnostic actuel.

## Protocole figé avant les calculs

- **[Protocole](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_PROTOCOL.md)** publié au commit `42c4be6` avant ce calcul.
- 22 ZIP BTCUSDT Binance Spot 1m, **960,480 minutes** et **667 bougies UTC** ; chaque ZIP a son empreinte SHA-256 vérifiée.
- Candidature : un premier jour haussier après un repli ≥5 % sous le maximum des clôtures des 30 jours précédents. Une nouvelle candidature n’est pas retenue avant 22 jours (21 jours bloqués).
- C1 : une clôture haussière → achat fictif ouverture J+1. C3 : trois clôtures haussières consécutives → achat fictif ouverture J+3 ; sinon rester en USDT. Vente fictive commune à la clôture J+10.
- Étages descriptifs à J+2 : creux haussiers, volume base BTC ≥ moyenne des 20 jours précédents, EMA10>EMA30 et clôture>EMA30.
- Coûts fictifs : 0,10 % de frais + 0,05 % de glissement par côté ; doublement en stress. Chaque épisode reprend fictivement 1 000 USDT pour isoler un effet ; **ce ne sont pas des rendements de portefeuille continu**.
- Étiquettes J+3→J+10 ex post : hausse ≥3 %, baisse ≤−3 %, autre consolidation. Informations futures jamais utilisées pour décider.

## Résultats par période

| Période | Reprises évaluées | Confirmations C3 | C1 moyenne par épisode | C3-ou-cash moyenne | Rejets C3 : gagnants C1 / perdants C1 |
|---|---:|---:|---:|---:|---:|
| 2022 | 3 | 0 | -9.946 % | +0.000 % | 0 / 3 |
| 2023 | 3 | 1 | +3.281 % | +0.223 % | 1 / 1 |
| 2024 | 2 | 1 | +5.153 % | -2.216 % | 1 / 0 |
| 2025 | 2 | 0 | -4.961 % | +0.000 % | 0 / 2 |
| 2026 | 10 | 2 | -1.441 % | -0.484 % | 2 / 6 |

## Synthèse et coûts du filtrage

- Reprises détectées 22, dont **20 évaluables** et 2 censurées.
- C3 confirme **4/20** événements ; en rejette 16. Parmi ceux rejetés : **4** épisodes où l’achat C1 aurait gagné, **12** où il aurait perdu (hors coûts futurs d’autres événements).
- Prix d’entrée retardé de C1 à C3 (événements confirmés) : décalage médian **1.5709 %** ; comparer un coût d’entrée, pas l’alpha de portefeuille.

| Filtre d’entrée à J+3 | Confirmations parmi épisodes | Rendement moyen isolé sur TOUS les épisodes (cash = 0 %) | Moyenne si coûts ×2 |
|---|---:|---:|---:|
| 3 clôtures | 4/20 | -0.430 % | -0.489 % |
| 3 clôtures + creux ascendants | 3/20 | -0.464 % | -0.507 % |
| 3 clôtures + volume | 1/20 | -0.222 % | -0.236 % |
| 3 clôtures + creux + volume + EMA | 1/20 | -0.222 % | -0.236 % |

## Classification rétrospective du marché à J+10

Ces trois classes sont observées **après coup**, depuis l’ouverture de J+3 jusqu’à la clôture de J+10. Ne pas les afficher comme une prévision ni les additionner aux probabilités inventées des visuels.

| Issue observée | Nombre / reprises évaluées | Fréquence observée | Intervalle Wilson 95 % descriptif |
|---|---:|---:|---:|
| BTC +3 % ou plus | 5/20 | 25.00 % | 11.19–46.87 % |
| BTC −3 % ou moins | 5/20 | 25.00 % | 11.19–46.87 % |
| Entre −3 % et +3 % | 10/20 | 50.00 % | 29.93–70.07 % |

## Contrôle baissier et limites

- Après une hausse préalable de ≥5 %, **23** journées de premier repli observées, dont 20 évaluables et 6 séquences de trois baisses confirmées.
- Les périodes **ont déjà été utilisées** pour d’autres recherches : aucune validation indépendante, aucune calibration de probabilité future, aucune stratégie gagnante démontrée.
- Événements espacés par une règle de blocage de 21 jours, non indépendants économiquement entre fenêtres de marché ; effectifs parfois faibles. Les intervalles Wilson descriptifs supposent des observations indépendantes et sont donc indicatifs, potentiellement trop étroits.
- Le prix d’achat hypothétique à une ouverture ne garantit aucune exécution sur OKX, et Binance BTCUSDT diffère de BTC/USDC OKX. Volumes Binance Spot seulement, pas volumes globaux.
- Les écarts C1/C3 reflètent aussi **deux jours d’exposition différents**. Comparer sur le même J+10 permet un prix de sortie commun, pas une expérience causalement randomisée.

## Passation inter-IA et reproductibilité

- Code : `SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11.py` — exécuter `python SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11.py --zip-dir <dossier-des-22-ZIP-et-manifeste>`.
- Preuves : `SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_PROOFS.json` — SHA-256 de chaque mois, code SHA, protocole, métriques et contrôles.
- Événements : `SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_EVENTS.csv` ; caractéristiques quotidiennes : `SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_DAILY_FEATURES.csv`.
- Contrôles causaux, arithmétiques et d’horizon : **224** assertions auditées.
- Registre SHA requis : `SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json` dans le dossier des ZIP. Ne pas publier les ZIP dans Git main, ils restent dans Releases.
- Périmètre : recherche PAPER, sans accès compte, sans ordre, sans écriture dans Administrator, Operator, Trader ou Bridge.

**Verdict :** trois bougies quotidiennes constituent une observation **vérifiable**, mais le filtre n’est pas une prédiction. Mesurer les hausses manquées et les baisses évitées sur un autre historique préalablement réservé sera nécessaire avant toute idée d’intégration.
