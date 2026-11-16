# SEVEN HEAVEN · Strategy Lab — Real Binance Monthly Pilot Evidence

**Date UTC :** 2026-11-16  
**Statut :** **PASS — 3/3 archives officielles certifiées**  
**Mode :** recherche publique, runner GitHub éphémère, PAPER only  
**Workflow :** Seven Heaven Strategy Lab V4.6.2 PAPER validation · run #84  
**PR de recherche :** #770  
**Runtime propriétaire :** non modifié

## Objet

Prouver que le validateur multi-mois peut contrôler de vraies archives Binance Spot BTC/USDT 1h, avec leurs `.CHECKSUM` officiels, sans dépendre du `workspace/` privé et sans modifier V4.6.2.

Les fichiers ont été téléchargés depuis le chemin public officiel :

`https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h/`

Chaque ZIP et son fichier frère `.CHECKSUM` ont été chargés uniquement dans `RUNNER_TEMP`, puis validés par le même socle `src/binance_monthly_v46.py`.

## Résultat

| Mois | ZIP octets | Bougies | Première UTC | Dernière UTC | Trous | SHA-256 ZIP |
|---|---:|---:|---|---|---:|---|
| 2019-01 | 41 901 | 744 | 2019-01-01 00:00 | 2019-01-31 23:00 | 0 | `41cb84ccff03d5372f22e7502a1c563dd7b3b15347fe086b16daa98aced7a179` |
| 2020-01 | 43 583 | 744 | 2020-01-01 00:00 | 2020-01-31 23:00 | 0 | `4ef7fa698b6821493f4c8317bc616d48bcdf5951d32fe6e40aaa7608886e51ca` |
| 2021-05 | 46 221 | 744 | 2021-05-01 00:00 | 2021-05-31 23:00 | 0 | `728503d417904afff17b403e66f74c18ed0067d3f8e4215130c8a97180c9fccc` |

### Empreintes CSV

**2019-01**
- CSV source : `313ef98d52090a23f12365dd68a595c67e070c249f3328c80e99529ec121860b`
- CSV normalisé : `b85602d209de7ccdbc60f948dd4c16cd34b2d54dc83c37b56724c012314f00d5`

**2020-01**
- CSV source : `40b67e2471a84fd62757f5904a0a02227c0e44012b5d17e1a47ac44d3cc11781`
- CSV normalisé : `7cdeb1c3f10adbe0a950d574ec3a035902e88f5058df8f01b98c8ca8a46f6573`

**2021-05**
- CSV source : `85ee575d69aac4577565071ccc8346d304e3c78a761c3e36d1a33de31ca0a255`
- CSV normalisé : `c95f2e759b0bec75953222e6078bdb1230e374c60f2157ff9f63bd1298971561`

Tous les timestamps de ce lot sont en millisecondes, conformément au contrat Binance antérieur à 2025.

## Gates passés

Pour les trois mois :

- CHECKSUM éditeur concordant ;
- SHA-256 du ZIP recalculé ;
- une seule entrée CSV attendue ;
- schéma Binance valide ;
- OHLC cohérents ;
- volume non négatif ;
- timestamps strictement croissants ;
- alignement 1h UTC ;
- aucun doublon ;
- aucun trou ;
- aucune bougie hors mois ;
- compte exact de 744 bougies ;
- hashes CSV source et normalisé enregistrés.

## Sécurité et frontières

Le rapport du harness déclare :

```
network_calls: 0
orders_real: 0
workspace_writes: 0
```

Le téléchargement réseau appartient à la job CI bornée ; le harness lui-même reste hors réseau.

Après validation, la job vérifie explicitement qu'aucun dossier `workspace/` n'a été créé dans le checkout du dépôt.

Aucune archive Binance téléchargée n'a été publiée comme artefact GitHub et aucune donnée privée n'a été lue.

## Validation CI globale

Le même run #84 a terminé avec succès :

- pilote Binance réel : PASS ;
- suite unitaire Linux Python 3.13 : PASS ;
- API locale V4.6.2 : PASS ;
- smoke public OKX : PASS ;
- Windows Python 3.13 + lanceur CMD : PASS.

## Interprétation

Ce résultat prouve le **chemin de certification** sur trois mois réels séparés.

Il ne prouve pas encore :

- la continuité annuelle 2019, 2020 ou 2021 ;
- l'absence d'anomalie sur tous les mois ;
- une performance de stratégie ;
- un holdout ;
- une supériorité d'un modèle ;
- une future rentabilité.

Étape suivante : contrôler des mois historiquement signalés, puis seulement construire des blocs continus.

**Source d'abord. Continuité ensuite. Stratégie après.**
