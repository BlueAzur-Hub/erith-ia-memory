# ERITH.IA Trading Desk — 40.6.580

## Statut
Dernière cascade de fidélité du squelette Trader. Même application Agent-Crypto, page `trading-desk.html`, exécution réelle désactivée.

## Agencement canonique
- Menu minimal en haut : identité, PAIR, SPOT / PERP séparé, navigation Graphique / Lecture / Market / Math Core, retour Administrator.
- Zone principale : Graphique / Bougies dominant ; Lecture Technique et Profondeur conservent les owners Administrator.
- En dessous : Market Snapshot large + Math Core V3 à droite.
- BUY / SELL / STOP restent désactivés.

## Lecture Technique
Un seul portrait Aerith dans `#detailPanel` ; les pseudo-backgrounds concurrents du shell Trader sont neutralisés et le cadrage est recentré.
AUTO / AUBE / JOUR / SOIR / NUIT / LUNE, RND 21 images, image privée IndexedDB et Support / Résistance existant sont conservés. La fenêtre S/R s'ouvre au premier chargement puis reste repliable.

## Market
Même archive publique Agent-Crypto `latest.json` / `extended.json`. Recherche, filtres, 50/100/250/500/1000, Essentiel/Complet, tris, sélection et Solo conservés. Les valeurs absentes restent absentes : `null` n'est plus transformé en zéro.

## Math Core V3
Palette canonique : rouge <25 ; orange 25–54 ; turquoise/bleu 55–74 ; vert >=75 ; gris uniquement quand réellement en attente.
Mesures factuelles : série, pas médian, complétude, volatilité fenêtre, drawdown, VaR historique 95 %. Aucun modèle prédictif ajouté.

## Protections
Administrator 40.6.571 et Market Core 38.15.11 inchangés. Owners Bougies/Profondeur conservés. Aucune clé OKX privée côté client. Aucun ordre réel.

## Stop Gate
Syntaxe JavaScript vérifiée avant publication. Terrain Firefox 40.6.580 : **PENDING CHRISTOPHE**. Après PASS terrain, geler le squelette Trader avant le chantier OKX privé READ ONLY.
