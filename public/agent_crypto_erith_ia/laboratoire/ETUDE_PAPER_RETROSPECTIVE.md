# ERITH.IA · Test PAPER rétrospectif sur archives horaires

**19 octobre 2026 · résultat négatif · aucune modification du Trader ni ordre réel.**

## Question

Les règles élémentaires « pression acheteuse ≥ seuil, puis vente après délai fixe »
permettent-elles d'obtenir un résultat PAPER positif **après frais hypothétiques** ?

## Sources et méthode

- **24 archives mensuelles** préexistantes, issues de data/trader_flux/radar20_retro_stress/sources (avril–juin 2026) et data/trader_flux/radar20 (juillet–septembre 2026).
- **Quatre actifs** : ETH, SOL, XRP, LTC, paires Binance Spot USDT. Sélection délibérément limitée, **non exhaustive**.
- Seuils de pression acheteuse : **50, 55, 60, 65 %** ; durée de détention : **12 ou 48 heures**.
- Frais aller-retour **hypothétiques** : 0,8 % pour la sélection ; calcul de sensibilité 1,2 % / 1,6 % dans le script.
- Utilise **uniquement le sous-échantillon de test déjà calculé dans chaque mois** (les ~10–11 derniers jours) ; ne pas confondre avec une validation prospective.
- Sélection **uniquement** à partir des archives **avril–juin**, selon le plus haut total nominal des essais *indépendants*. La règle retenue est ensuite appliquée **sans réoptimisation** aux archives juillet–septembre.
- Chaque transaction hypothétique porte sur **100 USDT nominaux** ; les sommes ne constituent **ni un portefeuille unique de 400 USDT, ni un capital cumulé, ni un rendement réinvesti**. Les expositions et les risques des variantes diffèrent.

## Résultats · scénario 0,8 %

| Règle pression / détention | Avril–juin : résultat agrégé | Juillet–septembre : résultat agrégé |
|---|---:|---:|
| ≥ 50 % / 12 h | −169,49 USDT | −100,88 USDT |
| ≥ 50 % / 48 h | −77,29 USDT | +0,59 USDT |
| ≥ 55 % / 12 h | −135,99 USDT | −77,07 USDT |
| ≥ 55 % / 48 h | −65,10 USDT | +17,65 USDT |
| ≥ 60 % / 12 h | −61,18 USDT | −33,23 USDT |
| ≥ 60 % / 48 h | −50,75 USDT | +14,86 USDT |
| ≥ 65 % / 12 h | −40,85 USDT | −31,93 USDT |
| **≥ 65 % / 48 h · sélectionnée sur avril–juin** | **−40,53 USDT · 23 essais** | **−23,29 USDT · 18 essais** |

**Verdict : AUCUNE STRATÉGIE VALIDÉE.** Le choix effectué sur avril–juin reste perdant sur juillet–septembre. Les quelques lignes gagnantes sur la seconde période ne peuvent pas être promues a posteriori.

## Limites et décision opérationnelle

1. L'évaluation est **rétrospective** ; les archives étaient déjà connues quand ce document a été rédigé. Aucun véritable hors-échantillon prospectif.
2. Les règles et seuils ont déjà été explorés dans le projet ; les huit variantes ne constituent pas un protocole préenregistré antérieur à toutes les données.
3. Les chiffres viennent des résultats mensuels pré-calculés ; le script audite leurs compteurs et agrège les sous-échantillons, mais ne reconstitue **pas** les exécutions depuis les minutes Binance brutes.
4. Les frais, le spread, le slippage, les minimums et la liquidité effectifs sur OKX ne sont **pas prouvés**.
5. Un retour nul en l'absence de transaction est une référence nominale utile, **pas** une comparaison ajustée du risque.
6. Quatre actifs choisis parmi l'univers ; pas de conclusion statistique générale ni de preuve d'une capacité à gagner de l'argent.

**Décision :** ne pas activer ces règles en ordres réels, ne pas les brancher à l'Auto PAPER du Trader comme une stratégie « gagnante ». Continuer le Radar 20 prospectif inchangé. Avant tout nouveau développement du Trader, exiger une amélioration de preuve mesurable, pas une nouvelle interface.

## Reproduire le contrôle

Depuis la racine du dépôt :

    python public/agent_crypto_erith_ia/tools/trader_paper_holdout_audit.py

Le contrôle GitHub « Trader PAPER - retrospective holdout audit » répète l'agrégation, vérifie les 24 sources, le nombre d'essais et le verdict négatif. Code et rapports **sans numéro de version dans les noms**.
