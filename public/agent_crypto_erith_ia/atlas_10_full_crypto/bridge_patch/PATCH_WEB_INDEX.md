# Patch du pont Agent-Crypto → Forge d’Aerith Pro

Cible :

`public/agent_crypto_erith_ia/web/index.html`

Remplacer uniquement le bloc complet :

```html
<details class="atlas-collapse glass forge-aerith-collapse" ... id="forge-aerith">
...
</details>
```

par le contenu de :

`FORGE_AERITH_PRO_BRIDGE_BLOCK.html`

Aucun changement n’est nécessaire dans `web/app.js`.

Le bloc utilise les classes CSS déjà présentes dans le cockpit Agent-Crypto.
