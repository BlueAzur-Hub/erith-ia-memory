# Seven Heaven · Agent-Crypto — Passation claire et reprise sans confusion

**Date :** 10 novembre 2026 (Europe/Paris).  
**Nature :** point de passage opérationnel, destiné au créateur et aux autres IA.  
**Règle :** lire cette page AVANT de repartir dans les scripts ou les archives. Le présent document **ne lance aucun chantier**.

## 1. Notre but, en une phrase

Aider le créateur à **comprendre les mouvements du marché crypto** dans son programme existant, en rapprochant des graphiques, des informations économiques et des observations vérifiables — **sans exécution d'ordres réels**.

La question de départ était pédagogique : comment expliquer une baisse de Bitcoin, notamment les 5 et 8 novembre 2026, sans supposer qu'un article ou un flux ETF est forcément la cause d'une bougie ?

## 2. L'architecture voulue par le créateur — ne plus la changer

| Élément | Son rôle | Décision |
|---|---|---|
| **Interface Administrator** | Actualités, contexte économique, ressources de marché | Les actualités **restent ici**. |
| **Trader** | Bougies, EMA, volumes, lecture technique, simulations PAPER | **Pas** de panneau d'actualités ajouté ; graphique inchangé. |
| **Seven / laboratoire GitHub** | Collecter des preuves publiques, comparer des horaires et produire des comptes rendus | Réutiliser les données et moteurs existants, sans duplications inutiles. |
| **Bridge R31** | Connectivité locale/privée selon ses règles propres | **Aucune modification** dans le présent chantier. |
| **Notion + GitHub** | Documentation et mémoire transmissible entre fils et IA | Un seul point de reprise, avec liens vers les preuves. |

Le suivi Seven n'est pas un nouveau logiciel de trading, ni un système acheteur/vendeur autonome.

## 3. Acquis réels, confirmés par les fichiers publics

**A. Étude historique validée en laboratoire :** 48 bougies horaires closes de BTC-USDC Spot OKX (5 et 8 novembre), plus comparaisons avec des actualités et des sources externes de liquidations. La corrélation horaire ne prouve pas la causalité.

- [Archive des 48 heures OKX](./okx-hourly-collector/evidence/index.json).
- [Analyse historique lisible](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_OKX_NATIVE_HOURLY_ETF_LIQUIDATION_CROSSCHECK_EVIDENCE_REPORT_2026_11_10.md).
- [Analyseur commun et tests](./btc-market-news-analysis-prototype/).

**B. Suivi opérationnel automatique :** un workflow GitHub Actions récupère des bougies BTC-USDC Spot OKX clôturées, alimente un historique de marché et génère un rapport daté. **Deux exécutions ont été confirmées réussies dans ce fil**, dont la seconde le 10 novembre à 15:42 UTC.

- [Code et guide de suivi](./btc-market-operations/market-monitor/).
- [Dernier rapport lisible](./btc-market-operations/reports/latest.md).
- [Dernier rapport machine](./btc-market-operations/reports/latest.json).
- [Exécution réussie](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/42847000484).

**C. Liquidations dérivées :** Bybit, Binance et OKX diffusent des événements observés par un collecteur public **échantillonné**, avec journal des périodes connectées. Au contrôle du 10 novembre, le rapport recense 577 messages reçus pendant des fenêtres observées, et **3 fenêtres de connexion documentées**, non 577 liquidations mondiales garanties distinctes.

- [Données observées et journal de couverture](./liquidation-monitor/observations/).
- [Collecteur et tests](./liquidation-monitor/).
- Les périodes non observées sont **inconnues**, pas des périodes où il n'y aurait eu aucune liquidation.
- Les tailles OKX en contrats ne sont pas assimilées à des dollars sans multiplicateur de contrat vérifié.
- Le correctif de fusion anti-collision Git est publié au commit `6e252d6101e17c4575598cf1c1321532551e2b01`.

**D. Actualités :** le flux est déjà tenu par l'Interface Administrator, avec une recherche élargie aux nouvelles sur les liquidations. Ses articles sont du contexte : ils ne suffisent pas à calculer les liquidations exactes d'une heure.

- [Actualités structurées](../data/news/latest.json).
- [État du flux](../data/news/status.json).

