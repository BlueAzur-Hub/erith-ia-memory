# Agent-Crypto — Simulation / Evidence Decoupling

Build **40.6.406** · parent **40.6.405** · Market Core **38.15.11**.

## Terrain parent 40.6.405

La preuve Firefox confirme :
- Strategy A headless est **AUTO A ACTIF** sans ouverture préalable de Simulation ;
- deux cycles Auto A sont observés dans le dump courant ;
- Strategy Core arrive vers **84,44 s** ;
- Postboot ready vers **170,86 s** ;
- System hydrated vers **185,90 s** ;
- ouvrir/consulter la zone Strategy déclenche encore **operator-evidence-demand · 28/28** ;
- Strategy Evidence démarre vers **196,05 s** et devient prête vers **277,08 s** sur ce passage.

Le défaut n'est donc plus l'autostart Strategy. Le défaut est le couplage entre consultation UI et Evidence complet.

## Correction 40.6.406

### 1. Simulation ne déclenche plus Evidence

Le propriétaire `strategy-a-evidence-demand-loader.js` n'interprète plus tout clic dans :
- Evidence Dossier ;
- Gate Audit ;
- Durable Evidence ;
- Paper V2 Proof Bridge

comme une demande de chargement complet.

Le loader 28 modules ne part désormais que depuis un contrôle explicitement marqué :

`data-strategy-evidence-demand="true"`

ou depuis les chemins API/hash explicitement prévus.

### 2. Résumé léger des 9 Gates

Le nouveau propriétaire :

`js/strategy-a-simulation-evidence-decoupling-406406.js`

lit la matrice déjà résidente :

`AgentCryptoStrategyASafetyCertification.certification_matrix()`

et affiche G1 → G9 sans charger la chaîne Evidence.

Aucun état de Gate n'est modifié.

### 3. Evidence complet reste disponible

Le résumé léger expose une action explicite :

**OUVRIR LES PREUVES**

Cette action seule déclenche le loader complet.

### 4. État Auto A visible hors Simulation

Un badge d'état est ajouté dans le bandeau Administrator et lit :

`AgentCryptoStrategyAAutoStart.snapshot()`

États affichables :
- **STRATEGY A · AUTO A ACTIF**
- **STRATEGY A · WAIT**
- **STRATEGY A · STOP**
- **STRATEGY A · ATTENTE**

Aucun polling, timer récurrent ou MutationObserver n'est ajouté.

## Protections

Inchangés :
- Market Core **38.15.11** ;
- Strategy A thresholds ;
- Cost Gate ;
- Risk Governor ;
- Paper business logic ;
- Math ;
- Aether métier ;
- Oracle ;
- Lecture Technique ;
- REDIVIDER ;
- Storage schemas.

Aucun ordre réel, wallet, clé, nouveau réseau métier ou nouveau stockage.

## Terrain Firefox

**PENDING.**

Le PASS demande de vérifier :
1. build 40.6.406 ;
2. badge Strategy visible avant ouverture de Simulation ;
3. ouverture de Simulation sans départ Evidence 28/28 ;
4. résumé G1→G9 visible depuis Safety Certification ;
5. Evidence complet chargé seulement après clic explicite **OUVRIR LES PREUVES**.
