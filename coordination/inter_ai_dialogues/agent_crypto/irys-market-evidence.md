# ERITH.IA · IRYS — dossier d'écart de cotations et passation Radar
Date d'étude : 23 octobre 2026. Statut : **RESEARCH_ONLY / PARTIAL_EVIDENCE**. Aucun changement du runtime, aucune opération financière.

## A. Éléments établis

- Identité officielle : **Irys (IRYS)**, blockchain de données programmables et d'exécution EVM liée aux usages IA.
- Source OKX Europe (27 mai 2026) : cotation Spot annoncée **IRYS/USDT**, ouverture 10:00 UTC ; paires **IRYS/USD** et **IRYS/EUR** annoncées à 11:00 UTC.
- Contrat ERC-20 cité par OKX : **0x50f41F589aFACa2EF41FDF590FE7b90cD26DEe64**. Faire les rapprochements via l'identité complète, pas uniquement IRYS.
- Une paire publiée sur OKX n'établit pas l'accès Spot effectif sur le compte français de l'utilisateur.

## B. Relevé à réconcilier

| Origine | Heure le 23 octobre 2026 | Instrument / méthode | Prix | Variation 24 h | État |
|---|---|---|---:|---:|---|
| Capture utilisateur OKX « Gagnants » | 21:33 Paris = 19:33 UTC (heure du navigateur) | **IRYS/USDC** affiché | **0,20870 USDC** | **+867,55 %** | Observation visuelle, pas preuve d'exécution |
| OKX page prix | 23:00:14 UTC+8 ≈ 15:00 UTC | Prix IRYS global USD | **0,04564 USD** | **+96,22 %** | Source publique, heure antérieure |
| CoinPaprika | 15:13 UTC | IRYS agrégé USD | **0,045833 USD** | **+108,62 %** | Méthodologie et heure distinctes |

Calcul arithmétique : 0,20870 / (1+867,55/100) = **0,02156994 USDC**, cours implicite d'ouverture sur la fenêtre 24 h de la capture. Il est de l'ordre des prix observés sur le marché la veille ; cela ne valide ni le dernier prix, ni le volume exécutable, ni la comparabilité des sources.

**Ne pas écrire « BUG » ou « FAUSSE HAUSSE » sans les données brutes de la paire IRYS-USDC à 19:33 UTC.**
**Ne pas écrire « +867,55 % confirmé par plusieurs exchanges » : cela n'a pas été démontré.**

## C. Lacunes documentaires

1. Réponse ticker OKX IRYS-USDC avec ts, last, open24h, high24h, low24h, bidPx, askPx et volCcy24h proche du relevé.
2. Bougies 1m et transactions réellement archivées autour du 23/10/2026 19:33 UTC.
3. Vérification instrument Spot : base/quote, état du marché, règles et accès personnel France/EEA.
4. Recoupement sur une autre plateforme au même instant, sans supposer l'équivalence USDC / USD / USDT.
5. Carnet et spread : distinguer dernier prix affiché et prix accessible pour une taille donnée.

L'API publique OKX décrit les champs : https://app.okx.com/docs-v5/en
Les données brutes historiques à 19:33 UTC **n'ont pas été acquises** au cours de cette session.

## D. Sources publiques

- OKX IRYS/USDT (27 mai 2026) : https://www.okx.com/en-eu/help/okx-to-list-irys-usdt-irys-for-spot-trading
- OKX IRYS/USD & EUR : https://www.okx.com/fr/help/okx-will-launch-irys-usd-and-irys-eur-for-spot-trading
- OKX prix IRYS : https://www.okx.com/en-gb/price/irys-irys
- CoinPaprika : https://coinpaprika.com/coin/irys-irys
- OKX API : https://app.okx.com/docs-v5/en
- CoinGecko : https://www.coingecko.com/en/coins/irys
- Observation utilisateur : capture Firefox du 23 octobre à 21:33, dans le fil Crypto (non copiée dans GitHub car elle provient de sa session personnelle).

## E. Classification souhaitée des nouveautés dans le Market MASTER

**PROPOSITION, NON IMPLÉMENTÉE** :
- **OKX Spot** : instrument Spot public ; identité et autorisation du compte vérifiées séparément.
- **Autres exchanges** : paires Spot d'autres plateformes, avec venue, date, preuve et devise native.
- **Actifs tokenisés** : distinguer actions tokenisées et RWA, sans confondre Spot, dérivés et tokens d'action.
- Sous-statut **CANDIDAT / CONFIRMÉ**, date de première cotation / date de détection, source horodatée, absence de prix = inconnu.

L'Interface MASTER reste propriétaire du Market. Trader MASTER hérite de son runtime. Operator Yoann et son Bridge sont hors périmètre. Aucun changement du Market Core 38.15.11, aucun polling nouveau ni ordre réel.

## F. Ressource utilisateur

Page publique de cas d'école dans le dépôt : public/agent_crypto_erith_ia/trader/irys-market-case-study.html.
Cette page est indépendante du runtime ; le rendu Firefox de son futur déploiement GitHub Pages n'est pas encore attesté.
