# SEVEN HEAVEN · Strategy Lab — Inventaire réel Binance BTC/USDT 1h · 2019–2021

**Date UTC :** 2026-11-16  
**Statut :** inventaire réel complet des 36 archives mensuelles officielles  
**Mode :** recherche publique, runner GitHub éphémère, PAPER only  
**Workflow :** Seven Heaven Strategy Lab V4.6.2 PAPER validation · run #87  
**Runtime propriétaire :** non modifié

## Résultat global

Les 36 archives mensuelles Binance Spot BTCUSDT 1h de janvier 2019 à décembre 2021 ont été téléchargées avec leur fichier `.CHECKSUM` officiel puis passées dans le validateur strict V4.6.

- mois vus : **36**
- mois certifiés : **19**
- mois rejetés : **17**
- ordre réel : **0**
- écriture `workspace/` : **0**
- interpolation : **0**

Le checksum éditeur ne garantit pas qu'une série de marché est complète : il garantit l'intégrité du fichier publié. Le contrôle de continuité reste donc indispensable.

## Mois certifiés

### 2019
- 2019-01 — 744 bougies
- 2019-02 — 672
- 2019-04 — 720
- 2019-07 — 744
- 2019-09 — 720
- 2019-10 — 744
- 2019-12 — 744

### 2020
- 2020-01 — 744
- 2020-05 — 744
- 2020-07 — 744
- 2020-08 — 744
- 2020-09 — 720
- 2020-10 — 744

### 2021
- 2021-01 — 744
- 2021-05 — 744
- 2021-06 — 720
- 2021-07 — 744
- 2021-10 — 744
- 2021-11 — 720

## Mois rejetés

| Mois | Gate qui bloque |
|---|---|
| 2019-03 | rupture de continuité / bougies absentes |
| 2019-05 | rupture de continuité / bougies absentes |
| 2019-06 | close_time incohérent |
| 2019-08 | rupture de continuité / bougies absentes |
| 2019-11 | rupture de continuité / bougies absentes |
| 2020-02 | rupture de continuité / bougies absentes |
| 2020-03 | close_time incohérent ; diagnostic montre aussi une heure absente |
| 2020-04 | rupture de continuité / bougies absentes |
| 2020-06 | rupture de continuité / bougies absentes |
| 2020-11 | rupture de continuité / bougies absentes |
| 2020-12 | close_time incohérent |
| 2021-02 | close_time incohérent |
| 2021-03 | rupture de continuité / bougies absentes |
| 2021-04 | rupture de continuité / bougies absentes |
| 2021-08 | close_time incohérent |
| 2021-09 | rupture de continuité / bougies absentes |
| 2021-12 | close_time incohérent |

## Diagnostics détaillés déjà établis

### 2019-03
- ZIP SHA-256 : `2c4a969908c2570299052b4faf27b4a39561b1043babc7a65a846a6a65abaa2e`
- lignes : **738 / 744**
- heures absentes : **6**
- 2019-03-12 02:00, 03:00, 04:00, 05:00, 06:00, 07:00 UTC
- doublons : 0
- close_time incohérent : 0

### 2020-03
- ZIP SHA-256 : `cc36c481c31ef93115d96b5a7045ec2ef737e5339546d6688cb1f677526c6787`
- lignes : **743 / 744**
- heure absente : **2020-03-04 10:00 UTC**
- close_time incohérent : **1**, bougie ouverte à 09:00 UTC
- doublons : 0

### 2021-04
- ZIP SHA-256 : `e5a33803814e6771c4c85e8f2e28e90e46d40f14ca3180a8c10c305cf07fab74`
- lignes : **715 / 720**
- heures absentes :
  - 2021-04-20 02:00 UTC
  - 2021-04-20 03:00 UTC
  - 2021-04-25 05:00 UTC
  - 2021-04-25 06:00 UTC
  - 2021-04-25 07:00 UTC
- close_time incohérent : **1**, bougie ouverte à 2021-04-25 04:00 UTC
- doublons : 0

## Blocs mensuels continus actuellement utilisables sans reconstruction

### 2019
- janvier → février : 2 mois
- avril : 1 mois
- juillet : 1 mois
- septembre → octobre : 2 mois
- décembre : 1 mois

### 2020
- janvier : 1 mois
- mai : 1 mois
- juillet → octobre : 4 mois

### 2021
- janvier : 1 mois
- mai → juillet : 3 mois
- octobre → novembre : 2 mois

Il n'existe donc **aucune année 2019, 2020 ou 2021 entièrement continue** avec les seules archives mensuelles actuellement publiées sous ce gate strict.

## Décision scientifique

Ne pas assouplir le validateur pour faire artificiellement passer les 17 mois.

Ne pas interpoler.

Ne pas joindre des fragments en les présentant comme une série continue.

### Prochaine piste

Tester les **archives quotidiennes officielles Binance 1h** aux dates où les archives mensuelles ont des trous.

Si les fichiers quotidiens :
- ont leur propre CHECKSUM valide ;
- contiennent les 24 bougies attendues ;
- passent le même contrôle OHLC/temps ;

alors un mois pourra éventuellement être assemblé comme **source reconstruite à partir d'archives quotidiennes officielles**, avec une provenance distincte et un manifeste explicitant chaque fichier utilisé.

Cette voie reste différente d'une archive mensuelle native et devra être étiquetée comme telle.

**Checksum valide ne signifie pas série complète. Source officielle ne dispense jamais du contrôle des données.**
