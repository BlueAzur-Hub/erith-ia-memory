# Seven Heaven — Audit de continuité native BTCUSDT / ETHUSDT, Spot Binance 1m, 27–28 octobre 2026

**Audit documentaire et rapprochement des index réalisé le 9 novembre 2026. Vérification des bougies natives : BLOQUÉE par l'accès réseau.** Aucune certification PAPER ni modification d'Administrator, Trader ou Bridge R31.

## 1. Périmètre exact

- **Binance Spot** : `BTCUSDT` et `ETHUSDT`, devise de cotation **USDT**, bougies **1 minute natives** ; ne pas confondre avec les carnets **OKX USDC** étudiés [dans le rapport Top 4](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_ETH_SOL_XRP_SPOT_BOOK5_SIZE_COST_COMPARISON_2026_11_09.md).
- Fenêtre UTC : **27/10/2026 00:00:00 inclus → 29/10/2026 00:00:00 exclu**, soit **2 880 minutes par paire** et **5 760 lignes attendues** au total.
- Depuis janvier 2025, les données **Spot** de [Binance Public Data](https://github.com/binance/binance-public-data/blob/master/README.md) encodent les dates en **microsecondes**. Frontières attendues : `1793059200000000` et `1793232000000000` microsecondes UTC.
- Le résultat structuré, avec les empreintes Git des index et les quatre URLs source, est conservé dans le [registre JSON](../data/crypto/research/seven_heaven_btc_eth_spot_native_1m_2026_10_27_28_source_continuity_audit_2026_11_09.json).

## 2. Contrôle croisé déjà réellement effectué : index, mois et quotas

| Contrôle vérifié sur les métadonnées publiques | BTCUSDT | ETHUSDT |
|---|---:|---:|
| Entrée d'actif dans les deux index | Oui | Oui |
| Mois indexés | **85** | **85** |
| Minutes **déclarées** dans chacun des deux index | **3 731 040** | **3 731 040** |
| Somme calculée des minutes calendaires des mois listés | **3 731 040** | **3 731 040** |
| Entrées de mois dupliquées | **0** | **0** |
| Mois `2026-10` présent | Oui | Oui |
| Plus longue succession de mois indexés | **43**, avril 2023 à octobre 2026 | **43**, avril 2023 à octobre 2026 |
| ZIP du 27–28/10 téléchargés et SHA-256 contrôlés **dans cet audit** | **Non** | **Non** |
| Absence de trous / doublons parmi les 2 880 minutes **dans cet audit** | **Inconnue** | **Inconnue** |

**Sources Git précises :** `year_depth_index.json`, blob `f97dc90291ec67661ff2b263de1de78a56f8a100` ; `top250_multisource_coverage/index.json`, blob `71b25904a652fbd8cdea1ac6bb942c9789e930c3`. Les 85 mois énumérés n'ont aucun doublon dans chaque actif, et leur total calendaire égale les deux compteurs. Ce contrôle **n'a pas lu les 5 760 lignes originales** et n'atteste donc pas de la continuité réelle.

## 3. Réconciliation avec les anciens audits

- L'[audit ETH des mois incomplets](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_gap_audit/index.json) (blob `f4f159ff099683b3a70a0090d5fe34fb65d55880`) relève **270 minutes absentes en août 2021, 120 en septembre 2021 et 80 en mars 2023**, soit **470 minutes dans ces trois mois ciblés**. Ces trois mois ne figurent **pas** dans la liste des 85 mois strictement complets ; **aucune contradiction** avec le compteur du catalogue. Ils ne prouvent rien concernant octobre 2026.
- Le [registre BTC de 24 mois de sources avec trous](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_verified_gap_months/index.json) (blob `fc1e572e3a552976955f115e37438b619170e56c`) n'inclut pas octobre 2026. Il est distinct du catalogue strict des mois complets.
- La [référence journalière BTC figée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_daily_reference/index.json) (blob `cbfa67a5d14ff56146e12fa5d83f0672cee802a6`) s'arrête au **30 septembre 2026**, donc **ne permet pas de certifier les deux journées d'octobre**. Une série 1D continue n'atteste pas de 1 440 bougies 1m complètes par jour.

## 4. Accès à la source originale : blocage identifié, pas faux PASS

Les quatre sources nécessaires sont les ZIP quotidiens Binance Spot : `BTCUSDT-1m-2026-10-27.zip`, `BTCUSDT-1m-2026-10-28.zip`, `ETHUSDT-1m-2026-10-27.zip` et `ETHUSDT-1m-2026-10-28.zip`, chacun avec son fichier homonyme `.CHECKSUM` sur le domaine officiel `data.binance.vision`.

Un test HTTPS depuis l'environnement d'exécution a échoué **avant HTTP** (résolution DNS du domaine impossible). Le visualiseur Web n'a pas davantage donné accès aux fichiers. **Aucun ZIP, SHA-256 officiel ou CSV natif du 27–28 octobre n'a été récupéré.** Cela ne permet de conclure ni à une panne Binance ni à un fichier absent.

Un [signalement Binance Public Data du 31/10](https://github.com/binance/binance-public-data/issues/525) concerne la disponibilité de **données Futures** du 28 octobre, et mentionne la présence des archives Spot ; il **ne prouve pas** l'intégrité d'une seule ligne Spot. Ne pas transformer le problème des Futures en lacune Spot.

## 5. Contrat de certification des 5 760 bougies

La validation effective doit, sur les **quatre** ZIP et quatre `.CHECKSUM` officiels :
1. Vérifier le **SHA-256** de chaque ZIP contre sa preuve `.CHECKSUM` et conserver URL, empreinte et date de collecte.
2. Décompresser le CSV natif **12 colonnes**, identifier l'unité **microseconde**, vérifier les bornes UTC, la cadence 60 secondes et la clôture de bougie.
3. Refuser doublons, trous, lignes hors fenêtre, retours en arrière temporels, valeurs OHLC invalides ou volumes négatifs. Ne créer aucune bougie artificielle.
4. Comparer les limites **27/10 23:59 → 28/10 00:00** pour les deux paires et confirmer le nombre exact de **2 × 2 × 1 440 = 5 760** lignes.
5. Séparer **intégrité d'archives Spot Binance USDT** et **simulation de carnet OKX USDC**, qui n'ont ni venue ni devise identiques.

Un script Python 3.8+ **lecture seule** de validation des quatre ZIP, contrôlé localement sur des **données synthétiques** complètes puis altérées (duplicata + minute manquante), a été préparé comme outil auxiliaire de reprise. **Ces tests n'attestent pas que les ZIP officiels passent.**

## 6. Décision et statut

**INDEX RECONCILED / NATIVE SOURCE NOT READ / PAPER NOT CERTIFIED.** Les métadonnées BTC/ETH sont cohérentes, mais la continuité à la minute sur la fenêtre sélectionnée est **toujours non vérifiée sur les sources originales**. Il est interdit de noter « 0 trou » ou « backtest certifié » sur cette fenêtre avant preuve native. La prochaine action requise est la collecte automatique des archives officielles dans un environnement disposant de l'accès réseau, suivie du contrôle SHA-256 et des 5 760 minutes.

**Aucune reprise de frais à demander :** le barème Spot utilisateur Maker **0,08 %**, Taker **0,10 %** est déjà enregistré dans le [OKX MEMORY CORE de Notion](https://app.notion.com/p/AETHER-AGENT-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099), mais il n'est pas nécessaire à un audit de continuité Binance.

*Rapport documentaire sans ordre, sans clé, sans mise à jour runtime.*

## 7. Corrélation officielle des trois suspensions de marché — recherche externe du 09/11

**Découverte : les 470 minutes manquantes sur les trois anciens mois ETH et sur les trois mois partiels BTC correspondent aux interruptions de Spot Binance publiquement annoncées.** Ces périodes ne doivent plus être décrites comme trois mois « mystérieusement manquants ». Il s'agit d'intervalles horaires précis dans des mois existants.

| Date UTC | Trou relevé dans les archives BTCUSDT et ETHUSDT | Durée | Source officielle et cause |
|---|---|---:|---|
| 13/08/2021 | 02:00 → 06:30 | **270 minutes** | [Annonce de maintenance Spot dès 02:00](https://www.binance.com/en/support/announcement/detail/92a9a5bc0129427f8e9928c9b7b09836) ; [reprise à 06:30](https://www.binance.com/en/support/announcement/detail/3ef1861772a44c67acc2c9f5ec9f87e4) |
| 29/09/2021 | 07:00 → 09:00 | **120 minutes** | [Annonce de maintenance Spot dès 07:00](https://www.binance.com/en/support/announcement/detail/e2f674fc961d48af9b28edd82896607c) ; [reprise à 09:00](https://www.binance.com/en-KZ/support/announcement/detail/f72eb94584fa47a586127ff5149ef83c) |
| 24/03/2023 | 12:40 → 14:00 | **80 minutes** | [Communiqué sur le bogue du moteur et suspension à 11:27](https://www.binance.com/en/blog/from-our-ceo/6789340645608890113) ; [reprise Spot à 14:00](https://www.binance.com/en/support/announcement/detail/813a31506e9f478ea8c1058b425df87a) |

**Précision :** en mars 2023, Binance situe le début de l'interruption à **11:27 UTC**, plus tôt que la portion de **12:40 à 14:00** absente dans nos archives. Cette portion se trouve intégralement **dans** la suspension officielle ; les annonces ne permettent pas, à elles seules, de déduire la composition de chaque bougie dans le reste de l'arrêt. Les fichiers CSV et de transactions n'ont pas été relus pendant cette recherche.

**Décision opérationnelle (sans falsifier l'historique) :** créer dans le registre logique un état `MARKET_HALTED_OFFICIAL` pour les intervalles confirmés, et réserver `MISSING_UNKNOWN` aux minutes sans cause établie. Ces bougies ne sont **pas à reconstituer avec des prix OKX ou Kraken** : les échanges Spot Binance étaient suspendus. Le Trader PAPER doit **suspendre les simulations traversant ces intervalles**, ne pas simuler d'ordre pendant une fermeture, et reprendre sur le premier nouveau point source valide. Les autres minutes restent utilisables dans les fenêtres dont l'intégrité est vérifiée. Le contrôle natif distinct des **5 760 bougies d'octobre 2026** reste ouvert et ne doit pas être automatiquement marqué PASS.
