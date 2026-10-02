# Agent-Crypto Operator 40.6.510 — Shared Runtime 509

## Destination

Créer la première livraison Operator contemporaine sans dupliquer Administrator.

## Source canonique

- Administrator **40.6.509**
- Market Core **38.15.11**
- Aether Control **2.3.2R19**
- Bridge **1.9.13**
- Backend **1.4.4**

La preuve terrain 40.6.509 du 02/10/2026 montre :
- Build 40.6.509 visible ;
- Graph Context V7 : DB OK / LS ok ;
- Book / Profondeur OKX LIVE 2 s ;
- Profondeur indépendante ;
- Lecture Technique intacte ;
- aucune exécution depuis le Book.

## Architecture 40.6.510

Operator est une entrée de profil :
`operator/index-40.6.510.html`
→ `administrator/index-40.6.509.html?view=intermediate&operator-entry=40.6.510&profile=yohan`

Le runtime Administrator possède déjà le contrat :
- `view=intermediate` → rôle `operator`;
- la vue `advanced` exige une session `owner`;
- le shell visuel peut rester commun sans étendre les capacités.

## Invariants

- un seul Market Core ;
- pas de fork Book-lite ;
- pas de copie Administrator ;
- pas de session Administrator ;
- pas de wallet ;
- pas de clé privée ;
- pas d’ordre réel ;
- paper-only ;
- Backend loopback/read-only ;
- Strategy / Cost Gate / Oracle / Aether inchangés.

## Terrain requis après déploiement

1. Firefox Ryzen : ouvrir `/operator/`.
2. Confirmer entrée Operator 40.6.510.
3. Confirmer vue Intermédiaire et absence de privilèges Administrator.
4. Vérifier Marché / Graphique / Bougies / multi-actifs.
5. Vérifier Lecture Technique.
6. Vérifier Carnet / Profondeur avec Backend.
7. Couper Backend puis vérifier une dégradation propre.
8. Confirmer Market Core 38.15.11.

## Stop point

Ne pas enrichir Operator avant cette preuve terrain.
