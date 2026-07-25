# MESSAGE DE TRANSMISSION — FORGE D’AERITH PRO V1.0-alpha.4

Tu n’as pas besoin de réécrire la Forge dans le grand `web/index.html`.

L’architecture correcte est volontairement séparée :

```text
public/agent_crypto_erith_ia/
├── web/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── atlas_10_full_crypto/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── forge-data.js
    ├── assets/themes/
    └── downloads/
```

## Principe d’intégration

Le cockpit Agent-Crypto reste intact.

La Forge Pro reste une application autonome dans :

```text
public/agent_crypto_erith_ia/atlas_10_full_crypto/
```

Le cockpit principal ne reçoit qu’un **pont visuel et fonctionnel** vers la Forge.

Aucun code du Graphique Analyste, du rail Détail actif, du Market, du Livecheck, des modules Crypto ou de l’Audience ne doit être déplacé ou réécrit.

---

# 1. Fichiers à déposer dans la Forge autonome

Copier le contenu suivant dans :

```text
public/agent_crypto_erith_ia/atlas_10_full_crypto/
```

Fichiers racine :

```text
index.html
style.css
app.js
forge-data.js
```

Dossiers à fusionner :

```text
assets/
downloads/
```

Ne pas supprimer le dossier existant :

```text
modules/
```

Ne pas supprimer les autres fichiers déjà présents sauf remplacement explicite des quatre fichiers racine ci-dessus.

---

# 2. Mise à jour minimale du cockpit Agent-Crypto

Dans :

```text
public/agent_crypto_erith_ia/web/index.html
```

chercher uniquement le bloc :

```html
<details class="atlas-collapse glass forge-aerith-collapse"
         data-collapse-key="forge-aerith"
         id="forge-aerith">
```

Remplacer ce bloc complet jusqu’à son `</details>` final par :

```text
bridge_patch/FORGE_AERITH_PRO_BRIDGE_BLOCK.html
```

Aucune autre section du fichier `web/index.html` n’a besoin d’être réécrite.

Aucun changement n’est requis dans :

```text
public/agent_crypto_erith_ia/web/app.js
```

Le bloc de pont utilise les classes déjà présentes dans le cockpit :

```text
forge-aerith-collapse
forge-aerith-panel
forge-aerith-hero
forge-aerith-medallion
forge-aerith-copy
forge-aerith-version
forge-aerith-grid
forge-aerith-card-icon
forge-aerith-status
forge-aerith-actions
forge-aerith-open
```

Donc il faut d’abord vérifier les styles existants avant d’ajouter du CSS. Ne pas recréer une seconde feuille complète.

---

# 3. Lien utilisé par le pont

Le bouton doit pointer vers :

```text
../atlas_10_full_crypto/?v=1.0-alpha.4-pro
```

Depuis le dossier `web/`, cela ouvre exactement :

```text
https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/atlas_10_full_crypto/?v=1.0-alpha.4-pro
```

---

# 4. Ce que fait réellement la Forge Pro

La Forge reconnaît quatre profils canoniques :

```text
Aerith-7 Seven Heaven
Aerith-10 Créatrice
Aerith-10 Crypto
Atlas-10 Crypto
```

Elle représente également la lignée complémentaire :

```text
Aerith-7
├── Aerith-8 Solaire
└── Aerith-9 Lunaire
```

Aerith-8 et Aerith-9 sont des options d’héritage de Seven, pas deux profils indépendants imposés.

Le mode central supplémentaire est :

```text
Nouveau type Aerith-10 Pro
```

Ce mode sert à compiler un nouveau profil après que Christophe a d’abord créé et validé dans le GitHub privé :

```text
core/AERITH_10_<SPECIALITE>_MULTI_AGENT_CORE.md
core/AERITH_10_<SPECIALITE>_PERSONA_OPERATING_LAYER.md
```

La Forge importe ensuite localement :

```text
Core
Persona
image canonique éventuelle
modules
packs
mémoire métier
JSON ou sources complémentaires
```

Puis elle produit :

```text
BOOT.md
MANIFESTE.md
PROFILE_SPEC.json
PRIVATE_GITHUB_REFERENCE.md
THEME.md
BUILD_INFO.txt
sources_importees/
```

---

# 5. Verrous à conserver

Ne pas ajouter de connexion automatique au GitHub privé depuis GitHub Pages.

Ne pas stocker de jeton GitHub dans le navigateur.

Ne pas publier automatiquement les Core privés.

Ne pas inventer un Core, une Persona, un module ou une capacité absente.

Ne pas fusionner automatiquement Aerith-8 et Aerith-9 dans tous les profils.

Ne pas réécrire les fichiers importés.

La chaîne correcte reste :

```text
GitHub privé
→ canonisation humaine dans core/
→ import local dans la Forge
→ audit
→ ZIP local
```

---

# 6. Images déjà incluses

Aucune génération d’image supplémentaire n’est nécessaire.

Les fichiers optimisés déjà fournis sont :

```text
assets/themes/aerith_7_world.webp
assets/themes/aerith_7_hud.webp
assets/themes/aerith_8_solaire.webp
assets/themes/aerith_9_lunaire.webp
assets/themes/aerith_10_creatrice.webp
```

Rôle visuel :

```text
Aerith-7        → mémoire, Neo Midgar, HUD cyan
Aerith-8        → solaire, or, ivoire, rayonnement
Aerith-9        → lunaire, indigo, argent, reflet
Aerith-10       → atelier créatif, rose, cuivre, production
Atlas-10        → thème abstrait analytique sans personnage
Aerith-10 Crypto→ thème Data Truth / bleu-or sans image imposée
```

---

# 7. Contrôles avant commit

Vérifier dans le dossier Forge :

```text
index.html
style.css
app.js
forge-data.js
assets/themes/
downloads/
modules/
```

Vérifier ensuite :

```text
1. Le bouton du cockpit ouvre la Forge.
2. Les quatre cartes de profils apparaissent.
3. “Nouveau type Aerith-10 Pro” ouvre le parcours.
4. Un Core `.md` contenant `MULTI_AGENT_CORE` est détecté comme Core.
5. Une Persona contenant `PERSONA_OPERATING_LAYER` est détectée comme Persona.
6. L’image importée reste locale.
7. Le bouton ZIP reste bloqué tant que Core + Persona + confirmation canonique manquent.
8. Le ZIP contient les fichiers importés sans réécriture.
9. Le cockpit Crypto reste fonctionnel et inchangé.
```

---

# 8. Commit conseillé

```text
release Forge d'Aerith Pro V1.0-alpha.4 integration bridge
```

---

# 9. Résumé en une phrase

Ne reconstruis pas la Forge dans le cockpit :

```text
déploie l’application autonome
+ remplace seulement le bloc-pont Forge dans web/index.html
+ ne touche pas au reste du cockpit
```