**E. Accès humain :** un [tableau de suivi Seven](./btc-market-operations/dashboard.html) a été publié et utilise les rapports publics. Son rendu dans Firefox et son déploiement GitHub Pages **n'ont pas été personnellement validés dans ce fil**. Lien de consultation prévu : [Observatoire public BTC Seven](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/btc-market-operations/dashboard.html).

## 4. Ce qui n'est PAS finalisé : dire les choses précisément

1. **Pas de captation permanente des liquidations 24 h/24.** Le workflow actuel observe des fenêtres de 6 minutes deux fois par heure (20 % du temps nominal au maximum). GitHub Actions peut encore décaler les exécutions. Un service persistant serait nécessaire pour une couverture continue et supervisée.
2. **Pas d'intégration utilisateur terminée dans l'Interface.** Les fichiers et la page de laboratoire existent ; le chemin de consultation quotidien du créateur n'est pas encore validé en usage réel.
3. **Pas de validation Firefox confirmée** pour la nouvelle page.
4. **Pas de démonstration de causalité** ETF → liquidation → bougie Spot, ni de prédiction ou rendement validé.
5. **Pas de nouvelle interface Trader ni d'accès au compte de trading.** Les données personnelles, achats et prix de revient ne sont PAS déduits de ce système de veille.
6. **Pas de garantie que les prochains runs réussissent tous.** Le dernier état contrôlé doit être relu, sans qualifier une chaîne « verte » de façon permanente.

Le dernier `reports/latest.json` contrôlé était **`OPERATIONAL_PARTIAL_COVERAGE`** (généré à 2026-11-10T15:42:29Z). Ce libellé est correct : **opérationnel avec lacunes connues**, et non « tout est terminé ».

## 5. Pourquoi les travaux ont dérivé

On a cherché à expliquer deux mouvements BTC, puis à augmenter les sources, puis à récupérer les liquidations en direct, puis à automatiser les collectes. Chacune de ces tâches avait un sens, mais leur accumulation a fait disparaître l'explication simple et un point d'entrée unique.

**Correction de méthode :** ne plus prendre « il manque une source » comme permission d'ajouter immédiatement un nouveau collecteur. D'abord démontrer une utilité lisible pour le créateur, puis décider si un développement supplémentaire est nécessaire.

## 6. Unique prochaine étape, après la passation

**Rendre l'observatoire EXISTANT compréhensible et accessible, sans écrire un nouveau moteur :**

- Contrôler la page publique et son rapport dans un navigateur (Firefox si possible) : peut-on lire clairement le prix, l'heure UTC, les événements réellement observés et l'avertissement de couverture ?
- Vérifier qu'elle ne prétend pas être dans le Trader, ne remplace pas les actualités de l'Interface et ne montre aucune donnée privée.
- Corriger uniquement un défaut de lecture ou d'accès prouvé, s'il existe.

**Ne pas encore** déployer de service 24 h/24, changer de plateforme, créer une autre suite d'IA, ajouter de nouveaux dossiers Top 50, modifier le Trader ni refaire le Bridge. Décider ensuite, avec le créateur, si cette surveillance mérite un hébergement permanent.

## 7. Procédure de réveil pour une autre IA / un autre fil

1. Lire **ce fichier d'abord**, puis le [rapport d'exploitation](./btc-market-operations/reports/latest.md) ; ne pas demander au créateur de raconter à nouveau des heures de travail.
2. Vérifier sur GitHub `main` la **date réelle** du dernier rapport, le statut du workflow et les lacunes. Ne pas répéter les nombres 577 / 72 comme s'ils étaient en temps réel.
3. Lire uniquement les sources nécessaires à **la prochaine étape unique** : page [dashboard](./btc-market-operations/dashboard.html), JSON [rapport](./btc-market-operations/reports/latest.json), puis scripts si anomalie prouvée.
4. Séparer : **faits vérifiés / interprétations / inconnues / action minimale**.
5. Fournir un lien public exploitable, pas seulement du HTML brut ou un ensemble de fichiers à interpréter. Ne pas imposer au créateur une recette de dizaines de vérifications manuelles.

**Règle STOP :** en cas de confusion, de boucle ou de fatigue, arrêter les outils et faire un point simple avant toute nouvelle modification.

---

**Décision de clôture de ce fil :** geler l'expansion fonctionnelle ; garder la veille partielle qui fonctionne ; transférer un état clair ; reprendre uniquement par la vérification de l'observatoire accessible à l'utilisateur.
