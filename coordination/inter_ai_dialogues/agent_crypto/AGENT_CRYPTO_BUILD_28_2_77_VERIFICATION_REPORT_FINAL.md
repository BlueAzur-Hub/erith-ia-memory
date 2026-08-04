# AGENT-CRYPTO — BUILD 28.2.77

## CANONICAL SNAPSHOT MEMORY DEDUPLICATION LOCK — RAPPORT DE VÉRIFICATION FINAL

### 1. Identité

- Build : **28.2.77**
- Base exacte : **Build 28.2.76 — Publication Identity Single Source Lock**
- Archive de base SHA-256 : `61f27e3031c76885bb784840e109e4b33b89cc7d54d75dfb6913409d6c912409`
- Portée : mémoire locale du marché et comparaison du Decision Board uniquement.
- GitHub : **aucune écriture effectuée**.

### 2. Défaut corrigé

Le Build 28.2.76 enregistrait un nouveau relevé local après chaque Livecheck réussi. Plusieurs relevés pouvaient donc représenter le même `snapshot_id` public GitHub Actions et être présentés comme deux points de mémoire comparables.

La comparaison pouvait afficher `2 snapshots locaux` alors que le marché public n'avait pas réellement changé.

### 3. Correction appliquée

- chaque relevé porte désormais :
  - `market_snapshot_id` ;
  - `market_generated_at` ;
  - `market_source_mode` ;
  - la provenance CoinGecko/BCE ;
- un même collecteur ne crée qu'un enregistrement par snapshot marché canonique ;
- une nouvelle observation du même snapshot incrémente `observation_count` et `last_seen_at` ;
- les anciens relevés uniques restent conservés ;
- les doublons historiques sont neutralisés pour l'analyse sans être présentés comme des instants distincts ;
- le Decision Board compare deux snapshots marché distincts du même collecteur ;
- les prix mémorisés utilisent la valeur du snapshot public canonique et non la surimpression spot Binance.

### 4. Lecture visible

La carte `Mémoire comparable` expose désormais :

```text
N snapshots canoniques distincts
M relevés conservés · X doublon(s) neutralisé(s)
```

Avec un seul instant public distinct :

```text
comparaison en attente : un second snapshot marché distinct est requis
```

Avec deux instants publics distincts : la comparaison est autorisée. Si l'écart reste sous le seuil, le texte l'indique sans prétendre que les deux relevés sont identiques.

### 5. Vérité du manifeste

- archive Crypto publique : validée sur Firefox/Ryzen ;
- contrôle de publication : validé sur Firefox/Ryzen ;
- Decision Board Truth Contract : validé sur Firefox/Ryzen ;
- ancien secours Top 250 direct depuis le navigateur : marqué comme retiré et remplacé par l'archive publique.

### 6. Fichiers remplacés

```text
public/agent_crypto_erith_ia/web/app.js
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/version.json
```

### 7. Vérifications automatisées

- contrôles exécutés : **36** ;
- contrôles validés : **36** ;
- échecs : **0**.

Contrôles principaux :

- syntaxe JavaScript avec `node --check` ;
- JSON valide ;
- identité Build/token unique dans index, app et CSS ;
- séquence complète des identifiants HTML préservée ;
- règles et géométrie CSS inchangées ;
- test unitaire de déduplication : mêmes snapshots fusionnés pour l'analyse, snapshots distincts comparables ;
- test d'enregistrement : nouvelle observation du même snapshot sans nouveau relevé ;
- test Chromium injecté : `3 relevés → 2 snapshots distincts → 1 doublon neutralisé` ;
- zéro erreur JavaScript pendant le test Chromium injecté ;
- source principale toujours `data/crypto/latest.json` ;
- formule, seuil de mouvement et seuils d'anomalie inchangés.

### 8. Empreintes des quatre fichiers publics

```text
app.js       46f71858723d7a00545a0b134b81bcbdf85264e15980a6c441636057a832db19
index.html   a4d90819ec9efa80da5c9497405b690b42e37f41bbbe4b6b1739e83cfad241f6
style.css    28c0c857a104b980b32cfb9ef7b763bb511c141cfba4c7d159ec58f71ebcdd4e
version.json 80148337324e0b47b2096a5d71c228f213871cd4a9e34310bcb6176823294bee
```

### 9. Éléments préservés

- collecteur et workflow Crypto publics ;
- CoinGecko USD → EUR BCE ;
- Binance et historiques CoinGecko ;
- formule et seuils du Decision Board ;
- News Sentinel, Watchlist et simulation ;
- domaine Métaux et Math Cores ;
- Control Center V2.1.0R1 et Bridge V1.7.6 ;
- géométrie et identifiants de l'interface.

### 10. Limite de validation

La propagation réelle GitHub Pages et le comportement final dans le Firefox de Christophe restent à confirmer après sa publication. Le test Chromium a été effectué dans un environnement injecté sans réseau public.
