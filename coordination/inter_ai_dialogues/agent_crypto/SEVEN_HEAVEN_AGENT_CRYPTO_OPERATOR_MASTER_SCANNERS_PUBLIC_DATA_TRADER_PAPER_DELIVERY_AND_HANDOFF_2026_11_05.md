# Seven Heaven — Operator Yoann, livraison publiée et passation

Date de la passation : 5 novembre 2026, heure de Paris.

## État de livraison

La PR [Operator #18](https://github.com/BlueAzur-Hub/agent-crypto-operator/pull/18) est fusionnée dans `main`. La publication Pages a réussi le 5 novembre à 03 h 35. Les quatre workflows après fusion ont réussi, la recette Firefox Linux se terminant à 03 h 37.

| Repère | Référence |
| --- | --- |
| Dépôt applicatif | `BlueAzur-Hub/agent-crypto-operator` |
| Commit publié et source exacte du ZIP | `d4b01c36ce9070b474873da1de865bfd2bdde6c6` |
| Base du différentiel | `0bda78a7ba747bd1d6aa25e67174243d077de654` |
| Correctif des contrôles avant fusion | `6fca6b2c3633f29de6baf54e532c83a6f43e11a2` |
| Runtime partagé | `40.6.719` |
| Market Core | `38.15.11` |
| Contenu | 10 fichiers applicatifs, 915 051 octets |
| SHA-256 de l’archive finale | `7bc82e38e572edfa847bade4992ed12a05e0075f0e15df26e0e7c6b5aba91754` |

Le présent dépôt conserve le paquet public et la coordination. Le code applicatif reste publié dans le dépôt Operator.

## Paquet et mode d’emploi

- [ZIP final](./AGENT_CRYPTO_OPERATOR_YOANN_MASTER_SCANNERS_PUBLIC_DATA_AND_TRADER_PAPER_INCREMENTAL_UPDATE_10_FILES_2026_11_05.zip)
- [SHA-256](./AGENT_CRYPTO_OPERATOR_YOANN_MASTER_SCANNERS_PUBLIC_DATA_AND_TRADER_PAPER_INCREMENTAL_UPDATE_10_FILES_2026_11_05.zip.sha256)
- [Manifeste des dix fichiers](./AGENT_CRYPTO_OPERATOR_YOANN_MASTER_SCANNERS_PUBLIC_DATA_AND_TRADER_PAPER_INCREMENTAL_UPDATE_10_FILES_2026_11_05.manifest.json)

Archive issue de l’[artefact du workflow après fusion](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/41955957669/artifacts/13382888499). Seul son nom externe a été adapté pour identifier cette livraison du 5 novembre. Ses octets sont ceux du ZIP applicatif produit par CI. Le commentaire Git de l’archive et le reçu `SOURCE_COMMIT.txt` du workflow portent le commit publié ci-dessus.

Le ZIP contient un **différentiel**, à appliquer aux chemins relatifs correspondants dans une copie de l’Operator à partir de la base indiquée. Il ne constitue pas une installation autonome. Vérifier la base et les modifications locales avant application. La version GitHub Operator est déjà mise à jour, aucune réinstallation manuelle n’est nécessaire pour le site public.

Le précédent ZIP marqué PREMERGE du 4 novembre reste un témoin du candidat. Les dix fichiers applicatifs ont les mêmes empreintes. L’archive finale a un SHA-256 différent car sa métadonnée Git porte le commit de fusion.

## Ce qui est livré

- Quinze fonctions du scanner reprises du MASTER, dont la sélection Market, l’acquisition historique dans la bonne devise et la validation des fenêtres.
- Validation atomique des cinq actifs attendus, dans l’ordre fixé. Un panier incomplet, une série incompatible, un actif substitué, un doublon ou un ordre incorrect préserve le graphique précédent.
- Lecteurs publics Strategy et PAPER, moteur Spot simulé, décision PAPER, vue de saisie simulée et styles.
- Réutilisation du cœur PAPER multi-actifs et adaptation de la vue et du miroir au Trader Yoann.
- Accès aux ressources publiques du MASTER par le routeur existant, sans copie massive des archives.
- Correction du test scanner devenu obsolète et ajout du runtime dans le checkout de la vérification de parité.

Les dix fichiers exacts, tailles, SHA-256 et empreintes Git figurent dans le manifeste. Les tests et workflows restent dans l’historique Git, hors du ZIP applicatif.

## Preuves et portée

| Contrôle | Résultat et preuve |
| --- | --- |
| SOURCE_COMMITTED | PASS — [commit publié](https://github.com/BlueAzur-Hub/agent-crypto-operator/commit/d4b01c36ce9070b474873da1de865bfd2bdde6c6), PR #18 fusionnée |
| ARCHIVE_READY | ZIP, checksum, manifeste et cette passation déposés ensemble dans le répertoire partagé |
| Contrat Operator | PASS — [workflow](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/41955957475) |
| Parité et périmètre | PASS — [workflow](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/41955957366) |
| Firefox Linux CI | 29/29, zéro échec — [workflow](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/41955957669). Montage PAPER/Strategy et trois lectures publiques MASTER HTTP 200 vérifiés |
| PAGES_DEPLOYED | PASS — [build et déploiement](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/41955956365) au commit publié |
| Ressources publiques | Les dix fichiers ont été téléchargés depuis Pages après publication, HTTP 200, empreintes Git identiques au paquet validé |
| FIREFOX_LOADED sur le poste Windows | PENDING pour ce commit. La capture Actions reçue confirme les contrôles verts, pas le chargement du runtime dans Firefox Windows |
| FUNCTIONALLY_VALIDATED, parité complète | PENDING — matrice de 84 cas et tâches ci-dessous |

Les deux pages publiques ont été ouvertes dans Chrome. La session démarrée avant le déploiement a conservé dans son DOM le laboratoire BTC/CT et les deux anciens scripts, sans les nouveaux lecteurs. Les ressources HTTP examinées correspondent pourtant au code publié. Un cache antérieur est une hypothèse, cohérente avec `max-age=600`, pas une cause démontrée. Il reste à vérifier un chargement neuf et le montage complet sur les pages publiques. Aucun effacement de stockage utilisateur n’a été réalisé.

## Reste à faire, sans reprendre les acquis

1. **B2, scanners et comparaisons.** Valider Top 3/5, Hausses 5, Baisses 5 et Volumes 5 depuis l’univers Market choisi jusqu’au Top 1000. Vérifier premier clic à froid, annulation, changements rapides, fenêtres incomplètes, identité et ordre des actifs, règle de stablecoins propre au mode.
2. **B3, collecte, réseau et cache.** Porter les écarts utiles de `atlasNetworkPump` et des collecteurs. Qualifier sources USD/EUR, repli autorisé, 429, délais, reprise, onglet masqué, cache chaud/froid et quota.
3. **B4, historiques longs et données.** Raccorder les fonctions annuelles USD manquantes du MASTER avec leurs dépendances. Prouver bornes 1 an/Max, trous, devise native et repli. Suivre les données publiques jusqu’aux panneaux qui les utilisent.
4. **Cohérence des écrans.** Comparer graphique, tableau, axes, légende, infobulle, Fiche, Lecture technique, Oracle, Profondeur et Sources. Qualifier PAPER multi-actifs, scénarios, frais, erreurs de source, dossiers BTC/ETH, CT et TRADUS.
5. **Dossiers suivis.** Corriger le lien de nouveaux listings vers la destination publique MASTER et l’ouverture dans un nouvel onglet. Classer les autres écarts fonctionnels en intégré, spécifique à Yoann ou exclu avec motif.
6. **Recette et livraison finale de parité.** Réutiliser la matrice 6 modes × 7 périodes × 2 devises = 84 cas. Vérifier un chargement neuf après publication, Firefox Windows et les limites du Bridge autorisé. Le présent paquet clôt la livraison de #18, pas cette recette complète.

Le suivi détaillé reste dans le [Notion AETHER Agent-Crypto](https://app.notion.com/p/AETHER-AGENT-CRYPTO-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099).

## Points d’entrée et continuité

- [Interface Yoann](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html)
- [Trader Yoann](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/trader/trading-desk.html)
- [Coordination précédente, 3 novembre](./SEVEN_HEAVEN_AGENT_CRYPTO_ADMINISTRATOR_OPERATOR_TRADUS_REPRISE_COORDINATION_2026-11-03.md)
- [Protocole de livraison](./AGENT_CRYPTO_DEPLOYMENT_PROTOCOL.md)

La passation du 3 novembre est conservée comme état historique. Les références de version et d’avancement ci-dessus décrivent la livraison du 5 novembre. Le contenu publié ici provient du code public Operator et de ses preuves CI, sans fichier privé de Yoann.

Lectures intégrales utiles à ce dépôt : README de coordination, protocole de déploiement, protocole d’auto-update et passation du 3 novembre, depuis `BlueAzur-Hub/erith-ia-memory/main/coordination/inter_ai_dialogues/agent_crypto/`. Leurs règles applicables sont la séparation code/paquet/déploiement/client, l’archive différentielle avec empreintes, la préservation de l’historique et la distinction entre validation Linux et Windows. Les cinq fichiers de cette livraison restent dans le répertoire de coordination.
