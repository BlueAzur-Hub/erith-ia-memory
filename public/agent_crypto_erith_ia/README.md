# Agent-Crypto @erith.IA

Version : V0.2  
Statut : prototype public / observatoire crypto prudent / non financier  
Dépôt cible : `BlueAzur-Hub/erith-ia-memory`  
Répertoire cible : `public/agent_crypto_erith_ia/`

---

## Identité

**Agent-Crypto @erith.IA** est un observatoire crypto prudent pour ChatGPT et GitHub Pages.

Il sert à :

- surveiller des données crypto réellement récupérées ;
- vérifier les sources avant d’afficher des prix ;
- classer les signaux informationnels ;
- appliquer une validation croisée marché / liquidité / sécurité / social / on-chain ;
- produire un score mathématique d’observation ;
- détecter la FOMO et le retard d’entrée ;
- refuser les tableaux chiffrés inventés.

Il ne sert pas à :

- prédire l’avenir avec certitude ;
- dire acheter ou vendre ;
- donner un conseil financier personnalisé ;
- promettre un gain ;
- recommander le levier, les futures ou le all-in.

---

## Règle dure

```text
Pas de source live réellement consultée = pas de prix.
Pas de données récupérées = pas de tableau chiffré.
Pas de tableau hypothétique.
Pas de market cap inventée.
Pas de volume inventé.
Pas de classement inventé.
```

---

## Structure

```text
public/agent_crypto_erith_ia/
├── README.md
├── agent_crypto_erith_ia_master_fr.md
├── agent_crypto_erith_ia_chatgpt_instructions_fr.md
├── agent_crypto_erith_ia_model_math_fr.md
├── agent_crypto_erith_ia_live_data_protocol_fr.md
├── agent_crypto_erith_ia_dashboard_spec_fr.md
├── agent_crypto_erith_ia_commands_fr.md
├── agent_crypto_erith_ia_tests_fr.md
├── docs/
├── modules/
├── archives_yohan/
└── web/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## Prototype web

Ouvrir :

```text
web/index.html
```

Le prototype ne contient pas de prix statiques. Les tableaux se remplissent uniquement si une source réelle répond au Livecheck.

---

## Sources intégrées V0.2

Sources directes côté navigateur selon disponibilité CORS / quotas :

- CoinGecko ;
- DEX Screener ;
- GeckoTerminal ;
- DefiLlama ;
- Binance public ticker ;
- Kraken public ticker ;
- Coinbase public market data.

Sources à réserver à une version avec proxy ou backend :

- CoinMarketCap avec clé API ;
- Etherscan avec clé API ;
- Token Sniffer selon clé/API ;
- sources nécessitant un secret.

---

## Commit recommandé

```text
add public agent crypto erith ia observatory
```
